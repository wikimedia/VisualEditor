/**
 *
 * Simple parser class. Should have lots of options for observing parse stages (or, use events).
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * @author Neil Kandalgaonkar <neilk@wikimedia.org>
 */

// make this global for now
// XXX: figure out a way to get away without a global for PEG actions!
$ = require('jquery');

var fs = require('fs'),
	path = require('path'),
	PegTokenizer                = require('./mediawiki.tokenizer.peg.js').PegTokenizer,
	TokenTransformDispatcher    = require('./mediawiki.TokenTransformDispatcher.js').TokenTransformDispatcher,
	QuoteTransformer            = require('./ext.core.QuoteTransformer.js').QuoteTransformer,
	Cite                        = require('./ext.Cite.js').Cite,
	FauxHTML5                   = require('./mediawiki.HTML5TreeBuilder.node.js').FauxHTML5,
	DOMPostProcessor            = require('./mediawiki.DOMPostProcessor.js').DOMPostProcessor,
	DOMConverter                = require('./mediawiki.DOMConverter.js').DOMConverter;

function ParserPipeline( config ) {
	// Set up a simple parser pipeline.

	if ( !config ) {
		config = {};
	}

	this.wikiTokenizer = new PegTokenizer();

	this.tokenDispatcher = new TokenTransformDispatcher ();

	// Add token transformations..
	var qt = new QuoteTransformer();
	qt.register(this.tokenDispatcher);

	//var citeExtension = new Cite();
	//citeExtension.register(this.tokenDispatcher);

	this.tokenDispatcher.subscribeToTokenEmitter( this.wikiTokenizer );

	// Create a new tree builder, which also creates a new document.  
	// XXX: implicitly clean up old state after processing end token, so
	// that we can reuse the tree builder.
	// XXX: convert to event listener listening for token chunks from the
	// token transformer and and emitting an additional 'done' event after
	// processing the 'end' token.
	this.treeBuilder = new FauxHTML5.TreeBuilder();
	this.treeBuilder.subscribeToTokenEmitter( this.tokenDispatcher );

	// Prepare these two, but only call them from parse and getWikiDom for
	// now. These will be called in a callback later, when the full pipeline
	// is used asynchronously.
	this.postProcessor = new DOMPostProcessor();

	this.DOMConverter = new DOMConverter();
}

ParserPipeline.prototype.parse = function ( text ) {
	// Set the pipeline in motion by feeding the tokenizer
	this.wikiTokenizer.tokenize( text );

	// XXX: Convert parse to an async pipeline as well!
	// The remaining processing below will have to happen in a callback,
	// triggered on the treeBuilder 'end' event, followed by an event emission
	// or callback calling instead of returning.
	this.document = this.treeBuilder.document;

	//console.log(this.document.body.innerHTML);

	// Perform synchronous post-processing on DOM.
	// XXX: convert to event listener (listening on treeBuilder 'end'
	// event)
	this.postProcessor.doPostProcess( this.document );
};

ParserPipeline.prototype.getWikiDom = function () {
	return JSON.stringify(
				this.DOMConverter.HTMLtoWiki( this.document.body ),
				null,
				2
			);
};


if (typeof module == "object") {
	module.exports.ParserPipeline = ParserPipeline;
}
