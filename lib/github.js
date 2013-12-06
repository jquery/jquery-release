var querystring = require( "querystring" );
var github = require( "github-request" );

module.exports = function( Release ) {

Release.define({
	_githubApiPath: function( path ) {
		var repoUrl = Release._packageUrl( "bugs" );
		var repo = repoUrl.match( /github\.com\/(\w+\/\w+)/ )[ 1 ];
		return "/repos/" + repo + "/" + path;
	},

	_githubMilestone: function( callback ) {
		github.requestAll({
			path: Release._githubApiPath( "milestones" )
		}, function( error, milestones ) {
			if ( error ) {
				Release.abort( "Error getting milestones.", error );
			}

			var milestone = milestones.filter(function( milestone ) {
				return milestone.title === Release.newVersion;
			})[ 0 ];

			if ( !milestone ) {
				Release.abort( "No milestone found." );
			}

			callback( milestone.number );
		});
	},

	_generateGithubChangelog: function( callback ) {
		Release._githubMilestone(function( milestone ) {
			github.requestAll({
				path: Release._githubApiPath( "issues?" + querystring.stringify( {
					milestone: milestone,
					state: "closed"
				} ) ),
			}, function( error, issues ) {
				if ( error ) {
					return Release.abort( "Error getting issues.", error );
				}

				var changelog = issues.map(function( issue ) {
					var component = "(none)";

					issue.labels.forEach(function( label ) {
						if ( /^component:/i.test( label.name ) ) {
							component = label.name.substring( 11 );
						}
					});

					return [
						"#" + issue.number,
						component,
						issue.title
					].sort(function( a, b ) {
						return a.component > b.component ? 1 : -1;
					}).join( "\t" );
				}).join( "\n" ) + "\n";

				callback( changelog );
			});
		});
	},

	_gatherGithubIssueContributors: function( callback ) {

		// TODO
		process.nextTick(function() {
			callback( [] );
		});
	}
});

};
