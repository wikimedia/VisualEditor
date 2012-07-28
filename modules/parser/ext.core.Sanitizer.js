/*
 * General token sanitizer. Strips out (or encapsulates) unsafe and disallowed
 * tag types and attributes. Should run last in the third, synchronous
 * expansion stage. Tokens from extensions which should not be sanitized
 * can bypass sanitation by setting their rank to 3.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

require('./mediawiki.parser.defines.js');
var Util = require('./mediawiki.Util.js').Util;

var SanitizerConstants = {
	// FIXME: Assumptions:
	// 1. This is "constant" and wont be modified during execution.
	//    (if modified, you might get inconsistent results -- is there
	//    a way to protect attribtues from modification?)
	// 2. All sanitizer have the same global config.
	globalConfig: {
		allowRdfaAttrs: true,
		allowMicrodataAttrs: true,
		html5Mode: true
	},

	// Accepted external URL protocols
	validUrlProtocols: [
		'http://',
		'https://',
		'ftp://',
		'irc://',
		'ircs://',  // @bug 28503
		'gopher://',
		'telnet://', // Well if we're going to support the above.. -ævar
		'nntp://', // @bug 3808 RFC 1738
		'worldwind://',
		'mailto:',
		'news:',
		'svn://',
		'git://',
		'mms://',
		'//' // for protocol-relative URLs
	],

	// List of whitelisted tags that can be used as raw HTML in wikitext.
	// All other html/html-like tags will be spit out as text.
	tagWhiteList: [
		// In case you were wondering, explicit <a .. > HTML is NOT allowed in wikitext.
		// That is why the <a> tag is missing from the white-list.
		'abbr',
		// 'body', // SSS FIXME: Required? -- not present in php sanitizer
		'b', 'bdi', 'big', 'blockquote', 'br',
		'caption', 'center', 'cite', 'code',
		'dd', 'del', 'dfn', 'div', 'dl', 'dt',
		'em',
		'font',
		'gallery', // SSS FIXME: comes from an extension? -- not present in php sanitizer
		// 'head', 'html', // SSS FIXME: Required? -- not present in php sanitizer
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
		'i', 'ins',
		'kbd',
		'li',
		// 'meta', // SSS FIXME:Required? -- not present in php sanitizer
		'ol',
		'p', 'pre',
		'rb', 'rp', 'rt', 'ruby',
		's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
		'tag', // SSS FIXME: comes from an extension? -- not present in php sanitizer
		'table', 'td', 'th', 'tr', 'tt',
		'u', 'ul'
	],

	// Character entity aliases accepted by MediaWiki
	htmlEntityAliases: {
		'רלמ': 'rlm',
		'رلم': 'rlm'
	},

	/**
	 * List of all named character entities defined in HTML 4.01
	 * http://www.w3.org/TR/html4/sgml/entities.html
	 * As well as &apos; which is only defined starting in XHTML1.
	 * @private
	 */
	htmlEntities: {
		'Aacute'   : 193,
		'aacute'   : 225,
		'Acirc'    : 194,
		'acirc'    : 226,
		'acute'    : 180,
		'AElig'    : 198,
		'aelig'    : 230,
		'Agrave'   : 192,
		'agrave'   : 224,
		'alefsym'  : 8501,
		'Alpha'    : 913,
		'alpha'    : 945,
		'amp'      : 38,
		'and'      : 8743,
		'ang'      : 8736,
		'apos'     : 39, // New in XHTML & HTML 5; avoid in output for compatibility with IE.
		'Aring'    : 197,
		'aring'    : 229,
		'asymp'    : 8776,
		'Atilde'   : 195,
		'atilde'   : 227,
		'Auml'     : 196,
		'auml'     : 228,
		'bdquo'    : 8222,
		'Beta'     : 914,
		'beta'     : 946,
		'brvbar'   : 166,
		'bull'     : 8226,
		'cap'      : 8745,
		'Ccedil'   : 199,
		'ccedil'   : 231,
		'cedil'    : 184,
		'cent'     : 162,
		'Chi'      : 935,
		'chi'      : 967,
		'circ'     : 710,
		'clubs'    : 9827,
		'cong'     : 8773,
		'copy'     : 169,
		'crarr'    : 8629,
		'cup'      : 8746,
		'curren'   : 164,
		'dagger'   : 8224,
		'Dagger'   : 8225,
		'darr'     : 8595,
		'dArr'     : 8659,
		'deg'      : 176,
		'Delta'    : 916,
		'delta'    : 948,
		'diams'    : 9830,
		'divide'   : 247,
		'Eacute'   : 201,
		'eacute'   : 233,
		'Ecirc'    : 202,
		'ecirc'    : 234,
		'Egrave'   : 200,
		'egrave'   : 232,
		'empty'    : 8709,
		'emsp'     : 8195,
		'ensp'     : 8194,
		'Epsilon'  : 917,
		'epsilon'  : 949,
		'equiv'    : 8801,
		'Eta'      : 919,
		'eta'      : 951,
		'ETH'      : 208,
		'eth'      : 240,
		'Euml'     : 203,
		'euml'     : 235,
		'euro'     : 8364,
		'exist'    : 8707,
		'fnof'     : 402,
		'forall'   : 8704,
		'frac12'   : 189,
		'frac14'   : 188,
		'frac34'   : 190,
		'frasl'    : 8260,
		'Gamma'    : 915,
		'gamma'    : 947,
		'ge'       : 8805,
		'gt'       : 62,
		'harr'     : 8596,
		'hArr'     : 8660,
		'hearts'   : 9829,
		'hellip'   : 8230,
		'Iacute'   : 205,
		'iacute'   : 237,
		'Icirc'    : 206,
		'icirc'    : 238,
		'iexcl'    : 161,
		'Igrave'   : 204,
		'igrave'   : 236,
		'image'    : 8465,
		'infin'    : 8734,
		'int'      : 8747,
		'Iota'     : 921,
		'iota'     : 953,
		'iquest'   : 191,
		'isin'     : 8712,
		'Iuml'     : 207,
		'iuml'     : 239,
		'Kappa'    : 922,
		'kappa'    : 954,
		'Lambda'   : 923,
		'lambda'   : 955,
		'lang'     : 9001,
		'laquo'    : 171,
		'larr'     : 8592,
		'lArr'     : 8656,
		'lceil'    : 8968,
		'ldquo'    : 8220,
		'le'       : 8804,
		'lfloor'   : 8970,
		'lowast'   : 8727,
		'loz'      : 9674,
		'lrm'      : 8206,
		'lsaquo'   : 8249,
		'lsquo'    : 8216,
		'lt'       : 60,
		'macr'     : 175,
		'mdash'    : 8212,
		'micro'    : 181,
		'middot'   : 183,
		'minus'    : 8722,
		'Mu'       : 924,
		'mu'       : 956,
		'nabla'    : 8711,
		'nbsp'     : 160,
		'ndash'    : 8211,
		'ne'       : 8800,
		'ni'       : 8715,
		'not'      : 172,
		'notin'    : 8713,
		'nsub'     : 8836,
		'Ntilde'   : 209,
		'ntilde'   : 241,
		'Nu'       : 925,
		'nu'       : 957,
		'Oacute'   : 211,
		'oacute'   : 243,
		'Ocirc'    : 212,
		'ocirc'    : 244,
		'OElig'    : 338,
		'oelig'    : 339,
		'Ograve'   : 210,
		'ograve'   : 242,
		'oline'    : 8254,
		'Omega'    : 937,
		'omega'    : 969,
		'Omicron'  : 927,
		'omicron'  : 959,
		'oplus'    : 8853,
		'or'       : 8744,
		'ordf'     : 170,
		'ordm'     : 186,
		'Oslash'   : 216,
		'oslash'   : 248,
		'Otilde'   : 213,
		'otilde'   : 245,
		'otimes'   : 8855,
		'Ouml'     : 214,
		'ouml'     : 246,
		'para'     : 182,
		'part'     : 8706,
		'permil'   : 8240,
		'perp'     : 8869,
		'Phi'      : 934,
		'phi'      : 966,
		'Pi'       : 928,
		'pi'       : 960,
		'piv'      : 982,
		'plusmn'   : 177,
		'pound'    : 163,
		'prime'    : 8242,
		'Prime'    : 8243,
		'prod'     : 8719,
		'prop'     : 8733,
		'Psi'      : 936,
		'psi'      : 968,
		'quot'     : 34,
		'radic'    : 8730,
		'rang'     : 9002,
		'raquo'    : 187,
		'rarr'     : 8594,
		'rArr'     : 8658,
		'rceil'    : 8969,
		'rdquo'    : 8221,
		'real'     : 8476,
		'reg'      : 174,
		'rfloor'   : 8971,
		'Rho'      : 929,
		'rho'      : 961,
		'rlm'      : 8207,
		'rsaquo'   : 8250,
		'rsquo'    : 8217,
		'sbquo'    : 8218,
		'Scaron'   : 352,
		'scaron'   : 353,
		'sdot'     : 8901,
		'sect'     : 167,
		'shy'      : 173,
		'Sigma'    : 931,
		'sigma'    : 963,
		'sigmaf'   : 962,
		'sim'      : 8764,
		'spades'   : 9824,
		'sub'      : 8834,
		'sube'     : 8838,
		'sum'      : 8721,
		'sup'      : 8835,
		'sup1'     : 185,
		'sup2'     : 178,
		'sup3'     : 179,
		'supe'     : 8839,
		'szlig'    : 223,
		'Tau'      : 932,
		'tau'      : 964,
		'there4'   : 8756,
		'Theta'    : 920,
		'theta'    : 952,
		'thetasym' : 977,
		'thinsp'   : 8201,
		'THORN'    : 222,
		'thorn'    : 254,
		'tilde'    : 732,
		'times'    : 215,
		'trade'    : 8482,
		'Uacute'   : 218,
		'uacute'   : 250,
		'uarr'     : 8593,
		'uArr'     : 8657,
		'Ucirc'    : 219,
		'ucirc'    : 251,
		'Ugrave'   : 217,
		'ugrave'   : 249,
		'uml'      : 168,
		'upsih'    : 978,
		'Upsilon'  : 933,
		'upsilon'  : 965,
		'Uuml'     : 220,
		'uuml'     : 252,
		'weierp'   : 8472,
		'Xi'       : 926,
		'xi'       : 958,
		'Yacute'   : 221,
		'yacute'   : 253,
		'yen'      : 165,
		'Yuml'     : 376,
		'yuml'     : 255,
		'Zeta'     : 918,
		'zeta'     : 950,
		'zwj'      : 8205,
		'zwnj'     : 8204
	},

	UTF8_REPLACEMENT: "\xef\xbf\xbd",

	/**
	 * Regular expression to match various types of character references in
	 * Sanitizer::normalizeCharReferences and Sanitizer::decodeCharReferences
	 */
	CHAR_REFS_RE: /&([A-Za-z0-9\x80-\xff]+);|&\#([0-9]+);|&\#[xX]([0-9A-Fa-f]+);|(&)/,

	/**
	 * Blacklist for evil uris like javascript:
	 * WARNING: DO NOT use this in any place that actually requires blacklisting
	 * for security reasons. There are NUMEROUS[1] ways to bypass blacklisting, the
	 * only way to be secure from javascript: uri based xss vectors is to whitelist
	 * things that you know are safe and deny everything else.
	 * [1]: http://ha.ckers.org/xss.html
	 */
	EVIL_URI_RE: /(^|\s|\*\/\s*)(javascript|vbscript)([^\w]|$)/i,

	XMLNS_ATTRIBUTE_RE: /^xmlns:[:A-Z_a-z-.0-9]+$/,

	/**
	 * FIXME: We actually need to strip IDN ignored characters in the link text as
	 * well, so that readers are not mislead. This should perhaps happen at an
	 * earlier stage, while converting links to html.
	 */
	IDN_RE: new RegExp(
		"[\t ]|" +  // general whitespace
		"\u00ad|" + // 00ad SOFT HYPHEN
		"\u1806|" + // 1806 MONGOLIAN TODO SOFT HYPHEN
		"\u200b|" + // 200b ZERO WIDTH SPACE
		"\u2060|" + // 2060 WORD JOINER
		"\ufeff|" + // feff ZERO WIDTH NO-BREAK SPACE
		"\u034f|" + // 034f COMBINING GRAPHEME JOINER
		"\u180b|" + // 180b MONGOLIAN FREE VARIATION SELECTOR ONE
		"\u180c|" + // 180c MONGOLIAN FREE VARIATION SELECTOR TWO
		"\u180d|" + // 180d MONGOLIAN FREE VARIATION SELECTOR THREE
		"\u200c|" + // 200c ZERO WIDTH NON-JOINER
		"\u200d|" + // 200d ZERO WIDTH JOINER
		"[\ufe00-\ufe0f]", // fe00-fe0f VARIATION SELECTOR-1-16
		'g'
	),

	setDerivedConstants: function() {
		function computeCSSDecodeRegexp() {
			// Decode escape sequences and line continuation
			// See the grammar in the CSS 2 spec, appendix D.
			// This has to be done AFTER decoding character references.
			// This means it isn't possible for this function to return
			// unsanitized escape sequences. It is possible to manufacture
			// input that contains character references that decode to
			// escape sequences that decode to character references, but
			// it's OK for the return value to contain character references
			// because the caller is supposed to escape those anyway.
			var space = '[\\x20\\t\\r\\n\\f]';
			var nl = '(?:\\n|\\r\\n|\\r|\\f)';
			var backslash = '\\\\';
			return new RegExp(backslash +
				"(?:" +
					"(" + nl + ") |" + // 1. Line continuation
					"([0-9A-Fa-f]{1,6})" + space+ "? |" + // 2. character number
					"(.) |" + // 3. backslash cancelling special meaning
					"() |" + // 4. backslash at end of string
				")");
		}

		// SSS FIXME:
		// If multiple sanitizers with different configs can be active at the same time,
		// attrWhiteList code would have to be redone to cache the white list in the
		// Sanitizer object rather than in the SanitizerConstants object.
		function computeAttrWhiteList(config) {
			// base list
			var common = ["id", "class", "lang", "dir", "title", "style"];

			// RDFa attributes
			var rdfa = ["about", "property", "resource", "datatype", "typeof"];
			if (config.allowRdfaAttrs) [].push.apply(common, rdfa);

			// MicroData attrs
			var mda = ["itemid", "itemprop", "itemref", "itemscope", "itemtype"];
			if (config.allowMicrodataAttrs) [].push.apply(common, mda);

			var block = common.concat(["align"]);
			var tablealign = ["align", "char", "charoff", "valign"];
			var tablecell = ["abbr", "axis", "headers", "scope", "rowspan", "colspan",
							// these next 4 are deprecated
							"nowrap", "width", "height", "bgcolor"];

			// Numbers refer to sections in HTML 4.01 standard describing the element.
			// See: http://www.w3.org/TR/html4/
			return {
				// 7.5.4
				'div'        : block,
				'center'     : common, // deprecated
				'span'       : block,  // ??

				// 7.5.5
				'h1'         : block,
				'h2'         : block,
				'h3'         : block,
				'h4'         : block,
				'h5'         : block,
				'h6'         : block,

				// 7.5.6
				// address

				// 8.2.4
				// bdo

				// 9.2.1
				'em'         : common,
				'strong'     : common,
				'cite'       : common,
				'dfn'        : common,
				'code'       : common,
				'samp'       : common,
				'kbd'        : common,
				'var'        : common,
				'abbr'       : common,
				// acronym

				// 9.2.2
				'blockquote' : common.concat( [ 'cite' ]),
				// q

				// 9.2.3
				'sub'        : common,
				'sup'        : common,

				// 9.3.1
				'p'          : block,

				// 9.3.2
				'br'         : [ 'id', 'class', 'title', 'style', 'clear' ],

				// 9.3.4
				'pre'        : common.concat([ 'width' ]),

				// 9.4
				'ins'        : common.concat([ 'cite', 'datetime' ]),
				'del'        : common.concat([ 'cite', 'datetime' ]),

				// 10.2
				'ul'         : common.concat([ 'type' ]),
				'ol'         : common.concat([ 'type', 'start' ]),
				'li'         : common.concat([ 'type', 'value' ]),

				// 10.3
				'dl'         : common,
				'dd'         : common,
				'dt'         : common,

				// 11.2.1
				'table'      : common.concat([ 'summary', 'width', 'border', 'frame',
											'rules', 'cellspacing', 'cellpadding',
											'align', 'bgcolor' ]),

				// 11.2.2
				'caption'    : common.concat([ 'align' ]),

				// 11.2.3
				'thead'      : common.concat(tablealign),
				'tfoot'      : common.concat(tablealign),
				'tbody'      : common.concat(tablealign),

				// 11.2.4
				'colgroup'   : common.concat([ 'span', 'width' ]).concat(tablealign),
				'col'        : common.concat([ 'span', 'width' ]).concat(tablealign),

				// 11.2.5
				'tr'         : common.concat([ 'bgcolor' ]).concat(tablealign),

				// 11.2.6
				'td'         : common.concat(tablecell).concat(tablealign),
				'th'         : common.concat(tablecell).concat(tablealign),

				// 12.2 # NOTE: <a> is not allowed directly, but the attrib whitelist is used from the Parser object
				'a'          : common.concat([ 'href', 'rel', 'rev' ]), // rel/rev esp. for RDFa

				// 13.2
				// Not usually allowed, but may be used for extension-style hooks
				// such as <math> when it is rasterized, or if wgAllowImageTag is
				// true
				'img'        : common.concat([ 'alt', 'src', 'width', 'height' ]),

				// 15.2.1
				'tt'         : common,
				'b'          : common,
				'i'          : common,
				'big'        : common,
				'small'      : common,
				'strike'     : common,
				's'          : common,
				'u'          : common,

				// 15.2.2
				'font'       : common.concat([ 'size', 'color', 'face' ]),
				// basefont

				// 15.3
				'hr'         : common.concat([ 'noshade', 'size', 'width' ]),

				// XHTML Ruby annotation text module, simple ruby only.
				// http://www.w3c.org/TR/ruby/
				'ruby'       : common,
				// rbc
				// rtc
				'rb'         : common,
				'rt'         : common, //common.concat([ 'rbspan' ]),
				'rp'         : common,

				// MathML root element, where used for extensions
				// 'title' may not be 100% valid here; it's XHTML
				// http://www.w3.org/TR/REC-MathML/
				'math'       : [ 'class', 'style', 'id', 'title' ],

				// HTML 5 section 4.6
				'bdi' : common
			};
		}

		this.tagWhiteListHash = Util.arrayToHash(this.tagWhiteList);
		this.validProtocolsRE = new RegExp("^(" + this.validUrlProtocols.join('|') + "|/?[^/])[^\\s]+$");
		this.cssDecodeRE = computeCSSDecodeRegexp();
		this.attrWhiteList = computeAttrWhiteList(this.globalConfig);
		this.attrWhiteListCache = {};
	}
};

