var fs = require( "fs" );

module.exports = function( Release ) {

Release.define({
	_generateChangelog: function() {
		var changelogPath = Release.dir.base + "/changelog",
			changelog = Release.changelogShell() +
				Release._generateCommitChangelog() +
				Release._generateIssueChangelog();

		fs.writeFileSync( changelogPath, changelog );
		console.log( "Stored changelog in " + changelogPath.cyan + "." );
	},

	changelogShell: function() {
		return "";
	},

	_generateCommitChangelog: function() {
		var commits,
			commitRef = "[%h](http://github.com/jquery/" + Release.project + "/commit/%H)",
			fullFormat = "* %s (TICKETREF, " + commitRef + ")",
			ticketUrl = Release.issueTracker === "trac" ?
				"http://bugs." + Release.project + ".com/ticket/" :
				"https://github.com/jquery/" + Release.project + "/issue/";

		console.log( "Adding commits..." );
		commits = Release.gitLog( fullFormat );

		console.log( "Adding links to tickets..." );
		return commits

			// Add ticket references
			.map(function( commit ) {
				var tickets = [];

				commit.replace( /Fix(?:e[sd])? #(\d+)/g, function( match, ticket ) {
					tickets.push( ticket );
				});

				return tickets.length ?
					commit.replace( "TICKETREF", tickets.map(function( ticket ) {
						return "[#" + ticket + "](" + ticketUrl + ticket + ")";
					}).join( ", " ) ) :

					// Leave TICKETREF token in place so it's easy to find commits without tickets
					commit;
			})

			// Sort commits so that they're grouped by component
			.sort()
			.join( "\n" ) + "\n";
	},

	_generateIssueChangelog: function() {
		return Release.issueTracker === "trac" ?
			Release._generateTracChangelog() :
			Release._generateGithubChangelog();
	},

	_generateTracChangelog: function() {
		console.log( "Adding Trac tickets..." );
		return Release.trac( "/query?milestone=" + Release.newVersion + "&resolution=fixed" +
			"&col=id&col=component&col=summary&order=component" ) + "\n";
	},

	_generateGithubChangelog: function() {
		console.log( "Adding GitHub issues..." );
		// TODO
	}
});

};
