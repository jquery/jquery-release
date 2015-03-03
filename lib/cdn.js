var shell = require( "shelljs" ),
	fs = require( "fs" );

module.exports = function( Release ) {
	var realRemote = "git@github.com:jquery/codeorigin.jquery.com.git",
		testRemote = "git@github.com:jquery/fake-cdn.git";

	function projectCdn() {
		var npmPackage = Release.readPackage().name,
			jqueryCdn = Release._cloneCdnRepo() + "/cdn";
		if ( npmPackage === "jquery" || npmPackage === "jquery-compat" ) {
			return jqueryCdn;
		}
		if ( npmPackage === "qunitjs" ) {
			return jqueryCdn + "/qunit";
		}
		if ( /^jquery-/.test( npmPackage ) ) {
			return jqueryCdn + "/" + npmPackage.substring( 7 ) +
				"/" + Release.newVersion;
		}
		return jqueryCdn + "/" + npmPackage + "/" + Release.newVersion;
	}

	Release.define({
		cdnPublish: "dist/cdn",
		_cloneCdnRepo: function() {
			var local = Release.dir.base + "/codeorigin.jquery.com",
				remote = Release.isTest ? testRemote : realRemote;

			if ( fs.existsSync( local ) ) {
				return local;
			}

			console.log( "Cloning " + remote.cyan + "..." );
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
			console.log( "Copying files from " + releaseCdn.cyan + " to " + targetCdn.cyan + "." );
			shell.mkdir( "-p", targetCdn );
			shell.cp( "-r", releaseCdn + "/*", targetCdn );

			console.log( "Adding files..." );
			Release.chdir( targetCdn );
			Release.exec( "git add ." , "Error adding files." );
			Release.exec( "git commit -m '" + commitMessage + "'" , "Error commiting files." );
		},

		_pushToCdn: function() {
			Release.chdir( projectCdn() );
			Release.exec( "git push", "Error pushing to CDN." );
			console.log();
		}
	});
};
