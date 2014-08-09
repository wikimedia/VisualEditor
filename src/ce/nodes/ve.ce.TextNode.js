/*!
 * VisualEditor ContentEditable TextNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable text node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.TextNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.TextNode = function VeCeTextNode( model, config ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );
};

/* Inheritance */

OO.inheritClass( ve.ce.TextNode, ve.ce.LeafNode );

/* Static Properties */

ve.ce.TextNode.static.name = 'text';

ve.ce.TextNode.static.splitOnEnter = true;

ve.ce.TextNode.whitespaceHtmlCharacters = {
	'\n': '\u21b5', // &crarr; / ↵
	'\t': '\u279e' // &#10142; / ➞
};

/* Methods */

/**
 * Get an HTML rendering of the text.
 *
 * @method
 * @returns {Array} Array of rendered HTML fragments with annotations
 */
ve.ce.TextNode.prototype.getAnnotatedHtml = function () {
	var i, chr,
		data = this.model.getDocument().getDataFromNode( this.model ),
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

	function getChar( index, data ) {
		if ( ve.isArray( data[index] ) ) {
			return data[index][0];
		} else {
			return data[index];
		}
	}

	if ( !significantWhitespace ) {
		// Replace spaces with &nbsp; where needed
		// \u00a0 == &#160; == &nbsp;
		if ( data.length > 0 ) {
			// Leading space
			if ( getChar( 0, data ) === ' ' ) {
				setChar( '\u00a0', 0, data );
			}
		}
		if ( data.length > 1 ) {
			// Trailing space
			if ( getChar( data.length - 1, data ) === ' ' ) {
				setChar( '\u00a0', data.length - 1, data );
			}
		}

		for ( i = 0; i < data.length; i++ ) {
			chr = getChar( i, data );

			// Replace any sequence of 2+ spaces with an alternating pattern
			// (space-nbsp-space-nbsp-...).
			// The leading and trailing space, if present, have already been converted
			// to nbsp, so we know that i is between 1 and data.length - 2.
			if ( chr === ' ' && getChar( i + 1, data ) === ' ' ) {
				setChar( '\u00a0', i + 1, data );
			}

			// Show meaningful whitespace characters
			if ( chr in whitespaceHtmlChars ) {
				setChar( whitespaceHtmlChars[chr], i, data );
			}
		}
	}
	return data;
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TextNode );
