/**
 * Token transformation managers with a (mostly) abstract
 * TokenTransformManager base class and AsyncTokenTransformManager and
 * SyncTokenTransformManager implementation subclasses. Individual
 * transformations register for the token types they are interested in and are
 * called on each matching token.
 *
 * Async token transformations are supported by the TokenAccumulator class,
 * that manages as-early-as-possible and in-order return of tokens including
 * buffering.
 *
 * See
 * https://www.mediawiki.org/wiki/Parsoid/Token_stream_transformations
 * for more documentation.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

var events = require('events');

/**
 * Base class for token transform managers
 *
 * @class
 * @constructor
 * @param {Function} callback, a callback function accepting a token list as
 * its only argument.
 */
function TokenTransformManager( env, isInclude, pipeFactory, phaseEndRank, attributeType ) {
	// Separate the constructor, so that we can call it from subclasses.
	this._construct();
}

// Inherit from EventEmitter
TokenTransformManager.prototype = new events.EventEmitter();
TokenTransformManager.prototype.constructor = TokenTransformManager;

TokenTransformManager.prototype._construct = function () {
	this.transformers = {
		tag: {}, // for TagTk, EndTagTk, SelfclosingTagTk, keyed on name
		text: [],
		newline: [],
		comment: [],
		end: [], // eof
		martian: [], // none of the above (unknown token type)
		any: []	// all tokens, before more specific handlers are run
	};
};

/**
 * Register to a token source, normally the tokenizer.
 * The event emitter emits a 'chunk' event with a chunk of tokens,
 * and signals the end of tokens by triggering the 'end' event.
 * XXX: Perform registration directly in the constructor?
 *
 * @method
 * @param {Object} EventEmitter token even emitter.
 */
TokenTransformManager.prototype.addListenersOn = function ( tokenEmitter ) {
	tokenEmitter.addListener('chunk', this.onChunk.bind( this ) );
	tokenEmitter.addListener('end', this.onEndEvent.bind( this ) );
};


/**
 * Add a transform registration.
 *
 * @method
 * @param {Function} transform.
 * @param {Number} rank, [0,3) with [0,1) in-order on input token stream,
 * [1,2) out-of-order and [2,3) in-order on output token stream
 * @param {String} type, one of 'tag', 'text', 'newline', 'comment', 'end',
 * 'martian' (unknown token), 'any' (any token, matched before other matches).
 * @param {String} tag name for tags, omitted for non-tags
 */
TokenTransformManager.prototype.addTransform = function ( transformation, rank, type, name ) {
	var transArr,
		transformer = { 
			transform: transformation,
			rank: rank
		};
	if ( type === 'tag' ) {
		name = name.toLowerCase();
		transArr = this.transformers.tag[name];
		if ( ! transArr ) {
			transArr = this.transformers.tag[name] = [];
		}
	} else {
		transArr = this.transformers[type];
	}
	transArr.push(transformer);
	// sort ascending by rank
	transArr.sort( this._cmpTransformations );
	//this.env.dp( 'transforms: ', this.transformers );
};

/**
 * Remove a transform registration
 *
 * @method
 * @param {Function} transform.
 * @param {Number} rank, [0,3) with [0,1) in-order on input token stream,
 * [1,2) out-of-order and [2,3) in-order on output token stream
 * @param {String} type, one of 'tag', 'text', 'newline', 'comment', 'end',
 * 'martian' (unknown token), 'any' (any token, matched before other matches).
 * @param {String} tag name for tags, omitted for non-tags
 */
TokenTransformManager.prototype.removeTransform = function ( rank, type, name ) {
	var i = -1,
		ts;

	function rankUnEqual ( i ) {
		return i.rank !== rank;
	}

	if ( type === 'tag' ) {
		name = name.toLowerCase();
		var maybeTransArr = this.transformers.tag.name;
		if ( maybeTransArr ) {
			this.transformers.tag.name = maybeTransArr.filter( rankUnEqual );
		}
	} else {
		this.transformers[type] = this.transformers[type].filter( rankUnEqual ) ;
	}
};


TokenTransformManager.prototype.setTokensRank = function ( tokens, rank ) {
	for ( var i = 0, l = tokens.length; i < l; i++ ) {
		tokens[i] = this.env.setTokenRank( tokens[i], rank );
	}
};

/**
 * Predicate for sorting transformations by ascending rank.
 */
TokenTransformManager.prototype._cmpTransformations = function ( a, b ) {
	return a.rank - b.rank;
};

/**
 * Get all transforms for a given token
 */
