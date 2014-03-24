module.exports = function( Release ) {

Release.define({
	gitLog: function( format ) {
		var command = "git log " + Release.prevVersion + ".." + Release.newVersion + " " +
				"--format='" + format + "'",
			result = Release.exec({
				command: command,
				silent: true
			}, "Error getting git log, command was: " + command );

		result = result.split( /\r?\n/ );
		if ( result[ result.length - 1 ] === "" ) {
			result.pop();
		}

		return result;
	}
});

};
