var shell = require( "shelljs" );

require( "colors" );

module.exports = function( Release ) {

Release.define({
	exec: shell.exec,

	abort: function( msg ) {
		console.log( msg.red );
		console.log( "Aborting.".red );
		process.exit( 1 );
	},

	_section: function( name ) {
		return function() {
			console.log();
			console.log( "##" );
			console.log( "## " + name.toUpperCase().magenta );
			console.log( "##" );
			console.log();
		};
	},

	_walk: function( methods, fn ) {
		var method = methods.shift();

		function next() {
			if ( !methods.length ) {
				return fn();
			}

			Release._walk( methods, fn );
		}

		if ( !method.length ) {
			method();
			next();
		} else {
			method( next );
		}
	}
});

};
