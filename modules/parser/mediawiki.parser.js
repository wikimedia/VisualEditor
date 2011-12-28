/**
 *
 * Simple parser class. Should have lots of options for observing parse stages (or, use events).
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * @author Neil Kandalgaonkar <neilk@wikimedia.org>
 */

var fs = require('fs'),
	path = require('path'),
	PegTokenizer                = require('./mediawiki.tokenizer.peg.js').PegTokenizer,
	TokenTransformDispatcher    = require('./mediawiki.TokenTransformDispatcher.js').TokenTransformDispatcher,
	DOMPostProcessor            = require('./mediawiki.DOMPostProcessor.js').DOMPostProcessor,
	DOMConverter                = require('./mediawiki.DOMConverter.js').DOMConverter,
	QuoteTransformer            = require('./ext.core.QuoteTransformer.js').QuoteTransformer,
	Cite                        = require('./ext.Cite.js').Cite,
	MWRefTagHook                = require('./ext.cite.taghook.ref.js').MWRefTagHook,
	FauxHTML5                   = require('./mediawiki.HTML5TreeBuilder.node.js').FauxHTML5;

function ParseThingy( config ) {
	// XXX: move the actual parsing to separate method, only perform pipeline
	// setup in the constructor!

	if ( !config ) {
		config = {};
	}

	if ( !config.peg ) {
		// n.b. __dirname is relative to the module.
		var pegSrcPath = path.join( __dirname, 'pegTokenizer.pegjs.txt' );
		config.peg = fs.readFileSync( pegSrcPath, 'utf8' );
	}


	this.wikiTokenizer = new PegTokenizer(config.parserEnv, config.peg);

	this.postProcessor = new DOMPostProcessor();

	this.DOMConverter = new DOMConverter();

	var pthingy = this;

	// Set up the TokenTransformDispatcher with a callback for the remaining
	// processing.
	// XXX: convert to event listener (listening for token chunks from
	// tokenizer) and event emitter (emitting token chunks)
	// XXX: A parser environment and configuration will be added here to the
	// token transform dispatcher.
	this.tokenDispatcher = new TokenTransformDispatcher ( function ( tokens ) {
		
		//console.log("TOKENS: " + JSON.stringify(tokens, null, 2));
		
		// Create a new tree builder, which also creates a new document.  
		// XXX: implicitly clean up old state after processing end token, so
		// that we can reuse the tree builder.
		// XXX: convert to event listener listening for token chunks from the
		// token transformer and and emitting an additional 'done' event after
		// processing the 'end' token.
		var treeBuilder = new FauxHTML5.TreeBuilder();

		// Build a DOM tree from tokens using the HTML tree builder/parser.
		// XXX: convert to event listener (token chunks from
		// TokenTransformDispatcher) and event emitter (DOM tree to
		// DOMPostProcessor)
		pthingy.buildTree( tokens, treeBuilder );
		
		// Perform post-processing on DOM.
		// XXX: convert to event listener (listening on treeBuilder 'finished'
		// event)
		pthingy.postProcessor.doPostProcess(treeBuilder.document);

		// XXX: emit event with result
		pthingy.getWikiDom = function() {
			return JSON.stringify(
				pthingy.DOMConverter.HTMLtoWiki( treeBuilder.document.body ),
				null, 
				2
			) + "\n";
		};

	});

	// Add token transformations..
	var qt = new QuoteTransformer();
	qt.register(this.tokenDispatcher);

	var citeExtension = new Cite();
	citeExtension.register(this.tokenDispatcher);

}


ParseThingy.prototype = {
	//XXX: This will be moved to the treeBuilder event listener callback,
	//where it will process each received chunk.
	buildTree: function ( tokens, treeBuilder ) {
		// push a body element, just to be sure to have one
		treeBuilder.processToken({type: 'TAG', name: 'body'});
		// Process all tokens
		for (var i = 0, length = tokens.length; i < length; i++) {
			treeBuilder.processToken(tokens[i]);
		}
		
		// FIXME HACK: For some reason the end token is not processed sometimes,
		// which normally fixes the body reference up.
		treeBuilder.document.body = treeBuilder.parser
			.document.getElementsByTagName('body')[0];

	}
};

if (typeof module == "object") {
	module.exports.ParseThingy = ParseThingy;
}

