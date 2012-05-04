/**
 * DataModel transaction processor.
 * 
 * This class reads operations from a transaction and applies them one by one. It's not intended
 * to be used directly; use the static functions ve.dm.TransactionProcessor.commit() and .rollback()
 * instead.
 * 
 * NOTE: Instances of this class are not recyclable: you can only call .process() on them once.
 * 
 * @class
 * @constructor
 */
ve.dm.TransactionProcessor = function( doc, transaction, reversed ) {
	this.document = doc;
	this.operations = transaction.getOperations();
	// TODO add DocumentSynchronizer
	this.synchronizer = new ve.dm.DocumentSynchronizer( this.model );
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

ve.dm.TransactionProcessor.prototype.nextOperation = function() {
	return this.operations[this.operationIndex++] || false;
};

ve.dm.TransactionProcessor.prototype.executeOperation = function( op ) {
	if ( op.type in this ) {
		this[op.type]( op );
	} else {
		throw 'Invalid operation error. Operation type is not supported: ' + operation.type;
	}
};

ve.dm.TransactionProcessor.prototype.process = function() {
	var op;
	// This loop is factored this way to allow operations to be skipped over or executed
	// from within other operations
	this.operationIndex = 0;
	while ( ( op = this.nextOperation() ) ) {
		this.executeOperation( op );
	}
	// TODO add DocumentSynchronizer
	//this.synchronizer.synchronize();
};

/**
 * Apply the current annotation stacks. This will set all annotations in this.set and clear all
 * annotations in this.clear on the data between the offsets this.cursor and this.cursor + to
 * 
 * @param {Number} to Offset to stop annotating at. Annotating starts at this.cursor
 */
ve.dm.TransactionProcessor.prototype.applyAnnotations = function( to ) {
	var i, hash, ann, character, changed = false;
	for ( i = this.cursor; i < to; i++ ) {
		character = this.document.data[i];
		if ( character.type !== undefined ) {
			// Not a character but an element, skip
			continue;
		}
		ann = ve.isArray( character ) ? character[1] : null;
		
		for ( hash in this.set ) {
			if ( ann === null ) {
				// Create annotations object
				ann = {};
				this.document.data[i] = [ character, ann ];
			}
			ann[hash] = this.set[hash];
		}
		if ( ann !== null ) {
			for ( hash in this.clear ) {
				delete ann[hash];
			}
			if ( $.isEmptyObject( ann ) ) {
				// Clean up empty annotations object
				this.document.data[i] = character[0];
			}
		}
	}
	
	this.synchronizer.pushAnnotation( new ve.Range( this.cursor, to ) );
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
	this.applyAnnotations( this.cursor + op.length );
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
	
	// Tree sync is done by applyAnnotations()
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
	var element = this.document.data[this.cursor];
	if ( element.type === undefined ) {
		throw 'Invalid element error. Can not set attributes on non-element data.';
	}
	var to = this.reversed ? op.from : op.to;
	var from = this.reversed ? op.to : op.from;
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
	
	this.synchronizer.pushAttributeChange( this.document.getNodeFromOffset( this.cursor + 1 ),
		op.key, from, to );
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
	var	remove = this.reversed ? op.replacement : op.remove,
		replacement = this.reversed ? op.remove : op.replacement,
		removeHasStructure = ve.dm.Document.containsElementData( remove ),
		replacementHasStructure = ve.dm.Document.containsElementData( replacement ),
		node;
	// Figure out if this is a structural replacement or a content replacement
	if ( !removeHasStructure && !replacementHasStructure ) {
		// Content replacement
		// Update the linear model
		ve.batchSplice( this.document.data, this.cursor, remove.length, replacement );
		this.applyAnnotations( this.cursor + replacement.length );
		
		// Get the node containing the replaced content
		node = this.document.getNodeFromOffset( this.cursor );
		// Queue a resize for this node
		this.synchronizer.pushResize( node, replacement.length - remove.length );
		// Advance the cursor
		this.cursor += replacement.length;
	} else {
		// Structural replacement
		// TODO implement
	}
};
