/*!
 * VisualEditor UserInterface delimiter-separated values file transfer handler class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Delimiter-separated values file transfer handler.
 *
 * @class
 * @extends ve.ui.FileTransferHandler
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {ve.ui.DataTransferItem} item
 */
ve.ui.DSVFileTransferHandler = function VeUiDSVFileTransferHandler() {
	// Parent constructor
	ve.ui.DSVFileTransferHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.DSVFileTransferHandler, ve.ui.FileTransferHandler );

/* Static properties */

ve.ui.DSVFileTransferHandler.static.name = 'dsv';

ve.ui.DSVFileTransferHandler.static.types = [ 'text/csv', 'text/tab-separated-values' ];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DSVFileTransferHandler.prototype.process = function () {
	this.createProgress( this.insertableDataDeferred.promise() );
	this.reader.readAsText( this.file );
};

/**
 * @inheritdoc
 */
ve.ui.DSVFileTransferHandler.prototype.onFileProgress = function ( e ) {
	if ( e.lengthComputable ) {
		this.setProgress( 100 * e.loaded / e.total );
	} else {
		this.setProgress( false );
	}
};

/**
 * @inheritdoc
 */
ve.ui.DSVFileTransferHandler.prototype.onFileLoad = function () {
	var i, j, line,
		data = [],
		input = Papa.parse( this.reader.result );

	if ( input.meta.aborted || ( input.data.length <= 0 ) ) {
		this.insertableDataDeffered.reject();
		return;
	}

	data.push( { type: 'table' } );
	data.push( { type: 'tableSection', attributes: { style: 'body' } } );

	for ( i = 0; i < input.data.length; i++ ) {
		data.push( { type: 'tableRow' } );
		line = input.data[i];
		for ( j = 0; j < line.length; j++ ) {
			data.push( { type: 'tableCell', attributes: { style: ( i === 0 ? 'header' : 'data' ) } } );
			data.push( { type: 'paragraph', internal: { generated: 'wrapper' } } );
			data = data.concat( line[j].split( '' ) );
			data.push( { type: '/paragraph' } );
			data.push( { type: '/tableCell' } );
		}
		data.push( { type: '/tableRow' } );
	}

	data.push( { type: '/tableSection' } );
	data.push( { type: '/table' } );

	this.insertableDataDeferred.resolve( data );
	this.setProgress( 100 );
};

/**
 * @inheritdoc
 */
ve.ui.DSVFileTransferHandler.prototype.onFileLoadEnd = function () {
	// 'loadend' fires after 'load'/'abort'/'error'.
	// Reject the deferred if it hasn't already resolved.
	this.insertableDataDeferred.reject();
};

/**
 * @inheritdoc
 */
ve.ui.DSVFileTransferHandler.prototype.abort = function () {
	// Parent method
	ve.ui.DSVFileTransferHandler.super.prototype.abort.call( this );

	this.reader.abort();
};

/* Registration */

ve.ui.dataTransferHandlerFactory.register( ve.ui.DSVFileTransferHandler );
