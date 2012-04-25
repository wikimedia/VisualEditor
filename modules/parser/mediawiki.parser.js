/**
 * This module assembles parser pipelines from parser stages with
 * asynchronous communnication between stages based on events. Apart from the
 * default pipeline which converts WikiText to HTML DOM, it also provides
 * sub-pipelines for the processing of template transclusions.
 *
 * See http://www.mediawiki.org/wiki/Parsoid and 
 * http://www.mediawiki.org/wiki/Parsoid/Token_stream_transformations
 * for illustrations of the pipeline architecture.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * @author Neil Kandalgaonkar <neilk@wikimedia.org>
 */

// make this global for now
// XXX: figure out a way to get away without a global for PEG actions!
$ = require('jquery');
var events = require( 'events' );

var fs = require('fs'),
	path = require('path'),
	PegTokenizer                = require('./mediawiki.tokenizer.peg.js').PegTokenizer,
	TokenTransformManager       = require('./mediawiki.TokenTransformManager.js'),
	SyncTokenTransformManager	= TokenTransformManager.SyncTokenTransformManager,
	AsyncTokenTransformManager	= TokenTransformManager.AsyncTokenTransformManager,

	NoIncludeOnly				= require('./ext.core.NoIncludeOnly.js'),
	IncludeOnly					= NoIncludeOnly.IncludeOnly,
	NoInclude					= NoIncludeOnly.NoInclude,
	OnlyInclude					= NoIncludeOnly.OnlyInclude,
	QuoteTransformer            = require('./ext.core.QuoteTransformer.js').QuoteTransformer,
	PostExpandParagraphHandler  = require('./ext.core.PostExpandParagraphHandler.js')
																.PostExpandParagraphHandler,
	Sanitizer                   = require('./ext.core.Sanitizer.js').Sanitizer,
	TemplateHandler             = require('./ext.core.TemplateHandler.js').TemplateHandler,
	AttributeExpander            = require('./ext.core.AttributeExpander.js').AttributeExpander,
	LinkHandler                 = require('./ext.core.LinkHandler.js'),
	WikiLinkHandler				= LinkHandler.WikiLinkHandler,
	ExternalLinkHandler			= LinkHandler.ExternalLinkHandler,
	Cite                        = require('./ext.Cite.js').Cite,
	BehaviorSwitchHandler       = require('./ext.core.BehaviorSwitchHandler.js').BehaviorSwitchHandler,
	TreeBuilder                 = require('./mediawiki.HTML5TreeBuilder.node.js')
													.FauxHTML5.TreeBuilder,
	DOMPostProcessor            = require('./mediawiki.DOMPostProcessor.js').DOMPostProcessor,
	DOMConverter                = require('./mediawiki.DOMConverter.js').DOMConverter,
	ConvertDOMToLM              = require('./mediawiki.LinearModelConverter.js').ConvertDOMToLM;


function ParserPipelineFactory ( env ) {
	this.pipelineCache = {};
	this.env = env;
}

/** 
 * Recipe for parser pipelines and -subpipelines, depending on input types.
 *
 * Token stream transformations to register by type and per phase. The
 * possible ranks for individual transformation registrations are [0,1)
 * (excluding 1.0) for sync01, [1,2) for async12 and [2,3) for sync23.
 *
 * Should perhaps be moved to mediawiki.parser.environment.js, so that all
 * configuration can be found in a single place.
 */
