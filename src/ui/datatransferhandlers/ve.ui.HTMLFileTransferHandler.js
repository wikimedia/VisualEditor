/*!
 * VisualEditor UserInterface HTML file transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * HTML file transfer handler.
 *
 * @class
 * @extends ve.ui.FileTransferHandler
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {ve.ui.DataTransferItem} item
 */
ve.ui.HTMLFileTransferHandler = function VeUiHTMLFileTransferHandler() {
	// Parent constructor
	ve.ui.HTMLFileTransferHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.HTMLFileTransferHandler, ve.ui.FileTransferHandler );

/* Static properties */

ve.ui.HTMLFileTransferHandler.static.name = 'htmlFile';

ve.ui.HTMLFileTransferHandler.static.types = [ 'text/html', 'application/xhtml+xml' ];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.HTMLFileTransferHandler.prototype.process = function () {
	this.createProgress( this.insertableDataDeferred.promise() );
	this.reader.readAsText( this.file );
};

/**
 * @inheritdoc
 */
ve.ui.HTMLFileTransferHandler.prototype.onFileProgress = function ( e ) {
	if ( e.lengthComputable ) {
		this.setProgress( 100 * e.loaded / e.total );
	} else {
		this.setProgress( false );
	}
};

/**
 * @inheritdoc
 */
ve.ui.HTMLFileTransferHandler.prototype.onFileLoad = function () {
	this.insertableDataDeferred.resolve(
		this.surface.getModel().getDocument().newFromHtml( this.reader.result, this.surface.getImportRules() )
	);
	this.setProgress( 100 );
};

/**
 * @inheritdoc
 */
ve.ui.HTMLFileTransferHandler.prototype.onFileLoadEnd = function () {
	// 'loadend' fires after 'load'/'abort'/'error'.
	// Reject the deferred if it hasn't already resolved.
	this.insertableDataDeferred.reject();
};

/**
 * @inheritdoc
 */
ve.ui.HTMLFileTransferHandler.prototype.abort = function () {
	// Parent method
	ve.ui.HTMLFileTransferHandler.super.prototype.abort.call( this );

	this.reader.abort();
};

/* Registration */

ve.ui.dataTransferHandlerFactory.register( ve.ui.HTMLFileTransferHandler );
