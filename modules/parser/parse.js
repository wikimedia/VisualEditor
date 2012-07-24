/**
 * Command line parse utility.
 * Read from STDIN, write to STDOUT.
 *
 * @author Neil Kandalgaonkar <neilk@wikimedia.org>
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

var ParserPipelineFactory = require('./mediawiki.parser.js').ParserPipelineFactory,
	ParserEnv = require('./mediawiki.parser.environment.js').MWParserEnvironment,
	ConvertDOMToLM = require('./mediawiki.LinearModelConverter.js').ConvertDOMToLM,
	DOMConverter = require('./mediawiki.DOMConverter.js').DOMConverter,
	WikitextSerializer = require('./mediawiki.WikitextSerializer.js').WikitextSerializer,
	optimist = require('optimist'),
	html5 = require('html5');

( function() {
	var opts = optimist.usage( 'Usage: echo wikitext | $0', {
		'help': {
			description: 'Show this message',
			'boolean': true,
			'default': false
		},
		'linearmodel': {
			description: 'Output linear model data instead of HTML',
			'boolean': true,
			'default': false
		},
		'wikidom': {
			description: 'Output WikiDOM instead of HTML',
			'boolean': true,
			'default': false
		},
		'html2wt': {
			description: 'Convert input HTML to Wikitext',
			'boolean': true,
			'default': false
		},
		'wikitext': {
			description: 'Output WikiText instead of HTML',
			'boolean': true,
			'default': false
		},
		'debug': {
			description: 'Debug mode',
			'boolean': true,
			'default': false
		},
		'trace': {
			description: 'Trace mode (light debugging), implied by --debug',
			'boolean': true,
			'default': false
		},
		'maxdepth': {
			description: 'Maximum expansion depth',
			'boolean': false,
			'default': 40
		},
		'wgScript': {
			description: 'http path to remote API, e.g. http://wiki.sample.com/w',
			'boolean': false,
			'default': 'http://en.wikipedia.org/w'
		},
		'wgScriptPath': {
			description: 'http path to remote web interface, e.g. http://wiki.sample.com/wiki',
			'boolean': false,
			'default': 'http://en.wikipedia.org/wiki/'
		},
		'wgScriptExtension': {
			description: 'Extension for PHP files on remote API server, if any. Include the period, e.g. ".php"',
			'boolean': false,
			'default': '.php'
		},
		'fetchTemplates': {
			description: 'Whether to fetch included templates recursively',
			'boolean': true,
			'default': true
		},
		'pagename': {
			description: 'The page name, returned for {{PAGENAME}}.',
			'boolean': false,
			'default': 'Main page'
		}
	});
	var argv = opts.argv;
	
	if ( argv.help ) {
		optimist.showHelp();
		return;
	}

	var env = new ParserEnv( {
						// fetch templates from enwiki by default..
						wgScript: argv.wgScript,
						wgScriptPath: argv.wgScriptPath,
						wgScriptExtension: argv.wgScriptExtension,
						// XXX: add options for this!
						wgUploadPath: 'http://upload.wikimedia.org/wikipedia/commons',
						fetchTemplates: argv.fetchTemplates,
						// enable/disable debug output using this switch
						debug: argv.debug,
						trace: argv.trace,
						maxDepth: argv.maxdepth,
						pageName: argv.pagename
					} );

	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	var inputChunks = [];
	process.stdin.on( 'data', function( chunk ) {
		inputChunks.push( chunk );
	} );

	process.stdin.on( 'end', function() {
		var input = inputChunks.join('');
		if (argv.html2wt) {
			var p = new html5.Parser();
			p.parse('<html><body>' + input.replace(/\r/g, '') + '</body></html>');
			var content = p.tree.document.childNodes[0].childNodes[1];
			var stdout  = process.stdout;
			new WikitextSerializer({env: env}).serializeDOM(content, stdout.write.bind(stdout));

			// add a trailing newline for shell user's benefit
			stdout.write( "\n" );
			process.exit(0);
		} else {
			var parserPipelineFactory = new ParserPipelineFactory( env );
			var parser = parserPipelineFactory.makePipeline( 'text/x-mediawiki/full' );
			parser.on('document', function ( document ) {
				// Print out the html
				if ( argv.linearmodel ) {
					process.stdout.write(
						JSON.stringify( ConvertDOMToLM( document.body ), null, 2 ) );
				} else if ( argv.wikidom ) {
					process.stdout.write(
						JSON.stringify(
							new DOMConverter().HTMLtoWiki( document.body ),
							null,
							2
						));
				} else if ( argv.wikitext ) {
					new WikitextSerializer({env: env}).serializeDOM( document.body,
						process.stdout.write.bind( process.stdout ) );
				} else {
					process.stdout.write( document.body.innerHTML );
				}

				// add a trailing newline for shell user's benefit
				process.stdout.write( "\n" );
				process.exit(0);
			});
			// Kick off the pipeline by feeding the input into the parser pipeline
			parser.process( input );
		}
	} );

} )();