TokenTransformManager.prototype._getTransforms = function ( token ) {
	var ts;
	switch ( token.constructor ) {
		case String:
			ts = this.transformers.text;
			break;
		case NlTk:
			ts = this.transformers.newline;
			break;
		case CommentTk:
			ts = this.transformers.comment;
			break;
		case EOFTk:
			ts = this.transformers.end;
			break;
		case TagTk:
		case EndTagTk:
		case SelfclosingTagTk:
			ts = this.transformers.tag[token.name.toLowerCase()];
			if ( ! ts ) {
				ts = [];
			}
			break;
		default:
			ts = this.transformers.martian;
			break;
	}
	// XXX: cache this to avoid constant re-sorting?
	if ( this.transformers.any.length ) {
		ts = ts.concat( this.transformers.any );
		ts.sort( this._cmpTransformations );
	}
	return ts;
};
			
/******************** Async token transforms: Phase 2 **********************/

/**
 * Asynchronous and potentially out-of-order token transformations, used in phase 2.
 *
 * return protocol for individual transforms:
 *		{ tokens: [tokens], async: true }: async expansion -> outstanding++ in parent
 *		{ tokens: [tokens] }: fully expanded, tokens will be reprocessed
 *		{ token: token }: single-token return
 * 
 * @class
 * @constructor
 * @param {Function} childFactory: A function that can be used to create a
 * new, nested transform manager:
 * nestedAsyncTokenTransformManager = manager.newChildPipeline( inputType, args );
 * @param {Object} args, the argument map for templates
 * @param {Object} env, the environment.
 */
function AsyncTokenTransformManager ( env, isInclude, pipeFactory, phaseEndRank, attributeType ) {
	this.env = env;
	this.isInclude = isInclude;
	this.pipeFactory = pipeFactory;
	this.phaseEndRank = phaseEndRank;
	this.attributeType = attributeType;
	this.setFrame( null, null, {} );
	this._construct();
}

// Inherit from TokenTransformManager, and thus also from EventEmitter.
AsyncTokenTransformManager.prototype = new TokenTransformManager();
AsyncTokenTransformManager.prototype.constructor = AsyncTokenTransformManager;


/**
 * Reset the internal token and outstanding-callback state of the
 * TokenTransformManager, but keep registrations untouched.
 *
 * @method
 * @param {Object} args, template arguments
 * @param {Object} The environment.
 */
AsyncTokenTransformManager.prototype.setFrame = function ( parentFrame, title, args ) {
	// First piggy-back some reset action
	this.tailAccumulator = undefined;
	// initial top-level callback, emits chunks
	this.tokenCB = this._returnTokens.bind( this );

	// now actually set up the frame
	if (parentFrame) {
		if ( title === null ) {
			// attribute, simply reuse the parent frame
			this.frame = parentFrame;
		} else {
			this.frame = parentFrame.newChild( title, this, args );
		}
	} else {
		this.frame = new Frame(title, this, args );
	}
};

	

/**
 * Simplified wrapper that processes all tokens passed in
 */
AsyncTokenTransformManager.prototype.process = function ( tokens ) {
	if ( ! $.isArray ( tokens ) ) {
		tokens = [tokens];
	}
	this.onChunk( tokens );
	this.onEndEvent();
};

/**
 * Transform and expand tokens. Transformed token chunks will be emitted in
 * the 'chunk' event.
 * 
 * @method
 * @param {Array} chunk of tokens
 */
AsyncTokenTransformManager.prototype.onChunk = function ( tokens ) {
	// Set top-level callback to next transform phase
	var res = this.transformTokens ( tokens, this.tokenCB );
	this.env.dp( 'AsyncTokenTransformManager onChunk res=', res );

	if ( ! this.tailAccumulator ) {
		this.emit( 'chunk', res.tokens );
	} else {
		this.tailAccumulator.append( res.tokens );
	}
	
	if ( res.async ) {
		this.tailAccumulator = res.async;
		this.tokenCB = res.async.getParentCB ( 'sibling' );
	}
};

/**
 * Run transformations from phases 0 and 1. This includes starting and
 * managing asynchronous transformations.
 *
 */
