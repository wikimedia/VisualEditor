/*!
 * VisualEditor UserInterface plain text file transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Plain text file transfer handler.
 *
 * @class
 * @extends ve.ui.FileTransferHandler
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {ve.ui.DataTransferItem} item
 */
ve.ui.PlainTextFileTransferHandler = function VeUiPlainTextFileTransferHandler() {
	// Parent constructor
	ve.ui.PlainTextFileTransferHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.PlainTextFileTransferHandler, ve.ui.FileTransferHandler );

/* Static properties */

ve.ui.PlainTextFileTransferHandler.static.name = 'plainTextFile';

ve.ui.PlainTextFileTransferHandler.static.types = ['text/plain'];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.PlainTextFileTransferHandler.prototype.process = function () {
	this.createProgress( this.insertableDataDeferred.promise() );
	this.reader.readAsText( this.file );
};

/**
 * @inheritdoc
 */
ve.ui.PlainTextFileTransferHandler.prototype.onFileProgress = function ( e ) {
	if ( e.lengthComputable ) {
		this.setProgress( 100 * e.loaded / e.total );
	} else {
		this.setProgress( false );
	}
};

/**
 * @inheritdoc
 */
ve.ui.PlainTextFileTransferHandler.prototype.onFileLoad = function () {
	this.insertableDataDeferred.resolve( this.reader.result );
	this.setProgress( 100 );
};

/**
 * @inheritdoc
 */
ve.ui.PlainTextFileTransferHandler.prototype.onFileLoadEnd = function () {
	// 'loadend' fires after 'load'/'abort'/'error'.
	// Reject the deferred if it hasn't already resolved.
	this.insertableDataDeferred.reject();
};

/**
 * @inheritdoc
 */
ve.ui.PlainTextFileTransferHandler.prototype.abort = function () {
	// Parent method
	ve.ui.PlainTextFileTransferHandler.super.prototype.abort.call( this );

	this.reader.abort();
};

/* Registration */

ve.ui.dataTransferHandlerFactory.register( ve.ui.PlainTextFileTransferHandler );
