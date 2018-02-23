/*!
 * VisualEditor Initialization Platform class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Generic Initialization platform.
 *
 * @abstract
 * @mixins OO.EventEmitter
 *
 * @constructor
 */
ve.init.Platform = function VeInitPlatform() {
	// Mixin constructors
	OO.EventEmitter.call( this );

	// Register
	ve.init.platform = this;

	// Provide messages to OOUI
	OO.ui.getUserLanguages = this.getUserLanguages.bind( this );
	OO.ui.msg = this.getMessage.bind( this );

	// Notify those waiting for a platform that they can finish initialization
	setTimeout( function () {
		ve.init.Platform.static.deferredPlatform.resolve( ve.init.platform );
	} );
};

/* Inheritance */

OO.mixinClass( ve.init.Platform, OO.EventEmitter );

/* Static Properties */

/**
 * A jQuery.Deferred that tracks when the platform has been created.
 * @private
 */
ve.init.Platform.static.deferredPlatform = $.Deferred();

/**
 * A promise that tracks when ve.init.platform is ready for use.  When
 * this promise is resolved the platform will have been created and
 * initialized.
 *
 * This promise is safe to access early in VE startup before
 * `ve.init.platform` has been set.
 *
 * @property {jQuery.Promise}
 */
ve.init.Platform.static.initializedPromise = ve.init.Platform.static.deferredPlatform.promise().then( function ( platform ) {
	return platform.getInitializedPromise();
} );

/* Static Methods */

/**
 * Get client platform string from browser.
 *
 * @static
 * @method
 * @inheritable
 * @return {string} Client platform string
 */
ve.init.Platform.static.getSystemPlatform = function () {
	return $.client.profile().platform;
};

/**
 * Check whether we are running in Internet Explorer.
 *
 * @static
 * @method
 * @inheritable
 * @return {boolean} We are in IE
 */
ve.init.Platform.static.isInternetExplorer = function () {
	return $.client.profile().name === 'msie';
};

/**
 * Check whether we are running in Edge.
 *
 * @static
 * @method
 * @inheritable
 * @return {boolean} We are in Edge
 */
ve.init.Platform.static.isEdge = function () {
	return $.client.profile().name === 'edge';
};

/**
 * Check whether we are running on iOS
 *
 * @static
 * @method
 * @inheritable
 * @return {boolean} We are running on iOS
 */
ve.init.Platform.static.isIos = function () {
	return /ipad|iphone|ipod/i.test( navigator.userAgent );
};

/* Methods */

/**
 * Get an anchored regular expression that matches allowed external link URLs
 * starting at the beginning of an input string.
 *
 * @method
 * @abstract
 * @return {RegExp} Regular expression object
 */
ve.init.Platform.prototype.getExternalLinkUrlProtocolsRegExp = null;

/**
 * Get an unanchored regular expression that matches allowed external link URLs
 * anywhere in an input string.
 *
 * @method
 * @abstract
 * @return {RegExp} Regular expression object
 */
ve.init.Platform.prototype.getUnanchoredExternalLinkUrlProtocolsRegExp = null;

/**
 * Get a regular expression that matches IDs used only for linking document
 * data to metadata. Use null if your document format does not have such IDs.
 *
 * @method
 * @return {RegExp|null} Regular expression object
 */
ve.init.Platform.prototype.getMetadataIdRegExp = function () {
	return null;
};

/**
 * Get a platform config value
 *
 * @method
 * @abstract
 * @param {string|string[]} key Config key, or list of keys
 * @return {Mixed|Object} Config value, or keyed object of config values if list of keys provided
 */
ve.init.Platform.prototype.getConfig = null;

/**
 * Get a user config value
 *
 * @method
 * @abstract
 * @param {string|string[]} key Config key, or list of keys
 * @return {Mixed|Object} Config value, or keyed object of config values if list of keys provided
 */
ve.init.Platform.prototype.getUserConfig = null;

/**
 * Set a user config value
 *
 * @method
 * @abstract
 * @param {string|Object} keyOrValueMap Key to set value for, or object mapping keys to values
 * @param {Mixed} [value] Value to set (optional, only in use when key is a string)
 */
ve.init.Platform.prototype.setUserConfig = null;

/**
 * Get a session storage value
 *
 * @method
 * @abstract
 * @param {string} key Key to get
 * @return {string|boolean} Value, false if storage not available
 */
ve.init.Platform.prototype.getSession = null;

/**
 * Set a session storage value
 *
 * @method
 * @abstract
 * @param {string} key Key to set value for
 * @param {string} value Value to set
 * @return {boolean} The value was set
 */
ve.init.Platform.prototype.setSession = null;

/**
 * Remove a session storage value
 *
 * @method
 * @abstract
 * @param {string} key Key to remove
 * @return {boolean} Key was removed
 */
ve.init.Platform.prototype.removeSession = null;

/**
 * Append a value to a list stored in session storage
 *
 * @method
 * @param {string} key Key of list to set value for
 * @param {string} value Value to set
 * @return {boolean} The value was set
 */
ve.init.Platform.prototype.appendToSessionList = function ( key, value ) {
	var length = this.getSessionListLength( key );

	if ( this.setSession( key + '__' + length, value ) ) {
		length++;
		return this.setSession( key + '__length', length.toString() );
	}
	return false;
};

