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
	ve.dm.TransactionProcessor.commit( this.getDocument(), transaction );
	this.emit( 'transact', transaction );
};

/**
 * Applies an annotation to the current selection
 *
 * @method
 * @param {String} annotation action: toggle, clear, set
 * @param {Object} annotation object to apply.
 */
ve.dm.Surface.prototype.annotate = function( method, annotation ) {
	var selection = this.getSelection();

	if ( method === 'toggle' ) {
		var annotations = this.getDocument().getAnnotationsFromRange( selection );
		if ( annotation in annotations ) {
			method = 'clear';
		} else {
			method = 'set';
		}
	}
	if ( this.selection.getLength() ) {
		var tx = ve.dm.Transaction.newFromAnnotation(
			this.getDocument(), selection, method, annotation
		);
		this.transact( tx );
	}
};

/* Inheritance */

ve.extendClass( ve.dm.Surface, ve.EventEmitter );
