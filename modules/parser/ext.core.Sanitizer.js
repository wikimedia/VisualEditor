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

function Sanitizer ( manager ) {
	this.manager = manager;
	this.register( manager );
}

Sanitizer.dummyFlags = {
	allowRdfaAttrs: true,
	allowMicrodataAttrs: true,
	html5Mode: true
};

// SSS: Could possibly be moved to mediawiki.wikitext.constants
// or some other better named constants/config file or maybe
// even a static config object in Sanitizer.
//
// Accepted external URL protocols
Sanitizer.validUrlProtocols = [
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
	'//', // for protocol-relative URLs
];

// SSS: Could possibly be moved to mediawiki.wikitext.constants
// or some other better named constants/config file
Sanitizer.getValidUrlProtocolsRE = function() {
	if (!this.validUrlProtocolRE) {
		this.validProtocolRE = new RegExp(this.validUrlProtocols.join('|'));
	}

	return this.validUrlProtocolRE;
};

// SSS: Could possibly be moved to mediawiki.wikitext.constants
// or some other better named constants/config file or maybe
// even a static config object in Sanitizer.
Sanitizer.attrWhiteListCache = {};
Sanitizer.getAttrWhiteList = function(tag) {
	if (!this.attrWhiteList) {
		// base list
		var common = ["id", "class", "lang", "dir", "title", "style"];

		// RDFa attributes 
		var rdfa = ["about", "property", "resource", "datatype", "typeof"];
		if (this.dummyFlags.allowRdfaAttrs) [].push.apply(common, rdfa);

		// MicroData attrs
		var mda = ["itemid", "itemprop", "itemref", "itemscope", "itemtype"];
		if (this.dummyFlags.allowMicrodataAttrs) [].push.apply(common, mda);

		var block = common.concat(["align"]);
		var tablealign = ["align", "char", "charoff", "valign"];
		var tablecell = ["abbr", "axis", "headers", "scope", "rowspan", "colspan",
						// these next 4 are deprecated
						"nowrap", "width", "height", "bgcolor"];

		// Numbers refer to sections in HTML 4.01 standard describing the element.
		// See: http://www.w3.org/TR/html4/
		this.attrWhiteList = {
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

	var wlist = this.attrWhiteListCache[tag];
	if (!wlist) {
		wlist = {};
		var wlistArray = this.attrWhiteList[tag] || [];

		// convert array to a hash to enable fast lookup
		for (var i = 0, n = wlistArray.length; i < n; i++) {
			wlist[wlistArray[i]] = 1;
		}

		// cache
		this.attrWhiteListCache[tag] = wlist;
	}

	return wlist;

};

// SSS: These 3 regexps could possibly be moved to mediawiki.wikitext.constants
// or some other better named constants/config file or maybe
// even a static config object in Sanitizer.
//
/**
 * Regular expression to match various types of character references in
 * Sanitizer::normalizeCharReferences and Sanitizer::decodeCharReferences
 */
Sanitizer.CHAR_REFS_REGEX = /&([A-Za-z0-9\x80-\xff]+);|&\#([0-9]+);|&\#[xX]([0-9A-Fa-f]+);|(&)/;

/**
 * Blacklist for evil uris like javascript:
 * WARNING: DO NOT use this in any place that actually requires blacklisting
 * for security reasons. There are NUMEROUS[1] ways to bypass blacklisting, the
 * only way to be secure from javascript: uri based xss vectors is to whitelist
 * things that you know are safe and deny everything else.
 * [1]: http://ha.ckers.org/xss.html
 */
Sanitizer.EVIL_URI_PATTERN = /(^|\s|\*\/\s*)(javascript|vbscript)([^\w]|$)/i;

Sanitizer.XMLNS_ATTRIBUTE_PATTERN = /^xmlns:[:A-Z_a-z-.0-9]+$/;

// constants
Sanitizer.prototype.handledRank = 2.99;
Sanitizer.prototype.anyRank = 2.9901;


// Register this transformer with the TokenTransformer
Sanitizer.prototype.register = function ( manager ) {
	this.manager = manager;
	manager.addTransform( this.onAnchor.bind(this), "Sanitizer:onAnchor", this.handledRank, 'tag', 'a' );
	manager.addTransform( this.onAny.bind(this), "Sanitizer:onAny", this.anyRank, 'any' );
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

// XXX: We actually need to strip IDN ignored characters in the link text as
// well, so that readers are not mislead. This should perhaps happen at an
// earlier stage, while converting links to html.
Sanitizer.prototype._IDNRegexp = new RegExp(
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
		);

Sanitizer.prototype._stripIDNs = function ( host ) {
	return host.replace( this._IDNRegexp, '' );
};
	
	

/**
 * Sanitize any tag.
 *
 * XXX: Make attribute sanitation reversible by storing round-trip info in
 * token.dataAttribs object (which is serialized as JSON in a data-rt
 * attribute in the DOM).
 */
Sanitizer.prototype.onAny = function ( token ) {
	// XXX: validate token type according to whitelist and convert non-ok ones
	// back to text.

	// Convert attributes to string, if necessary.
	// XXX: Likely better done in AttributeTransformManager when processing is
	// complete
	if ( token.attribs && token.attribs.length ) {
		var attribs = token.attribs.slice();
		var newToken = $.extend( {}, token );
		for ( var i = 0, l = attribs.length; i < l; i++ ) {
			var kv = attribs[i],
				k = kv.k,
				v = kv.v;

			if ( k.constructor === Array ) {
				k = this.manager.env.tokensToString ( k );
			}
			if ( v.constructor === Array ) {
				v = this.manager.env.tokensToString ( v );
			}
			if ( k === 'style' ) {
				v = this.checkCss(v);
			}
			attribs[i] = new KV( k, v );
		}

		// Sanitize HTML tags
		if (token.constructor === TagTk) {
			newToken.attribs = this.sanitizeTagAttrs(token.name, attribs);
		}

		token = newToken;
	}

	return { token: token };
};

Sanitizer.prototype.checkCss = function ( value ) {
	if (/[\000-\010\016-\037\177]/.test(value)) {
		return '/* invalid control char */';
	}
	if (/expression|filter\s*:|accelerator\s*:|url\s*\(/i.test(value)) {
		return '/* insecure input */';
	}
	return value;
};

Sanitizer.prototype.escapeId = function(id, options) {
	// SSS: Not ported -- is this relevant for security?
	return id;
};

Sanitizer.prototype.sanitizeTagAttrs = function(tag, attrs) {
	var allowRdfa = Sanitizer.dummyFlags.allowRdfaAttrs;
	var allowMda  = Sanitizer.dummyFlags.allowMicrodataAttrs;
	var html5Mode = Sanitizer.dummyFlags.html5Mode;
	var xmlnsRE   = Sanitizer.XMLNS_ATTRIBUTE_PATTERN;
	var evilUriRE = Sanitizer.EVIL_URI_PATTERN;
	var hrefRE    = Sanitizer.getValidUrlProtocolsRE();

	var wlist = Sanitizer.getAttrWhiteList(tag);
	// console.warn('wlist: ' + JSON.stringify(wlist));
	var newAttrs = {};
	var n = attrs.length;
	for (var i = 0; i < n; i++) {
		var a = attrs[i];
		var k = a.k;
		var v = a.v;

		// console.warn('k = ' + k + '; v = ' + v);

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
