/**
 * Constructors for different token types. Plain text is represented as simple
 * strings or String objects (if attributes are needed).
 */
function TagTk( name, attribs ) { 
	//this.type = 'TAG';
	this.name = name;
	this.attribs = attribs || [];
}

function EndTagTk( name, attribs ) { 
	//this.type = 'ENDTAG';
	this.name = name;
	this.attribs = attribs || [];
}
function SelfclosingTagTk( name, attribs ) { 
	//this.type = 'SELFCLOSINGTAG';
	this.name = name;
	this.attribs = attribs || [];
}
function NlTk( ) {
	//this.type = 'NEWLINE';
}
function CommentTk( value ) { 
	this.type = 'COMMENT';
	this.value = value;
}
function EOFTk( ) {
	this.type = 'END';
}

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
