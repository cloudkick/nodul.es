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
          if (cats[item] === undefined) {
            cats[item] = {name: item, projects: []};
          }
          cats[item].projects.unshift(results[i]);
        });
      }
    }

    var cats_arr = [];
    for (var cat in cats) {
      cats[cat].projects.sort(function(a_, b_) {
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
      cats_arr.unshift(cats[cat]);
    }
    cats_arr.sort(function(a_, b_) {
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
    templates.render('categories.html', {categories: cats_arr}, req, res);
  });
}

exports.urls = clutch.route([
  ['GET /$', cat_list]
]);

