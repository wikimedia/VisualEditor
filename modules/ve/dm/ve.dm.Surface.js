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
	this.insertionAnnotations = new ve.AnnotationSet();
};

/* Inheritance */

ve.inheritClass( ve.dm.Surface, ve.EventEmitter );

/* Methods */

/**
 * Start tracking state changes in history.
 *
 * @method
 */
ve.dm.Surface.prototype.startHistoryTracking = function () {
	this.historyTrackingInterval = setInterval( ve.bind( this.breakpoint, this ), 750 );
};

/**
 * Stop tracking state changes in history.
 *
 * @method
 */
ve.dm.Surface.prototype.stopHistoryTracking = function () {
	clearInterval( this.historyTrackingInterval );
};

/**
 * Removes all states from history.
 *
 * @method
 */
ve.dm.Surface.prototype.purgeHistory = function () {
	this.selection = null;
	this.smallStack = [];
	this.bigStack = [];
	this.undoIndex = 0;
};

/**
 * Gets a list of all history states.
 *
 * @method
 * @returns {Array[]} List of transaction stacks
 */
ve.dm.Surface.prototype.getHistory = function () {
	if ( this.smallStack.length > 0 ) {
		return this.bigStack.slice( 0 ).concat( [{ 'stack': this.smallStack.slice(0) }] );
	} else {
		return this.bigStack.slice( 0 );
	}
};

/**
 * Gets annotations that will be used upon insertion.
 *
 * @method
 * @returns {ve.AnnotationSet|null} Insertion anotations or null if not being used
 */
ve.dm.Surface.prototype.getInsertionAnnotations = function () {
	return this.insertionAnnotations.clone();
};

/**
 * Sets annotations that will be used upon insertion.
 *
 * @method
 * @param {ve.AnnotationSet|null} Insertion anotations to use or null to disable them
 * @emits 'contextChange'
 */
ve.dm.Surface.prototype.setInsertionAnnotations = function ( annotations ) {
	this.insertionAnnotations = annotations.clone();
	this.emit( 'contextChange' );
};

/**
 * Adds an annotation to the insertion annotations.
 *
 * @method
 * @param {ve.AnnotationSet} Insertion anotation to add
 * @emits 'contextChange'
 */
ve.dm.Surface.prototype.addInsertionAnnotation = function ( annotation ) {
	this.insertionAnnotations.push( annotation );
	this.emit( 'contextChange' );
};

/**
 * Removes an annotation from the insertion annotations.
 *
 * @method
 * @param {ve.AnnotationSet} Insertion anotation to remove
 * @emits 'contextChange'
 */
ve.dm.Surface.prototype.removeInsertionAnnotation = function ( annotation ) {
	this.insertionAnnotations.remove( annotation );
	this.emit( 'contextChange' );
};

/**
 * Checks if there is a state to redo.
 *
 * @method
 * @returns {Boolean} Has a future state
 */
ve.dm.Surface.prototype.hasFutureState = function() {
	return this.undoIndex > 0;
};

/**
 * Checks if there is a state to undo.
 *
 * @method
 * @returns {Boolean} Has a past state
 */
