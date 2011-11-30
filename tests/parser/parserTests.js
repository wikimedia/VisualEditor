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

var fs = require('fs'),
	path = require('path'),
	jsDiff = require('diff'),
	HTML5 = require('html5').HTML5;

// @fixme wrap more or this setup in a common module

// Fetch up some of our wacky parser bits...

var basePath = path.join(path.dirname(path.dirname(process.cwd())), 'modules');
function _require(filename) {
	return require(path.join(basePath, filename));
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

// Local CommonJS-friendly libs
global.PEG = _require(pj('parser', 'lib.pegjs.js'));


// Our code...
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
if (process.argv.length > 2) {
	// hack :D
	testFileName = process.argv[2];
	testFileName2 = null;
	console.log(testFileName);
}

try {
	var testParser = PEG.buildParser(fs.readFileSync('parserTests.pegjs', 'utf8'));
} catch (e) {
	console.log(e);
}

var testFile;
try {
	testFile = fs.readFileSync(testFileName, 'utf8');
} catch (e) {
	// Try opening fallback file
	if( testFileName2 !== '' ) {
		try { testFile = fs.readFileSync( testFileName2, 'utf8' ); }
		catch(e) { console.log(e); }
	}
}

try {
	var cases = testParser.parse(testFile);
} catch (e) {
	console.log(e);
}

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
			.replace(/(title|class|rel)="[^"]+"/g, '')
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
	return out.replace(/\n| data-[a-zA-Z]+="[^">]+"/g, '')
				.replace(/<!--.*?-->\n?/gm, '');
}

function formatHTML ( source ) {
	// Quick hack to insert newlines before some block level start tags
	return source.replace(/(?!^)<((div|dd|dt|li|p|table|tr|td|tbody|dl|ol|ul)[^>]*)>/g,
											'\n<$1>');
}

var passedTests = 0,
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

	function printTitle() {
		console.log('=====================================================');
		console.log('FAILED: ' + item.title);
		console.log(item.comments.join('\n'));
		console.log("INPUT:");
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
				printTitle();
				failOutputTests++;
				console.log('RAW EXPECTED:');
				console.log(item.result + "\n");

				console.log('RAW RENDERED:');
				console.log(formatHTML(out) + "\n");

				var a = formatHTML(normalizedExpected);

				console.log('NORMALIZED EXPECTED:');
				console.log(a + "\n");

				var b = formatHTML(normalizedOut);

				console.log('NORMALIZED RENDERED:')
					console.log(formatHTML(normalizeOut(out)) + "\n");
				var patch = jsDiff.createPatch('wikitext.txt', a, b, 'before', 'after');

				console.log('DIFF:');
				console.log(patch.replace(/^[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n/, ''));
			} else {
				passedTests++;
				console.log( 'PASSED: ' + item.title );
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

cases.forEach(function(item) {
	if (typeof item == 'object') {
		switch(item.type) {
			case 'article':
				//processArticle(item);
				break;
			case 'test':
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

console.log( "==========================================================");
console.log( "SUMMARY: ");
console.log( passedTests + " passed");
console.log( failParseTests + " parse failures");
console.log( failTreeTests + " tree build failures");
console.log( failOutputTests + " output differences");
console.log( "\n" + (failParseTests + failTreeTests + failOutputTests) + " total failures");
console.log( "==========================================================");

})();
