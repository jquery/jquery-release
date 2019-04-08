module.exports = function( Release ) {

Release.define({
	gitLog: function( format ) {
		var commitRange = Release.prevVersion + ".." + Release.newVersion,
			gitLog = "git log --format=\"" + format + "\" " + commitRange,
			result = Release.exec({
				command: gitLog,
				silent: true
			}, "Error getting git log, command was: " + gitLog );

		result = result.split( /\r?\n/ );
		if ( result[ result.length - 1 ] === "" ) {
			result.pop();
		}

		return result;
	}
});

};
