/*!
 * VisualEditor ContentEditable TextNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable text node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.TextNode} model Model to observe
 */
ve.ce.TextNode = function VeCeTextNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model ); // not using this.$
};

/* Inheritance */

ve.inheritClass( ve.ce.TextNode, ve.ce.LeafNode );

/* Static Properties */

ve.ce.TextNode.static.name = 'text';

ve.ce.TextNode.static.canBeSplit = true;

/**
 * Mapping of character and HTML entities or renderings.
 *
 * @static
 * @property
 */
ve.ce.TextNode.htmlCharacters = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'\'': '&#039;',
	'"': '&quot;'
};

ve.ce.TextNode.whitespaceHtmlCharacters = {
	'\n': '&crarr;',
	'\t': '&#10142;'
};

/* Methods */

/**
 * Get an HTML rendering of the text.
 *
 * @method
 * @returns {Array} Array of rendered HTML fragments with annotations
 */
ve.ce.TextNode.prototype.getAnnotatedHtml = function () {
	var i, chr, character, nextCharacter,
		data = this.model.getDocument().getDataFromNode( this.model ),
		htmlChars = ve.ce.TextNode.htmlCharacters,
		whitespaceHtmlChars = ve.ce.TextNode.whitespaceHtmlCharacters,
		significantWhitespace = this.getModel().getParent().hasSignificantWhitespace();

	function setChar( chr, index, data ) {
		if ( ve.isArray( data[index] ) ) {
			// Don't modify the original array, clone it first
			data[index] = data[index].slice( 0 );
			data[index][0] = chr;
		} else {
			data[index] = chr;
		}
	}

	if ( !significantWhitespace ) {
		// Replace spaces with &nbsp; where needed
		if ( data.length > 0 ) {
			// Leading space
			character = data[0];
			if ( ve.isArray( character ) ? character[0] === ' ' : character === ' ' ) {
				setChar( '&nbsp;', 0, data );
			}
		}
		if ( data.length > 1 ) {
			// Trailing space
			character = data[data.length - 1];
			if ( ve.isArray( character ) ? character[0] === ' ' : character === ' ' ) {
				setChar( '&nbsp;', data.length - 1, data );
			}
		}
	}

	for ( i = 0; i < data.length; i++ ) {
		chr = typeof data[i] === 'string' ? data[i] : data[i][0];

		if ( chr === ' ' && !significantWhitespace && data.length > 2 && i !== 0 && i !== data.length - 1 ) {
			// Replace any sequence of 2+ spaces with an alternating pattern
			// (space-nbsp-space-nbsp-...)
			nextCharacter = typeof data[i + 1] === 'string' ? data[i + 1] : data[i + 1][0];
			if ( nextCharacter === ' ' ) {
				setChar( '&nbsp;', i + 1, data );
			}
		}
		if ( !significantWhitespace && chr in whitespaceHtmlChars ) {
			chr = whitespaceHtmlChars[chr];
		}
		if ( chr in htmlChars ) {
			chr = htmlChars[chr];
		}
		setChar( chr, i, data );
	}
	return data;
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TextNode );
