var Db = require('extern/mongodb/lib/mongodb').Db;
var Server = require('extern/mongodb/lib/mongodb').Server;

var config = require('util/config');

function setup(cb) {
  exports.con = new Db(config.get().mongodb_database, new Server(config.get().mongodb_host, config.get().mongodb_port, {auto_reconnect: true,
                                                                                                                        native_parser: false}));
  exports.con.open(function(err, database) {
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
  
  data = package_data.details;
  delete data['_rev'];
  delete data['versions'];
  
  return data;
}

exports.setup = setup;
exports.format_package_data_for_storage = format_package_data_for_storage;
