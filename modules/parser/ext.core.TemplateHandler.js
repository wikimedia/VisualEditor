/**
 * Template and template argument handling, first cut.
 *
 * AsyncTokenTransformManager objects provide preprocessor-frame-like
 * functionality once template args etc are fully expanded, and isolate
 * individual transforms from concurrency issues. Template expansion is
 * controlled using a tplExpandData structure created independently for each
 * handled template tag.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * @author Brion Vibber <brion@wikimedia.org>
 */
var $ = require('jquery'),
	request = require('request'),
	events = require('events'),
	qs = require('querystring'),
	ParserFunctions = require('./ext.core.ParserFunctions.js').ParserFunctions,
	AttributeTransformManager = require('./mediawiki.TokenTransformManager.js')
									.AttributeTransformManager,
	defines = require('./mediawiki.parser.defines.js');


function TemplateHandler ( manager ) {
	this.register( manager );
	this.parserFunctions = new ParserFunctions( manager );
}

// constants
TemplateHandler.prototype.rank = 1.1;

TemplateHandler.prototype.register = function ( manager ) {
	this.manager = manager;
	// Register for template and templatearg tag tokens
	manager.addTransform( this.onTemplate.bind(this), 
			this.rank, 'tag', 'template' );

	// Template argument expansion
	manager.addTransform( this.onTemplateArg.bind(this), 
			this.rank, 'tag', 'templatearg' );

};


/** 
 * Main template token handler
 *
 * Expands target and arguments (both keys and values) and either directly
 * calls or sets up the callback to _expandTemplate, which then fetches and
 * processes the template.
 */
TemplateHandler.prototype.onTemplate = function ( token, frame, cb ) {
	//console.warn('onTemplate! ' + JSON.stringify( token, null, 2 ) + 
	//		' args: ' + JSON.stringify( this.manager.args ));

	// expand argument keys, with callback set to next processing step
	// XXX: would likely be faster to do this in a tight loop here
	var atm = new AttributeTransformManager( 
				this.manager, 
				this._expandTemplate.bind( this, token, frame, cb )
			);
	cb( { async: true } );
	atm.processKeys( token.attribs );
};

/**
 * Create positional (number) keys for arguments without explicit keys
 */
TemplateHandler.prototype._nameArgs = function ( attribs ) {
	var n = 1,
		out = [];
	for ( var i = 0, l = attribs.length; i < l; i++ ) {
		// FIXME: Also check for whitespace-only named args!
		if ( ! attribs[i].k.length ) {
			out.push( new KV( n.toString(), attribs[i].v ) );
			n++;
		} else {
			out.push( attribs[i] );
		}
	}
	this.manager.env.dp( '_nameArgs: ', out );
	return out;
};

/**
 * Fetch, tokenize and token-transform a template after all arguments and the
 * target were expanded.
 */
