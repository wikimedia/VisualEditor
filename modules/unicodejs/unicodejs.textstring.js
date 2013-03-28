/*!
 * UnicodeJS TextString class.
 *
 * @copyright 2013 UnicodeJS team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * This class provides a simple interface to fetching plain text
 * from a data source. The base class reads data from a string, but
 * an extended class could provide access to a more complex structure,
 * e.g. an array or an HTML document tree.
 *
 * @class unicodeJS.TextString
 * @constructor
 * @param {string} text Text
 */
unicodeJS.TextString = function UnicodeJSTextString( text ) {
	this.text = text;
};

/* Methods */

/**
 * Read character at specified position
 *
 * @method
 * @param {number} position Position to read from
 * @returns {string|null} Character, or null if out of bounds
 */
unicodeJS.TextString.prototype.read = function ( position ) {
	if ( position < 0 || position >= this.text.length ) {
		return null;
	}
	return this.text.charAt( position );
};
