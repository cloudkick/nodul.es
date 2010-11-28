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

var fs = require('fs');
var sys = require('sys');
var path = require('path');

var clutch = require('extern/clutch');
var sprintf = require('extern/sprintf').sprintf;
var templates =  require('./templates');
var db = require('util/db');
var fsutil = require('util/fs');
var gravatar = require('util/gravatar');

function getmodule(res, name, cb) {
  db.get_package_by_name(name, function(err, module) {
    if (err || typeof(module) === 'undefined') {
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

function get_tarball(req, res, module_name, tarball_name)
{
  db.get_package_by_name(module_name, function(err, module) {
    var tarball_path;

    if (err || typeof(module) === 'undefined') {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404, unknown module: '+ module_name);
      return;
    }

    tarball_path = module.meta.tarball_path;

    if (tarball_path.indexOf(tarball_name) == -1) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404, invalid tarball name: '+ tarball_name);
      return;
    }

    fs.stat(tarball_path, function(err, stats) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('500, ' + err);
        return;
      }

      var fstream = fs.createReadStream(tarball_path, {'bufferSize': (1024 * 64)});
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size
      });

      sys.pump(fstream, res, function (err) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('500, ' + err);
          return;
        }

        res.end();
      });
    });
  });
}

function modinfo(req, res, modname)
{
  getmodule(res, modname, function(module, reverse_dependencies) {
    function dorender(err, files) {
      var i = 0, tarball_path, tarball_name;

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

      if (module.latest_commit === null) {
        module.latest_commit = undefined;
      }

      tarball_path = module.meta.tarball_path;

      if (tarball_path) {
        tarball_name = tarball_path.substr(tarball_path.lastIndexOf('/') + 1);
        module.tarball = {'name': tarball_name, 'url': sprintf('/modules/%s/download/%s', module.name, tarball_name)};
      }
      else {
        module.tarball = null;
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
      fs.get_path_file_list_array(module.meta.source_files_path, true, dorender);
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
  ['GET /([^/]+)/download/([^/]+)$', get_tarball],
  ['GET /([^/]+)$', modinfo],
  ['GET /$', modlist]
]);
