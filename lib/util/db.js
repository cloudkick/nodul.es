var Db = require('extern/mongodb/lib/mongodb').Db;
var Server = require('extern/mongodb/lib/mongodb').Server;

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
  
  var latest_version = package_data.details['dist-tags'].latest;
  var tarball_url = package_data.details.versions[latest_version].dist.tarball;
  
  data = package_data.details;
  delete data['_rev'];
  delete data['versions'];

  data['latest_version'] = latest_version;
  data['tarball_url'] = tarball_url;
  data['meta'] = {'source_files_path': null, 'tarball_path': null, 'updated': new Date()};
  
  return data;
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
}

exports.setup = setup;
exports.get_packages_result_array = get_packages_result_array;
exports.format_package_data_for_storage = format_package_data_for_storage;
