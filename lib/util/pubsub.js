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

var log = require('./log');
var sys = require('sys');
var events = require('events').EventEmitter;
var emitter = null;

function PubSubEmitter(){
  events.call(this);
}
sys.inherits(PubSubEmitter, events);
emitter = new PubSubEmitter();

exports.CONFIG_DONE = "nodules.config.done";
exports.DATABASE_DONE = "nodules.database.done";
exports.STATE_START ='nodules.state.start';
exports.STATE_STOP ='nodules.state.stop';
exports.STATE_EXIT ='nodules.state.exit';

(function(){

  var seen = {};

  function emitf(path, data)
  {
    if (path === undefined) {
      throw "pubsub: path must be defined, did you forget to add a new event type?";
    }
    emitter.emit(path, data);
    seen[path] = true;
  }

  function onf(path, cb, once)
  {
    if (path === undefined) {
      throw "pubsub: path must be defined, did you forget to add a new event type?";
    }

    if (once === undefined) {
      once = false;
    }

    function incb() {
      cb.apply(undefined, arguments);
      if (once === true) {
        emitter.removeListener(path, incb);
      }
    }
    emitter.addListener(path, incb);
  }

  function oncef(path, cb)
  {
    return onf(path, cb, true);
  }

  function ensure(path, cb)
  {
    if (seen[path] === true) {
      cb();
    }
    else {
      exports.once(path, function(){
        cb();
      });
    }
  }

  exports.emit = emitf;
  exports.on = onf;
  exports.once = oncef;
  exports.ensure = ensure;
})();

