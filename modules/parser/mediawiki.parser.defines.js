/**
 * Constructors for different token types. Plain text is represented as simple
 * strings or String objects (if attributes are needed).
 */

var toString = function() { return JSON.stringify( this ); }

function TagTk( name, attribs ) { 
	//this.type = 'TAG';
	this.name = name;
	this.attribs = attribs || [];
}
TagTk.prototype = new Object();
TagTk.prototype.toJSON = function () {
	return $.extend( { type: 'TagTk' }, this );
};
TagTk.prototype.constructor = TagTk;
TagTk.prototype.toString = toString;

function EndTagTk( name, attribs ) { 
	//this.type = 'ENDTAG';
	this.name = name;
	this.attribs = attribs || [];
}
EndTagTk.prototype = new Object();
EndTagTk.prototype.toJSON = function () {
	return $.extend( { type: 'EndTagTk' }, this );
};
EndTagTk.prototype.constructor = EndTagTk;
EndTagTk.prototype.toString = toString;

function SelfclosingTagTk( name, attribs ) { 
	//this.type = 'SELFCLOSINGTAG';
	this.name = name;
	this.attribs = attribs || [];
}
SelfclosingTagTk.prototype = new Object();
SelfclosingTagTk.prototype.toJSON = function () {
	return $.extend( { type: 'SelfclosingTagTk' }, this );
};
SelfclosingTagTk.prototype.constructor = SelfclosingTagTk;
SelfclosingTagTk.prototype.toString = toString;

function NlTk( ) {
	//this.type = 'NEWLINE';
}
NlTk.prototype = new Object();
NlTk.prototype.toJSON = function () {
	return $.extend( { type: 'NlTk' }, this );
};
NlTk.prototype.constructor = NlTk;
NlTk.prototype.toString = toString;

function CommentTk( value ) { 
	this.type = 'COMMENT';
	this.value = value;
}
CommentTk.prototype = new Object();
CommentTk.prototype.toJSON = function () {
	return $.extend( { type: 'COMMENT' }, this );
};
CommentTk.prototype.constructor = CommentTk;
CommentTk.prototype.toString = toString; 

function EOFTk( ) {
	this.type = 'END';
}
EOFTk.prototype = new Object();
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

if (typeof module == "object") {
	module.exports = {};
	global.TagTk = TagTk;
	global.EndTagTk = EndTagTk;
	global.SelfclosingTagTk = SelfclosingTagTk;
	global.NlTk = NlTk;
	global.CommentTk = CommentTk;
	global.EOFTk = EOFTk;
	global.KV = KV;
}
