/**
 * Small utility class that encapsulates the common 'collect all tokens
 * starting from a token of type x until token of type y or (optionally) the
 * end-of-input'. Only supported for synchronous in-order transformation
 * stages (SyncTokenTransformManager), as async out-of-order expansions
 * would wreak havoc with this kind of collector.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 *
 * Calls the passed-in callback with the collected tokens.
 *
 * @class
 * @constructor
 * @param {Object} SyncTokenTransformManager to register with
 * @param {Function} Transform function, called like this:
 *   transform( tokens, cb, manager ) with 
 *      tokens: chunk of tokens
 *      cb: function, returnTokens ( tokens, notYetDone ) with notYetDone
 *      indicating the last chunk of an async return.
 *      manager: TokenTransformManager, provides the args etc.
 * @param {Boolean} Match the 'end' tokens as closing tag as well (accept
 * unclosed sections).
 * @param {Nummber} Numerical rank of the tranform
 * @param {String} Token type to register for ('tag', 'text' etc)
 * @param {String} (optional, only for token type 'tag'): tag name.
 */

function TokenCollector ( manager, transformation, toEnd, rank, type, name ) {
	this.transformation = transformation;
	this.manager = manager;
	this.rank = rank;
	this.type = type;
	this.name = name;
	this.toEnd = toEnd;
	this.tokens = [];
	this.isActive = false;
	manager.addTransform( this._onDelimiterToken.bind( this ), rank, type, name );
	manager.addTransform( this._onDelimiterToken.bind( this ), rank, 'end' );
}
		
/**
 * Register any collector with slightly lower priority than the start/end token type
 * XXX: This feels a bit hackish, a list-of-registrations per rank might be
 * better.
 */
TokenCollector.prototype._anyDelta = 0.00001;


/**
 * Handle the delimiter token.
 * XXX: Adjust to sync phase callback when that is modified!
 */
TokenCollector.prototype._onDelimiterToken = function ( token, cb, frame ) {
	this.manager.addTransform( this._onAnyToken.bind ( this ), 
			this.rank + this._anyDelta, 'any' );
	this.tokens.push ( token );
	if ( ! this.isActive ) {
		this.isActive = true;
		this.cb = cb;
		return { async: true };
	} else if ( token.type !== 'end' || this.toEnd ) {
		// end token
		var res = this.transformation ( this.tokens, this.cb, this.manager );
		this.tokens = [];
		this.manager.removeTransform( this.rank + this._anyDelta, 'any' );
		this.isActive = false;
		// Transformation can be either sync or async, but receives all collected
		// tokens instead of a single token.
		return res;
		// XXX sync version: return tokens
	} else if ( token.type === 'end' && ! this.toEnd ) {
		// Did not encounter a matching end token before the end, and are not
		// supposed to collect to the end. So just return the tokens verbatim.
		this.isActive = false;
		return { tokens: this.tokens };
	}
};


/**
 * Handle 'any' token in between delimiter tokens. Activated when
 * encountering the delimiter token, and collects all tokens until the end
 * token is reached.
 */
TokenCollector.prototype._onAnyToken = function ( token, cb, frame ) {
	// Simply collect anything ordinary in between
	this.tokens.push( token );
	return { };
};


if (typeof module == "object") {
	module.exports.TokenCollector = TokenCollector;
}
