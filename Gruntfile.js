/*global module:false*/

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    uglify: {
      'uglify-source': {
        files: {
          'dist/metagame.min.js': ['src/metagame.js']
        }
      }
    }
  });

  grunt.registerTask('default', ['uglify:uglify-source']);
};