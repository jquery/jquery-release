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
		console.log( "Press enter to continue, or ctrl+c to cancel.".yellow );
		Release.prompt( fn );
	},

	confirmReview: function( fn ) {
		console.log( "Please review the output and generated files as a sanity check.".yellow );
		Release.confirm( fn );
	}
});

};
