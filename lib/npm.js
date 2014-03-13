module.exports = function( Release ) {
	Release.define({
		_getNpmUser: function() {
			var user = Release.exec({
				command: "npm whoami",
				silent: true
			}, "Error getting npm user." );

			if ( /^Not authed/.test( user ) ) {
				Release.abort( "You are not registered with npm." );
			}

			return user.trim();
		},

		_getNpmOwners: function( npmPackage ) {
			var owners = Release.exec({
				command: "npm owner ls " + npmPackage,
				silent: true
			}, "Error getting npm owners." );

			return owners.trim().split( "\n" ).map(function( owner ) {
				return owner.split( " " )[ 0 ];
			});
		},

		_checkNpmCredentials: function() {
			if ( !Release.npmPublish ) {
				return;
			}

			var npmPackage = Release.readPackage().name,
				user = Release._getNpmUser(),
				owners = Release._getNpmOwners( npmPackage );

			if ( owners.indexOf( user ) === -1 ) {
				Release.abort( user + " is not an owner of " + npmPackage + " on npm." );
			}
		},

		_publishNpm: function() {
			if ( !Release.npmPublish ) {
				return;
			}

			Release.chdir( Release.dir.repo );

			var npmCommand = "npm publish";

			if ( Release.preRelease ) {
				npmCommand += " --tag beta";
			}

			if ( Release.isTest ) {
				console.log( "Actual release would now publish to npm" );
				console.log( "Would run: " + npmCommand.cyan );
				return;
			}

			console.log( "Publishing to npm, running " + npmCommand.cyan );
			Release.exec( npmCommand );
			console.log();
		}
	});
};
