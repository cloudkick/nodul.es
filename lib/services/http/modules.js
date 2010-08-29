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
    
    db.get_package_reverse_dependencies(module.name, function(err, reverse_dependencies) {
      if (err) {
        reverse_dependencies = [];
      }
      cb(module, reverse_dependencies);
    });
  });
}

function modinfo(req, res, modname)
{
  getmodule(modname, function(module, reverse_dependencies) {
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
          if (author.email) {
            author.avatar_url = gravatar.get_gravatar_url(author.email);
          }
          else {
            author.avatar_url = undefined;
          }
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
      templates.render('module.html', {modname: module._id, files: files, reverse_dependencies: reverse_dependencies,
                                       module: module, debug_plaintext: JSON.stringify(module, null, 4)}, req, res);
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
    results.sort(function(a_, b_) {
      var a = a_.name.toLowerCase();
      var b = b_.name.toLowerCase();
       if (a < b) {
         return -1;
       }
       if (a > b) {
        return 1;
      }
      return 0;
    });
    templates.render('modules.html', {modules: results}, req, res);
  });
}

function feed(req, res)
{
  db.get_packages_result_array('date_modified', 'desc', function(err, results) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Err: '+ err);
      return;
    }
    
    results = results.slice(0, 25);
    templates.render('modules.xml', {'headers': {'Content-type': 'application/rss+xml'}, modules: results}, req, res);
  });
}

exports.urls = clutch.route([
  ['GET /feed\.atom$', feed],
  ['GET /([^/]+)$', modinfo],
  ['GET /$', modlist]
]);
