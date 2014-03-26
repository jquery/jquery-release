var fs = require( "fs" );

var commits = {};
module.exports = commits;

fs.readFileSync( __dirname + "/commits.txt", "utf8" )
	.trim()
	.split( "\n=====\n")
	.forEach(function( raw ) {
		var parts = raw.split( "\n*****\n" );
		commits[ parts[ 0 ] ] = {
			input: parts[ 1 ],
			output: parts[ 2 ]
		};
	});
