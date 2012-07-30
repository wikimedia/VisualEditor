/**
 * General utilities for token transforms
 */

var Util = {
	/**
	 * Determine if a tag name is block-level or not
	 *
	 * @static
	 * @method
	 * @param {String} name: Lower-case tag name
	 * @returns {Boolean}: True if tag is block-level, false otherwise.
	 */
	isBlockTag: function ( name ) {
		switch ( name ) {
			case 'div':
			case 'table':
			case 'td':
			case 'tr':
			case 'tbody':
			case 'p':
			case 'ul':
			case 'ol':
			case 'li':
			case 'dl':
			case 'dt':
			case 'dd':
			//case 'img': // hmm!
			case 'pre':
			case 'center':
			// HTML5 heading content
			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
			case 'hgroup':
			// HTML5 sectioning content
			case 'article':
			case 'aside':
			case 'nav':
			case 'section':
			case 'header':
			case 'footer':
			case 'header':
			case 'figure':
			case 'figcaption':
			case 'fieldset':
			case 'details':
			case 'blockquote':
				return true;
			default:
				return false;
		}
	},

	/**
	 * Determine if a token is block-level or not
	 *
	 * @static
	 * @method
	 * @param {Object} token: The token to check
	 * @returns {Boolean}: True if token is block-level, false otherwise.
	 */
	isBlockToken: function ( token ) {
		if ( token.constructor === TagTk ||
				token.constructor === EndTagTk ||
				token.constructor === SelfclosingTagTk ) {
			return Util.isBlockTag( token.name.toLowerCase() );
		} else {
			return false;
		}
	},

	kvTokensToString: function(tokens) {
		if (!$.isArray(tokens)) {
			return tokens;
		} else {
			// Ignore everything but strings
			var out = [];
			for (var i = 0, l = tokens.length; i < l; i++ ) {
				var token = tokens[i];
				if (token && token.constructor === String) {
					out.push(token);
				}
			}
			return out.join('');
		}
	},

	toStringTokens: function(tokens, indent) {
		if (!indent) indent = "";
		if (tokens.constructor !== Array) {
			return [tokens.toString(false, indent)];
		} else if (tokens.length === 0) {
			return [null];
		} else {
			var buf = [];
			for (var i = 0, n = tokens.length; i < n; i++) {
				buf.push(tokens[i].toString(false, indent));
			}
			return buf;
		}
	},

	lookupKV: function ( kvs, key ) {
		if ( ! kvs ) {
			return null;
		}
		var kv;
		for ( var i = 0, l = kvs.length; i < l; i++ ) {
			kv = kvs[i];
			if ( kv.k.trim() === key ) {
				// found, return it.
				return kv;
			}
		}
		// nothing found!
		return null;
	},

	lookup: function ( kvs, key ) {
		var kv = this.lookupKV(kvs, key);
		return kv == null ? null : kv.v;
	},

	lookupValue: function ( kvs, key ) {
		if ( ! kvs ) {
			return null;
		}
		var kv;
		for ( var i = 0, l = kvs.length; i < l; i++ ) {
			kv = kvs[i];
			if ( kv.v === key ) {
				// found, return it.
				return kv;
			}
		}
		// nothing found!
		return null;
	},

	/**
	 * Trim space and newlines from leading and trailing text tokens.
	 */
	tokenTrim: function ( tokens ) {
		var l = tokens.length,
			i, token;
		// strip leading space
		for ( i = 0; i < l; i++ ) {
			token = tokens[i];
			if ( token.constructor === String ) {
				token = token.replace( /^\s+/, '' );
				tokens[i] = token;
				if ( token !== '' ) {
					break;
				}
			} else {
				break;
			}
		}
		// strip trailing space
		for ( i = l - 1; i >= 0; i-- ) {
			token = tokens[i];
			if ( token.constructor === String ) {
				token = token.replace( /\s+$/, '' );
				tokens[i] = token;
				if ( token !== '' ) {
					break;
				}
			} else {
				break;
			}
		}
		return tokens;
	},

	// Strip 'end' tokens and trailing newlines
	stripEOFTkfromTokens: function ( tokens ) {
		// this.dp( 'stripping end or whitespace tokens' );
		if ( tokens.constructor !== Array ) {
			tokens = [ tokens ];
		}
		if ( ! tokens.length ) {
			return tokens;
		}
		// Strip 'end' tokens and trailing newlines
		var l = tokens[tokens.length - 1];
		if ( l.constructor === EOFTk || l.constructor === NlTk ||
				( l.constructor === String && l.match( /^\s+$/ ) ) ) {
			var origTokens = tokens;
			tokens = origTokens.slice();
			tokens.rank = origTokens.rank;
			while ( tokens.length &&
					((	l.constructor === EOFTk  || l.constructor === NlTk )  ||
				( l.constructor === String && l.match( /^\s+$/ ) ) ) )
			{
				// this.dp( 'stripping end or whitespace tokens' );
				tokens.pop();
				l = tokens[tokens.length - 1];
			}
		}
		return tokens;
	},

	/**
	 * Perform a shallow clone of a chunk of tokens
	 */
	cloneTokens: function ( chunk ) {
		var out = [],
			token, tmpToken;
		for ( var i = 0, l = chunk.length; i < l; i++ ) {
			token = chunk[i];
			if ( token.constructor === String ) {
				out.push( token );
			} else {
				tmpToken = $.extend( {}, token );
				tmpToken.rank = 0;
				out.push(tmpToken);
			}
		}
		return out;
	},

	// Does this need separate UI/content inputs?
	formatNum: function( num ) {
		return num + '';
	},

	decodeURI: function ( s ) {
		return s.replace( /%[0-9a-f][0-9a-f]/g, function( m ) {
			try {
				// JS library function
				return decodeURI( m );
			} catch ( e ) {
				return m;
			}
		} );
	},

	sanitizeURI: function ( s ) {
		var host = s.match(/^[a-zA-Z]+:\/\/[^\/]+(?:\/|$)/),
			path = s,
			anchor = null;
		//console.warn( 'host: ' + host );
		if ( host ) {
			path = s.substr( host[0].length );
			host = host[0];
		} else {
			host = '';
		}
		var bits = path.split('#');
		if ( bits.length > 1 ) {
			anchor = bits[bits.length - 1];
			path = path.substr(0, path.length - anchor.length - 1);
		}
		host = host.replace( /%(?![0-9a-fA-F][0-9a-fA-F])|[#|]/g, function ( m ) {
			return encodeURIComponent( m );
		} );
		path = path.replace( /%(?![0-9a-fA-F][0-9a-fA-F])|[ \[\]#|]/g, function ( m ) {
			return encodeURIComponent( m );
		} );
		s = host + path;
		if ( anchor !== null ) {
			s += '#' + anchor;
		}
		return s;
	},

	/**
	 * Strip a string suffix if it matches
	 */
	stripSuffix: function ( text, suffix ) {
		var sLen = suffix.length;
		if ( sLen && text.substr( text.length - sLen, sLen ) === suffix )
		{
			return text.substr( 0, text.length - sLen );
		} else {
			return text;
		}
	},

	arrayToHash: function(a) {
		var h = {};
		for (var i = 0, n = a.length; i < n; i++) {
			h[a[i]] = 1;
		}
		return h;
	},

	// Returns the utf8 encoding of the code point
	codepointToUtf8: function(cp) {
		return unescape(encodeURIComponent(cp));
	},

	// Returns true if a given Unicode codepoint is a valid character in XML.
	validateCodepoint: function(cp) {
		return (cp ===    0x09) ||
			(cp ===   0x0a) ||
			(cp ===   0x0d) ||
			(cp >=    0x20 && cp <=   0xd7ff) ||
			(cp >=  0xe000 && cp <=   0xfffd) ||
			(cp >= 0x10000 && cp <= 0x10ffff);
	}
};

if (typeof module === "object") {
	module.exports.Util = Util;
}
