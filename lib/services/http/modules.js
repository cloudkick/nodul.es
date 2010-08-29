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
var fs = require('util/fs');
var path = require('path');
var gravatar = require('util/gravatar');

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
  getmodule(modname, function(module) {
    function dorender(err, files) {
      var i = 0;
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('500, messed up module: '+ err);
        return;
      }

      if (module.maintainers) {
        for (i = 0; i != module.maintainers.length; i++){
          var author =  module.maintainers[i];
          author.avatar_url = gravatar.get_gravatar_url(author.email);
        }
      }

      if (module.dependencies) {
        var rep = [];
        for (var k in module.dependencies) {
          if (module.dependencies.hasOwnProperty(k)) {
            rep.unshift({name: k, version: module.dependencies[k]});
          }
        }
        module.dependencies = rep;
      }
      else {
        module.dependencies = [];
      }
      templates.render('module.html', {modname: module._id, files: files, module: module, debug_plaintext: JSON.stringify(module, null, 4)}, req, res);
    }
    if (!module) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404, module not found: '+ modname);
      return;
    }
    if (module.meta && module.meta.source_files_path) {
      fs.get_path_file_list_array(module.meta.source_files_path, null, dorender);
    }
    else {
      dorender(undefined, undefined);
    }
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