AsyncTokenTransformManager.prototype.transformTokens = function ( tokens, parentCB ) {

	//console.warn('AsyncTokenTransformManager.transformTokens: ' + JSON.stringify(tokens) );
	
	var res,
		localAccum = [],
		transforming = true,
		activeAccum = null,
		accum = new TokenAccumulator( this, parentCB ),
		token, ts, transformer, aborted,
		maybeSyncReturn = function ( asyncCB, ret ) {
			if ( transforming ) {
				this.env.dp( 'maybeSyncReturn transforming', ret );
				// transformTokens is ongoing
				if ( false && ret.tokens && ! ret.async && ret.allTokensProcessed && ! activeAccum ) {
					localAccum.push.apply(localAccum, res.tokens );
				} else if ( ret.tokens ) {
					if ( res.tokens ) {
						res.tokens = res.tokens.concat( ret.tokens );
						res.async = ret.async;
					} else {
						res = ret;
					}
				} else {
					if ( ! res.tokens ) {
						res = ret;
					} else {
						res.async = ret.async;
					}
				}
			} else {
				this.env.dp( 'maybeSyncReturn async', ret );
				asyncCB( ret );
			}
		},
		cb = maybeSyncReturn.bind( this, accum.getParentCB( 'child' ) );

	for ( var i = 0, l = tokens.length; i < l; i++ ) {
		token = tokens[i];

		aborted = false;

		ts = this._getTransforms( token );

		if ( ts.length ) {
			res = { };

			//this.env.tp( 'async trans' );
			this.env.dp( token, ts );
			for (var j = 0, lts = ts.length; j < lts; j++ ) {
				transformer = ts[j];
				if ( token.rank && transformer.rank <= token.rank ) {
					// skip transformation, was already applied.
					//console.warn( 'skipping transform');
					res.token = token;
					continue;
				}
				// Transform the token.
				transformer.transform( token, this.frame, cb );
				if ( res.tokens && res.tokens.length === 1 && 
						token.constructor === res.tokens[0].constructor &&
						token.name === res.tokens[0].name ) 
				{
							res.token = res.tokens[0];
				}
				if ( res.token === undefined ) {
							aborted = true;
							break;
						}
				// XXX: factor the conversion to String out into a generic _setRank
				// method? Would need to add to the string prototype for that..
				token = this.env.setTokenRank( res.token, transformer.rank );
			}
		} else {
			res = { token: token };
		}

		this.env.dp( 'res: ', res);

		if ( ! aborted && res.token ) {
			res.token = this.env.setTokenRank( res.token, this.phaseEndRank );
			// token is done.
			if ( activeAccum ) {
				// push to accumulator
				activeAccum.push( res.token );
			} else {
				// If there is no accumulator yet, then directly return the
				// token to the parent. Collect them in localAccum for this
				// purpose.
				localAccum.push( res.token );
			}
			continue;
		} else if( res.tokens ) {
			if ( res.tokens.length > 1 ) {
				// Splice in the returned tokens (while replacing the original
				// token), and process them next.
				//if ( ! res.allTokensProcessed ) {
					[].splice.apply( tokens, [i, 1].concat(res.tokens) );
					l = tokens.length;
					i--; // continue at first inserted token
				//} else {
					// skip fully processed tokens
				//}
			} else if ( res.tokens.length === 1 ) {
				if ( res.tokens[0].rank === this.phaseEndRank ) {
					// token is done.
					if ( activeAccum ) {
						// push to accumulator
						activeAccum.push( res.tokens[0] );
					} else {
						// If there is no accumulator yet, then directly return the
						// token to the parent. Collect them in localAccum for this
						// purpose.
						localAccum.push( res.tokens[0] );
					}
				} else {
					// re-process token.
					tokens[i] = res.tokens[0];
					i--;
				}
			}
		} 
		
		if ( res.async ) {
			this.env.dp( 'res.async' );
			// The child now switched to activeAccum, we have to create a new
			// accumulator for the next potential child.
			activeAccum = accum;
			accum = new TokenAccumulator( this, activeAccum.getParentCB( 'sibling' ) );
			cb = maybeSyncReturn.bind( this, accum.getParentCB( 'child' ) );
		}
	}
	transforming = false;

	// Return finished tokens directly to caller, and indicate if further
	// async actions are outstanding. The caller needs to point a sibling to
	// the returned accumulator, or call .siblingDone() to mark the end of a
	// chain.
	return { tokens: localAccum, async: activeAccum };
};

/**
 * Top-level callback for tokens which are now free to be emitted iff they are
 * indeed fully processed for sync01 and async12. If there were asynchronous
 * expansions, then only the first TokenAccumulator has its callback set to
 * this method. An exhausted TokenAccumulator passes its callback on to its
 * siblings until the last accumulator is reached, so that the head
 * accumulator will always call this method directly.
 *
 * @method
 * @param {Object} tokens, async, allTokensProcessed
 * @returns {Mixed} new parent callback for caller or falsy value.
 */
