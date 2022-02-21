/*!
 * VisualEditor parsing utilities, used when converting HTMLDocuments and strings.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class ve
 */

/**
 * Check whether a given DOM element has a block element type.
 *
 * @param {HTMLElement|string} element Element or element name
 * @return {boolean} Element is a block element
 */
ve.isBlockElement = function ( element ) {
	var elementName = typeof element === 'string' ? element : element.nodeName;
	return ve.elementTypes.block.indexOf( elementName.toLowerCase() ) !== -1;
};

/**
 * Check whether a given DOM element is a void element (can't have children).
 *
 * @param {HTMLElement|string} element Element or element name
 * @return {boolean} Element is a void element
 */
ve.isVoidElement = function ( element ) {
	var elementName = typeof element === 'string' ? element : element.nodeName;
	return ve.elementTypes.void.indexOf( elementName.toLowerCase() ) !== -1;
};

ve.elementTypes = {
	block: [
		'div', 'p',
		// Tables
		'table', 'tbody', 'thead', 'tfoot', 'caption', 'th', 'tr', 'td',
		// Lists
		'ul', 'ol', 'li', 'dl', 'dt', 'dd',
		// HTML5 heading content
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
		// HTML5 sectioning content
		'article', 'aside', 'body', 'nav', 'section', 'footer', 'header', 'figure',
		'figcaption', 'fieldset', 'details', 'blockquote',
		// Other
		'hr', 'button', 'canvas', 'center', 'col', 'colgroup', 'embed',
		'map', 'object', 'pre', 'progress', 'video'
	],
	void: [
		// https://html.spec.whatwg.org/#void-elements
		'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
		'link', 'meta', 'param', 'source', 'track', 'wbr'
	]
};

/**
 * Match a specific HTML tag that appears once, e.g. 'html' or 'body'
 *
 * @param {string} html Document HTML
 * @param {string} tag Tag name
 * @return {Array|null} Regex match, null if not found
 */
ve.matchTag = function ( html, tag ) {
	return html.match(
		new RegExp( '<' + tag + '(>|\\s[^>]*>)' )
	);
};

/**
 * Add a tag to `<head>` using HTML string splicing
 *
 * @param {string} docHtml Document HTML
 * @param {string} tagHtml Tag HTML to be added to `<head>`
 * @return {string} Document HTML
 */
ve.addHeadTag = function ( docHtml, tagHtml ) {
	/**
	 * Splice text after a regex match
	 *
	 * @param {Array} match Regex match
	 * @param {string} text Text to insert
	 * @return {string}
	 */
	function insertAfter( match, text ) {
		var offset = match.index + match[ 0 ].length;
		return docHtml.slice( 0, offset ) +
			text +
			docHtml.slice( offset );
	}

	var headMatch = ve.matchTag( docHtml, 'head' );
	if ( headMatch ) {
		return insertAfter( headMatch, tagHtml );
	} else {
		var htmlMatch = ve.matchTag( docHtml, 'html' );
		if ( htmlMatch ) {
			// <html> but no <head>
			return insertAfter( htmlMatch, '<head>' + tagHtml + '</head>' );
		} else {
			// No <html> or </head>
			return '<head>' + tagHtml + '</head>' + docHtml;
		}
	}
};

/**
 * Create an HTMLDocument from an HTML string.
 *
 * The html parameter is supposed to be a full HTML document with a doctype and an `<html>` tag.
 * If you pass a document fragment, it will be wrapped in `<body>…</body>`.
 *
 * To create an empty document, pass the empty string.
 *
 * If your input is both valid HTML and valid XML, and you need to work around style
 * normalization bugs in Internet Explorer, use #parseXhtml and #serializeXhtml.
 *
 * @param {string} html
 * @return {HTMLDocument} Document constructed from the HTML string
 */
