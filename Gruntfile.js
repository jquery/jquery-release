module.exports = function( grunt ) {

grunt.loadNpmTasks( "grunt-contrib-jshint" );

grunt.initConfig({
	jshint: {
		options: {
			jshintrc: true
		},
		all: [ "release.js", "lib/*.js" ]
	}
});

grunt.registerTask( "default", [ "jshint" ] );

};