ve.dm.Surface.prototype.hasPastState = function() {
	return this.bigStack.length - this.undoIndex > 0;
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
 * @param {ve.Range} [range] Range within target document, current selection used by default
 * @param {Boolean} [noAutoSelect] Don't update the surface's selection when making changes
 */
ve.dm.Surface.prototype.getFragment = function ( range, noAutoSelect ) {
	return new ve.dm.SurfaceFragment( this, range || this.selection, noAutoSelect );
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
	var i, len, offset, annotations,
		contextChange = false;

	// Process transactions and apply selection changes
	if ( transactions ) {
		if ( transactions instanceof ve.dm.Transaction ) {
			transactions = [transactions];
		}
		this.emit( 'lock' );
		for ( i = 0, len = transactions.length; i < len; i++ ) {
			if ( !transactions[i].isNoOp() ) {
				this.bigStack = this.bigStack.slice( 0, this.bigStack.length - this.undoIndex );
				this.undoIndex = 0;
				this.smallStack.push( transactions[i] );
				ve.dm.TransactionProcessor.commit( this.documentModel, transactions[i] );
			}
		}
		this.emit( 'unlock' );
	}

	// Only emit a select event if the selection actually changed
	if ( selection && ( !this.selection || !this.selection.equals( selection ) ) ) {
		selection.normalize();
		// Detect context change
		if (
			this.documentModel.getNodeFromOffset( selection.start ) !==
				this.documentModel.getNodeFromOffset( this.selection.start ) ||
			(
				selection.getLength() &&
				this.documentModel.getNodeFromOffset( selection.end ) !==
					this.documentModel.getNodeFromOffset( this.selection.end )
			)
		) {
			contextChange = true;
		}
		this.selection = selection;
		this.emit( 'select', this.selection.clone() );
	}

	// Only emit a transact event if transactions were actually processed
	if ( transactions ) {
		this.emit( 'transact', transactions );
		// Detect context change, if not detected already, when element attributes have changed
		if ( !contextChange ) {
			for ( i = 0, len = transactions.length; i < len; i++ ) {
				if ( transactions[i].hasElementAttributeOperations() ) {
					contextChange = true;
					break;
				}
			}
		}
	}

	// Figure out which offset which we should get insertion annotations from
	if ( this.selection.isCollapsed() ) {
		// Get annotations from the left of the cursor
		offset = this.documentModel.getNearestContentOffset(
			Math.max( 0, this.selection.start - 1 ), -1
		);
	} else {
		// Get annotations from the first character of the selection
		offset = this.documentModel.getNearestContentOffset( this.selection.start );
	}
	if ( offset === -1 ) {
		// Document is empty, use empty set
		annotations = new ve.AnnotationSet();
	} else {
		annotations = this.documentModel.getAnnotationsFromOffset( offset );
	}
	// Only emit an annotations change event if there's a meaningful difference
	if (
		!annotations.containsAllOf( this.insertionAnnotations ) ||
		!this.insertionAnnotations.containsAllOf( annotations )
	) {
		this.insertionAnnotations = annotations;
		contextChange = true;
	}
	// Only emit one context change event
	if ( contextChange ) {
		this.emit( 'contextChange' );
	}

	this.emit( 'change', transactions, selection );
};

/**
 * Sets a history state breakpoint.
 *
 * @method
 * @param {ve.Range} selection New selection range
 */
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

/**
 * Steps backwards in history.
 *
 * @method
 * @returns {ve.Range} Selection or null if no further state could be reached
 */
ve.dm.Surface.prototype.undo = function () {
	var item, i, transaction, selection;
	this.breakpoint();
	this.undoIndex++;

	if ( this.bigStack[this.bigStack.length - this.undoIndex] ) {
		this.emit( 'lock' );
		item = this.bigStack[this.bigStack.length - this.undoIndex];
		selection = item.selection;

		for ( i = item.stack.length - 1; i >= 0; i-- ) {
			transaction = item.stack[i];
			selection = transaction.translateRange( selection, true );
			this.documentModel.rollback( item.stack[i] );
		}
		this.emit( 'unlock' );
		this.emit( 'history' );
		return selection;
	}
	return null;
};

/**
 * Steps forwards in history.
 *
 * @method
 * @returns {ve.Range} Selection or null if no further state could be reached
 */
ve.dm.Surface.prototype.redo = function () {
	var selection, item, i;
	this.breakpoint();

	if ( this.undoIndex > 0 && this.bigStack[this.bigStack.length - this.undoIndex] ) {
		this.emit( 'lock' );
		item = this.bigStack[this.bigStack.length - this.undoIndex];
		selection = item.selection;
		for ( i = 0; i < item.stack.length; i++ ) {
			this.documentModel.commit( item.stack[i] );
		}
		this.undoIndex--;
		this.emit( 'unlock' );
		this.emit( 'history' );
		return selection;
	}
	return null;
};
