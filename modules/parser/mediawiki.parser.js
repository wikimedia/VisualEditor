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

/**
 * Set up a simple parser pipeline. There will be a single pipeline overall,
 * but there can be multiple sub-pipelines for template expansions etc, which
 * in turn differ by input type. The main input type will be fixed at
 * construction time though.
 *
 * @class
 * @constructor
 * @param {Object} Environment.
 */
function ParserPipeline( env, inputType ) {

	if ( ! inputType ) {
		// Actually the only one supported for now, but could also create
		// others for serialized tokens etc
		inputType = 'text/wiki';
	}


	// XXX: create a full-fledged environment based on
	// mediawiki.parser.environment.js.
	if ( !env ) {
		this.env = {};
	} else {
		this.env = env;
	}

	// Create an input pipeline for the given input type.
	this.inputPipeline = this.makeInputPipeline ( inputType );


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

	/* Generic DOM transformer.
	* This currently performs minor tree-dependent clean up like wrapping
	* plain text in paragraphs. For HTML output, it would also be configured
	* to perform more aggressive nesting cleanup.
	*/
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

/**
 * Factory method for the input (up to async token transforms / phase two)
 * parts of the parser pipeline.
 *
 * @method
 * @param {String} Input type. Try 'text/wiki'.
 * @param {Object} Expanded template arguments to pass to the
 * AsyncTokenTransformManager.
 * @returns {Object} { first: <first stage>, last: AsyncTokenTransformManager }
 * First stage is supposed to implement a process() function
 * that can accept all input at once. The wikitext tokenizer for example
 * accepts the wiki text this way. The last stage of the input pipeline is
 * always an AsyncTokenTransformManager, which emits its output in events.
 */
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
};


/**
 * Parse an input
 *
 * @method
 * @param {Mixed} All arguments are passed through to the underlying input
 * pipeline's first element's process() method. For a wikitext pipeline (the
 * default), this would be the wikitext to tokenize.
 */
ParserPipeline.prototype.parse = function ( ) {
	// Set the pipeline in motion by feeding the first element with the given
	// arguments.
	this.inputPipeline.first.process.apply( this.inputPipeline.first , arguments );
};

// XXX: Lame hack: set document property. Instead, emit events
// and convert parser tests etc to listen on it! See comments above for ideas.
ParserPipeline.prototype.setDocumentProperty = function ( document ) {
	this.document = document;
};


// XXX: remove JSON serialization here, that should only be performed when
// needed (and normally without pretty-printing).
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