ParserPipelineFactory.prototype.recipes = {
	// The full wikitext pipeline
	'text/wiki/full': [
		// Input pipeline including the tokenizer
		'text/wiki',
		// Final synchronous token transforms and DOM building / processing
		'tokens/expanded'
	],

	// A pipeline from wikitext to expanded tokens. The input pipeline for
	// wikitext.
	'text/wiki': [
		[ PegTokenizer, [] ],
		'tokens/wiki'
	],

	// Synchronous per-input and async token stream transformations. Produces
	// a fully expanded token stream ready for consumption by the
	// tokens/expanded pipeline.
	'tokens/wiki': [
		// Synchronous in-order per input
		[
			SyncTokenTransformManager, 
			[ 1, 'tokens/wiki' ],
			[ 
				OnlyInclude,
				IncludeOnly, 
				NoInclude,
				BehaviorSwitchHandler
				// Insert TokenCollectors for extensions here (don't expand
				// templates in extension contents); wrap collected tokens in
				// special extension token.
				/* Extension1, */
				/* Extension2, */
			]
		],
		/* 
		* Asynchronous out-of-order per input. Each async transform can only
		* operate on a single input token, but can emit multiple output
		* tokens. If multiple tokens need to be collected per-input, then a
		* separate collection transform in sync01 can be used to wrap the
		* collected tokens into a single one later processed in an async12
		* transform.
		*/
		[
			AsyncTokenTransformManager,
			[ 2, 'tokens/wiki' ],
			[ 
				TemplateHandler,
				// Expand attributes after templates to avoid expanding unused branches
				AttributeExpander,
				WikiLinkHandler,
				ExternalLinkHandler
				/* ExtensionHandler1, */
				/* ExtensionHandler2, */
			]
		]
	],

	// Final stages of main pipeline, operating on fully expanded tokens of
	// potentially mixed origin.
	'tokens/expanded': [
		// Synchronous in-order on fully expanded token stream (including
		// expanded templates etc). In order to support mixed input (from
		// wikitext and plain HTML, say) all applicable transforms need to be
		// included here. Input-specific token types avoid any runtime
		// overhead for unused transforms.
		[
			SyncTokenTransformManager,
			[ 3, 'tokens/expanded' ],
			[ 
				// text/wiki-specific tokens
				QuoteTransformer, 
				PostExpandParagraphHandler,
				/* Cite, */
				/* ListHandler, */
				Sanitizer 
			]
		],

		// Build a tree out of the fully processed token stream
		[ TreeBuilder, [] ],

		/**
		* Final processing on the HTML DOM.
		*/

		/* Generic DOM transformer.
		* This currently performs minor tree-dependent clean up like wrapping
		* plain text in paragraphs. For HTML output, it would also be configured
		* to perform more aggressive nesting cleanup.
		*/
		[ DOMPostProcessor, [] ]
	]
};

/**
 * Generic pipeline creation from the above recipes
 */
ParserPipelineFactory.prototype.makePipeline = function( type, isInclude, cacheType ) {
	var recipe = this.recipes[type];
	if ( ! recipe ) {
		console.trace();
		throw( 'Error while trying to construct pipeline for ' + type );
	}
	var stages = [];
	for ( var i = 0, l = recipe.length; i < l; i++ ) {
		// create the stage
		var stageData = recipe[i],
			stage;
		
		if ( stageData.constructor === String ) {
			// Points to another subpipeline, get it recursively
			stage = this.makePipeline( stageData, isInclude );
		} else {
			stage = Object.create( stageData[0].prototype );
			// call the constructor
			stageData[0].apply( stage, [ this.env, isInclude, this ].concat( stageData[1] ) );
			if ( stageData.length >= 3 ) {
				// Create (and implicitly register) transforms
				var transforms = stageData[2];
				for ( var t = 0; t < transforms.length; t++ ) {
					new transforms[t](stage , isInclude);
				}
			}
		}

		// connect with previous stage
		if ( i ) {
			stage.addListenersOn( stages[i-1] );
		}
		stages.push( stage );
	}
	//console.warn( 'stages' + stages + JSON.stringify( stages ) );
	return new ParserPipeline( 
			stages[0],
			stages[stages.length - 1],
			cacheType ? this.returnPipeline.bind( this, cacheType )
						: null
			);
};

/**
 * Get a subpipeline (not the top-level one) of a given type.
 *
 * Subpipelines are cached as they are frequently created.
 */
