/**
 * Constructors for different token types. Plain text is represented as simple
 * strings or String objects (if attributes are needed).
 */

var async = require('async');

var toString = function() { return JSON.stringify( this ); };

function TagTk( name, attribs, dataAttribs ) { 
	//this.type = 'TAG';
	this.name = name;
	this.attribs = attribs || [];
	this.dataAttribs = dataAttribs || {};
}
TagTk.prototype = {};
TagTk.prototype.toJSON = function () {
	return $.extend( { type: 'TagTk' }, this );
};
TagTk.prototype.constructor = TagTk;
TagTk.prototype.toString = toString;

function EndTagTk( name, attribs, dataAttribs ) { 
	this.name = name;
	this.attribs = attribs || [];
	this.dataAttribs = dataAttribs || {};
}
EndTagTk.prototype = {};
EndTagTk.prototype.toJSON = function () {
	return $.extend( { type: 'EndTagTk' }, this );
};
EndTagTk.prototype.constructor = EndTagTk;
EndTagTk.prototype.toString = toString;

function SelfclosingTagTk( name, attribs, dataAttribs ) { 
	//this.type = 'SELFCLOSINGTAG';
	this.name = name;
	this.attribs = attribs || [];
	this.dataAttribs = dataAttribs || {};
}
SelfclosingTagTk.prototype = {};
SelfclosingTagTk.prototype.toJSON = function () {
	return $.extend( { type: 'SelfclosingTagTk' }, this );
};
SelfclosingTagTk.prototype.constructor = SelfclosingTagTk;
SelfclosingTagTk.prototype.toString = toString;

function NlTk( ) {
	//this.type = 'NEWLINE';
}
NlTk.prototype = {};
NlTk.prototype.toJSON = function () {
	return $.extend( { type: 'NlTk' }, this );
};
NlTk.prototype.constructor = NlTk;
NlTk.prototype.toString = toString;

function CommentTk( value ) { 
	this.value = value;
}
CommentTk.prototype = {};
CommentTk.prototype.toJSON = function () {
	return $.extend( { type: 'COMMENT' }, this );
};
CommentTk.prototype.constructor = CommentTk;
CommentTk.prototype.toString = toString; 

function EOFTk( ) { }
EOFTk.prototype = {};
EOFTk.prototype.toJSON = function () {
	return $.extend( { type: 'EOFTk' }, this );
};
EOFTk.prototype.constructor = EOFTk;
EOFTk.prototype.toString = toString;



// A key-value pair
function KV ( k, v ) {
	this.k = k;
	this.v = v;
}



/**
 * A parameter object wrapper, essentially an array of key/value pairs with a
 * few extra methods.
 *
 * It might make sense to wrap array results of array methods such as slice
 * into a params object too, so that users are not surprised by losing the
 * custom methods. Alternatively, the object could be made more abstract with
 * a separate .array method that just returns the plain array.
 */
function Params ( env, params ) {
	this.env = env;
	this.push.apply( this, params );
}

Params.prototype = [];
Params.prototype.constructor = Params;

Params.prototype.toString = function () {
	return this.slice(0).toString();
};

Params.prototype.dict = function () {
	var res = {};
	for ( var i = 0, l = this.length; i < l; i++ ) {
		var kv = this[i],
			key = this.env.tokensToString( kv.k ).trim();
		res[key] = kv.v;
	}
	//console.warn( 'KVtoHash: ' + JSON.stringify( res ));
	return res;
};

Params.prototype.named = function () {
	var n = 1,
		out = {};
	for ( var i = 0, l = this.length; i < l; i++ ) {
		// FIXME: Also check for whitespace-only named args!
		var k = this[i].k;
		if ( k.constructor === String ) {
			k = k.trim();
		}
		if ( ! k.length ) {
			out[n.toString()] = this[i].v;
			n++;
		} else if ( k.constructor === String ) {
			out[k] = this[i].v;
		} else {
			out[this.env.tokensToString( k ).trim()] = this[i].v;
		}
	}
	return out;
};

/**
 * Expand a slice of the parameters using the supplied get options.
 */
Params.prototype.getSlice = function ( options, start, end ) {
	var args = this.slice( start, end ),
		cb = options.cb;
	//console.warn( JSON.stringify( args ) );
	async.map( 
			args,
			function( kv, cb2 ) {
				if ( kv.v.constructor === String ) {
					// nothing to do
					cb2( null, kv );
				} else if ( kv.v.constructor === Array &&
					// remove String from Array
					kv.v.length === 1 && kv.v[0].constructor === String ) {
						cb2( null, new KV( kv.k, kv.v[0] ) );
				} else {
					// Expand the value
					var o2 = $.extend( {}, options );
					// add in the key
					o2.cb = function ( v ) {
						cb2( null, new KV( kv.k, v ) );
					};
					kv.v.get( o2 );
				}
			},
			function( err, res ) {
				if ( err ) {
					console.trace();
					throw JSON.stringify( err );
				}
				//console.warn( 'getSlice res: ' + JSON.stringify( res ) );
				cb( res );
			});
};



/**
 * A chunk. Wraps a source chunk of tokens with a reference to a frame for
 * lazy and shared transformations. Do not use directly- use
 * frame.newParserValue instead!
 */
function ParserValue ( source, frame ) {
	if ( source.constructor === ParserValue ) {
		Object.defineProperty( this, 'source', 
				{ value: source.source, enumerable: false } );
	} else {
		Object.defineProperty( this, 'source', 
				{ value: source, enumerable: false } );
	}
	Object.defineProperty( this, 'frame', 
			{ value: frame, enumerable: false } );
}


ParserValue.prototype._defaultTransformOptions = {
	type: 'text/x-mediawiki/expanded'
};

ParserValue.prototype.toJSON = function() {
	return this.source;
};

ParserValue.prototype.get = function( options, cb ) {
	if ( ! options ) {
		options = $.extend({}, this._defaultTransformOptions);
	} else if ( options.type === undefined ) {
		options.type = this._defaultTransformOptions.type;
	}

	// convenience cb override for async-style functions that pass a cb as the
	// last argument
	if ( cb === undefined ) {
		cb = options.cb;
	}

	var maybeCached;
	if ( this.source.constructor === String ) {
		maybeCached = this.source;
	} else {
		// try the cache
		maybeCached = this.source.cache && this.source.cache.get( this.frame, options );
	}
	if ( maybeCached !== undefined ) {
		if ( cb ) {
			cb ( maybeCached );
		} else {
			return maybeCached;
		}
	} else {
		if ( ! options.cb ) {
			console.trace();
			throw "Chunk.get: Need to expand asynchronously, but no cb provided! " +
				JSON.stringify( this, null, 2 );
		}
		options.cb = cb;
		this.frame.expand( this.source, options );
	}
};

ParserValue.prototype.length = function () {
	return this.source.length;
};


//Chunk.prototype.slice = function () {
//	return this.source.slice.apply( this.source, arguments );
//};


// TODO: don't use globals!
if (typeof module == "object") {
	module.exports = {};
	global.TagTk = TagTk;
	global.EndTagTk = EndTagTk;
	global.SelfclosingTagTk = SelfclosingTagTk;
	global.NlTk = NlTk;
	global.CommentTk = CommentTk;
	global.EOFTk = EOFTk;
	global.KV = KV;
	global.Params = Params;
	global.ParserValue = ParserValue;
}
