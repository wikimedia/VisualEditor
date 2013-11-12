/*!
 * ObjectOriented UserInterface namespace.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Namespace for all ObjectOriented UserInterface classes, static methods and static properties.
 *
 * @class
 * @singleton
 */
OO.ui = {};

OO.ui.bind = $.proxy;

/**
 * Get the user's language and any fallback languages. These language codes are used by
 * OO.ui.IconedElement to select localized icons in the user's language.
 *
 * In environments that provide a localization system, this function should be overridden to
 * return the user's language(s). The default implementation returns English (en) only.
 *
 * @returns {string[]} Language codes, in descending order of priority
 */
OO.ui.getUserLanguages = function () {
	return [ 'en' ];
};

( function () {

/**
 * Message store for the default implementation of OO.ui.msg
 *
 * Environments that provide a localization system should not use this, but should override
 * OO.ui.msg altogether.
 *
 * @private
 */
var messages = {
	// Label text for button to exit from dialog
	'ooui-dialog-action-close': 'Close',
	// TODO remove me
	'ooui-inspector-close-tooltip': 'Close',
	// TODO remove me
	'ooui-inspector-remove-tooltip': 'Remove',
	// Tool tip for a button that moves items in a list down one place
	'ooui-outline-control-move-down': 'Move item down',
	// Tool tip for a button that moves items in a list up one place
	'ooui-outline-control-move-up': 'Move item up',
	// Label for toggle on state
	'ooui-toggle-on': 'On',
	// Label for toggle off state
	'ooui-toggle-off': 'Off',
	// Label for the toolbar group that contains a list of all other available tools
	'ooui-toolbar-more': 'More'
};

/**
 * Get a localized message.
 *
 * In environments that provide a localization system, this function should be overridden to
 * return the message translated in the user's language. The default implementation always returns
 * English messages.
 *
 * After the message key, message parameters may optionally be passed. In the default implementation,
 * any occurrences of $1 are replaced with the first parameter, $2 with the second parameter, etc.
 * Alternative implementations of OO.ui.msg may use any substitution system they like, as long as
 * they support unnamed, ordered message parameters.
 *
 * @abstract
 * @param {string} key Message key
 * @param {Mixed...} [params] Message parameters
 * @returns {string} Translated message with parameters substituted
 */
OO.ui.msg = function ( key ) {
	var message = messages[key], params = Array.prototype.slice.call( arguments, 1 );
	if ( typeof message === 'string' ) {
		// Perform $1 substitution
		message = message.replace( /\$(\d+)/g, function ( unused, n ) {
			var i = parseInt( n, 10 );
			return params[i - 1] !== undefined ? params[i - 1] : '$' + n;
		} );
	} else {
		// Return placeholder if message not found
		message = '[' + key + ']';
	}
	return message;
};

} )();

// Add more as you need
OO.ui.Keys = {
	'UNDEFINED': 0,
	'BACKSPACE': 8,
	'DELETE': 46,
	'LEFT': 37,
	'RIGHT': 39,
	'UP': 38,
	'DOWN': 40,
	'ENTER': 13,
	'END': 35,
	'HOME': 36,
	'TAB': 9,
	'PAGEUP': 33,
	'PAGEDOWN': 34,
	'ESCAPE': 27,
	'SHIFT': 16,
	'SPACE': 32
};
