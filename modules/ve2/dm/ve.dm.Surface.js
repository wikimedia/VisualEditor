/**
 * DataModel surface.
 *
 * @class
 * @constructor
 * @extends {ve.EventEmitter}
 * @param {ve.dm.Document} doc Document model to create surface for
 */
ve.dm.Surface = function( doc ) {
	// Inheritance
	ve.EventEmitter.call( this );
	// Properties
	this.documentModel = doc;
	this.selection = null;
};

/**
 * Gets the document model of the surface.
 *
 * @method
 * @returns {ve.dm.DocumentNode} Document model of the surface
 */
ve.dm.Surface.prototype.getDocument = function() {
	return this.documentModel;
};

/**
 * Gets the selection
 *
 * @method
 * @returns {ve.Range} Current selection
 */
ve.dm.Surface.prototype.getSelection = function() {
	return this.selection;
};

/**
 * Sets the selection
 *
 * @method
 * @param {ve.Range} selection
 */
ve.dm.Surface.prototype.setSelection = function( selection ) {
	selection.normalize();

	if (
		( !this.selection ) ||
		( !this.selection.equals ( selection ) )
		)
	{
		this.selection = selection;
		this.emit ('select', this.selection.clone() );
	}
};

/**
 * Applies a series of transactions to the content data.
 *
 * @method
 * @param {ve.dm.Transaction} transactions Tranasction to apply to the document
 */
ve.dm.Surface.prototype.transact = function( transaction ) {
	this.documentModel.commit( transaction );
	this.emit( 'transact', transaction );
};

/* Inheritance */

ve.extendClass( ve.dm.Surface, ve.EventEmitter );
