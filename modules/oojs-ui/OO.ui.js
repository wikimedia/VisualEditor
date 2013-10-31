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

OO.ui.getUserLanguages = function () {
	return [ 'en' ];
};

/**
 * Get a localized message.
 *
 * @abstract
 * @param {string} key Message key
 * @param {Mixed...} [params] Message parameters
 */
OO.ui.msg = function ( key ) {
	return '[' + key + ']';
};

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
