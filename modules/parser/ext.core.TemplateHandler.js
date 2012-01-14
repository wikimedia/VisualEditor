/**
 * Template and template argument handling, first cut.
 *
 * AsyncTokenTransformManager objects provide preprocessor-frame-like
 * functionality once template args etc are fully expanded, and isolate
 * individual transforms from concurrency issues. Template argument expansion
 * is performed using a structure managed in this extension.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * @author Brion Vibber <brion@wikimedia.org>
 */
var $ = require('jquery'),
	AttributeTransformManager = require('./mediawiki.TokenTransformManager.js').AttributeTransformManager;


function TemplateHandler ( manager ) {
	this.reset();
	this.register( manager );
}

TemplateHandler.prototype.reset = function () {
	this.resultTokens = [];
};

// constants
TemplateHandler.prototype.rank = 1.1;

TemplateHandler.prototype.register = function ( manager ) {
	this.manager = manager;
	// Register for template and templatearg tag tokens
	manager.addTransform( this.onTemplate.bind(this), 
			this.rank, 'tag', 'template' );
	manager.addTransform( this.onTemplateArg.bind(this), 
			this.rank, 'tag', 'templatearg' );

	// Reset internal state when the parser pipeline is done
	manager.addTransform( this.reset.bind(this), 
			this.rank, 'end' );
};


/** 
 * Main template token handler
 *
 * Expands target and arguments (both keys and values) and either directly
 * calls or sets up the callback to _expandTemplate, which then fetches and
 * processes the template.
 */
TemplateHandler.prototype.onTemplate = function ( token, cb ) {
	//console.log('onTemplate! ' + JSON.stringify( token, null, 2 ) );

	this.parentCB = cb;
	
	// check for 'subst:'
	// check for variable magic names
	// check for msg, msgnw, raw magics
	// check for parser functions

	// create a new temporary frame for argument and title expansions
	var templateTokenTransformData = {
			args: {},
			manager: this.manager,
			outstanding: 1, // Avoid premature finish
			cb: cb,
			origToken: token,
			isAsync: false
		},
		transformCB,
		i = 0,
		kvs = [],
		res,
		kv;

	var attributes = [[[{ type: 'TEXT', value: '' }] , token.target ]]
			.concat( token.orderedArgs );

	//console.log( 'before AttributeTransformManager: ' + JSON.stringify( attributes, null, 2 ) );
	new AttributeTransformManager( 
				this.manager, 
				this._returnAttributes.bind( this, templateTokenTransformData ) 
			).process( attributes );

	// Unblock finish
	templateTokenTransformData.outstanding--;
	if ( templateTokenTransformData.outstanding === 0 ) {
		//console.log( 'direct call');
		return this._expandTemplate ( templateTokenTransformData );
	} else {
		templateTokenTransformData.isAsync = true;
		return { async: true };
	}
};

TemplateHandler.prototype._returnAttributes = function ( templateTokenTransformData, attributes ) {
	//console.log( 'TemplateHandler._returnAttributes: ' + JSON.stringify(attributes) );
	// Remove the target from the attributes
	templateTokenTransformData.target = attributes[0][1];
	attributes.shift();
	templateTokenTransformData.expandedArgs = attributes;
	if ( templateTokenTransformData.isAsync ) {
		this._expandTemplate ( templateTokenTransformData );
	}
}

/**
 * Fetch, tokenize and token-transform a template after all arguments and the
 * target were expanded in frame.
 */
