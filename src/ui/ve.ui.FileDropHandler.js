/*!
 * VisualEditor UserInterface file drop handler class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * File drop handler.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface
 * @param {File} file File to handle
 */
ve.ui.FileDropHandler = function VeUiFileDropHandler( surface, file ) {
	// Properties
	this.surface = surface;
	this.file = file;

	this.insertableDataDeferred = $.Deferred();

	this.reader = new FileReader();

	// Events
	this.reader.addEventListener( 'progress', this.onFileProgress.bind( this ) );
	this.reader.addEventListener( 'load', this.onFileLoad.bind( this ) );
	this.reader.addEventListener( 'loadend', this.onFileLoadEnd.bind( this ) );
};

/* Inheritance */

OO.initClass( ve.ui.FileDropHandler );

/* Static properties */

/**
 * Symbolic name for this handler. Must be unique.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.FileDropHandler.static.name = null;

/**
 * List of mime types supported by this handler
 *
 * @static
 * @property {string[]}
 * @inheritable
 */
ve.ui.FileDropHandler.static.types = [];

/* Methods */

/**
 * Process the file
 *
 * Implementations should aim to resolve this.insertableDataDeferred.
 */
ve.ui.FileDropHandler.prototype.process = function () {
	throw new Error( 've.ui.FileDropHandler subclass must implement process' );
};

/**
 * Insert the file at a specified fragment
 *
 * @return {jQuery.Promise} Promise which resolves with data to insert
 */
ve.ui.FileDropHandler.prototype.getInsertableData = function () {
	this.process();

	return this.insertableDataDeferred.promise();
};

/**
 * Handle progress events from the file reader
 *
 * @param {Event} e Progress event
 */
ve.ui.FileDropHandler.prototype.onFileProgress = function () {};

/**
 * Handle load events from the file reader
 *
 * @param {Event} e Load event
 */
ve.ui.FileDropHandler.prototype.onFileLoad = function () {};

/**
 * Handle load end events from the file reader
 *
 * @param {Event} e Load end event
 */
ve.ui.FileDropHandler.prototype.onFileLoadEnd = function () {};
