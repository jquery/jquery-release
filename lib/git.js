module.exports = function( Release ) {

Release.define({
	git: function( command, errorMessage ) {
		var result = Release.exec( "git " + command );
		if ( result.code !== 0 ) {
			Release.abort( errorMessage );
		}

		return result.output;
	},

	gitLog: function( format ) {
		var result = Release.exec(
			"git log " + Release.prevVersion + ".." + Release.newVersion + " " +
			"--format='" + format + "'",
			{ silent: true }
		);

		if ( result.code !== 0 ) {
			Release.abort( "Error getting git log." );
		}

		result = result.output.split( /\r?\n/ );
		if ( result[ result.length - 1 ] === "" ) {
			result.pop();
		}

		return result;
	}
});

};
