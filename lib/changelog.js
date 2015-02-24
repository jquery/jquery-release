var fs = require( "fs" ),
	changelogplease = require( "changelogplease" ),
	chalk = require( "chalk" );

module.exports = function( Release ) {

Release.define({
	_generateChangelog: function( callback ) {
		Release._generateCommitChangelog(function( commitChangelog ) {
			var changelogPath = Release.dir.base + "/changelog",
				changelog = Release.changelogShell() +
					commitChangelog +
					Release._generateIssueChangelog();

			fs.writeFileSync( changelogPath, changelog );
			console.log( "Stored changelog in " + chalk.cyan( changelogPath ) + "." );
			callback();
		});
	},

	changelogShell: function() {
		return "";
	},

	tracMilestone: function() {
		return Release.newVersion;
	},

	_generateCommitChangelog: function( callback ) {
		console.log( "Adding commits..." );

		changelogplease({
			ticketUrl: Release._ticketUrl() + "{id}",
			commitUrl: Release._repositoryUrl() + "/commit/{id}",
			repo: Release.dir.repo,
			committish: Release.prevVersion + ".." + Release.newVersion
		}, function( error, log ) {
			if ( error ) {
				Release.abort( "Error generating commit changelog.", error );
			}

			callback( log );
		});
	},

	_generateIssueChangelog: function() {
		return Release.issueTracker === "trac" ?
			Release._generateTracChangelog() :
			Release._generateGithubChangelog();
	},

	_generateTracChangelog: function() {
		console.log( "Adding Trac tickets..." );
		return Release.trac( "/query?milestone=" + Release.tracMilestone() + "&resolution=fixed" +
			"&col=id&col=component&col=summary&order=component" ) + "\n";
	},

	_generateGithubChangelog: function() {
		console.log( "Adding GitHub issues..." );
		// TODO
	}
});

};
