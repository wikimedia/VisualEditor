/*!
 * VisualEditor MediaWiki Initialization Platform class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Initialization MediaWiki platform.
 *
 * @class
 * @extends ve.init.Platform
 *
 * @constructor
 */
ve.init.mw.Platform = function VeInitMwPlatform() {
	// Parent constructor
	ve.init.Platform.call( this );

	// Properties
	this.externalLinkUrlProtocolsRegExp = new RegExp( '^' + mw.config.get( 'wgUrlProtocols' ) );
	this.modulesUrl = mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules';
	this.parsedMessages = {};
	this.mediaSources = [
		{ 'url': mw.util.wikiScript( 'api' ) },
		{ 'url': '//commons.wikimedia.org/w/api.php' }
	];
};

/* Inheritance */

ve.inheritClass( ve.init.mw.Platform, ve.init.Platform );

/* Methods */

/**
 * Uses the mw.config wgUrlProtocols variable.
 * @inheritdoc
 */
ve.init.mw.Platform.prototype.getExternalLinkUrlProtocolsRegExp = function () {
	return this.externalLinkUrlProtocolsRegExp;
};

/**
 * Uses MediaWiki's {wgExtensionAssetsPath} variable.
 * @inheritdoc
 */
ve.init.mw.Platform.prototype.getModulesUrl = function () {
	return this.modulesUrl;
};

/**
 * Wrapper for mw.msg system.
 * @inheritdoc
 */
ve.init.mw.Platform.prototype.addMessages = function ( messages ) {
	return mw.messages.set( messages );
};

/**
 * Wrapper for mw.msg system.
 */
ve.init.mw.Platform.prototype.getMessage = ve.bind( mw.msg, mw );

/** */
ve.init.mw.Platform.prototype.addParsedMessages = function ( messages ) {
	for ( var key in messages ) {
		this.parsedMessages[key] = messages[key];
	}
};

/**
 * Falls back to mw.messsage with .escaped().
 * @inheritdoc
 */
ve.init.mw.Platform.prototype.getParsedMessage = function ( key ) {
	if ( key in this.parsedMessages ) {
		// Prefer parsed results from VisualEditorMessagesModule.php if available.
		return this.parsedMessages[key];
	}
	// Fallback to regular messages, with mw.message html escaping applied.
	return mw.message( key ).escaped();
};

/** */
ve.init.mw.Platform.prototype.getSystemPlatform = function () {
	return $.client.profile().platform;
};

/** */
ve.init.mw.Platform.prototype.getUserLanguages = function () {
	var lang = mw.config.get( 'wgUserLanguage' ),
		langParts = lang.split( '-' ),
		langs = [ lang ];

	if ( langParts.length > 0 ) {
		langs.push( langParts[0] );
	}

	return langs;
};

/**
 * Get a list of URLs to MediaWiki API entry points where media can be found.
 *
 * @method
 * @returns {string[]} API URLs
 */
ve.init.mw.Platform.prototype.getMediaSources = function () {
	return this.mediaSources;
};

/* Initialization */

ve.init.platform = new ve.init.mw.Platform();
