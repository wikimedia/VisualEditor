/*!
 * VisualEditor utilities.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class ve
 */

/**
 * Checks if an object is an instance of one or more classes.
 *
 * @param {Object} subject Object to check
 * @param {Function[]} classes Classes to compare with
 * @return {boolean} Object inherits from one or more of the classes
 */
ve.isInstanceOfAny = function ( subject, classes ) {
	var i = classes.length;

	while ( classes[ --i ] ) {
		if ( subject instanceof classes[ i ] ) {
			return true;
		}
	}
	return false;
};

/**
 * @method
 * @inheritdoc OO#getProp
 */
ve.getProp = OO.getProp;

/**
 * @method
 * @inheritdoc OO#setProp
 */
ve.setProp = OO.setProp;

/**
 * @method
 * @inheritdoc OO#deleteProp
 */
ve.deleteProp = OO.deleteProp;

/**
 * @method
 * @inheritdoc OO#cloneObject
 */
ve.cloneObject = OO.cloneObject;

/**
 * @method
 * @inheritdoc OO#getObjectValues
 */
ve.getObjectValues = OO.getObjectValues;

/**
 * @method
 * @inheritdoc OO#binarySearch
 */
ve.binarySearch = OO.binarySearch;

/**
 * @method
 * @inheritdoc OO#compare
 */
ve.compare = OO.compare;

/**
 * @method
 * @inheritdoc OO#copy
 */
ve.copy = OO.copy;

/**
 * @method
 * @inheritdoc OO.ui#debounce
 */
ve.debounce = OO.ui.debounce;

/**
 * @method
 * @inheritdoc OO.ui#throttle
 */
ve.throttle = OO.ui.throttle;

/**
 * @method
 * @inheritdoc OO.ui.Element#scrollIntoView
 */
ve.scrollIntoView = OO.ui.Element.static.scrollIntoView.bind( OO.ui.Element.static );

/**
 * Copy an array of DOM elements, optionally into a different document.
 *
 * @param {HTMLElement[]} domElements DOM elements to copy
 * @param {HTMLDocument} [doc] Document to create the copies in; if unset, simply clone each element
 * @return {HTMLElement[]} Copy of domElements with copies of each element
 */
ve.copyDomElements = function ( domElements, doc ) {
	return domElements.map( function ( domElement ) {
		return doc ? doc.importNode( domElement, true ) : domElement.cloneNode( true );
	} );
};

/**
 * Check if two arrays of DOM elements are equal (according to .isEqualNode())
 *
 * @param {HTMLElement[]} domElements1 First array of DOM elements
 * @param {HTMLElement[]} domElements2 Second array of DOM elements
 * @return {boolean} All elements are pairwise equal
 */
ve.isEqualDomElements = function ( domElements1, domElements2 ) {
	var i = 0,
		len = domElements1.length;
	if ( len !== domElements2.length ) {
		return false;
	}
	for ( ; i < len; i++ ) {
		if ( !domElements1[ i ].isEqualNode( domElements2[ i ] ) ) {
			return false;
		}
	}
	return true;
};

/**
 * Compare two class lists, either whitespace separated strings or arrays
 *
 * Class lists are equivalent if they contain the same members,
 * excluding duplicates and ignoring order.
 *
 * @param {string[]|string} classList1 First class list
 * @param {string[]|string} classList2 Second class list
 * @return {boolean} Class lists are equivalent
 */
ve.compareClassLists = function ( classList1, classList2 ) {
	var removeEmpty = function ( c ) {
		return c !== '';
	};

	classList1 = Array.isArray( classList1 ) ? classList1 : classList1.trim().split( /\s+/ );
	classList2 = Array.isArray( classList2 ) ? classList2 : classList2.trim().split( /\s+/ );

	classList1 = classList1.filter( removeEmpty );
	classList2 = classList2.filter( removeEmpty );

	return ve.compare( OO.unique( classList1 ).sort(), OO.unique( classList2 ).sort() );
};

/**
 * Check to see if an object is a plain object (created using "{}" or "new Object").
 *
 * @method
 * @source <http://api.jquery.com/jQuery.isPlainObject/>
 * @param {Object} obj The object that will be checked to see if it's a plain object
 * @return {boolean}
 */
ve.isPlainObject = $.isPlainObject;

/**
 * Check to see if an object is empty (contains no properties).
 *
 * @method
 * @source <http://api.jquery.com/jQuery.isEmptyObject/>
 * @param {Object} obj The object that will be checked to see if it's empty
 * @return {boolean}
 */
ve.isEmptyObject = $.isEmptyObject;

/**
 * Merge properties of one or more objects into another.
 * Preserves original object's inheritance (e.g. Array, Object, whatever).
 * In case of array or array-like objects only the indexed properties
 * are copied over.
 * Beware: If called with only one argument, it will consider
 * 'target' as 'source' and 'this' as 'target'. Which means
 * ve.extendObject( { a: 1 } ); sets ve.a = 1;
 *
 * @method
 * @source <http://api.jquery.com/jQuery.extend/>
 * @param {boolean} [recursive=false]
 * @param {Mixed} [target] Object that will receive the new properties
 * @param {...Mixed} [sources] Variadic list of objects containing properties
 * to be merged into the target.
 * @return {Mixed} Modified version of first or second argument
 */
ve.extendObject = $.extend;

/**
 * Feature detect if the browser supports the Internationalization API
 *
 * Should work in Chrome>=24, FF>=29 & IE>=11
 *
 * @private
 * @property {boolean}
 */
ve.supportsIntl = !!( window.Intl && typeof Intl.Collator === 'function' );

/**
 * @private
 * @property {boolean}
 */
ve.supportsSplice = ( function () {
	var a, n;

	// Support: Safari 8
	// This returns false in Safari 8
	a = new Array( 100000 );
	a.splice( 30, 0, 'x' );
	a.splice( 20, 1 );
	if ( a.indexOf( 'x' ) !== 29 ) {
		return false;
	}

	// Support: Opera 12.15
	// This returns false in Opera 12.15
	a = [];
	n = 256;
	a[ n ] = 'a';
	a.splice( n + 1, 0, 'b' );
	if ( a[ n ] !== 'a' ) {
		return false;
	}

	// Splice is supported
	return true;
}() );

/**
 * Splice one array into another.
 *
 * This is the equivalent of arr.splice( offset, remove, d1, d2, d3, ... ) except that arguments are
 * specified as an array rather than separate parameters.
 *
 * This method has been proven to be faster than using slice and concat to create a new array, but
 * performance tests should be conducted on each use of this method to verify this is true for the
 * particular use. Also, browsers change fast, never assume anything, always test everything.
 *
 * Includes a replacement for broken implementations of Array.prototype.splice().
 *
 * @param {Array|ve.dm.BranchNode} arr Target object (must have `splice` method, object will be modified)
 * @param {number} offset Offset in arr to splice at. This MUST NOT be negative, unlike the
 *  'index' parameter in Array#splice.
 * @param {number} remove Number of elements to remove at the offset. May be zero
 * @param {Array} data Array of items to insert at the offset. Must be non-empty if remove=0
 * @return {Array} Array of items removed
 */
