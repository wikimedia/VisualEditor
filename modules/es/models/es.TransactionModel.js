/**
 * Creates an es.TransactionModel object.
 * 
 * @class
 * @constructor
 * @param {Object[]} operations List of operations
 */
es.TransactionModel = function( operations ) {
	this.operations = es.isArray( operations ) ? operations : [];
	this.lengthDifference = 0;
};

/* Methods */

/**
 * Gets a list of all operations.
 * 
 * @method
 * @returns {Object[]} List of operations
 */
es.TransactionModel.prototype.getOperations = function() {
	return this.operations;
};

/**
 * Gets the difference in content length this transaction will cause if applied.
 * 
 * @method
 * @returns {Integer} Difference in content length
 */
es.TransactionModel.prototype.getLengthDifference = function() {
	return this.lengthDifference;
};

/**
 * Merges consecutive operations of the same type.
 * 
 * @method
 */
es.TransactionModel.prototype.optimize = function() {
	for ( var i = 0; i < this.operations.length - 1; i++ ) {
		var a = this.operations[i];
		var b = this.operations[i + 1];
		if ( a.type === b.type ) {
			switch ( a.type ) {
				case 'retain':
					a.length += b.length;
					this.operations.splice( i + 1, 1 );
					i--;
					break;
				case 'insert':
				case 'remove':
					a.data = a.data.concat( b.data );
					this.operations.splice( i + 1, 1 );
					i--;
					break;
			}
		}
	}
};

/**
 * Adds a retain operation.
 * 
 * @method
 * @param {Integer} length Length of content data to retain
 */
es.TransactionModel.prototype.pushRetain = function( length ) {
	this.operations.push( {
		'type': 'retain',
		'length': length
	} );
};

/**
 * Adds an insertion operation.
 * 
 * @method
 * @param {Array} data Data to retain
 */
es.TransactionModel.prototype.pushInsert = function( data ) {
	this.operations.push( {
		'type': 'insert',
		'data': data
	} );
	this.lengthDifference += data.length;
};

/**
 * Adds a removal operation.
 * 
 * @method
 * @param {Array} data Data to remove
 */
es.TransactionModel.prototype.pushRemove = function( data ) {
	this.operations.push( {
		'type': 'remove',
		'data': data
	} );
	this.lengthDifference -= data.length;
};

/**
 * Adds an element attribute change operation.
 * 
 * @method
 * @param {String} method Method to use, either "set" or "clear"
 * @param {String} key Name of attribute to change
 * @param {Mixed} value Value to set attribute to, or value of attribute being cleared
 */
es.TransactionModel.prototype.pushChangeElementAttribute = function( method, key, value ) {
	this.operations.push( {
		'type': 'attribute',
		'method': method,
		'key': key,
		'value': value
	} );
};

/**
 * Adds a start annotating operation.
 * 
 * @method
 * @param {String} method Method to use, either "set" or "clear"
 * @param {Object} annotation Annotation object to start setting or clearing from content data
 */
es.TransactionModel.prototype.pushStartAnnotating = function( method, annotation ) {
	this.operations.push( {
		'type': 'annotate',
		'method': method,
		'bias': 'start',
		'annotation': annotation
	} );
};

/**
 * Adds a stop annotating operation.
 * 
 * @method
 * @param {String} method Method to use, either "set" or "clear"
 * @param {Object} annotation Annotation object to stop setting or clearing from content data
 */
es.TransactionModel.prototype.pushStopAnnotating = function( method, annotation ) {
	this.operations.push( {
		'type': 'annotate',
		'method': method,
		'bias': 'stop',
		'annotation': annotation
	} );
};
