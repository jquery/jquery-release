var fs = require( "fs" ),
	path = require( "path" ),
	shell = require( "shelljs" );

module.exports = function( Release ) {
	var remote = "git@github.com:jquery/codeorigin.jquery.com.git",
		local,
		releaseCDN,
		jqueryCDN,
		projectCDN;

	Release.define({
		_cloneCDNRepo: function() {
			console.log( "Cloning " + remote.cyan + "..." );
			process.chdir( Release.dir.base );
			Release.git( "clone " + remote + " " + local, "Error cloning CDN repo." );

			console.log( "Checking out master branch..." );
			Release.git( "checkout master" , "Error checking out master branch." );
			console.log();
		},

		_pushToCdn: function( fn ) {
			var fileList;

			local = path.join( Release.dir.base, "codeorigin.jquery.com" );
			releaseCDN = path.join( Release.dir.repo, "dist", "cdn" );
			jqueryCDN = path.join( local, "cdn" );

			if ( Release.project === "jquery" ) {
				projectCDN = jqueryCDN;
			} else if ( /^jquery-/.test( Release.project ) ) {
				projectCDN = path.join( jqueryCDN, Release.project.substring(7), Release.newVersion );
			} else {
				projectCDN = path.join( jqueryCDN, Release.project, Release.newVersion );
			}

			Release._cloneCDNRepo();

			process.chdir( releaseCDN );
			// Get the list of files to add to the codeorigin repo
			fileList = shell.find( "." ) || [];
			fileList.shift(); // Drop the "."
			shell.mkdir( "-p", projectCDN );
			shell.cp( "-r", path.join( releaseCDN, "*" ), projectCDN );

			console.log( "Adding files..." );
			process.chdir( projectCDN )
			Release.git( "add " + fileList.join( " " ) , "Error adding files." );
			Release.git( "commit -m '" + Release.project +": Added CDN files for the " + Release.newVersion + " release.'" , "Error commiting files." );
			Release.git( "push origin master", "Error pushing to " + remote );
			console.log();

			fn();
		}
	});
};