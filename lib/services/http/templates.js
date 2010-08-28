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

var sys = require('sys');
var path = require('path');
var mu = require('extern/mu');
var root = path.dirname(__filename);
var merge = require('util/misc').merge;

mu.templateRoot = path.join(root, 'templates');

var default_ctx = {};

exports.render = function (template, ctx, req, res) {
  var c = merge(default_ctx, ctx);
  mu.render(template, c, {}, function(err, output) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end(err+'\n');
      throw err;
    }
     /* TODO: other content types */
    var headers = merge({'Content-Type': 'text/html; charset=utf-8'}, c.headers ? c.headers : {});
    res.writeHead(200, headers);
    output.addListener('data', function (c) {
      res.write(c);
    })
    output.addListener('end', function () { 
      res.end();
    });
  });
};


