require('./core-upgrade.js');
var PegTokenizer = require('./mediawiki.tokenizer.peg.js').PegTokenizer;
var WikitextConstants = require('./mediawiki.wikitext.constants.js').WikitextConstants;
var Util = require('./mediawiki.Util.js').Util;

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

/* *********************************************************************
 * Here is what the state attributes mean:
 *
 * listStack
 *    Stack of list contexts to let us emit wikitext for nested lists.
 *    Each context keeps track of 3 values:
 *    - itemBullet: the wikitext bullet char for this list
 *    - itemCount : # of list items encountered so far for the list
 *    - bullets   : cumulative bullet prefix based on all the lists
 *                  that enclose the current list
 *
 * onNewline
 *    true on start of file or after a new line has been emitted.
 *
 * onStartOfLine
 *    true when onNewline is true, and also in other start-of-line contexts
 *    Ex: after a comment has been emitted, or after include/noinclude tokens.
 *
 * singleLineMode
 *    - if (> 0), we cannot emit any newlines.
 *    - this value changes as we entire/exit dom subtrees that require
 *      single-line wikitext output. WSP._tagHandlers specify single-line
 *      mode for individual tags.
 *
 * availableNewlineCount
 *    # of newlines that have been encountered so far but not emitted yet.
 *    Newlines are buffered till they need to be output.  This lets us
 *    swallow newlines in contexts where they shouldn't be emitted for
 *    ensuring equivalent wikitext output. (ex dom: ..</li>\n\n</li>..)
 * ********************************************************************* */

WSP.initialState = {
	listStack: [],
	onNewline: true,
	onStartOfLine : true,
	availableNewlineCount: 0,
	singleLineMode: 0,
	tokens: []
};

