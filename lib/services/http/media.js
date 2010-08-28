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

function filehandler(req, res, rpath) {
  if (rpath.indexOf("..") > -1){
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('come on, this is node knockout, no time for your shit');
    return;
  }
  console.log(rpath);
  /* TODO: fuck why i am writing a static file server */
  res.writeHead(204);
  res.end();
}

exports.urls = clutch.route([
  ['GET /(.+)$', filehandler],
]);