// init caches, convert lists to hashtables, etc.
SanitizerConstants.setDerivedConstants();

function Sanitizer ( manager ) {
	this.manager = manager;
	this.register( manager );
	this.constants = SanitizerConstants;
}

Sanitizer.prototype.getAttrWhiteList = function(tag) {
	var awlCache = this.constants.attrWhiteListCache;
	if (!awlCache[tag]) {
		awlCache[tag] = Util.arrayToHash(this.constants.attrWhiteList[tag] || []);
	}

	return awlCache[tag];
};

// constants
Sanitizer.prototype.handledRank = 2.99;
Sanitizer.prototype.anyRank = 2.9901;

// Register this transformer with the TokenTransformer
Sanitizer.prototype.register = function ( manager ) {
	this.manager = manager;
	manager.addTransform( this.onAnchor.bind(this), "Sanitizer:onAnchor", this.handledRank, 'tag', 'a' );
	manager.addTransform( this.onAny.bind(this), "Sanitizer:onAny", this.anyRank, 'any' );
};

Sanitizer.prototype._stripIDNs = function ( host ) {
	return host.replace( this.constants.IDN_RE, '' );
};

Sanitizer.prototype.onAnchor = function ( token ) {
	// perform something similar to Sanitizer::cleanUrl
	if ( token.constructor === EndTagTk ) {
		return { token: token };
	}
	var hrefKV = Util.lookupKV( token.attribs, 'href' );
	// FIXME: Should the flattening of attributes to text be performed as part
	// of the AttributeTransformManager processing? This certainly is not the
	// right place!
	if ( hrefKV !== null ) {
		hrefKV.v = this.manager.env.tokensToString( hrefKV.v );
		var proto, host, path;
		var bits = hrefKV.v.match( /(.*?\/\/)([^\/]+)(\/?.*)/ );
		if ( bits ) {
			proto = bits[1];
			host = bits[2];
			path = bits[3];
		} else {
			proto = '';
			host = '';
			path = hrefKV.v;
		}
		host = this._stripIDNs( host );
		hrefKV.v = proto + host + path;
	}
	return { token: token };
};
	