ve.batchSplice = function ( arr, offset, remove, data ) {
	// We need to splice insertion in in batches, because of parameter list length limits which vary
	// cross-browser - 1024 seems to be a safe batch size on all browsers
	var splice, spliced,
		index = 0,
		batchSize = 1024,
		toRemove = remove,
		removed = [];

	if ( !Array.isArray( arr ) ) {
		splice = arr.splice;
	} else {
		if ( ve.supportsSplice ) {
			splice = Array.prototype.splice;
		} else {
			// Standard Array.prototype.splice() function implemented using .slice() and .push().
			splice = function ( offset, remove /* , data... */ ) {
				var data, begin, removed, end;

				data = Array.prototype.slice.call( arguments, 2 );

				begin = this.slice( 0, offset );
				removed = this.slice( offset, offset + remove );
				end = this.slice( offset + remove );

				this.length = 0;
				ve.batchPush( this, begin );
				ve.batchPush( this, data );
				ve.batchPush( this, end );

				return removed;
			};
		}
	}

	if ( data.length === 0 ) {
		// Special case: data is empty, so we're just doing a removal
		// The code below won't handle that properly, so we do it here
		return splice.call( arr, offset, remove );
	}

	while ( index < data.length ) {
		// Call arr.splice( offset, remove, i0, i1, i2, ..., i1023 );
		// Only set remove on the first call, and set it to zero on subsequent calls
		spliced = splice.apply(
			arr, [ index + offset, toRemove ].concat( data.slice( index, index + batchSize ) )
		);
		if ( toRemove > 0 ) {
			removed = spliced;
		}
		index += batchSize;
		toRemove = 0;
	}
	return removed;
};

/**
 * Splice one array into another, replicating any holes
 *
 * Similar to arr.splice.apply( arr, [ offset, remove ].concat( data ) ), except holes in
 * data remain holes in arr. Optimized for length changes that are negative, zero, or
 * fairly small positive.
 *
 * @param {Array} arr Array to modify
 * @param {number} offset Offset in arr to splice at. This MUST NOT be negative, unlike the
 *  'index' parameter in Array#splice.
 * @param {number} remove Number of elements to remove at the offset. May be zero
 * @param {Array} data Array of items to insert at the offset
 * @return {Array} Array of items removed, with holes preserved
 */
ve.sparseSplice = function ( arr, offset, remove, data ) {
	var i,
		removed = [],
		endOffset = offset + remove,
		diff = data.length - remove;
	if ( data === arr ) {
		// Pathological case: arr and data are reference-identical
		data = data.slice();
	}
	// Remove content without adjusting length
	arr.slice( offset, endOffset ).forEach( function ( item, i ) {
		removed[ i ] = item;
		delete arr[ offset + i ];
	} );
	// Adjust length
	if ( diff > 0 ) {
		// Grow with undefined values, then delete. (This is optimised for diff
		// comparatively small: otherwise, it would sometimes be quicker to relocate
		// each element of arr that lies above offset).
		ve.batchSplice( arr, endOffset, 0, new Array( diff ) );
		for ( i = endOffset + diff - 1; i >= endOffset; i-- ) {
			delete arr[ i ];
		}
	} else if ( diff < 0 ) {
		// Shrink
		arr.splice( offset, -diff );
	}
	// Insert new content
	data.forEach( function ( item, i ) {
		arr[ offset + i ] = item;
	} );
	// Set removed.length in case there are holes at the end
	removed.length = remove;
	return removed;
};

/**
 * Insert one array into another.
 *
 * Shortcut for `ve.batchSplice( arr, offset, 0, src )`.
 *
 * @see #batchSplice
 * @param {Array|ve.dm.BranchNode} arr Target object (must have `splice` method)
 * @param {number} offset Offset in arr where items will be inserted
 * @param {Array} src Items to insert at offset
 */
ve.insertIntoArray = function ( arr, offset, src ) {
	ve.batchSplice( arr, offset, 0, src );
};

/**
 * Push one array into another.
 *
 * This is the equivalent of arr.push( d1, d2, d3, ... ) except that arguments are
 * specified as an array rather than separate parameters.
 *
 * @param {Array|ve.dm.BranchNode} arr Object supporting .push() to insert at the end of the array. Will be modified
 * @param {Array} data Array of items to insert.
 * @return {number} length of the new array
 */
ve.batchPush = function ( arr, data ) {
	// We need to push insertion in batches, because of parameter list length limits which vary
	// cross-browser - 1024 seems to be a safe batch size on all browsers
	var length,
		index = 0,
		batchSize = 1024;
	if ( batchSize >= data.length ) {
		// Avoid slicing for small lists
		return arr.push.apply( arr, data );
	}
	while ( index < data.length ) {
		// Call arr.push( i0, i1, i2, ..., i1023 );
		length = arr.push.apply(
			arr, data.slice( index, index + batchSize )
		);
		index += batchSize;
	}
	return length;
};

/**
 * Log data to the console.
 *
 * This implementation does nothing, to add a real implementation ve.debug needs to be loaded.
 *
 * @param {...Mixed} [args] Data to log
 */
ve.log = ve.log || function () {
	// Don't do anything, this is just a stub
};

/**
 * Log error to the console.
 *
 * This implementation does nothing, to add a real implementation ve.debug needs to be loaded.
 *
 * @param {...Mixed} [args] Data to log
 */
ve.error = ve.error || function () {
	// Don't do anything, this is just a stub
};

/**
 * Log an object to the console.
 *
 * This implementation does nothing, to add a real implementation ve.debug needs to be loaded.
 *
 * @param {Object} obj
 */
ve.dir = ve.dir || function () {
	// Don't do anything, this is just a stub
};

/**
 * Select the contents of an element
 *
 * @param {HTMLElement} element Element
 */
ve.selectElement = function ( element ) {
	var win = OO.ui.Element.static.getWindow( element ),
		nativeRange = win.document.createRange(),
		nativeSelection = win.getSelection();
	nativeRange.setStart( element, 0 );
	nativeRange.setEnd( element, element.childNodes.length );
	nativeSelection.removeAllRanges();
	nativeSelection.addRange( nativeRange );
};

/**
 * Get a localized message.
 *
 * @param {string} key Message key
 * @param {...Mixed} [params] Message parameters
 * @return {string} Localized message
 */
ve.msg = function () {
	// Avoid using bind because ve.init.platform doesn't exist yet.
	// TODO: Fix dependency issues between ve.js and ve.init.platform
	return ve.init.platform.getMessage.apply( ve.init.platform, arguments );
};

/**
 * Get platform config value(s)
 *
 * @param {string|string[]} key Config key, or list of keys
 * @return {Mixed|Object} Config value, or keyed object of config values if list of keys provided
 */
ve.config = function () {
	return ve.init.platform.getConfig.apply( ve.init.platform, arguments );
};