AsyncTokenTransformManager.prototype._returnTokens = function ( ret ) {
	//tokens = this._transformPhase2( this.frame, tokens, this.parentCB );
	
	this.env.dp( 'AsyncTokenTransformManager._returnTokens, emitting chunk: ',
				ret );

	if( !ret.allTokensProcessed ) {
		var res = this.transformTokens( ret.tokens, this._returnTokens.bind(this) );
		this.emit( 'chunk', res.tokens );
		if ( res.async ) {
			// XXX: this looks fishy
			if ( ! this.tailAccumulator ) {
				this.tailAccumulator = res.async;
				this.tokenCB = res.async.getParentCB ( 'sibling' );
			}
			if ( ret.async ) {
				// return sibling callback
				return this.tokenCB;
			} else {
				// signal done-ness to last accum
				res.async.siblingDone();
			}
		} else if ( !ret.async ) {
			this.emit( 'end' );
			// and reset internal state.
			//this._reset();
		}
	} else {
		this.emit( 'chunk', ret.tokens );

		if ( ! ret.async ) {
			//console.trace();
			// signal our done-ness to consumers.
			this.emit( 'end' );
			// and reset internal state.
			//this._reset();
		}
	}
};

/**
 * Callback for the end event emitted from the tokenizer.
 * Either signals the end of input to the tail of an ongoing asynchronous
 * processing pipeline, or directly emits 'end' if the processing was fully
 * synchronous.
 */
AsyncTokenTransformManager.prototype.onEndEvent = function () {
	if ( this.tailAccumulator ) {
		this.env.dp( 'AsyncTokenTransformManager.onEndEvent: calling siblingDone',
				this.frame );
		this.tailAccumulator.siblingDone();
	} else {
		// nothing was asynchronous, so we'll have to emit end here.
		this.env.dp( 'AsyncTokenTransformManager.onEndEvent: synchronous done',
				this.frame );
		this.emit('end');
		//this._reset();
	}
};






/*************** In-order, synchronous transformer (phase 1 and 3) ***************/

/**
 * Subclass for phase 3, in-order and synchronous processing.
 *
 * @class
 * @constructor
 * @param {Object} environment.
 */
function SyncTokenTransformManager ( env, isInclude, pipeFactory, phaseEndRank, attributeType ) {
	this.env = env;
	this.isInclude = isInclude;
	this.pipeFactory = pipeFactory;
	this.phaseEndRank = phaseEndRank;
	this.attributeType = attributeType;
	this._construct();
}

// Inherit from TokenTransformManager, and thus also from EventEmitter.
SyncTokenTransformManager.prototype = new TokenTransformManager();
SyncTokenTransformManager.prototype.constructor = SyncTokenTransformManager;


SyncTokenTransformManager.prototype.process = function ( tokens ) {
	if ( ! $.isArray ( tokens ) ) {
		tokens = [tokens];
	}
	this.onChunk( tokens );
	//console.warn( JSON.stringify( this.transformers ) )
	this.onEndEvent();
};


/**
 * Global in-order and synchronous traversal on token stream. Emits
 * transformed chunks of tokens in the 'chunk' event.
 *
 * @method
 * @param {Array} Token chunk.
 */
SyncTokenTransformManager.prototype.onChunk = function ( tokens ) {
	this.env.dp( 'SyncTokenTransformManager.onChunk, input: ', tokens );
	var res,
		localAccum = [],
		localAccumLength = 0,
		token,
		// Top-level frame only in phase 3, as everything is already expanded.
		ts, transformer,
		aborted;

	for ( var i = 0, l = tokens.length; i < l; i++ ) {
		aborted = false;
		token = tokens[i];
		res = { token: token };
		
		ts = this._getTransforms( token );
		var minRank = token.rank || 0;
		for (var j = 0, lts = ts.length; j < lts; j++ ) {
			transformer = ts[j];
			if ( transformer.rank < minRank ) {
				// skip transformation, was already applied.
				//console.warn( 'skipping transform');
				continue;
			}
			// Transform the token.
			res = transformer.transform( res.token, this, this.prevToken );
			if ( !res.token ||
					res.token.constructor !== token.constructor ||
					( token.name && res.token.name && res.token.name !== token.name ) ) {
						aborted = true;
						break;
					}
			minRank = transformer.rank;
		}
		
		if ( ! aborted ) {
			res.token = this.env.setTokenRank( res.token, this.phaseEndRank );
		}

		if( res.tokens ) {
			// Splice in the returned tokens (while replacing the original
			// token), and process them next.
			[].splice.apply( tokens, [i, 1].concat(res.tokens) );
			l = tokens.length;
			i--; // continue at first inserted token
		} else if ( res.token ) {
			if ( res.token.rank === this.phaseEndRank ) {
				// token is done.
				localAccum.push(res.token);
				this.prevToken = res.token;
			} else {
				// re-process token.
				tokens[i] = res.token;
				i--;
			}
		}
	}
	this.env.dp( 'SyncTokenTransformManager.onChunk: emitting ', localAccum );
	this.emit( 'chunk', localAccum );
};


