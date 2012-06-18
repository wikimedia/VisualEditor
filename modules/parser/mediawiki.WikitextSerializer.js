/**
 * Serializes a chunk of tokens or an HTML DOM to MediaWiki's wikitext flavor.
 * 
 * @class
 * @constructor
 * @param options {Object} List of options for serialization
 */
WikitextSerializer = function( options ) {
	this.options = $.extend( {
		// defaults
	}, options || {} );
};

var WSP = WikitextSerializer.prototype;

WSP.defaultOptions = {
	onNewline            : true,
	listStack            : [],
	lastHandler          : null,
	availableNewlineCount: 0,
	singleLineMode: 0
};

var id = function(v) { 
	return function( state ) { 
		return v; 
	}; 
};

WSP._listHandler = function( bullet, state, token ) {
	function isListItem(token) {
		if (token.constructor !== TagTk) return false;

		var tokenName = token.name;
		return (tokenName === 'li' || tokenName === 'dt' || tokenName === 'dd');
	}

	var bullets, res;
	var stack = state.listStack;
	if (stack.length === 0) {
		bullets = bullet;
		res     = bullets;
	} else {
		var curList = stack[stack.length - 1];
		bullets = curList.bullets + bullet;
		curList.itemCount++;
		if (	// deeply nested list
				curList.itemCount > 2 ||
				// A nested list, not directly after a list item
				(curList.itemCount > 1 && !isListItem(state.prevToken))) {
			res = bullets;
		} else {
			if (bullet !== '') token.startsNewline = false;
			res = bullet;
		}
	}
	stack.push({ itemCount: 0, bullets: bullets});
	return res;
};

WSP._listEndHandler = function( state, token ) {
	state.listStack.pop();
	return '';
};

WSP._listItemHandler = function ( bullet, state, token ) { 
	var stack   = state.listStack;
	var curList = stack[stack.length - 1];
	curList.itemCount++;
	return ((curList.itemCount > 1 ) ? curList.bullets + bullet : bullet);
};

WSP._serializeTableTag = function ( symbol, optionEndSymbol, state, token ) {
	if ( token.attribs.length ) {
		return symbol + ' ' + WSP._serializeAttributes( token.attribs ) + optionEndSymbol;
	} else {
		return symbol;
	}
};

WSP._emptyTags = { br: true, meta: true };

WSP._serializeHTMLTag = function ( state, token ) {
	var close = '';
	if ( WSP._emptyTags[ token.name ] ) {
		close = '/';
	}

	// Swallow required newline from previous token on encountering a HTML tag
	//state.emitNewlineOnNextToken = false;

	if ( token.attribs.length ) {
		return '<' + token.name + ' ' + 
			WSP._serializeAttributes( token.attribs ) + close + '>';
	} else {
		return '<' + token.name + close + '>';
	}
};

WSP._serializeHTMLEndTag = function ( state, token ) {
	if ( ! WSP._emptyTags[ token.name ] ) {
		return '</' + token.name + '>';
	} else {
		return '';
	}
};

