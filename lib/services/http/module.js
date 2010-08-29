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
var templates =  require('./templates');
var db = require('util/db');

var example_module = { _id: 'compress',
  name: 'compress',
  description: 'A streaming compression for node.js',
  'dist-tags': { stable: '0.1.6', latest: '0.1.8' },
  maintainers: [ {} ],
  mtime: '2010-08-25T03:05:39Z',
  ctime: '2010-06-20T02:05:18Z',
  author: { name: 'Ivan Egorov' },
  repository: 
     { type: 'git',
     url: 'http://github.com/egorich239/node-compress.git'
     },
  latest_version: '0.1.8',
  tarball_url: 'http://registry.npmjs.org/compress/-/compress-0.1.8.tgz',
  meta: {source_files_path: null,
       tarball_path: null,
       updated: "Sun, 29 Aug 2010 00:22:28 GMT"
     }
};

function getmodule(name) {
  /* TODO: read from database */
  if (name == "compress") {
    return example_module;
  }
  else {
    return undefined;
  }
}

function modinfo(req, res, modname) {
  var m = getmodule(modname);

  if (m === undefined) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404, unknown module: '+ modname);
    return;
  }

  templates.render('module.html', {module: m}, req, res);
}

exports.urls = clutch.route([
  ['GET /([^/]+)$', modinfo]
]);

