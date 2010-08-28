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

var NPM_BASE = 'http://registry.npmjs.org';
var GITHUB_BASE = 'http://github.com/api/v2/json';
var INDEXER_WAIT_TIME = 10 * 60 * 1000;
var INDEXER_PACKAGE_DELAY = 5 * 1000;


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

function npm_get(path, cb) {
  http_get(NPM_BASE + path, cb);
}

function github_get(path, cb) {
  http_get(GITHUB_BASE + path, cb);
}

/**
 * Index packages.
 */
function PackageIndexer() {
  this.timeout_id = null;
}

/**
 * Schedule an indexer run. Will publish events on the app-wide pubsub as it
 * finishes indexing individual packages, and when the full run is complete.
 *
/* @param {Number} ms How many milliseconds from now to kick off the run
 */
PackageIndexer.prototype.schedule = function(ms) {
  var self = this;
  var time = (ms !== undefined) ? ms : INDEXER_WAIT_TIME;

  self.cancel();

  self.timeout_id = setTimeout(function() {
    self.run();
  }, time);
};

/**
 * Schedule a pending indexer run.
 */
PackageIndexer.prototype.cancel = function() {
  var self = this;
  if (self.timeout_id) {
    clearTimeout(self.timeout_id);
    self.timeout_id = null;
  }
};

/**
 * Do useful stuff.
 */
PackageIndexer.prototype.run = function() {
  var self = this;
  self.timeout_id = null;
  ps.emit('indexer.indexing.begin');

  npm_get('/', function(response, data) {
    self.handle_root(data);
  });
};

/**
 * Grab details about each package.
 */
PackageIndexer.prototype.handle_root = function(root) {
  var self = this;
  var names = Object.getOwnPropertyNames(root);

  // Grab details on each package in series - we're in no hurry
  async.forEachSeries(names, function(name, callback) {
    var package = {basics: root[name]};

    async.parallel([

      // Get details from NPM
      function(callback) {
        http_get(root[name].url, function(response, data) {
          if (response.statusCode !== 200) {
            log.err("Error fetching package data from NPM: " + name);
            return callback();
          }
          else {
            package.details = root[name];
            callback();
          }
        });
      },

      // Get details from Github
      function(callback) {
        var pkg = root[name];
        var repo;
        if (pkg.repository && pkg.repository.url.match(/(http|git)\:\/\/github\.com/)) {
          // Figure out the GH url
          try {
            repo = pkg.repository.url.match(/(http|git)\:\/\/github\.com\/(.+)\.git/)[2];
          }
          catch (err) {
            log.err("Error matching github URL: " + err);
            return callback();
          }

          log.debug("Github Repo: " + repo);

          // Fetch commits from GH master
          github_get('/commits/show/' + repo + '/master', function(response, commits) {
            if (response.statusCode !== 200) {
              log.debug("Unable to fetch github data for " + repo);
              callback();
            }
            else {
              package.github = {commits: commits};
              callback();
            }
          });
        }
        else {
          callback();
        }
      }
    ],

    // Process whatever we got
    function() {
      self.index_package(package, callback);
    });
  },

  // When we're done let everyone know
  function(err) {
    ps.emit('indexer.indexing.completed');
  });
};


PackageIndexer.prototype.index_package = function(package, cb) {
  var self = this;

  // Do something with the package info
  setTimeout(function() {
    log.debug("Indexed package: " + package.basics.name);
    log.debug(JSON.stringify(package));
    ps.emit('indexer.indexing.package', package.basics.name);
    cb();
  }, INDEXER_PACKAGE_DELAY);
};

exports.indexer = new PackageIndexer();

exports.load = function() {
  ps.on(ps.STATE_START, function() {
    exports.indexer.schedule(0);
  });

  ps.on(ps.STATE_STOP, function() {
    exports.indexer.cancel();
  });
};
