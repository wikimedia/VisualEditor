/*global mw */

/**
 * VisualEditor MediaWiki initialization Target class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki platform.
 *
 * @class
 * @constructor
 * @extends {ve.init.Platform}
 */
ve.init.mw.Platform = function VeInitMwPlatform() {
	// Parent constructor
	ve.init.Platform.call( this );

	// Properties
	this.externalLinkUrlProtocolsRegExp = new RegExp( '^' + mw.config.get( 'wgUrlProtocols' ) );
	this.modulesUrl = mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules';
	this.parsedMessages = {};
};

/* Inheritance */

ve.inheritClass( ve.init.mw.Platform, ve.init.Platform );

/* Methods */

/**
 * Gets a regular expression that matches allowed external link URLs.
 *
 * Uses the mw.config wgUrlProtocols variable.
 *
 * @method
 * @returns {RegExp} Regular expression object
 */
ve.init.mw.Platform.prototype.getExternalLinkUrlProtocolsRegExp = function () {
	return this.externalLinkUrlProtocolsRegExp;
};

/**
 * Gets a remotely accessible URL to the modules directory.
 *
 * Uses MediaWiki's {wgExtensionAssetsPath} variable.
 *
 * @method
 * @returns {String} Remote modules URL
 */
ve.init.mw.Platform.prototype.getModulesUrl = function () {
	return this.modulesUrl;
};

/**
 * Whether to use change markers.
 *
 * Uses the vechangemarkers query string variable.
 *
 * @method
 * @return {Boolean}
 */
ve.init.mw.Platform.prototype.useChangeMarkers = function () {
	var currentUri = new mw.Uri( window.location.toString() );
	if ( currentUri && 'vechangemarkers' in currentUri.query ) {
		return true;
	}
	return false;
};

/**
 * Adds multiple messages to the localization system.
 *
 * Wrapper for mw.msg system.
 *
 * @method
 * @param {Object} messages Map of message-key/message-string pairs
 */
ve.init.mw.Platform.prototype.addMessages = function ( messages ) {
	return mw.messages.set( messages );
};

/**
 * Gets a message from the localization system.
 *
 * Wrapper for mw.msg system.
 *
 * @method
 * @param {String} key Message key
 * @param {Mixed} [...] List of arguments which will be injected at $1, $2, etc. in the messaage
 * @returns {String} Localized message (plain, unescaped)
 */
ve.init.mw.Platform.prototype.getMessage = ve.bind( mw.msg, mw );

/**
 * Adds multiple parsed messages to the localization system.
 *
 * @method
 * @param {Object} messages Map of message-key/html pairs
 */
ve.init.mw.Platform.prototype.addParsedMessages = function ( messages ) {
	for ( var key in messages ) {
		this.parsedMessages[key] = messages[key];
	}
};

/**
 * Gets a parsed message as HTML string.
 *
 * Falls back to mw.messsage with .escaped().
 * Does not support $# replacements.
 *
 * @method
 * @param {String} key Message key
 * @returns {String} Parsed localized message as HTML string.
 */
ve.init.mw.Platform.prototype.getParsedMessage = function ( key ) {
	if ( key in this.parsedMessages ) {
		// Prefer parsed results from VisualEditorMessagesModule.php if available.
		return this.parsedMessages[key];
	}
	// Fallback to regular messages, with mw.message html escaping applied.
	return mw.message( key ).escaped();
};

/* Initialization */

ve.init.platform = new ve.init.mw.Platform();
