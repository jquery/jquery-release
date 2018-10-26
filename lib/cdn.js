var shell = require( "shelljs" ),
	fs = require( "fs" ),
	chalk = require( "chalk" );

module.exports = function( Release ) {
	var realRemote = "git@github.com:jquery/codeorigin.jquery.com.git",
		testRemote = "git@github.com:jquery/fake-cdn.git";

	function projectCdn() {
		var project = Release.readPackage().name,
			jqueryCdn = Release._cloneCdnRepo() + "/cdn";

		// Projects with versioned file names
		if ( project === "jquery" || project === "jquery-compat" ) {
			return jqueryCdn;
		}
		if ( project === "qunitjs" ) {
			return jqueryCdn + "/qunit";
		}

		// Projects with different directory names than their npm package
		if ( /^jquery-/.test( project ) ) {
			project = project.substring( 7 );
		}
		if ( project === "pepjs" ) {
			project = "pep";
		}

		return jqueryCdn + "/" + project + "/" + Release.newVersion;
	}

	Release.define({
		cdnPublish: "dist/cdn",
		_cloneCdnRepo: function() {
			var local = Release.dir.base + "/codeorigin.jquery.com",
				remote = Release.isTest ? testRemote : realRemote;

			if ( fs.existsSync( local ) ) {
				return local;
			}

			console.log( "Cloning " + chalk.cyan( remote ) + "..." );
			Release.chdir( Release.dir.base );
			Release.exec( "git clone " + remote + " " + local, "Error cloning CDN repo." );
			console.log();

			return local;
		},

		_copyCdnArtifacts: function() {
			var npmPackage = Release.readPackage().name,
				targetCdn = projectCdn(),
				releaseCdn = Release.dir.repo + "/" + Release.cdnPublish,
				commitMessage = npmPackage + ": Added version " + Release.newVersion;

			Release.chdir( Release.dir.base );
			console.log( "Copying files from " + chalk.cyan( releaseCdn ) + " to " + chalk.cyan( targetCdn ) + "." );
			shell.mkdir( "-p", targetCdn );
			shell.cp( "-r", releaseCdn + "/*", targetCdn );

			console.log( "Adding files..." );
			Release.chdir( targetCdn );
			Release.exec( "git add ." , "Error adding files." );
			Release.exec( "git commit -m \"" + commitMessage + "\"" , "Error commiting files." );
		},

		_pushToCdn: function() {
			Release.chdir( projectCdn() );
			Release.exec( "git push" + (Release.isTest ? " --dry-run" : ""),
				"Error pushing to CDN." );
			console.log();
		}
	});
};
