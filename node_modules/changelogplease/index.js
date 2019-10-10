var Repo = require( "git-tools" );

exports = module.exports = changelog;
exports.Changelog = Changelog;

function changelog( options, callback ) {
	var instance = new Changelog( options );

	if ( callback ) {
		instance.parse( callback );
	}

	return instance;
}

function Changelog( options ) {
	this.options = options;
	this.repo = new Repo( this.options.repo );

	if ( !this.options.ticketTypes ) {

		// GitHub is the default because it's common
		// and also handles the generic form of #XXX
		this.options.ticketTypes = [ "github" ];
	}

	// Normalize ticketUrl to a hash
	if ( typeof this.options.ticketUrl === "string" ) {
		this.options.ticketUrl = {
			_default: this.options.ticketUrl
		};
	}

	this.createTicketUrlParsers();

	// Bind all methods to the instance
	for ( var method in this ) {
		if ( typeof this[ method ] === "function" ) {
			this[ method ] = this[ method ].bind( this );
		}
	}
}

Changelog.ticketParsers = {
	github: function ( commit, ticketUrl ) {
		var tickets = [];

		// Sane global exec with iteration over matches
		commit.replace(
			/Fix(?:e[sd])? ((?:[a-zA-Z0-9_-]{1,39}\/[a-zA-Z0-9_-]{1,100}#)|#|gh-)(\d+)/g,
			function ( match, refType, ticketId ) {
				var ticketRef = {
					url: ticketUrl( ticketId ),
					label: "#" + ticketId
				};

				// If the refType has anything before the #, assume it's a GitHub ref
				if ( /.#$/.test( refType ) ) {
					refType = refType.replace( /#$/, "" );
					ticketRef.url = "https://github.com/" + refType + "/issues/" + ticketId;
					ticketRef.label = refType + ticketRef.label;
				}

				tickets.push( ticketRef );
			}
		);

		return tickets;
	},

	jira: function ( commit, ticketUrl ) {
		var tickets = [];

		// Sane global exec with iteration over matches
		commit.replace(
			/Fix(?:e[sd])? ([A-Z][A-Z0-9_]+-\d+)/g,
			function ( match, ticketId ) {
				var ticketRef = {
					url: ticketUrl( ticketId ),
					label: ticketId
				};

				tickets.push( ticketRef );
			}
		);

		return tickets;
	}
};

Changelog.prototype.createTicketUrlParsers = function() {
	this.ticketUrls = {};
	Object.keys( this.options.ticketUrl ).forEach(function( type ) {
		this.ticketUrls[ type ] = function( id ) {
			return this.options.ticketUrl[ type ].replace( "{id}", id );
		}.bind( this );
	}, this );
};

Changelog.prototype.parse = function( callback ) {
	this.getLog(function( error, log ) {
		if ( error ) {
			return callback( error );
		}

		callback( null, this.parseCommits( log ) );
	}.bind( this ));
};

Changelog.prototype.getLog = function( callback ) {
	var commitUrl = this.options.commitUrl.replace( "{id}", "%H" );

	this.repo.exec( "log",
		"--format=" +
			"__COMMIT__%n" +
			"%s (__TICKETREF__, [%h](" + commitUrl + "))%n" +
			"%b",
		this.options.committish,
		callback );
};

Changelog.prototype.sort = function( commits ) {
	if ( this.options.sort === false ) {
		return commits;
	}

	if ( typeof this.options.sort === "function" ) {
		return this.options.sort( commits );
	}

	// Sort commits so that they're grouped by component
	var component = /^([^:]+):/;
	return commits.sort(function( a, b ) {
		var aMatch = a.match( component ),
			bMatch = b.match( component );

		if ( aMatch && bMatch) {
			return aMatch[ 1 ].localeCompare( bMatch[ 1 ] );
		}

		return a.localeCompare( b );
	});
};

Changelog.prototype.parseCommits = function( commits ) {
	commits = commits.split( "__COMMIT__\n" );
	commits.shift();

	// Parse each individual commit
	commits = commits.map( this.parseCommit );

	// Sort commits
	commits = this.sort( commits );

	return commits.join( "\n" ) + "\n";
};

Changelog.prototype.parseCommit = function( commit ) {
	var tickets = [];

	this.options.ticketTypes.forEach( function( ticketType ) {
		tickets = tickets.concat(
			Changelog.ticketParsers[ ticketType ](
				commit,
				this.ticketUrls[ ticketType ] || this.ticketUrls._default
			)
		);
	}, this );

	// Only keep the summary for the changelog; drop the body
	var parsed = "* " + commit.split( /\r?\n/ )[ 0 ];

	// Add in ticket references
	// Leave __TICKETREF__ token in place so it's easy to find commits without tickets
	if ( tickets.length ) {
		parsed = parsed.replace( "__TICKETREF__", tickets.map(function( ticket ) {
			return "[" + ticket.label + "](" + ticket.url + ")";
		}).join( ", " ) );
	}

	// Remove cherry pick references
	parsed = parsed.replace( / \(cherry picked from commit [^)]+\)/, "" );

	return parsed;
};
