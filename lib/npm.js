"use strict";

var chalk = require( "chalk" );

module.exports = function( Release ) {
	Release.define( {
		_getNpmUser: function() {
			var user = Release.exec( {
				command: "npm whoami",
				silent: true
			}, "Error getting npm user." );

			if ( /^Not authed/.test( user ) ) {
				Release.abort( "You are not registered with npm." );
			}

			return user.trim();
		},

		_getNpmOwners: function( npmPackage ) {
			var result = Release.rawExec( "npm owner ls " + npmPackage, { silent: true } );
			if ( result.code !== 0 ) {

				// The npm package may not exist yet
				if ( result.output.split( "\n" ).some(
					function( line ) {
						return ( /ERR! 404/ ).test( line );
					} )
				) {
					return [];
				}

				Release.abort( "Error getting npm owners." );
			}

			return result.output.trim().split( "\n" ).map( function( owner ) {
				return owner.split( " " )[ 0 ];
			} );
		},

		_checkNpmCredentials: function() {
			if ( !Release.npmPublish ) {
				return;
			}

			var npmPackage = Release.readPackage().name,
				user = Release._getNpmUser(),
				owners = Release._getNpmOwners( npmPackage );

			if ( owners.length && owners.indexOf( user ) === -1 ) {
				Release.abort( user + " is not an owner of " + npmPackage + " on npm." );
			}
		},

		npmTags: function() {
			var tags = [ "beta" ];

			if ( !Release.preRelease ) {
				tags.push( "latest" );
			}

			return tags;
		},

		// Ask for a one-time password for 2FA-enabled accounts;
		// returns OTP as string if provided, undefined otherwise.
		_getNpmOtp: async function() {
			var otp = await Release.promptFor(
				"Enter one-time password if you have 2FA enabled and press Enter.\n" +
				"Otherwise, just press Enter." );

			return otp || undefined;
		},

		_publishNpm: async function() {
			if ( !Release.npmPublish ) {
				return;
			}

			Release.chdir( Release.dir.repo );

			var npmPublish,
				newVersion = Release.readPackage().name + "@" + Release.newVersion,
				safety = Release.isTest ? "--dry-run" : "",
				npmTags = Release.npmTags(),
				otp = await Release._getNpmOtp();

			if ( Release.isTest ) {
				console.log( "Actual release would now publish to npm using:" );
			} else {
				console.log( "Publishing to npm, running:" );
			}

			npmPublish = `npm publish ${ safety } ${
				otp ? `--otp ${ otp }` : ""
			} --tag ${ npmTags.pop() }`;
			console.log( "  " + chalk.cyan( npmPublish ) );
			Release.exec( npmPublish );

			while ( npmTags.length ) {
				npmPublish = "npm dist-tag add " + newVersion + " " + npmTags.pop();
				console.log( "  " + chalk.cyan( npmPublish ) );
				if ( !Release.isTest ) {
					Release.exec( npmPublish );
				}
			}

			console.log();
		}
	} );
};
