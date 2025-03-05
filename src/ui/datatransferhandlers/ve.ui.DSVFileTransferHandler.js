/*!
 * VisualEditor UserInterface delimiter-separated values file transfer handler class.
 *
 * @copyright See AUTHORS.txt
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

ve.ui.DSVFileTransferHandler.static.extensions = [ 'csv', 'tsv' ];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DSVFileTransferHandler.prototype.onFileLoad = function () {
	const data = [];
	const input = Papa.parse( this.reader.result );

	if ( input.meta.aborted || ( input.data.length <= 0 ) ) {
		this.abort();
	} else {
		// Lookup the type for table elements
		const tableNodeName = ve.dm.modelRegistry.matchElement( document.createElement( 'table' ) );
		const tableNodeClass = ve.dm.modelRegistry.lookup( tableNodeName );
		const tableElement = { type: tableNodeName };
		// Sanitize, as this can add default attributes for the table type
		tableNodeClass.static.sanitize( tableElement );

		data.push(
			tableElement,
			{ type: 'tableSection', attributes: { style: 'body' } }
		);

		input.data.forEach( ( line, i ) => {
			// Skip 'empty' row if at the end of the file
			if ( i === input.data.length - 1 && line.length === 1 && line[ 0 ] === '' ) {
				return;
			}

			data.push( { type: 'tableRow' } );
			line.forEach( ( cell ) => {
				data.push(
					{ type: 'tableCell', attributes: { style: ( i === 0 ? 'header' : 'data' ) } },
					{ type: 'paragraph', internal: { generated: 'wrapper' } }
				);
				ve.batchPush( data, cell.split( '' ) );
				data.push(
					{ type: '/paragraph' },
					{ type: '/tableCell' }
				);
			} );
			data.push( { type: '/tableRow' } );
		} );

		data.push(
			{ type: '/tableSection' },
			{ type: '/' + tableElement.type }
		);

		this.resolve( data );
	}

	// Parent method
	ve.ui.DSVFileTransferHandler.super.prototype.onFileLoad.apply( this, arguments );
};

/* Registration */

ve.ui.dataTransferHandlerFactory.register( ve.ui.DSVFileTransferHandler );