TemplateHandler.prototype._expandTemplate = function ( token, frame, cb, attribs ) {
	//console.warn('TemplateHandler.expandTemplate: ' +
	//		JSON.stringify( tplExpandData, null, 2 ) );
	var target = attribs[0].k;

	
	if ( ! target ) {
		this.manager.env.ap( 'No target! ', attribs );
		console.trace();
	}

	// TODO:
	// check for 'subst:'
	// check for variable magic names
	// check for msg, msgnw, raw magics
	// check for parser functions

	// First, check the target for loops
	target = this.manager.env.tokensToString( target ).trim();

	//var args = this.manager.env.KVtoHash( tplExpandData.expandedArgs );

	// strip subst for now.
	target = target.replace( /^(safe)?subst:/, '' );

	// XXX: wrap attribs in object with .dict() and .named() methods,
	// and each member (key/value) into object with .tokens(), .dom() and
	// .wikitext() methods (subclass of Array)

	var prefix = target.split(':', 1)[0].toLowerCase().trim();
	if ( prefix && 'pf_' + prefix in this.parserFunctions ) {
		var pfAttribs = new Params( this.manager.env, attribs );
		pfAttribs[0] = new KV( target.substr( prefix.length + 1 ), [] );
		//this.manager.env.dp( 'func prefix/args: ', prefix,
		//		tplExpandData.expandedArgs,
		//		'unnamedArgs', tplExpandData.origToken.attribs,
		//		'funcArg:', funcArg
		//		);
		this.manager.env.dp( 'entering prefix', target, token  );
		this.parserFunctions[ 'pf_' + prefix ]
			( token, this.manager.frame, cb, pfAttribs );
		return;
	}
	this.manager.env.tp( 'template target: ' + target );

	// now normalize the target before template processing
	target = this.manager.env.normalizeTitle( target );

	

	// Resolve a possibly relative link
	var templateName = this.manager.env.resolveTitle( 
			target,
			'Template' 
		);

	var checkRes = this.manager.frame.loopAndDepthCheck( templateName, this.manager.env.maxDepth );
	if( checkRes ) {
		// Loop detected or depth limit exceeded, abort!
		res = [
				checkRes,
				new TagTk( 'a', [{k: 'href', v: target}] ),
				templateName,
				new EndTagTk( 'a' )
			];
		res.rank = this.manager.phaseEndRank;
		cb( { tokens: res } );
		return;
	}

	// XXX: notes from brion's mediawiki.parser.environment
	// resolve template name
	// load template w/ canonical name
	// load template w/ variant names (language variants)

	// For now, just fetch the template and pass the callback for further
	// processing along.
	this._fetchTemplateAndTitle( 
			templateName, 
			cb,
			this._processTemplateAndTitle.bind( this, token, frame, cb, templateName, attribs )
		);
};


/**
 * Process a fetched template source
 */
TemplateHandler.prototype._processTemplateAndTitle = function( token, frame, cb, name, attribs, src, type ) {
	// Get a nested transformation pipeline for the input type. The input
	// pipeline includes the tokenizer, synchronous stage-1 transforms for
	// 'text/wiki' input and asynchronous stage-2 transforms). 
	var pipeline = this.manager.pipeFactory.getPipeline( 
				type || 'text/x-mediawiki', true
			);

	pipeline.setFrame( this.manager.frame, name, attribs );

	// Hook up the inputPipeline output events to our handlers
	pipeline.addListener( 'chunk', this._onChunk.bind ( this, cb ) );
	pipeline.addListener( 'end', this._onEnd.bind ( this ) );
	// Feed the pipeline. XXX: Support different formats.
	this.manager.env.dp( 'TemplateHandler._processTemplateAndTitle', name, attribs );
	pipeline.process ( src, name );
};

/**
 * Handle chunk emitted from the input pipeline after feeding it a template
 */
TemplateHandler.prototype._onChunk = function( cb, chunk ) {
	// We encapsulate the output by default, so collect tokens here.
	chunk = this.manager.env.stripEOFTkfromTokens( chunk );
	this.manager.env.dp( 'TemplateHandler._onChunk', chunk );
	cb( { tokens: chunk, async: true } );
};

/**
 * Handle the end event emitted by the parser pipeline after fully processing
 * the template source.
 */
TemplateHandler.prototype._onEnd = function( token, frame, cb ) {
	this.manager.env.dp( 'TemplateHandler._onEnd' );
	cb( { tokens: [token] } );
};


/**
 * Fetch a template
 */
