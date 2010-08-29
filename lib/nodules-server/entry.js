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

var sys = require("sys");
var log = require('util/log');
var version = require('util/version');
var ps = require('util/pubsub');
var config = require('util/config');
var getopt = require('util/getopt');
var db = require('util/db');

var services = ['http', 'indexer', 'source_downloader']

exports.run = function() {
  var called_stop = false;

  var p = getopt.parser();
  p.banner = "Usage: nodules-server [options]";
  p.parse(process.argv);

  ps.once(ps.STATE_STOP, function() {
    called_stop = true;
  });

  ps.once(ps.STATE_EXIT, function(why) {
    if (called_stop === false) {
      ps.emit(ps.STATE_STOP);
      called_stop = true;
    }
    log.info("Exiting: "+ why.why +" err:" + why.value);
  });

  ps.once(ps.CONFIG_DONE, function() {
    process.addListener('SIGINT', function () {
      log.debug("Caught SIGINT, exiting....");
      ps.emit(ps.STATE_EXIT, {'why': 'signal', 'value': "SIGINT"});
      process.exit();
    });
    
    db.setup(function(err) {
      if (err) {
          ps.emit(ps.STATE_EXIT, {'why': 'database', 'value': err});
        }
        else {
          ps.emit(ps.DATABASE_DONE);
        }
    });
  });
  
  ps.once(ps.DATABASE_DONE, function()
  {
    services.forEach(function(service) {
      require('services/' + service).load();
    });
    
    ps.emit(ps.STATE_START);
  });
  
  config.setup(function(err) {
    if (err) {
      ps.emit(ps.STATE_EXIT, {'why': 'config', 'value': err});
    }
    else {
      ps.emit(ps.CONFIG_DONE);
    }
  });
};
