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

/**
 * Generates a transaction that inserts data at a given offset.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document to create transaction for
 * @param {Integer} offset Offset to insert at
 * @param {Array} data Data to insert
 * @returns {ve.dm.Transaction} Transcation that inserts data
 */
ve.dm.Transaction.newFromInsertion = function( doc, offset, insertion ) {
	var tx = new ve.dm.Transaction(),
		data = doc.getData();
	// Fix up the insertion
	insertion = doc.fixupInsertion( insertion, offset );
	// Retain up to insertion point, if needed
	if ( offset ) {
		tx.pushRetain( offset );
	}
	// Insert data
	tx.pushReplace( [], insertion );
	// Retain to end of document, if needed (for completeness)
	if ( offset < data.length ) {
		tx.pushRetain( data.length - offset );
	}
	return tx;
};

/**
 * Generates a transaction which removes data from a given range.
 *
 * There are three possible results from a removal:
 *    1. Remove content only
 *       - Occurs when the range starts and ends on elements of different type, depth or ancestry
 *    2. Remove entire elements and their content
 *       - Occurs when the range spans across an entire element
 *    3. Merge two elements by removing the end of one and the beginning of another
 *       - Occurs when the range starts and ends on elements of similar type, depth and ancestry
 *
 * This function uses the following logic to decide what to actually remove:
 *     1. Elements are only removed if range being removed covers the entire element
 *     2. Elements can only be merged if ve.dm.Node.canBeMergedWith() returns true
 *     3. Merges take place at the highest common ancestor
 *
 * @method
 * @param {ve.dm.Document} doc Document to create transaction for
 * @param {ve.Range} range Range of data to remove
 * @returns {ve.dm.Transaction} Transcation that removes data
 * @throws 'Invalid range, can not remove from {range.start} to {range.end}'
 */
ve.dm.Transaction.newFromRemoval = function( doc, range ) {
	var tx = new ve.dm.Transaction(),
		data = doc.getData();
	// Normalize and validate range
	range.normalize();
	if ( range.start === range.end ) {
		// Empty range, nothing to remove, retain up to the end of the document (for completeness)
		tx.pushRetain( data.length );
		return tx;
	}
	// Select nodes and validate selection
	var selection = doc.selectNodes( range, 'leaves' ),
		nodeRange;
	if ( selection.length === 0 ) {
		// Empty selection? Something is wrong!
		throw 'Invalid range, cannot remove from ' + range.start + ' to ' + range.end;
	}
	// Decide whether to merge or strip
	if ( selection[0].node.canBeMergedWith( selection[selection.length - 1].node ) ) {
		// If only one node was selected, ignore anything past this node
		if ( selection.length === 1 ) {
			// Include the parent's wrapping (if any - there should always be, but let's be safe)
			var wrapping = selection[0].node.getParent().isWrapped() ? 1 : 0;
			// Only reduces the range to cover the selected node if it's shorter
			range.start = Math.max( range.start, selection[0].nodeRange.start - wrapping );
			// Only reduces the range to cover the selected node if it's shorter
			range.end = Math.min( range.end, selection[0].nodeRange.end + wrapping );
		}
		// Retain to the start of the range
		if ( range.start > 0 ) {
			tx.pushRetain( range.start );
		}
		// Remove all data in a given range.
		tx.pushReplace( data.slice( range.start, range.end ), [] );
		// Retain up to the end of the document, if needed (for completeness)
		if ( range.end < data.length ) {
			tx.pushRetain( data.length - range.end );
		}
	} else {
		var offset = 0;
		for ( var i = 0; i < selection.length; i++ ) {
			nodeRange = selection[i].nodeRange;
			// Retain up to where the next removal starts
			if ( nodeRange.start > offset ) {
				tx.pushRetain( nodeRange.start - offset );
			}
			// Remove data
			if ( nodeRange.getLength() ) {
				tx.pushReplace( data.slice( nodeRange.start, nodeRange.end ), [] );
			}
			// Advance to the next node
			offset = nodeRange.end;
		}
		// Retain up to the end of the document, if needed (for completeness)
		if ( offset < data.length ) {
			tx.pushRetain( data.length - offset );
		}
	}
	return tx;
};

/**
 * Generates a transaction that changes an attribute.
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
 * Generates a transaction that annotates content.
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
