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

var clutch = require('extern/clutch');
var path = require('path');
var root = path.dirname(__filename);
var media_root = path.join(root, 'media');
var paperboy = require('extern/paperboy');
var ulog = require('util/log');

function log(statCode, url, ip,err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip
  if (err)
    logStr += ' - ' + err;
  ulog.info(logStr);
}

/* TODO: fuck why i am writing a static file server */
function filehandler(req, res, rpath) {
  if (rpath.indexOf("..") > -1){
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('come on, this is node knockout, no time for your shit');
    return;
  }

  var ip = req.connection.remoteAddress;

  /* hack to make paperboy work with a prefix we are given by clutch */
  req.url = "/" + rpath;
  paperboy.deliver(media_root, req, res)
    .after(function(statCode) {
        log(statCode, "/media"+ req.url, ip);
      })
    .error(function(statCode, msg) {
        res.writeHead(statCode, {'Content-Type': 'text/plain'});
        res.write("Error: " + statCode);
        res.end();
        log(statCode, "/media"+ req.url, ip, msg);
      })
    .otherwise(function(err) {
      var statCode = 404;
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      res.end('404ed.')
      log(statCode, "/media"+ req.url, ip, err);
    });

}

exports.urls = clutch.route([
  ['GET /(.+)$', filehandler],
]);