/**
 * Sanitize any tag.
 *
 * XXX: Make attribute sanitation reversible by storing round-trip info in
 * token.dataAttribs object (which is serialized as JSON in a data-parsoid
 * attribute in the DOM).
 */
Sanitizer.prototype.onAny = function ( token ) {
	// XXX: validate token type according to whitelist and convert non-ok ones
	// back to text.

	var tagWLHash = this.constants.tagWhiteListHash;
	if (((token.constructor === TagTk) || (token.constructor === EndTagTk)) &&
		 token.dataAttribs.stx === 'html' &&
		 !tagWLHash[token.name.toLowerCase()]) {
		// unknown tag -- convert to plain text
		token = "&lt;" + ((token.constructor === TagTk) ? "" : "/") + token.name + "&gt;";
	} else {
		// Convert attributes to string, if necessary.
		// XXX: Likely better done in AttributeTransformManager when processing is
		// complete
		if ( token.attribs && token.attribs.length ) {
			var attribs = token.attribs.slice();
			var newToken = $.extend( {}, token );
			var env = this.manager.env;
			for ( var i = 0, l = attribs.length; i < l; i++ ) {
				var kv = attribs[i],
					k = kv.k,
					v = kv.v;

				if ( k.constructor === Array ) {
					k = env.tokensToString ( k );
				}
				if ( v.constructor === Array ) {
					v = env.tokensToString ( v );
				}
				if ( k === 'style' ) {
					v = this.checkCss(v);
				}
				attribs[i] = new KV( k, v );
			}

			// Sanitize attribues
			if (token.constructor === TagTk) {
				newToken.attribs = this.sanitizeTagAttrs(token.name, attribs);
			}

			token = newToken;
		}
	}

	return { token: token };
};

