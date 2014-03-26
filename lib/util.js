var shell = require( "shelljs" );

require( "colors" );

module.exports = function( Release ) {

Release.define({
	exec: function( _options, errorMessage ) {
		var result,
			command = _options.command || _options,
			options = {};

		if ( _options.silent ) {
			options.silent = true;
		}

		errorMessage = errorMessage || "Error executing command: " + command;

		result = shell.exec( command, options );
		if ( result.code !== 0 ) {
			Release.abort( errorMessage );
		}

		return result.output;
	},

	chdir: function( directory ) {
		console.log( "Changing working directory to " + directory.cyan + "." );
		process.chdir( directory );
	},

	abort: function( msg, error ) {
		if ( !error ) {
			error = new Error( msg );
			Error.captureStackTrace( error, Release.abort );
		}

		console.log( msg.red );
		console.log( "Aborting.".red );
		console.log();
		console.log( error.stack );

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
