var fs = require( "fs" ),
	path = require( "path" );

module.exports = function( Release ) {

Release.define({
	isTest: true,

	_showUsage: function() {
		console.log( fs.readFileSync( path.resolve( path.join( __dirname, "..", "docs", "usage.txt" ) ), "utf8" ) );
	},

	_parseArguments: function() {
		Release.args = {};

		process.argv.forEach(function( arg ) {
			var name, value,
				matches = /--([^=]+)(=(.+))?/.exec( arg );

			if ( matches ) {
				name = matches[ 1 ].replace( /-([a-z])/gi, function( all, letter ) {
					return letter.toUpperCase();
				});
				value = matches[ 3 ] || true;
				Release.args[ name ] = value;
			}
		});

		Release._parseRemote();
		Release.branch = Release.args.branch || "master";
		Release.preRelease = Release.args.preRelease || false;

		console.log();
		console.log( "\tProject: " + Release.project );
		console.log( "\tRelease type: " + (Release.preRelease ? "pre-release" : "stable") );
		console.log( "\tRemote: " + Release.remote );
		console.log( "\tBranch: " + Release.branch );
		console.log();

		if ( Release.isTest ) {
			console.log( "This is a test release. npm will not be updated." );
		} else {
			console.log( "This is a real release. GitHub and npm will be updated." );
		}
	},

	_parseRemote: function() {
		var remote = Release.args.remote;

		if ( !remote ) {
			console.log( "Missing required remote repo." );
			console.log();
			Release._showUsage();
			process.exit( 1 );
		}

		// URL
		if ( /:\/\//.test( remote ) ) {
			Release.project = remote.replace( /.+\/([^\/]+)\.git/, "$1" );

		// filesystem or GitHub
		} else {
			Release.project = remote.split( "/" ).pop();

			// If it's not a local path, it must be a GitHub repo
			if ( !fs.existsSync( remote ) ) {
				Release.isTest = !/^jquery\//.test( remote );
				remote = "git@github.com:" + remote + ".git";
			}
		}

		Release.remote = remote;
	},

	_createReleaseDirectory: function() {
		console.log( "Determining directories..." );
		Release.dir = { base: path.join( process.cwd(),"__release" ) };
		Release.dir.repo = path.join( Release.dir.base, "repo" );

		if ( fs.existsSync( Release.dir.base ) ) {
			console.log( "The directory '" + Release.dir.base + "' already exists." );
			console.log( "Aborting." );
			process.exit( 1 );
		}

		console.log( "Creating directory..." );
		fs.mkdirSync( Release.dir.base );
	}
});

};
