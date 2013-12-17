module.exports = function(grunt) {
  // set up grunt
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		build: {
			startCopy: {'src/rollerskates.js': '<%= pkg.name %>.<%= pkg.version %>.js'},
			endCopy: ['<%= pkg.name %>.<%= pkg.version %>.js.map','<%= pkg.name %>.<%= pkg.version %>.min.js',
					  '<%= pkg.name %>.<%= pkg.version %>.js'],
			dest: 'build/'
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				sourceMap: '<%= pkg.name %>.<%= pkg.version %>.js.map',
				sourceMappingURL: '<%= pkg.name %>.<%= pkg.version %>.js.map'
			},
			build: {
				src: '<%= pkg.name %>.<%= pkg.version %>.js',
				dest: '<%= pkg.name %>.<%= pkg.version %>.min.js'
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
			src: ['build/<%= pkg.name %>.<%= pkg.version %>.min.js',
				  'build/<%= pkg.name %>.<%= pkg.version %>.js',
				  'build/<%= pkg.name %>.<%= pkg.version %>.js.map'],
			files: ['<%= pkg.name %>.<%= pkg.version %>.min.js',
					'<%= pkg.name %>.<%= pkg.version %>.js',
					'<%= pkg.name %>.<%= pkg.version %>.js.map'],
			latest:[ '<%= pkg.name %>.latest.min.js',
					 '<%= pkg.name %>.latest.js',
					 '<%= pkg.name %>.<%= pkg.version %>.js.map'],
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
	grunt.registerTask('default', ['build','copy']);

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

	grunt.registerTask('build', function(param) {
		var config = grunt.config.get('build');

		// copy src to root
		if (param != "end"){
			for(var target in config.startCopy ){
				grunt.file.copy(target,config.startCopy[target]);
			}

		
			// run uglify
			grunt.task.run(['uglify','build:end']);
		}

		if (param == "end"){
			
			// copy file to dist and delete them
			for(var i=0;i<config.endCopy.length;i++){
				// copy file to dist
				grunt.file.copy(config.endCopy[i],config.dest+config.endCopy[i]);
				// delete from root
				grunt.file.delete(config.endCopy[i]);
			}
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
