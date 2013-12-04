module.exports = function(grunt) {
  // set up grunt
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		qunit: {
			files: ['tests/index.html']
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// qunit
	grunt.loadNpmTasks('grunt-contrib-qunit');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

	// other tests
	grunt.registerTask('test', ['qunit']);

};