WSP._linkHandler =  function( state, token ) {
	//return '[[';
	// TODO: handle internal/external links etc using RDFa and dataAttribs
	// Also convert unannotated html links to external wiki links for html
	// import. Might want to consider converting relative links without path
	// component and file extension to wiki links.
	
	var env = state.env;
	var attribDict = env.KVtoHash( token.attribs );
	if ( attribDict.rel && attribDict.href !== undefined ) {
		var tokenData = token.dataAttribs;
		if ( attribDict.rel === 'mw:wikiLink' ) {
			var base   = env.wgScriptPath;
			var href   = attribDict.href;
			var prefix = href.substr(0, base.length);
			var target = (prefix === base) ? href.substr(base.length) : href;
			target = decodeURIComponent(target);

			var tail   = tokenData.tail;
			if ( tail && tail.length ) {
				state.dropTail = tail;
				target = tokenData.gc ? tokenData.sHref[0] : target.replace( /_/g, ' ' );
			} else {
				// SSS: Why is sHref an array instead of a string?
				var origLinkTgt = tokenData.sHref[0];
				if (origLinkTgt) {
					//console.warn( JSON.stringify( tokenData.sHref ) );
					// SSS FIXME: Why was resolveTitle wrapping this?  Also, why do we require normalizeTitle here?
					var normalizedOrigLinkTgt = env.normalizeTitle(env.tokensToString(origLinkTgt));
					if ( normalizedOrigLinkTgt === target ) {
						// Non-standard capitalization
						target = origLinkTgt;
					}
				} else {
					target = target.replace( /_/g, ' ' );
				}
			}

			// FIXME: Properly handle something like [[{{Foo}}]]s
			target = env.tokensToString( target );

			if ( tokenData.gc ) {
				state.dropContent = true;
				return '[[' + target;
			} else {
				return '[[' + target + '|';
			}
		} else if ( attribDict.rel === 'mw:extLink' ) {
			if ( tokenData.stx === 'urllink' ) {
				state.dropContent = true;
				return attribDict.href;
			} else if ( tokenData.gc ) {
				state.dropContent = true;
				return '[' + attribDict.href;
			} else {
				return '[' + attribDict.href + ' ';
			}
		} else {
			return WSP._serializeHTMLTag( state, token );
		}
	} else {
		return WSP._serializeHTMLTag( state, token );
	}
					
	//if ( rtinfo.type === 'wikilink' ) {
	//	return '[[' + rtinfo.target + ']]';
	//} else {
	//	// external link
	//	return '[' + rtinfo.
};
WSP._linkEndHandler = function( state, token ) {
	var attribDict = state.env.KVtoHash( token.attribs );
	if ( attribDict.rel && attribDict.href !== undefined ) {
		if ( attribDict.rel === 'mw:wikiLink' ) {
			state.dropContent = false;
			state.dropTail    = false;
			return "]]" + (token.dataAttribs.tail ? token.dataAttribs.tail : "");
		} else if ( attribDict.rel === 'mw:extLink' ) {
			state.dropContent = false;
			return (token.dataAttribs.stx === 'urllink') ? '' : ']';
		} else {
			return WSP._serializeHTMLEndTag( state, token );
		}
	} else {
		return WSP._serializeHTMLEndTag( state, token );
	}
};

