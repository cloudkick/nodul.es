var http = require('http');
var path = require('path');
var url = require('url');
var sys = require('sys');
var fs = require('fs');
exec = require('child_process').exec;

var sprintf = require('extern/sprintf').sprintf;
var async = require('extern/async');
var ps = require('util/pubsub');
var config = require('util/config');
var log = require('util/log');
var db = require('util/db');

var PROCECSS_DELAY = 4 * 1000;
var PACKAGES_AT_ONCE = 3;

function SourceDownloader() {
  this.is_running = false;
  this.timeout_id = null;

  this.bad_packages = {};
}

SourceDownloader.prototype.start = function() {
  if (!this.is_running) {
    this.is_running = true;
    this.process_pending_packages(PROCECSS_DELAY);
  }
};

SourceDownloader.prototype.stop = function() {
  this.is_running = false;

  if (this.timeout_id) {
    clearTimeout(this.timeout_id);
    this.timeout_id = null;
  }
};

SourceDownloader.prototype.process_pending_packages = function(interval) {
  var self = this;

  db.collection.find({'tarball_path': null, 'source_files_path': null}, {'limit': PACKAGES_AT_ONCE}, function(err, cursor) {
    cursor.toArray(function(err, results) {

      // Handle tarballs in series so we don't destroy any servers
      async.forEachSeries(results, function(doc, callback) {
      
        if (!doc) {
          log.debug('Nothing to process, sleeping');
          return callback(new Error('Sleeping'));
        }
        
        if (!doc.tarball_url) {
          log.debug('Missing tarball_url, skipping');
          return callback(new Error('No tarball url'));
        }
        
        var package_id = doc._id;
        
        self.download_tarball(doc.tarball_url, function(err, tarball_path) {
          if (err) {
            if (!err.message.match(/already exists/)) {
              log.err("Error downloading tarball for " + doc.name + ": " + err.message);
              return callback();
            }
          }
          
          var folder_name = sprintf('%s-%s', doc.name, doc.latest_version);
          var extract_path = path.join(config.get().source_file_cache, folder_name);

          self.extract_tarball(tarball_path, extract_path, function(err) {
            if (err) {
              log.debug("Error extracting tarball for " + doc.name + ": " + err.message);
            }
            
            doc_new = doc;
            doc_new.tarball_path = tarball_path;
            doc_new.source_files_path = extract_path;
            
            db.collection.update({'_id': package_id}, doc_new, function(err, doc) {
              log.debug(sprintf('Updated meta data for package %s', package_id));
              return callback();
            });
            
            // TODO: Store the paths in the database?
            return callback();
          });
        });
      },

      // Schedule the next run
      function(err) {
      
        log.debug("Run completed");
        if (self.is_running && !err) {
          self.timeout_id = setTimeout(function() {
            log.debug("New run started");
            self.process_pending_packages(interval);
          }, interval);
        }
      });
    });
  });
};

SourceDownloader.prototype.download_tarball = function(tarball_url, callback) {
  var url_object = url.parse(tarball_url);

  var port = url_object.port || 80;
  var host = url_object.host;
  var pathname = url_object.pathname;

  var filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  var cache_path = config.get().tarball_cache;
  var file_path = path.join(cache_path, filename);

  path.exists(file_path, function(exists) {
    if (exists) {
      return callback(new Error("File already exists"), file_path);
    }

    var client = http.createClient(port, host);
    var request = client.request('GET', pathname, {'host': host});
    request.end();

    request.on('response', function(response) {
      var fstream = fs.createWriteStream(file_path, {'flags': 'w', 'encoding': 'binary', 'mode': 0644});
      var errstate = false;

      fstream.on('error', function(err) {
        log.err("Error on file stream: " + err.message);
        try {
          fstream.end();
        }
        catch (err0) {
          log.err("Error closing file stream: " + err0.message);
        }
        try {
          request.end();
        }
        catch (err1) {
          log.err("Error closing request: " + err1.message);
        }
        errstate = true;
        return callback(err);
      });

      // Hack for using HTTP streams with sys.pump
      response.on('end', function() {
        response.emit('close');
      });

      if (fstream.writeable) {
        sys.pump(response, fstream, function() {
          log.info('File ' + filename + ' downloaded.');
          if (!errstate) {
            return callback(null, file_path);
          }
        });
      }
      else {
        log.err("File stream not writeable, unable to store file");
      }
    });
  });
};

SourceDownloader.prototype.extract_tarball = function(tarball_path, extract_path, cb) {
    async.parallel([
      // Make sure the tarball exists (and is a file)
      function(callback) {
        fs.stat(tarball_path, function(err, stats) {
          if (err) {
            return callback(err);
          }
          else if (!stats.isFile()) {
            return callback(new Error("Path is not a file: " + tarball_path));
          }
          else {
            return callback();
          }
        });
      },

      // Make sure the directory exists (and is a directory)
      function(callback) {
        path.exists(extract_path, function(exists) {
          if (!exists) {
            return fs.mkdir(extract_path, 0755, function(err) {
              return callback(err);
            });
          }
          else {
            fs.stat(extract_path, function(err, stats) {
              if (err) {
                return callback(err);
              }
              else if (!stats.isDirectory()) {
                return callback(new Error("Path exists and is not a directory: " + extract_path));
              }
              else {
                return callback();
              }
            });
          }
        });
      }
    ],

    // Extract the tarball
    function(err) {
      if (err) {
        return cb(err);
      }

      var command = sprintf('%s -xzf %s -C %s', (config.get().use_gtar ? 'gtar' : 'tar'), tarball_path, extract_path);
      subprocess = exec(command, function(err, stdout, stderr) {
        if (err) {
          if (err.code == 2 && (err.message.match(/child returned status 1/i) || err.message.match(/unexpected eof in/i))) {
            // Probably a corrupted archive, delete it
            fs.unlink(tarball_path, function (err) {
              log.debug("Deleted possible corrupted tarball " + tarball_path);
            });
          }
          return cb(new Error("Error extracting tarball: " + stderr));
        }
        
        log.debug(sprintf("%s extracted to %s", tarball_path, extract_path));
        return cb();
      });
    });
};

exports.source_downloader = new SourceDownloader();

exports.load = function() {
  ps.on(ps.STATE_START, function() {
    exports.source_downloader.start();
  });

  ps.on(ps.STATE_STOP, function() {
     exports.source_downloader.stop();
  });
};
