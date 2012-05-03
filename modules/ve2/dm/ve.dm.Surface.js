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
	return this.doc;
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
 */
ve.dm.Surface.prototype.setSelection = function( selection ) {
	this.selection = selection;
};

/**
 * Changes the selection.
 *
 * If changing the selection at a high frequency (such as while dragging) use the combine argument
 * to avoid them being split up into multiple history items
 *
 * @method
 * @param {ve.Range} selection
 * @param {Boolean} isManual Whether this selection was the result of a user action, and thus should
 * be recorded in history...?
 */
ve.dm.Surface.prototype.select = function( selection, isManual ) {
	selection.normalize();
	/*if (
		( ! this.selection ) || ( ! this.selection.equals( selection ) )
	) {*/
		if ( isManual ) {
			this.breakpoint();
		}
		// check if the last thing is a selection, if so, swap it.
		this.selection = selection;
		this.emit( 'select', this.selection.clone() );
	//}
};

/**
 * Applies a series of transactions to the content data.
 *
 * If committing multiple transactions which are the result of a single user action and need to be
 * part of a single history item, use the isPartial argument for all but the last one to avoid them
 * being split up into multple history items.
 *
 * @method
 * @param {ve.dm.Transaction} transactions Tranasction to apply to the document
 * @param {boolean} isPartial whether this transaction is part of a larger logical grouping of
 * transactions (such as when replacing - delete, then insert)
 */
ve.dm.Surface.prototype.transact = function( transaction ) {
	//this.bigStack = this.bigStack.slice( 0, this.bigStack.length - this.undoIndex );
	//this.undoIndex = 0;
	//this.smallStack.push( transaction );
	this.doc.commit( transaction );
	this.emit( 'transact', transaction );
};

/* Inheritance */

ve.extendClass( ve.dm.Surface, ve.EventEmitter );