WSP.tagHandlers = {
	body: {
		start: {
			handle: function(state, token) {
				// swallow trailing new line
				state.emitNewlineOnNextToken = false;
				return '';
			}
		}
	},
	ul: { 
		start: {
			startsNewline : true,
			handle: WSP._listHandler.bind( null, '*' ),
			pairSepNLCount: 2,
			treatAsNewline: true
		},
		end: {
			endsLine: true,
			handle: WSP._listEndHandler
		}
	},
	ol: { 
		start: {
			startsNewline : true,
			handle: WSP._listHandler.bind( null, '#' ),
			pairSepNLCount: 2,
			treatAsNewline: true
		},
		end: {
			endsLine      : true,
			handle: WSP._listEndHandler
		}
	},
	dl: { 
		start: {
			startsNewline : true,
			handle: WSP._listHandler.bind( null, ''), 
			pairSepNLCount: 2,
			treatAsNewline: true
		},
		end: {
			endsLine: true,
			handle: WSP._listEndHandler
		}
	},
	li: { 
		start: {
			handle: WSP._listItemHandler.bind( null, '' ),
			singleLine: 1,
			pairSepNLCount: 1
		},
		end: {
			singleLine: -1
		}
	},
	// XXX: handle single-line vs. multi-line dls etc
	dt: { 
		start: {
			startsNewline: true,
			singleLine: 1,
			handle: WSP._listItemHandler.bind( null, ';' )
		},
		end: {
			singleLine: -1
		}
	},
	dd: { 
		start: {
			singleLine: 1,
			handle: WSP._listItemHandler.bind( null, ":" )
		},
		end: {
			endsLine: true,
			singleLine: -1
		}
	},
	// XXX: handle options
	table: { 
		start: {
			handle: WSP._serializeTableTag.bind(null, "{|", '')
		},
		end: {
			handle: function(state, token) {
				if ( state.prevTagToken && state.prevTagToken.name === 'tr' ) {
					this.startsNewline = true;
				} else {
					this.startsNewline = false;
				}
				return "|}";
			}
		}
	},
	tbody: { start: { ignore: true }, end: { ignore: true } },
	th: { 
		start: {
			handle: function ( state, token ) {
				if ( token.dataAttribs.stx_v === 'row' ) {
					this.startsNewline = false;
					return WSP._serializeTableTag("!!", ' |', state, token);
				} else {
					this.startsNewline = true;
					return WSP._serializeTableTag( "!", ' |', state, token);
				}
			}
		}
	},
	tr: { 
		start: {
			handle: function ( state, token ) {
				if ( state.prevToken.constructor === TagTk && state.prevToken.name === 'tbody' ) {
					// Omit for first row in a table. XXX: support optional trs
					// for first line (in source wikitext) too using some flag in
					// data-mw (stx: 'wikitext' ?)
					return '';
				} else {
					return WSP._serializeTableTag("|-", '', state, token );
				}
			},
			startsNewline: true
		}
	},
	td: { 
		start: {
			handle: function ( state, token ) {
				if ( token.dataAttribs.stx_v === 'row' ) {
					this.startsNewline = false;
					return WSP._serializeTableTag("||", ' |', state, token);
				} else {
					this.startsNewline = true;
					return WSP._serializeTableTag("|", ' |', state, token);
				}
			}
		}
	},
	caption: { 
		start: {
			startsNewline: true,
			handle: WSP._serializeTableTag.bind(null, "|+", ' |')
		}
	},
	p: { 
		make: function(state, token) {
			// Special case handling in a list context
			// VE embeds list content in paragraph tags
			return state.singleLineMode ? WSP.defaultHTMLTagHandler : this;
		},
		start: {
			startsNewline : true,
			pairSepNLCount: 2
		},
		end: {
			endsLine: true
		}
	},
	// XXX: support indent variant instead by registering a newline handler?
	pre: { 
		start: {
			startsNewline: true,
			handle: function( state, token ) {
				state.textHandler = function( t ) { return t.replace(/\n/g, '\n ' ); };
				return ' ';
			}
		},
		end: {
			endsLine: true,
			handle: function( state, token) { state.textHandler = null; return ''; }
		}
	},
	meta: { 
		start: {
			handle: function ( state, token ) {
				var argDict = state.env.KVtoHash( token.attribs );
				if ( argDict['typeof'] === 'mw:tag' ) {
					return '<' + argDict.content + '>';
				} else {
					return WSP._serializeHTMLTag( state, token );
				}
			}
		}
	},
	hr: { 
		start: { startsNewline: true, handle: id("----") },
		end: { endsLine: true }
	},
	h1: { 
		start: { startsNewline: true, handle: id("=") },
		end: { endsLine: true, handle: id("=") }
	},
	h2: { 
		start: { startsNewline: true, handle: id("==") },
		end: { endsLine: true, handle: id("==") }
	},
	h3: { 
		start: { startsNewline: true, handle: id("===") },
		end: { endsLine: true, handle: id("===") }
	},
	h4: { 
		start: { startsNewline: true, handle: id("====") },
		end: { endsLine: true, handle: id("====") }
	},
	h5: { 
		start: { startsNewline: true, handle: id("=====") },
		end: { endsLine: true, handle: id("=====") }
	},
	h6: { 
		start: { startsNewline: true, handle: id("======") },
		end: { endsLine: true, handle: id("======") }
	},
	br: { 
		start: { startsNewline: true, handle: id("") },
		end: { endsLine: true }
	},
	b:  { 
		start: { handle: id("'''") },
		end: { handle: id("'''") }
	},
	i:  { 
		start: { handle: id("''") },
		end: { handle: id("''") }
	},
	a:  { 
		start: { handle: WSP._linkHandler },
		end: { handle: WSP._linkEndHandler }
	}
};


WSP._serializeAttributes = function ( attribs ) {
	var out = [];
	for ( var i = 0, l = attribs.length; i < l; i++ ) {
		var kv = attribs[i];
		if (kv.k.length) {
			if ( kv.v.length ) {
				out.push( kv.k + '=' + 
						'"' + kv.v.replace( '"', '&quot;' ) + '"');
			} else {
				out.push( kv.k );
			}
		} else if ( kv.v.length ) {
			// not very likely..
			out.push( kv.v );
		}
	}
	// XXX: round-trip optional whitespace / line breaks etc
	return out.join(' ');
};

/**
 * Serialize a chunk of tokens
 */
WSP.serializeTokens = function( tokens, chunkCB ) {
	var state = $.extend({}, this.defaultOptions, this.options),
		i, l;
	if ( chunkCB === undefined ) {
		var out = [];
		state.chunkCB = out.push.bind(out);
		for ( i = 0, l = tokens.length; i < l; i++ ) {
			this._serializeToken( state, tokens[i] );
		}
		return out;
	} else {
		state.chunkCB = chunkCB;
		for ( i = 0, l = tokens.length; i < l; i++ ) {
			this._serializeToken( state, tokens[i] );
		}
	}
};

