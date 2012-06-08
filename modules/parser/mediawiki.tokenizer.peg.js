/**
 * Tokenizer for wikitext, using PEG.js and a separate PEG grammar file
 * (pegTokenizer.pegjs.txt)
 *
 * Use along with a HTML5TreeBuilder and the DOMPostProcessor(s) for HTML
 * output.
 *
 */

var PEG = require('pegjs'),
	path = require('path'),
	LRU = require("lru-cache"),
	fs = require('fs'),
	$ = require('jquery'),
	events = require('events'),
	//colors = require('colors'),
	defines = require('./mediawiki.parser.defines.js');

function PegTokenizer( env, canCache ) {
	this.env = env;
	this.canCache = canCache;
	if ( this.canCache ) {
		this.cacheAccum = { chunks: [] };
	}
}



// Inherit from EventEmitter
PegTokenizer.prototype = new events.EventEmitter();
PegTokenizer.prototype.constructor = PegTokenizer;

PegTokenizer.src = false;

/*
 * The main worker. Sets up event emission ('chunk' and 'end' events).
 * Consumers are supposed to register with PegTokenizer before calling
 * process().
 */
PegTokenizer.prototype.process = function( text, cacheKey ) {
	var out, err;
	if ( !this.tokenizer ) {
		// Construct a singleton static tokenizer.
		var pegSrcPath = path.join( __dirname, 'pegTokenizer.pegjs.txt' );
		this.src = fs.readFileSync( pegSrcPath, 'utf8' );
		var tokenizerSource = PEG.buildParser(this.src, 
				{ cache: true, trackLineAndColumn: false }).toSource();

		/* We patch the generated source to assign the arguments array for the
		* parse function to a function-scoped variable. We use this to pass
		* in callbacks and other information, which can be used from actions
		* run when matching a production. In particular, we pass in a
		* callback called for a chunk of tokens in toplevelblock. Setting this
		* callback per call to parse() keeps the tokenizer reentrant, so that it
		* can be reused to expand templates while a main parse is ongoing.
		* PEG tokenizer construction is very expensive, so having a single
		* reentrant tokenizer is a big win.
		*
		* We could also make modules available to the tokenizer by prepending
		* requires to the source.
		*/
		tokenizerSource = tokenizerSource.replace( 'parse: function(input, startRule) {',
					'parse: function(input, startRule) { var __parseArgs = arguments;' )
						// Include the stops key in the cache key
						.replace(/var cacheKey = "[^@"]+@" \+ pos/g, 
								function(m){ return m +' + stops.key'; });
		//console.warn( tokenizerSource );
		PegTokenizer.prototype.tokenizer = eval( tokenizerSource );
		// alias the parse method
		this.tokenizer.tokenize = this.tokenizer.parse;

		// Also, while we are at it, create a tokenizer cache.
		PegTokenizer.prototype.cache = LRU(25);
	}
	if ( this.canCache ) {
		var maybeCached = this.cache.get(cacheKey);
		if ( maybeCached ) {
			this.env.tp( 'tokenizer cache hit for ' + cacheKey );
			//console.warn( JSON.stringify( maybeCached, null, 2 ) );
			for ( var i = 0, l = maybeCached.length; i < l; i++ ) {
				// emit a clone of this chunk
				this.emit('chunk', maybeCached[i] );
			}
			this.emit('end');
			return;
		} else {
			this.cacheAccum.key = cacheKey;
		}
	}


	// Some input normalization: force a trailing newline
	//if ( text.substring(text.length - 1) !== "\n" ) {
	//	text += "\n";
	//}

	var chunkCB;
	if ( this.canCache ) {
		chunkCB = this.onCacheChunk.bind( this );
	} else {
		chunkCB = this.emit.bind( this, 'chunk' );
	}
	// XXX: Commented out exception handling during development to get
	// reasonable traces.
	if ( ! this.env.debug ) {
		try {
			this.tokenizer.tokenize(text, 'start', 
					// callback
					chunkCB,
					// inline break test
					this
					);
			this.onEnd();
		} catch (e) {
			console.warn( 'Tokenizer error in ' + cacheKey + ': ' + e );
			console.trace();
			chunkCB( ['Tokenizer error in ' + cacheKey + ': ' + e] );
			this.onEnd();
		}
	} else {
		this.tokenizer.tokenize(text, 'start', 
				// callback
				chunkCB,
				// inline break test
				this
				);
		this.onEnd();
	}
};

PegTokenizer.prototype.onCacheChunk = function ( chunk ) {
	// make a deep copy of the chunk for now
	this.cacheAccum.chunks.push( chunk.slice() );
	//console.warn( 'onCacheChunk: ' + this.cacheAccum.key + JSON.stringify( chunk, null, 2 ) );
	this.emit('chunk', chunk);
};

PegTokenizer.prototype.onEnd = function ( ) {
	if ( this.canCache ) {
		this.cache.set(this.cacheAccum.key, this.cacheAccum.chunks);
		// reset cacheAccum
		this.cacheAccum = { chunks: [] };
	}

	this.emit('end');
};

