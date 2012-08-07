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
 * In the returned string only the contents of text nodes are included.
 *
 * TODO: The idea of using this method over jQuery's .text() was that it will not traverse into
 * elements that are not contentEditable, however this appears to be missing.
 *
 * @static
 * @member
 * @param {DOMElement} element DOM element to get text of
 * @returns {String} Plain text of DOM element
 */
ve.ce.getDomText = function ( element ) {
	var func = function ( element ) {
		var nodeType = element.nodeType,
			text = '';
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent || innerText for elements
			if ( typeof element.textContent === 'string' ) {
				return element.textContent;
			} else if ( typeof element.innerText === 'string' ) {
				// Replace IE's carriage returns
				return element.innerText.replace( /\r\n/g, '' );
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
 * In the returned string text nodes are repesented as "#" and elements are represented as "<type>"
 * and "</type>" where "type" is their element name. This effectively generates an HTML
 * serialization without any attributes or text contents. This can be used to observer structural
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