TemplateHandler.prototype._fetchTemplateAndTitle = function ( title, parentCB, cb ) {
	// @fixme normalize name?
	var self = this;
	if ( title in this.manager.env.pageCache ) {
		// XXX: store type too (and cache tokens/x-mediawiki)
		cb( self.manager.env.pageCache[title] /* , type */ );
	} else if ( ! this.manager.env.fetchTemplates ) {
		parentCB(  { tokens: [ 'Warning: Page/template fetching disabled, and no cache for ' + 
				title ] } );
	} else {
		
		// We are about to start an async request for a template
		this.manager.env.dp( 'Note: trying to fetch ', title );

		// Start a new request if none is outstanding
		//this.manager.env.dp( 'requestQueue: ', this.manager.env.requestQueue );
		if ( this.manager.env.requestQueue[title] === undefined ) {
			this.manager.env.tp( 'Note: Starting new request for ' + title );
			this.manager.env.requestQueue[title] = new TemplateRequest( this.manager, title );
		}
		// Append a listener to the request at the toplevel, but prepend at
		// lower levels to enforce depth-first processing
		if ( false && this.manager.isInclude ) {
			// prepend request: deal with requests from includes first
			this.manager.env.requestQueue[title]
				.listeners( 'src' ).unshift( cb );
		} else {
			// append request, process in document order
			this.manager.env.requestQueue[title]
				.listeners( 'src' ).push( cb );
		}
		parentCB ( { async: true } );
	}
};


/*********************** Template argument expansion *******************/

/**
 * Expand template arguments with tokens from the containing frame.
 */
TemplateHandler.prototype.onTemplateArg = function ( token, frame, cb ) {
	new AttributeTransformManager ( 
				this.manager, 
				this._returnArgAttributes.bind( this, token, cb, frame ) 
			).process( token.attribs.slice() );
};

TemplateHandler.prototype._returnArgAttributes = function ( token, cb, frame, attributes ) {
	//console.warn( '_returnArgAttributes: ' + JSON.stringify( attributes ));
	var argName = this.manager.env.tokensToString( attributes[0].k ).trim(),
		res,
		dict = this.manager.frame.args.named();
	this.manager.env.dp( 'args', argName /*, dict*/ );
	if ( argName in dict ) {
		// return tokens for argument
		//console.warn( 'templateArg found: ' + argName + 
		//		' vs. ' + JSON.stringify( this.manager.args ) ); 
		res = dict[argName];
		this.manager.env.dp( 'arg res:', res );
		if ( res.constructor === String ) {
			cb( { tokens: [res] } );
		} else {
			dict[argName].get({
				type: 'tokens/x-mediawiki/expanded',
				cb: function( res ) { cb ( { tokens: res } ); },
				asyncCB: cb
			});
		}
		return;
	} else {
		this.manager.env.dp( 'templateArg not found: ', argName
				/*' vs. ', dict */ );
		if ( attributes.length > 1 ) {
			res = attributes[1].v;
		} else {
			//console.warn('no default for ' + argName + JSON.stringify( attributes ));
			res = [ '{{{' + argName + '}}}' ];
		}
	}
	cb( { tokens: res } );
};


/***************** Template fetch request helper class ********/

function TemplateRequest ( manager, title ) {
	// Increase the number of maximum listeners a bit..
	this.setMaxListeners( 50000 );
	this.retries = 5;
	this.manager = manager;
	this.title = title;
	var url = manager.env.wgScript + '/api' + 
		manager.env.wgScriptExtension +
		'?' + 
		qs.stringify( {
			format: 'json',
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			titles: title
		} );
		//'?format=json&action=query&prop=revisions&rvprop=content&titles=' + title;

	this.requestOptions = {
		method: 'GET',
		followRedirect: true,
		url: url,
		headers: { 
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:9.0.1) ' +
							'Gecko/20100101 Firefox/9.0.1 Iceweasel/9.0.1' 
		} 
	};

	// Start the request
	request( this.requestOptions, this._handler.bind(this) ); 
}

// Inherit from EventEmitter
TemplateRequest.prototype = new events.EventEmitter();
TemplateRequest.prototype.constructor = TemplateRequest;

