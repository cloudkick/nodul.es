/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var http = require('http');
var url = require('url');
var log = require('util/log');
var ps = require('util/pubsub');
var async = require('extern/async');
var version = require('util/version');
var db = require('util/db');

var GITHUB_BASE = 'http://github.com/api/v2/json';
var GITHUB_WAIT_TIME = 2 * 1000;
var GITHUB_PACKAGE_DELAY = 10 * 1000;

/**
 * A -really- primitive HTTP GETter
 */
function http_get(uri, cb) {
  var parsed = url.parse(uri);
  var port = parsed.port || 80;
  var host = parsed.host;
  var path = parsed.pathname;

  var client = http.createClient(port, host);
  var request = client.request('GET', path, {host: host, 'User-Agent': version.toString()});
  request.end();

  request.on('response', function(response) {
    log.info(uri + " returned " + response.statusCode);
    var chunks = [];
    response.on('data', function(data) {
      chunks.push(data);
    });
    response.on('end', function() {
      var data = JSON.parse(chunks.join(''));
      return cb(response, data);
    });
  });
}

function github_get(path, cb) {
  http_get(GITHUB_BASE + path, cb);
}

/**
 * Index packages.
 */
function GithubUpdater() {
  this.timeout_id = null;
}

/**
 * Schedule an indexer run. Will publish events on the app-wide pubsub as it
 * finishes indexing individual packages, and when the full run is complete.
 *
 * @param {Number} ms How many milliseconds from now to kick off the run
 */
GithubUpdater.prototype.schedule = function(ms) {
  var self = this;
  var time = (ms !== undefined) ? ms : GITHUB_WAIT_TIME;

  self.cancel();

  self.timeout_id = setTimeout(function() {
    self.run();
  }, time);
};

/**
 * Schedule a pending indexer run.
 */
GithubUpdater.prototype.cancel = function() {
  var self = this;
  if (self.timeout_id) {
    clearTimeout(self.timeout_id);
    self.timeout_id = null;
  }
};

/**
 * Do useful stuff.
 */
GithubUpdater.prototype.run = function() {
  var self = this;
  self.timeout_id = null;

  db.collection.find({'repository.url': {'$ne': null}}, {'repository.url': 1}, function(err, cursor) {
    cursor.toArray(function(err, modules) {
      async.forEachSeries(modules, function(module, callback) {

        if (!module.hasOwnProperty('repository') || !module.repository.hasOwnProperty('url')) {
          return callback();
        }

        self.update_commit(module, callback);
      },
      function(err) {
        self.schedule();
      });
    });
  });
};

/**
 * Update any missing commit data.
 */
GithubUpdater.prototype.update_commit = function(module, cb) {
  var self = this;
  var repo;

  function pause_finish() {
    setTimeout(function() {
      cb();
    }, GITHUB_PACKAGE_DELAY);
  }

  if (module.repository.url.match(/^(http|git)\:\/\/github\.com/)) {
    // Figure out the GH url
    try {
      repo = module.repository.url.match(/^(http|git)\:\/\/github\.com\/(.+)\.git$/)[2];
    }
    catch (err) {
      try {
        repo = module.repository.url.match(/^(http|git)\:\/\/github\.com\/(.+)$/)[2];
      }
      catch (err) {
        log.err("Error matching github URL: " + module.repository.url);
        // Continue immediately since we haven't done a request
        return cb();
      }
    }

    // Fetch commits from GH master
    github_get('/commits/show/' + repo + '/master', function(response, data) {
      if (response.statusCode !== 200) {
        log.err("Unable to fetch commit data for " + repo);
        return pause_finish();
      }
      var commit = data.commit;
      db.collection.findOne({'_id': module['_id'], 'latest_commit.id': commit.id}, function(err, doc) {
        if (err || !doc) {
          commit = db.format_github_commit_data_for_storage(commit);
          db.collection.update({'_id': module['_id']}, {'$set': {latest_commit: commit}}, function(err, doc) {
            log.info("New git commit for " + module['_id']);
            return pause_finish();
          });
        }
        else {
          return pause_finish();
        }
      });
    });
  }
  else {
    // Continue immediately since we haven't done a request
    return cb();
  }
};

exports.updater = new GithubUpdater();

exports.load = function() {
  ps.on(ps.STATE_START, function() {
    exports.updater.schedule(0);
  });

  ps.on(ps.STATE_STOP, function() {
    exports.updater.cancel();
  });
};
