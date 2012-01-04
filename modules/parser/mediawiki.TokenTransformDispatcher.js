/* Generic token transformation dispatcher with support for asynchronous token
 * expansion. Individual transformations register for the token types they are
 * interested in and are called on each matching token. 
 *
 * See
 * https://www.mediawiki.org/wiki/Future/Parser_development/Token_stream_transformations
 * for more documentation.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

var events = require('events');

/**
 * Central dispatcher and manager for potentially asynchronous token
 * transformations.
 *
 * @class
 * @constructor
 * @param {Function} callback, a callback function accepting a token list as
 * its only argument.
 */
function TokenTransformDispatcher( ) {
	this.transformers = {
		// phase 0 and 1, rank 2 marks tokens as fully processed for these
		// phases.
		2: { 
			tag: {}, // for TAG, ENDTAG, SELFCLOSINGTAG, keyed on name
			text: [],
			newline: [],
			comment: [],
			end: [], // eof
			martian: [], // none of the above (unknown token type)
			any: []	// all tokens, before more specific handlers are run
		},
		// phase 3, with ranks >= 2 but < 3. 3 marks tokens as fully
		// processed.
		3: {
			tag: {}, // for TAG, ENDTAG, SELFCLOSINGTAG, keyed on name
			text: [],
			newline: [],
			comment: [],
			end: [], // eof
			martian: [], // none of the above (unknown token type)
			any: []	// all tokens, before more specific handlers are run
		}
	};
	this._reset();
}

// Inherit from EventEmitter
TokenTransformDispatcher.prototype = new events.EventEmitter();
TokenTransformDispatcher.prototype.constructor = TokenTransformDispatcher;

/**
 * Register to a token source, normally the tokenizer.
 * The event emitter emits a 'chunk' event with a chunk of tokens,
 * and signals the end of tokens by triggering the 'end' event.
 *
 * @param {Object} EventEmitter token even emitter.
 */
TokenTransformDispatcher.prototype.listenForTokensFrom = function ( tokenEmitter ) {
	tokenEmitter.addListener('chunk', this.transformTokens.bind( this ) );
	tokenEmitter.addListener('end', this.onEndEvent.bind( this ) );
};


/**
 * Reset the internal token and outstanding-callback state of the
 * TokenTransformDispatcher, but keep registrations untouched.
 *
 * @method
 */
TokenTransformDispatcher.prototype._reset = function ( env ) {
	this.tailAccumulator = undefined;
	this.phase2TailCB = this._returnTokens01.bind( this );
	this.accum = new TokenAccumulator(null);
	this.firstaccum = this.accum;
	this.prevToken = undefined;
	this.frame = {
		args: {}, // no arguments at the top level
		env: this.env
	};
	// Should be as static as possible re this and frame 
	// This is circular, but that should not really matter for non-broken GCs
	// that handle pure JS ref loops.
	this.frame.transformPhase = this._transformPhase01.bind( this, this.frame );
};

