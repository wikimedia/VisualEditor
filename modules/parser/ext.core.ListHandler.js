/*
 * Create list tag around list items and map wiki bullet levels to html
 */

var Util = require('./mediawiki.Util.js').Util;

function ListHandler ( manager ) {
	this.manager = manager;
	this.reset();
	this.manager.addTransform(this.onListItem.bind(this), 
							"ListHandler:onListItem",
							this.listRank, 'tag', 'listItem' );
	this.manager.addTransform( this.onEnd.bind(this),
							"ListHandler:onEnd",
							this.listRank, 'end' );
}

ListHandler.prototype.listRank = 2.49; // before PostExpandParagraphHandler
ListHandler.prototype.anyRank = 2.49 + 0.001; // before PostExpandParagraphHandler

ListHandler.prototype.bulletCharsMap = {
	'*': { list: 'ul', item: 'li' },
	'#': { list: 'ol', item: 'li' },
	';': { list: 'dl', item: 'dt' },
	':': { list: 'dl', item: 'dd' }
};

ListHandler.prototype.reset = function() {
	this.newline = false; // flag to identify a list-less line that terminates
						// a list block
	this.bstack = []; // Bullet stack, previous element's listStyle
	this.endtags = [];  // Stack of end tags
};

ListHandler.prototype.onAny = function ( token, frame, prevToken ) {
	var tokens;
	if ( token.constructor === NlTk ) {
		if (this.newline) {
			// second newline without a list item in between, close the list
			tokens = this.end().concat( [token] );
			this.newline = false;
		} else {
			tokens = [token];
			this.newline = true;
		}
		return { tokens: tokens };
	} else if ( this.newline ) {
		tokens = this.end().concat( [token] );
		this.newline = false;
		return { tokens: tokens };
	} else {
		return { token: token };
	}
};


ListHandler.prototype.onEnd = function( token, frame, prevToken ) {
	return { tokens: this.end().concat([token]) };
};

ListHandler.prototype.end = function( ) {
	// pop all open list item tokens
	var tokens = this.popTags(this.bstack.length);
	this.reset();
	this.manager.removeTransform( this.anyRank, 'any' );
	return tokens;
};

ListHandler.prototype.onListItem = function ( token, frame, prevToken ) {
	this.newline = false;
	if (token.constructor === TagTk){
		// convert listItem to list and list item tokens
		return { tokens: this.doListItem(this.bstack, token.bullets, token) };
	}
	return { token: token };
};

ListHandler.prototype.commonPrefixLength = function (x, y) {
	var minLength = Math.min(x.length, y.length);
	for(var i = 0; i < minLength; i++) {
		if (x[i] != y[i]) break;
	}
	return i;
};

ListHandler.prototype.pushList = function ( container ) {
	this.endtags.push( new EndTagTk( container.list ));
	this.endtags.push( new EndTagTk( container.item ));
	return [
		new TagTk( container.list ),
		new TagTk( container.item )
	];
};

ListHandler.prototype.popTags = function ( n ) {
	var tokens = [];
	for(;n > 0; n--) {
		// push list item..
		tokens.push(this.endtags.pop());
		// and the list end tag
		tokens.push(this.endtags.pop());
	}
	return tokens;
};

ListHandler.prototype.isDtDd = function (a, b) {
	var ab = [a,b].sort();
	return (ab[0] === ':' && ab[1] === ';');
};

ListHandler.prototype.doListItem = function ( bs, bn, token ) {
	var prefixLen = this.commonPrefixLength (bs, bn),
		changeLen = Math.max(bs.length, bn.length) - prefixLen,
		prefix = bn.slice(0, prefixLen);
	this.newline = false;
	this.bstack = bn;
	if (!bs.length) {
		this.manager.addTransform( this.onAny.bind(this), "ListHandler:onAny",
				this.anyRank, 'any' );
	}
	
	var itemToken;

	// emit close tag tokens for closed lists
	var res;
	if (changeLen === 0) {
		itemToken = this.endtags.pop();
		this.endtags.push(new EndTagTk( itemToken.name ));
		res = [
			itemToken,
			new TagTk( itemToken.name, [], token.dataAttribs )
		];
	} else {
		var tokens = [];
		if ( bs.length > prefixLen && 
			 bn.length > prefixLen && 
			this.isDtDd( bs[prefixLen], bn[prefixLen] ) )
		{
			tokens = this.popTags(bs.length - prefixLen - 1);
			// handle dd/dt transitions
			var newName = this.bulletCharsMap[bn[prefixLen]].item;
			var endTag = this.endtags.pop();
			this.endtags.push(new EndTagTk( newName ));
			// TODO: review dataAttribs forwarding here and below in
			// doListItem, in particular re accuracy of tsr!
			var newTag = new TagTk(newName, [], token.dataAttribs);
			tokens = tokens.concat([ endTag, newTag ]);
			prefixLen++;
		} else {
			tokens = tokens.concat( this.popTags(bs.length - prefixLen) );
			if (prefixLen > 0 && bn.length == prefixLen ) {
				itemToken = this.endtags.pop();
				tokens.push(itemToken);
				tokens.push(new TagTk(itemToken.name, [], token.dataAttribs));
				this.endtags.push(new EndTagTk( itemToken.name ));
			}
		}


		for(var i = prefixLen; i < bn.length; i++) {
			if (!this.bulletCharsMap[bn[i]])
				throw("Unknown node prefix " + prefix[i]);

			tokens = tokens.concat(this.pushList(this.bulletCharsMap[bn[i]]));
		}
		res = tokens;
	}

	if (this.manager.env.trace) {
		this.manager.env.tracer.output("Returning: " + Util.toStringTokens(res).join(","));
	}
	return res;
};

if (typeof module == "object") {
	module.exports.ListHandler = ListHandler;
}
