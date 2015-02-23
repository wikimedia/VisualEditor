/**
 * Data transfer item wrapper
 *
 * @class
 * @constructor
 * @param {string} kind Item kind, e.g. 'string' or 'file'
 * @param {string} type MIME type
 * @param {Object} [data] Data object to wrap or convert
 * @param {string} [data.dataUri] Data URI to convert to a blob
 * @param {Blob} [data.blob] File blob
 * @param {string} [data.stringData] String data
 * @param {DataTransferItem} [data.item] Native data transfer item
 */
ve.ui.DataTransferItem = function VeUiDataTransferItem( kind, type, data ) {
	this.kind = kind;
	this.type = type;
	this.data = data;
	this.blob = this.data.blob || null;
	this.stringData = this.data.stringData || ve.getProp( this.blob, 'name' ) || null;
};

/* Inheritance */

OO.initClass( ve.ui.DataTransferItem );

/* Static methods */

/**
 * Create a data transfer item from a file blob.
 *
 * @param {Blob} blob File blob
 * @return {ve.ui.DataTransferItem} New data transfer item
 */
ve.ui.DataTransferItem.static.newFromBlob = function ( blob ) {
	return new ve.ui.DataTransferItem( 'file', blob.type, { blob: blob } );
};

/**
 * Create a data transfer item from a data URI.
 *
 * @param {string} dataUri Data URI
 * @return {ve.ui.DataTransferItem} New data transfer item
 */
ve.ui.DataTransferItem.static.newFromDataUri = function ( dataUri ) {
	var parts = dataUri.split( ',' );
	return new ve.ui.DataTransferItem( 'file', parts[0].match( /^data:([^;]+)/ )[1], { dataUri: parts[1] } );
};

/**
 * Create a data transfer item from string data.
 *
 * @param {string} stringData String data
 * @param {string} type MIME type
 * @return {ve.ui.DataTransferItem} New data transfer item
 */
ve.ui.DataTransferItem.static.newFromString = function ( stringData, type ) {
	return new ve.ui.DataTransferItem( 'string', type || 'text/plain', { stringData: stringData } );
};

/**
 * Create a data transfer item from a native data transfer item.
 *
 * @param {DataTransferItem} item Native data transfer item
 * @return {ve.ui.DataTransferItem} New data transfer item
 */
ve.ui.DataTransferItem.static.newFromItem = function ( item ) {
	return new ve.ui.DataTransferItem( item.kind, item.type, { item: item } );
};

/**
 * Get file blob
 *
 * Generically getAsFile returns a Blob, which could be a File.
 *
 * @return {Blob} File blob
 */
ve.ui.DataTransferItem.prototype.getAsFile = function () {
	if ( this.data.item ) {
		return this.data.item.getAsFile();
	}

	var binary, array, i;

	if ( !this.blob && this.data.dataUri ) {
		binary = atob( this.data.dataUri );
		delete this.data.dataUri;
		array = [];
		for ( i = 0; i < binary.length; i++ ) {
			array.push( binary.charCodeAt( i ) );
		}
		this.blob = new Blob(
			[ new Uint8Array( array ) ],
			{ type: this.type }
		);
	}
	return this.blob;
};

/**
 * Get string data
 *
 * Differs from native DataTransferItem#getAsString by being synchronous
 *
 * @return {string} String data
 */
ve.ui.DataTransferItem.prototype.getAsString = function () {
	return this.stringData;
};
