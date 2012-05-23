/**
 * ContentEditable namespace.
 *
 * All classes and functions will be attached to this object to keep the global namespace clean.
 */
ve.ce = {
	//'factory': Initialized in ve.ce.NodeFactory.js
};

/**
 * List of all nodes that may need to have "slug" on their left or right side
 * For more information look into ve.ce.BrancNode.js
 *
 * TODO: Implement it as a one of node rules instead of a "global" array
 *
 * @static
 * @member
 */
ve.ce.sluggable = [
	'image',
	'list',
	'table',
	'alienInline',
	'alienBlock'
];

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
ve.ce.getDomText = function( element ) {
	var nodeType = element.nodeType,
		text = '';
	if ( nodeType === 1 || nodeType === 9 ) {
		// Use textContent || innerText for elements
		if ( typeof element.textContent === 'string' ) {
			return element.textContent;
		} else if ( typeof element.innerText === 'string' ) {
			// Replace IE's carriage returns
			return element.innerText.replace( /\r\n/g, '' );
		} else {
			// Traverse it's children
			for ( element = element.firstChild; element; element = element.nextSibling) {
				text += ve.ce.getDomText( element );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return element.nodeValue;
	}
	// Return the text, replacing spaces and non-breaking spaces with spaces?
	// TODO: Why are we replacing spaces (\u0020) with spaces (' ')
	return text.replace( ve.ce.whitespacePattern, ' ' );
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
ve.ce.getDomHash = function( element ) {
	var nodeType = element.nodeType,
		nodeName = element.nodeName,
		hash = '';

	if ( nodeType === 3 || nodeType === 4 ) {
		return '#';
	} else if ( nodeType === 1 || nodeType === 9 ) {
		hash += '<' + nodeName + '>';
		// Traverse it's children
		for ( element = element.firstChild; element; element = element.nextSibling) {
			hash += ve.ce.getDomHash( element );
		}
		hash += '</' + nodeName + '>';
	}
	return hash;
};