/**
 * Get or set a user config value.
 *
 * @param {string|string[]|Object} key Config key, list of keys or object mapping keys to values
 * @param {Mixed} [value] Value to set, if setting and key is a string
 * @return {Mixed|Object|boolean} Config value, keyed object of config values if list of keys provided,
 *  or success boolean if setting.
 */
ve.userConfig = function ( key ) {
	if ( arguments.length <= 1 && ( typeof key === 'string' || Array.isArray( key ) ) ) {
		// get( string key )
		// get( Array keys )
		return ve.init.platform.getUserConfig.apply( ve.init.platform, arguments );
	} else {
		// set( Object values )
		// set( key, value )
		return ve.init.platform.setUserConfig.apply( ve.init.platform, arguments );
	}
};

/**
 * Determine if the text consists of only unattached combining marks.
 *
 * @param {string} text Text to test
 * @return {boolean} The text is unattached combining marks
 */
ve.isUnattachedCombiningMark = function ( text ) {
	return ( /^[\u0300-\u036F]+$/ ).test( text );
};

/**
 * Convert a grapheme cluster offset to a byte offset.
 *
 * @param {string} text Text in which to calculate offset
 * @param {number} clusterOffset Grapheme cluster offset
 * @return {number} Byte offset
 */
ve.getByteOffset = function ( text, clusterOffset ) {
	return unicodeJS.graphemebreak.splitClusters( text )
		.slice( 0, clusterOffset )
		.join( '' )
		.length;
};

/**
 * Convert a byte offset to a grapheme cluster offset.
 *
 * @param {string} text Text in which to calculate offset
 * @param {number} byteOffset Byte offset
 * @return {number} Grapheme cluster offset
 */
ve.getClusterOffset = function ( text, byteOffset ) {
	return unicodeJS.graphemebreak.splitClusters( text.slice( 0, byteOffset ) ).length;
};

/**
 * Get a text substring, taking care not to split grapheme clusters.
 *
 * @param {string} text Text to take the substring from
 * @param {number} start Start offset
 * @param {number} end End offset
 * @param {boolean} [outer=false] Include graphemes if the offset splits them
 * @return {string} Substring of text
 */
ve.graphemeSafeSubstring = function ( text, start, end, outer ) {
	// TODO: improve performance by incrementally inspecting characters around the offsets
	var unicodeStart = ve.getByteOffset( text, ve.getClusterOffset( text, start ) ),
		unicodeEnd = ve.getByteOffset( text, ve.getClusterOffset( text, end ) );

	// If the selection collapses and we want an inner, then just return empty
	// otherwise we'll end up crossing over start and end
	if ( unicodeStart === unicodeEnd && !outer ) {
		return '';
	}

	// The above calculations always move to the right of a multibyte grapheme.
	// Depending on the outer flag, we may want to move to the left:
	if ( unicodeStart > start && outer ) {
		unicodeStart = ve.getByteOffset( text, ve.getClusterOffset( text, start ) - 1 );
	}
	if ( unicodeEnd > end && !outer ) {
		unicodeEnd = ve.getByteOffset( text, ve.getClusterOffset( text, end ) - 1 );
	}
	return text.slice( unicodeStart, unicodeEnd );
};

/**
 * Escape non-word characters so they can be safely used as HTML attribute values.
 *
 * @param {string} value Attribute value to escape
 * @return {string} Escaped attribute value
 */
