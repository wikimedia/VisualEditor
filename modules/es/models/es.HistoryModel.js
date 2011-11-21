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
	this.states = [];
	this.currentStateIndex = -1;
	this.transactions = [];
	this.transactionsDiff = 0;

	// Configuration
	this.maxTransactionsDiff = 24;
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
 * @param {Boolean} accumulate Prevent automatic state pushing
 */
es.HistoryModel.prototype.commit = function( transaction, accumulate ) {
	var absLengthDiff = Math.abs( transaction.getLengthDiff() );
	// Unless we should intentionally accumulate transactions or this is the first one for this
	// state, automatically push state
	if ( !accumulate && this.transactions.length ) {
		if (
			// If the transactions are of a different type
			this.transactions[this.transactions.length - 1].type !== transaction.type ||
			// This transaction would make the state longer than the maximum length
			this.transactionsDiff + absLengthDiff > this.maxTransactionsDiff
		) {
			this.pushState();
		}
	}
	this.transactions.push( transaction );
	this.transactionsDiff += absLengthDiff;
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
	if ( this.transactions.length ) {
		// If the current state is not the most recently added state
		if ( this.currentStateIndex < this.states.length - 1 ) {
			// Forget about states newer than the current one
			this.states.splice(
				this.currentStateIndex, this.states.length - this.currentStateIndex
			);
		}
		// Add accumulated transactions as a state
		this.states.push( this.transactions );
		// Clear the transaction buffer
		this.transactions = [];
		this.transactionsDiff = 0;
		// Move the current state forward
		this.currentStateIndex++;
	}
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
	// Apply transactions in the buffer
	this.pushState();
	// Stop undo just before the first state
	var previousStateIndex = this.currentStateIndex;
	this.currentStateIndex = Math.max( -1, this.currentStateIndex - steps );
	if ( previousStateIndex > this.currentStateIndex ) {
		for ( var i = previousStateIndex; i > this.currentStateIndex; i-- ) {
			// Apply transaction to the document
			for ( var j = this.states[i].length - 1; j >= 0; j-- ) {
				this.doc.rollback( this.states[i][j] );
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
	// Apply transactions in the buffer
	this.pushState();
	// Stop redo at the last state
	var previousStateIndex = this.currentStateIndex;
	this.currentStateIndex = Math.min( this.states.length - 1, this.currentStateIndex + steps );
	if ( previousStateIndex < this.currentStateIndex ) {
		for ( var i = previousStateIndex + 1; i >= this.currentStateIndex; i++ ) {
			// Apply transaction to the document
			this.doc.rollback( this.states[i] );
			// Emit an undo event with the state to be rolled back
			this.emit( 'redo', this.states[i] );
		}
	}
};

/* Inheritance */

es.extendClass( es.HistoryModel, es.EventEmitter );
