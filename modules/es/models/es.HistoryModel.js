/**
 * Creates an es.HistoryModel object.
 * 
 * @class
 * @constructor
 * @extends {es.EventEmitter}
 * @param {es.DocumentModel} doc Document being tracked and modified
 */
es.HistoryModel = function( doc ) {
	// Inheritance
	es.EventEmitter.call( this );

	// Properties
	this.doc = doc;
	this.currentState = new es.HistoryStateModel();
	this.currentStateIndex = 0;
	this.states = [this.currentState];
	this.currentStateDiff = 0;

	// Configuration
	this.maxStateDiff = 24;
};

/* Methods */

/**
 * Gets the index of the current state.
 * 
 * 
 */
es.HistoryModel.prototype.getCurrentStateIndex = function() {
	return this.currentStateIndex;
};

/**
 * Gets the index of the current state.
 * 
 * 
 */
es.HistoryModel.prototype.getCurrentStateSelection = function() {
	return this.currentState.getSelection();
};

/**
 * Gets the number of states available.
 * 
 * @method
 */
es.HistoryModel.prototype.getStateCount = function() {
	return this.states.length;
};

/**
 * Gets a copy of the list of states.
 * 
 * @method
 * @param {Boolean} deep Whether to make a deep copy (can be slow)
 * @returns {Array[]} List of states, each a list of transactions
 */
es.HistoryModel.prototype.getStates = function( deep ) {
	return deep ? es.copyArray( this.states ) : this.states.slice( 0 );
};

/**
 * Gets a copy of the list of transactions, which are not yet part of a state.
 * 
 * @method
 * @param {Boolean} deep Whether to make a deep copy (can be slow)
 * @returns {es.TransactionModel[]} List of transactions
 */
es.HistoryModel.prototype.getTransactions = function( deep ) {
	return deep ? es.copyArray( this.transactions ) : this.transactions.slice( 0 );
};

/**
 * Commits a transaction.
 * 
 * Unless the accumulate option is used a state will be automatically pushed before committing
 * if the transaction is of a different type as the previous one in the transaction buffer, or if
 * the transaction would produce a content length difference beyond the configured maximum.
 * 
 * @method
 * @param {es.TransactionModel} transaction Transaction to commit
 * @param {es.Range} [selection] Selection to use after the transaction has been applied
 * @param {Boolean} [accumulate] Prevent automatic state pushing
 */
es.HistoryModel.prototype.commit = function( transaction, selection, accumulate ) {
	var transactionDiff = Math.abs( transaction.getLengthDiff() );
	// Unless we should intentionally accumulate transactions or this is the first one for this
	// state, automatically push state
	var transactionCount = this.currentState.getTransactionCount();
	if ( !accumulate && transactionCount ) {
		if (
			// If the transactions are of a different type
			this.currentState.getTransactions()[transactionCount - 1].type !== transaction.type ||
			// This transaction would make the state longer than the maximum length
			this.currentStateDiff + transactionDiff > this.maxStateDiff
		) {
			this.pushState();
		}
	}
	this.currentState.pushTransaction( transaction );
	this.currentStateDiff += transactionDiff;
	// Apply transaction to the document
	this.doc.commit( transaction );
	// Emit a do event with the transaction that was just committed
	this.emit( 'do', transaction );
};

/**
 * Moves transactions in the buffer into a new state.
 * 
 * @method
 */
es.HistoryModel.prototype.pushState = function() {
	// If any transactions have been pushed since the last state push
	if ( this.currentState.getTransactionCount() ) {
		// If the current state is not the most recently added state
		if ( this.currentStateIndex < this.states.length - 1 ) {
			// Forget about states newer than the current one
			this.states.splice(
				this.currentStateIndex, this.states.length - this.currentStateIndex
			);
		}
		// Create a new current state
		this.currentState = new es.HistoryStateModel();
		// Add the new current state to the stack
		this.states.push( this.currentState );
		// Reset the state diff counter
		this.currentStateDiff = 0;
		// Move the current state index to the end (should be equivilant of ++)
		this.currentStateIndex = this.states.length - 1;
	}
	// Emit the completed
	this.emit( 'pushState', this.states[this.states.length - 1] );
};

/**
 * 
 * 
 * @method
 */
es.HistoryModel.prototype.undo = function( steps ) {
	if ( steps === undefined ) {
		steps = 1; 
	}
	// Stop undo just before the first state
	var previousStateIndex = this.currentStateIndex;
	this.currentStateIndex = Math.max( -1, this.currentStateIndex - steps );
	if ( previousStateIndex > this.currentStateIndex ) {
		for ( var i = previousStateIndex; i > this.currentStateIndex; i-- ) {
			// Apply transaction to the document
			var transactions = this.states[i].getTransactions();
			for ( var j = transactions.length - 1; j >= 0; j-- ) {
				this.doc.rollback( transactions[j] );
			}
			// Emit an undo event with the state to be rolled back
			this.emit( 'undo', this.states[i] );
		}
	}
};

/**
 * 
 * 
 * @method
 */
es.HistoryModel.prototype.redo = function( steps ) {
	if ( steps === undefined ) {
		steps = 1; 
	}
	// Stop redo at the last state
	var previousStateIndex = this.currentStateIndex;
	this.currentStateIndex = Math.min( this.states.length - 1, this.currentStateIndex + steps );
	if ( previousStateIndex < this.currentStateIndex ) {
		for ( var i = previousStateIndex + 1; i >= this.currentStateIndex; i++ ) {
			// Apply transaction to the document
			var transactions = this.states[i].getTransactions();
			for ( var j = 0; j < transactions.length; j++ ) {
				this.doc.commit( transactions[j] );
			}
			// Emit an undo event with the state to be rolled back
			this.emit( 'redo', this.states[i] );
		}
	}
};

/* Inheritance */

es.extendClass( es.HistoryModel, es.EventEmitter );
