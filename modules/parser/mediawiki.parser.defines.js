/**
 * Constructors for different token types. Plain text is represented as simple
 * strings or String objects (if attributes are needed).
 */

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


function ParamValue ( chunk, manager ) {
	this.chunk = chunk;
	this.manager = manager;
	this.cache = {};
}

ParamValue.prototype.expanded = function ( format, cb ) {
	if ( format === tokens ) {
		if ( this.cache.tokens ) {
			cb( this.cache.tokens );
		} else {
			var pipeline = this.manager.pipeFactory.getPipeline( 
					this.manager.attributeType || 'tokens/wiki', true
					);
			pipeline.setFrame( this.manager.frame, null );
		}
	} else {
		throw "ParamValue.expanded: Unsupported format " + format;
	}
};
		

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
}
