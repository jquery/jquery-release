var shell = require( "shelljs" );

module.exports = function( Release ) {
	var releaseCdn, jqueryCdn, projectCdn, local,
		remote = "git@github.com:jquery/codeorigin.jquery.com.git";

	Release.define({
		_cloneCDNRepo: function() {
			console.log( "Cloning " + remote.cyan + "..." );
			process.chdir( Release.dir.base );
			Release.git( "clone " + remote + " " + local, "Error cloning CDN repo." );
			console.log();
		},

		_pushToCdn: function( fn ) {
			var fileList;

			local = Release.dir.base + "/codeorigin.jquery.com";
			releaseCdn = Release.dir.repo + "/dist/cdn";
			jqueryCdn = local + "/cdn";

			if ( Release.project === "jquery" ) {
				projectCdn = jqueryCdn;
			} else if ( /^jquery-/.test( Release.project ) ) {
				projectCdn = jqueryCdn + "/" + Release.project.substring( 7 ) + "/" + Release.newVersion;
			} else {
				projectCdn = jqueryCdn + "/" + Release.project + "/" + Release.newVersion;
			}

			Release._cloneCDNRepo();

			process.chdir( releaseCdn );
			shell.mkdir( "-p", projectCdn );
			shell.cp( "-r", releaseCdn + "/*", projectCdn );

			console.log( "Adding files..." );
			process.chdir( projectCdn );
			Release.git( "add ." , "Error adding files." );
			Release.git( "commit -m '" + Release.project + ": Added version " + Release.newVersion + "'" , "Error commiting files." );
			Release.git( "push origin master", "Error pushing to " + remote );
			console.log();

			fn();
		}
	});
};