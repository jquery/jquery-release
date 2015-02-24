var fs = require( "fs" ),
	chalk = require( "chalk" );

module.exports = function( Release ) {

function unique( arr ) {
	var obj = {};
	arr.forEach(function( item ) {
		obj[ item ] = 1;
	});
	return Object.keys( obj );
}

Release.define({
	_gatherContributors: function() {
		var contributors,
			contributorsPath = Release.dir.base + "/contributors.txt";

		console.log( "Adding committers and authors..." );
		Release.chdir( Release.dir.repo );
		contributors = Release.gitLog( "%aN%n%cN" );

		console.log( "Adding reporters and commenters from issues..." );
		contributors = contributors.concat( Release._gatherIssueContributors() );

		console.log( "Sorting contributors..." );
		contributors = unique( contributors ).sort(function( a, b ) {
			return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
		});

		console.log( "Adding people thanked in commits..." );
		contributors = contributors.concat(
			Release.gitLog( "%b%n%s" ).filter(function( line ) {
				return (/thank/i).test( line );
			}));

		fs.writeFileSync( contributorsPath, contributors.join( "\n" ) );
		console.log( "Stored contributors in " + chalk.cyan( contributorsPath ) + "." );
	},

	_gatherIssueContributors: function() {
		return Release.issueTracker === "trac" ?
			Release._gatherTracContributors() :
			Release._gatherGithubIssueContributors();
	},

	_gatherTracContributors: function() {
		var url = "/report/" + Release.contributorReportId +
			"?V=" + Release.tracMilestone() + "&max=-1";

		return Release.trac( url )
			.split( /\r?\n/ )

			// Remove header and trailing newline
			.slice( 1, -1 );
	},

	_gatherGithubIssueContributors: function() {
		// TODO
	}
});

};
