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
var log = require('util/log');
var ps = require('util/pubsub');
var async = require('extern/async');

var NPM_ADDR = 'registry.npmjs.org';
var GITHUB_ADDR = 'github.com';
var INDEXER_WAIT_TIME = 10 * 60 * 1000;

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

  var client = http.createClient(80, NPM_ADDR);
  var request = client.request('GET', '/', {host: NPM_ADDR});
  request.end();

  request.on('response', function(response) {
    log.info("Got response status: " + response.statusCode);

    var chunks = [];

    response.on('data', function(data) {
      chunks.push(data);
    });

    response.on('end', function() {
      var root = JSON.parse(chunks.join(''));
      self.handle_root(root);
    });
  });
};

/**
 * Grab details about each package.
 */
PackageIndexer.prototype.handle_root = function(root) {
  var names = Object.getOwnPropertyNames(root);
  // Do these in series - there's no hurry, right?
  async.forEachSeries(names, function(name, callback) {
    var path = root[name].url.split(NPM_ADDR)[1];

    log.debug("Path: " + path);

    var client = http.createClient(80, NPM_ADDR);
    var request = client.request('GET', path, {host: NPM_ADDR});
    request.end();

    request.on('response', function(response) {
      log.info("Got response status: " + response.statusCode);

      var chunks = [];

      response.on('data', function(data) {
        chunks.push(data);
      });

      response.on('end', function() {
        var details = JSON.parse(chunks.join(''));
        // TODO: Do something with the details and eventually fire the callback
        process.exit();
      });
    });
  },
  function(err) {
    ps.emit('indexer.indexing.completed');
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
