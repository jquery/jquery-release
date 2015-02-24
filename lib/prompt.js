var chalk = require( "chalk" );

module.exports = function( Release ) {

Release.define({
	prompt: function( fn ) {
		process.stdin.once( "data", function( chunk ) {
			process.stdin.pause();
			fn( chunk.toString().trim() );
		});
		process.stdin.resume();
	},

	confirm: function( fn ) {
		console.log( chalk.yellow( "Press enter to continue, or ctrl+c to cancel." ) );
		Release.prompt( fn );
	},

	confirmReview: function( fn ) {
		console.log( chalk.yellow( "Please review the output and generated files as a sanity check." ) );
		Release.confirm( fn );
	}
});

};
