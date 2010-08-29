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

function getmodule(name, cb) {
  db.get_package_by_name(name, function(err, module) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404, unknown module: '+ name);
      return;
    }
    cb(module);
  });
}

function modinfo(req, res, modname)
{
  getmodule(modname, function(m) {
    templates.render('module.html', {module: m, debug_plaintext: JSON.stringify(m, null, 4)}, req, res);
  });
}

function modlist(req, res)
{
  db.get_packages_result_array('name', 'asc', function(err, results) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Err: '+ err);
      return;
    }

    templates.render('modules.html', {modules: results}, req, res);
  });
}

exports.urls = clutch.route([
  ['GET /([^/]+)$', modinfo],
  ['GET /$', modlist]
]);