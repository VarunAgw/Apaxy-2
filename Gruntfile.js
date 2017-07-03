module.exports = function (grunt) {

  /*
   * Utility functions
   */
  var utils = {

    read_file: function (path, base64) {
      var options = base64 ? {encoding: 'base64'} : {};
      return grunt.file.read(path, options);
    },

    write_file: function (path, content) {
      grunt.file.write(path, content);
    },

    clone_json: function (json) {
      return JSON.parse(JSON.stringify(json));
    },

    json_to_js: function (var_name, json) {
      return "var " + var_name + " = " + JSON.stringify(json, null, 2);
    }
  };

  /*
   * Process function
   */
  grunt.registerTask('init', function (task) {
    var resources = {};

    resources['base.htm'] = utils.read_file('source/view/base.htm');
    resources['style.css'] = utils.read_file('source/view/style.css');
    resources['style_apaxy.css'] = utils.read_file('source/view/style_apaxy.css');

    resources['style.css'] = resources['style.css']
            .replace('%open-sans-v14-latin-regular.eot%', '%baseurl%fonts/open-sans-v14-latin-regular.eot')
            .replace('%open-sans-v14-latin-regular.eot?#iefix%', '%baseurl%fonts/open-sans-v14-latin-regular.eot?#iefix')
            .replace('%open-sans-v14-latin-regular.woff%', '%baseurl%fonts/open-sans-v14-latin-regular.woff')
            .replace('%open-sans-v14-latin-regular.ttf%', '%baseurl%fonts/open-sans-v14-latin-regular.ttf')
            .replace('%open-sans-v14-latin-regular.svg#OpenSans%', '%baseurl%fonts/open-sans-v14-latin-regular.svg#OpenSans');

    if (undefined === task || 'extension' === task) {
      var resources_extension = utils.clone_json(resources);

      resources_extension['style.css'] = resources_extension['style.css']
              .replace('%open-sans-v14-latin-regular.woff2%', '%baseurl%fonts/open-sans-v14-latin-regular.woff2');

      grunt.file.write('source/.tmp/30-resources_extension.js', utils.json_to_js('resources', resources_extension));
    }

    if (undefined === task || 'plugin' === task) {
      var resources_plugin = utils.clone_json(resources);

      resources_plugin['style.css'] = resources_plugin['style.css']
              .replace('%open-sans-v14-latin-regular.woff2%', 'data:font/woff2;base64,' + utils.read_file('source/fonts/open-sans-v14-latin-regular.woff2', true));

      grunt.file.write('source/.tmp/30-resources_plugin.js', utils.json_to_js('resources', resources_plugin));
    }
  });


  grunt.initConfig({
    concat: {
      options: {
        banner: '// Apaxy 2 Server plugin\n\n'
      },
      extension: {
        src: [
          'source/00-jquery-3.2.1.js',
          'source/10-keycode.js',
          'source/20-file_types.js',
          'source/.tmp/30-resources_extension.js',
          'source/40-utils.js',
          'source/50-initialize_extension.js',
          'source/60-main.js'
        ],
        dest: 'builds/development/chrome_extension/content_script.js'
      },
      plugin: {
        src: [
          'source/00-jquery-3.2.1.js',
          'source/10-keycode.js',
          'source/20-file_types.js',
          'source/.tmp/30-resources_plugin.js',
          'source/40-utils.js',
          'source/50-initialize_plugin.js',
          'source/60-main.js'
        ],
        dest: 'builds/development/apache_plugin/apaxy_2.js'
      }
    },

    sync: {
      options: {
        failOnError: true,
        updateAndDelete: true,
        compareUsing: "md5",
        verbose: true,
      },
      extension: {
        files: [
          {cwd: 'source/chrome_extension/', src: '**', dest: 'builds/development/chrome_extension/'},
          {cwd: 'source/icons/', src: '**', dest: 'builds/development/chrome_extension/view/icons/'},
          {cwd: 'source/fonts/', src: '**', dest: 'builds/development/chrome_extension/view/fonts/'},
        ],
        ignoreInDest: "content_script.js",
      },
      plugin: {
        files: [
          {cwd: 'source/icons', src: '**', dest: 'builds/development/apache_plugin/icons/'},
          {cwd: 'source/fonts/', src: '**', dest: 'builds/development/apache_plugin/fonts/'}
        ],
        ignoreInDest: "apache_2.min.js",
      },
      build: {
        files: [
          {cwd: 'builds/development/chrome_extension/', src: '**', dest: 'builds/production/chrome_extension/'},
          {cwd: 'builds/development/apache_plugin/', src: '**', dest: 'builds/production/apache_plugin/'},
        ],
      }
    },

    watch: {
      default: {
        files: ['source/**'],
        tasks: 'default'
      },
      options: {
        spawn: false
      }
    },

    uglify: {
      options: {
        banner: '// Apaxy 2 Server plugin: (Minified)\n\n'
      },
      build: {
        src: 'builds/production/apache_plugin/apaxy_2.js',
        dest: 'builds/production/apache_plugin/apaxy_2.min.js'
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['init', 'concat', 'sync:extension', 'sync:plugin']);
  grunt.registerTask('extension', ['init:extension', 'concat:extension', 'sync:extension']);
  grunt.registerTask('plugin', ['init:plugin', 'concat:plugin', 'sync:plugin']);

  grunt.registerTask('build', ['default', 'sync:build', 'uglify:build']);

};