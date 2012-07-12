/**
 * Constructors for different token types. Plain text is represented as simple
 * strings or String objects (if attributes are needed).
 */

var async = require('async');
require('./core-upgrade.js');


function TagTk( name, attribs, dataAttribs ) { 
	this.name = name;
	this.attribs = attribs || [];
	this.dataAttribs = dataAttribs || {};
}

// SSS: Hacky!
TagTk.toStringTokens = function(tokens, separator) {
	if (tokens.constructor !== Array) {
		return tokens.toString();
	} else if (tokens.length === 0) {
		return null;
	} else {
		var buf = []; 
		for (var i = 0, n = tokens.length; i < n; i++) {
			buf.push(tokens[i].toString());
		}
		if (!separator) separator = "\n";
		return buf.join(separator);
	}
}

TagTk.prototype = {
	constructor: TagTk,

	toJSON: function () {
		return $.extend( { type: 'TagTk' }, this );
	},

	defaultToString: function(t) {
		return "<" + this.name + ">";
	},

	tagToStringFns: {
		"listItem": function() {
			return "<li:" + this.bullets.join('') + ">";
		},
		"mw-quote": function() {
			return "<mw-quote:" + this.value + ">";
		},
		"urllink": function() {
			return "<urllink:" + this.attribs[0].v + ">";
		},
		"behavior-switch": function() {
			return "<behavior-switch:" + this.attribs[0].v + ">";
		}
	},

	toString: function() {
		if (this.dataAttribs.stx && this.dataAttribs.stx === "html") {
			return "<HTML:" + this.name + ">";
		} else {
			var f = this.tagToStringFns[this.name];
			return f ? f.bind(this)() : this.defaultToString();
		}
	}
};

function EndTagTk( name, attribs, dataAttribs ) { 
	this.name = name;
	this.attribs = attribs || [];
	this.dataAttribs = dataAttribs || {};
}

EndTagTk.prototype = {
	constructor: EndTagTk,

	toJSON: function () {
		return $.extend( { type: 'EndTagTk' }, this );
	},

	toString: function() {
		if (this.dataAttribs.stx && this.dataAttribs.stx === "html") {
			return "</HTML:" + this.name + ">";
		} else {
			return "</" + this.name + ">";
		}
	}
};

function SelfclosingTagTk( name, attribs, dataAttribs ) { 
	this.name = name;
	this.attribs = attribs || [];
	this.dataAttribs = dataAttribs || {};
}

SelfclosingTagTk.prototype = {
	constructor: SelfclosingTagTk,

	toJSON: function () {
		return $.extend( { type: 'SelfclosingTagTk' }, this );
	},

	defaultToString: function(compact) {
		if (compact) {
			var buf = "<" + this.name + ">:";
			return (this.attribs[0]) ? buf + TagTk.toStringTokens(this.attribs[0].k) : buf;
		} else {
			var buf = ["<" + this.name + ">:{"];
			for (var i = 0, n = this.attribs.length; i < n; i++) {
				var a = this.attribs[i];
				var kStr = TagTk.toStringTokens(a.k);
				if (kStr) buf.push("k={" + kStr + "}");
				else buf.push("k=");
				var vStr = TagTk.toStringTokens(a.v);
				if (vStr) buf.push("v={" + vStr + "}");
				else buf.push("v=");
			}

			buf.push("}");
			return buf.join("\n");
		}
	},

	tagToStringFns: { },

	toString: function(compact) {
		if (this.dataAttribs.stx && this.dataAttribs.stx === "html") {
			return "<HTML:" + this.name + " />";
		} else {
			var f = this.tagToStringFns[this.name];
			return f ? f.bind(this)(compact) : this.defaultToString(compact);
		}
	}
};

function NlTk( ) { }

NlTk.prototype = {
	constructor: NlTk,

	toJSON: function () {
		return $.extend( { type: 'NlTk' }, this );
	},

	toString: function() {
		return "\\n";
	}
};

function CommentTk( value, dataAttribs ) { 
	this.value = value;
	// won't survive in the DOM, but still useful for token serialization
	if ( dataAttribs !== undefined ) {
		this.dataAttribs = dataAttribs;
	}
}

CommentTk.prototype = {
	constructor: CommentTk,

	toJSON: function () {
		return $.extend( { type: 'COMMENT' }, this );
	},

	toString: function() {
		return "<!--" + this.value + "-->";
	}
};

function EOFTk( ) { }
EOFTk.prototype = {
	constructor: EOFTk,

	toJSON: function () {
		return $.extend( { type: 'EOFTk' }, this );
	},

	toString: function() {
		return "";
	}
};


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

Params.prototype = [].mergeProperties({
	constructor: Params,

	toString: function () {
		return this.slice(0).toString();
	},

	dict: function () {
		var res = {};
		for ( var i = 0, l = this.length; i < l; i++ ) {
			var kv = this[i],
				key = this.env.tokensToString( kv.k ).trim();
			res[key] = kv.v;
		}
		//console.warn( 'KVtoHash: ' + JSON.stringify( res ));
		return res;
	},

	named: function () {
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
	},

	/**
	 * Expand a slice of the parameters using the supplied get options.
	 */
	getSlice: function ( options, start, end ) {
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
	}
});


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

ParserValue.prototype = {
	_defaultTransformOptions: {
		type: 'text/x-mediawiki/expanded'
	},

	toJSON: function() {
		return this.source;
	},

	get: function( options, cb ) {
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
	},

	length: function () {
		return this.source.length;
	}
};


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
