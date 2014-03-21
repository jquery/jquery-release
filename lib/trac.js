module.exports = function( Release ) {

Release.define({
	_tracUrl: function() {
		var bugs = Release.readPackage().bugs;

		// Unwrap
		if ( bugs.url ) {
			bugs = bugs.url;
		}

		// Strip trailing slash
		return bugs.replace( /\/$/, "" );
	},
	trac: function( path ) {
		var tracUrl = Release._tracUrl();
		return Release.exec({
			command: "curl -s '" + tracUrl + path + "&format=tab'",
			silent: true
		}, "Error getting Trac data." );
	}
});

};
