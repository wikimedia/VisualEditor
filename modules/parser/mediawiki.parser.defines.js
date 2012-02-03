/**
 * Constructors for different token types. Plain text is represented as simple
 * strings or String objects (if attributes are needed).
 */
function TagTk( name, attribs ) { 
	//this.type = 'TAG';
	this.name = name;
	this.attribs = attribs || [];
}

TagTk.prototype.toJSON = function () {
	return {
		type: 'TagTk',
		name: this.name,
		attribs: this.attribs
	};
};

function EndTagTk( name, attribs ) { 
	//this.type = 'ENDTAG';
	this.name = name;
	this.attribs = attribs || [];
}
EndTagTk.prototype.toJSON = function () {
	return {
		type: 'EndTagTk',
		name: this.name,
		attribs: this.attribs
	};
};

function SelfclosingTagTk( name, attribs ) { 
	//this.type = 'SELFCLOSINGTAG';
	this.name = name;
	this.attribs = attribs || [];
}
SelfclosingTagTk.prototype.toJSON = function () {
	return {
		type: 'SelfclosingTagTk',
		name: this.name,
		attribs: this.attribs
	};
};

function NlTk( ) {
	//this.type = 'NEWLINE';
}
NlTk.prototype.toJSON = function () {
	return { type: 'NlTk' };
};

function CommentTk( value ) { 
	this.type = 'COMMENT';
	this.value = value;
}
CommentTk.prototype.toJSON = function () {
	return {
		type: 'COMMENT',
		value: this.value
	};
};
function EOFTk( ) {
	this.type = 'END';
}
EOFTk.prototype.toJSON = function () {
	return { type: 'EOFTk' };
};

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
