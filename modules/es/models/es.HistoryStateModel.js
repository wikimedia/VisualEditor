/**
 * Creates an es.HistoryStateModel object.
 * 
 * @class
 * @constructor
 */
es.HistoryStateModel = function() {
	this.transactions = [];
	this.selection = null;
};

/* Methods */

es.HistoryStateModel.prototype.getSelection = function() {
	return this.selection;
};

es.HistoryStateModel.prototype.getTransactions = function() {
	return this.transactions;
};

es.HistoryStateModel.prototype.getTransactionCount = function() {
	return this.transactions.length;
};

es.HistoryStateModel.prototype.pushTransaction = function( transaction, selection ) {
	this.transactions.push( transaction );
	if ( selection !== undefined ) {
		this.selection = selection.clone();
	}
};