ParserPipelineFactory.prototype.getPipeline = function ( type, isInclude ) {
	// default to include
	if ( isInclude === undefined ) {
		isInclude = true;
	}
	var pipe, 
		cacheType = type;
	if ( ! isInclude ) {
		cacheType += '::noInclude';
	}
	if ( ! this.pipelineCache[cacheType] ) {
		this.pipelineCache[cacheType] = [];
	}
	if ( this.pipelineCache[cacheType].length ) {
		//console.warn( JSON.stringify( this.pipelineCache[cacheType] ));
		return this.pipelineCache[cacheType].pop();
	} else {
		return this.makePipeline( type, isInclude, cacheType );
	}
};

/**
 * Callback called by a pipeline at the end of its processing. Returns the
 * pipeline to the cache.
 */
ParserPipelineFactory.prototype.returnPipeline = function ( type, pipe ) {
	pipe.removeAllListeners( 'end' );
	pipe.removeAllListeners( 'chunk' );
	var cache = this.pipelineCache[type];
	if ( cache.length < 5 ) {
		cache.push( pipe );
	}
};


/******************** ParserPipeline ****************************/

/**
 * Wrap some stages into a pipeline. The last member of the pipeline is
 * supposed to emit events, while the first is supposed to support a process()
 * method that sets the pipeline in motion.
 */
function ParserPipeline ( first, last, returnToCacheCB ) {
	this.first = first;
	this.last = last;

	if ( returnToCacheCB ) {
		var self = this;
		this.returnToCacheCB = function () {
			returnToCacheCB( self );
		};
	
		// add a callback to return the pipeline back to the cache
		this.last.addListener( 'end', this.returnToCacheCB );
	}
}

/**
 * Feed input tokens to the first pipeline stage
 */
ParserPipeline.prototype.process = function(input, key) { 
	return this.first.process(input, key); 
};

/**
 * Set the frame on the last pipeline stage (normally the
 * AsyncTokenTransformManager).
 */
ParserPipeline.prototype.setFrame = function(frame, title, args) { 
	return this.last.setFrame(frame, title, args); 
};

/**
 * Register the first pipeline stage with the last stage from a separate pipeline
 */
ParserPipeline.prototype.addListenersOn = function(stage) { 
	return this.first.addListenersOn(stage);
};

// Forward the EventEmitter API to this.last
ParserPipeline.prototype.on = function (ev, cb) { 
	return this.last.on(ev, cb); 
};
ParserPipeline.prototype.once = function (ev, cb) { 
	return this.last.once(ev, cb); 
};
ParserPipeline.prototype.addListener = function(ev, cb) { 
	return this.last.addListener(ev, cb);
};
ParserPipeline.prototype.removeListener = function(ev, cb) { 
	return this.last.removeListener(ev, cb);
};
ParserPipeline.prototype.setMaxListeners = function(n) { 
	return this.last.setMaxListeners(n);
};
ParserPipeline.prototype.listeners = function(ev) { 
	return this.last.listeners(ev); 
};
ParserPipeline.prototype.removeAllListeners = function ( event ) {
	if ( event === 'end' ) {
		this.last.removeAllListeners('end');
		// now re-add the cache callback
		if ( this.returnToCacheCB ) {
			this.last.addListener( 'end', this.returnToCacheCB );
		}
	} else {
		return this.last.removeAllListeners( event );
	}
};