/**
 * Callback for the end event emitted from the tokenizer.
 * Either signals the end of input to the tail of an ongoing asynchronous
 * processing pipeline, or directly emits 'end' if the processing was fully
 * synchronous.
 */
SyncTokenTransformManager.prototype.onEndEvent = function () {
	// This phase is fully synchronous, so just pass the end along and prepare
	// for the next round.
	this.emit('end');
};


/********************** AttributeTransformManager *************************/

/**
 * Utility transformation manager for attributes, using an attribute
 * transformation pipeline (normally phase1 SyncTokenTransformManager and
 * phase2 AsyncTokenTransformManager). This pipeline needs to be independent
 * of the containing TokenTransformManager to isolate transforms from each
 * other. The AttributeTransformManager returns its result by calling the
 * supplied callback.
 *
 * @class
 * @constructor
 * @param {Object} Containing AsyncTokenTransformManager
 * @param {Function} Callback function, called with expanded attribute array.
 */
function AttributeTransformManager ( manager, callback ) {
	this.manager = manager;
	this.frame = this.manager.frame;
	this.callback = callback;
	this.outstanding = 1;
	this.kvs = [];
	//this.pipe = manager.getAttributePipeline( manager.args );
}

/**
 * Expand both key and values of all key/value pairs. Used for generic
 * (non-template) tokens in the AttributeExpander handler, which runs after
 * templates are already expanded.
 */
AttributeTransformManager.prototype.process = function ( attributes ) {
	// Potentially need to use multiple pipelines to support concurrent async expansion
	//this.pipe.process( 
	var pipe,
		ref;
	//console.warn( 'AttributeTransformManager.process: ' + JSON.stringify( attributes ) );

	// transform each argument (key and value), and handle asynchronous returns
	for ( var i = 0, l = attributes.length; i < l; i++ ) {
		var cur = attributes[i];

		
		// fast path for string-only attributes
		if ( cur.k.constructor === String && cur.v.constructor === String ) {
			this.kvs.push( cur );
			continue;
		}


		var kv = new KV( [], [] );
		this.kvs.push( kv );

		if ( cur.k.constructor === Array && cur.k.length ) {
			// Assume that the return is async, will be decremented in callback
			this.outstanding++;

			// transform the key
			pipe = this.manager.pipeFactory.getPipeline( this.manager.attributeType,
														this.manager.isInclude );
			pipe.setFrame( this.manager.frame, null );
			pipe.on( 'chunk',
					this._returnAttributeKey.bind( this, i, true )
				);
			pipe.on( 'end', 
					this._returnAttributeKey.bind( this, i, false, [] ) 
				);
			pipe.process( this.manager.env.cloneTokens( cur.k ).concat([ new EOFTk() ]) );
		} else {
			kv.k = cur.k;
		}

		if ( cur.v.constructor === Array && cur.v.length ) {
			// Assume that the return is async, will be decremented in callback
			this.outstanding++;

			// transform the value
			pipe = this.manager.pipeFactory.getPipeline( this.manager.attributeType,
														this.manager.isInclude );
			pipe.setFrame( this.manager.frame, null );
			//pipe = this.manager.getAttributePipeline( this.manager.inputType,
			//											this.manager.args );
			pipe.on( 'chunk', 
					this._returnAttributeValue.bind( this, i, true )
					);
			pipe.on( 'end', 
					this._returnAttributeValue.bind( this, i, false, [] )
					);
			//console.warn('starting attribute transform of ' + JSON.stringify( attributes[i].v ) );
			pipe.process( this.manager.env.cloneTokens( cur.v ).concat([ new EOFTk() ]) );
		} else {
			kv.v = cur.v;
			if ( !cur.v.to ) {
				if ( cur.v.constructor === String ) {
					if ( ! cur.v.rank ) {
						cur.v = new String( cur.v );
					}
					Object.defineProperty( cur.v, 'to', 
							{
								value: function() { return cur.v },
								enumerable: false
							});
				} else {
					Object.defineProperty( cur.v, 'to', 
							{
								value: this.manager.frame.convert,
								enumerable: false
							});
				}
			}
		}
	}
	this.outstanding--;
	if ( this.outstanding === 0 ) {
		// synchronous, done
		this.callback( this.kvs );
	}
};

/**
 * Expand only keys of key/value pairs. This is generally used for template
 * parameters to avoid expanding unused values, which is very important for
 * constructs like switches.
 */
