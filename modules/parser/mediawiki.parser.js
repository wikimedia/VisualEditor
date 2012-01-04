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

	/**
	* Token stream transformations.
	* This is where all the wiki-specific functionality is implemented.
	* See https://www.mediawiki.org/wiki/Future/Parser_development/Token_stream_transformations
	*/
	this.tokenTransformer = new TokenTransformDispatcher ();

	// Add token transformations..
	var qt = new QuoteTransformer();
	qt.register(this.tokenTransformer);

	//var citeExtension = new Cite();
	//citeExtension.register(this.tokenDispatcher);

	this.tokenTransformer.listenForTokensFrom( this.wikiTokenizer );

	/**
	* The tree builder creates a DOM tree from the token soup emitted from
	* the TokenTransformDispatcher.
	*/
	this.treeBuilder = new FauxHTML5.TreeBuilder();
	this.treeBuilder.listenForTokensFrom( this.tokenTransformer );

	/**
	* Final processing on the HTML DOM.
	*/

	// Generic DOM transformer.
	// This currently performs minor tree-dependent clean up like wrapping
	// plain text in paragraphs. For HTML output, it would also be configured
	// to perform more aggressive nesting cleanup.
	this.postProcessor = new DOMPostProcessor();
	this.postProcessor.listenForDocumentFrom( this.treeBuilder ); 


	/** 
	* Conversion from HTML DOM to WikiDOM.  This is not needed if plain HTML
	* DOM output is desired, so it should only be registered to the
	* DOMPostProcessor 'document' event if WikiDom output is requested. We
	* could emit events for 'dom', 'wikidom', 'html' and so on, but only
	* actually set up the needed pipeline stages if a listener is registered.
	* Overriding the addListener method should make this possible.
	*/
	this.DOMConverter = new DOMConverter();


	// Lame hack for now, see above for an idea for the external async
	// interface and pipeline setup
	this.postProcessor.addListener( 'document', this.setDocumentProperty.bind( this ) );
}

ParserPipeline.prototype.parse = function ( text ) {
	// Set the pipeline in motion by feeding the tokenizer
	this.wikiTokenizer.tokenize( text );
};

// XXX: Lame hack: set document property. Instead, emit events
// and convert parser tests etc to listen on it! See comments above for ideas.
ParserPipeline.prototype.setDocumentProperty = function ( document ) {
	this.document = document;
};


// XXX: remove JSON serialization here, that should only be performed when
// needed.
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
