var fs = require( "fs" );

module.exports = function( Release ) {

Release.define({
	_jsonFiles: [ "package.json", "bower.json" ],
	_cloneRepo: function() {
		console.log( "Cloning " + Release.remote.cyan + "..." );
		Release.git( "clone " + Release.remote + " " + Release.dir.repo, "Error cloning repo." );
		process.chdir( Release.dir.repo );

		console.log( "Checking out " + Release.branch.cyan + " branch..." );
		Release.git( "checkout " + Release.branch, "Error checking out branch." );
		console.log();

		console.log( "Installing dependencies..." );
		if ( Release.exec( "npm install" ).code !== 0 ) {
			Release.abort( "Error installing dependencies." );
		}
		console.log();

		console.log( "Loading project-specific release script..." );
		require( Release.dir.repo + "/build/release" )( Release );
		console.log();
	},

	_checkRepoState: function() {
		if ( !Release.issueTracker ) {
			Release.abort( "Missing required config: issueTracker." );
		}

		Release.issueTracker = Release.issueTracker.toLowerCase();
		if ( [ "github", "trac" ].indexOf( Release.issueTracker ) === -1 ) {
			Release.abort( "Invalid value for issueTracker. Must be 'github' or 'trac'." );
		}

		if ( Release.issueTracker === "trac" ) {
			if ( !Release.contributorReportId ) {
				Release.abort( "Missing required config: contributorReportId." );
			}
		}

		Release._checkAuthorsTxt();
		Release.checkRepoState();
	},

	_checkAuthorsTxt: function() {
		console.log( "Checking AUTHORS.txt..." );
		var result, lastActualAuthor,
			lastListedAuthor = fs.readFileSync( "AUTHORS.txt", "utf8" )
				.trim()
				.split( /\r?\n/ )
				.pop();

		result = Release.exec( "grunt authors", { silent: true } );
		if ( result.code !== 0 ) {
			Release.abort( "Error getting list of authors." );
		}
		lastActualAuthor = result.output.split( /\r?\n/ ).splice( -4, 1 )[ 0 ];

		if ( lastListedAuthor !== lastActualAuthor ) {
			console.log( "Last listed author is " + lastListedAuthor.red + "." );
			console.log( "Last actual author is " + lastActualAuthor.green + "." );
			Release.abort( "Please update AUTHORS.txt." );
		}

		console.log( "Last listed author (" + lastListedAuthor.cyan + ") is correct." );
	},

	checkRepoState: function() {},

	_readJSON: function( fileName ) {
		var json = fs.readFileSync( Release.dir.repo + "/" + fileName, "utf8" );
		Release.packageIndentation = json.match( /\n([\t\s]+)/ )[ 1 ];
		return JSON.parse( json );
	},

	_writeJSON: function( fileName, json ) {
		fs.writeFileSync( Release.dir.repo + "/" + fileName,
			JSON.stringify( json, null, Release.packageIndentation ) + "\n" );
	},

	readPackage: function() {
		return Release._readJSON( "package.json" );
	},

	writePackage: function( json ) {
		Release._writeJSON( "package.json", json );
	},

	_versionJSON: function( fileName, version ) {
		if ( !fs.existsSync( Release.dir.repo + "/" + fileName ) ) {
			return;
		}
		console.log( "Updating " + fileName + "..." );
		var json = Release._readJSON( fileName );
		json.version = version;
		Release._writeJSON( fileName, json );
	},

	_setVersion: function( version ) {
		Release._jsonFiles.forEach(function( file ) {
			Release._versionJSON( file, version );
		});
	},

	_getVersions: function() {
		var parts, major, minor, patch,
			currentVersion = Release.readPackage().version;

		console.log( "Validating current version..." );
		if ( currentVersion.substr( -3, 3 ) !== "pre" ) {
			console.log( "The current version is " + currentVersion.red + "." );
			Release.abort( "The version must be a pre version." );
		}

		if ( Release.preRelease ) {
			Release.newVersion = Release.preRelease;

			// Note: prevVersion is not currently used for pre-releases.
			Release.prevVersion = Release.nextVersion = currentVersion;
		} else {
			Release.newVersion = currentVersion.substr( 0, currentVersion.length - 3 );
			parts = Release.newVersion.split( "." );
			major = parseInt( parts[ 0 ], 10 );
			minor = parseInt( parts[ 1 ], 10 );
			patch = parseInt( parts[ 2 ], 10 );

			if ( minor === 0 && patch === 0 ) {
				Release.abort(
					"This script is not smart enough to handle major release (eg. 2.0.0)." );
			} else if ( patch === 0 ) {
				Release.prevVersion = Release.git(
					"for-each-ref --count=1 --sort=-authordate --format='%(refname:short)' " +
					"refs/tags/" + [ major, minor - 1 ].join( "." ) + "*"
				).trim();
			} else {
				Release.prevVersion = [ major, minor, patch - 1 ].join( "." );
			}

			Release.nextVersion = [ major, minor, patch + 1 ].join( "." ) + "pre";
		}

		console.log( "We are going from " + Release.prevVersion.cyan +
			" to " + Release.newVersion.cyan + "." );
		console.log( "After the release, the version will be " + Release.nextVersion.cyan + "." );
	},

	_createReleaseBranch: function() {
		var json;

		console.log( "Creating " + "release".cyan + " branch..." );
		Release.git( "checkout -b release", "Error creating release branch." );
		console.log();

		Release._setVersion( Release.newVersion );

		// Update package.json URLs
		console.log( "Updating package.json URLs..." );
		json = Release.readPackage();
		json.author.url = json.author.url.replace( "master", Release.newVersion );
		json.licenses.forEach(function( license ) {
			license.url = license.url.replace( "master", Release.newVersion );
		});
		Release.writePackage( json );

		Release.generateArtifacts( Release._createTag );
	},

	_createTag: function( paths ) {
		var jsonFiles = [];
		Release._jsonFiles.forEach(function( name ) {
			if ( fs.existsSync( name ) ) {
				jsonFiles.push( name );
			}
		});

		// Ensure that at least one file is in the array so that `git add` won't error
		paths = paths.concat( jsonFiles );

		console.log( "Committing release artifacts..." );
		Release.git( "add -f " + paths.join( " " ), "Error adding release artifacts to git." );
		Release.git( "commit -m 'Tagging the " + Release.newVersion + " release.'",
			"Error committing release changes." );
		console.log();

		console.log( "Tagging release..." );
		Release.git( "tag " + Release.newVersion, "Error tagging " + Release.newVersion + "." );
		Release.tagTime = Release.git( "log -1 --format='%ad'",
			"Error getting tag timestamp." ).trim();
	},

	generateArtifacts: function( fn ) {
		fn( [] );
	},

	_pushRelease: function() {
		console.log( "Pushing release to git repo..." );
		Release.git( "push --tags", "Error pushing tags to git repo." );
	},

	_updateBranchVersion: function() {
		console.log( "Checking out " + Release.branch.cyan + " branch..." );
		Release.git( "checkout " + Release.branch,
			"Error checking out " + Release.branch + " branch." );

		// Update all JSON versions
		Release._setVersion( Release.nextVersion );

		console.log( "Committing version update..." );
		Release.git( "commit -am 'Updating the " + Release.branch +
			" version to " + Release.nextVersion + ".'",
			"Error committing package.json." );
	},

	_pushBranch: function() {
		console.log( "Pushing " + Release.branch.cyan + " to GitHub..." );
		Release.git( "push", "Error pushing to GitHub." );
	}
});

};
