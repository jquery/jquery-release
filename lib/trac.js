module.exports = function( Release ) {

Release.define({
	trac: function( path ) {
		var tracUrl = "http://bugs." + Release.project + ".com",
			result = Release.exec( "curl -s '" + tracUrl + path + "&format=tab'", { silent: true });

		if ( result.code !== 0 ) {
			Release.abort( "Error getting Trac data." );
		}

		return result.output;
	}
});

};