WSP.defaultHTMLTagHandler = { 
	start: { handle: WSP._serializeHTMLTag }, 
	end  : { handle: WSP._serializeHTMLEndTag } 
};

WSP._getTokenHandler = function(state, token) {
	var handler;
	if (token.dataAttribs.stx === 'html') {
		handler = this.defaultHTMLTagHandler;
	} else {
		var tname = token.name;
		handler = this.tagHandlers[tname];
		if ( handler && handler.make ) {
			handler = handler.make(state, token);
		}
	}
	
	if ( ! handler ) {
		handler = this.defaultHTMLTagHandler;
	}
	if ( token.constructor === TagTk || token.constructor === SelfclosingTagTk ) {
		return handler.start || {};
	} else {
		return handler.end || {};
	}
};

/**
 * Serialize a token.
 */
WSP._serializeToken = function ( state, token ) {
	var handler = {}, 
		res = '', 
		dropContent = state.dropContent;

	state.prevToken = state.curToken;
	state.curToken  = token;


	switch( token.constructor ) {
		case TagTk:
		case SelfclosingTagTk:
			handler = WSP._getTokenHandler( state, token );
			if ( ! handler.ignore ) {
				state.prevTagToken = state.currTagToken;
				state.currTagToken = token;
				res = handler.handle ? handler.handle( state, token ) : '';
			}
			break;
		case EndTagTk:
			handler = WSP._getTokenHandler( state, token );
			if ( ! handler.ignore ) {
				state.prevTagToken = state.currTagToken;
				state.currTagToken = token;
				if ( handler.singleLine < 0 ) {
					state.singleLineMode--;
				}
				res = handler.handle ? handler.handle( state, token ) : '';
			}
			break;
		case String:
			res = state.textHandler ? state.textHandler( token ) : token;
			break;
		case CommentTk:
			res = '<!--' + token.value + '-->';
			break;
		case NlTk:
			res = '\n';
			res = state.textHandler ? state.textHandler( res ) : res;
			break;
		case EOFTk:
			res = '';
			for ( var i = 0, l = state.availableNewlineCount; i < l; i++ ) {
				res += '\n';
			}
			state.chunkCB(res);
			break;
		default:
			res = '';
			console.warn( 'Unhandled token type ' + JSON.stringify( token ) );
			break;
	}

	if (! dropContent || ! state.dropContent ) {

		var requiredNLCount = state.availableNewlineCount;
		if (res !== '') {
			// Deal with leading or trailing new lines
			var match = res.match( /^((?:\r?\n)*)((?:.*?|[\r\n]+[^\r\n])*?)((?:\r?\n)*)$/ ),
				leadingNLs = match[1],
				trailingNLs = match[3];

			if (leadingNLs === res) {
				// all newlines, accumulate count, and clear output
				state.availableNewlineCount += leadingNLs.replace(/\r\n/g, '\n').length;
				res = "";
			} else {
				state.availableNewlineCount = trailingNLs.replace(/\r\n/g, '\n').length;
				if ( leadingNLs !== '' ) {
					requiredNLCount += leadingNLs.replace(/\r\n/g, '\n').length;
				}

				// strip newlines
				res = match[2];
			}
		}

		// Check if we have a pair of identical tag tokens </p><p>; </ul><ul>; etc. 
		// that have to be separated by extra newlines and add those in.
		if (handler.pairSepNLCount && state.prevTagToken && 
				state.prevTagToken.constructor === EndTagTk && 
				state.prevTagToken.name == token.name ) {
					if ( requiredNLCount < handler.pairSepNLCount) {
						requiredNLCount = handler.pairSepNLCount;
					}
				} /*else if (state.singleLineMode) {
		// Swallow newlines
		// XXX: also swallow newlines in the middle of text content
		requiredNLCount = 0;
		state.availableNewlineCount = 0;
		}*/

		if ( state.env.debug ) {
			console.warn("tok: " + token + ", res: <" + res + ">" + 
					", onnl: " + state.onNewline + ", # nls: " + 
					state.availableNewlineCount + ', reqNLs: ' + requiredNLCount);
		}
		if (res !== '') {
			var out = '';
			// Prev token's new line token
			if ( !state.singleLineMode &&
					( ( !res.match(/^\s*$/) && state.emitNewlineOnNextToken ) ||
					( handler.startsNewline && !state.onNewline ) ) ) 
			{
				// Emit new line, if necessary
				if ( ! requiredNLCount ) {
					requiredNLCount++;
				}
				state.emitNewlineOnNextToken = false;
			}

			// Add required # of new lines in the beginning
			for (i = 0; i < requiredNLCount; i++) {
				out += '\n';
			}
			if ( state.availableNewlineCount > requiredNLCount ) {
				// availableNewlineCount was not reset, and requiredNLCount
				// can only be incremented.
				state.availableNewlineCount -= requiredNLCount;
			}
			if ( requiredNLCount ) {
				state.onNewline = true;
			}

			// FIXME: This might modify not just the last content token in a
			// link, which would be wrong. We'll likely have to collect tokens
			// between a tags instead, and strip only the last content token.
			if (state.dropTail && res.substr(- state.dropTail.length) === state.dropTail) {
				res = res.substr(0, res.length - state.dropTail.length);
			}

			if ( state.singleLineMode ) {
				res = res.replace(/\n/g, ' ');
			}
			out += res;
			if ( res !== '' ) {
				state.onNewline = false;
			}
			state.chunkCB( out );
		} else if ( requiredNLCount > state.availableNewlineCount ) {
			state.availableNewlineCount = requiredNLCount;
		}
		/* else {
			console.warn("SILENT: tok: " + token + ", res: <" + res + ">" + ", onnl: " + state.onNewline + ", # nls: " + state.availableNewlineCount);
		}
		*/

		if (handler.endsLine) {
			// Record end of line
			state.emitNewlineOnNextToken = true;
		}
		if ( handler.singleLine > 0 ) {
			state.singleLineMode += handler.singleLine;
		}
		if ( handler.treatAsNewline ) {
			state.onNewline = true;
		}
	}
};

