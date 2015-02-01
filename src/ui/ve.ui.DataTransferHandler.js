/*!
 * VisualEditor UserInterface data transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Data transfer handler.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface
 * @param {File} file File to handle
 */
ve.ui.DataTransferHandler = function VeUiDataTransferHandler( surface, file ) {
	// Properties
	this.surface = surface;
	this.file = file;

	this.insertableDataDeferred = $.Deferred();

	this.reader = new FileReader();

	this.progress = false;
	this.progressBar = null;

	// Events
	this.reader.addEventListener( 'progress', this.onFileProgress.bind( this ) );
	this.reader.addEventListener( 'load', this.onFileLoad.bind( this ) );
	this.reader.addEventListener( 'loadend', this.onFileLoadEnd.bind( this ) );
};

/* Inheritance */

OO.initClass( ve.ui.DataTransferHandler );

/* Static properties */

/**
 * Symbolic name for this handler. Must be unique.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.DataTransferHandler.static.name = null;

/**
 * List of mime types supported by this handler
 *
 * @static
 * @property {string[]}
 * @inheritable
 */
ve.ui.DataTransferHandler.static.types = [];

/* Methods */

/**
 * Process the file
 *
 * Implementations should aim to resolve this.insertableDataDeferred.
 */
ve.ui.DataTransferHandler.prototype.process = function () {
	throw new Error( 've.ui.DataTransferHandler subclass must implement process' );
};

/**
 * Insert the file at a specified fragment
 *
 * @return {jQuery.Promise} Promise which resolves with data to insert
 */
ve.ui.DataTransferHandler.prototype.getInsertableData = function () {
	this.process();

	return this.insertableDataDeferred.promise();
};

/**
 * Handle progress events from the file reader
 *
 * @param {Event} e Progress event
 */
ve.ui.DataTransferHandler.prototype.onFileProgress = function () {};

/**
 * Handle load events from the file reader
 *
 * @param {Event} e Load event
 */
ve.ui.DataTransferHandler.prototype.onFileLoad = function () {};

/**
 * Handle load end events from the file reader
 *
 * @param {Event} e Load end event
 */
ve.ui.DataTransferHandler.prototype.onFileLoadEnd = function () {};

/**
 * Abort the data transfer handler
 */
ve.ui.DataTransferHandler.prototype.abort = function () {
	this.insertableDataDeferred.reject();
};

/**
 * Create a progress bar with a specified label
 *
 * @param {jQuery.Promise} progressCompletePromise Promise which resolves when the progress action is complete
 * @param {jQuery|string|Function} [label] Progress bar label, defaults to file name
 */
ve.ui.DataTransferHandler.prototype.createProgress = function ( progressCompletePromise, label ) {
	var handler = this;

	this.surface.createProgress( progressCompletePromise, label || this.file.name ).done( function ( progressBar, cancelPromise ) {
		// Set any progress that was achieved before this resolved
		progressBar.setProgress( handler.progress );
		handler.progressBar = progressBar;
		cancelPromise.fail( handler.abort.bind( handler ) );
	} );
};

/**
 * Set progress bar progress
 *
 * Progress is stored in a property in case the progress bar doesn't exist yet.
 *
 * @param {number} progress Progress percent
 */
ve.ui.DataTransferHandler.prototype.setProgress = function ( progress ) {
	this.progress = progress;
	if ( this.progressBar ) {
		this.progressBar.setProgress( this.progress );
	}
};