ve.createDocumentFromHtml = function ( html ) {
	if ( html !== '' ) {
		if ( !ve.matchTag( html, 'body' ) ) {
			// When the given HTML fragment starts with a <meta> or <style> element, it is placed in the
			// automatically generated <head> rather than <body>, and breaks our assumptions. (T273234)
			html = '<body>' + html + '</body>';
		}
		// Add iOS hack (T116525)
		html = ve.addHeadTag( html, '<meta name="format-detection" content="telephone=no" data-ve-tmp/>' );
	}

	// Support: IE
	// IE doesn't like empty strings
	var newDocument = new DOMParser().parseFromString( html || '<body></body>', 'text/html' );

	// Remove iOS hack
	var tmpMeta = newDocument.querySelector( 'meta[data-ve-tmp]' );
	if ( tmpMeta ) {
		tmpMeta.parentNode.removeChild( tmpMeta );
	}

	return newDocument;
};

/**
 * Take a target document with a possibly relative base URL, and modify it to be absolute.
 * The base URL of the target document is resolved using the base URL of the source document.
 *
 * Note that the fallbackBase parameter will be used if there is no <base> tag, even if
 * the document does have a valid base URL: this is to work around Firefox's behavior of having
 * documents created by DOMParser inherit the base URL of the main document.
 *
 * @param {HTMLDocument} targetDoc Document whose base URL should be resolved
 * @param {HTMLDocument} sourceDoc Document whose base URL should be used for resolution
 * @param {string} [fallbackBase] Base URL to use if resolving the base URL fails or there is no <base> tag
 */
ve.fixBase = function ( targetDoc, sourceDoc, fallbackBase ) {
	var baseNode = targetDoc.getElementsByTagName( 'base' )[ 0 ];
	if ( baseNode ) {
		// Support: Safari
		// In Safari a base node with an invalid href (e.g. protocol-relative)
		// in a document which has been dynamically created results in
		// 'about:blank' rather than '' or null. The base's href will also be '',
		// but that works out just setting the base to fallbackBase, so it's okay.
		if ( !targetDoc.baseURI || targetDoc.baseURI === 'about:blank' ) {
			// <base> tag present but not valid, try resolving its URL
			baseNode.setAttribute( 'href', ve.resolveUrl( baseNode.getAttribute( 'href' ), sourceDoc ) );
			if ( !targetDoc.baseURI && fallbackBase ) {
				// That didn't work, use the fallback
				baseNode.setAttribute( 'href', fallbackBase );
			}
		}
		// Support: Chrome
		// Chrome just entirely ignores <base> tags with a protocol-relative href attribute.
		// Code below is *not a no-op*; reading the href property and setting it back
		// will expand the href *attribute* to use an absolute URL if it was relative.
		// eslint-disable-next-line no-self-assign
		baseNode.href = baseNode.href;
	} else if ( fallbackBase ) {
		// Support: Firefox
		// No <base> tag, add one
		baseNode = targetDoc.createElement( 'base' );
		baseNode.setAttribute( 'href', fallbackBase );
		targetDoc.head.appendChild( baseNode );
	}
};

/**
 * Get the actual inner HTML of a DOM node.
 *
 * In most browsers, .innerHTML is broken and eats newlines in `<pre>` elements, see
 * https://bugzilla.mozilla.org/show_bug.cgi?id=838954 . This function detects this behavior
 * and works around it, to the extent possible. `<pre>\nFoo</pre>` will become `<pre>Foo</pre>`
 * if the browser is broken, but newlines are preserved in all other cases.
 *
 * @param {HTMLElement} element HTML element to get inner HTML of
 * @return {string} Inner HTML
 */
ve.properInnerHtml = function ( element ) {
	return ve.fixupPreBug( element ).innerHTML;
};

/**
 * Get the actual outer HTML of a DOM node.
 *
 * @see ve#properInnerHtml
 * @param {HTMLElement} element HTML element to get outer HTML of
 * @return {string} Outer HTML
 */
ve.properOuterHtml = function ( element ) {
	return ve.fixupPreBug( element ).outerHTML;
};

/**
 * Helper function for #properInnerHtml, #properOuterHtml and #serializeXhtml.
 *
 * Detect whether the browser has broken `<pre>` serialization, and if so return a clone
 * of the node with extra newlines added to make it serialize properly. If the browser is not
 * broken, just return the original node.
 *
 * @param {HTMLElement} element HTML element to fix up
 * @return {HTMLElement} Either element, or a fixed-up clone of it
 */
