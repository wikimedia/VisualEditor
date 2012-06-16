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
	availableNewlineCount: 0
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
	state.emitNewlineOnNextToken = false;

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
		init: function(state, token) {
			// swallow trailing new line
			state.emitNewlineOnNextToken = false;
		}
	},
	ul: { 
		startsNewline : true,
		endsLine      : true,
		start         : WSP._listHandler.bind( null, '*' ),
		end           : WSP._listEndHandler,
		pairsNeedNLSep: true
	},
	ol: { 
		startsNewline : true,
		endsLine      : true,
		start         : WSP._listHandler.bind( null, '#' ),
		end           : WSP._listEndHandler,
		pairsNeedNLSep: true
	},
	dl: { 
		startsNewline : true,
		endsLine      : true,
		start         : WSP._listHandler.bind( null, ''), 
		end           : WSP._listEndHandler,
		pairsNeedNLSep: true
	},
	li: { 
		// SSS FIXME: would be good to get rid of this hack
		init: function(state, token) {
			var stack   = state.listStack;
			var curList = stack[stack.length - 1];
			this.startsNewline = (curList.itemCount > 0);
		},
		startSwallowsExcessNewlines: true,
		start: WSP._listItemHandler.bind( null, '' )
	},
	// XXX: handle single-line vs. multi-line dls etc
	dt: { 
		startsNewline: true,
		start: WSP._listItemHandler.bind( null, ';' ) 
	},
	dd: { 
		endsLine: true,
		start: WSP._listItemHandler.bind( null, ":" )
	},
	// XXX: handle options
	table: { 
		start: WSP._serializeTableTag.bind(null, "{|", ''), 
		end: id("\n|}") 
	},
	tbody: {},
	th: { 
		init: function(state, token) {
			this.startsNewline = token.dataAttribs.stx_v === 'row';
		},
		start: function ( state, token ) {
			if ( token.dataAttribs.stx_v === 'row' ) {
				return WSP._serializeTableTag("!!", ' |', state, token);
			} else {
				return WSP._serializeTableTag( "!", ' |', state, token);
			}
		}
	},
	// XXX: omit for first row in table.
	tr: { 
		startsNewline: true,
		start: function ( state, token ) {
			if ( state.prevToken.constructor === TagTk && state.prevToken.name === 'tbody' ) {
				return '';
			} else {
				return WSP._serializeTableTag("|-", '', state, token );
			}
		}
	},
	td: { 
		start: function ( state, token ) {
			if ( token.dataAttribs.stx_v === 'row' ) {
				return WSP._serializeTableTag("||", ' |', state, token);
			} else {
				return WSP._serializeTableTag("|", ' |', state, token);
			}
		}
	},
	caption: { 
		startsNewline: true,
		start: WSP._serializeTableTag.bind(null, "|+", ' |')
	},
	p: { 
		init: function(state, token) {
			// Special case handling in a list context
			// VE embeds list content in paragraph tags
			if (state.listStack.length > 0) {
				if (!token.dataAttribs) token.dataAttribs = {};
				token.dataAttribs.stx = "html";
			}
		},
		startsNewline : true,
		endsLine      : true,
		pairsNeedNLSep: true
	},
	// XXX: support indent variant instead by registering a newline handler?
	pre: { 
		startsNewline: true,
		endsLine: true,
		start: function( state, token ) {
			state.textHandler = function( t ) { return t.replace(/\n/g, '\n ' ); };
			return ' ';
		},
		end: function( state, token) { state.textHandler = null; return ''; }
	},
	meta: { 
		start: function ( state, token ) {
			var argDict = state.env.KVtoHash( token.attribs );
			if ( argDict['typeof'] === 'mw:tag' ) {
				return '<' + argDict.content + '>';
			} else {
				return WSP._serializeHTMLTag( state, token );
			}
		}
	},
	hr: { startsNewline: true, endsLine: true, start: id("----"),   end: id("") },
	h1: { startsNewline: true, endsLine: true, start: id("="),      end: id("=") },
	h2: { startsNewline: true, endsLine: true, start: id("=="),     end: id("==") },
	h3: { startsNewline: true, endsLine: true, start: id("==="),    end: id("===") },
	h4: { startsNewline: true, endsLine: true, start: id("===="),   end: id("====") },
	h5: { startsNewline: true, endsLine: true, start: id("====="),  end: id("=====") },
	h6: { startsNewline: true, endsLine: true, start: id("======"), end: id("======") },
	br: { startsNewline: true, endsLine: true, start: id("") },
	b:  { start: id("'''"), end: id("'''") },
	i:  { start: id("''"),  end: id("''") },
	a:  { start: WSP._linkHandler, end: WSP._linkEndHandler }
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
	start: WSP._serializeHTMLTag, 
	end  : WSP._serializeHTMLEndTag 
};

WSP.getTokenHandler = function(state, token) {
	if (token.dataAttribs.stx === 'html') return this.defaultHTMLTagHandler;

	var tname = token.name;
	if (tname === "p" && state.listStack.length > 0) {
		// We dont want paragraphs in list context expanded.
		// Retain them as html tags.
		//
		// SSS FIXME: any other cases like this?
		return this.defaultHTMLTagHandler;
	} else {
		var handler = this.tagHandlers[tname];
		return handler ? handler : this.defaultHTMLTagHandler;
	}
};

/**
 * Serialize a token.
 */
