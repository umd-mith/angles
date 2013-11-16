module.exports = function(grunt) {

  'use strict';

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

  grunt.registerTask('install-deps', 'Install all JavaScript dependencies using bower, including optional libraries.', function() {
    var shell = require('shelljs');
    if(!shell.which("bower")) {
      console.log("Sorry, this script requires bower.");
      exit(1);
    }
    shell.exec('bower install');
    shell.exec('bower install Backbone.localStorage');
    shell.exec('bower install FileSaver');
  });

  grunt.registerTask('demo', 'Install all dependencies and provide a list of demo files', ['default', 'install', 'demo:files' ]);
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