/**
 * If the named entity is defined in the HTML 4.0/XHTML 1.0 DTD,
 * return the UTF-8 encoding of that character. Otherwise, returns
 * pseudo-entity source (eg "&foo;")
 */
Sanitizer.prototype.decodeEntity = function(name ) {
	if (this.constants.htmlEntityAliases(name)) {
		name = this.constants.htmlEntityAliases(name);
	}

	var e = this.constants.htmlEntities(name);
	return e ? Util.codepointToUtf8(e) : "&" + name + ";";
};

/**
 * Return UTF-8 string for a codepoint if that is a valid
 * character reference, otherwise U+FFFD REPLACEMENT CHARACTER.
 */
Sanitizer.prototype.decodeChar = function (codepoint) {
	if (Util.validateCodepoint(codepoint)) {
		return Util.codepointToUtf8(codepoint);
	} else {
		return this.constants.UTF8_REPLACEMENT;
	}
};

/**
 * Decode any character references, numeric or named entities,
 * in the text and return a UTF-8 string.
 */
Sanitizer.prototype.decodeCharReferences = function ( text ) {
	return text.replace(this.constants.CHAR_REFS_RE, function() {
		if (arguments[1]) {
			return this.decodeEntity(arguments[1]);
		} else if (arguments[2]) {
			return this.decodeChar(parseInt(arguments[2], 10));
		} else if (arguments[3]) {
			return this.decodeChar(parseInt(arguments[3], 16));
		} else {
			return arguments[4];
		}
	});
};