WSP.escapeWikiText = function ( state, text ) {
	// tokenize the text
	var p = new PegTokenizer( state.env ),
		tokens = [];
	p.on('chunk', function ( chunk ) {
		//console.warn( JSON.stringify(chunk));
		tokens.push.apply( tokens, chunk );
	});
	p.on('end', function(){
		//console.warn( JSON.stringify('end'));
	});
	// this is synchronous for now, will still need sync version later, or
	// alternatively make text processing in the serializer async
	var prefixedText = text;
	var inNewlineContext = state.onNewLine;
	if ( ! inNewlineContext ) {
		// Prefix '_' so that no start-of-line wiki syntax matches. Strip it from
		// the result.
		prefixedText = '_' + text;
	}

	if ( state.inIndentPre ) {
		prefixedText = prefixedText.replace(/(\r?\n)/g, '$1_');
	}

	// FIXME: parse using
	p.process( prefixedText );

	if ( ! inNewlineContext ) {
		// now strip the leading underscore.
		if ( tokens[0] === '_' ) {
			tokens.shift();
		} else {
			tokens[0] = tokens[0].substr(1);
		}
	}

	// state.inIndentPre is handled on the complete output

	//
	// wrap any run of non-text tokens into <nowiki> tags using the source
	// offsets of top-level productions
	// return the updated text
	var outTexts = [],
		nonTextTokenAccum = [],
		cursor = 0;
	function wrapNonTextTokens () {
		if ( nonTextTokenAccum.length ) {
			var missingRangeEnd = false;
			// TODO: make sure the source positions are always set!
			// The start range
			var startRange = nonTextTokenAccum[0].dataAttribs.tsr,
				rangeStart, rangeEnd;
			if ( ! startRange ) {
				console.warn( 'No tsr on ' + nonTextTokenAccum[0] );
				rangeStart = cursor;
			} else {
				rangeStart = startRange[0];
				if ( ! inNewlineContext ) {
					// compensate for underscore.
					rangeStart--;
				}
				cursor = rangeStart;
			}

			var endRange = nonTextTokenAccum.last().dataAttribs.tsr;
			if ( ! endRange ) {
				// FIXME: improve this!
				//rangeEnd = state.env.tokensToString( tokens ).length;
				// Be conservative and extend the range to the end for now.
				// Alternatives: only extend it to the next token with range
				// info on it.
				missingRangeEnd = true;
				rangeEnd = text.length;
			} else {
				rangeEnd = endRange[1];
				if ( ! inNewlineContext ) {
					// compensate for underscore.
					rangeEnd--;
				}
			}

			var escapedSource = text.substr( rangeStart, rangeEnd - rangeStart )
									.replace( /<(\/?nowiki)>/g, '&lt;$1&gt;' );
			outTexts.push( '<nowiki>' );
			outTexts.push( escapedSource );
			outTexts.push( '</nowiki>' );
			cursor += 17 + escapedSource.length;
			if ( missingRangeEnd ) {
				throw 'No tsr on end token: ' + nonTextTokenAccum.last();
			}
			nonTextTokenAccum = [];
		}
	}

	try {
		for ( var i = 0, l = tokens.length; i < l; i++ ) {
			var token = tokens[i];
			switch ( token.constructor ) {
				case String:
					wrapNonTextTokens();
					outTexts.push(
						token
						// Angle brackets forming HTML tags are picked up as
						// tags and escaped with nowiki. Remaining angle
						// brackets can remain unescaped in the wikitext. They
						// are entity-escaped by the HTML5 DOM serializer when
						// outputting the HTML DOM.
						//.replace(/</g, '&lt;').replace(/>/g, '&gt;')
					);
					cursor += token.length;
					break;
				case NlTk:
					wrapNonTextTokens();
					outTexts.push( '\n' );
					cursor++;
					break;
				case EOFTk:
					wrapNonTextTokens();
					break;
				case TagTk:
				case SelfclosingTagTk:
					var argDict = state.env.KVtoHash( token.attribs );
					if ( argDict['typeof'] === 'mw:Placeholder' &&
							// XXX: move the decision whether to escape or not
							// into individual handlers!
							token.dataAttribs.src )
					{
						wrapNonTextTokens();
						// push out the original source
						// XXX: This assumes the content was not
						// modified for now.
						outTexts.push( token.dataAttribs.src
								// escape ampersands in entity text
								.replace(/&(#?[0-9a-zA-Z]{2,20};)/, '&amp;$1') );
						// skip generated tokens
						for ( ; i < l; i ++) {
							var tk = tokens[i];
							if ( tk.constructor === EndTagTk &&
									tk.name === token.name ) {
										break;
									}
						}
					} else {
						nonTextTokenAccum.push(token);
					}
					break;
				default:
					//console.warn('pushing ' + token);
					nonTextTokenAccum.push(token);
					break;
			}
		}
	} catch ( e ) {
		console.warn( e );
	}
	//console.warn( 'escaped wikiText: ' + outTexts.join('') );
	var res = outTexts.join('');
	if ( state.inIndentPre ) {
		return res.replace(/\n_/g, '\n');
	} else {
		return res;
	}
};

var id = function(v) {
	return function( state ) {
		return v;
	};
};

var installCollector = function ( collectorConstructor, cb, handler, state, token ) {
	state.tokenCollector = new collectorConstructor( token, cb, handler );
	return '';
};



var endTagMatchTokenCollector = function ( tk, cb ) {
	var tokens = [tk];

	return {
		cb: cb,
		collect: function ( state, token ) {
			tokens.push( token );
			if ( token.constructor === EndTagTk &&
					token.name === tk.name ) {
				// finish collection
				if ( this.cb ) {
					// abort further token processing since the cb handled it
					return this.cb( state, tokens );
				} else {
					// let a handler deal with token processing
					return false;
				}
			} else {
				// continue collection
				return true;
			}
		},
		tokens: tokens
	};
};

var closeHeading = function(v) {
	return function(state, token) {
		var prevToken = state.prevToken;
		// Deal with empty headings. Ex: <h1></h1>
		if (prevToken.constructor === TagTk && prevToken.name === token.name) {
			return "<nowiki></nowiki>" + v;
		} else {
			return v;
		}
	};
};

function isListItem(token) {
	if (token.constructor !== TagTk) {
		return false;
	}

	var tokenName = token.name;
	return (tokenName === 'li' || tokenName === 'dt' || tokenName === 'dd');
}

WSP._listHandler = function( handler, bullet, state, token ) {
	if ( state.singleLineMode ) {
		state.singleLineMode--;
	}

	var bullets, res;
	var stack = state.listStack;
	if (stack.length === 0) {
		bullets = bullet;
		res     = bullets;
		handler.startsNewline = true;
	} else {
		var curList = stack.last();
		//console.warn(JSON.stringify( stack ));
		bullets = curList.bullets + curList.itemBullet + bullet;
		curList.itemCount++;
		// A nested list, not directly after a list item
		if (curList.itemCount > 1 && !isListItem(state.prevToken)) {
			res = bullets;
			handler.startsNewline = true;
		} else {
			res = bullet;
			handler.startsNewline = false;
		}
	}
	stack.push({ itemCount: 0, bullets: bullets, itemBullet: ''});
	state.env.dp('lh res', bullets, res, handler );
	return res;
};

WSP._listEndHandler = function( state, token ) {
	state.listStack.pop();
	return '';
};

WSP._listItemHandler = function ( handler, bullet, state, token ) {

	function isRepeatToken(state, token) {
		return	state.prevToken.constructor === EndTagTk &&
				state.prevToken.name === token.name;
	}

	function isMultiLineDtDdPair(state, token) {
		return	token.name === 'dd' &&
				token.dataAttribs.stx !== 'row' &&
				state.prevTagToken.constructor === EndTagTk &&
				state.prevTagToken.name === 'dt';
	}

	var stack   = state.listStack;

	// This check is required to handle cases where the DOM is not well-formed.
	//
	// FIXME NOTE: This is required currently to deal with bugs in the parser
	// as it deals with complex cases.  But, in the future, we could deal with
	// this in one of the following ways:
	// (a) The serializer expects a well-formed DOM and all cleanup will be
	//     done as part of external tools/passes.
	// (b) The serializer supports a small set of exceptional cases and bare
	//     list items could be one of them
	// (c) The serializer ought to handle any DOM that is thrown at it.
	//
	// Yet to be resolved.
	if (stack.length === 0) {
		stack.push({ itemCount: 0, bullets: bullet, itemBullet: bullet});
	}

	var curList = stack[stack.length - 1];
	curList.itemCount++;
	curList.itemBullet = bullet;

	// Output bullet prefix only if:
	// - this is not the first list item
	// - we are either in:
	//    * a new line context,
	//    * seeing an identical token as the last one (..</li><li>...)
	//      (since we are in this handler on encountering a list item token,
	//       this means we are the 2nd or later item in the list, BUT without
	//       any intervening new lines or other tokens in between)
	//    * on the dd part of a multi-line dt-dd pair
	//      (The dd on a single-line dt-dd pair sticks to the dt.
	//       which means it won't get the bullets that the dt already got).
	//
	// SSS FIXME: This condition could be rephrased as:
	//
	// if (isRepeatToken(state, token) ||
	//     (curList.itemCount > 1 && (inStartOfLineContext(state) || isMultiLineDtDdPair(state, token))))
	//
	var res;
	if (curList.itemCount > 1 &&
		(	state.onStartOfLine ||
			isRepeatToken(state, token) ||
			isMultiLineDtDdPair(state, token)
		)
	)
	{
		handler.startsNewline = true;
		res = curList.bullets + bullet;
	} else {
		handler.startsNewline = false;
		res = bullet;
	}
	state.env.dp( 'lih', token, res, handler );
	return res;
};


WSP._figureHandler = function ( state, figTokens ) {

	// skip tokens looking for the image tag
	var img;
	var i = 1, n = figTokens.length;
	while (i < n) {
		if (figTokens[i].name === "img") {
			img = figTokens[i];
			break;
		}
		i++;
	}

	// skip tokens looking for the start and end caption tags
	var fcStartIndex = 0, fcEndIndex = 0;
	while (i < n) {
		if (figTokens[i].name === "figcaption") {
			if (fcStartIndex > 0) {
				fcEndIndex = i;
				break;
			} else {
				fcStartIndex = i;
			}
		}
		i++;
	}

	// Call the serializer to build the caption
	var caption = state.serializer.serializeTokens(figTokens.slice(fcStartIndex+1, fcEndIndex)).join('');

	// Get the image resource name
	// FIXME: file name has been capitalized -- need some fix in the parser
	var argDict = state.env.KVtoHash( img.attribs );
	var imgR = argDict.resource.replace(/(^\[:)|(\]$)/g, '');

	// Now, build the complete wikitext for the figure
	var outBits  = [imgR];
	var figToken = figTokens[0];
	var figAttrs = figToken.dataAttribs.optionList;

	var simpleImgOptions = WikitextConstants.Image.SimpleOptions;
	var prefixImgOptions = WikitextConstants.Image.PrefixOptions;
	var sizeOptions      = { "width": 1, "height": 1};
	var size             = {};
	for (i = 0, n = figAttrs.length; i < n; i++) {
		var a = figAttrs[i];
		var k = a.k, v = a.v;
		if (sizeOptions[k]) {
			size[k] = v;
		} else {
			// Output size first and clear it
			var w = size.width;
			if (w) {
				outBits.push(w + (size.height ? "x" + size.height : '') + "px");
				size.width = null;
			}

			if (k === "aspect") {
				// SSS: Bad Hack!  Need a better solution
				// One solution is to search through prefix options hash but seems ugly.
				// Another is to flip prefix options hash and use it to search.
				if (v) {
					outBits.push("upright=" + v);
				} else {
					outBits.push("upright");
				}
			} else if (simpleImgOptions[v.trim()] === k) {
				// The values and keys in the parser attributes are a flip
				// of how they are in the wikitext constants image hash
				// Hence the indexing by 'v' instead of 'k'
				outBits.push(v);
			} else if (prefixImgOptions[k.trim()]) {
				outBits.push(k + "=" + v);
			} else {
				console.warn("Unknown image option encountered: " + JSON.stringify(a));
			}
		}
	}
	if (caption) {
		outBits.push(caption);
	}

	return "[[" + outBits.join('|') + "]]";
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

	if ( token.name === 'pre' ) {
		// html-syntax pre is very similar to nowiki
		state.inHTMLPre = true;
	}

	if ( token.attribs.length ) {
		return '<' + token.name + ' ' +
			WSP._serializeAttributes( token.attribs ) + close + '>';
	} else {
		return '<' + token.name + close + '>';
	}
};

WSP._serializeHTMLEndTag = function ( state, token ) {
	if ( token.name === 'pre' ) {
		state.inHTMLPre = false;
	}
	if ( ! WSP._emptyTags[ token.name ] ) {
		return '</' + token.name + '>';
	} else {
		return '';
	}
};


WSP._linkHandler =  function( state, tokens ) {
	//return '[[';
	// TODO: handle internal/external links etc using RDFa and dataAttribs
	// Also convert unannotated html links without advanced attributes to
	// external wiki links for html import. Might want to consider converting
	// relative links without path component and file extension to wiki links.
	
	var env = state.env,
		token = tokens.shift(),
		endToken = tokens.pop(),
		attribDict = env.KVtoHash( token.attribs );
	if ( attribDict.rel && attribDict.rel.match( /\bmw:/ ) &&
			attribDict.href !== undefined )
	{
		// we have a rel starting with mw: prefix and href
		var tokenData = token.dataAttribs;
		if ( attribDict.rel === 'mw:WikiLink' ) {
			var base = env.wgScriptPath,
				hrefInfo = token.getAttributeShadowInfo( 'href' ),
				target = hrefInfo.value,
				tail = '',
				prefix = target.substr(0, base.length);
			if ( prefix === base) {
				target = target.substr(base.length);
			}

			if ( hrefInfo.modified ) {
				// there was no rt info or the href was modified: normalize it
				target = target.replace( /_/g, ' ' );
				tail = '';
			} else {
				tail = tokenData.tail || '';
			}

			var unencodedTarget = target;

			// Escape anything that looks like percent encoding, since we
			// decode the wikitext
			target = target.replace( /%(?=[a-f\d]{2})/g, '%25' );

			// If the normalized link text is the same as the normalized
			// target and the link was either modified or not originally a
			// piped link, serialize to a simple link.
			// TODO: implement
			
			var linkText = state.env.tokensToString( tokens, true );


			//env.ap( linkText, target );
			if ( linkText.constructor === String &&
					env.normalizeTitle( Util.stripSuffix( linkText, tail ) ) ===
						env.normalizeTitle( unencodedTarget ) &&
					( hrefInfo.modified || token.dataAttribs.stx === 'simple' ) )
			{
				return '[[' + target + ']]' + tail;
			} else {
				var content = state.serializer.serializeTokens( tokens ).join('');
				content = Util.stripSuffix( content, tail );
				return '[[' + target + '|' + content + ']]' + tail;
			}
		} else if ( attribDict.rel === 'mw:ExtLink' ) {
			return '[' + attribDict.href + ' ' +
				state.serializer.serializeTokens( tokens ).join('') +
				']';
		} else if ( attribDict.rel === 'mw:UrlLink' ) {
			return attribDict.href;
		} else if ( attribDict.rel === 'mw:NumberedExtLink' ) {
			return '[' + attribDict.href + ']';
		} else if ( attribDict.rel === 'mw:Image' ) {
			// simple source-based round-tripping for now..
			// TODO: properly implement!
			if ( token.dataAttribs.src ) {
				return token.dataAttribs.src;
			}
		} else {
			// Unknown rel was set
			return WSP._serializeHTMLTag( state, token );
		}
	} else {
		// TODO: default to extlink for simple links with unknown rel set
		// switch to html only when needed to support attributes

		var isComplexLink = function ( attribDict ) {
			for ( var name in attribDict ) {
				if ( name && ! ( name in { href: 1 } ) ) {
					return true;
				}
			}
			return false;
		};

		if ( true || isComplexLink ( attribDict ) ) {
			// Complex attributes we can't support in wiki syntax
			return WSP._serializeHTMLTag( state, token ) +
				state.serializer.serializeTokens( tokens ) +
				WSP._serializeHTMLEndTag( state, endToken );
		} else {
			// TODO: serialize as external wikilink
			return '';
		}

	}
					
	//if ( rtinfo.type === 'wikilink' ) {
	//	return '[[' + rtinfo.target + ']]';
	//} else {
	//	// external link
	//	return '[' + rtinfo.
};

WSP.genContentSpanTypes = { 'mw:Nowiki':1, 'mw:Entity': 1 };

/**
 * Compare the actual content with the previous content and use
 * dataAttribs.src if it does. Return serialization of modified content
 * otherwise.
 */
WSP.compareSourceHandler = function ( state, tokens ) {
	var token = tokens.shift(),
		lastToken = tokens.pop(),
		content = state.env.tokensToString( tokens, true );
	if ( content.constructor !== String ) {
		return state.serializer.serializeTokens( tokens ).join('');
	} else if ( content === token.dataAttribs.srcContent ) {
		return token.dataAttribs.src;
	} else {
		return content;
	}
};



/* *********************************************************************
 * startsNewline
 *     if true, the wikitext for the dom subtree rooted
 *     at this html tag requires a new line context.
 *
 * endsLine
 *     if true, the wikitext for the dom subtree rooted
 *     at this html tag ends the line.
 *
 * pairsSepNlCount
 *     # of new lines required between wikitext for dom siblings
 *     of the same tag type (..</p><p>.., etc.)
 *
 * newlineTransparent
 *     if true, this token does not change the newline status
 *     after it is emitted.
 *
 * singleLine
 *     if 1, the wikitext for the dom subtree rooted at this html tag
 *     requires all content to be emitted on the same line without
 *     any line breaks. +1 sets the single-line mode (on descending
 *     the dom subtree), -1 clears the single-line mod (on exiting
 *     the dom subtree).
 *
 * ignore
 *     if true, the serializer pretends as if it never saw this token.
 * ********************************************************************* */
WSP.tagHandlers = {
	body: {
		end: {
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
			handle: function ( state, token ) {
					return WSP._listHandler( this, '*', state, token );
			},
			pairSepNLCount: 2,
			newlineTransparent: true
		},
		end: {
			endsLine: true,
			handle: WSP._listEndHandler
		}
	},
	ol: {
		start: {
			startsNewline : true,
			handle: function ( state, token ) {
					return WSP._listHandler( this, '#', state, token );
			},
			pairSepNLCount: 2,
			newlineTransparent: true
		},
		end: {
			endsLine      : true,
			handle: WSP._listEndHandler
		}
	},
	dl: {
		start: {
			startsNewline : true,
			handle: function ( state, token ) {
					return WSP._listHandler( this, '', state, token );
			},
			pairSepNLCount: 2
		},
		end: {
			endsLine: true,
			handle: WSP._listEndHandler
		}
	},
	li: {
		start: {
			handle: function ( state, token ) {
				return WSP._listItemHandler( this, '', state, token );
			},
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
			singleLine: 1,
			handle: function ( state, token ) {
				return WSP._listItemHandler( this, ';', state, token );
			},
			pairSepNLCount: 1,
			newlineTransparent: true
		},
		end: {
			singleLine: -1
		}
	},
	dd: {
		start: {
			singleLine: 1,
			handle: function ( state, token ) {
				return WSP._listItemHandler( this, ':', state, token );
			},
			pairSepNLCount: 1,
			newlineTransparent: true
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
					// data-parsoid (stx: 'wikitext' ?)
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
			// "stx": "html" tags never get here
			// Special case handling in a list context
			// VE embeds list content in paragraph tags.
			//
			// SSS FIXME: This will *NOT* work if the list item has nested paragraph tags!
			var prevToken = state.prevToken;
			if (	token.attribs.length === 0 && 
					(	(state.listStack.length > 0 && isListItem(prevToken)) || 
						(prevToken.constructor === TagTk && prevToken.name === 'td') || 
						(state.ignorePTag && token.constructor === EndTagTk)))
			{
				state.ignorePTag = !state.ignorePTag;
				return { start: { ignore: true }, end: { ignore: true } };
			} else {
				return state.singleLineMode ? WSP.defaultHTMLTagHandler : this;
			}
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
			pairSepNLCount: 2,
			handle: function( state, token ) {
				state.inIndentPre = true;
				state.textHandler = function( t ) {
					return t.replace(/\n/g, '\n ' );
				};
				return ' ';
			}
		},
		end: {
			endsLine: true,
			handle: function( state, token) {
				state.inIndentPre = false;
				state.textHandler = null;
				return '';
			}
		}
	},
	meta: {
		start: {
			handle: function ( state, token ) {
				var argDict = state.env.KVtoHash( token.attribs );
				if ( argDict['typeof'] === 'mw:tag' ) {
					// we use this currently for nowiki and noinclude & co
					this.newlineTransparent = true;
					if ( argDict.content === 'nowiki' ) {
						state.inNoWiki = true;
					} else if ( argDict.content === '/nowiki' ) {
						state.inNoWiki = false;
					} else {
						console.warn( JSON.stringify( argDict ) );
					}
					return '<' + argDict.content + '>';
				} else if ( argDict['typeof'] === 'mw:noinclude' ) {
					this.newlineTransparent = true;
					if ( token.dataAttribs.src === '<noinclude>' ) {
						return '<noinclude>';
					} else {
						return '</noinclude>';
					}
				} else {
					this.newlineTransparent = false;
					return WSP._serializeHTMLTag( state, token );
				}
			}
		}
	},
	span: {
		start: {
			handle: function( state, token ) {
				var argDict = state.env.KVtoHash( token.attribs );
				if ( argDict['typeof'] in WSP.genContentSpanTypes ) {
					if ( argDict['typeof'] === 'mw:Nowiki' ) {
						state.inNoWiki = true;
						return '<nowiki>';
					} else if ( token.dataAttribs.src ) {
						// FIXME: compare content with original content
						return installCollector(
									endTagMatchTokenCollector,
									WSP.compareSourceHandler,
									this,
									state, token
								);
					}
				} else {
					// Fall back to plain HTML serialization for spans created
					// by the editor
					return WSP._serializeHTMLTag( state, token );
				}
			}
		},
		end: {
			handle: function ( state, token ) {
				var argDict = state.env.KVtoHash( token.attribs );
				if ( argDict['typeof'] in WSP.genContentSpanTypes ) {
					if ( argDict['typeof'] === 'mw:Nowiki' ) {
						state.inNoWiki = false;
						return '</nowiki>';
					}
				} else {
					// Fall back to plain HTML serialization for spans created
					// by the editor
					return WSP._serializeHTMLEndTag( state, token );
				}
			}
		}
	},
	figure: {
		start: {
			handle: function ( state, token ) {
				state.tokenCollector = endTagMatchTokenCollector( token, WSP._figureHandler );
				// Set the handler- not terribly useful since this one doesn't
				// have any flags, but still useful for general testing
				state.tokenCollector.handler = this;
				return '';
			}
		}
	},
	hr: {
		start: {
			startsNewline: true,
			endsLine: true,
			handle: function(state, token) {
				var extra_dashes = token.dataAttribs.extra_dashes;
				if (extra_dashes && (extra_dashes > 0)) {
					var buf = ["----"];
					for (var i = 0; i < extra_dashes; i++) {
						buf.push("-");
					}
					return buf.join('');
				} else {
					// num_dashes undefined OR exactly 4
					return "----";
				}
			}
		}
	},
	h1: {
		start: { startsNewline: true, handle: id("="), defaultStartNewlineCount: 2 },
		end: { endsLine: true, handle: closeHeading("=") }
	},
	h2: {
		start: { startsNewline: true, handle: id("=="), defaultStartNewlineCount: 2 },
		end: { endsLine: true, handle: closeHeading("==") }
	},
	h3: {
		start: { startsNewline: true, handle: id("==="), defaultStartNewlineCount: 2 },
		end: { endsLine: true, handle: closeHeading("===") }
	},
	h4: {
		start: { startsNewline: true, handle: id("===="), defaultStartNewlineCount: 2 },
		end: { endsLine: true, handle: closeHeading("====") }
	},
	h5: {
		start: { startsNewline: true, handle: id("====="), defaultStartNewlineCount: 2 },
		end: { endsLine: true, handle: closeHeading("=====") }
	},
	h6: {
		start: { startsNewline: true, handle: id("======"), defaultStartNewlineCount: 2 },
		end: { endsLine: true, handle: closeHeading("======") }
	},
	br: {
		start: {
			startsNewline: true,
			endsLine: true,
			handle: id("")
		}
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
		start: {
			handle: installCollector.bind(null,
						endTagMatchTokenCollector,
						WSP._linkHandler,
						this
					)
		}
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
	var state = $.extend({}, this.initialState, this.options),
		i, l;
	state.serializer = this;
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
	start: { isNewlineEquivalent: true, handle: WSP._serializeHTMLTag },
	end  : { isNewlineEquivalent: true, handle: WSP._serializeHTMLEndTag }
};

WSP._getTokenHandler = function(state, token) {
	var handler;
	if ( token.dataAttribs.src !== undefined &&
		Util.lookup( token.attribs, 'typeof' ) === 'mw:Placeholder' ) {
			// implement generic src round-tripping:
			// return src, and drop the generated content
			if ( token.constructor === TagTk ) {
				state.tokenCollector = endTagMatchTokenCollector( token );
				return { handle: id( token.dataAttribs.src ) };
			} else if ( token.constructor === SelfclosingTagTk ) {
				return { handle: id( token.dataAttribs.src ) };
			} else { // EndTagTk
				state.tokenCollector = null;
				return { handle: id('') };
			}
	} else if (token.dataAttribs.stx === 'html') {
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
	var res = '',
		collectorResult = false,
		handler = {},
		dropContent = state.dropContent;

	if (state.tokenCollector) {
		collectorResult = state.tokenCollector.collect( state, token );
		if ( collectorResult === true ) {
			// continue collecting
			return;
		} else if ( collectorResult !== false ) {
			res = collectorResult;
			if ( state.tokenCollector.handler ) {
				handler = state.tokenCollector.handler;
			}
			state.tokenCollector = null;
		}
	}

	if ( collectorResult === false ) {


		state.prevToken = state.curToken;
		state.curToken  = token;

		// The serializer is logically in a new line context if a new line is pending
		if (state.emitNewlineOnNextToken || (state.availableNewlineCount > 0)) {
			state.onNewline = true;
			state.onStartOfLine = true;
		}

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
					if ( handler.singleLine < 0 && state.singleLineMode ) {
						state.singleLineMode--;
					}
					res = handler.handle ? handler.handle( state, token ) : '';
				}
				break;
			case String:
				res = ( state.inNoWiki || state.inHTMLPre ) ? token
					: this.escapeWikiText( state, token );
				res = state.textHandler ? state.textHandler( res ) : res;
				break;
			case CommentTk:
				res = '<!--' + token.value + '-->';
				// don't consider comments for changes of the onStartOfLine status
				// XXX: convert all non-tag handlers to a similar handler
				// structure as tags?
				handler = { newlineTransparent: true };
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
	}

	if (! dropContent || ! state.dropContent ) {
		var newTrailingNLCount = 0;
		if (res !== '') {
			// Strip leading or trailing newlines from the returned string
			var match = res.match( /^((?:\r?\n)*)((?:.*?|[\r\n]+[^\r\n])*?)((?:\r?\n)*)$/ ),
				leadingNLs = match[1],
				trailingNLs = match[3];

			if (leadingNLs === res) {
				// all newlines, accumulate count, and clear output
				state.availableNewlineCount += leadingNLs.replace(/\r\n/g, '\n').length;
				res = "";
			} else {
				newTrailingNLCount = trailingNLs.replace(/\r\n/g, '\n').length;
				if ( leadingNLs !== '' ) {
					state.availableNewlineCount += leadingNLs.replace(/\r\n/g, '\n').length;
				}
				// strip newlines
				res = match[2];
			}
		}

		// Check if we have a pair of identical tag tokens </p><p>; </ul><ul>; etc.
		// that have to be separated by extra newlines and add those in.
		if (handler.pairSepNLCount && state.prevTagToken &&
				state.prevTagToken.constructor === EndTagTk &&
				state.prevTagToken.name === token.name )
		{
			if ( state.availableNewlineCount < handler.pairSepNLCount) {
				state.availableNewlineCount = handler.pairSepNLCount;
			}
		}

		if (state.env.debug) {
			console.warn(token +
					", res: " + JSON.stringify( res ) +
					", nl: " + state.onNewline +
					", sol: " + state.onStartOfLine +
					', eon:' + state.emitNewlineOnNextToken +
					", #nl: " + state.availableNewlineCount +
					', #new:' + newTrailingNLCount);
		}

		if (res !== '') {
			var out = '';
			// If this is not a html tag and the serializer is not in single-line mode,
			// allocate a newline if
			// - prev token needs a single line,
			// - handler starts a new line and we aren't on a new line,
			//
			// Newline-equivalent tokens (HTML tags for example) don't get
			// implicit newlines.
			if (!handler.isNewlineEquivalent &&
					!state.singleLineMode &&
					!state.availableNewlineCount &&
					((!res.match(/^\s*$/) && state.emitNewlineOnNextToken) ||
					(!state.onStartOfLine && handler.startsNewline)))
			{
				state.availableNewlineCount = handler.defaultStartNewlineCount || 1;
			}

			// Add required # of new lines in the beginning
			for (; state.availableNewlineCount; state.availableNewlineCount--) {
				out += '\n';
			}

			if ( state.singleLineMode ) {
				res = res.replace(/\n/g, ' ');
			}
			out += res;
			state.env.dp(' =>', out);
			state.chunkCB( out );

			// Update new line state
			// 1. If this token generated new trailing new lines, we are in a newline state again.
			//    If not, we are not!  But, handle onStartOfLine specially.
			if (newTrailingNLCount > 0) {
				state.availableNewlineCount = newTrailingNLCount;
				state.onNewline = true;
				state.onStartOfLine = true;
			} else {
				state.availableNewlineCount = 0;
				state.onNewline = false;
				if (!handler.newlineTransparent) {
					state.onStartOfLine = false;
				}
			}

			// 2. Previous token nl state is no longer relevant
			state.emitNewlineOnNextToken = false;
		} else if ( handler.startsNewline && !state.onStartOfLine ) {
			state.emitNewlineOnNextToken = true;
		}

		if (handler.endsLine) {
			// Record end of line
			state.emitNewlineOnNextToken = true;
		}
		if ( handler.singleLine > 0 ) {
			state.singleLineMode += handler.singleLine;
		}
	}
};

/**
 * Serialize an HTML DOM document.
 */
WSP.serializeDOM = function( node, chunkCB ) {
	try {
		var state = $.extend({}, this.initialState, this.options);
		state.serializer = this;
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
	} catch (e) {
		console.warn(e.stack);
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
		if ( attrib.name !== 'data-parsoid' ) {
			out.push( { k: attrib.name, v: attrib.value } );
		}
	}
	return out;
};

WSP._getDOMRTInfo = function( attribs ) {
	if ( attribs['data-parsoid'] ) {
		return JSON.parse( attribs['data-parsoid'].value || '{}' );
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