/**
 * Get the length of a list in session storage
 *
 * @method
 * @param {string} key Key of list
 * @return {number} List length, 0 if the list doesn't exist
 */
ve.init.Platform.prototype.getSessionListLength = function ( key ) {
	return +this.getSession( key + '__length' ) || 0;
};

/**
 * Append a value to a list stored in session storage
 *
 * Internally this will use items with the keys:
 *  - key__length
 *  - key__0 ... key__N
 *
 * @method
 * @param {string} key Key of list
 * @return {string[]} List
 */
ve.init.Platform.prototype.getSessionList = function ( key ) {
	var i,
		list = [],
		length = this.getSessionListLength( key );

	for ( i = 0; i < length; i++ ) {
		list.push( this.getSession( key + '__' + i ) );
	}
	return list;
};

/**
 * Remove a list stored in session storage
 *
 * @method
 * @param {string} key Key of list
 */
ve.init.Platform.prototype.removeSessionList = function ( key ) {
	var i,
		length = this.getSessionListLength( key );

	for ( i = 0; i < length; i++ ) {
		this.removeSession( key + '__' + i );
	}
	this.removeSession( key + '__length' );
};

/**
 * Add multiple messages to the localization system.
 *
 * @method
 * @abstract
 * @param {Object} messages Containing plain message values
 */
ve.init.Platform.prototype.addMessages = null;

/**
 * Get a message from the localization system.
 *
 * @method
 * @abstract
 * @param {string} key Message key
 * @param {...Mixed} [args] List of arguments which will be injected at $1, $2, etc. in the message
 * @return {string} Localized message, or key or '<' + key + '>' if message not found
 */
ve.init.Platform.prototype.getMessage = null;

/**
 * Add multiple parsed messages to the localization system.
 *
 * @method
 * @abstract
 * @param {Object} messages Map of message-key/html pairs
 */
ve.init.Platform.prototype.addParsedMessages = null;

/**
 * Get a parsed message as HTML string.
 *
 * Does not support $# replacements.
 *
 * @method
 * @abstract
 * @param {string} key Message key
 * @return {string} Parsed localized message as HTML string
 */
ve.init.Platform.prototype.getParsedMessage = null;

/**
 * Get the user language and any fallback languages.
 *
 * @method
 * @abstract
 * @return {string[]} User language strings
 */
ve.init.Platform.prototype.getUserLanguages = null;

/**
 * Get a list of URL entry points where media can be found.
 *
 * @method
 * @abstract
 * @return {string[]} API URLs
 */
ve.init.Platform.prototype.getMediaSources = null;

/**
 * Get a list of all language codes.
 *
 * @method
 * @abstract
 * @return {string[]} Language codes
 */
ve.init.Platform.prototype.getLanguageCodes = null;

/**
 * Get a language's name from its code, in the current user language if possible.
 *
 * @method
 * @abstract
 * @param {string} code Language code
 * @return {string} Language name
 */
ve.init.Platform.prototype.getLanguageName = null;

/**
 * Get a language's autonym from its code.
 *
 * @method
 * @abstract
 * @param {string} code Language code
 * @return {string} Language autonym
 */
ve.init.Platform.prototype.getLanguageAutonym = null;

/**
 * Get a language's direction from its code.
 *
 * @method
 * @abstract
 * @param {string} code Language code
 * @return {string} Language direction
 */
ve.init.Platform.prototype.getLanguageDirection = null;

/**
 * Initialize the platform. The default implementation is to do nothing and return a resolved
 * promise. Subclasses should override this if they have asynchronous initialization work to do.
 * The promise rejects if the platform is incompatible.
 *
 * External callers should not call this. Instead, call #getInitializedPromise.
 *
 * @private
 * @return {jQuery.Promise} Promise that will be resolved once initialization is done
 */
ve.init.Platform.prototype.initialize = function () {
	if ( !VisualEditorSupportCheck() ) {
		return $.Deferred().reject().promise();
	}
	return $.Deferred().resolve().promise();
};

/**
 * Get a promise to track when the platform has initialized. The platform won't be ready for use
 * until this promise is resolved.
 *
 * Since the initialization only happens once, and the same (resolved) promise
 * is returned when called again, and since the Platform instance is global
 * (shared between different Target instances) it is important not to rely
 * on this promise being asynchronous.
 *
 * @return {jQuery.Promise} Promise that will be resolved once the platform is ready
 */
ve.init.Platform.prototype.getInitializedPromise = function () {
	if ( !this.initialized ) {
		this.initialized = this.initialize();
	}
	return this.initialized;
};

/**
 * Fetch the special character list object
 *
 * Returns a promise which resolves with the character list
 *
 * @return {jQuery.Promise}
 */
ve.init.Platform.prototype.fetchSpecialCharList = function () {
	var charsObj = {};

	try {
		charsObj = JSON.parse(
			ve.msg( 'visualeditor-specialcharinspector-characterlist-insert' )
		);
	} catch ( err ) {
		// There was no character list found, or the character list message is
		// invalid json string. Force a fallback to the minimal character list
		ve.log( 've.init.Platform: Could not parse the Special Character list.' );
		ve.log( err.message );
	}

	// This implementation always resolves instantly
	return $.Deferred().resolve( charsObj ).promise();
};