TemplateRequest.prototype._handler = function (error, response, body) {
	//console.warn( 'response for ' + title + ' :' + body + ':' );
	if(error) {
		this.manager.env.dp(error);	
		if ( this.retries ) {
			this.retries--;
			this.manager.env.tp( 'Retrying template request for ' + this.title );
			var self = this;
			// retry
			request( this.requestOptions, this._handler.bind(this) ); 
		} else {
			this.emit('src', 'Page/template fetch failure for title ' + this.title, 
					'text/x-mediawiki');
		}
	} else if(response.statusCode ==  200) {
		var src = '',
			data,
			normalizedTitle;
		try {
			//console.warn( 'body: ' + body );
			data = JSON.parse( body );
		} catch(e) {
			console.warn( "Error: while parsing result. Error was: " );
			console.warn( e );
			console.warn( "Response that didn't parse was:");
			console.warn( "------------------------------------------\n" + body );
			console.warn( "------------------------------------------" );
		}
		try {
			$.each( data.query.pages, function(i, page) {
				if (page.revisions && page.revisions.length) {
					src = page.revisions[0]['*'];
					normalizeTitle = page.title;
				}
			});
		} catch ( e2 ) {
			console.warn( 'Did not find page revisions in the returned body:' + body );
			src = '';
		}
		
		// check for #REDIRECT
		var redirMatch = src.match( /[\r\n\s]*#\s*redirect\s\[\[([^\]]+)\]\]/i )
		if ( redirMatch ) {
			var title = redirMatch[1];
			var url = this.manager.env.wgScript + '/api' + 
				this.manager.env.wgScriptExtension +
				'?' + 
				qs.stringify( {
					format: 'json',
				action: 'query',
				prop: 'revisions',
				rvprop: 'content',
				titles: title
				} );
			//'?format=json&action=query&prop=revisions&rvprop=content&titles=' + title;
			this.requestOptions.url = url;
			request( this.requestOptions, this._handler.bind(this) ); 
			return;
		}

		//console.warn( 'Page ' + title + ': got ' + src );
		this.manager.env.tp( 'Retrieved ' + this.title, src );

		// Add the source to the cache
		this.manager.env.pageCache[this.title] = src;

		// Process only a few callbacks in each event loop iteration to
		// reduce memory usage.
		// 
		// 
		var listeners = this.listeners( 'src' );
		var processSome = function () {
			// XXX: experiment a bit with the number of callbacks per
			// iteration!
			var maxIters = Math.min(1, listeners.length);
			for ( var it = 0; it < maxIters; it++ ) {
				var nextListener = listeners.shift();
				// We only retrieve text/x-mediawiki source currently.
				nextListener( src, 'text/x-mediawiki' );
			}
			if ( listeners.length ) {
				process.nextTick( processSome );
			}
		};

		process.nextTick( processSome );
		//processSome();

		//self.emit( 'src', src, title );
	}
	// XXX: handle other status codes

	// Remove self from request queue
	//this.manager.env.dp( 'trying to remove ', this.title, ' from requestQueue' );
	delete this.manager.env.requestQueue[this.title];
	//this.manager.env.dp( 'after deletion:', this.manager.env.requestQueue );
};

		/*
		* XXX: The jQuery version does not quite work with node, but we keep
		* it around for now.
		$.ajax({
			url: url,
			data: {
				format: 'json',
				action: 'query',
				prop: 'revisions',
				rvprop: 'content',
				titles: title
			},
			success: function(data, statusString, xhr) {
				console.warn( 'Page ' + title + ' success ' + JSON.stringify( data ) );
				var src = null, title = null;
				$.each(data.query.pages, function(i, page) {
					if (page.revisions && page.revisions.length) {
						src = page.revisions[0]['*'];
						title = page.title;
					}
				});
				if (typeof src !== 'string') {
					console.warn( 'Page ' + title + 'not found! Got ' + src );
					callback( 'Page ' + title + ' not found' );
				} else {
					// Add to cache
					console.warn( 'Page ' + title + ': got ' + src );
					this.manager.env.pageCache[title] = src;
					callback(src, title);
				}
			},
			error: function(xhr, msg, err) {
				console.warn( 'Page/template fetch failure for title ' + 
						title + ', url=' + url + JSON.stringify(xhr) + ', err=' + err );
				callback('Page/template fetch failure for title ' + title);
			},
			dataType: 'json',
			cache: false, // @fixme caching, versions etc?
			crossDomain: true
		});
		*/



if (typeof module == "object") {
	module.exports.TemplateHandler = TemplateHandler;
}
