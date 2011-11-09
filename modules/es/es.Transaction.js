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

/**
 * Gets a list of all operations.
 * 
 * @method
 * @returns {Object[]} List of operations
 */
es.Transaction.prototype.getOperations = function() {
	return this.operations;	
};

/**
 * Merges consecutive operations of the same type.
 * 
 * @method
 */
es.Transaction.prototype.optimize = function() {
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
					a.content = a.content.concat( b.content );
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
es.Transaction.prototype.pushRetain = function( length ) {
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
es.Transaction.prototype.pushInsert = function( data ) {
	this.operations.push( {
		'type': 'insert',
		'data': data
	} );
};

/**
 * Adds a removal operation.
 * 
 * @method
 * @param {Array} data Data to remove
 */
es.Transaction.prototype.pushRemove = function( data ) {
	this.operations.push( {
		'type': 'remove',
		'data': data
	} );
};

/**
 * Adds an element attribute change operation.
 * 
 * @method
 * @param {String} method Method to use, either "set" or "clear"
 * @param {String} key Name of attribute to change
 * @param {Mixed} value Value to set attribute to, or value of attribute being cleared
 */
es.Transaction.prototype.pushChangeElementAttribute = function( method, key, value ) {
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
es.Transaction.prototype.pushStartAnnotating = function( method, annotation ) {
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
es.Transaction.prototype.pushStopAnnotating = function( method, annotation ) {
	this.operations.push( {
		'type': 'annotate',
		'method': method,
		'bias': 'stop',
		'annotation': annotation
	} );
};