TokenTransformDispatcher.prototype._rankToPhase  = function ( rank ) {
	if ( rank < 0 || rank > 3 ) {
		throw "TransformDispatcher error: Invalid transformation rank " + rank;
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
TokenTransformDispatcher.prototype.addTransform = function ( transformation, rank, type, name ) {
	var phase = this._rankToPhase( rank ),
		transArr,
		transformer = { 
			transform: transformation,
			rank: rank
		};
	if ( type === 'tag' ) {
		name = name.toLowerCase();
		transArr = this.transformers[phase].tag[name];
		if ( ! transArr ) {
			transArr = this.transformers[phase].tag[name] = [];
		}
	} else {
		transArr = this.transformers[phase][type];
	}
	transArr.push(transformer);
	// sort ascending by rank
	transArr.sort( function ( t1, t2 ) { return t1.rank - t2.rank; } );
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
TokenTransformDispatcher.prototype.removeTransform = function ( rank, type, name ) {
	var i = -1,
		phase = this._rankToPhase( rank ),
		ts;

	function rankUnEqual ( i ) {
		return i.rank !== rank;
	}

	if ( type === 'tag' ) {
		name = name.toLowerCase();
		var maybeTransArr = this.transformers[phase].tag.name;
		if ( maybeTransArr ) {
			this.transformers[phase].tag.name = maybeTransArr.filter( rankUnEqual );
		}
	} else {
		this.transformers[phase][type] = this.transformers[phase][type].filter( rankUnEqual ) ;
	}
};

/**
 * Enforce separation between phases when token types or tag names have
 * changed, or when multiple tokens were returned. Processing will restart
 * with the new rank.
 */
TokenTransformDispatcher.prototype._resetTokenRank = function ( res, transformer ) {
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


/* Call all transformers on a tag.
 *
 * @method
 * @param {Object} The current token.
 * @param {Function} Completion callback for async processing.
 * @param {Number} Rank of phase end, both key for transforms and rank for
 * processed tokens.
 * @param {Object} The frame, contains a reference to the environment.
 * @returns {Object} Token(s) and async indication.
 */
TokenTransformDispatcher.prototype._transformTagToken = function ( token, cb, phaseEndRank, frame ) {
	// prepend 'any' transformers
	var ts = this.transformers[phaseEndRank].any,
		res = { token: token },
		transform,
		l, i,
		aborted = false,
		tName = token.name.toLowerCase(),
		tagts = this.transformers[phaseEndRank].tag[tName];

	if ( tagts ) {
		ts = ts.concat(tagts);
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
			res = transformer.transform( res.token, cb, frame, this.prevToken );
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
 *
 * @method
 * @param {Object} The current token.
 * @param {Function} Completion callback for async processing.
 * @param {Number} Rank of phase end, both key for transforms and rank for
 * processed tokens.
 * @param {Object} The frame, contains a reference to the environment.
 * @param {Array} ts List of token transformers for this token type.
 * @returns {Object} Token(s) and async indication.
 */
TokenTransformDispatcher.prototype._transformToken = function ( token, cb, phaseEndRank, frame, ts ) {
	// prepend 'any' transformers
	ts = this.transformers[phaseEndRank].any.concat(ts);
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
			res = transformer.transform( res.token, cb, frame, this.prevToken );
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

/**
 * Transform and expand tokens.
 *
 * Callback for token chunks emitted from the tokenizer.
 */
TokenTransformDispatcher.prototype.transformTokens = function ( tokens ) {
	//console.log('TokenTransformDispatcher transformTokens');
	var res = this._transformPhase01 ( this.frame, tokens, this.phase2TailCB );
	this.phase2TailCB( tokens, true );
	if ( res.async ) {
		this.tailAccumulator = res.async;
		this.phase2TailCB = res.async.getParentCB ( 'sibling' );
	}
};

/**
 * Callback for the end event emitted from the tokenizer.
 * Either signals the end of input to the tail of an ongoing asynchronous
 * processing pipeline, or directly emits 'end' if the processing was fully
 * synchronous.
 */
TokenTransformDispatcher.prototype.onEndEvent = function () {
	if ( this.tailAccumulator ) {
		this.tailAccumulator.siblingDone();
	} else {
		// nothing was asynchronous, so we'll have to emit end here.
		this.emit('end');
		this._reset();
	}
};


/**
 * Run transformations from phases 0 and 1. This includes starting and
 * managing asynchronous transformations.
 *
 * return protocol for transform*Token:
 *		{ tokens: [tokens], async: true }: async expansion -> outstanding++ in parent
 *		{ tokens: [tokens] }: fully expanded, tokens will be reprocessed
 *		{ token: token }: single-token return
 */
TokenTransformDispatcher.prototype._transformPhase01 = function ( frame, tokens, parentCB ) {

	//console.log('_transformPhase01: ' + JSON.stringify(tokens) );
	
	var res,
		phaseEndRank = 2,
		// Prepare a new accumulator, to be used by async children (if any)
		localAccum = [],
		accum = new TokenAccumulator( parentCB ),
		cb = accum.getParentCB( 'child' ),
		activeAccum = null,
		tokensLength = tokens.length,
		token,
		ts = this.transformers[phaseEndRank];

	for ( var i = 0; i < tokensLength; i++ ) {
		token = tokens[i];

		switch( token.type ) {
			case 'TAG':
			case 'ENDTAG':
			case 'SELFCLOSINGTAG':
				res = this._transformTagToken( token, cb, phaseEndRank, frame );
				break;
			case 'TEXT':
				res = this._transformToken( token, cb, phaseEndRank, frame, ts.text );
				break;
			case 'COMMENT':
				res = this._transformToken( token, cb, phaseEndRank, frame, ts.comment);
				break;
			case 'NEWLINE':
				res = this._transformToken( token, cb, phaseEndRank, frame, ts.newline );
				break;
			case 'END':
				res = this._transformToken( token, cb, phaseEndRank, frame, ts.end );
				break;
			default:
				res = this._transformToken( token, cb, phaseEndRank, frame, ts.martian );
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
 */
TokenTransformDispatcher.prototype._returnTokens01 = function ( tokens, notYetDone ) {
	// FIXME: store frame in object?
	tokens = this._transformPhase2( this.frame, tokens, this.parentCB );
	//console.log('_returnTokens01, after _transformPhase2.');

	this.emit( 'chunk', tokens );

	if ( ! notYetDone ) {
		console.log('_returnTokens01 done.');
		// signal our done-ness to consumers.
		this.emit( 'end' );
		// and reset internal state.
		this._reset();
	}
};


/**
 * Phase 3 (rank [2,3))
 *
 * Global in-order traversal on expanded token stream (after async phase 1).
 * Very similar to _transformPhase01, but without async handling.
 */
TokenTransformDispatcher.prototype._transformPhase2 = function ( frame, tokens, cb ) {
	var res,
		phaseEndRank = 3,
		localAccum = [],
		localAccumLength = 0,
		tokensLength = tokens.length,
		token,
		ts = this.transformers[phaseEndRank];

	for ( var i = 0; i < tokensLength; i++ ) {
		token = tokens[i];

		switch( token.type ) {
			case 'TAG':
			case 'ENDTAG':
			case 'SELFCLOSINGTAG':
				res = this._transformTagToken( token, cb, phaseEndRank, 
						frame );
				break;
			case 'TEXT':
				res = this._transformToken( token, cb, phaseEndRank, frame, 
						ts.text );
				break;
			case 'COMMENT':
				res = this._transformToken( token, cb, phaseEndRank, frame, 
						ts.comment );
				break;
			case 'NEWLINE':
				res = this._transformToken( token, cb, phaseEndRank, frame, 
						ts.newline );
				break;
			case 'END':
				res = this._transformToken( token, cb, phaseEndRank, frame,
						ts.end );
				break;
			default:
				res = this._transformToken( token, cb, phaseEndRank, frame,
						ts.martian );
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
	return localAccum;
};


/**
 * Token accumulators buffer tokens between asynchronous processing points,
 * and return fully processed token chunks in-order and as soon as possible. 
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
	return this._returnTokens01.bind( this, reference );
};

/**
 * Pass tokens to an accumulator
 *
 * @method
 * @param {Object} token
 */
TokenAccumulator.prototype._returnTokens01 = function ( reference, tokens, notYetDone ) {
	var res,
		cb,
		returnTokens = [];

	if ( ! notYetDone ) {
		this.outstanding--;
	}

	if ( reference === 'child' ) {
		// XXX: Use some marker to avoid re-transforming token chunks several
		// times?
		res = this._transformPhase01( this.frame, tokens, this.parentCB );

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



if (typeof module == "object") {
	module.exports.TokenTransformDispatcher = TokenTransformDispatcher;
}