AttributeTransformManager.prototype.processKeys = function ( attributes ) {
	// Potentially need to use multiple pipelines to support concurrent async expansion
	//this.pipe.process( 
	var pipe,
		ref;
	//console.warn( 'AttributeTransformManager.process: ' + JSON.stringify( attributes ) );

	// transform each argument (key and value), and handle asynchronous returns
	for ( var i = 0, l = attributes.length; i < l; i++ ) {
		var cur = attributes[i];
		var kv = new KV([], cur.v);
		if ( !cur.v.to ) {
			if ( cur.v.constructor === String ) {
				cur.v = new String( cur.v );
				Object.defineProperty( cur.v, 'to', 
						{
							value: function() { return cur.v },
							enumerable: false
						});
			} else {
				Object.defineProperty( cur.v, 'to', 
						{
							value: this.manager.frame.convert,
							enumerable: false
						});
			}
		}
		this.kvs.push( kv );

		if ( cur.k.constructor === Array && cur.k.length && ! cur.k.to ) {
			// Assume that the return is async, will be decremented in callback
			this.outstanding++;

			// transform the key
			pipe = this.manager.pipeFactory.getPipeline( this.manager.attributeType,
														this.manager.isInclude );
			pipe.setFrame( this.manager.frame, null );
			//pipe = this.manager.getAttributePipeline( this.manager.inputType,
			//											this.manager.args );
			pipe.on( 'chunk',
					this._returnAttributeKey.bind( this, i, true ) 
				);
			pipe.on( 'end', 
					this._returnAttributeKey.bind( this, i, false, [] ) 
				);
			pipe.process( this.manager.env.cloneTokens( cur.k ).concat([ new EOFTk() ]) );
		} else {
			kv.k = cur.k;
		}
	}
	this.outstanding--;
	if ( this.outstanding === 0 ) {
		// synchronously done
		this.callback( this.kvs );
	}
};

/**
 * Only expand values of attribute key/value pairs.
 */
AttributeTransformManager.prototype.processValues = function ( attributes ) {
	// Potentially need to use multiple pipelines to support concurrent async expansion
	//this.pipe.process( 
	var pipe,
		ref;
	//console.warn( 'AttributeTransformManager.process: ' + JSON.stringify( attributes ) );

	// transform each argument (key and value), and handle asynchronous returns
	for ( var i = 0, l = attributes.length; i < l; i++ ) {
		var cur = attributes[i];
		var kv = new KV( cur.k, [] );
		this.kvs.push( kv );

		if ( ! cur ) {
			console.warn( JSON.stringify( attributes ) );
			console.trace();
			continue;
		}

		if ( cur.v.constructor === Array && cur.v.length ) {
			// Assume that the return is async, will be decremented in callback
			this.outstanding++;

			// transform the value
			pipe = this.manager.pipeFactory.getPipeline( this.manager.attributeType,
														this.manager.isInclude );
			pipe.setFrame( this.manager.frame, null );
			//pipe = this.manager.getAttributePipeline( this.manager.inputType,
			//											this.manager.args );
			pipe.on( 'chunk', 
					this._returnAttributeValue.bind( this, i, true ) 
					);
			pipe.on( 'end', 
					this._returnAttributeValue.bind( this, i, false, [] )
					);
			//console.warn('starting attribute transform of ' + JSON.stringify( attributes[i].v ) );
			pipe.process( this.manager.env.cloneTokens( cur.v ).concat([ new EOFTk() ]) );
		} else {
			kv.value = cur.v;
		}
	}
	this.outstanding--;
	if ( this.outstanding === 0 ) {
		// synchronously done
		this.callback( this.kvs );
	}
};


/**
 * Callback for async argument value expansions
 */
AttributeTransformManager.prototype._returnAttributeValue = function ( ref, notYetDone, tokens ) {
	this.manager.env.dp( 'check _returnAttributeValue: ', ref,  tokens,
			' notYetDone:', notYetDone );
	this.kvs[ref].v = this.kvs[ref].v.concat( tokens );
	if ( ! notYetDone ) {
		var res = this.kvs[ref].v;
		this.manager.env.stripEOFTkfromTokens( res );
		this.outstanding--;
		// Add the 'to' conversion method to the chunk for easy conversion in
		// later processing (parser functions and template argument
		// processing).
		if ( !res.to ) {
			Object.defineProperty( res, 'to', 
					{
						value: function() { return res },
				enumerable: false
					});
		}
		if ( this.outstanding === 0 ) {
			this.callback( this.kvs );
		}
	}
};

/**
 * Callback for async argument key expansions
 */
