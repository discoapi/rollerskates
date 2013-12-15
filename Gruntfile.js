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
				dest: 'build/<%= pkg.name %>.<%= pkg.version %>.min.js'
			}
		},
		qunit: {
			files: ['tests/index.html']
		},
		watch:{
			uglify: {
				files: 'src/<%= pkg.name %>.js',
				tasks: ['uglify','discoAPICopy']
			}
		},
		discoAPICopy: {
			src: 'build/<%= pkg.name %>.<%= pkg.version %>.min.js',
			files: ['<%= pkg.name %>.<%= pkg.version %>.min.js','<%= pkg.name %>.latest.min.js'],
			dest: '../public_html/js/lib/'
		}
				
	});


	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// qunit
	grunt.loadNpmTasks('grunt-contrib-qunit');
	// watch
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

	// other tests
	grunt.registerTask('test', ['qunit']);

	// discoAPI devel
	grunt.registerTask('discoAPIDevel', ['watch']);

	grunt.registerTask('discoAPICopy', 'copy file into discoAPI public_html', function() {
		var config = grunt.config.get('discoAPICopy');

		for(var i=0;i<config.files.length;i++){
			grunt.file.copy(config.src,config.dest+config.files[i]);
		}

	});
};
