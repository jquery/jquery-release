module.exports = function( Release ) {

Release.define({
	trac: function( path ) {
		var tracUrl = Release._packageUrl( "bugs" );
		return Release.exec({
			command: "curl -s '" + tracUrl + path + "&format=tab'",
			silent: true
		}, "Error getting Trac data." );
	},

	_generateTracChangelog: function( callback ) {
		process.nextTick(function() {
			console.log( "Adding Trac tickets..." );
			var changelog = Release.trac(
				"/query?milestone=" + Release.newVersion + "&resolution=fixed" +
				"&col=id&col=component&col=summary&order=component" ) + "\n";
			callback( changelog );
		});
	},

	_gatherTracContributors: function( callback ) {
		var url = "/report/" + Release.contributorReportId +
			"?V=" + Release.tracMilestone() + "&max=-1";

		process.nextTick(function() {
			callback( Release.trac( url )
				.split( /\r?\n/ )

				// Remove header and trailing newline
				.slice( 1, -1 )
			);
		});
	}
});

};
