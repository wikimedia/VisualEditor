/*!
 * UnicodeJS namespace.
 *
 * @copyright 2013 UnicodeJS team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

( function () {
	var unicodeJS;

	/**
	 * Namespace for all UnicodeJS classes, static methods and static properties.
	 * @class
	 * @singleton
	 */
	unicodeJS = {};

	/**
	 * Split a string into grapheme clusters.
	 *
	 * @param {string} text Text to split
	 * @returns {string[]} Array of clusters
	 */
	unicodeJS.splitClusters = function ( text ) {
		return text.split( /(?![\uDC00-\uDFFF\u0300-\u036F])/g );
		// kludge: for now, just don't split UTF surrogate pairs or combining accents
		// TODO: implement Grapheme boundary rules
	};

	/**
	 * Split a string into Unicode characters, keeping surrogates paired.
	 *
	 * @param {string} text Text to split
	 * @returns {string[]} Array of characters
	 */
	unicodeJS.splitCharacters = function ( text ) {
		return text.split( /(?![\uDC00-\uDFFF])/g );
		// TODO: think through handling of invalid UTF-16
	};

	// Expose
	window.unicodeJS = unicodeJS;
}() );
