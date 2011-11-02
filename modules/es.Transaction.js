/**
 * Creates an es.Transaction object.
 * 
 * @class
 * @constructor
 * @param {Object[]} operations List of operations
 */
es.Transaction = function( operations ) {
	this.operations = es.isArray( operations ) ? operations : [];
};

/* Methods */

es.Transaction.prototype.getOperations = function() {
	return this.operations;	
};

es.Transaction.prototype.pushRetain = function( length ) {
	this.operations.push( {
		'type': 'retain',
		'length': length
	} );
};

es.Transaction.prototype.pushInsert = function( content ) {
	this.operations.push( {
		'type': 'insert',
		'data': content
	} );
};

es.Transaction.prototype.pushRemove = function( data ) {
	this.operations.push( {
		'type': 'remove',
		'data': data
	} );
};

es.Transaction.prototype.pushChangeElementAttribute = function( method, key, value ) {
	this.operations.push( {
		'type': 'attribute',
		'method': method,
		'key': key,
		'value': value
	} );
};

es.Transaction.prototype.pushStartAnnotating = function( method, annotation ) {
	this.operations.push( {
		'type': 'annotate',
		'method': method,
		'bias': 'start',
		'annotation': annotation
	} );
};

es.Transaction.prototype.pushStopAnnotating = function( method, annotation ) {
	this.operations.push( {
		'type': 'annotate',
		'method': method,
		'bias': 'stop',
		'annotation': annotation
	} );
};