/********************* Old stuff ****************************/

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
function OldParserPipeline( first, last, returnToCacheCB ) {

	if ( ! inputType ) {
		// Actually the only one supported for now, but could also create
		// others for serialized tokens etc
		inputType = 'text/wiki';
	}
	this.inputType = inputType;


	// Pass in a full-fledged environment based on
	// mediawiki.parser.environment.js.
	if ( !env ) {
		this.env = {};
	} else {
		this.env = env;
	}

	// set up a sub-pipeline cache
	this.pipelineCache = {};
	this.pipelineCache[this.inputType] = { 
		'input-toplevel': [], 
		'input-include': [], 
		'attribute-include': [],
		'attribute-toplevel': [] 
	};

	// Create an input pipeline for the given input type.
	this.inputPipeline = this.makeInputPipeline ( inputType, {}, false );

	// Mark this pipeline as the top-level input pipeline, so that it is not
	// cached and its listeners removed
	this.inputPipeline.atTopLevel = true;
	this.inputPipeline.last.atTopLevel = true;


	this.tokenPostProcessor = new TokenTransformManager
					.SyncTokenTransformManager ( env, inputType, 3.0, false );
	this.tokenPostProcessor.listenForTokensFrom ( this.inputPipeline );


	// Add token transformations..
	this._addTransformers( 'tokens/expanded', 'sync23', this.tokenPostProcessor, false );

	/**
	* The tree builder creates a DOM tree from the token soup emitted from
	* the TokenTransformDispatcher.
	*/
	this.treeBuilder = new FauxHTML5.TreeBuilder( this.env );
	this.treeBuilder.listenForTokensFrom( this.tokenPostProcessor );
	//this.tokenPostProcessor.on('chunk', function( c ) {
	//	console.warn( JSON.stringify( c, null, 2 ));
	//} );

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


	// Lame version for now, see above for an idea for the external async
	// interface and pipeline setup
	this.postProcessor.addListener( 'document', this.forwardDocument.bind( this ) );


}

// Inherit from EventEmitter
OldParserPipeline.prototype = new events.EventEmitter();
OldParserPipeline.prototype.constructor = OldParserPipeline;


/**
 * Add all transformers to a token transform manager for a given input type
 * and phase.
 */
OldParserPipeline.prototype._addTransformers = function ( type, phase, manager, isInclude ) 
{
	var transformers;
	try {
		transformers = this._transformers[type][phase];
	} catch ( e ) {
		console.warn( 'Error while looking for token transformers for ' + 
				type + ' and phase ' + phase );
		transformers = [];
	}
	for ( var i = 0, l = transformers.length; i < l; i++ ) {
		new transformers[i]( manager, isInclude );
	}
};


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
OldParserPipeline.prototype.makeInputPipeline = function ( inputType, args, isInclude ) {
	var pipelinePart = isInclude ? 'input-include' : 'input-toplevel';
	switch ( inputType ) {
		case 'text/wiki':
			//console.warn( 'makeInputPipeline ' + JSON.stringify( args ) );
			if ( this.pipelineCache['text/wiki'][pipelinePart].length ) {
				var pipe = this.pipelineCache['text/wiki'][pipelinePart].pop();
				pipe.last.args = args;
				return pipe;
			} else {
				var wikiTokenizer = new PegTokenizer( this.env, isInclude );

				/**
				* Token stream transformations.
				* This is where all the wiki-specific functionality is implemented.
				* See
				* https://www.mediawiki.org/wiki/Future/Parser_development/Token_stream_transformations
				*/
				var tokenPreProcessor = new TokenTransformManager
								.SyncTokenTransformManager ( this.env, 'text/wiki', 1, isInclude );
				tokenPreProcessor.listenForTokensFrom ( wikiTokenizer );

				this._addTransformers( 'text/wiki', 'sync01', 
						tokenPreProcessor, isInclude );


				var tokenExpander = new TokenTransformManager.AsyncTokenTransformManager (
							{
								'input': this.makeInputPipeline.bind( this ),
								'attributes': this.makeAttributePipeline.bind( this )
							},
							args, this.env, inputType, 2.0, isInclude
						);

				// Register template expansion extension
				this._addTransformers( 'text/wiki', 'async12', 
						tokenExpander, isInclude );

				tokenExpander.listenForTokensFrom ( tokenPreProcessor );
				// XXX: hack.
				tokenExpander.inputType = inputType;
				tokenPreProcessor.inputType = inputType;
			
				return new CachedTokenPipeline( 
						this.cachePipeline.bind( this, 'text/wiki', pipelinePart ),
						wikiTokenizer,
						tokenExpander,
						isInclude
						);
			}
			break;

		default:
			console.trace();
			throw "OldParserPipeline.makeInputPipeline: Unsupported input type " + inputType;
	}
};



