/**
 * Initial parser tests runner for experimental JS parser
 *
 * This pulls all the parserTests.txt items and runs them through the JS
 * parser and JS HTML renderer. Currently no comparison is done on output,
 * as a direct string comparison won't be very encouraging. :)
 *
 * Needs smarter compare, as well as search-y helpers.
 *
 * 2011-07-20 <brion@pobox.com>
 */

(function() {
//"use strict";
console.log( "Starting up JS parser tests" );

var fs = require('fs'),
	path = require('path'),
	jsDiff = require('diff'),
	colors = require('colors'),
	util = require( 'util' ),
	HTML5 = require('html5').HTML5;

// Name of file used to cache the parser tests cases
var cache_file = "parserTests.cache";

// XXX: avoid a global here!
global.PEG = require('pegjs');

// Handle options/arguments with optimist module
var optimist = require('optimist');

var argv = optimist.usage( 'Usage: $0', {
		'quick': {
			description: 'Suppress diff output of failed tests',
			boolean: true,
			default: false,
		},
		'quiet': {
			description: 'Suppress notification of passed tests (shows only failed tests)',
			boolean: true,
			default: false,
		},
		'color': {
			description: 'Enable color output Ex: --no-color',
			boolean: true,
			default: true,
		},
		'cache': {
			description: 'Get tests cases from cache file ' + cache_file,
			boolean: true,
			default: false,
		},
		'filter': {
			description: 'Only run tests whose descriptions which match given regex',
			alias: 'regex',
		},
		'whitelist': {
			description: 'Alternatively compare against manually verified parser output from whitelist',
			default: true,
			boolean: true,
		},
		'help': {
			description: 'Show this help message',
			alias: 'h',
		},
		'disabled': {
			description: 'Run disabled tests (option not implemented)',
			default: false,
			boolean: true,
		},
		'printwhitelist': {
			description: 'Print out a whitelist entry for failing tests. Default false.',
			default: false,
			boolean: true,
		},
	}
	).check( function(argv) {
		if( argv.filter === true ) {
			throw "--filter need an argument";
		}
	}
	).argv // keep that
	;


if( argv.help ) {
	optimist.showHelp();
	process.exit( 0 );
}
var test_filter = null;
if( argv.filter ) { // null is the default by definition
	try {
		test_filter = new RegExp( argv.filter );
	} catch(e) {
		console.error( "\nERROR> --filter was given an invalid regular expression.");
		console.error( "ERROR> See below for JS engine error:\n" + e + "\n" );
		process.exit( 1 );
	}
	console.log( "Filtering title test using Regexp " + test_filter );
}
if( !argv.color ) {
	colors.mode = 'none';
}

// @fixme wrap more or this setup in a common module

// track files imported / required
var fileDependencies = [];

// Fetch up some of our wacky parser bits...

var basePath = path.join(path.dirname(path.dirname(process.cwd())), 'modules');
function _require(filename) {
	var fullpath = path.join( basePath, filename );
	fileDependencies.push( fullpath );
	return require( fullpath );
}

function _import(filename, symbols) {
	var module = _require(filename);
	symbols.forEach(function(symbol) {
		global[symbol] = module[symbol];
	});
}


// needed for html5 parser adapter
//var events = require('events');

// For now most modules only need this for $.extend and $.each :)
global.$ = require('jquery');

// hack for renderer
global.document = $('<div>')[0].ownerDocument;

var pj = path.join;



// Our code...

var testWhiteList = require('./parserTests-whitelist.js').testWhiteList;

_import(pj('parser', 'mediawiki.parser.peg.js'), ['PegParser']);
_import(pj('parser', 'mediawiki.parser.environment.js'), ['MWParserEnvironment']);
_import(pj('parser', 'ext.cite.taghook.ref.js'), ['MWRefTagHook']);

_import(pj('parser', 'mediawiki.html5TokenEmitter.js'), ['FauxHTML5']);
_import(pj('parser', 'mediawiki.DOMPostProcessor.js'), ['DOMPostProcessor']);

// WikiDom and serializers
_require(pj('es', 'es.js'));
_require(pj('es', 'es.Html.js'));
_require(pj('es', 'serializers', 'es.AnnotationSerializer.js'));
_require(pj('es', 'serializers', 'es.HtmlSerializer.js'));
_require(pj('es', 'serializers', 'es.WikitextSerializer.js'));
_require(pj('es', 'serializers', 'es.JsonSerializer.js'));

// Preload the grammar file...
PegParser.src = fs.readFileSync(path.join(basePath, 'parser', 'pegParser.pegjs.txt'), 'utf8');

var parser = new PegParser();

var testFileName = '../../../../phase3/tests/parser/parserTests.txt'; // default
var testFileName2 = '../../../../tests/parser/parserTests.txt'; // Fallback. Not everyone fetch at phase3 level 

if (argv._[0]) {
	// hack :D
	testFileName = argv._[0] ;
	testFileName2 = null;
}

try {
	var testParser = PEG.buildParser(fs.readFileSync('parserTests.pegjs', 'utf8'));
} catch (e) {
	console.log(e);
}


/**
 * Get an object holding our tests cases. Eventually from a cache file
 */
function getTests() {

	// Startup by loading .txt test file
	var testFile;
	try {
		testFile = fs.readFileSync(testFileName, 'utf8');
		fileDependencies.push( testFileName );
	} catch (e) {
		// Try opening fallback file
		if( testFileName2 !== '' ) {
			try {
				testFile = fs.readFileSync( testFileName2, 'utf8' );
				fileDependencies.push( testFileName2 );
			}
			catch(e) { console.log(e); }
		}
	}
	if( !argv.cache ) {
		// Cache not wanted, parse file and return object 
		return parseTestCase( testFile );
	}

	// Find out modification time of all files depencies and then hashes those
	// as a unique value using sha1.
	var mtimes = '';
	fileDependencies.sort().forEach( function (file) {
		mtimes += fs.statSync( file )['mtime'];
	});
	var sha1 = require('crypto').createHash('sha1')
		.update( mtimes ).digest( 'hex' );

	// Look for a cache_file 
	var cache_content;
	var cache_file_digest;
	try {
		console.log( "Looking for cache file " + cache_file );
		cache_content = fs.readFileSync( cache_file, 'utf8' );
		// Fetch previous digest
		cache_file_digest = cache_content.match( /^CACHE: (\w+)\n/ )[1];
	} catch(e) {
		// cache file does not exist
	}

	if( cache_file_digest === sha1 ) {
		// cache file match our digest.
		console.log( "Loaded tests cases from cache file" );
		// Return contained object after removing first line (CACHE: <sha1>)
		return JSON.parse( cache_content.replace( /.*\n/, '' ) );
	} else {
		// Write new file cache, content preprended with current digest
		console.log( "Cache file either inexistant or outdated" );
		var parse = parseTestCase( testFile )
		console.log( "Writing parse result to " +cache_file );
		fs.writeFileSync( cache_file,
			"CACHE: " + sha1 + "\n" + JSON.stringify( parse ),
			'utf8'
		);

		// We can now return the parsed object
		return parse; 
	}
}

/**
 * Parse given tests cases given as plaintext
 */
function parseTestCase( content ) {
	console.log( "Parsing tests case from file, this takes a few seconds ..." );
	try {
		return testParser.parse(content);
		console.log( "Done parsing." );
	} catch (e) {
		console.log(e);
	}
}

var cases = getTests(); 

var articles = {};

function normalizeTitle(name) {
	if (typeof name !== 'string') {
		throw new Error('nooooooooo not a string');
	}
	name = name.replace(/[\s_]+/g, '_');
	name = name.substr(0, 1).toUpperCase() + name.substr(1);
	if (name === '') {
		throw new Error('Invalid/empty title');
	}
	return name;
}

function fetchArticle(name) {
	var norm = normalizeTitle(name);
	if (norm in articles) {
		return articles[norm];
	}
}

function processArticle(item) {
	var norm = normalizeTitle(item.title);
	articles[norm] = item.text;
}

function nodeToHtml(node) {
	return $('<div>').append(node).html();
}

var htmlparser = new HTML5.Parser();

/* Normalize the expected parser output by parsing it using a HTML5 parser and
 * re-serializing it to HTML. Ideally, the parser would normalize inter-tag
 * whitespace for us. For now, we fake that by simply stripping all newlines.
 */
function normalizeHTML(source) {
	// TODO: Do not strip newlines in pre and nowiki blocks!
	source = source.replace(/\n/g, '');
	try {
		htmlparser.parse('<body>' + source + '</body>');
		return htmlparser.document
			.getElementsByTagName('body')[0]
			.innerHTML
			// a few things we ignore for now..
			.replace(/\/wiki\/Main_Page/g, 'Main Page')
			// do not expect a toc for now
			.replace(/<table[^>]+?id="toc"[^>]*>.+?<\/table>/mg, '')
			// do not expect section editing for now
			.replace(/(<span class="editsection">\[.*?<\/span> *)?<span[^>]+class="mw-headline"[^>]*>(.*?)<\/span>/g, '$2')
			// general class and titles, typically on links
			.replace(/(title|class|rel)="[^"]+"/g, '')
			// strip red link markup, we do not check if a page exists yet
			.replace(/\/index.php\?title=|&amp;action=edit&amp;redlink=1/g, '')
			// the expected html has some extra space in tags, strip it
			.replace(/<a +href/g, '<a href')
			.replace(/" +>/g, '">');
	} catch(e) {
        console.log("normalizeHTML failed on" + 
				source + " with the following error: " + e);
		console.trace();
		return source;
	}
		
}

// Specialized normalization of the wiki parser output, mostly to ignore a few
// known-ok differences.
function normalizeOut ( out ) {
	// TODO: Do not strip newlines in pre and nowiki blocks!
	return out.replace(/\n| data-[a-zA-Z]+="[^">]*"/g, '')
				.replace(/<!--.*?-->\n?/gm, '');
}

function formatHTML ( source ) {
	// Quick hack to insert newlines before some block level start tags
	return source.replace(
			/(?!^)<((div|dd|dt|li|p|table|tr|td|tbody|dl|ol|ul|h1|h2|h3|h4|h5|h6)[^>]*)>/g,
											'\n<$1>');
}

var passedTests = 0,
	passedTestsManual = 0,
	failParseTests = 0,
	failTreeTests = 0,
	failOutputTests = 0;

function processTest(item) {
	var tokenizer = new FauxHTML5.Tokenizer(),
		postProcessor = new DOMPostProcessor();
	if (!('title' in item)) {
		console.log(item);
		throw new Error('Missing title from test case.');
	}
	if (!('input' in item)) {
		console.log(item);
		throw new Error('Missing input from test case ' + item.title);
	}
	if (!('result' in item)) {
		console.log(item);
		throw new Error('Missing input from test case ' + item.title);
	}

	function printTitle( failure_only ) {
		if( failure_only ) {
			console.log('FAILED'.red + ': ' + item.title.yellow);
			return;
		}
		console.log('=====================================================');
		console.log('FAILED'.red + ': ' + item.title.yellow);
		console.log(item.comments.join('\n'));
		console.log("INPUT".cyan + ":");
		console.log(item.input + "\n");
	}

	parser.parseToTree(item.input + "\n", function(tokens, err) {
		if (err) {
			printTitle();
			failParseTests++;
			console.log('PARSE FAIL', err);
		} else {
			var environment = new MWParserEnvironment({
				tagHooks: {
					'ref': MWRefTagHook,
					'references': MWReferencesTagHook
				}
			});
			//var res = es.HtmlSerializer.stringify(tokens,environment);
			//console.log(JSON.stringify(tokens));
			//Slightly better token output debugging:
			//console.log( util.inspect( tokens, false, null ).yellow);	

			// Build a DOM tree from tokens using the HTML tree
			// builder/parser.
			processTokens(tokens, tokenizer);

			// Perform post-processing on DOM.
			postProcessor.doPostProcess(tokenizer.parser.document);

			// And serialize the result.
			var out = tokenizer.parser.document
						.getElementsByTagName('body')[0]
						.innerHTML;

			if ( err ) {
				printTitle();
				failTreeTests++;
				console.log('RENDER FAIL', err);
				return;
			}

			var normalizedOut = normalizeOut(out);
			var normalizedExpected = normalizeHTML(item.result);
			if ( normalizedOut !== normalizedExpected ) {
				if (argv.whitelist &&
						item.title in testWhiteList &&
						normalizeOut(testWhiteList[item.title]) ===  normalizedOut) {
						 if( !argv.quiet ) {
							 console.log( 'PASSED (whiteList)'.green + ': ' + item.title.yellow );
						 }
						 passedTestsManual++;
						 return;
				}
				printTitle( argv.quick );
				failOutputTests++;

				if( !argv.quick ) {
				console.log('RAW EXPECTED'.cyan + ':');
				console.log(item.result + "\n");

				console.log('RAW RENDERED'.cyan + ':');
				console.log(formatHTML(out) + "\n");

				var a = formatHTML(normalizedExpected);

				console.log('NORMALIZED EXPECTED'.magenta + ':');
				console.log(a + "\n");

				var b = formatHTML(normalizedOut);

				console.log('NORMALIZED RENDERED'.magenta + ':')
					console.log(formatHTML(normalizeOut(out)) + "\n");
				var patch = jsDiff.createPatch('wikitext.txt', a, b, 'before', 'after');

				console.log('DIFF'.cyan +': ');

				// Strip the header from the patch, we know how diffs work..
				patch = patch.replace(/^[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n/, '');

				var colored_diff = patch.split( '\n' ).map( function(line) {
					// Add some colors to diff output
					switch( line.charAt(0) ) {
						case '-':
							return line.red;
						case '+':
							return line.blue;
						default:
							return line;
					}
				}).join( "\n" );
				

				console.log( colored_diff );
				
				if(argv.printwhitelist) {
					console.log("Whitelist entry:");
					console.log("testWhiteList[" + 
							JSON.stringify(item.title) + "] = " + 
							JSON.stringify(out) +
							";");
				}
				}
			} else {
				passedTests++;
				if( !argv.quiet ) {
				console.log( 'PASSED'.green + ': ' + item.title.yellow );
				}
			}
		}
	});
}

function processTokens ( tokens, tokenizer ) {
	// push a body element, just to be sure to have one
	tokenizer.processToken({type: 'TAG', name: 'body'});
	// Process all tokens
	for (var i = 0, length = tokens.length; i < length; i++) {
		tokenizer.processToken(tokens[i]);
	}
	// And signal the end
	tokenizer.processToken({type: 'END'});
}

var comments = [];

console.log( "Initialisation complete. Now launching tests." );
cases.forEach(function(item) {
	if (typeof item == 'object') {
		switch(item.type) {
			case 'article':
				//processArticle(item);
				break;
			case 'test':
				if( test_filter && -1 === item.title.search( test_filter ) ) {
					// Skip test whose title does not match --filter
					break;
				}
				// Add comments to following test.
				item.comments = comments;
				comments = [];
				processTest(item);
				break;
			case 'comment':
				comments.push(item.comment);
				break;
			default:
				break;
		}
	}
});

/**
 * Colorize given number if <> 0
 *
 * @param count Integer: a number to colorize
 * @param color String: 'green' or 'red'
 */
function ColorizeCount( count, color ) {
	if( count === 0 ) {
		return count;
	}

	// We need a string to use colors methods 
	count = count.toString();
	// FIXME there must be a wait to call a method by its name
	switch( color ) {
		case 'green': return count.green;
		case 'red':   return count.red;

		default:      return count;
	}
}

var failTotalTests = (failParseTests + failTreeTests + failOutputTests);

console.log( "==========================================================");
console.log( "SUMMARY: ");

if( failTotalTests !== 0 ) {
console.log( ColorizeCount( passedTests    , 'green' ) + " passed");
console.log( ColorizeCount( passedTestsManual , 'green' ) + " passed from whitelist");
console.log( ColorizeCount( failParseTests , 'red'   ) + " parse failures");
console.log( ColorizeCount( failTreeTests  , 'red'   ) + " tree build failures");
console.log( ColorizeCount( failOutputTests, 'red'   ) + " output differences");
console.log( "\n" );
console.log( ColorizeCount( passedTests + passedTestsManual , 'green'   ) + 
		' total passed tests, ' +
		ColorizeCount( failTotalTests , 'red'   ) + " total failures");

} else {
	if( test_filter !== null ) {
		console.log( "Passed " + passedTests + passedTestsManual + " of " + passedTests + " tests matching " + test_filter + "... " + "ALL TESTS PASSED!".green );
	} else {
		// Should not happen if it does: Champagne!
		console.log( "Passed " + passedTests + " of " + passedTests + " tests... " + "ALL TESTS PASSED!".green );
	}
}
console.log( "==========================================================");

})();
