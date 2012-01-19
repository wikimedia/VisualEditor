/**
 * Command line wikidom parse utility.
 * Read from STDIN, write to STDOUT.
 */


( function() { 

	var ParserPipeline = require('./mediawiki.parser.js').ParserPipeline,
		ParserEnv = require('./mediawiki.parser.environment.js').MWParserEnvironment,
		DOMConverter = require('./mediawiki.DOMConverter.js').DOMConverter,
		optimist = require('optimist');

	var env = new ParserEnv( { fetchTemplates: true } ),
		parser = new ParserPipeline( env );


	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	var inputChunks = [];
	process.stdin.on( 'data', function( chunk ) {
		inputChunks.push( chunk );
	} );



	process.stdin.on( 'end', function() { 
		var input = inputChunks.join('');
		parser.on('document', function ( document ) {
			var wikiDom = new DOMConverter().HTMLtoWiki( document.body ),
				// Serialize the WikiDom with indentation
				output = JSON.stringify( wikiDom, null, 2 );
			process.stdout.write( output );
			// add a trailing newline for shell user's benefit
			process.stdout.write( "\n" );
			
			if ( env.debug ) {
				// Also print out the html
				process.stderr.write( document.body.innerHTML );
				process.stderr.write( "\n" );
			}
			process.exit(0);
		});
		// Kick off the pipeline by feeding the input into the parser pipeline
		parser.parse( input );
	} );

} )();