AttributeTransformManager.prototype._returnAttributeKey = function ( ref, notYetDone, tokens ) {
	//console.warn( 'check _returnAttributeKey: ' + JSON.stringify( tokens ) + 
	//		' notYetDone:' + notYetDone );
	this.kvs[ref].k = this.kvs[ref].k.concat( tokens );
	if ( ! notYetDone ) {
		this.manager.env.stripEOFTkfromTokens( this.kvs[ref].k );
		this.outstanding--;
		if ( this.outstanding === 0 ) {
			this.callback( this.kvs );
		}
	}
};


/******************************* TokenAccumulator *************************/
/**
 * Token accumulators buffer tokens between asynchronous processing points,
 * and return fully processed token chunks in-order and as soon as possible. 
 * They support the AsyncTokenTransformManager.
 *
 * @class
 * @constructor
 * @param {Object} next TokenAccumulator to link to
 * @param {Array} (optional) tokens, init accumulator with tokens or []
 */
function TokenAccumulator ( manager, parentCB ) {
	this.manager = manager;
	this.parentCB = parentCB;
	this.accum = [];
	// Wait for child and sibling by default
	// Note: Need to decrement outstanding on last accum
	// in a chain.
	this.outstanding = 2; 
}

/**
 * Curry a parentCB with the object and reference.
 *
 * @method
 * @param {Object} TokenAccumulator
 * @param {misc} Reference / key for callback
 * @returns {Function}
 */
TokenAccumulator.prototype.getParentCB = function ( reference ) {
	return this._returnTokens.bind( this, reference );
};

/**
 * Pass tokens to an accumulator
 *
 * @method
 * @param {String}: reference, 'child' or 'sibling'.
 * @param {Object}: { tokens, async, allTokensProcessed }
 * @returns {Mixed}: new parent callback for caller or falsy value
 */
TokenAccumulator.prototype._returnTokens = 
	function ( reference, ret ) { 
	var cb,
		returnTokens = [];


	if ( ! ret.async ) {
		this.outstanding--;
	}

	this.manager.env.dp( 'TokenAccumulator._returnTokens', ret );

	// FIXME
	if ( ret.tokens === undefined ) {
		if ( this.manager.env.debug ) {
			console.trace();
		}
		if ( ret.token ) {
			ret.tokens = [ret.token];
		} else {
			ret.tokens = [];
		}
	}

	if ( reference === 'child' ) {
		var res = {};
		if( !ret.allTokensProcessed ) {
			// There might be transformations missing on the returned tokens,
			// re-transform to make sure those are applied too.
			res = this.manager.transformTokens( ret.tokens, this.parentCB );
			ret.tokens = res.tokens;
		}

		if ( !ret.async ) {
			// empty accum too
			ret.tokens = ret.tokens.concat( this.accum );
			this.accum = [];
		}
		//this.manager.env.dp( 'TokenAccumulator._returnTokens child: ',
		//		tokens, ' outstanding: ', this.outstanding );
		ret.allTokensProcessed = true;
		ret.async = this.outstanding;

		this.parentCB( ret );

		if ( res.async ) {
			this.parentCB = res.async.getParentCB( 'sibling' );
		}
		return null;
	} else {
		// sibling
		if ( this.outstanding === 0 ) {
			ret.tokens = this.accum.concat( ret.tokens );
			// A sibling will transform tokens, so we don't have to do this
			// again.
			//this.manager.env.dp( 'TokenAccumulator._returnTokens: ',
			//		'sibling done and parentCB ',
			//		tokens );
			ret.allTokensProcessed = true;
			ret.async = false;
			this.parentCB( ret );
			return null;
		} else if ( this.outstanding === 1 && ret.async ) {
			//this.manager.env.dp( 'TokenAccumulator._returnTokens: ',
			//		'sibling done and parentCB but async ',
			//		tokens );
			// Sibling is not yet done, but child is. Return own parentCB to
			// allow the sibling to go direct, and call back parent with
			// tokens. The internal accumulator is empty at this stage, as its
			// tokens are passed to the parent when the child is done.
			ret.allTokensProcessed = true;
			return this.parentCB( ret );
		} else {
			this.accum  = this.accum.concat( ret.tokens );
			//this.manager.env.dp( 'TokenAccumulator._returnTokens: sibling done, but not overall. async=',
			//		res.async, ', this.outstanding=', this.outstanding, 
			//		', this.accum=', this.accum, ' manager.title=', this.manager.title );
		}


	}
};

/**
 * Mark the sibling as done (normally at the tail of a chain).
 */
TokenAccumulator.prototype.siblingDone = function () {
	//console.warn( 'TokenAccumulator.siblingDone: ' );
	this._returnTokens ( 'sibling', { tokens: [], async: false, allTokensProcessed: true} );
};


