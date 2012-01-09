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
	TokenTransformManager    = require('./mediawiki.TokenTransformManager.js'),
	QuoteTransformer            = require('./ext.core.QuoteTransformer.js').QuoteTransformer,
	Cite                        = require('./ext.Cite.js').Cite,
	FauxHTML5                   = require('./mediawiki.HTML5TreeBuilder.node.js').FauxHTML5,
	DOMPostProcessor            = require('./mediawiki.DOMPostProcessor.js').DOMPostProcessor,
	DOMConverter                = require('./mediawiki.DOMConverter.js').DOMConverter;

function ParserPipeline( env ) {
	// Set up a simple parser pipeline.

	// XXX: create a full-fledged environment
	if ( !env ) {
		this.env = {};
	} else {
		this.env = env;
	}

	// Create an input pipeline for the given input (for now fixed to
	// text/wiki).
	this.inputPipeline = this.makeInputPipeline( 'text/wiki', {} );


	this.tokenPostProcessor = new TokenTransformManager.SyncTokenTransformManager ( env );
	this.tokenPostProcessor.listenForTokensFrom ( this.inputPipeline.last );


	// Add token transformations..
	var qt = new QuoteTransformer( this.tokenPostProcessor );

	//var citeExtension = new Cite( this.tokenTransformer );


	/**
	* The tree builder creates a DOM tree from the token soup emitted from
	* the TokenTransformDispatcher.
	*/
	this.treeBuilder = new FauxHTML5.TreeBuilder();
	this.treeBuilder.listenForTokensFrom( this.tokenPostProcessor );

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

ParserPipeline.prototype.makeInputPipeline = function ( inputType, args ) {
	if ( inputType === 'text/wiki' ) {
		var wikiTokenizer = new PegTokenizer();

		/**
		* Token stream transformations.
		* This is where all the wiki-specific functionality is implemented.
		* See https://www.mediawiki.org/wiki/Future/Parser_development/Token_stream_transformations
		*/
		var tokenPreProcessor = new TokenTransformManager.SyncTokenTransformManager ( this.env );
		tokenPreProcessor.listenForTokensFrom ( wikiTokenizer );

		var tokenExpander = new TokenTransformManager.AsyncTokenTransformManager (
				this.makeInputPipeline.bind( this ), args, this.env );
		tokenExpander.listenForTokensFrom ( tokenPreProcessor );
		
		return { first: wikiTokenizer, last: tokenExpander };
	} else {
		throw "ParserPipeline.makeInputPipeline: Unsupported input type " + inputType;
	}
}

ParserPipeline.prototype.parse = function ( text ) {
	// Set the pipeline in motion by feeding the tokenizer
	this.inputPipeline.first.tokenize( text );
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
