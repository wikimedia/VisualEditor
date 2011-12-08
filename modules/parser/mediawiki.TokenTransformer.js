/* Generic token transformation dispatcher with support for asynchronous token
 * expansion. Individual transformations register for the token types they are
 * interested in and are called on each matching token. */

function TokenTransformer( callback ) {
	this.cb = callback;	// Called with transformed token list when done
	this.accum = new TokenAccumulator();
	this.firstaccum = this.accum;
	this.transformers = {
		tag: {}, // for TAG, ENDTAG, SELFCLOSINGTAG, keyed on name
		text: [],
		newline: [],
		comment: [],
		end: [], // eof
		martian: [] // none of the above
	};
	this.outstanding = 1;	// Number of outstanding processing steps 
							// (e.g., async template fetches/expansions)
	return this;
}

TokenTransformer.prototype.appendListener = function ( listener, type, name ) {
	if ( type === 'tag' ) {
		if ( $.isArray(this.transformers.tag.name) ) {
			this.transformers.tag[name].push(listener);
		} else {
			this.transformers.tag[name] = [listener];
		}
	} else {
		this.transformers[type].push(listener);
	}
};

TokenTransformer.prototype.prependListener = function ( listener, type, name ) {
	if ( type === 'tag' ) {
		if ( $.isArray(this.transformers.tag.name) ) {
			this.transformers.tag[name].unshift(listener);
		} else {
			this.transformers.tag[name] = [listener];
		}
	} else {
		this.transformers[type].unshift(listener);
	}
};

TokenTransformer.prototype.removeListener = function ( listener, type, name ) {
	var i = -1;
	var ts;
	if ( type === 'tag' ) {
		if ( $.isArray(this.transformers.tag.name) ) {
			ts = this.transformers.tag[name];
			i = ts.indexOf(listener);
		}
	} else {
		ts = this.transformers[type];
		i = ts.indexOf(listener);
	}
	if ( i >= 0 ) {
		ts.splice(i, 1);
	}
};

TokenTransformer.prototype._transformTagToken = function ( token, lastToken ) {
	var ts = this.transformers.tag[token.name];
	if ( ts ) {
		for (var i = 0, l = ts.length; i < l; i++ ) {
			token = ts[i]( token, lastToken, this.accum, this );
			if ( token === null ) {
				break;
			}
		}
	}
	return token;
};

TokenTransformer.prototype._transformToken = function ( ts, token, lastToken ) {
	if ( ts ) {
		for (var i = 0, l = ts.length; i < l; i++ ) {
			token = ts[i]( token, lastToken, this.accum, this );
			if ( token === null ) {
				break;
			}
		}
	}
	return token;
};

TokenTransformer.prototype.transformTokens = function ( tokens ) {
	var currentOutout = [];
	var lastToken;
	for ( var i = 0, l = tokens.length; i < l; i++ ) {
		var token = tokens[i];
		var ts;
		switch(token.type) {
			case 'TAG':
			case 'ENDTAG':
			case 'SELFCLOSINGTAG':
				lastToken = this._transformTagToken( token, lastToken );
				break;
			case 'TEXT':
				lastToken = this._transformToken(this.transformers.text, token, lastToken);
				break;
			case 'COMMENT':
				lastToken = this._transformToken(this.transformers.comment, token, lastToken);
				break;
			case 'NEWLINE':
				lastToken = this._transformToken(this.transformers.newline, token, lastToken);
				break;
			case 'END':
				lastToken = this._transformToken(this.transformers.end, token, lastToken);
				break;
			default:
				lastToken = this._transformToken(this.transformers.martian, token, lastToken);
				break;
		}
		if(lastToken) {
			this.accum.push(lastToken);
		}
	}
	this.finish();
};

TokenTransformer.prototype.finish = function ( ) {
	this.outstanding--;
	if ( this.outstanding === 0 ) {
		// Join back the token accumulators into a single token list
		var a = this.firstaccum;
		var accums = [a.accum];
		while ( a.next !== undefined ) {
			a = a.next;
			accums.push(a.accum);
		}
		// Call our callback with the token list
		this.cb(accums.join());
	}
};

		

// Start a new accumulator with the given tokens.
TokenTransformer.prototype.newAccumulator = function ( tokens ) {
	this.accum = this.accum.spliceAccumulator( tokens );
};

// Token accumulators in a linked list. Using a linked list simplifies async
// callbacks for template expansions.
function TokenAccumulator ( next, tokens ) {
	this.next = next;
	if ( tokens )
		this.accum = tokens;
	else
		this.accum = [];
}

TokenAccumulator.prototype.push = function ( token ) {
	this.accum.push(token);
};

TokenAccumulator.prototype.spliceAccumulator = function ( tokens ) {
	this.next = new TokenAccumulator(this.next, tokens);
	return this.next;
};
