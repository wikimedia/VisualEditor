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
	this.selection = new es.Range();
	this.states = [[]];
	this.initializeState( this.states.length - 1 );

	// Configuration
	this.distanceLimit = 24;
	this.lengthDifferenceLimit = 24;
};

/* Methods */

es.SurfaceModel.prototype.initializeState = function( stateIndex ) {
	if ( this.states[stateIndex] === undefined ) {
		throw 'Invalid state index error. State index our of range: ' + stateIndex;
	}
	this.currentStateIndex = stateIndex;
	this.currentState = this.states[stateIndex];
	this.currentStateDistance = 0;
	this.currentStateLengthDifference = 0;
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
 * Gets the selection for the current state.
 * 
 * @method
 * @returns {es.Range} Current state's selection
 */
es.SurfaceModel.prototype.getSelection = function() {
	return this.selection;
};

/**
 * Changes the selection.
 * 
 * If changing the selection at a high frequency (such as while dragging) use the combine argument
 * to avoid them being split up into multiple states.
 * 
 * @method
 * @param {es.Range} selection
 * @param {Boolean} combine Whether to prevent this transaction from causing a state push
 */
es.SurfaceModel.prototype.select = function( selection, combine ) {
	selection.normalize();
	if ( !combine && this.shouldPushState( selection ) ) {
		this.pushState();
	}
	// Filter out calls to select if they do not change the selection values
	var selectionChanged = !this.selection || (
		this.selection.from !== selection.from || 
		this.selection.to !== selection.to
	);
	if ( selectionChanged ) {
		var lastAction = this.states[this.states.length - 1];
		if ( lastAction instanceof es.Range ) {
			this.currentStateDistance += Math.abs(
				selection.from - this.states[this.states.length - 1].from
			);
		}
		this.currentState.push( selection );
		this.selection = selection;
		if ( selectionChanged ) {
			this.emit( 'select', this.selection.clone() );
		}
	}
};

/**
 * Applies a series of transactions to the content data.
 * 
 * If committing multiple transactions which are the result of a single user action and need to be
 * part of a single state, use the combine argument for all but the last one to avoid them being
 * split up into multple states.
 * 
 * @method
 * @param {es.TransactionModel} transactions Tranasction to apply to the document
 * @param {Boolean} combine Whether to prevent this transaction from causing a state push
 */
es.SurfaceModel.prototype.transact = function( transaction, combine ) {
	if ( !combine && this.shouldPushState( transaction ) ) {
		this.pushState();
	}
	this.currentStateLengthDifference += transaction.getLengthDifference();
	this.doc.commit( transaction );
	this.currentState.push( transaction );
	this.emit( 'transact', transaction );
};

/**
 * Reverses one or more selections and transactions.
 * 
 * @method
 * @param {Integer} steps Number of steps to reverse
 */
es.SurfaceModel.prototype.undo = function( steps ) {
	// TODO: Implement me!
	this.emit( 'undo'/*, transaction/selection*/ );
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

/**
 * Checks if it's an appropriate time to push the state.
 * 
 * @method
 * @returns {Boolean} Whether the state should be pushed
 */
es.SurfaceModel.prototype.shouldPushState = function( nextAction ) {
	// Never push a new state if the current one is empty
	if ( !this.currentState.length ) {
		return false;
	}
	var lastAction = this.currentState[this.currentState.length - 1],
		nextDirection,
		lastDirection;
	if (
		// Check that types match
		nextAction instanceof es.Range && lastAction instanceof es.Range
	) {
		if (
			// 2 or more select actions in a row are required to detect a direction
			this.states.length >= 2 && this.states[this.states.length - 2] instanceof es.Range
		) {
			// Check we haven't changed directions
			lastDirection = this.states[this.states.length - 2].from - lastAction.from;
			nextDirection = lastAction.from - nextAction.from;
			if (
				// Both movements are in the same direction
				( lastDirection < 0 && nextDirection < 0 ) ||
				( lastDirection > 0 && nextDirection > 0 )
			) {
				// Check we are still within the distance threshold
				if (
					Math.abs( nextAction.from - lastAction.from ) + this.currentStateDistance <
						this.distanceLimit
				) {
					return false;
				}
			}
		}
	} else if (
		// Check that types match
		nextAction instanceof es.TransactionModel && lastAction instanceof es.TransactionModel
	) {
		// Check if we've changed directions (insert vs remove)
		lastLengthDifference = lastAction.getLengthDifference();
		nextLengthDifference = nextAction.getLengthDifference();
		if (
			// Both movements are in the same direction
			( lastLengthDifference < 0 && nextLengthDifference < 0 ) ||
			( lastLengthDifference > 0 && nextLengthDifference > 0 )
		) {
			// Check we are still within the length difference threshold
			if (
				nextLengthDifference + this.currentStateLengthDifference <
					this.lengthDifferenceLimit
			) {
				return false;
			}
		}
	}
	return true;
};

/**
 * Removes any undone states and pushes a new state to the stack.
 * 
 * @method
 */
es.SurfaceModel.prototype.pushState = function() {
	// Automatically drop undone states - we are now moving in a new direction
	if ( this.states[this.states.length - 1] !== this.currentState ) {
		for ( var i = this.states.length - 1; i > this.currentStateIndex; i-- ) {
			this.emit( 'popState', this.states.pop() );
		}
	}
	// Push a new state to the stack
	this.optimizeState( this.states.length - 1 );
	this.states.push( [] );
	this.initializeState( this.states.length - 1 );
	this.emit( 'pushState' );
};

es.SurfaceModel.prototype.optimizeState = function( stateIndex ) {
	var skipSelects = false,
		newState = [];
	for ( var i = this.states[stateIndex].length - 1; i >= 0; i-- ) {
		var action = this.states[stateIndex][i];
		if ( !( action instanceof es.Range && skipSelects ) ) {
			newState.push( action );
			skipSelects = true;
		}
	}
	this.states[stateIndex] = newState;
};

/* Inheritance */

es.extendClass( es.SurfaceModel, es.EventEmitter );
