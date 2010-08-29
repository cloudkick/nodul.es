var path = require('path');
var fs = require('fs');
var async = require('extern/async');

function get_path_file_list_array(files_path, skip_hidden, callback) {
  var folder_content = [];
  var file_path;
  var finish = callback;
  
  get_files(files_path, callback);
  function get_files(files_path, callback) {
    fs.readdir(files_path, function(err, files) {
      if (err) {
        return callback(err);
      }
      
      async.filter(files, function(file, callback) {
        if (skip_hidden) {
         if (file.charAt(0) == '.' || file.charAt(0) == '_') {
            return callback(false);
          }
            return callback(true);
        }
        
        return callback(true);
      },
      
      function (results) {      
        async.forEachSeries(files, function(file, callback) { 
          var file_path = path.join(files_path, file);
          
          fs.stat(file_path, function(err, stats) {
            if (err) {
              return callback();
            }

            if (stats.isDirectory()) {
              folder_content.push({'name': file, 'type': 'd'});
            }
            else {
              folder_content.push({'name': file, 'type': 'f'});
            }
            
            return callback();
          });
        },
        
        function(err) {
          if (err) {
            return finish(err);
          }
          
          finish(null, folder_content);
        });
      });
    });
  };
};

exports.get_path_file_list_array = get_path_file_list_array;
