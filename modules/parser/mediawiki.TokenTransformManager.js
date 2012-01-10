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
 * https://www.mediawiki.org/wiki/Future/Parser_development/Token_stream_transformations
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
function TokenTransformManager( ) {
	// Separate the constructor, so that we can call it from subclasses.
	this._construct();
}

// Inherit from EventEmitter
TokenTransformManager.prototype = new events.EventEmitter();
TokenTransformManager.prototype.constructor = TokenTransformManager;

TokenTransformManager.prototype._construct = function () {
	this.transformers = {
		tag: {}, // for TAG, ENDTAG, SELFCLOSINGTAG, keyed on name
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
TokenTransformManager.prototype.listenForTokensFrom = function ( tokenEmitter ) {
	tokenEmitter.addListener('chunk', this.onChunk.bind( this ) );
	tokenEmitter.addListener('end', this.onEndEvent.bind( this ) );
};



/**
 * Map a rank to a phase.
 *
 * XXX: Might not be needed anymore, as phases are now subclassed and
 * registrations are separated.
 */
TokenTransformManager.prototype._rankToPhase  = function ( rank ) {
	if ( rank < 0 || rank > 3 ) {
		throw "TransformManager error: Invalid transformation rank " + rank;
	}
	if ( rank <= 2 ) {
		return 2;
	} else {
		return 3;
	}
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

/**
 * Enforce separation between phases when token types or tag names have
 * changed, or when multiple tokens were returned. Processing will restart
 * with the new rank.
 *
 * XXX: This should also be moved to the subclass (actually partially implicit if
 * _transformTagToken and _transformToken are subclassed and set the rank when
 * fully processed). The token type change case still needs to be covered
 * though.
 */
TokenTransformManager.prototype._resetTokenRank = function ( res, transformer ) {
	if ( res.token ) {
		// reset rank after type or name change
		if ( transformer.rank < 1 ) {
			res.token.rank = 0;
		} else {
			res.token.rank = 1;
		}
	} else if ( res.tokens && transformer.rank > 2 ) {
		for ( var i = 0; i < res.tokens.length; i++ ) {
			if ( res.tokens[i].rank === undefined ) {
				// Do not run phase 0 on newly created tokens from
				// phase 1.
				res.tokens[i].rank = 2;
			}
		}
	}
};

/**
 * Comparison for sorting transformations by ascending rank.
 */
TokenTransformManager.prototype._cmpTransformations = function ( a, b ) {
	return a.rank - b.rank;
};

/* Call all transformers on a tag.
 * XXX: Move to subclasses and use a different signature?
 *
 * @method
 * @param {Object} The current token.
 * @param {Function} Completion callback for async processing.
 * @param {Number} Rank of phase end, both key for transforms and rank for
 * processed tokens.
 * @returns {Object} Token(s) and async indication.
 */
TokenTransformManager.prototype._transformTagToken = function ( token, cb, phaseEndRank ) {
	// prepend 'any' transformers
	var ts = this.transformers.any,
		res = { token: token },
		transform,
		l, i,
		aborted = false,
		tName = token.name.toLowerCase(),
		tagts = this.transformers.tag[tName];

	if ( tagts && tagts.length ) {
		// could cache this per tag type to avoid re-sorting each time
		ts = ts.concat(tagts);
		ts.sort( this._cmpTransformations );
	}
	//console.log(JSON.stringify(ts, null, 2));
	if ( ts ) {
		for ( i = 0, l = ts.length; i < l; i++ ) {
			transformer = ts[i];
			if ( res.token.rank && transformer.rank <= res.token.rank ) {
				// skip transformation, was already applied.
				continue;
			}
			// Transform token with side effects
			res = transformer.transform( res.token, cb, this, this.prevToken );
			// if multiple tokens or null token: process returned tokens (in parent)
			if ( !res.token ||  // async implies tokens instead of token, so no
								// need to check explicitly
					res.token.type !== token.type || 
					res.token.name !== token.name ) {
				this._resetTokenRank ( res, transformer );
				aborted = true;
				break;
			}
			// track progress on token
			res.token.rank = transformer.rank;
		}
		if ( ! aborted ) {
			// Mark token as fully processed.
			res.token.rank = phaseEndRank;
		}
	}
	return res;
};


/* Call all transformers on non-tag token types.
 * XXX: different signature for sync vs. async, move to subclass?
 *
 * @method
 * @param {Object} The current token.
 * @param {Function} Completion callback for async processing.
 * @param {Number} Rank of phase end, both key for transforms and rank for
 * processed tokens.
 * @param {Array} ts List of token transformers for this token type.
 * @returns {Object} Token(s) and async indication.
 */
TokenTransformManager.prototype._transformToken = function ( token, cb, phaseEndRank, ts ) {
	// prepend 'any' transformers
	var anyTrans = this.transformers.any;
	if ( anyTrans.length ) {
		ts = this.transformers.any.concat(ts);
		ts.sort( this._cmpTransformations );
	}
	var transformer,
		res = { token: token },
		aborted = false;
	if ( ts ) {
		for (var i = 0, l = ts.length; i < l; i++ ) {
			transformer = ts[i];
			if ( res.token.rank && transformer.rank <= res.token.rank ) {
				// skip transformation, was already applied.
				continue;
			}
			// Transform the token.
			// XXX: consider moving the rank out of the token itself to avoid
			// transformations messing with it in broken ways. Not sure if
			// some transformations need to manipulate it though. gwicke
			res = transformer.transform( res.token, cb, this, this.prevToken );
			if ( !res.token ||
					res.token.type !== token.type ) {
				this._resetTokenRank ( res, transformer );
				aborted = true;
				break;
			}
			res.token.rank = transformer.rank;
		}
		if ( ! aborted ) {
			// mark token as completely processed
			res.token.rank = phaseEndRank; // need phase passed in!
		}

	}
	return res;
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
function AsyncTokenTransformManager ( childFactories, args, env ) {
	// Factory function for new AsyncTokenTransformManager creation with
	// default transforms enabled
	// Also sets up a tokenizer and phase-1-transform depending on the input format
	// nestedAsyncTokenTransformManager = manager.newChildPipeline( inputType, args );
	this.childFactories = childFactories;
	this._construct();
	this._reset( args, env );
}

// Inherit from TokenTransformManager, and thus also from EventEmitter.
AsyncTokenTransformManager.prototype = new TokenTransformManager();
AsyncTokenTransformManager.prototype.constructor = AsyncTokenTransformManager;

/**
 * Create a new child pipeline.
 *
 * @method
 * @param {String} Input type, currently only support 'text/wiki'.
 * @param {Object} Template arguments
 * @returns {Object} Pipeline, which is an object with 'first' pointing to the
 * first stage of the pipeline, and 'last' pointing to the last stage.
 */
AsyncTokenTransformManager.prototype.newChildPipeline = function ( inputType, args, title ) {
	var pipe = this.childFactories.input( inputType, args );

	// now set up a few things on the child AsyncTokenTransformManager.
	var child = pipe.last;
	// We assume that the title was already checked against this.loopCheck
	// before!
	child.loopCheck = new LoopCheck ( this.loopCheck, title );
	// Same for depth!
	child.depth = this.depth + 1;
	return pipe;
};

/**
 * Create a pipeline for attribute transformations.
 *
 * @method
 * @param {String} Input type, currently only support 'text/wiki'.
 * @param {Object} Template arguments
 * @returns {Object} Pipeline, which is an object with 'first' pointing to the
 * first stage of the pipeline, and 'last' pointing to the last stage.
 */
AsyncTokenTransformManager.prototype.newAttributePipeline = function ( inputType, args ) {
	return this.childFactories.attributes( inputType, args );
};

/**
 * Reset the internal token and outstanding-callback state of the
 * TokenTransformManager, but keep registrations untouched.
 *
 * @method
 * @param {Object} args, template arguments
 * @param {Object} The environment.
 */
AsyncTokenTransformManager.prototype._reset = function ( args, env ) {
	// Note: Much of this is frame-like.
	this.tailAccumulator = undefined;
	// eventize: bend to event emitter callback
	this.tokenCB = this._returnTokens.bind( this );
	this.accum = new TokenAccumulator(null);
	this.firstaccum = this.accum;
	this.prevToken = undefined;
	if ( ! args ) {
		this.args = {}; // no arguments at the top level
	} else {
		this.args = args;
	}
	if ( ! env ) {
		if ( !this.env ) {
			throw "AsyncTokenTransformManager: environment needed!" + env;
		}
	} else {
		this.env = env;
	}
};


/**
 * Transform and expand tokens. Transformed token chunks will be emitted in
 * the 'chunk' event.
 * 
 * @method
 * @param {Array} chunk of tokens
 */
AsyncTokenTransformManager.prototype.onChunk = function ( tokens ) {
	//console.log('TokenTransformManager onChunk');
	// Set top-level callback to next transform phase
	var res = this.transformTokens ( tokens, this.tokenCB );
	this.tailAccumulator = res.async;
	this.emit( 'chunk', tokens );
	//this.phase2TailCB( tokens, true );
	if ( res.async ) {
		this.tokenCB = res.async.getParentCB ( 'sibling' );
	}
};

/**
 * Run transformations from phases 0 and 1. This includes starting and
 * managing asynchronous transformations.
 *
 */
AsyncTokenTransformManager.prototype.transformTokens = function ( tokens, parentCB ) {

	//console.log('_transformPhase01: ' + JSON.stringify(tokens) );
	
	var res,
		phaseEndRank = 2, // parametrize!
		// Prepare a new accumulator, to be used by async children (if any)
		localAccum = [],
		accum = new TokenAccumulator( parentCB ),
		cb = accum.getParentCB( 'child' ),
		activeAccum = null,
		tokensLength = tokens.length,
		token,
		ts = this.transformers;

	for ( var i = 0; i < tokensLength; i++ ) {
		token = tokens[i];

		switch( token.type ) {
			case 'TAG':
			case 'ENDTAG':
			case 'SELFCLOSINGTAG':
				res = this._transformTagToken( token, cb, phaseEndRank );
				break;
			case 'TEXT':
				res = this._transformToken( token, cb, phaseEndRank, ts.text );
				break;
			case 'COMMENT':
				res = this._transformToken( token, cb, phaseEndRank, ts.comment);
				break;
			case 'NEWLINE':
				res = this._transformToken( token, cb, phaseEndRank, ts.newline );
				break;
			case 'END':
				res = this._transformToken( token, cb, phaseEndRank, ts.end );
				break;
			default:
				res = this._transformToken( token, cb, phaseEndRank, ts.martian );
				break;
		}

		if( res.tokens ) {
			// Splice in the returned tokens (while replacing the original
			// token), and process them next.
			[].splice.apply( tokens, [i, 1].concat(res.tokens) );
			tokensLength = tokens.length;
			i--; // continue at first inserted token
		} else if ( res.token ) {
			if ( res.token.rank === 2 ) {
				// token is done.
				if ( activeAccum ) {
					// push to accumulator
					activeAccum.push( res.token );
				} else {
					// If there is no accumulator yet, then directly return the
					// token to the parent. Collect them in localAccum for this
					// purpose.
					localAccum.push(res.token);
				}
			} else {
				// re-process token.
				tokens[i] = res.token;
				i--;
			}
		} else if ( res.async ) {
			// The child now switched to activeAccum, we have to create a new
			// accumulator for the next potential child.
			activeAccum = accum;
			accum = new TokenAccumulator( activeAccum.getParentCB( 'sibling' ) );
			cb = accum.getParentCB( 'child' );
		}
	}

	// Return finished tokens directly to caller, and indicate if further
	// async actions are outstanding. The caller needs to point a sibling to
	// the returned accumulator, or call .siblingDone() to mark the end of a
	// chain.
	return { tokens: localAccum, async: activeAccum };
};

/**
 * Callback from tokens fully processed for phase 0 and 1, which are now ready
 * for synchronous and globally in-order phase 2 processing.
 *
 * @method
 * @param {Array} chunk of tokens
 * @param {Mixed} Either a falsy value if this is the last callback
 * (everything is done), or a truish value if not yet done.
 */
AsyncTokenTransformManager.prototype._returnTokens = function ( tokens, notYetDone ) {
	// FIXME: store frame in object?
	this.emit('chunk', tokens);
	//tokens = this._transformPhase2( this.frame, tokens, this.parentCB );
	//console.log('AsyncTokenTransformManager._returnTokens, after _transformPhase2.');

	//this.emit( 'chunk', tokens );

	if ( ! notYetDone ) {
		console.log('AsyncTokenTransformManager._returnTokens done.');
		// signal our done-ness to consumers.
		this.emit( 'end' );
		// and reset internal state.
		this._reset();
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
		this.tailAccumulator.siblingDone();
	} else {
		// nothing was asynchronous, so we'll have to emit end here.
		this.emit('end');
		this._reset();
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
function SyncTokenTransformManager ( env ) {
	// both inherited
	this._construct();
	this.args = {}; // no arguments at the top level
	this.env = env;
}

// Inherit from TokenTransformManager, and thus also from EventEmitter.
SyncTokenTransformManager.prototype = new TokenTransformManager();
SyncTokenTransformManager.prototype.constructor = SyncTokenTransformManager;


/**
 * Global in-order and synchronous traversal on token stream. Emits
 * transformed chunks of tokens in the 'chunk' event.
 *
 * @method
 * @param {Array} Token chunk.
 */
SyncTokenTransformManager.prototype.onChunk = function ( tokens ) {
	var res,
		phaseEndRank = 3,
		localAccum = [],
		localAccumLength = 0,
		tokensLength = tokens.length,
		cb, // XXX: not meaningful for purely synchronous processing!
		token,
		// Top-level frame only in phase 3, as everything is already expanded.
		ts = this.transformers;

	for ( var i = 0; i < tokensLength; i++ ) {
		token = tokens[i];

		switch( token.type ) {
			case 'TAG':
			case 'ENDTAG':
			case 'SELFCLOSINGTAG':
				res = this._transformTagToken( token, cb, phaseEndRank );
				break;
			case 'TEXT':
				res = this._transformToken( token, cb, phaseEndRank, 
						ts.text );
				break;
			case 'COMMENT':
				res = this._transformToken( token, cb, phaseEndRank, ts.comment );
				break;
			case 'NEWLINE':
				res = this._transformToken( token, cb, phaseEndRank, ts.newline );
				break;
			case 'END':
				res = this._transformToken( token, cb, phaseEndRank, ts.end );
				break;
			default:
				res = this._transformToken( token, cb, phaseEndRank, ts.martian );
				break;
		}

		if( res.tokens ) {
			// Splice in the returned tokens (while replacing the original
			// token), and process them next.
			[].splice.apply( tokens, [i, 1].concat(res.tokens) );
			tokensLength = tokens.length;
			i--; // continue at first inserted token
		} else if ( res.token ) {
			if ( res.token.rank === phaseEndRank ) {
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
 * other.
 *
 * @class
 * @constructor
 * @param {Object} Containing TokenTransformManager
 */
function AttributeTransformManager ( manager, callback ) {
	this.callback = callback;
	var pipe = manager.newAttributePipeline( manager.args );
	pipe.addListener( 'chunk', this.onChunk.bind( this ) );
	pipe.addListener( 'end', this.onEnd.bind( this ) );
}

/**
 * Collect chunks returned from the pipeline
 */
AttributeTransformManager.prototype.onChunk = function ( chunk ) {
	this.callback( chunk, true );
};

/**
 * Empty the pipeline by returning to the parent
 */
AttributeTransformManager.prototype.onEnd = function ( ) {
	this.callback( [], false );
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
function TokenAccumulator ( parentCB ) {
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
 * @param {Object} token
 */
TokenAccumulator.prototype._returnTokens = function ( reference, tokens, notYetDone ) {
	var res,
		cb,
		returnTokens = [];

	if ( ! notYetDone ) {
		this.outstanding--;
	}

	if ( reference === 'child' ) {
		// XXX: Use some marker to avoid re-transforming token chunks several
		// times?
		res = this.transformTokens( tokens, this.parentCB );

		if ( res.async ) {
			// new asynchronous expansion started, chain of accumulators
			// created
			if ( this.outstanding === 0 ) {
				// Last accum in chain should only wait for child
				res.async.outstanding--;
				cb = this.parentCB;
			} else {
				cb = this.parentCB;
				// set own callback to new sibling, the end of accumulator chain
				this.parentCB = res.async.getParentCB( 'sibling' );
			}
		}
		if ( ! notYetDone ) {
			// Child is done, return accumulator from sibling. Siblings
			// process tokens themselves, so we concat those to the result of
			// processing tokens from the child.
			tokens = res.tokens.concat( this.accum );
			this.accum = [];
		}
		this.cb( res.tokens, res.async );
		return null;
	} else {
		// sibling
		if ( this.outstanding === 0 ) {
			tokens = this.accum.concat( tokens );
			// A sibling will transform tokens, so we don't have to do this
			// again.
			this.parentCB( res.tokens, false );
			return null;
		} else if ( this.outstanding === 1 && notYetDone ) {
			// Sibling is not yet done, but child is. Return own parentCB to
			// allow the sibling to go direct, and call back parent with
			// tokens. The internal accumulator is empty at this stage, as its
			// tokens are passed to the parent when the child is done.
			return this.parentCB( tokens, true);
		}


	}
};

/**
 * Mark the sibling as done (normally at the tail of a chain).
 */
TokenAccumulator.prototype.siblingDone = function () {
	this._returnTokens01 ( 'sibling', [], false );
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
 * Loop check helper class for AsyncTokenTransformManager.
 *
 * We use a bottom-up linked list to allow sharing of paths between async
 * expansions.
 *
 * @class
 * @constructor
 */
function LoopCheck ( parent, title ) {
	if ( parent ) {
		this.parent = parent;
	} else {
		this.parent = null;
	}
	this.title = title;
}

/**
 * Check if expanding <title> would lead to a loop.
 *
 * @method
 * @param {String} Title to check.
 */
LoopCheck.prototype.check = function ( title ) {
	var elem = this;
	do {
		if ( elem.title === title ) {
			// Loop detected
			return true;
		}
		elem = elem.parent;
	} while ( elem );
	// No loop detected.
	return false;
};

if (typeof module == "object") {
	module.exports.AsyncTokenTransformManager = AsyncTokenTransformManager;
	module.exports.SyncTokenTransformManager = SyncTokenTransformManager;
}
