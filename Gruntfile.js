module.exports = function(grunt) {

  'use strict';

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      src: 'src/**/*.js',
      dest: 'dist/',
      specs: 'spec/**/*Spec.js',
      banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("m/d/yyyy") %>\n' +
        '* <%= pkg.homepage %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
        '* Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    },

    concat: {
      dist: {
        src: ['<%= meta.src %>'],
        dest: '<%= meta.dest %>/<%= pkg.name %>.js'
      }
    },

    qunit: {
      all: ['test/**/*.html']
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    },

    jshint: {
      files: [
        '<%= meta.src %>'
      ],
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        gloabals: {
          jQuery: true,
          ace: true,
          jasmine: true,
          _: true
        }
      }
    },

    watch: {
      scripts: {
        files: '<%= meta.src %>',
        tasks: ['jshint', 'concat', 'uglify'],
        options: {
          interrupt: true
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('test', ['connect', 'qunit']);

  grunt.event.on('qunit.spawn', function(url) {
    grunt.log.ok("Running test: " + url);
  });
};
