/**
 * DataModel transaction.
 *
 * @class
 * @constructor
 */
ve.dm.Transaction = function() {
	this.operations = [];
	this.lengthDifference = 0;
};

/* Static Methods */

ve.dm.Transaction.newFromInsertion = function( doc, offset, data ) {
	// Implement me!
};

ve.dm.Transaction.newFromRemoval = function( doc, range ) {
	// Implement me!
};

ve.dm.Transaction.newFromReplacement = function( doc, range, data ) {
	// Implement me!
};

/**
 * Get a transaction that changes an attribute.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document to create transaction for
 * @param {Integer} offset Offset of element
 * @param {String} key Attribute name
 * @param {Mixed} value New value
 * @returns {ve.dm.Transaction} Transcation that changes an element
 * @throws 'Can not set attributes to non-element data'
 * @throws 'Can not set attributes on closing element'
 */
ve.dm.Transaction.newFromAttributeChange = function( doc, offset, key, value ) {
	var tx = new ve.dm.Transaction(),
		data = doc.getData();
	// Verify element exists at offset
	if ( data[offset].type === undefined ) {
		throw 'Can not set attributes to non-element data';
	}
	// Verify element is not a closing
	if ( data[offset].type.charAt( 0 ) === '/' ) {
		throw 'Can not set attributes on closing element';
	}
	// Retain up to element
	if ( offset ) {
		tx.pushRetain( offset );
	}
	// Change attribute
	tx.pushReplaceElementAttribute(
		key, 'attributes' in data[offset] ? data[offset].attributes[key] : undefined, value
	);
	// Retain to end of document
	if ( offset < data.length ) {
		tx.pushRetain( data.length - offset );
	}
	return tx;
};

/**
 * Get a transaction that annotates content.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document to create transaction for
 * @param {ve.Range} range Range to annotate
 * @param {String} method Annotation mode
 *     'set': Adds annotation to all content in range
 *     'clear': Removes instances of annotation from content in range
 * @param {Object} annotation Annotation to set or clear
 * @returns {ve.dm.Transaction} Transcation that annotates content
 */
ve.dm.Transaction.newFromAnnotation = function( doc, range, method, annotation ) {
	var tx = new ve.dm.Transaction(),
		data = doc.getData(),
		hash = ve.getHash( annotation );
	// Iterate over all data in range, annotating where appropriate
	range.normalize();
	var i = range.start,
		span = i,
		on = false;
	while ( i < range.end ) {
		if ( data[i].type !== undefined ) {
			// Element
			if ( on ) {
				if ( span ) {
					tx.pushRetain( span );
				}
				tx.pushStopAnnotating( method, annotation );
				span = 0;
				on = false;
			}
		} else {
			// Content
			var covered = doc.offsetContainsAnnotation( i, annotation );
			if ( ( covered && method === 'set' ) || ( !covered  && method === 'clear' ) ) {
				// Skip annotated content
				if ( on ) {
					if ( span ) {
						tx.pushRetain( span );
					}
					tx.pushStopAnnotating( method, annotation );
					span = 0;
					on = false;
				}
			} else {
				// Cover non-annotated content
				if ( !on ) {
					if ( span ) {
						tx.pushRetain( span );
					}
					tx.pushStartAnnotating( method, annotation );
					span = 0;
					on = true;
				}
			}
		}
		span++;
		i++;
	}
	if ( span ) {
		tx.pushRetain( span );
	}
	if ( on ) {
		tx.pushStopAnnotating( method, annotation );
	}
	if ( range.end < data.length ) {
		tx.pushRetain( data.length - range.end );
	}
	return tx;
};

/* Methods */

/**
 * Gets a list of all operations.
 *
 * @method
 * @returns {Object[]} List of operations
 */
ve.dm.Transaction.prototype.getOperations = function() {
	return this.operations;
};

/**
 * Gets the difference in content length this transaction will cause if applied.
 *
 * @method
 * @returns {Integer} Difference in content length
 */
ve.dm.Transaction.prototype.getLengthDifference = function() {
	return this.lengthDifference;
};

/**
 * Adds a retain operation.
 *
 * @method
 * @param {Integer} length Length of content data to retain
 */
ve.dm.Transaction.prototype.pushRetain = function( length ) {
	var end = this.operations.length - 1;
	if ( this.operations.length && this.operations[end].type === 'retain' ) {
		this.operations[end].length += length;
	} else {
		this.operations.push( {
			'type': 'retain',
			'length': length
		} );
	}
};

/**
 * Adds an insertion operation.
 *
 * @method
 * @param {Array} data Data to retain
 */
ve.dm.Transaction.prototype.pushInsert = function( data ) {
	// FIXME use replace operations instead
	var end = this.operations.length - 1;
	if ( this.operations.length && this.operations[end].type === 'insert' ) {
		this.operations[end].data = this.operations[end].data.concat( data );
	} else {
		this.operations.push( {
			'type': 'insert',
			'data': data
		} );
	}
	this.lengthDifference += data.length;
};

/**
 * Adds a removal operation.
 *
 * @method
 * @param {Array} data Data to remove
 */
ve.dm.Transaction.prototype.pushRemove = function( data ) {
	// FIXME use replace operations instead
	var end = this.operations.length - 1;
	if ( this.operations.length && this.operations[end].type === 'remove' ) {
		this.operations[end].data = this.operations[end].data.concat( data );
	} else {
		this.operations.push( {
			'type': 'remove',
			'data': data
		} );
	}
	this.lengthDifference -= data.length;
};

/**
 * Adds a replace operation
 *
 * @method
 * @param {Array} remove Data to remove
 * @param {Array] insert Data to replace 'remove' with
 */
ve.dm.Transaction.prototype.pushReplace = function( remove, insert ) {
	this.operations.push( {
		'type': 'replace',
		'remove': remove,
		'insert': insert
	} );
	this.lengthDifference += insert.length - remove.length;
};

/**
 * Adds an element attribute change operation.
 *
 * @method
 * @param {String} key Name of attribute to change
 * @param {Mixed} from Value change attribute from
 * @param {Mixed} to Value to change attribute to
 */
ve.dm.Transaction.prototype.pushReplaceElementAttribute = function( key, from, to ) {
	this.operations.push( {
		'type': 'attribute',
		'key': key,
		'from': from,
		'to': to
	} );
};

/**
 * Adds a start annotating operation.
 *
 * @method
 * @param {String} method Method to use, either "set" or "clear"
 * @param {Object} annotation Annotation object to start setting or clearing from content data
 */
ve.dm.Transaction.prototype.pushStartAnnotating = function( method, annotation ) {
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
ve.dm.Transaction.prototype.pushStopAnnotating = function( method, annotation ) {
	this.operations.push( {
		'type': 'annotate',
		'method': method,
		'bias': 'stop',
		'annotation': annotation
	} );
};