ve.fixupPreBug = function ( element ) {
	if ( ve.isPreInnerHtmlBroken === undefined ) {
		// Test whether newlines in `<pre>` are serialized back correctly
		var div = document.createElement( 'div' );
		div.innerHTML = '<pre>\n\n</pre>';
		ve.isPreInnerHtmlBroken = div.innerHTML === '<pre>\n</pre>';
	}

	if ( !ve.isPreInnerHtmlBroken ) {
		return element;
	}

	// Workaround for T44469: if a `<pre>` starts with a newline, that means .innerHTML will
	// screw up and stringify it with one fewer newline. Work around this by adding a newline.
	// If we don't see a leading newline, we still don't know if the original HTML was
	// `<pre>Foo</pre>` or `<pre>\nFoo</pre>`, but that's a syntactic difference, not a
	// semantic one, and handling that is the integration target's job.
	var $element = $( element ).clone();
	$element.find( 'pre, textarea, listing' ).each( function () {
		var matches;
		if ( this.firstChild && this.firstChild.nodeType === Node.TEXT_NODE ) {
			matches = this.firstChild.data.match( /^(\r\n|\r|\n)/ );
			if ( matches && matches[ 1 ] ) {
				// Prepend a newline exactly like the one we saw
				this.firstChild.insertData( 0, matches[ 1 ] );
			}
		}
	} );
	return $element.get( 0 );
};

/**
 * Helper function for #transformStyleAttributes.
 *
 * Normalize an attribute value. In compliant browsers, this should be
 * a no-op, but in IE style attributes are normalized on all elements,
 * color and bgcolor attributes are normalized on some elements (like `<tr>`),
 * and width and height attributes are normalized on some elements( like `<table>`).
 *
 * @param {string} name Attribute name
 * @param {string} value Attribute value
 * @param {string} [nodeName='div'] Element name
 * @return {string} Normalized attribute value
 */
ve.normalizeAttributeValue = function ( name, value, nodeName ) {
	var node = document.createElement( nodeName || 'div' );
	node.setAttribute( name, value );
	// Support: IE
	// IE normalizes invalid CSS to empty string, then if you normalize
	// an empty string again it becomes null. Return an empty string
	// instead of null to make this function idempotent.
	return node.getAttribute( name ) || '';
};

/**
 * Helper function for #parseXhtml and #serializeXhtml.
 *
 * Map attributes that are broken in IE to attributes prefixed with data-ve-
 * or vice versa. rowspan/colspan are also broken in Firefox 38 and below, but
 * we don't consider that serious enough to run this function for Firefox.
 *
 * @param {string} html HTML string. Must also be valid XML. Must only have
 *   one root node (e.g. be a complete document).
 * @param {boolean} unmask Map the masked attributes back to their originals
 * @return {string} HTML string modified to mask/unmask broken attributes
 */
ve.transformStyleAttributes = function ( html, unmask ) {
	var maskAttrs = [
		// Support: IE
		'style', // IE normalizes 'color:#ffd' to 'color: rgb(255, 255, 221);'
		'bgcolor', // IE normalizes '#FFDEAD' to '#ffdead'
		'color', // IE normalizes 'Red' to 'red'
		'width', // IE normalizes '240px' to '240'
		'height', // Same as width
		'rowspan', // IE (and FF 38 and below) normalizes rowspan="02" to rowspan="2"
		'colspan' // Same as rowspan
	];

	// Parse the HTML into an XML DOM
	var xmlDoc = new DOMParser().parseFromString( html, 'text/xml' );

	// Go through and mask/unmask each attribute on all elements that have it
	for ( var i = 0, len = maskAttrs.length; i < len; i++ ) {
		var fromAttr = unmask ? 'data-ve-' + maskAttrs[ i ] : maskAttrs[ i ];
		var toAttr = unmask ? maskAttrs[ i ] : 'data-ve-' + maskAttrs[ i ];
		// eslint-disable-next-line no-loop-func
		$( xmlDoc ).find( '[' + fromAttr + ']' ).each( function () {
			var fromAttrValue = this.getAttribute( fromAttr );

			if ( unmask ) {
				this.removeAttribute( fromAttr );

				// If the data-ve- version doesn't normalize to the same value,
				// the attribute must have changed, so don't overwrite it
				var fromAttrNormalized = ve.normalizeAttributeValue( toAttr, fromAttrValue, this.nodeName );
				// toAttr can't not be set, but IE returns null if the value was ''
				var toAttrValue = this.getAttribute( toAttr ) || '';
				if ( toAttrValue !== fromAttrNormalized ) {
					return;
				}
			}

			this.setAttribute( toAttr, fromAttrValue );
		} );
	}

	// Inject empty text nodes into empty non-void tags to prevent things like <a></a> from
	// being serialized as <a /> and wreaking havoc
	$( xmlDoc ).find( ':empty:not(' + ve.elementTypes.void.join( ',' ) + ')' ).each( function () {
		this.appendChild( xmlDoc.createTextNode( '' ) );
	} );

	// Serialize back to a string
	return new XMLSerializer().serializeToString( xmlDoc );
};

