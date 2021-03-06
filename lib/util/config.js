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

/**
 * Configuration subsytem, providing a set of defaults, and merging of a configuration 
 * JSON file.
 */

var fs = require('fs');
var merge = require('util/misc').merge;
var defaults = {
  'port': 80,
  'mongodb_host': 'localhost',
  'mongodb_port': 27017,
  'mongodb_database': 'nodules',
  'mongodb_collection_packages': 'packages',
  'use_gtar': true,
  'tarball_cache': '/home/node/tarball_cache/',
  'source_file_cache': '/home/node/source_file_cache/'
};
var poffset = 0;

exports.config_files = ["/home/node/nodules.conf", "/etc/nodules.conf"];
exports.config_current = {};

exports.setup = function(cb) {
  exports.config_current = merge(exports.config_current, defaults);
  function dostep() {
    var p = exports.config_files[poffset];
    fs.readFile(p, function(err, data) {
      if (!err) {
        var parsed = {};
        try {
          parsed = JSON.parse(data.toString());
        } catch(eerr) {
          cb(eerr);
        }
        exports.config_current = merge(exports.config_current, parsed);
      }

      poffset++;
      if (exports.config_files.length == poffset) {
        cb(null);
      }
      else {
        dostep();
      }
    });
  }
  dostep();
};

exports.get = function() {
  return exports.config_current;
};
