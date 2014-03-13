module.exports = function( Release ) {

Release.define({
	gitLog: function( format ) {
		var result = Release.exec({
			command: "git log " + Release.prevVersion + ".." + Release.newVersion + " " +
				"--format='" + format + "'",
			silent: true
		}, "Error getting git log." );

		result = result.split( /\r?\n/ );
		if ( result[ result.length - 1 ] === "" ) {
			result.pop();
		}

		return result;
	}
});

};
