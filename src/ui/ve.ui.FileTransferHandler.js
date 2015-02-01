/*!
 * VisualEditor UserInterface data transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Data transfer handler.
 *
 * @class
 * @extends ve.ui.DataTransferHandler
 * @abstract
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {ve.ui.DataTransferItem} item
 */
ve.ui.FileTransferHandler = function VeUiFileTransferHandler() {
	// Parent constructor
	ve.ui.FileTransferHandler.super.apply( this, arguments );

	// Properties
	this.file = this.item.getAsFile();

	this.reader = new FileReader();

	this.progress = false;
	this.progressBar = null;

	// Events
	this.reader.addEventListener( 'progress', this.onFileProgress.bind( this ) );
	this.reader.addEventListener( 'load', this.onFileLoad.bind( this ) );
	this.reader.addEventListener( 'loadend', this.onFileLoadEnd.bind( this ) );
};

/* Inheritance */

OO.inheritClass( ve.ui.FileTransferHandler, ve.ui.DataTransferHandler );

/* Static properties */

ve.ui.FileTransferHandler.static.kinds = [ 'file' ];

/* Methods */

/**
 * Handle progress events from the file reader
 *
 * @param {Event} e Progress event
 */
ve.ui.FileTransferHandler.prototype.onFileProgress = function () {};

/**
 * Handle load events from the file reader
 *
 * @param {Event} e Load event
 */
ve.ui.FileTransferHandler.prototype.onFileLoad = function () {};

/**
 * Handle load end events from the file reader
 *
 * @param {Event} e Load end event
 */
ve.ui.FileTransferHandler.prototype.onFileLoadEnd = function () {};

/**
 * Create a progress bar with a specified label
 *
 * @param {jQuery.Promise} progressCompletePromise Promise which resolves when the progress action is complete
 * @param {jQuery|string|Function} [label] Progress bar label, defaults to file name
 */
ve.ui.FileTransferHandler.prototype.createProgress = function ( progressCompletePromise, label ) {
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
ve.ui.FileTransferHandler.prototype.setProgress = function ( progress ) {
	this.progress = progress;
	if ( this.progressBar ) {
		this.progressBar.setProgress( this.progress );
	}
};
