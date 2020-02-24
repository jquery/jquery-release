"use strict";

var shell = require( "shelljs" ),
	chalk = require( "chalk" );

module.exports = function( Release ) {

Release.define( {
	rawExec: function( command, options ) {
		return shell.exec( command, options );
	},

	exec: function( _options, errorMessage ) {
		var result,
			command = _options.command || _options,
			options = {};

		if ( _options.silent ) {
			options.silent = true;
		}

		errorMessage = errorMessage || "Error executing command: " + command;

		result = Release.rawExec( command, options );
		if ( result.code !== 0 ) {
			Release.abort( errorMessage );
		}

		return result.output;
	},

	chdir: function( directory ) {
		console.log( "Changing working directory to " + chalk.cyan( directory ) + "." );
		process.chdir( directory );
	},

	abort: function( msg, error ) {
		if ( !error ) {
			error = new Error( msg );
			Error.captureStackTrace( error, Release.abort );
		}

		console.log( chalk.red( msg ) );
		console.log( chalk.red( "Aborting." ) );
		console.log();
		console.log( error.stack );

		process.exit( 1 );
	},

	_section: function( name ) {
		return function() {
			console.log();
			console.log( "##" );
			console.log( "## " + chalk.magenta( name.toUpperCase() ) );
			console.log( "##" );
			console.log();
		};
	},

	walk: async function( methods, fn ) {
		var method = methods.shift();

		function next() {
			if ( !methods.length ) {
				return fn();
			}

			Release.walk( methods, fn );
		}

		if ( !method.length ) {
			await method();
			next();
		} else {
			await method( next );
		}
	}
} );

};
