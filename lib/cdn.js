var shell = require( "shelljs" );

module.exports = function( Release ) {
	var realRemote = "git@github.com:jquery/codeorigin.jquery.com.git",
		testRemote = "git@github.com:jquery/fake-cdn.git";

	Release.define({
		_cloneCdnRepo: function() {
			var local = Release.dir.base + "/codeorigin.jquery.com",
				remote = Release.isTest ? testRemote : realRemote;

			console.log( "Cloning " + remote.cyan + "..." );
			Release.git( "clone " + remote + " " + local, "Error cloning CDN repo." );
			console.log();

			return local;
		},

		_pushToCdn: function() {
			var projectCdn,
				jqueryCdn = Release._cloneCdnRepo(),
				releaseCdn = Release.dir.repo + "/dist/cdn",
				commitMessage = Release.project + ": Added version " + Release.newVersion;

			if ( Release.project === "jquery" ) {
				projectCdn = jqueryCdn;
			} else if ( /^jquery-/.test( Release.project ) ) {
				projectCdn = jqueryCdn + "/" + Release.project.substring( 7 ) +
					"/" + Release.newVersion;
			} else {
				projectCdn = jqueryCdn + "/" + Release.project + "/" + Release.newVersion;
			}

			shell.mkdir( "-p", projectCdn );
			shell.cp( "-r", releaseCdn + "/*", projectCdn );

			console.log( "Adding files..." );
			process.chdir( projectCdn );
			Release.git( "add ." , "Error adding files." );
			Release.git( "commit -m '" + commitMessage + "'" , "Error commiting files." );
			Release.git( "push", "Error pushing to CDN." );
			console.log();
		}
	});
};
