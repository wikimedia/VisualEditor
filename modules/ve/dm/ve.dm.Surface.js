/**
 * VisualEditor data model Surface class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel surface.
 *
 * @class
 * @constructor
 * @extends {ve.EventEmitter}
 * @param {ve.dm.Document} doc Document model to create surface for
 */
ve.dm.Surface = function VeDmSurface( doc ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.documentModel = doc;
	this.selection = new ve.Range( 0, 0 );
	this.smallStack = [];
	this.bigStack = [];
	this.undoIndex = 0;
	this.historyTrackingInterval = null;
};

/* Inheritance */

ve.inheritClass( ve.dm.Surface, ve.EventEmitter );

/* Methods */

ve.dm.Surface.prototype.startHistoryTracking = function () {
	this.historyTrackingInterval = setInterval( ve.bind( this.breakpoint, this ), 750 );
};

ve.dm.Surface.prototype.stopHistoryTracking = function () {
	clearInterval( this.historyTrackingInterval );
};

ve.dm.Surface.prototype.purgeHistory = function () {
	this.selection = null;
	this.smallStack = [];
	this.bigStack = [];
	this.undoIndex = 0;
};

ve.dm.Surface.prototype.getHistory = function () {
	if ( this.smallStack.length > 0 ) {
		return this.bigStack.slice( 0 ).concat( [{ 'stack': this.smallStack.slice(0) }] );
	} else {
		return this.bigStack.slice( 0 );
	}
};

/**
 * Gets the document model of the surface.
 *
 * @method
 * @returns {ve.dm.DocumentNode} Document model of the surface
 */
ve.dm.Surface.prototype.getDocument = function () {
	return this.documentModel;
};

/**
 * Gets the selection
 *
 * @method
 * @returns {ve.Range} Current selection
 */
ve.dm.Surface.prototype.getSelection = function () {
	return this.selection;
};

/**
 * Gets a fragment from this document and selection.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} Surface fragment
 * @param {Boolean} [autoSelect] Update the surface's selection when making changes
 */
ve.dm.Surface.prototype.getFragment = function ( autoSelect ) {
	return new ve.dm.SurfaceFragment( this, this.selection, autoSelect );
};

/**
 * Applies a series of transactions to the content data and sets the selection.
 *
 * @method
 * @param {ve.dm.Transaction|ve.dm.Transaction[]|null} transactions One or more transactions to
 *     process, or null to process none
 * @param {ve.Range|undefined} selection
 */
ve.dm.Surface.prototype.change = function ( transactions, selection ) {
	if ( transactions ) {
		if ( transactions instanceof ve.dm.Transaction ) {
			transactions = [transactions];
		}

		for ( var i = 0; i < transactions.length; i++ ) {
			if ( !transactions[i].isNoOp() ) {
				this.bigStack = this.bigStack.slice( 0, this.bigStack.length - this.undoIndex );
				this.undoIndex = 0;
				this.smallStack.push( transactions[i] );
				ve.dm.TransactionProcessor.commit( this.getDocument(), transactions[i] );
			}
		}
	}
	if ( selection && ( !this.selection || !this.selection.equals ( selection ) ) ) {
		selection.normalize();
		this.selection = selection;
		this.emit('select', this.selection.clone() );
	}
	if ( transactions ) {
		this.emit( 'transact', transactions );
	}

	// Clear and add annotations to stack if insertingAnnotations isn't happening
	if (!this.insertingAnnotations) {
		var contentOffset = this.documentModel.getNearestContentOffset( this.getSelection().start - 1, -1 ),
			annotations = this.documentModel.getAnnotationsFromOffset( contentOffset );

		// Reset insertAnnotations
		this.documentModel.insertAnnotations = new ve.AnnotationSet();
		this.documentModel.insertAnnotations.addSet( annotations );

		this.emit( 'annotationChange' );
	}

	this.emit( 'change', transactions, selection );
};

/**
 * Applies an annotation to the current selection
 *
 * @method
 * @param {String} annotation action: toggle, clear, set
 * @param {Object} annotation object to apply.
 */
ve.dm.Surface.prototype.annotate = function ( method, annotation ) {
	var tx,
		selection = this.getSelection();
	if ( selection.getLength() ) {
		// Apply annotation immediately to selection
		selection = this.getDocument().trimOuterSpaceFromRange( selection );
		tx = ve.dm.Transaction.newFromAnnotation(
			this.getDocument(), selection, method, annotation
		);
		this.change( tx, selection );
	} else {
		// Apply annotation to stack
		if ( method == 'set' ) {
			this.documentModel.insertAnnotations.push( annotation );
		} else if ( method == 'clear' ) {
			this.documentModel.insertAnnotations.remove( annotation );
		}
	}
	this.emit( 'annotationChange' );
};

ve.dm.Surface.prototype.breakpoint = function ( selection ) {
	if ( this.smallStack.length > 0 ) {
		this.bigStack.push( {
			stack: this.smallStack,
			selection: selection || this.selection.clone()
		} );
		this.smallStack = [];
		this.emit( 'history' );
	}
};

ve.dm.Surface.prototype.undo = function () {
	var diff, item, i, selection;
	this.breakpoint();
	this.undoIndex++;
	if ( this.bigStack[this.bigStack.length - this.undoIndex] ) {
		this.emit( 'lock' );
		diff = 0;
		item = this.bigStack[this.bigStack.length - this.undoIndex];
		for ( i = item.stack.length - 1; i >= 0; i-- ) {
			this.documentModel.rollback( item.stack[i] );
			diff += item.stack[i].lengthDifference;
		}
		selection = item.selection;
		selection.end -= diff;
		this.emit( 'unlock' );
		this.emit( 'history' );
		return selection;
	}
	return null;
};

ve.dm.Surface.prototype.redo = function () {
	var selection, diff, item, i;
	this.breakpoint();
	if ( this.undoIndex > 0 ) {
		this.emit( 'lock' );
		if ( this.bigStack[this.bigStack.length - this.undoIndex] ) {
			diff = 0;
			item = this.bigStack[this.bigStack.length - this.undoIndex];
			for ( i = 0; i < item.stack.length; i++ ) {
				this.documentModel.commit( item.stack[i] );
				diff += item.stack[i].lengthDifference;
			}
			selection = item.selection;
			selection.end += diff;
		}
		this.undoIndex--;
		this.emit( 'unlock' );
		this.emit( 'history' );
		return selection;
	}
	return null;
};
