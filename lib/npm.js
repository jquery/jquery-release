module.exports = function( Release ) {
	Release.define({
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
