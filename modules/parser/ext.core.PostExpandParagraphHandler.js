/*
 * Insert paragraphs for comment-only lines after template expansion
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

// Include general utilities
var u = require('./mediawiki.Util.js').Util;


function PostExpandParagraphHandler ( dispatcher ) {
	this.tokens = [];
	this.newLines = 0;
	this.register( dispatcher );
}

// constants
PostExpandParagraphHandler.prototype.newlineRank = 2.5;
PostExpandParagraphHandler.prototype.anyRank = 2.501; // Just after regular quote and newline


// Register this transformer with the TokenTransformer
PostExpandParagraphHandler.prototype.register = function ( dispatcher ) {
	this.dispatcher = dispatcher;
	// Register for NEWLINE tokens
	dispatcher.addTransform( this.onNewLine.bind(this), "PostExpandParagraphHandler:onNewLine",
			this.newlineRank, 'newline' );
	// Reset internal state when we are done
	dispatcher.addTransform( this.onEnd.bind(this), "PostExpandParagraphHandler:onEnd",
			this.newlineRank, 'end' );
};

PostExpandParagraphHandler.prototype.reset = function ( token, frame, cb ) {
	//console.warn( 'PostExpandParagraphHandler.reset ' + JSON.stringify( this.tokens ) );
	if ( this.newLines ) {
		this.tokens.push( token );
		return this._finish();
	} else {
		return [token];
	}
};

PostExpandParagraphHandler.prototype._finish = function ( ) {
	var tokens = this.tokens;
	this.tokens = [];
	// remove 'any' registration
	this.dispatcher.removeTransform( this.anyRank, 'any' );
	this.newLines = 0;
	return tokens;
};


// Handle NEWLINE tokens
PostExpandParagraphHandler.prototype.onNewLine = function (  token, frame, cb ) {
	//console.warn( 'PostExpandParagraphHandler.onNewLine: ' + JSON.stringify( token, null , 2 ) );
	var res;
	this.tokens.push( token );

	if( ! this.newLines ) {
		this.dispatcher.addTransform( this.onAny.bind(this), "PostExpandParagraphHandler:onAny",
				this.anyRank, 'any' );
	}

	this.newLines++;
	return {};
};

PostExpandParagraphHandler.prototype.onEnd = function (  token, frame, cb ) {
	return { tokens: this.reset( token ) };
}

PostExpandParagraphHandler.prototype.onAny = function ( token, frame, cb ) {
	//console.warn( 'PostExpandParagraphHandler.onAny' );
	if ( token.constructor === CommentTk || 
			( token.constructor === String && token.match( /^[\t ]*$/ ) ) 
	)
	{
		// Continue with collection..
		this.tokens.push( token );
		return {};
	} else {
		// XXX: Only open paragraph if inline token follows!

		// None of the tokens we are interested in, so abort processing..
		//console.warn( 'PostExpandParagraphHandler.onAny: ' + JSON.stringify( this.tokens, null , 2 ) );
		if ( this.newLines >= 2 && ! u.isBlockToken( token ) ) {
			this.tokens.push( token );
			var nlTks = [];
			while ( this.tokens[0].constructor === NlTk ) {
				nlTks.push( this.tokens.shift() );
			}
			var res = { tokens: nlTks.concat([ new TagTk( 'p' ) ], this._finish() ) };
			//console.warn( 'insert p:' + JSON.stringify( res, null, 2 ) );
			return res;
		} else {
			return { tokens: this.reset(token) };
		}
	}

};

if (typeof module == "object") {
	module.exports.PostExpandParagraphHandler = PostExpandParagraphHandler;
}
