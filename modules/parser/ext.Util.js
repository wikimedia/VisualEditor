/**
 * General utilities for token transforms
 */

function Util () {
}


/**
 * Determine if a token is block-level or not
 *
 * @static
 * @method
 * @param {Object} token: The token to check
 * @returns {Boolean}: True if token is block-level, false otherwise.
 */
Util.prototype.isBlock = function ( token ) {
	if ( token.type === 'TAG' || 
			token.type === 'ENDTAG' || 
			token.type === 'SELFCLOSINGTAG' ) {
		switch (token.name.toLowerCase()) {
			case 'div':
			case 'table':
			case 'td':
			case 'tr':
			case 'tbody':
			case 'p':
			case 'ul':
			case 'ol':
			case 'li':
			case 'dl':
			case 'dt':
			case 'dd':
			case 'img': // hmm!
			case 'pre':
			case 'center':
			case 'blockquote':
			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
				return true;
			default:
				return false;
		}
	} else {
		return false;
	}
};

if (typeof module == "object") {
	module.exports.Util = Util;
}