ve.escapeHtml = ( function () {
	function escape( value ) {
		switch ( value ) {
			case '\'':
				return '&#039;';
			case '"':
				return '&quot;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
		}
	}

	return function ( value ) {
		return value.replace( /['"<>&]/g, escape );
	};
}() );

/**
 * Get the attributes of a DOM element as an object with key/value pairs.
 *
 * @param {HTMLElement} element
 * @return {Object}
 */
ve.getDomAttributes = function ( element ) {
	var i,
		result = {};
	for ( i = 0; i < element.attributes.length; i++ ) {
		result[ element.attributes[ i ].name ] = element.attributes[ i ].value;
	}
	return result;
};

/**
 * Set the attributes of a DOM element as an object with key/value pairs.
 *
 * Use the `null` or `undefined` value to ensure an attribute's absence.
 *
 * @param {HTMLElement} element DOM element to apply attributes to
 * @param {Object} attributes Attributes to apply
 * @param {string[]} [whitelist] List of attributes to exclusively allow (all lowercase names)
 */
ve.setDomAttributes = function ( element, attributes, whitelist ) {
	var key;
	// Duck-typing for attribute setting
	if ( !element.setAttribute || !element.removeAttribute ) {
		return;
	}
	for ( key in attributes ) {
		if ( whitelist && whitelist.indexOf( key.toLowerCase() ) === -1 ) {
			continue;
		}
		if ( attributes[ key ] === undefined || attributes[ key ] === null ) {
			element.removeAttribute( key );
		} else {
			element.setAttribute( key, attributes[ key ] );
		}
	}
};

/**
 * Get an HTML representation of a DOM element node, text node or comment node
 *
 * @param {Node} node The DOM node
 * @return {string} HTML representation of the node
 */
ve.getNodeHtml = function ( node ) {
	var div;
	if ( node.nodeType === Node.ELEMENT_NODE ) {
		return node.outerHTML;
	} else {
		div = document.createElement( 'div' );
		div.appendChild( node.cloneNode( true ) );
		return div.innerHTML;
	}
};

/**
 * Build a summary of an HTML element.
 *
 * Summaries include node name, text, attributes and recursive summaries of children.
 * Used for serializing or comparing HTML elements.
 *
 * @private
 * @param {HTMLElement} element Element to summarize
 * @param {boolean} [includeHtml=false] Include an HTML summary for element nodes
 * @param {Function} [getAttributeSummary] Callback to modify the summary of an attribute
 * @param {string} [getAttributeSummary.name] Name of the attribute to modify.
 * @param {string} [getAttributeSummary.value] Value to return for the given attribute.
 * @return {Object} Summary of element.
 */
ve.getDomElementSummary = function ( element, includeHtml, getAttributeSummary ) {
	var i, name, value,
		summary = {
			type: element.nodeName.toLowerCase(),
			text: element.textContent,
			attributes: {},
			children: []
		};

	if ( includeHtml && element.nodeType === Node.ELEMENT_NODE ) {
		summary.html = element.outerHTML;
	}

	// Gather attributes
	if ( element.attributes ) {
		for ( i = 0; i < element.attributes.length; i++ ) {
			name = element.attributes[ i ].name;
			value = element.attributes[ i ].value;
			summary.attributes[ name ] = getAttributeSummary ? getAttributeSummary( name, value ) : value;
		}
	}
	// Summarize children
	if ( element.childNodes ) {
		for ( i = 0; i < element.childNodes.length; i++ ) {
			summary.children.push( ve.getDomElementSummary( element.childNodes[ i ], includeHtml ) );
		}
	}
	return summary;
};

/**
 * Callback for #copy to convert nodes to a comparable summary.
 *
 * @private
 * @param {Object} value Value in the object/array
 * @return {Object} DOM element summary if value is a node, otherwise just the value
 */
ve.convertDomElements = function ( value ) {
	// Use duck typing rather than instanceof Node; the latter doesn't always work correctly
	if ( value && value.nodeType ) {
		return ve.getDomElementSummary( value );
	}
	return value;
};

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
	'void': [
		'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img',
		'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
	]
};

/**
 * Check whether a given node is contentEditable
 *
 * Handles 'inherit', via checking isContentEditable. Knows to check for text
 * nodes, and will return whether the text node's parent is contentEditable.
 *
 * @param  {HTMLElement|Text} node Node to check contenteditable status of
 * @return {boolean} Node is contenteditable
 */
ve.isContentEditable = function ( node ) {
	return ( node.nodeType === Node.TEXT_NODE ? node.parentNode : node ).isContentEditable;
};

/**
 * Filter out metadata elements
 *
 * @param {Node[]} contents DOM nodes
 * @return {Node[]} Filtered DOM nodes
 */
ve.filterMetaElements = function ( contents ) {
	// Filter out link and style tags for T52043
	// Previously filtered out meta tags, but restore these as they
	// can be made visible with CSS.
	// As of jQuery 3 we can't use $.not( 'tagName' ) as that doesn't
	// match text nodes. Also we can't $.remove these elements as they
	// aren't attached to anything.
	contents = contents.filter( function ( node ) {
		return node.tagName !== 'LINK' && node.tagName !== 'STYLE';
	} );
	// Also remove link and style tags nested inside other tags
	$( contents ).find( 'link, style' ).remove();
	return contents;
};

/**
 * Create an HTMLDocument from an HTML string.
 *
 * The html parameter is supposed to be a full HTML document with a doctype and an `<html>` tag.
 * If you pass a document fragment, it may or may not work, this is at the mercy of the browser.
 *
 * To create an empty document, pass the empty string.
 *
 * If your input is both valid HTML and valid XML, and you need to work around style
 * normalization bugs in Internet Explorer, use #parseXhtml and #serializeXhtml.
 *
 * @param {string} html HTML string
 * @return {HTMLDocument} Document constructed from the HTML string
 */
ve.createDocumentFromHtml = function ( html ) {
	var newDocument;

	newDocument = ve.createDocumentFromHtmlUsingDomParser( html );
	if ( newDocument ) {
		return newDocument;
	}

	newDocument = ve.createDocumentFromHtmlUsingIframe( html );
	if ( newDocument ) {
		return newDocument;
	}

	return ve.createDocumentFromHtmlUsingInnerHtml( html );
};

/**
 * Private method for creating an HTMLDocument using the DOMParser
 *
 * @private
 * @param {string} html HTML string
 * @return {HTMLDocument|undefined} Document constructed from the HTML string or undefined if it failed
 */
ve.createDocumentFromHtmlUsingDomParser = function ( html ) {
	var newDocument;

	// Support: IE
	// IE doesn't like empty strings
	html = html || '<body></body>';

	try {
		newDocument = new DOMParser().parseFromString( html, 'text/html' );
		if ( newDocument ) {
			return newDocument;
		}
	} catch ( e ) { }
};

/**
 * Private fallback for browsers which don't support DOMParser
 *
 * @private
 * @param {string} html HTML string
 * @return {HTMLDocument|undefined} Document constructed from the HTML string or undefined if it failed
 */
ve.createDocumentFromHtmlUsingIframe = function ( html ) {
	var newDocument, iframe;

	// Here's what this fallback code should look like:
	//
	//     var newDocument = document.implementation.createHtmlDocument( '' );
	//     newDocument.open();
	//     newDocument.write( html );
	//     newDocument.close();
	//     return newDocument;
	//
	// Sadly, it's impossible:
	// * On IE 9, calling open()/write() on such a document throws an "Unspecified error" (sic).
	// * On Firefox 20, calling open()/write() doesn't actually do anything, including writing.
	//   This is reported as Firefox bug 867102.
	// * On Opera 12, calling open()/write() behaves as if called on window.document, replacing the
	//   entire contents of the page with new HTML. This is reported as Opera bug DSK-384486.
	//
	// Funnily, in all of those browsers it's apparently perfectly legal and possible to access the
	// newly created document's DOM itself, including modifying documentElement's innerHTML, which
	// would achieve our goal. But that requires some nasty magic to strip off the <html></html> tag
	// itself, so we're not doing that. (We can't use .outerHTML, either, as the spec disallows
	// assigning to it for the root element.)
	//
	// There is one more way - create an <iframe>, append it to current document, and access its
	// contentDocument. The only browser having issues with that is Opera (sometimes the accessible
	// value is not actually a Document, but something which behaves just like an empty regular
	// object...), so we're detecting that and using the innerHTML hack described above.

	// Support: Firefox 20
	// Support: Opera 12

	html = html || '<body></body>';

	// Create an invisible iframe
	iframe = document.createElement( 'iframe' );
	iframe.setAttribute( 'frameborder', '0' );
	iframe.setAttribute( 'width', '0' );
	iframe.setAttribute( 'height', '0' );
	// Attach it to the document. We have to do this to get a new document out of it
	document.documentElement.appendChild( iframe );
	// Write the HTML to it
	newDocument = ( iframe.contentWindow && iframe.contentWindow.document ) || iframe.contentDocument;
	newDocument.open();
	newDocument.write( html ); // Party like it's 1995!
	newDocument.close();
	// Detach the iframe
	iframe.parentNode.removeChild( iframe );

	if ( !newDocument.documentElement || newDocument.documentElement.cloneNode( false ) === undefined ) {
		// Surprise! The document is not a document! Only happens on Opera.
		// (Or its nodes are not actually nodes, while the document
		// *is* a document. This only happens when debugging with Dragonfly.)
		return;
	}

	return newDocument;
};

/**
 * Private fallback for browsers which don't support iframe technique
 *
 * @private
 * @param {string} html HTML string
 * @return {HTMLDocument} Document constructed from the HTML string
 */
ve.createDocumentFromHtmlUsingInnerHtml = function ( html ) {
	var i, htmlAttributes, wrapper, attributes,
		newDocument = document.implementation.createHTMLDocument( '' );

	html = html || '<body></body>';

	// Carefully unwrap the HTML out of the root node (and doctype, if any).
	newDocument.documentElement.innerHTML = html
		.replace( /^\s*(?:<!doctype[^>]*>)?\s*<html[^>]*>/i, '' )
		.replace( /<\/html>\s*$/i, '' );

	// Preserve <html> attributes, if any
	htmlAttributes = html.match( /<html([^>]*>)/i );
	if ( htmlAttributes && htmlAttributes[ 1 ] ) {
		wrapper = document.createElement( 'div' );
		wrapper.innerHTML = '<div ' + htmlAttributes[ 1 ] + '></div>';
		attributes = wrapper.firstChild.attributes;
		for ( i = 0; i < attributes.length; i++ ) {
			newDocument.documentElement.setAttribute(
				attributes[ i ].name,
				attributes[ i ].value
			);
		}
	}

	return newDocument;
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

/**
 * Modify a set of DOM elements to resolve attributes in the context of another document.
 *
 * This performs node.setAttribute( 'attr', nodeInDoc[attr] ); for every node.
 *
 * Doesn't use jQuery to avoid document switching performance bug
 *
 * @param {HTMLElement|HTMLElement[]|NodeList|jQuery} elementsOrJQuery Set of DOM elements to modify. Passing a jQuery selector is deprecated.
 * @param {HTMLDocument} doc Document to resolve against (different from $elements' .ownerDocument)
 * @param {string[]} attrs Attributes to resolve
 */
ve.resolveAttributes = function ( elementsOrJQuery, doc, attrs ) {
	var i, iLen, j, jLen, element, attr,
		// Convert jQuery selections to plain arrays
		elements = elementsOrJQuery.toArray ? elementsOrJQuery.toArray() : elementsOrJQuery;

	// Duck typing for array or NodeList :(
	if ( elements.length === undefined ) {
		elements = [ elements ];
	}

	/**
	 * Resolves the value of attr to the computed property value.
	 *
	 * @private
	 * @param {HTMLElement} el Element
	 */
	function resolveAttribute( el ) {
		var nodeInDoc = doc.createElement( el.nodeName );
		nodeInDoc.setAttribute( attr, el.getAttribute( attr ) );
		try {
			if ( nodeInDoc[ attr ] ) {
				el.setAttribute( attr, nodeInDoc[ attr ] );
			}
		} catch ( e ) {
			// Support: IE
			// IE can throw exceptions if the URL is malformed,
			// so just leave them as is, as there's no way to
			// resolve them and hopefully they are absolute
			// URLs. T148858.
		}
	}

	for ( i = 0, iLen = elements.length; i < iLen; i++ ) {
		element = elements[ i ];
		for ( j = 0, jLen = attrs.length; j < jLen; j++ ) {
			attr = attrs[ j ];
			if ( element.hasAttribute( attr ) ) {
				resolveAttribute( element );
			}
			Array.prototype.forEach.call( element.querySelectorAll( '[' + attr + ']' ), resolveAttribute );
		}
	}
};

/**
 * Take a target document with a possibly relative base URL, and modify it to be absolute.
 * The base URL of the target document is resolved using the base URL of the source document.
 *
 * Note that the the fallbackBase parameter will be used if there is no <base> tag, even if
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
 * Make all links within a DOM element open in a new window
 *
 * @param {HTMLElement} container DOM element to search for links
 */
ve.targetLinksToNewWindow = function ( container ) {
	// Make all links open in a new window
	Array.prototype.forEach.call( container.querySelectorAll( 'a[href]' ), function ( el ) {
		ve.appendToRel( el, 'noopener' );
		el.setAttribute( 'target', '_blank' );
	} );
};

/**
 * Add a value to an element's rel attribute if it's not already present
 *
 * Rel is like class: it's actually a set, represented as a string. We don't
 * want to add the same value to the attribute if this function is called
 * repeatedly. This is mostly a placeholder for the relList property someday
 * becoming widely supported.
 *
 * @param  {HTMLElement} element DOM element whose attribute should be checked
 * @param  {string} value New rel value to be added
 */
ve.appendToRel = function ( element, value ) {
	var rel = element.getAttribute( 'rel' );
	if ( !rel ) {
		// Avoid all that string-creation if it's not needed
		element.setAttribute( 'rel', value );
	} else if ( ( ' ' + rel + ' ' ).indexOf( ' ' + value + ' ' ) === -1 ) {
		element.setAttribute( 'rel', rel + ' ' + value );
	}
};

/**
 * Check if a string is a valid URI component.
 *
 * A URI component is considered invalid if decodeURIComponent() throws an exception.
 *
 * @param {string} s String to test
 * @return {boolean} decodeURIComponent( s ) did not throw an exception
 * @see #safeDecodeURIComponent
 */
ve.isUriComponentValid = function ( s ) {
	try {
		decodeURIComponent( s );
	} catch ( e ) {
		return false;
	}
	return true;
};

/**
 * Safe version of decodeURIComponent() that doesn't throw exceptions.
 *
 * If the native decodeURIComponent() call threw an exception, the original string
 * will be returned.
 *
 * @param {string} s String to decode
 * @return {string} Decoded string, or same string if decoding failed
 * @see #isUriComponentValid
 */
ve.safeDecodeURIComponent = function ( s ) {
	try {
		s = decodeURIComponent( s );
	} catch ( e ) {}
	return s;
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
	var div, $element;
	if ( ve.isPreInnerHtmlBroken === undefined ) {
		// Test whether newlines in `<pre>` are serialized back correctly
		div = document.createElement( 'div' );
		div.innerHTML = '<pre>\n\n</pre>';
		ve.isPreInnerHtmlBroken = div.innerHTML === '<pre>\n</pre>';
	}

	if ( !ve.isPreInnerHtmlBroken ) {
		return element;
	}

	// Workaround for bug 42469: if a `<pre>` starts with a newline, that means .innerHTML will
	// screw up and stringify it with one fewer newline. Work around this by adding a newline.
	// If we don't see a leading newline, we still don't know if the original HTML was
	// `<pre>Foo</pre>` or `<pre>\nFoo</pre>`, but that's a syntactic difference, not a
	// semantic one, and handling that is the integration target's job.
	$element = $( element ).clone();
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
 * or vice versa.
 *
 * @param {string} html HTML string. Must also be valid XML. Must only have
 *   one root node (e.g. be a complete document).
 * @param {boolean} unmask Map the masked attributes back to their originals
 * @return {string} HTML string modified to mask/unmask broken attributes
 */
ve.transformStyleAttributes = function ( html, unmask ) {
	var xmlDoc, fromAttr, toAttr, i, len,
		maskAttrs = [
			// Support: IE
			'style', // IE normalizes 'color:#ffd' to 'color: rgb(255, 255, 221);'
			'bgcolor', // IE normalizes '#FFDEAD' to '#ffdead'
			'color', // IE normalizes 'Red' to 'red'
			'width', // IE normalizes '240px' to '240'
			'height', // Same as width
			// Support: Firefox
			'rowspan', // IE and Firefox normalize rowspan="02" to rowspan="2"
			'colspan' // Same as rowspan
		];

	// Parse the HTML into an XML DOM
	xmlDoc = new DOMParser().parseFromString( html, 'text/xml' );

	// Go through and mask/unmask each attribute on all elements that have it
	for ( i = 0, len = maskAttrs.length; i < len; i++ ) {
		fromAttr = unmask ? 'data-ve-' + maskAttrs[ i ] : maskAttrs[ i ];
		toAttr = unmask ? maskAttrs[ i ] : 'data-ve-' + maskAttrs[ i ];
		// eslint-disable-next-line no-loop-func
		$( xmlDoc ).find( '[' + fromAttr + ']' ).each( function () {
			var toAttrValue, fromAttrNormalized,
				fromAttrValue = this.getAttribute( fromAttr );

			if ( unmask ) {
				this.removeAttribute( fromAttr );

				// If the data-ve- version doesn't normalize to the same value,
				// the attribute must have changed, so don't overwrite it
				fromAttrNormalized = ve.normalizeAttributeValue( toAttr, fromAttrValue, this.nodeName );
				// toAttr can't not be set, but IE returns null if the value was ''
				toAttrValue = this.getAttribute( toAttr ) || '';
				if ( toAttrValue !== fromAttrNormalized ) {
					return;
				}
			}

			this.setAttribute( toAttr, fromAttrValue );
		} );
	}

	// FIXME T126032: Inject empty text nodes into empty non-void tags to prevent
	// things like <a></a> from being serialized as <a /> and wreaking havoc
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
	var xml;
	// Support: IE
	// Feature-detect style attribute breakage in IE
	if ( ve.isStyleAttributeBroken === undefined ) {
		ve.isStyleAttributeBroken = ve.normalizeAttributeValue( 'style', 'color:#ffd' ) !== 'color:#ffd';
	}
	if ( !ve.isStyleAttributeBroken ) {
		// Support: Firefox
		// Use outerHTML if possible because in Firefox, XMLSerializer URL-encodes
		// hrefs but outerHTML doesn't
		return ve.properOuterHtml( element );
	}

	xml = new XMLSerializer().serializeToString( ve.fixupPreBug( element ) );
	// FIXME T126035: This strips out xmlns as a quick hack
	xml = xml.replace( '<html xmlns="http://www.w3.org/1999/xhtml"', '<html' );
	return ve.transformStyleAttributes( xml, true );
};

/**
 * Wrapper for node.normalize(). The native implementation is broken in IE,
 * so we use our own implementation in that case.
 *
 * @param {Node} node Node to normalize
 */
ve.normalizeNode = function ( node ) {
	var p, nodeIterator, textNode;
	if ( ve.isNormalizeBroken === undefined ) {
		// Support: IE11
		// Feature-detect IE11's broken .normalize() implementation.
		// We know that it fails to remove the empty text node at the end
		// in this example, but for mysterious reasons it also fails to merge
		// text nodes in other cases and we don't quite know why. So if we detect
		// that .normalize() is broken, fall back to a completely manual version.
		p = document.createElement( 'p' );
		p.appendChild( document.createTextNode( 'Foo' ) );
		p.appendChild( document.createTextNode( 'Bar' ) );
		p.appendChild( document.createTextNode( '' ) );
		p.normalize();
		ve.isNormalizeBroken = p.childNodes.length !== 1;
	}

	if ( ve.isNormalizeBroken ) {
		// Perform normalization manually
		nodeIterator = node.ownerDocument.createNodeIterator(
			node,
			NodeFilter.SHOW_TEXT,
			function () { return NodeFilter.FILTER_ACCEPT; },
			false
		);
		while ( ( textNode = nodeIterator.nextNode() ) ) {
			// Remove if empty
			if ( textNode.data === '' ) {
				textNode.parentNode.removeChild( textNode );
				continue;
			}
			// Merge in any adjacent text nodes
			while ( textNode.nextSibling && textNode.nextSibling.nodeType === Node.TEXT_NODE ) {
				textNode.appendData( textNode.nextSibling.data );
				textNode.parentNode.removeChild( textNode.nextSibling );
			}
		}
	} else {
		// Use native implementation
		node.normalize();
	}
};

/**
 * Translate rect by some fixed vector and return a new offset object
 *
 * @param {Object} rect Offset object containing all or any of top, left, bottom, right, width & height
 * @param {number} x Horizontal translation
 * @param {number} y Vertical translation
 * @return {Object} Translated rect
 */
ve.translateRect = function ( rect, x, y ) {
	var translatedRect = {};
	if ( rect.top !== undefined ) {
		translatedRect.top = rect.top + y;
	}
	if ( rect.bottom !== undefined ) {
		translatedRect.bottom = rect.bottom + y;
	}
	if ( rect.left !== undefined ) {
		translatedRect.left = rect.left + x;
	}
	if ( rect.right !== undefined ) {
		translatedRect.right = rect.right + x;
	}
	if ( rect.width !== undefined ) {
		translatedRect.width = rect.width;
	}
	if ( rect.height !== undefined ) {
		translatedRect.height = rect.height;
	}
	return translatedRect;
};

/**
 * Get the start and end rectangles (in a text flow sense) from a list of rectangles
 *
 * The start rectangle is the top-most, and the end rectangle is the bottom-most.
 *
 * @param {Array} rects Full list of rectangles
 * @return {Object|null} Object containing two rectangles: start and end, or null if there are no rectangles
 */
ve.getStartAndEndRects = function ( rects ) {
	var i, l, startRect, endRect;
	if ( !rects || !rects.length ) {
		return null;
	}
	for ( i = 0, l = rects.length; i < l; i++ ) {
		if ( !startRect || rects[ i ].top < startRect.top ) {
			// Use ve.extendObject as ve.copy copies non-plain objects by reference
			startRect = ve.extendObject( {}, rects[ i ] );
		} else if ( rects[ i ].top === startRect.top ) {
			// Merge rects with the same top coordinate
			startRect.left = Math.min( startRect.left, rects[ i ].left );
			startRect.right = Math.max( startRect.right, rects[ i ].right );
			startRect.width = startRect.right - startRect.left;
		}
		if ( !endRect || rects[ i ].bottom > endRect.bottom ) {
			// Use ve.extendObject as ve.copy copies non-plain objects by reference
			endRect = ve.extendObject( {}, rects[ i ] );
		} else if ( rects[ i ].bottom === endRect.bottom ) {
			// Merge rects with the same bottom coordinate
			endRect.left = Math.min( endRect.left, rects[ i ].left );
			endRect.right = Math.max( endRect.right, rects[ i ].right );
			endRect.width = startRect.right - startRect.left;
		}
	}
	return {
		start: startRect,
		end: endRect
	};
};

/**
 * Find the length of the common start sequence of one or more sequences
 *
 * Items are tested for sameness using === .
 *
 * @param {Array} sequences Array of sequences (arrays, strings etc)
 * @return {number} Common start sequence length (0 if sequences is empty)
 */
ve.getCommonStartSequenceLength = function ( sequences ) {
	var i, len, val,
		commonLength = 0;
	if ( sequences.length === 0 ) {
		return 0;
	}
	commonLengthLoop:
	while ( true ) {
		if ( commonLength >= sequences[ 0 ].length ) {
			break;
		}
		val = sequences[ 0 ][ commonLength ];
		for ( i = 1, len = sequences.length; i < len; i++ ) {
			if (
				sequences[ i ].length <= commonLength ||
				sequences[ i ][ commonLength ] !== val
			) {
				break commonLengthLoop;
			}
		}
		commonLength++;
	}
	return commonLength;
};

/**
 * Find the nearest common ancestor of DOM nodes
 *
 * @param {...Node|null} DOM nodes
 * @return {Node|null} Nearest common ancestor; or null if there is none / an argument is null
 */
ve.getCommonAncestor = function () {
	var i, j, nodeCount, chain, node,
		minHeight = null,
		chains = [],
		args = Array.prototype.slice.call( arguments );
	nodeCount = args.length;
	if ( nodeCount === 0 ) {
		return null;
	}
	// Build every chain
	for ( i = 0; i < nodeCount; i++ ) {
		chain = [];
		node = args[ i ];
		while ( node !== null ) {
			chain.unshift( node );
			node = node.parentNode;
		}
		if ( chain.length === 0 ) {
			// args[ i ] was null (so no common ancestor)
			return null;
		}
		if ( i > 0 && chain[ 0 ] !== chains[ chains.length - 1 ][ 0 ] ) {
			// No common ancestor (different documents or unattached branches)
			return null;
		}
		if ( minHeight === null || minHeight > chain.length ) {
			minHeight = chain.length;
		}
		chains.push( chain );
	}

	// Step through chains in parallel, until they differ.
	// All chains are guaranteed to start with the common document element (or the common root
	// of an unattached branch)
	for ( i = 1; i < minHeight; i++ ) {
		node = chains[ 0 ][ i ];
		for ( j = 1; j < nodeCount; j++ ) {
			if ( node !== chains[ j ][ i ] ) {
				return chains[ 0 ][ i - 1 ];
			}
		}
	}
	return chains[ 0 ][ minHeight - 1 ];
};

/**
 * Get the index of a node in its parentNode's childNode list
 *
 * @param {Node} node The node
 * @return {number} Index in parentNode's childNode list
 */
ve.parentIndex = function ( node ) {
	return Array.prototype.indexOf.call( node.parentNode.childNodes, node );
};

/**
 * Get the offset path from ancestor to offset in descendant
 *
 * @param {Node} ancestor The ancestor node
 * @param {Node} node The descendant node
 * @param {number} nodeOffset The offset in the descendant node
 * @return {number[]} The offset path
 */
ve.getOffsetPath = function ( ancestor, node, nodeOffset ) {
	var path = [ nodeOffset ];
	while ( node !== ancestor ) {
		if ( node.parentNode === null ) {
			ve.log( node, 'is not a descendant of', ancestor );
			throw new Error( 'Not a descendant' );
		}
		path.unshift( ve.parentIndex( node ) );
		node = node.parentNode;
	}
	return path;
};

/**
 * Compare two tuples in lexicographical order.
 *
 * This function first compares `a[0]` with `b[0]`, then `a[1]` with `b[1]`, etc.
 * until it encounters a pair where `a[k] != b[k]`; then returns `a[k] - b[k]`.
 *
 * If `a[k] == b[k]` for every `k`, this function returns 0.
 *
 * If a and b are of unequal length, but `a[k] == b[k]` for all `k` that exist in both a and b, then
 * this function returns `Infinity` (if a is longer) or `-Infinity` (if b is longer).
 *
 * @param {number[]} a First tuple
 * @param {number[]} b Second tuple
 * @return {number} `a[k] - b[k]` where k is the lowest k such that `a[k] != b[k]`
 */
ve.compareTuples = function ( a, b ) {
	var i, len;
	for ( i = 0, len = Math.min( a.length, b.length ); i < len; i++ ) {
		if ( a[ i ] !== b[ i ] ) {
			return a[ i ] - b[ i ];
		}
	}
	if ( a.length > b.length ) {
		return Infinity;
	}
	if ( a.length < b.length ) {
		return -Infinity;
	}
	return 0;
};

/**
 * Compare two nodes for position in document
 *
 * Return null if either position is either null or incomparable (e.g. where one of the nodes
 * is detached or the nodes are from different documents).
 *
 * @param {Node|null} node1 First node
 * @param {number|null} offset1 First offset
 * @param {Node|null} node2 Second node
 * @param {number|null} offset2 Second offset
 * @return {number|null} negative, zero or positive number, or null if nodes null or incomparable
 */

ve.compareDocumentOrder = function ( node1, offset1, node2, offset2 ) {
	var commonAncestor = ve.getCommonAncestor( node1, node2 );
	if ( commonAncestor === null ) {
		// Signal no common ancestor. In theory we could disallow this case, and check
		// the nodes for detachedness and same-documentness before each call, but such
		// guard checks would duplicate (either explicitly or implicitly) much of the
		// branch traversal performed in this method.
		return null;
	}
	return ve.compareTuples(
		ve.getOffsetPath( commonAncestor, node1, offset1 ),
		ve.getOffsetPath( commonAncestor, node2, offset2 )
	);
};

/**
 * Get the client platform string from the browser.
 *
 * FIXME T126036: This is a wrapper for calling getSystemPlatform() on the current
 * platform except that if the platform hasn't been constructed yet, it falls back
 * to using the base class implementation in {ve.init.Platform}. A proper solution
 * would be not to need this information before the platform is constructed.
 *
 * @see ve.init.Platform#getSystemPlatform
 * @return {string} Client platform string
 */
ve.getSystemPlatform = function () {
	return ( ve.init.platform && ve.init.platform.constructor || ve.init.Platform ).static.getSystemPlatform();
};

/**
 * Get the closest matching DOM position in document order (forward or reverse)
 *
 * A DOM position is represented as an object with "node" and "offset" properties.
 *
 * The noDescend option can be used to exclude the positions inside certain element nodes; it is
 * a jQuery selector/function ( used as a test by $node.is() - see http://api.jquery.com/is/ );
 * it defaults to ve.rejectsCursor . Void elements (those matching ve.isVoidElement) are always
 * excluded.
 *
 * As well as the end position, an array of ve.PositionSteps (node traversals) is returned.
 * The "stop" option is a boolean-valued function used to test each ve.PositionStep in turn. If
 * If it returns true, the position arrived at is returned; else the stepping continues to the
 * next matching DOM position. It defaults to ve.isHardCursorStep .
 *
 * Limitation: some DOM positions cannot actually hold the cursor; e.g. the start of the interior
 * of a table node. Browser cursoring jumps over text node/annotation node boundaries as if they
 * were invisible, and skips over most grapheme clusters e.g. 'x\u0301' (though not all e.g.
 * '\u062D\u0627'). Also, Chromium normalizes cursor focus/offset, when they are set, to the
 * start-most such cursor position (Firefox does not).
 *
 * @param {Object} position Start position
 * @param {Node} position.node Start node
 * @param {Node} position.offset Start offset
 * @param {number} direction +1 for forward, -1 for reverse
 * @param {Object} options
 * @param {Function|string} [options.noDescend] Selector or function: nodes to skip over
 * @param {Function} [options.stop] Boolean-valued ve.PositionStep test function
 * @return {Object} The adjacent DOM position encountered
 * @return {Node|null} return.node The node, or null if we stepped past the root node
 * @return {number|null} return.offset The offset, or null if we stepped past the root node
 * @return {Object[]} return.steps Steps taken {node: x, type: leave|cross|enter|internal, offset: n}
 * @see ve#isHardCursorStep
 */
ve.adjacentDomPosition = function ( position, direction, options ) {
	var forward, childNode, noDescend, stop, step,
		node = position.node,
		offset = position.offset,
		steps = [];

	noDescend = options.noDescend || ve.rejectsCursor;
	stop = options.stop || ve.isHardCursorStep;

	direction = direction < 0 ? -1 : 1;
	forward = ( direction === 1 );

	while ( true ) {
		// If we're at the node's leading edge, move to the adjacent position in the parent node
		if ( offset === ( forward ? node.length || node.childNodes.length : 0 ) ) {
			step = new ve.PositionStep( node, 'leave' );
			steps.push( step );
			if ( node.parentNode === null ) {
				return {
					node: null,
					offset: null,
					steps: steps
				};
			}
			offset = ve.parentIndex( node ) + ( forward ? 1 : 0 );
			node = node.parentNode;
			if ( stop( step ) ) {
				return {
					node: node,
					offset: offset,
					steps: steps
				};
			}
			// Else take another step
			continue;
		}
		// Else we're in the interior of a node

		// If we're in a text node, move to the position in this node at the next offset
		if ( node.nodeType === Node.TEXT_NODE ) {
			step = new ve.PositionStep(
				node,
				'internal',
				offset - ( forward ? 0 : 1 )
			);
			steps.push( step );
			offset += direction;
			if ( stop( step ) ) {
				return {
					node: node,
					offset: offset,
					steps: steps
				};
			}
			continue;
		}
		// Else we're in the interior of an element node

		childNode = node.childNodes[ forward ? offset : offset - 1 ];

		// Support: Firefox
		// If the child is uncursorable, or is an element matching noDescend, do not
		// descend into it: instead, return the position just beyond it in the current node
		if (
			childNode.nodeType === Node.ELEMENT_NODE &&
			( ve.isVoidElement( childNode ) || $( childNode ).is( noDescend ) )
		) {
			step = new ve.PositionStep( childNode, 'cross' );
			steps.push( step );
			offset += forward ? 1 : -1;
			if ( stop( step ) ) {
				return {
					node: node,
					offset: offset,
					steps: steps
				};
			}
			// Else take another step
			continue;
		}

		// Go to the closest offset inside the child node
		node = childNode;
		offset = forward ? 0 : node.length || node.childNodes.length;
		step = new ve.PositionStep( node, 'enter' );
		steps.push( step );
		if ( stop( step ) ) {
			return {
				node: node,
				offset: offset,
				steps: steps
			};
		}
	}
};

/**
 * Test whether a cursor movement step uses up a cursor press
 *
 * Essentially, this is true unless entering/exiting a contentEditable text/annotation node.
 * For instance in &lt;#text&gt;X&lt;/#text&gt;&lt;b&gt;&lt;#text&gt;y&lt;/#text&gt;&lt;/b&gt;
 * a single cursor press will jump from just after X to just after Y.
 *
 * @param {ve.PositionStep} step The cursor movement step to test
 * @return {boolean} Whether the cursor movement step uses up a cursor press
 * @see ve#adjacentDomPosition
 */
ve.isHardCursorStep = function ( step ) {
	if ( step.node.nodeType === Node.TEXT_NODE ) {
		return step.type === 'internal';
	}
	return ve.isBlockElement( step.node ) || ve.rejectsCursor( step.node );
};

/**
 * Tests whether an adjacent cursor would be prevented from entering the node
 *
 * @param {Node} [node] Element node or text node; defaults to "this" if a Node
 * @return {boolean} Whether an adjacent cursor would be prevented from entering
 */
ve.rejectsCursor = function ( node ) {
	if ( !node && this instanceof Node ) {
		node = this;
	}
	if ( node.nodeType === node.TEXT_NODE ) {
		return false;
	}
	if ( ve.isVoidElement( node ) ) {
		return true;
	}
	// We don't need to check whether the ancestor-nearest contenteditable tag is
	// false, because if so then there can be no adjacent cursor.
	return node.contentEditable === 'false';
};

/**
 * Count the common elements at the start and end of two sequences
 *
 * @param {Array|string} before The original sequence
 * @param {Array|string} after The modified sequence
 * @param {Function} [equals] Two-argument comparison returning boolean (defaults to ===)
 * @return {Object|null} Change offsets (valid in both sequences), or null if unchanged
 * @return {number} return.start Offset from start of first changed element
 * @return {number} return.end Offset from end of last changed element (nonoverlapping with start)
 */
ve.countEdgeMatches = function ( before, after, equals ) {
	var len, start, end;
	if ( !equals ) {
		equals = function ( x, y ) {
			return x === y;
		};
	}

	len = Math.min( before.length, after.length );
	// Find maximal matching left slice
	for ( start = 0; start < len; start++ ) {
		if ( !equals( before[ start ], after[ start ] ) ) {
			break;
		}
	}
	if ( start === len && before.length === after.length ) {
		return null;
	}
	// Find maximal matching right slice that doesn't overlap the left slice
	for ( end = 0; end < len - start; end++ ) {
		if ( !equals(
			before[ before.length - 1 - end ],
			after[ after.length - 1 - end ]
		) ) {
			break;
		}
	}
	return { start: start, end: end };
};

/**
 * Repeat a string n times
 *
 * @param {string} str The string to repeat
 * @param {number} n The number of times to repeat
 * @return {string} The string, repeated n times
 */
ve.repeatString = function ( str, n ) {
	return new Array( n + 1 ).join( str );
};

/**
 * Check whether a jQuery event represents a plain left click, without any modifiers
 *
 * @param {jQuery.Event} e The jQuery event object
 * @return {boolean} Whether it was an unmodified left click
 */
ve.isUnmodifiedLeftClick = function ( e ) {
	return e && e.which && e.which === OO.ui.MouseButtons.LEFT && !( e.shiftKey || e.altKey || e.ctrlKey || e.metaKey );
};

/**
 * Are multiple formats for clipboardData items supported?
 *
 * If you want to use unknown formats, an additional check for whether we're
 * on MS Edge needs to be made, as that only supports standard plain text / HTML.
 *
 * @param {jQuery.Event} e A jQuery event object for a copy/paste event
 * @param {boolean} [customTypes] Check whether non-standard formats are supported
 * @return {boolean} Whether multiple clipboardData item formats are supported
 */
ve.isClipboardDataFormatsSupported = function ( e, customTypes ) {
	var profile, clipboardData,
		cacheKey = customTypes ? 'cachedCustom' : 'cached';

	if ( ve.isClipboardDataFormatsSupported[ cacheKey ] === undefined ) {
		profile = $.client.profile();
		clipboardData = e.originalEvent.clipboardData;
		ve.isClipboardDataFormatsSupported[ cacheKey ] = !!(
			clipboardData &&
			( !customTypes || profile.name !== 'edge' ) && (
				// Support: Chrome
				clipboardData.items ||
				// Support: Firefox >= 48
				// (but not Firefox Android, which has name='android' and doesn't support this feature)
				( profile.name === 'firefox' && profile.versionNumber >= 48 )
			)
		);
	}

	return ve.isClipboardDataFormatsSupported[ cacheKey ];
};
