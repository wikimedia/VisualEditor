/**
 * VisualEditor initialization Target class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic platform.
 *
 * @class
 * @abstract
 * @constructor
 * @param {String} pageName Name of target page
 */
ve.init.Platform = function () {
	// Inheritance
	ve.EventEmitter.call( this );
};

/* Methods */

/**
 * Gets a regular expression that matches allowed external link URLs.
 *
 * @method
 * @abstract
 * @returns {RegExp} Regular expression object
 */
ve.init.Platform.prototype.getExternalLinkUrlProtocolsRegExp = function () {
	throw new Error( 've.init.Platform.getExternalLinkUrlProtocolsRegExp must be overridden in subclass' );
};

/**
 * Gets a remotely accessible URL to the modules directory.
 *
 * @method
 * @abstract
 * @returns {String} Remote modules URL
 */
ve.init.Platform.prototype.getModulesUrl = function () {
	throw new Error( 've.init.Platform.getModulesUrl must be overridden in subclass' );
};

/**
 * Adds multiple messages to the localization system.
 *
 * @method
 * @abstract
 * @param {Object} messages Map of message-key/message-string pairs
 */
ve.init.Platform.prototype.addMessages = function ( messages ) {
	throw new Error( 've.init.Platform.addMessages must be overridden in subclass' );
};

/**
 * Gets a message from the localization system.
 *
 * @method
 * @abstract
 * @param {String} key Message key
 * @param {Mixed} [...] List of arguments which will be injected at $1, $2, etc. in the messaage
 * @returns {String} Localized message
 */
ve.init.Platform.prototype.getMessage = function ( key ) {
	throw new Error( 've.init.Platform.getMessage must be overridden in subclass' );
};

/* Inheritance */

ve.extendClass( ve.init.Platform, ve.EventEmitter );
