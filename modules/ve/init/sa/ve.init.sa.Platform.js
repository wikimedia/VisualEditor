/*!
 * VisualEditor stand-alone initialization Target class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Stand-alone platform.
 *
 * @class
 * @extends ve.init.Platform
 * @constructor
 */
ve.init.sa.Platform = function VeInitSaPlatform() {
	// Parent constructor
	ve.init.Platform.call( this );

	// Properties
	this.externalLinkUrlProtocolsRegExp = /^https?\:\/\//;
	this.modulesUrl = 'extensions/VisualEditor/modules';
	this.messages = {};
	this.parsedMessages = {};
};

/* Inheritance */

ve.inheritClass( ve.init.sa.Platform, ve.init.Platform );

/* Methods */

/**
 * Gets a regular expression that matches allowed external link URLs.
 *
 * @method
 * @returns {RegExp} Regular expression object
 */
ve.init.sa.Platform.prototype.getExternalLinkUrlProtocolsRegExp = function () {
	return this.externalLinkUrlProtocolsRegExp;
};

/**
 * Sets the remotely accessible URL to the modules directory.
 *
 * @method
 * @param {string} url Remote modules URL
 */
ve.init.sa.Platform.prototype.setModulesUrl = function ( url ) {
	this.modulesUrl = url;
};

/**
 * Gets a remotely accessible URL to the modules directory.
 *
 * @method
 * @returns {string} Remote modules URL
 */
ve.init.sa.Platform.prototype.getModulesUrl = function () {
	return this.modulesUrl;
};

/**
 * Adds multiple messages to the localization system.
 *
 * @method
 * @param {Object} messages Map of message-key/message-string pairs
 */
ve.init.sa.Platform.prototype.addMessages = function ( messages ) {
	for ( var key in messages ) {
		this.messages[key] = messages[key];
	}
};

/**
 * Gets a message from the localization system.
 *
 * @method
 * @param {string} key Message key
 * @param {Mixed...} [args] List of arguments which will be injected at $1, $2, etc. in the messaage
 * @returns {string} Localized message
 */
ve.init.sa.Platform.prototype.getMessage = function ( key ) {
	if ( key in this.messages ) {
		// Simple message parser, does $N replacement and nothing else.
		var parameters = Array.prototype.slice.call( arguments, 1 );
		return this.messages[key].replace( /\$(\d+)/g, function ( str, match ) {
			var index = parseInt( match, 10 ) - 1;
			return parameters[index] !== undefined ? parameters[index] : '$' + match;
		} );
	}
	return '<' + key + '>';
};

/**
 * Adds multiple parsed messages to the localization system.
 *
 * @method
 * @param {Object} messages Map of message-key/html pairs
 */
ve.init.sa.Platform.prototype.addParsedMessages = function ( messages ) {
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
 * @param {string} key Message key
 * @returns {string} Parsed localized message as HTML string.
 */
ve.init.sa.Platform.prototype.getParsedMessage = function ( key ) {
	if ( key in this.parsedMessages ) {
		// Prefer parsed results from VisualEditorMessagesModule.php if available.
		return this.parsedMessages[key];
	}
	// Fallback to regular messages, html escaping applied.
	return this.getMessage( key ).replace( /['"<>&]/g, function escapeCallback( s ) {
		switch ( s ) {
			case '\'':
				return '&#039;';
			case '"':
				return '&quot;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
		}
	} );
};

/* Initialization */

ve.init.platform = new ve.init.sa.Platform();
