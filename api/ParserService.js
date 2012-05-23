/**
 * A very basic parser / serializer web service.
 */

var express = require('express'),
	html5 = require('html5');

var mp = '../modules/parser/';

var ParserPipelineFactory = require(mp + 'mediawiki.parser.js').ParserPipelineFactory,
	ParserEnv = require(mp + 'mediawiki.parser.environment.js').MWParserEnvironment,
	WikitextSerializer = require(mp + 'mediawiki.WikitextSerializer.js').WikitextSerializer;

var env = new ParserEnv( { 
	// fetch templates from enwiki for now..
	wgScript: 'http://en.wikipedia.org/w',
	// stay within the 'proxied' content, so that we can click around
	wgScriptPath: '', //http://en.wikipedia.org/wiki', 
	wgScriptExtension: '.php',
	// XXX: add options for this!
	wgUploadPath: 'http://upload.wikimedia.org/wikipedia/commons',
	fetchTemplates: true,
	// enable/disable debug output using this switch	
	debug: false,
	trace: false,
	maxDepth: 40
} );

var parserPipelineFactory = new ParserPipelineFactory( env );
//var parser = parserPipelineFactory.makePipeline( 'text/x-mediawiki/full' );


var app = express.createServer();
app.use(express.bodyParser());

app.get('/', function(req, res){
	res.write('<body>Usage: <ul><li>GET /title for the DOM');
	res.write('<li>POST a DOM as parameter "content" to /title for the wikitext</ul>');
	res.write('You can start exploring at <a href="/Main_Page">Main Page</a>. ');
	res.end('There are also forms for experiments: <a href="/_wikitext/">wikitext -&gt; html</a> and <a href="/_html/">HTML DOM -&gt; WikiText</a>');
});

var htmlSpecialChars = function ( s ) {
	return s.replace(/&/g,'&amp;')
		.replace(/</g,'&lt;')
		.replace(/"/g,'&quot;')
		.replace(/'/g,'&#039;');
};

var textarea = function ( res, content ) {
	res.write('<form method=POST><textarea name="content" cols=90 rows=9>');
	res.write( ( content &&
					htmlSpecialChars( content) ) ||
			'');
	res.write('</textarea><br><input type="submit"></form>');
};



/**
 * Form-based HTML DOM -> wikitext interface for manual testing
 */
app.get(/\/_html\/(.*)/, function(req, res){
	env.pageName = req.params[0];
	res.setHeader('Content-type', 'text/html; charset=UTF-8');
	res.write( "Your HTML DOM:" );
	textarea( res );
	res.end('');
});
app.post(/\/_html\/(.*)/, function(req, res){
	env.pageName = req.params[0];
	res.setHeader('Content-type', 'text/html; charset=UTF-8');
	var p = new html5.Parser();
	p.parse( '<html><body>' + req.body.content + '</body></html>' );
	res.write('<pre style="background-color: #efefef">');
	new WikitextSerializer({env: env}).serializeDOM( 
		p.tree.document.childNodes[0].childNodes[1], 
		function( c ) {
			res.write( htmlSpecialChars( c ) );
		});
	res.write('</pre>');
	res.write( "<hr>Your HTML DOM:" );
	textarea( res, req.body.content );
	res.end('');
});

/**
 * Form-based wikitext -> HTML DOM interface for manual testing
 */
app.get(/\/_wikitext\/(.*)/, function(req, res){
	env.pageName = req.params[0];
	res.setHeader('Content-type', 'text/html; charset=UTF-8');
	res.write( "Your wikitext:" );
	textarea( res );
	res.end('');
});
app.post(/\/_wikitext\/(.*)/, function(req, res){
	env.pageName = req.params[0];
	res.setHeader('Content-type', 'text/html; charset=UTF-8');
	var parser = parserPipelineFactory.makePipeline( 'text/x-mediawiki/full' );
	parser.on('document', function ( document ) {
		res.write(document.body.innerHTML);
		//res.write('<form method=POST><input name="content"></form>');
		//res.end("hello world\n" + req.method + ' ' + req.params.title);
		res.write( "<hr>Your wikitext:" );
		textarea( res, req.body.content );
		res.end('');
	});
	try {
		res.setHeader('Content-type', 'text/html; charset=UTF-8');
		console.log('starting parsing of ' + req.params[0]);
		// FIXME: This does not handle includes or templates correctly
		parser.process( req.body.content );
	} catch (e) {
		console.log( e );
		res.write( e );
	}
});

/**
 * Regular article parsing
 */
app.get(/\/(.*)/, function(req, res){
	env.pageName = req.params[0];
	if ( env.pageName === 'favicon.ico' ) {
		res.end( 'no favicon yet..');
		return;
	}
	var parser = parserPipelineFactory.makePipeline( 'text/x-mediawiki/full' );
	parser.on('document', function ( document ) {
		res.end(document.body.innerHTML);
		//res.write('<form method=POST><input name="content"></form>');
		//res.end("hello world\n" + req.method + ' ' + req.params.title);
	});
	try {
		res.setHeader('Content-type', 'text/html; charset=UTF-8');
		console.log('starting parsing of ' + req.params[0]);
		// FIXME: This does not handle includes or templates correctly
		parser.process('{{:' + req.params[0] + '}}' );
	} catch (e) {
		console.log( e );
		res.end( e );
		textarea( res, req.body.content );
	}
});

/**
 * Regular article serialization using POST
 */
app.post(/\/(.*)/, function(req, res){
	env.pageName = req.params[0];
	res.setHeader('Content-type', 'text/plain; charset=UTF-8');
	var p = new html5.Parser();
	p.parse( req.body.content );
	new WikitextSerializer({env: env}).serializeDOM( 
		p.tree.document.childNodes[0].childNodes[1], 
		res.write.bind( res ) );
	res.end('');
});

module.exports = app;
