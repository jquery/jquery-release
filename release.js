#!/usr/bin/env node

"use strict";

var commonTasks, stableTasks,
	fs = require( "fs" ),
	Release = {
		define: function( props ) {
			for ( var prop in props ) {
				Release[ prop ] = props[ prop ];
			}
		},

		complete: function() {
			console.log( "Release complete." );
			console.log( "Please review the project-specific release checklist." );
		}
	};

fs.readdirSync( "./lib" ).forEach( function( filename ) {
	if ( filename.endsWith( ".js" ) ) {
		require( "./lib/" + filename )( Release );
	}
} );

commonTasks = [
	Release._checkExecutables,
	Release._parseArguments,
	Release.confirm,

	Release._createReleaseDirectory,

	Release._section( "setting up repo" ),
	Release._cloneRepo,
	Release._checkRepoState,
	Release._checkNpmCredentials,

	Release._section( "calculating versions" ),
	Release._getVersions,
	Release.confirm,

	Release._section( "building release" ),
	Release._createReleaseBranch,

	Release._section( "generating changelog" ),
	Release._generateChangelog,

	Release._section( "gathering contributors" ),
	Release._gatherContributors,

	Release._section( "pushing tag" ),
	Release.confirmReview,
	Release._pushRelease,

	function( fn ) {
		if ( Release.cdnPublish ) {
			Release._section( "publishing to jQuery CDN" )();
			Release.walk( [
				Release._copyCdnArtifacts,
				Release.confirmReview,
				Release._pushToCdn
			], fn );
		} else {
			fn();
		}
	},

	function( fn ) {
		if ( Release.dist ) {
			Release._section( "additional custom distribution" );
			Release.dist( fn );
		} else {
			fn();
		}
	},

	function() {
		if ( Release.npmPublish ) {
			Release._section( "publishing to npm" )();
		}
	},
	Release._publishNpm
];

stableTasks = [
	Release._section( "updating branch version" ),
	Release._updateBranchVersion,

	function() {
		Release._section( "pushing " + Release.branch )();
	},
	Release.confirmReview,
	Release._pushBranch
];

Release.walk( commonTasks, function() {
	if ( Release.preRelease ) {
		return Release.complete();
	}

	Release.walk( stableTasks, Release.complete );
} );