/**
 * Factory for attribute transformations, with input type implicit in the
 * environment.
 */
OldParserPipeline.prototype.makeAttributePipeline = function ( inputType, args, isInclude ) {
	var pipelinePart = isInclude ? 'attribute-include' : 'attribute-toplevel';
	//console.warn( 'makeAttributePipeline: ' + pipelinePart);
	if ( this.pipelineCache[inputType][pipelinePart].length ) {
		var pipe = this.pipelineCache[inputType][pipelinePart].pop();
		pipe.last.args = args;
		//console.warn( 'from cache' + JSON.stringify( pipe.last.transformers, null, 2 ) );
		return pipe;
	} else {
		/**
		* Token stream transformations.
		* This is where all the wiki-specific functionality is implemented.
		* See https://www.mediawiki.org/wiki/Future/Parser_development/Token_stream_transformations
		*/
		var tokenPreProcessor = new TokenTransformManager
					.SyncTokenTransformManager ( this.env, inputType, 1, isInclude );

		this._addTransformers( inputType, 'sync01', tokenPreProcessor, isInclude );

		new NoInclude( tokenPreProcessor );

		var tokenExpander = new TokenTransformManager.AsyncTokenTransformManager (
				{
					'input': this.makeInputPipeline.bind( this ),
					'attributes': this.makeAttributePipeline.bind( this )
				},
				args, this.env, inputType, 2, isInclude
				);
		// Add token transformers
		this._addTransformers( 'text/wiki', 'async12', 
				tokenExpander, isInclude );

		tokenExpander.listenForTokensFrom ( tokenPreProcessor );

		//console.warn( 'new pipe' + JSON.stringify( tokenExpander.transformers, null, 2 ) );
		return new CachedTokenPipeline( 
				this.cachePipeline.bind( this, inputType, pipelinePart ),
				tokenPreProcessor,
				tokenExpander,
				isInclude
				);
	}
};

OldParserPipeline.prototype.cachePipeline = function ( inputType, pipelinePart, pipe ) {
	var cache = this.pipelineCache[inputType][pipelinePart];
	if ( cache && cache.length < 5 ) {
		cache.push( pipe );
	}
};



/**
 * Feed the parser pipeline with some input, the output is emitted in events.
 *
 * @method
 * @param {Mixed} All arguments are passed through to the underlying input
 * pipeline's first element's process() method. For a wikitext pipeline (the
 * default), this would be the wikitext to tokenize:
 * pipeline.parse ( wikiText );
 */
OldParserPipeline.prototype.parse = function ( ) {
	// Set the pipeline in motion by feeding the first element with the given
	// arguments.
	this.inputPipeline.process.apply( this.inputPipeline , arguments );
};

// Just bubble up the document event from the pipeline
OldParserPipeline.prototype.forwardDocument = function ( document ) {
	this.emit( 'document', document );
};


// XXX: remove JSON serialization here, that should only be performed when
// needed (and normally without pretty-printing).
OldParserPipeline.prototype.getWikiDom = function ( document ) {
	return JSON.stringify(
				this.DOMConverter.HTMLtoWiki( document.body ),
				null,
				2
			);
};

OldParserPipeline.prototype.getLinearModel = function( document ) {
	return JSON.stringify( ConvertDOMToLM( document.body ), null, 2 );
};





if (typeof module == "object") {
	module.exports.ParserPipeline = ParserPipeline;
	module.exports.ParserPipelineFactory = ParserPipelineFactory;
}
