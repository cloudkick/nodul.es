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

function cat_list(req, res) {
  db.get_packages_result_array('name', 'asc', function(err, results) {
    var i = 0;
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Err: '+ err);
      return;
    }
    var cats = {};
    for (i = 0; i < results.length; i++) {
      if (results[i].categories) {
        results[i].categories.forEach(function(item) {
          if (!cats[item]) {
            cats[item] = [];
          }
          cats[item].unshift(results[i]);
        });
      }
    }
    templates.render('categories.html', {categories: cats}, req, res);
  });
  var cats = [
    {name: 'web', projects: [{name: "cast"}, {name: "blah"}, {name: "foo"}]},
    {name: 'websocket', projects: [{name: "cast"}, {name: "moo"}, {name: "cow"}]},
    {name: 'databases', projects: [{name: "lovely"}, {name: "cats"}, {name: "eat"}, {name: "brains"}]},
    {name: 'nosql', projects: [{name: "mongodb"}, {name: "couch-client"}, {name: "eat"}, {name: "brains"}]}
    ];
}

exports.urls = clutch.route([
  ['GET /$', cat_list]
]);

