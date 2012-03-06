/**
 * VisualEditor ContentEditable namespace.
 * 
 * All classes and functions will be attached to this object to keep the global namespace clean.
 */
ve.ce = {
	
};

ve.ce.getDOMText = function( elem ) {
	var	nodeType = elem.nodeType,
		ret = '';

	if ( nodeType === 1 || nodeType === 9 ) {
		// Use textContent || innerText for elements
		if ( typeof elem.textContent === 'string' ) {
			return elem.textContent;
		} else if ( typeof elem.innerText === 'string' ) {
			// Replace IE's carriage returns
			return elem.innerText.replace( /\r\n/g, '' );
		} else {
			// Traverse it's children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
				ret += ve.ce.getDOMText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}

	return ret;	
};