/**
 * Parse an HTML string into an HTML DOM, while masking attributes affected by
 * normalization bugs if a broken browser is detected.
 * Since this process uses an XML parser, the input must be valid XML as well as HTML.
 *
 * @param {string} html HTML string. Must also be valid XML. Must only have
 *   one root node (e.g. be a complete document).
 * @return {HTMLDocument} HTML DOM
 */
ve.parseXhtml = function ( html ) {
	// Support: IE
	// Feature-detect style attribute breakage in IE
	if ( ve.isStyleAttributeBroken === undefined ) {
		ve.isStyleAttributeBroken = ve.normalizeAttributeValue( 'style', 'color:#ffd' ) !== 'color:#ffd';
	}
	if ( ve.isStyleAttributeBroken ) {
		html = ve.transformStyleAttributes( html, false );
	}
	return ve.createDocumentFromHtml( html );
};

/**
 * Serialize an HTML DOM created with #parseXhtml back to an HTML string, unmasking any
 * attributes that were masked.
 *
 * @param {HTMLDocument} doc HTML DOM
 * @return {string} Serialized HTML string
 */
ve.serializeXhtml = function ( doc ) {
	return ve.serializeXhtmlElement( doc.documentElement );
};

/**
 * Serialize an HTML element created with #parseXhtml back to an HTML string, unmasking any
 * attributes that were masked.
 *
 * @param {HTMLElement} element HTML element
 * @return {string} Serialized HTML string
 */
ve.serializeXhtmlElement = function ( element ) {
	// Support: IE
	// Feature-detect style attribute breakage in IE
	if ( ve.isStyleAttributeBroken === undefined ) {
		// Note this doesn't catch the rowspan/colspan normalization in Firefox 38 and below
		// We don't think FF<38 is sufficiently broken to justify going through all this XML parsing stuff
		ve.isStyleAttributeBroken = ve.normalizeAttributeValue( 'style', 'color:#ffd' ) !== 'color:#ffd';
	}
	if ( !ve.isStyleAttributeBroken ) {
		// Support: Firefox
		// Use outerHTML if possible because in Firefox, XMLSerializer URL-encodes
		// hrefs but outerHTML doesn't
		return ve.properOuterHtml( element );
	}

	var xml = new XMLSerializer().serializeToString( ve.fixupPreBug( element ) );
	// FIXME T126035: This strips out xmlns as a quick hack
	xml = xml.replace( '<html xmlns="http://www.w3.org/1999/xhtml"', '<html' );
	return ve.transformStyleAttributes( xml, true );
};

/**
 * Resolve a URL relative to a given base.
 *
 * @param {string} url URL to resolve
 * @param {HTMLDocument} base Document whose base URL to use
 * @return {string} Resolved URL
 */
ve.resolveUrl = function ( url, base ) {
	var node = base.createElement( 'a' );
	node.setAttribute( 'href', url );
	// If doc.baseURI isn't set, node.href will be an empty string
	// This is crazy, returning the original URL is better
	return node.href || url;
};
