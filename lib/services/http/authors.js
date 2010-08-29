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
var gravatar = require('util/gravatar');

function group_by_authors(cb, req, res) {
  db.get_packages_result_array('author', 'asc', function(err, results) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Err: '+ err);
      return;
    }

    var authors = {};

    results.forEach(function(elem) {
      if (!elem.maintainers) {
        elem.maintainers = [];
      }
      elem.maintainers.forEach(function(author) {
        if (authors[author.email] === undefined) {
          authors[author.email] = {name: author.name, email: author.email, projects: []};
        }
        authors[author.email].projects.unshift(elem);
      });
    });
    cb(authors);
  });
}

function authors_list(req, res) {
  group_by_authors(function(authors) {
    var authors_arr = [];
    for (var email in authors) {
      authors_arr.unshift(authors[email]);
    }
    
    authors_arr.sort(function(a_, b_) {
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

    templates.render('authors.html', {authors: authors_arr}, req, res);
  }, req, res);
}

function author_info(req, res, name) {
  group_by_authors(function(authors) {
    var whom = undefined;
    for (var email in authors) {
      if (authors[email].name == name) {
        whom = authors[email];
        break;
      }
    }
    if (whom === undefined) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404, unknown author: '+ name);
      return;
    }

    whom.avatar_url = gravatar.get_gravatar_url(whom.email);

    templates.render('author.html', {title: {title: 'author - ' + whom.name}, author: whom}, req, res);
  }, req, res);
}

exports.urls = clutch.route([
  ['GET /([^/]+)$', author_info],
  ['GET /$', authors_list]
]);

