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

/*
 * Source View File-Rendering Utilities
 */

var fs = require("fs");
var markdown = require("extern/markdown");

var escapeEntities = function(text) {
	return String(text).replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;').replace(/\"/g,'&quot;');
};

var renderers = {};
renderers['text'] = function(cb) {
	var self = this;
	fs.readFile(self.filename,"utf-8",function(err, data){
		if (err || !data) return cb.call(self);
		self.text = { content:data };
		return cb.call(self);
	});
};
renderers['html'] = function(cb) {
	var self = this;
	fs.readFile(self.filename, function(err, data){
		if (err || !data) return cb.call(self);
		self.markup = { content:"data:text/html;base64,"+data.toString("base64") };
		return cb.call(self);
	});
};
renderers['markdown'] = function(cb) {
	var self = this;
	fs.readFile(self.filename, "utf-8", function(err, data){
		if (err || !data) return cb.call(self);
		data = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" ><head><title>Nodul.es: Node.js Modules!</title><link rel="stylesheet" type="text/css" media="screen" href="/media/markdown.css" /></head><body>'+data+'</body></html>\n';
		data = new Buffer(markdown.encode(data));
		self.markup = { content:"data:text/html;base64,"+data.toString("base64") };
		return cb.call(self);
	});
};
renderers['code'] = function(cb) {
	var self = this;
	fs.readFile(self.filename,"utf-8",function(err, data){
		if (err || !data) return cb.call(self);
		self.code = { content:data };
		return cb.call(self);
	});
};
renderers['json'] = function(cb) {
	var self=this;
	fs.readFile(self.filename, "utf-8", function(err, data) {
		if (err || !data) return cb.call(self);
		try {
			data = JSON.stringify(JSON.parse(data), undefined, "  ");
		} catch(ex) {
			// Ignore Parse Error and just go on
		}
		self.code = { content:data };
		return cb.call(self);
	});
};
renderers['image'] = function(cb) {
	var self = this;
	fs.readFile(this.filename,function(err, data) {
		self.image = { content:'data:'+self.mimetype+';base64,'+data.toString('base64') };
		cb.call(self);
	});
};
renderers['dir'] = function(cb) {
	var self=this;
	fs.readdir(self.filename, function(err, files) {
		if (err || !files) return cb.call(self);
		self.files = [];
		for (var idx=0; files && idx < files.length; idx++) {
			if (!files[idx].match(/^\./)) {
				self.files.push({  name:files[idx], url:self.viewURI+"/"+files[idx], path:self.filename+"/"+files[idx] });
			}
		}
		return cb.call(self);
	});
};

var extens = {
	'txt':{ renderer:renderers['text'], mimetype:"text/plain" },
	'text':{ renderer:renderers['text'], mimetype:"text/plain" },
	'html':{ renderer:renderers['html'], mimetype:"text/html" },
	'htm':{ renderer:renderers['html'], mimetype:"text/html" },
	'css':{ renderer:renderers['code'], mimetype:"text/css" },
	'js':{ renderer:renderers['code'], mimetype:"text/javascript" },
	'json':{ renderer:renderers['json'], mimetype:"application/json" },
	'png':{ renderer:renderers['image'], mimetype:"image/png" },
	'gif':{ renderer:renderers['image'], mimetype:"image/gif" },
	'jpg':{ renderer:renderers['image'], mimetype:"image/jpeg" },
	'jpeg':{ renderer:renderers['image'], mimetype:"image/jpeg" },
	'c':{ renderer:renderers['code'], mimetype:"text/plain" },
	'cc':{ renderer:renderers['code'], mimetype:"text/plain" },
	'cpp':{ renderer:renderers['code'], mimetype:"text/plain" },
	'h':{ renderer:renderers['code'], mimetype:"text/plain" },
	'hpp':{ renderer:renderers['code'], mimetype:"text/plain" },
	'py':{ renderer:renderers['code'], mimetype:"text/plain" },
	'md':{ renderer:renderers['markdown'], mimetype:"text/plain" },
	'markdown':{ renderer:renderers['markdown'], mimetype:"text/plain" }
};
var defrender = { renderer:renderers['text'], mimetype:"text/unknown" };

exports.info = function(filename, fileviewuri, callback) {
	fs.stat(filename, function(err, stats) {
		if (err || !stats) return callback.call(filename);
		var ext;
		stats.filename = filename;
		if (stats.isFile()) {
			if ((ext = /\.(\w+)$/.exec(filename))) {
				stats.render = extens[ext[1]];
				stats.extension = ext[1];
			} else {
				stats.extension='';
			}
			stats.viewURI = fileviewuri;
			stats.render = stats.render || defrender;
			stats.mimetype = stats.render.mimetype;
			stats.render = stats.render.renderer;
			stats.render(callback);
			return undefined;
		} else if (stats.isDirectory()) {
			stats.viewURI = fileviewuri;
			stats.render = { renderer:renderers['dir'], mimetype:"applicaton/directory" };
			stats.mimetype = stats.render.mimetype;
			stats.render = stats.render.renderer;
			stats.render(callback);
			return undefined;
		} else {
			return callback.call(filename);
		}
	});
};
 