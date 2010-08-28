var http = require('http');
var path = require('path');
var url = require('url');
var sys = require('sys');
var fs = require('fs');
exec = require('child_process').exec;

var sprintf = require('extern/sprintf').sprintf;
var ps = require('util/pubsub');
var config = require('util/config');
var log = require('util/log');
var db = require('util/db');

function SourceDownloader() {
  this.is_running = false;
  this.timeout_id = null;

  this.processing = {};
}

SourceDownloader.prototype.start = function() {
  this.is_running = true;
  this.process_pending_packages(5000);
};

SourceDownloader.prototype.stop = function() {
  this.is_running = false;

  if (this.timeout_id) {
    clearInterval(timeout_id);
  }
};

SourceDownloader.prototype.process_pending_packages = function(interval) {
  var self = this;

  if (!this.is_running) {
    return;
  }

  this.timeout_id = setInterval(function() {
    db.collection.find({'tarball_path': null, 'source_files_path': null}, function(err, cursor) {
      cursor.each(function(err, doc) {

        if (!doc || !doc.tarball_url) {
          log.debug('Missing tarball_url, skipping');
          return;
        }

        if (self.processing.hasOwnProperty(doc._id)) {
          log.debug('This package is already being processed, skipping');
          return;
        }

        log.info('Processing package ' + doc.name)
        self.processing[doc._id] = true;


        self.download_tarball(doc.tarball_url, function(error, tarball_path) {
          var folder_name = sprintf('%s-%s', doc.name, doc.latest_version);
          var extract_path = path.join(config.get().source_file_cache, folder_name);

          self.extract_tarball(tarball_path, extract_path, function(error, package_id, file_path) {
            console.log(error);
          });
        });
      });
   });
  }, interval);
};

SourceDownloader.prototype.download_tarball = function(tarball_url, callback) {
  var url_object = url.parse(tarball_url);

  var port = url_object['port'] || 80;
  var host = url_object['host'];
  var pathname = url_object['pathname'];

  var client = http.createClient(port, host)
  var request = client.request('GET', pathname, {'host': host});
  request.end();

  var filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  var cache_path = config.get().tarball_cache;
  var file_path = path.join(cache_path, filename);

  path.exists(file_path, function(exists) {
    if (exists) {
      return callback(new Error("File already exists"));
    }

    var fstream = fs.createWriteStream(file_path, {'flags': 'w', 'encoding': 'binary', 'mode': 0644});

    fstream.on('error', function(err) {
      log.err("Error on file stream: " + err.message);
      if (callback) {
        callback(error);
      }
      fstream.close();
      request.close();
    });

    request.on('response', function(response) {
      // Hack for using HTTP streams with sys.pump
      response.on('end', function() {
        response.emit('close');
      });

      sys.pump(response, file_stream, function() {
        log.info('File ' + filename + ' downloaded.');
        if (callback) {
          callback(null, file_path);
        }
      });
    });

  });
};

SourceDownloader.prototype.extract_tarball = function(tarball_path, extract_path, callback) {
  var command;

  try {
    if (!(fs.statSync(tarball_path).size) > 0) {
      callback(new Error('File does not exist'));
    }
  }
  catch (exception) {
    callback(new Error('File does not exist'));
  }

  try {
    if ((fs.statSync(extract_path).size) > 0) {
      exists = true;
    }
    else {
      exists = false;
    }
  }
  catch (exception) {
    exists = false;
  }

  if (!exists) {
    fs.mkdirSync(extract_path, 0644);
  }

  command = sprintf('%s -xzf %s -C %s', (config.get().use_gtar ? 'gtar' : 'tar'), tarball_path, extract_path);
  subprocess = exec(command, function(error, stdout, stderr) {
    if (error) {
      if (callback) {
        return callback(error);
      }

      return;
    }

    log.info(sprintf('File %s extracted to %s', tarball_path, extract_path));
    callback(null, extract_path)
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
