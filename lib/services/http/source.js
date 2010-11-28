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
var fileinfo = require('util/filerender').info;

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

function makeSourcePath(module, filename) {
	var file=filename.replace(/^(\/|\/)+/,"").split(/\/|\//);
	var fileparts=[];
	var filepart;
	while ((filepart = file.pop())) {
		fileparts.unshift({ name:filepart, url:"/"+[ "source" , module._id ].concat(file).concat([ filepart ]).join("/") });
	}
	return fileparts;
};
function sourcebrowser(req, res, modname, modpath)
{
  getmodule(modname, function(m) {
    if (!modpath) {
      modpath = "/";
    }
		fileinfo(m.meta.source_files_path+modpath,"/source/"+m._id+modpath, function() {
			var data = { module: m, path:makeSourcePath(m,modpath), info:this };
			//data.debug = JSON.stringify(data,undefined,"  ")
			templates.render('source.html', data, req, res);
		});
  });
}
exports.urls = clutch.route([
  ['GET /([^/]+)(.*)$', sourcebrowser]
]);
