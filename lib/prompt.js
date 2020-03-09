"use strict";

var chalk = require( "chalk" ),
	{ prompt } = require( "enquirer" );

module.exports = function( Release ) {

Release.define( {
	prompt: function( fn ) {
		process.stdin.once( "data", function( chunk ) {
			process.stdin.pause();
			fn( chunk.toString().trim() );
		} );
		process.stdin.resume();
	},

	// prints a given message, provide back the entered string after trimming.
	// Also, returns a promise resolving to that string.
	promptFor: async function( message ) {
		var { input } = await prompt( {
			type: "input",
			name: "input",
			message
		} );
		return input;
	},

	confirm: function( fn ) {
		console.log( chalk.yellow( "Press enter to continue, or ctrl+c to cancel." ) );
		Release.prompt( fn );
	},

	confirmReview: function( fn ) {
		console.log( chalk.yellow(
			"Please review the output and generated files as a sanity check." ) );
		Release.confirm( fn );
	}
} );

};
