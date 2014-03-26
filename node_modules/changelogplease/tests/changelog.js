var fs = require( "fs" ),
	Changelog = require( ".." ).Changelog,
	fixtures = require( "./fixtures/commits" );

exports.ticketUrl = {
	setUp: function( done ) {
		this.changelog = new Changelog({
			ticketUrl: "http://example.com/ticket/{id}/"
		});
		done();
	},

	replacement: function( test ) {
		test.expect( 1 );

		var url = this.changelog.ticketUrl( 37 );
		test.strictEqual( url, "http://example.com/ticket/37/",
			"Ticket id should be inserted." );
		test.done();
	}
};

exports.getLog = {
	setUp: function( done ) {
		this.changelog = new Changelog({
			commitUrl: "http://example.com/commit/{id}/",
			committish: "alpha..omega"
		});
		done();
	},

	error: function( test ) {
		test.expect( 1 );

		var providedError = new Error();

		this.changelog.repo.exec = function() {
			var callback = arguments[ arguments.length - 1 ];
			process.nextTick(function() {
				callback( providedError );
			});
		};

		this.changelog.getLog(function( error ) {
			test.strictEqual( error, providedError, "Should pass error." );
			test.done();
		});
	},

	success: function( test ) {
		test.expect( 5 );

		var providedLog = {};

		this.changelog.repo.exec = function( command, format, committish, callback ) {
			test.strictEqual( command, "log", "Should invoke git log." );
			test.strictEqual( format,
				"--format=" +
					"__COMMIT__%n" +
					"%s (__TICKETREF__, [%h](http://example.com/commit/%H/))%n" +
					"%b",
				"Should pass format with proper commit URL." );
			test.strictEqual( committish, "alpha..omega", "Should pass committish." );

			process.nextTick(function() {
				callback( null, providedLog );
			});
		};

		this.changelog.getLog(function( error, log ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( log, providedLog, "Should pass log." );
			test.done();
		});
	}
};

exports.parseCommit = {
	setUp: function( done ) {
		this.changelog = new Changelog({
			ticketUrl: "TICKET-URL/{id}",
			commitUrl: "COMMIT-URL/{id}"
		});
		done();
	},

	commits: function( test ) {
		test.expect( 6 );

		Object.keys( fixtures ).forEach(function( name ) {
			test.strictEqual(
				this.changelog.parseCommit( fixtures[ name ].input ),
				fixtures[ name ].output,
				name
			);
		}.bind( this ));

		test.done();
	}
};

exports.parseCommits = {
	setUp: function( done ) {
		this.changelog = new Changelog({});
		done();
	},

	commits: function( test ) {
		test.expect( 4 );

		var providedCommits = [ "a", "c", "b" ];
		var parsedCommits = [ "a", "c", "b" ];
		var providedCommitsLog = "__COMMIT__\n" +
			providedCommits.join( "__COMMIT__\n" );
		var callCount = 0;

		this.changelog.parseCommit = function( commit ) {
			test.strictEqual( commit, providedCommits[ callCount ],
				"Should pass commit" );

			var parsedCommit = parsedCommits[ callCount ];

			callCount++;

			return parsedCommit;
		};

		test.strictEqual(
			this.changelog.parseCommits( providedCommitsLog ),
			"a\nb\nc\n",
			"Should parse and sort commits."
		);
		test.done();
	}
};

exports.parse = {
	setUp: function( done ) {
		this.changelog = new Changelog({});
		done();
	},

	"getLog error": function( test ) {
		test.expect( 1 );

		var providedError = new Error();

		this.changelog.getLog = function( callback ) {
			process.nextTick(function() {
				callback( providedError );
			});
		};

		this.changelog.parse(function( error ) {
			test.strictEqual( error, providedError, "Should pass error." );
			test.done();
		});
	},

	success: function( test ) {
		test.expect( 3 );

		var providedLog = {};
		var providedParsedLog = {};

		this.changelog.getLog = function( callback ) {
			process.nextTick(function() {
				callback( null, providedLog );
			});
		};

		this.changelog.parseCommits = function( log ) {
			test.strictEqual( log, providedLog, "Should pass log." );
			return providedParsedLog;
		};

		this.changelog.parse(function( error, log ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( log, providedParsedLog, "Should pass parsed log." );
			test.done();
		});
	}
};
