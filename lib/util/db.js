var Db = require('extern/mongodb/lib/mongodb').Db;
var Server = require('extern/mongodb/lib/mongodb').Server;

var config = require('util/config');

var db = new Db('nodules', new Server(config.get().mongodb_host, config.get().mongodb_port, {}));

exports.db = db;