TemplateHandler.prototype._expandTemplate = function ( templateTokenTransformData ) {
	//console.log('TemplateHandler.expandTemplate: ' +
	//		JSON.stringify( templateTokenTransformData, null, 2 ) );
	// First, check the target for loops
	var target = this.manager.env.normalizeTitle(
			this.manager.env.tokensToString( templateTokenTransformData.target )
		);
	if( this.manager.loopCheck.check( target ) ) {
		// Loop detected, abort!
		return {
			tokens: [
				{ 
					type: 'TEXT', 
					value: 'Template expansion loop detected!' 
				}
			]
		};
	}

	// Create a new nested transformation pipeline for the input type
	// (includes the tokenizer and synchronous stage-1 transforms for
	// 'text/wiki' input). 
	// Returned pipe (for now):
	// { first: tokenizer, last: AsyncTokenTransformManager }
	this.inputPipeline = this.manager.newChildPipeline( 
				this.manager.inputType || 'text/wiki', 
				templateTokenTransformData.expandedArgs,
				templateTokenTransformData.target
			);

	// Hook up the inputPipeline output events to call back our parentCB.
	this.inputPipeline.addListener( 'chunk', this._onChunk.bind ( this ) );
	this.inputPipeline.addListener( 'end', this._onEnd.bind ( this ) );
	

	// Resolve a possibly relative link
	var templateName = this.manager.env.resolveTitle( 
			target,
			'Template' 
		);
	this._fetchTemplateAndTitle( templateName, this._processTemplateAndTitle.bind( this ) );

	// Set up a pipeline:
	// fetch template source -> tokenizer 
	// getInputPipeline( inputType )
	//     normally tokenizer -> transforms 1/2
	//     encapsulation by default, generic de-encapsulation in phase 3
	//     { type: 'object', name: 'template', value: [tokens] }
	//     -> then un-wrap and replace with contents in phase 3 if for-viewing
	//        mode
	// -> TokenTransformDispatcher (phase 1/2 only, with frame passed in)
	// -> frame.cb( tokens )
	

	// XXX: notes from brion's mediawiki.parser.environment
	// resolve template name
	// load template w/ canonical name
	// load template w/ variant names
	// recursion depth check
	// fetch from DB or interwiki
	// infinte loop check

	// Always asynchronous..
	if ( this.isAsync ) {
		return {};
	} else {
		return this.result;
	}
};


/**
 * Convert AsyncTokenTransformManager output chunks to parent callbacks
 */
TemplateHandler.prototype._onChunk = function( chunk ) {
	// We encapsulate the output by default, so collect tokens here.
	this.resultTokens = this.resultTokens.concat( chunk );
};

/**
 * Handle the end event by calling our parentCB with notYetDone set to false.
 */
TemplateHandler.prototype._onEnd = function( ) {
	// Encapsulate the template in a single token, which contains all the
	// information needed for the editor.
	var res = this.resultTokens;
		/*
		[{
			type: 'TAG',
			name: 'div',
			attribs: [['data-source', 'template']],
			args: this.manager.args // Here, the editor needs wikitext.
		}].concat( 
					// XXX: Mark source in attribute on result tokens, so that
					// the visual editor can detect structures from templates!
					this.resultTokens, 
					[{ type: 'ENDTAG', name: 'div' }] 
				);
				*/
	//console.log( 'TemplateHandler._onEnd: ' + JSON.stringify( res, null, 2 ) );

	if ( this.isAsync ) {
		this.parentCB( res, false );
		this.reset();
	} else {
		this.result = { tokens: res };
		this.reset();
	}
};



/**
 * Process a fetched template source
 */
TemplateHandler.prototype._processTemplateAndTitle = function( src, title ) {
	// Feed the pipeline. XXX: Support different formats.
	//console.log( 'TemplateHandler._processTemplateAndTitle: ' + src );
	this.inputPipeline.process ( src );
};



/**
 * Fetch a template
 */
TemplateHandler.prototype._fetchTemplateAndTitle = function( title, callback ) {
	// @fixme normalize name?
	if (title in this.manager.env.pageCache) {
		// @fixme should this be forced to run on next event?
		callback( this.manager.env.pageCache[title], title );
	} else {
		// whee fun hack!
		//console.log(title);
		//console.log(this.manager.env.pageCache);
		$.ajax({
			url: this.manager.env.wgScriptPath + '/api' + this.manager.env.wgScriptExtension,
			data: {
				format: 'json',
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			titles: title
			},
			success: function(data, xhr) {
				var src = null, title = null;
				$.each(data.query.pages, function(i, page) {
					if (page.revisions && page.revisions.length) {
						src = page.revisions[0]['*'];
						title = page.title;
					}
				});
				if (typeof src !== 'string') {
					//console.log( 'Page ' + title + 'not found!' );
					callback( 'Page ' + title + ' not found' );
				} else {
					callback(src, title);
				}
			},
			error: function(msg) {
				//console.log( 'Page/template fetch failure for title ' + title );
				callback('Page/template fetch failure for title ' + title);
			},
			dataType: 'json',
			cache: false // @fixme caching, versions etc?
		}, 'json');
	}
};


/**
 * Expand template arguments with tokens from the containing frame.
 */
TemplateHandler.prototype.onTemplateArg = function ( token, cb, frame ) {
	var argName = token.attribs[0][1]; // XXX: do this properly!
	if ( argName in frame.args ) {
		// return tokens for argument
		return { tokens: frame.args[argName] };
	} else {
		if ( token.attribs.length > 1 ) {
			return token.attribs[1][1]; // default value, XXX: use key
		} else {
			return { token: { type: 'TEXT', value: '{{{' + argName + '}}}' } };
		}
	}
};


if (typeof module == "object") {
	module.exports.TemplateHandler = TemplateHandler;
}
