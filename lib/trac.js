module.exports = function( Release ) {

Release.define({
	trac: function( path ) {
		var tracUrl = Release._packageUrl( "bugs" );
		return Release.exec({
			command: "curl -s '" + tracUrl + path + "&format=tab'",
			silent: true
		}, "Error getting Trac data." );
	}
});

};
