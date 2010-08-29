var sprintf = require('extern/sprintf').sprintf;

var Db = require('extern/mongodb/lib/mongodb').Db;
var Server = require('extern/mongodb/lib/mongodb').Server;
var BSON = require('extern/mongodb/lib/mongodb').BSONPure;

var config = require('util/config');

function setup(cb) {
  client = new Db(config.get().mongodb_database, new Server(config.get().mongodb_host, config.get().mongodb_port, {auto_reconnect: true,
                                                                                                                   native_parser: false}));
  
  client.on('error', function(err) {
    return cb(err);
  });
  
  exports.client = client;
  client.open(function(err, database) {
    if (err) {
      return cb(err);
    }  
    
    exports.database = database;
    database.collection(config.get().mongodb_collection_packages, function(err, collection) {
      if (err) {
        return cb(err);
      } 
     
      exports.collection = collection;
      
      cb(null);
    });
  });
}

function format_package_data_for_storage(package_data) {
  var data = {};
  
  var categories = package_data.categories;
  var version_tags = package_data.details['dist-tags'];
  
  if (!version_tags.hasOwnProperty('latest')) {
    latest_version = version_tags.stable;
  } else {
    latest_version = version_tags.latest;
  }
  
  var details = package_data.details.versions[latest_version];
  var tarball_url = details.dist.tarball;
  
  var dependencies = details['dependencies'];
  var os = details['os'];
  var cpu = details['cpu'];
  var engines = details['engines'];
  
  data = package_data.details;
  
  delete data['_rev'];
  delete data['versions'];

  data['latest_commit'] = null;
  data['latest_version'] = latest_version;
  data['tarball_url'] = tarball_url;
  data['categories'] = categories;
  
  data['dependencies'] = dependencies;
  data['os'] = os;
  data['cpu'] = cpu;
  data['engines'] = engines;
  
  data['meta'] = {'source_files_path': null, 'tarball_path': null, 'updated': new Date()};
  
  return data;
}

function format_github_commit_data_for_storage(commit_data) {
  delete commit_data.modified;
  delete commit_data.parents;
  delete commit_data.tree;
    
  return commit_data;
}

function get_packages_result_array(sort_field, sort_direction, callback) {
  if (sort_field === 'author') {
    sort_field = 'author.name';
  }
  else if (sort_field === 'date_added') {
    sort_field = 'ctime';
  }
  else if (sort_field === 'date_modified') {
    sort_field = 'mtime';
  }
  else
  {
    sort_field = 'name';
  }
  
  if (sort_direction === 'asc') {
    direction = 1;
  }
  else {
    direction = -1;
  }
  
  exports.collection.find({}, {'sort': [[sort_field, direction]]}, function (err, cursor) {
    cursor.toArray(function(err, docs) {
      callback(err, docs);
    });
  });
};

function get_package_by_name(package_name, callback) {
  exports.collection.findOne({'name': package_name}, function (err, doc) {
    callback(err, doc);
  });
};

function get_packages_by_categories(categories, callback) {
  if (typeof(categories) === 'string') {
    categories = [categories]
  }
  
  exports.collection.find({'categories': {'$in': categories}}, function (err, cursor) {
    cursor.toArray(function(err, docs) {
      callback(err, docs);
    });
  });
}

function get_package_reverse_dependencies(package_name, callback) {
  query = new BSON.Code(sprintf("(this.dependencies != null && this.dependencies.hasOwnProperty('%s'))", package_name));
  
  exports.collection.find({'$where': query}, function (err, cursor) {
    cursor.toArray(function (err, docs) {
      callback(err, docs);
    });
  });
}

exports.setup = setup;
exports.get_package_reverse_dependencies = get_package_reverse_dependencies;
exports.get_package_by_name = get_package_by_name;
exports.get_packages_by_categories = get_packages_by_categories;
exports.get_packages_result_array = get_packages_result_array;
exports.format_github_commit_data_for_storage = format_github_commit_data_for_storage;
exports.format_package_data_for_storage = format_package_data_for_storage;
