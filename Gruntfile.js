module.exports = function(grunt) {

  'use strict';

  // catch these here so they don't bite us later when we try to run tasks
  var shell = require('shelljs'),
      rimraf = require('rimraf'),
      bower_cmd = require('bower/lib/util/cmd');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    coffee: {
      compile: {
        files: {
          'dist/angles.js': ['src/*.coffee']
        }
      }
    },

    clean: [ 'dist', 'bower_components' ],

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files: {
          'dist/angles.min.js': 'dist/angles.js'
        }
      }
    },

    qunit: {
      all: ['test/*.html']
    },
  });

  grunt.registerTask('default', ['coffee', 'uglify', 'install-deps']);
  grunt.registerTask('test', ['default', 'qunit']);
  grunt.registerTask('real-clean', [ 'clean', 'clean:node_modules']);

  grunt.registerTask('clean:node_modules', 'Remove locally installed node modules.', function() {
    var filepath = './node_modules';
    if(!grunt.file.exists(filepath)) {
      return false;
    }
    if(grunt.file.isPathCwd(filepath)) {
      grunt.verbose.error();
      grunt.fail.warn('Cannot delete the current working directory.');
      return false;
    }
    else if(!grunt.file.isPathInCwd(filepath)) {
      grunt.verbose.error();
      grunt.fail.warn('Cannot delete files outside the current working directory.');
      return false;
    }
    try {
      rimraf.sync(filepath);
      grunt.log.ok();
    }
    catch(e) {
      grunt.log.error();
      grunt.fail.warn('Unable to delete "' + filepath + '" file (' + e.message + ').', e);
    }
  });

  grunt.registerTask('install-deps', 'Install all JavaScript dependencies using bower, including optional libraries.', function() {
    var done = this.async();
    if(!shell.which("bower")) {
      console.log("Sorry, this script requires bower.");
      exit(1);
    }
    console.log("Running 'bower install'");
    bower_cmd('bower',['install']).then(function() {
      console.log("running 'bower install Backbone.localStorage'");
      return bower_cmd('bower', ['install', 'Backbone.localStorage']);
    }).then(function() {
      console.log("running 'bower install FileSaver'");
      return bower_cmd('bower', ['install', 'FileSaver']);
    }).then(function() {
      console.log("Finished installing dependencies");
      done();
    }).fail(function() {
      console.log("Unable to install dependencies");
      done();
    }).done();
  });

  grunt.registerTask('demo', 'Install all dependencies and provide a list of demo files', ['default', 'install-deps', 'demo:files' ]);
  grunt.registerTask('demo:files', "List available demonstration files.", function() {
    console.log("demo/index.html");
    console.log("demo/srvValidation.html");
  });

  grunt.event.on('qunit.spawn', function(url) {
    grunt.log.ok("Running test: " + url);
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-coffee');

};