/**
 * Serialize an HTML DOM document.
 */
WSP.serializeDOM = function( node, chunkCB ) {
	var state = $.extend({}, this.defaultOptions, this.options);
	//console.warn( node.innerHTML );
	if ( ! chunkCB ) {
		var out = [];
		state.chunkCB = out.push.bind( out );
		this._serializeDOM( node, state );
		this._serializeToken( state, new EOFTk() );
		return out.join('');
	} else {
		state.chunkCB = chunkCB;
		this._serializeDOM( node, state );
		this._serializeToken( state, new EOFTk() );
	}
};

/**
 * Internal worker. Recursively serialize a DOM subtree by creating tokens and
 * calling _serializeToken on each of these.
 */
WSP._serializeDOM = function( node, state ) {
	// serialize this node
	switch( node.nodeType ) {
		case Node.ELEMENT_NODE:
			//console.warn( node.nodeName.toLowerCase() );
			var children = node.childNodes,
				name = node.nodeName.toLowerCase(),
				tkAttribs = this._getDOMAttribs(node.attributes),
				tkRTInfo = this._getDOMRTInfo(node.attributes);

			// Serialize the start token
			this._serializeToken(state, new TagTk(name, tkAttribs, tkRTInfo));

			// then children
			for ( var i = 0, l = children.length; i < l; i++ ) {
				this._serializeDOM( children[i], state );
			}

			// then the end token
			this._serializeToken(state, new EndTagTk(name, tkAttribs, tkRTInfo));
			break;
		case Node.TEXT_NODE:
			this._serializeToken( state, node.data );
			break;
		case Node.COMMENT_NODE:
			// delay the newline creation until after the comment
			var savedEmitNewlineOnNextToken = state.emitNewlineOnNextToken;
			state.emitNewlineOnNextToken = false;
			this._serializeToken( state, new CommentTk( node.data ) );
			state.emitNewlineOnNextToken = savedEmitNewlineOnNextToken;
			break;
		default:
			console.warn( "Unhandled node type: " + 
					node.outerHTML );
			break;
	}
};

WSP._getDOMAttribs = function( attribs ) {
	// convert to list fo key-value pairs
	var out = [];
	for ( var i = 0, l = attribs.length; i < l; i++ ) {
		var attrib = attribs.item(i);
		if ( attrib.name !== 'data-mw' ) {
			out.push( { k: attrib.name, v: attrib.value } );
		}
	}
	return out;
};

WSP._getDOMRTInfo = function( attribs ) {
	if ( attribs['data-mw'] ) {
		return JSON.parse( attribs['data-mw'].value || '{}' );
	} else {
		return {};
	}
};

// Quick HACK: define Node constants locally
// https://developer.mozilla.org/en/nodeType
var Node = {
	ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
};


if (typeof module == "object") {
	module.exports.WikitextSerializer = WikitextSerializer;
}
