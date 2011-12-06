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
	this.history = [];
	this.historyIndex = 0;
	this.currentLengthDifference = 0;

	// TODO magic number move to configuration 
	// Configuration
	this.lengthDifferenceLimit = 24;

	// DEBUG don't commit
	var _this = this;
	this.addListener( 'transact', function() { console.log( _this.history ); } );
};

/* Methods */


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
 * @param {Boolean} combine Whether to prevent this transaction from causing a history push
 */
es.SurfaceModel.prototype.select = function( selection, isManual ) {
	selection.normalize();

	this.selection = selection;	

	if ( isManual ) {
		// check if the last thing is a selection, if so, swap it.
		this.pushSelection( selection );
	}

	this.emit( 'select', this.selection.clone() );
};

/**
 * Adds a selection (which is really just a marker for when we stop undo/redo) to the history.
 * For the history, selections are just markers, so we don't want to record many of them in a row.
 * 
 * @method
 * @param {es.Range} selection
 */
es.SurfaceModel.prototype.pushSelection = function( selection ) {
	if ( this.history[ this.history.length - 1 ] instanceof es.Range ) {
		this.history[ this.history.length - 1 ] = selection;
	} else {
		this.history.push( selection );
	}
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
es.SurfaceModel.prototype.transact = function( transaction, isPartial ) {
	console.log( 'tx:' + $.map( transaction.getOperations(), function(tx) { return tx.type; } ).join(",") 
					+ ' isPartial:' + isPartial ); 
	this.doc.commit( transaction );

	// if we have changed the kind of operation (delete -> insert or insert -> delete or annotations )
	// then push a new selection onto the history, to mark where the undo/redo should end.
	var d = transaction.getLengthDifference();
	if ( 
		!isPartial &&
		(
			( d === 0 ) ||
			( this.currentLengthDifference < 0 && d > 0 ) ||
			( this.currentLengthDifference > 0 && d < 0 ) ||
			( Math.abs( this.currentLengthDifference ) > this.lengthDifferenceLimit ) 
		)
	) {
		this.currentLengthDifference = d;
		this.history.push( this.selection );
	} else {
		this.currentLengthDifference += d;
	}

	this.history.push( transaction );
	
	this.emit( 'transact', transaction );
};


/**
 * Reverses one or more history items.
 * 
 * @method
 * @param {Integer} Number of history items to roll back
 */
es.SurfaceModel.prototype.undo = function( statesToUndo ) {
	
	console.log( 'about to undo...' );
	console.log( this.states );
	console.log( 'currentState: ' + this.currentState );
	console.log( 'currentStateIndex: ' + this.currentStateIndex );

	lengthDifference = 0;

	while ( statesToUndo ) {
		statesToUndo--;

		if ( this.currentState.length ) {
			for (var i = this.currentState.length - 1; i >= 0; i-- ) {
				lengthDifference += this.currentState[i].getLengthDifference();
				this.doc.rollback( this.currentState[i] );
			}
			this.emit( 'undo', this.currentState );
		}

		// do we also want all the effects of initializeState? currentStateDistance to be 0, currentStateLengthDifference?
		if ( this.currentStateIndex > 0 ) { 
			this.initializeState( this.currentStateIndex - 1 );
		}
	}

	console.log( 'after undo...' );
	console.log( this.states );
	console.log( 'currentState: ' + this.currentState );
	console.log( 'currentStateIndex: ' + this.currentStateIndex );

	// TODO - make the appropriate selection now
};

/**
 * Repeats one or more selections and transactions.
 * 
 * @method
 * @param {Integer} steps Number of steps to repeat
 */
es.SurfaceModel.prototype.redo = function( steps ) {
	// TODO: Implement me!
	this.emit( 'redo'/*, transaction/selection*/ );
};

/* Inheritance */

es.extendClass( es.SurfaceModel, es.EventEmitter );
