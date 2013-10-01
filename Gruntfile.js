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

  grunt.registerTask('default', ['coffee', 'uglify']);
  grunt.registerTask('test', ['qunit']);

  grunt.event.on('qunit.spawn', function(url) {
    grunt.log.ok("Running test: " + url);
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-coffee');

};