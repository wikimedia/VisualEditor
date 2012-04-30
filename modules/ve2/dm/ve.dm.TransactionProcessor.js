/**
 * DataModel transaction processor.
 * 
 * This class reads operations from a transaction and applies them one by one. It's not intended
 * to be used directly; use the static functions ve.dm.TransactionProcessor.commit() and .rollback()
 * instead.
 * 
 * @class
 * @constructor
 */
ve.dm.TransactionProcessor = function( doc, transaction, reversed ) {
	this.document = doc;
	this.transaction = transaction;
	this.reversed = reversed;
	
	// Linear model offset that we're currently at
	// The operations in the transaction are ordered, so the cursor only ever moves forward
	this.cursor = 0;
	
	// Annotation stacks used by the annotate operation. Any data that passes through an
	// operation will have these annotation changes applied to them.
	// The format is { hash: annotationObjectReference }
	this.set = {}; // Annotations to add to data passing through
	this.clear = {}; // Annotations to remove from data passing through
};

/* Static methods */

/**
 * Commit a transaction to a document.
 * 
 * @param {ve.dm.Document} doc Document object to apply the transaction to
 * @param {ve.dm.Transaction} transaction Transaction to apply
 */
ve.dm.TransactionProcessor.commit = function( doc, transaction ) {
	new ve.dm.TransactionProcessor( doc, transaction, false ).process();
};

/**
 * Roll back a transaction; this applies the transaction to the document in reverse.
 * 
 * @param {ve.dm.Document} doc Document object to apply the transaction to
 * @param {ve.dm.Transaction} transaction Transaction to apply
 */
ve.dm.TransactionProcessor.rollback = function( doc, transaction ) {
	new ve.dm.TransactionProcessor( doc, transaction, true ).process();
};

/* Methods */

/**
 * Apply the current annotation stacks. This will set all annotations in this.set and clear all
 * annotations in this.clear on the data between the offsets this.cursor and this.cursor + to
 * 
 * @param {Number} to Offset to stop annotating at. Annotating starts at this.cursor
 */
ve.dm.TransactionProcessor.prototype.applyAnnotations = function( to ) {
	var i, hash, ann;
	for ( i = this.cursor; i < to; i++ ) {
		character = this.document.data[j];
		if ( !ve.isArray( character ) ) {
			ann = {};
			this.document.data[j] = [ this.document.data[j], ann ];
		} else {
			ann = this.document.data[j][1];
			for ( hash in this.set ) {
				ann[hash] = this.set[hash];
			}
		}
		for ( hash in this.clear ) {
			delete ann[hash];
		}
	}
};

/**
 * Execute a retain operation.
 * 
 * This moves the cursor by op.length and applies annotations to the characters that the cursor
 * moved over.
 * 
 * @param {Object} op Operation object:
 *                    length: Number of elements to retain
 */
ve.dm.TransactionProcessor.prototype.retain = function( op ) {
	this.applyAnnotations( this.cursor + op.length, true );
	this.cursor += op.length;
};

/**
 * Execute an annotate operation.
 * 
 * This adds or removes an annotation to this.set or this.clear
 * 
 * @param {Object} op Operation object
 *                    method: 'set' to set an annotation, 'clear' to clear it
 *                    bias: 'start' to start setting or clearing, 'stop' to stop setting or clearing
 *                    annotation: annotation object
 */
ve.dm.TransactionProcessor.prototype.annotate = function( op ) {
	var target, hash;
	if ( op.method === 'set' ) {
		target = this.reversed ? this.clear : this.set;
	} else if ( op.method === 'clear' ) {
		target = this.reversed ? this.set : this.clear;
	} else {
		throw 'Invalid annotation method ' + op.method;
	}
	
	hash = $.toJSON( op.annotation );
	if ( op.bias === 'start' ) {
		target[hash] = op.annotation;
	} else {
		delete target[hash];
	}
	// TODO emit events?
};

/**
 * Execute an attribute operation.
 * 
 * This sets the attribute named op.key on the element at this.cursor to op.to , or unsets it if
 * op.to === undefined . op.from is not checked against the old value, but is used instead of op.to
 * in reverse mode. So if op.from is incorrect, the transaction will commit fine, but won't roll
 * back correctly.
 * 
 * @param {Object} op Operation object
 *                    key: attribute name
 *                    from: old attribute value, or undefined if not previously set
 *                    to: new attribute value, or undefined to unset
 */
ve.dm.TransactionProcessor.prototype.attribute = function( op ) {
	var element = this.model.data[this.cursor];
	if ( element.type === undefined ) {
		throw 'Invalid element error. Can not set attributes on non-element data.';
	}
	var to = this.reversed ? op.from : op.to;
	if ( to === undefined ) {
		// Clear
		if ( element.attributes ) {
			delete element.attributes[op.key];
		}
	} else {
		// Automatically initialize attributes object
		if ( !element.attributes ) {
			element.attributes = {};
		}
		// Set
		element.attributes[op.key] = to;
	}
	// TODO emit events?
};

/**
 * Execute a replace operation.
 * 
 * This replaces one fragment of linear model data with another at this.cursor, figures out how the
 * model tree needs to be synchronized, and queues this in the DocumentSynchronizer.
 * 
 * op.remove isn't checked against the actual data (instead op.remove.length things are removed
 * starting at this.cursor), but it's used instead of op.replacement in reverse mode. So if
 * op.remove is incorrect but of the right length, the transaction will commit fine, but won't roll
 * back correctly.
 *
 * 
 * @param {Object} op Operation object
 *                    remove: Linear model data fragment to remove
 *                    replacement: Linear model data fragment to insert
 */
ve.dm.TransactionProcessor.prototype.replace = function( op ) {
	// TODO
};
