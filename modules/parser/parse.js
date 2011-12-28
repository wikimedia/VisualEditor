/**
 * Command line wikidom parse utility.
 * Read from STDIN, write to STDOUT.
 */


( function() { 

	var ParseThingy = require('./mediawiki.parser.js').ParseThingy,
		optimist = require('optimist');

	var parser = new ParseThingy();


	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	var inputChunks = [];
	process.stdin.on( 'data', function( chunk ) {
		inputChunks.push( chunk );
	} );

	process.stdin.on( 'end', function() { 
		var input = inputChunks.join('');
		var output = getOutput(parser, input);
		process.stdout.write( output );
		process.exit(0);
	} );

	/**
	 * @param {ParseThingy} parser
	 * @param {String} text
	 */
	function getOutput( parser, input ) {
		var res = parser.wikiTokenizer.tokenize(input);
		if (res.err) {
			console.log('PARSE FAIL', res.err);
			process.exit(1);
		} 

		parser.tokenDispatcher.transformTokens( res.tokens );

		return parser.getWikiDom();
	}

} )();
