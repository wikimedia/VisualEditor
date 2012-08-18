/**
 * VisualEditor content editable namespace.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Namespace for all VisualEditor content editable classes, static methods and static properties.
 */
ve.ce = {
	//'nodeFactory': Initialized in ve.ce.NodeFactory.js
};

/**
 * RegExp pattern for matching all whitespaces in HTML text.
 *
 * \u0020 (32)  space
 * \u00A0 (160) non-breaking space
 *
 * @static
 * @member
 */
ve.ce.whitespacePattern = /[\u0020\u00A0]/g;

/**
 * Gets the plain text of a DOM element.
 *
 * In the returned string only the contents of text nodes are included, and the contents of
 * non-editable elements are excluded (but replaced with the appropriate number of characters
 * so the offsets match up with the linear model).
 *
 * @static
 * @member
 * @param {DOMElement} element DOM element to get text of
 * @returns {String} Plain text of DOM element
 */
ve.ce.getDomText = function ( element ) {
	var func = function ( element ) {
		var nodeType = element.nodeType,
			text = '',
			numChars;
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			if ( element.contentEditable === 'false' ) {
				// For non-editable nodes, don't return the content, but return
				// the right amount of characters so the offsets match up
				numChars = $( element ).data( 'node' ).getOuterLength();
				return new Array( numChars + 1 ).join( '\u2603' );
			} else {
				// Traverse its children
				for ( element = element.firstChild; element; element = element.nextSibling) {
					text += func( element );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return element.nodeValue;
		}
		return text;
	};
	// Return the text, replacing spaces and non-breaking spaces with spaces?
	// TODO: Why are we replacing spaces (\u0020) with spaces (' ')
	return func( element ).replace( ve.ce.whitespacePattern, ' ' );
};

/**
 * Gets a hash of a DOM element's structure.
 *
 * In the returned string text nodes are represented as "#" and elements are represented as "<type>"
 * and "</type>" where "type" is their element name. This effectively generates an HTML
 * serialization without any attributes or text contents. This can be used to observe structural
 * changes.
 *
 * @static
 * @member
 * @param {DOMElement} element DOM element to get hash of
 * @returns {String} Hash of DOM element
 */
ve.ce.getDomHash = function ( element ) {
	var nodeType = element.nodeType,
		nodeName = element.nodeName,
		hash = '';

	if ( nodeType === 3 || nodeType === 4 ) {
		return '#';
	} else if ( nodeType === 1 || nodeType === 9 ) {
		hash += '<' + nodeName + '>';
		// Traverse its children
		for ( element = element.firstChild; element; element = element.nextSibling) {
			hash += ve.ce.getDomHash( element );
		}
		hash += '</' + nodeName + '>';
	}
	return hash;
};
