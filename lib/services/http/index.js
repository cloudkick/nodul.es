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

function index(req, res) {
  if (req.headers.host && req.headers.host == "ponies-for-orphans.no.de") {
    res.writeHead(301, {'Location': 'http://nodul.es/', 'Content-Type': 'text/plain'});
    res.end('Moved to http://nodul.es/');
    return;
  }

  var news = [
    {'title': 'Welcome to Nodul.es',
     'body': 'Hi, it works.'},
    {'title': 'Old news item',
      'body': 'yeah, two items.'}
    ];

  db.get_packages_result_array('date_added', 'asc', function(err, results) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Err: '+ err);
      return;
    }
    templates.render('index.html', {news: news, newmods: results.splice(0, 5)}, req, res);
  });
}

exports.index =  index;