Sanitizer.prototype.checkCss = function (text) {
	// Decode character references like &#123;
	text = this.decodeCharReferences(text);
	text = text.replace(this.constants.cssDecodeRE, function() {
				var c;
				if (arguments[1] !== '' ) {
					// Line continuation
					return '';
				} else if (arguments[2] !== '' ) {
					c = Util.codepointToUtf8(parseInt(arguments[2], 16));
				} else if (arguments[3] !== '' ) {
					c = arguments[3];
				} else {
					c = '\\';
				}

				if ( c === "\n" || c === '"' || c === "'" || c === '\\' ) {
					// These characters need to be escaped in strings
					// Clean up the escape sequence to avoid parsing errors by clients
					return '\\' + (c.charCodeAt(0)).toString(16) + ' ';
				} else {
					// Decode unnecessary escape
					return c;
				}
			});

	// Remove any comments; IE gets token splitting wrong
	// This must be done AFTER decoding character references and
	// escape sequences, because those steps can introduce comments
	// This step cannot introduce character references or escape
	// sequences, because it replaces comments with spaces rather
	// than removing them completely.
	text = text.replace(/\/\*.*\*\//g, ' ');

	// Remove anything after a comment-start token, to guard against
	// incorrect client implementations.
	var commentPos = text.indexOf('/*');
	if (commentPos >= 0) {
		text = text.substring(0, commentPos);
	}

	if (/[\000-\010\016-\037\177]/.test(text)) {
		return '/* invalid control char */';
	}
	if (/expression|filter\s*:|accelerator\s*:|url\s*\(/i.test(text)) {
		return '/* insecure input */';
	}
	return text;
};

Sanitizer.prototype.escapeId = function(id, options) {
	// SSS: Not ported -- is this relevant for security?
	return id;
};

Sanitizer.prototype.sanitizeTagAttrs = function(tag, attrs) {
	var allowRdfa = this.constants.globalConfig.allowRdfaAttrs;
	var allowMda  = this.constants.globalConfig.allowMicrodataAttrs;
	var html5Mode = this.constants.globalConfig.html5Mode;
	var xmlnsRE   = this.constants.XMLNS_ATTRIBUTE_RE;
	var evilUriRE = this.constants.EVIL_URI_RE;
	var hrefRE    = this.constants.validProtocolsRE;

	var wlist = this.getAttrWhiteList(tag);
	//console.warn('wlist: ' + JSON.stringify(wlist));
	var newAttrs = {};
	var n = attrs.length;
	for (var i = 0; i < n; i++) {
		var a = attrs[i];
		var k = a.k;
		var v = a.v;

		//console.warn('k = ' + k + '; v = ' + v);

		// allow XML namespace declaration if RDFa is enabled
		if (allowRdfa && k.match(xmlnsRE)) {
			if (!v.match(evilUriRE)) {
				newAttrs[k] = v;
			}
			continue;
		}

		// Allow any attribute beginning with "data-", if in HTML5 mode
		if (!(html5Mode && k.match(/^data-/i)) && !wlist[k]) {
			continue;
		}

		// Strip javascript "expression" from stylesheets.
		// http://msdn.microsoft.com/workshop/author/dhtml/overview/recalc.asp
		if (k === 'style') {
			v = this.checkCss(v);
		}

		if (k === 'id') {
			v = this.escapeId(v, ['noninitial']);
		}

		//RDFa and microdata properties allow URLs, URIs and/or CURIs. check them for sanity
		if (k === 'rel' || k === 'rev' ||
			k === 'about' || k === 'property' || k === 'resource' || // RDFa
			k === 'datatype' || k === 'typeof' ||                    // RDFa
			k === 'itemid' || k === 'itemprop' || k === 'itemref' || // HTML5 microdata
			k === 'itemscope' || k === 'itemtype' ) {                // HTML5 microdata

			//Paranoia. Allow "simple" values but suppress javascript
			if (v.match(evilUriRE)) {
				continue;
			}
		}

		// NOTE: even though elements using href/src are not allowed directly, supply
		//       validation code that can be used by tag hook handlers, etc
		if ( k === 'href' || k === 'src' ) {
			if (!v.match(hrefRE)) {
				continue; //drop any href or src attributes not using an allowed protocol.
						  //NOTE: this also drops all relative URLs
			}
		}

		// If this attribute was previously set, override it.
		// Output should only have one attribute of each name.
		newAttrs[k] = v;

		if (!allowMda) {
			// itemtype, itemid, itemref don't make sense without itemscope
			if (newAttrs.itemscope === undefined) {
				newAttrs.itemtype = undefined;
				newAttrs.itemid = undefined;
				newAttrs.itemref = undefined;
			}
			// TODO: Strip itemprop if we aren't descendants of an itemscope.
		}
	}

	var kvAttrs = [];
	Object.keys(newAttrs).forEach(function(k) {
		kvAttrs.push(new KV(k, newAttrs[k]));
	});

	return kvAttrs;
};

if (typeof module === "object") {
	module.exports.Sanitizer = Sanitizer;
}
