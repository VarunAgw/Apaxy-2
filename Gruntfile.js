module.exports = function (grunt) {
    var utils = {
        read_file: function (path, base64) {
            if (true === base64) {
                var content = grunt.file.read(path, {encoding: null});
                content = new Buffer(content).toString('base64');
            } else {
                var content = grunt.file.read(path);
            }
            return content;
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

    grunt.registerTask('start', function () {
        var resources = {};

        resources['base.htm'] = utils.read_file('source/view/base.htm');
        resources['style.css'] = utils.read_file('source/view/style.css');
        resources['style_apaxy.css'] = utils.read_file('source/view/style_apaxy.css');

        var resources_extension = utils.clone_json(resources);
        var resources_plugin = utils.clone_json(resources);

        resources_extension['style.css'] = resources_extension['style.css']
                .replace('%open-sans-v13-latin-regular.woff2%', '%baseurl%fonts/open-sans-v13-latin-regular.woff2')
                .replace('%open-sans-v13-latin-regular.woff%', '%baseurl%fonts/open-sans-v13-latin-regular.woff');

        resources_plugin['style.css'] = resources_plugin['style.css']
                .replace('%open-sans-v13-latin-regular.woff2%', 'data:font/woff2;base64,' + utils.read_file('source/fonts/open-sans-v13-latin-regular.woff2', true))
                .replace('%open-sans-v13-latin-regular.woff%', 'data:application/x-font-woff;base64,' + utils.read_file('source/fonts/open-sans-v13-latin-regular.woff', true));

        grunt.file.write('source/.tmp/30-resources_extension.js', utils.json_to_js('resources', resources_extension));
        grunt.file.write('source/.tmp/30-resources_plugin.js', utils.json_to_js('resources', resources_plugin));
    });


    grunt.initConfig({
        concat: {
            options: {
                banner: '// Apaxy 2 Server plugin\n\n'
            },
            extension: {
                src: [
                    'source/00-jquery-2.1.4.min.js',
                    'source/10-keycode.js',
                    'source/20-file_types.js',
                    'source/.tmp/30-resources_extension.js',
                    'source/40-utils.js',
                    'source/50-initialize_extension.js',
                    'source/60-main.js'
                ],
                dest: 'extension/content_script.js'
            },
            plugin: {
                src: [
                    'source/00-jquery-2.1.4.min.js',
                    'source/10-keycode.js',
                    'source/20-file_types.js',
                    'source/.tmp/30-resources_plugin.js',
                    'source/40-utils.js',
                    'source/50-initialize_plugin.js',
                    'source/60-main.js'
                ],
                dest: 'plugin/apaxy_2.js'
            }
        },
        uglify: {
            options: {
                banner: '// Apaxy 2 Server plugin: (Minified)\n\n'
            },
            plugin: {
                src: 'plugin/apaxy_2.js',
                dest: 'plugin/apaxy_2.min.js'
            }
        },
        sync: {
            main: {
                files: [
                    {cwd: 'source/icons/', src: '*', dest: 'extension/view/icons/'},
                    {cwd: 'source/fonts/', src: '*', dest: 'extension/view/fonts/'},
                    {cwd: 'source/icons', src: '*', dest: 'plugin/icons/'}
                ],
                failOnError: true,
                updateAndDelete: true,
                compareUsing: "md5"
            }
        },
        watch: {
            scripts: {
                files: ['source/**/*'],
                tasks: ['all']
            },
            options: {
                spawn: false
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('all', ['start', 'concat', 'uglify', 'sync']);
    grunt.registerTask('default', ['start', 'concat']);
};