/**
 * Push a token into the accumulator
 *
 * @method
 * @param {Object} token
 */
TokenAccumulator.prototype.push = function ( token ) {
	return this.accum.push(token);
};

/**
 * Append tokens to an accumulator
 *
 * @method
 * @param {Object} token
 */
TokenAccumulator.prototype.append = function ( token ) {
	this.accum = this.accum.concat( token );
};


/******************************* Frame ******************************/

/**
 * The Frame object
 *
 * A frame represents a template expansion scope including parameters passed
 * to the template (args). It provides a generic 'convert' method which
 * expands / converts individual parameter values in its scope.  It also
 * provides methods to check if another expansion would lead to loops or
 * exceed the maximum expansion depth.
 */

function Frame ( title, manager, args, parentFrame ) {
	this.title = title;
	this.manager = manager;
	this.args = new Params( this.manager.env, args );
	if ( parentFrame ) {
		this.parentFrame = parentFrame;
		this.depth = parentFrame.depth + 1;
	} else {
		this.parentFrame = null;
		this.depth = 0;
	}
	var self = this;
	this.convert = function ( format, cb ) {
		self._convertThunk( this, format, cb );
	};
}

/**
 * Create a new child frame
 */
Frame.prototype.newChild = function ( title, manager, args ) {
	return new Frame( title, manager, args, this );
};

/**
 * Expand / convert a thunk (a chunk of tokens not yet fully expanded).
 */
Frame.prototype._convertThunk = function ( chunk, format, cb ) {
	this.manager.env.dp( 'convertChunk', chunk );

	// Set up a conversion cache on the chunk, if it does not yet exist
	if ( chunk.toCache === undefined ) {
		Object.defineProperty( chunk, 'toCache', { value: {}, enumerable: false } );
	} else {
		if ( chunk.toCache[format] !== undefined ) {
			cb( chunk.toCache[format] );
			return;
		}
	}

	// XXX: Should perhaps create a generic from..to conversion map in
	// mediawiki.parser.js, at least for forward conversions.
	if ( format === 'tokens/x-mediawiki/expanded' ) {
		var pipeline = this.manager.pipeFactory.getPipeline( 
				this.manager.attributeType || 'tokens/x-mediawiki', true
				);
		pipeline.setFrame( this, null );
		// In the interest of interface simplicity, we accumulate all emitted
		// chunks in a single accumulator.
		var accum = [];
		// Callback used to cache the result of the conversion
		var cacheIt = function ( res ) { chunk.toCache[format] = res; };
		pipeline.addListener( 'chunk', 
				this.onThunkEvent.bind( this, cacheIt, accum, true, cb ) );
		pipeline.addListener( 'end', 
				this.onThunkEvent.bind( this, cacheIt, accum, false, cb ) );
		pipeline.process( chunk.concat( [new EOFTk()] ), this.title );
	} else {
		throw "Frame._convertThunk: Unsupported format " + format;
	}
};

/**
 * Event handler for chunk conversion pipelines
 */
Frame.prototype.onThunkEvent = function ( cacheIt, accum, notYetDone, cb, ret ) {
	if ( notYetDone ) {
		//this.manager.env.dp( 'Frame.onThunkEvent accum:', accum );
		accum.push.apply( accum, ret );
	} else {
		this.manager.env.stripEOFTkfromTokens( accum );
		this.manager.env.dp( 'Frame.onThunkEvent:', accum );
		cacheIt( accum );
		cb ( accum );
	}
};



/**
 * Check if expanding <title> would lead to a loop, or would exceed the
 * maximum expansion depth.
 *
 * @method
 * @param {String} Title to check.
 */
Frame.prototype.loopAndDepthCheck = function ( title, maxDepth ) {
	// XXX: set limit really low for testing!
	//console.warn( 'Loopcheck: ' + title + JSON.stringify( this, null, 2 ) );
	if ( this.depth > maxDepth ) {
		// too deep
		//console.warn( 'Loopcheck: ' + JSON.stringify( this, null, 2 ) );
		return 'Error: Expansion depth limit exceeded at ';
	}
	var elem = this;
	do {
		//console.warn( 'loop check: ' + title + ' vs ' + elem.title );
		if ( elem.title === title ) {
			// Loop detected
			return 'Error: Expansion loop detected at ';
		}
		elem = elem.parentFrame;
	} while ( elem );
	// No loop detected.
	return false;
};

if (typeof module == "object") {
	module.exports.AsyncTokenTransformManager = AsyncTokenTransformManager;
	module.exports.SyncTokenTransformManager = SyncTokenTransformManager;
	module.exports.AttributeTransformManager = AttributeTransformManager;
}