WSP._serializeToken = function ( state, token ) {
	var handler, res, dropContent;

	dropContent     = state.dropContent;
	state.prevToken = state.curToken;
	state.curToken  = token;

	switch( token.constructor ) {
		case TagTk:
		case SelfclosingTagTk:
			state.prevTagToken = state.currTagToken;
			state.currTagToken = token;
			handler = token.handler;
			res = handler ? handler( state, token ) : '';
			break;
		case EndTagTk:
			state.prevTagToken = state.currTagToken;
			state.currTagToken = token;
			handler = token.handler;
			res = handler ? handler( state, token ) : '';
			break;
		case String:
			res = state.textHandler ? state.textHandler( token ) : token;
			break;
		case CommentTk:
			res = '<!--' + token.value + '-->';
			break;
		case NlTk:
			res = '\n';
			break;
		case EOFTk:
			res = '';
			break;
		default:
			res = '';
			console.warn( 'Unhandled token type ' + JSON.stringify( token ) );
			break;
	}

	// Check if we have a pair of identical tag tokens </p><p>; </ul><ul>; etc. 
	// that have to be separated by extra newlines and add those in.
	if (token.pairsNeedNLSep && state.prevTagToken && state.prevTagToken.name == token.name) {
		if (state.availableNewlineCount < 2) state.availableNewlineCount = 2;
	}

	var requiredNLCount = state.availableNewlineCount;
	if (res !== '') {
		// Deal with trailing new lines
		var allDone = false;
		var nls = res.match( /(?:\r?\n)+$/ );
		if (nls) {
			var matchedStr = nls[0];
			if (matchedStr === res) {
				// all newlines, accumulate count, and clear output
				res = "";
				allDone = true;
			    state.availableNewlineCount += matchedStr.length;
			} else {
				// strip new lines & reset newline count
				res = res.replace(/(\r?\n)+$/, '');
			    state.availableNewlineCount = matchedStr.length;
			}
		} else {
			// no trailing newlines at all
			state.availableNewlineCount = 0;
		}

		// Deal with leading new lines
		if (!allDone) {
			nls = res.match(/(^\r?\n)+/);
			if (nls) {
				requiredNLCount += nls[0].length;
				res = res.replace(/(^\r?\n)+/, '');
			}
		}
	}

	// Swallow excess new lines
	if (token.swallowsExcessNewlines) {
		requiredNLCount = 0;
		state.availableNewlineCount = 0;
	}

	if (res != '') {
		// Prev token's new line token
		// Pure whitespace tokens don't trigger newline
		// --> Hack to deal with comments on the end of newline triggering tokens
		//     like headers, etc.
		if (!res.match(/^\s*$/) &&  state.emitNewlineOnNextToken) {
			state.chunkCB("\n");
			state.onNewline = true;
			state.emitNewlineOnNextToken = false;
			// console.warn("--> ending line"); 
			// Eat up an available line
			if (state.availableNewlineCount > 0) state.availableNewlineCount--;
			if (requiredNLCount > 0) requiredNLCount--;
		}

		// console.warn("tok: " + token + ", res: <" + res + ">" + ", onnl: " + state.onNewline + ", # nls: " + state.availableNewlineCount);

		// Emit new line, if necessary
		if (token.startsNewline && !state.onNewline) {
			state.chunkCB("\n");
			state.onNewline = true;
			// console.warn("--> starting NL"); 
			// Eat up an available line
			if (state.availableNewlineCount > 0) state.availableNewlineCount--;
			if (requiredNLCount > 0) requiredNLCount--;
		}

		if (! dropContent || ! state.dropContent ) {
			// FIXME: This might modify not just the last content token in a
			// link, which would be wrong. We'll likely have to collect tokens
			// between a tags instead, and strip only the last content token.
			if (state.dropTail && res.substr(- state.dropTail.length) === state.dropTail) {
				res = res.substr(0, res.length - state.dropTail.length);
			}

			// Add required # of new lines in the beginning
			var out = '';
			for (var i = 0; i < requiredNLCount; i++) out += '\n';
			state.chunkCB(out + res);
			state.onNewline = false;
		}
	} 
/*
	else {
		console.warn("SILENT: tok: " + token + ", res: <" + res + ">" + ", onnl: " + state.onNewline + ", # nls: " + state.availableNewlineCount);
	}
*/

	// Record end of line
	if (token.endsLine) state.emitNewlineOnNextToken = true;
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
		return out.join('');
	} else {
		state.chunkCB = chunkCB;
		this._serializeDOM( node, state );
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

			// Use the start token (which has data attributes) to get the correct handlers
			// for both the start and end tokens
			var startToken = new TagTk(name, tkAttribs, tkRTInfo);
			var endToken   = new EndTagTk(name, tkAttribs, tkRTInfo);
			var handlers   = WSP.getTokenHandler(state, startToken);

			// Serialize startToken
			if (handlers.init) handlers.init(state, startToken);
			startToken.handler = handlers.start;
			startToken.startsNewline = handlers.startsNewline;
			startToken.swallowsExcessNewlines = handlers.startSwallowsExcessNewlines;
			startToken.pairsNeedNLSep = handlers.pairsNeedNLSep;
			this._serializeToken(state, startToken);

			// then children
			for ( var i = 0, l = children.length; i < l; i++ ) {
				this._serializeDOM( children[i], state );
			}

			// then endToken
			if (handlers.init) handlers.init(state, endToken);
			endToken.handler = handlers.end;
			endToken.endsLine = handlers.endsLine;
			endToken.swallowsExcessNewlines = handlers.endSwallowsExcessNewlines;
			this._serializeToken(state, endToken);
			break;
		case Node.TEXT_NODE:
			this._serializeToken( state, node.data );
			break;
		case Node.COMMENT_NODE:
			state.emitNewlineOnNextToken = false;
			this._serializeToken( state, new CommentTk( node.data ) );
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
