/*!
 * VisualEditor UserInterface plain text file data transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Plain text data transfer filetransfer handler.
 *
 * @class
 * @extends ve.ui.DataTransferHandler
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {File} file
 */
ve.ui.PlainTextFileTransferHandler = function VeUiPlainTextFileTransferHandler() {
	// Parent constructor
	ve.ui.PlainTextFileTransferHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.PlainTextFileTransferHandler, ve.ui.DataTransferHandler );

/* Static properties */

ve.ui.PlainTextFileTransferHandler.static.name = 'plainText';

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
	var i, l,
		data = [],
		lines = this.reader.result.split( /[\r\n]+/ );

	for ( i = 0, l = lines.length; i < l; i++ ) {
		if ( lines[i].length ) {
			data.push( { type: 'paragraph' } );
			data = data.concat( lines[i].split( '' ) );
			data.push( { type: '/paragraph' } );
		}
	}
	this.insertableDataDeferred.resolve( data );
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
