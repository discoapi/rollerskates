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
			default: {
				files: 'src/<%= pkg.name %>.js',
				tasks: ['uglify','copy']
			},
			latest: {
				files: 'src/<%= pkg.name %>.js',
				tasks: ['uglify','copy:latest']
			}
		},
		copy: {
			src: ['build/<%= pkg.name %>.<%= pkg.version %>.min.js','src/<%= pkg.name %>.js'],
			files: ['<%= pkg.name %>.<%= pkg.version %>.min.js','<%= pkg.name %>.<%= pkg.version %>.js'],
			latest:[ '<%= pkg.name %>.latest.min.js','<%= pkg.name %>.latest.js'],
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
	grunt.registerTask('develop', function(param){
		if (param == 'latest'){
			grunt.task.run(['watch:latest']);
		} else{
			grunt.task.run(['watch:default']);
		}
	});
					 
	grunt.registerTask('copy', function(param) {
		var config = grunt.config.get('copy');

		for(var i=0;i<config.files.length;i++){
			grunt.file.copy(config.src[i],config.dest+config.files[i]);
		}

		if (param === 'latest'){
			for(var i=0;i<config.files.length;i++){
				grunt.file.copy(config.src[i],config.dest+config.latest[i]);
			}
		}

	});
};
