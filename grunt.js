module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-jasmine-node');

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        lint: {
            files: ['index.js']
        },
        watch: {
            files: 'index.coffee',
            tasks: ['coffee', 'lint']
        },
        coffee: {
            compile: {
                options: {
                    bare: true
                },
                files: {
                    'index.js': 'index.coffee'
                }
            }
        },
        jasmine_node: {},
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true
            },
            globals: {
                exports: true
            }
        }
    });

    // Default task.
    grunt.registerTask('test', 'jasmine_node');
    grunt.registerTask('default', 'coffee lint test');

};
