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
var sprintf = require('extern/sprintf').sprintf;
var category_map = require('categories').package_categories;
var sys = require('sys');

var config = require('util/config');
var db = require('util/db');

var NPM_BASE = 'http://registry.npmjs.org';
var INDEXER_WAIT_TIME = 60 * 1000;
var INDEXER_PACKAGE_DELAY = 1 * 1000;

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
 * @param {Number} ms How many milliseconds from now to kick off the run
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
    if (!root[name] || !root[name].url) {
      log.err("Skipping package, no URL: " + name);
      return callback();
    }

    db.collection.findOne({'_id': name, 'mtime': root[name].mtime}, function(err, doc) {
      if (err || !doc) {
        log.info("Package out of date: " + name);
        var categories = category_map[name] || ["Uncategorized"];
        var pkg = {basics: root[name], categories: categories};

        // Get details from NPM
        http_get(root[name].url, function(response, data) {
          if (response.statusCode !== 200) {
            // Skip this package
            log.err("Error fetching package data from NPM: " + name);
            return callback();
          }
          else {
            pkg.details = data;
            self.index_package(pkg, callback);
          }
        });
      }
      else {
        return callback();
      }
    });

  },

  // When we're done let everyone know
  function(err) {
    ps.emit('indexer.indexing.completed');
    self.schedule();
  });
};

PackageIndexer.prototype.index_package = function(pkg, cb) {
  var self = this;
  var package_data;

  function finish() {
    setTimeout(function() {
      cb();
    }, INDEXER_PACKAGE_DELAY);
  }

  try {
    package_data = db.format_package_data_for_storage(pkg);
  }
  catch (err) {
    log.err("Error formatting package for storage: " + err);
    return finish();
  }

  var query = {
    '_id': package_data._id,
    'latest_version': package_data.latest_version
  };

  db.collection.findOne(query, function(err, doc) {
    if (!doc || err) {
      // Data for this version is not yet saved, update it in the database
      db.collection.update({'_id': package_data._id}, package_data, {upsert: true}, function(err, doc) {
        if (err) {
          log.err("Error saving package data: " + err.message);
        }
        else {
          log.debug(sprintf('Saved package %s, version: %s', package_data._id, package_data.latest_version));
          ps.emit('indexer.indexed.package', pkg.basics.name);
        }
        return finish();
      });
    }
    else {
      return finish();
    }
  });
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