PegTokenizer.prototype.processImageOptions = function( text ) {
		return this.tokenizer.tokenize(text, 'img_options', null, this );
};

/**
 * Tokenize a URL
 */
PegTokenizer.prototype.tokenizeURL = function( text ) {
	try {
		return this.tokenizer.tokenize(text, 'url', null, this );
	} catch ( e ) {
		return false;
	}
};

/*
 * Inline breaks, flag-enabled production which detects end positions for
 * active higher-level productions in inline and other nested productions.
 * Those inner productions are then exited, so that the outer production can
 * handle the end marker.
 */
PegTokenizer.prototype.inline_breaks = function (input, pos, stops ) {
	var counters = stops.counters;
	switch( input[pos] ) {
		case '=':
			return stops.onStack( 'equal' ) ||
				( counters.h &&
					( pos === input.length - 1 ||
					  input.substr( pos + 1, 200)
						.match(/[ \t]*(?:[\r\n]|$)/) !== null ) 
				) || null;
		case '|':
			return counters.pipe ||
					counters.template ||
					counters.linkdesc ||
				( stops.onStack('table') &&
					( ( pos < input.length - 1 &&
					  input[pos + 1].match(/[|}]/) !== null ) ||
						counters.tableCellArg
					) 
				) || null;
		case '{':
			// {{!}} pipe templates..
			return (
						counters.pipe ||
						( stops.onStack( 'table' ) &&
							( 
								input.substr(pos, 10) === '{{!}}{{!}}' ||
								counters.tableCellArg
							)
						)
					) && input.substr( pos, 5 ) === '{{!}}' || null;
		case "!":
			return stops.onStack( 'table' ) && input[pos + 1] === "!" ||
				null;
		case "}":
			return counters.template && input[pos + 1] === "}" || null;
		case ":":
			return counters.colon &&
				! stops.onStack( 'extlink' ) &&
				! counters.linkdesc || null;
		case "\r":
			return stops.onStack( 'table' ) &&
				input.substr(pos).match(/\r\n?\s*[!|]/) !== null ||
				null;
		case "\n":
			//console.warn(input.substr(pos, 5));
			return ( stops.onStack( 'table' ) &&
				// allow leading whitespace in tables
				input.substr(pos, 200).match( /^\n\s*[!|]/ ) ) ||
				// break on table-like syntax when the table stop is not
				// enabled. XXX: see if this can be improved
				//input.substr(pos, 200).match( /^\n[!|]/ ) ||
				null;
		case "]":
			return stops.onStack( 'extlink' ) ||
				( counters.linkdesc && input[pos + 1] === ']' ) ||
				null;
		case "<":
			return ( counters.pre &&  input.substr( pos, 6 ) === '<pre>' ) ||
				( counters.noinclude && input.substr(pos, 12) === '</noinclude>' ) ||
				( counters.includeonly && input.substr(pos, 14) === '</includeonly>' ) ||
				( counters.onlyinclude && input.substr(pos, 14) === '</onlyinclude>' ) ||
				null;
		default:
			return null;
	}
};

// Alternate version of the above. The hash is likely faster, but the nested
// function calls seem to cancel that out.
PegTokenizer.prototype.breakMap = {
	'=': function(input, pos, syntaxFlags) { 
		return syntaxFlags.equal ||
			( syntaxFlags.h &&
				input.substr( pos + 1, 200)
				.match(/[ \t]*[\r\n]/) !== null ) || null;
	},
	'|': function ( input, pos, syntaxFlags ) {
		return syntaxFlags.template ||
			syntaxFlags.linkdesc ||
			( syntaxFlags.table &&
				( 
					input[pos + 1].match(/[|}]/) !== null ||
					syntaxFlags.tableCellArg
				) 
			) || null;
	},
	"!": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.table && input[pos + 1] === "!" ||
			null;
	},
	"}": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.template && input[pos + 1] === "}" || null;
	},
	":": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.colon &&
			! syntaxFlags.extlink &&
			! syntaxFlags.linkdesc || null;
	},
	"\r": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.table &&
			input.substr(pos, 4).match(/\r\n?[!|]/) !== null ||
			null;
	},
	"\n": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.table &&
			input[pos + 1] === '!' ||
			input[pos + 1] === '|' ||
			null;
	},
	"]": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.extlink ||
			( syntaxFlags.linkdesc && input[pos + 1] === ']' ) ||
			null;
	},
	"<": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.pre &&  input.substr( pos, 6 ) === '</pre>' || null;
	}
};

PegTokenizer.prototype.inline_breaks_hash = function (input, pos, syntaxFlags ) {
	return this.breakMap[ input[pos] ]( input, pos, syntaxFlags);
	//console.warn( 'ilbn res: ' + JSON.stringify( [ res, input.substr( pos, 4 ) ] ) );
	//return res;
};



if (typeof module == "object") {
	module.exports.PegTokenizer = PegTokenizer;
}
