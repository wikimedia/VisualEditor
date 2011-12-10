/**
 * Creates an es.SurfaceModel object.
 * 
 * @class
 * @constructor
 * @extends {es.EventEmitter}
 * @param {es.DocumentModel} doc Document model to create surface for
 */
es.SurfaceModel = function( doc ) {
	// Inheritance
	es.EventEmitter.call( this );

	// Properties
	this.doc = doc;
	this.selection = null;

	this.smallStack = [];
	this.bigStack = [];
	this.undoIndex = 0;

	var _this = this;
	setInterval( function () {
		_this.breakpoint();
	}, 750 );
};

/* Methods */

es.SurfaceModel.prototype.purgeHistory = function() {
	this.selection = null;
};

/**
 * Gets the document model of the surface.
 * 
 * @method
 * @returns {es.DocumentModel} Document model of the surface
 */
es.SurfaceModel.prototype.getDocument = function() {
	return this.doc;
};

/**
 * Gets the selection 
 * 
 * @method
 * @returns {es.Range} Current selection
 */
es.SurfaceModel.prototype.getSelection = function() {
	return this.selection;
};

/**
 * Changes the selection.
 * 
 * If changing the selection at a high frequency (such as while dragging) use the combine argument
 * to avoid them being split up into multiple history items
 * 
 * @method
 * @param {es.Range} selection
 * @param {Boolean} isManual Whether this selection was the result of a user action, and thus should be recorded in history...?
 */
es.SurfaceModel.prototype.select = function( selection, isManual ) {
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
 * part of a single history item, use the isPartial argument for all but the last one to avoid them being
 * split up into multple history items.
 * 
 * @method
 * @param {es.TransactionModel} transactions Tranasction to apply to the document
 * @param {boolean} isPartial whether this transaction is part of a larger logical grouping of transactions 
 *					(such as when replacing - delete, then insert)
 */
es.SurfaceModel.prototype.transact = function( transaction ) {
	this.bigStack = this.bigStack.slice( 0, this.bigStack.length - this.undoIndex + 1 );
	this.undoIndex = 0;
	this.smallStack.push( transaction );
	this.doc.commit( transaction );
	this.emit( 'transact', transaction );
};

es.SurfaceModel.prototype.breakpoint = function( selection ) {
	if( this.smallStack.length > 0 ) {
		this.bigStack.push( {
			stack: this.smallStack,
			selection: selection || this.selection.clone()
		} );
		this.smallStack = [];
	}};

es.SurfaceModel.prototype.undo = function() {
	this.breakpoint();
	this.undoIndex++
	if ( this.bigStack[this.bigStack.length - this.undoIndex] ) {
		var diff = 0;
		var item = this.bigStack[this.bigStack.length - this.undoIndex];
		for( var i = item.stack.length - 1; i >= 0; i-- ) {
			this.doc.rollback( item.stack[i] );
			diff += item.stack[i].lengthDifference;
		}
		var selection = item.selection;
		selection.from -= diff;
		selection.to -= diff;
		this.select( selection );
	}
};

es.SurfaceModel.prototype.redo = function() {
	this.breakpoint();
	if ( this.undoIndex > 0 ) {
		if ( this.bigStack[this.bigStack.length - this.undoIndex] ) {
			var diff = 0;
			var item = this.bigStack[this.bigStack.length - this.undoIndex];
			for( var i = 0; i < item.stack.length; i++ ) {
				this.doc.commit( item.stack[i] );
				diff += item.stack[i].lengthDifference;
			}
			var selection = item.selection;
			selection.from += diff;
			selection.to += diff;
			this.selection = null;
			this.select( selection );
		}
		this.undoIndex--;
	}
};

/* Inheritance */

es.extendClass( es.SurfaceModel, es.EventEmitter );
