/**
 * Command line wikidom parse utility.
 * Read from STDIN, write to STDOUT.
 */


( function() { 

	var ParserPipeline = require('./mediawiki.parser.js').ParserPipeline,
		optimist = require('optimist');

	var parser = new ParserPipeline();


	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	var inputChunks = [];
	process.stdin.on( 'data', function( chunk ) {
		inputChunks.push( chunk );
	} );

	process.stdin.on( 'end', function() { 
		var input = inputChunks.join('');
		parser.parse( input );
		var output = parser.getWikiDom();
		process.stdout.write( output );
		// add a trailing newline for shell user's benefit
		process.stdout.write( "\n" );
		process.exit(0);
	} );

} )();
