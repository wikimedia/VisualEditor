/*!
 * VisualEditor DataModel TransactionProcessor class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DataModel transaction processor.
 *
 * This class reads operations from a transaction and applies them one by one. It's not intended
 * to be used directly; use {ve.dm.Document#commit} instead.
 *
 * NOTE: Instances of this class are not recyclable: you can only call .process() on them once.
 *
 * @class
 * @param {ve.dm.Document} doc Document
 * @param {ve.dm.Transaction} transaction Transaction
 * @constructor
 */
ve.dm.TransactionProcessor = function VeDmTransactionProcessor( doc, transaction ) {
	// Properties
	this.document = doc;
	this.transaction = transaction;
	this.operations = transaction.getOperations();
	this.modificationQueue = [];
	this.synchronizer = new ve.dm.DocumentSynchronizer( doc, transaction );
	// Linear model offset that we're currently at. Operations in the transaction are ordered, so
	// the cursor only ever moves forward.
	this.cursor = 0;
	this.metadataCursor = 0;
	// Adjustment that needs to be added to linear model offsets in the original linear model
	// to get offsets in the half-updated linear model. This is needed when queueing modifications
	// after other modifications that will cause offsets to shift.
	this.adjustment = 0;
	// Set and clear are sets of annotations which should be added or removed to content being
	// inserted or retained.
	this.set = new ve.dm.AnnotationSet( this.document.getStore() );
	this.clear = new ve.dm.AnnotationSet( this.document.getStore() );
};

/* Static members */

/* See ve.dm.TransactionProcessor.processors */
ve.dm.TransactionProcessor.processors = {};

/* Methods */

/**
 * Get the next operation.
 *
 * @method
 */
ve.dm.TransactionProcessor.prototype.nextOperation = function () {
	return this.operations[this.operationIndex++] || false;
};

/**
 * Execute an operation.
 *
 * @method
 * @param {Object} op Operation object to execute
 * @throws {Error} Operation type is not supported
 */
ve.dm.TransactionProcessor.prototype.executeOperation = function ( op ) {
	if ( Object.prototype.hasOwnProperty.call( ve.dm.TransactionProcessor.processors, op.type ) ) {
		ve.dm.TransactionProcessor.processors[op.type].call( this, op );
	} else {
		throw new Error( 'Invalid operation error. Operation type is not supported: ' + op.type );
	}
};

/**
 * Process all operations.
 *
 * When all operations are done being processed, the document will be synchronized.
 *
 * @method
 * @param {Function} [presynchronizeHandler] Callback to emit before synchronizing
 */
ve.dm.TransactionProcessor.prototype.process = function ( presynchronizeHandler ) {
	var op;
	// This loop is factored this way to allow operations to be skipped over or executed
	// from within other operations
	this.operationIndex = 0;
	while ( ( op = this.nextOperation() ) ) {
		this.executeOperation( op );
	}
	this.applyModifications();
	if ( presynchronizeHandler ) {
		presynchronizeHandler();
	}
	this.synchronizer.synchronize( this.transaction );

	// Mark the transaction as committed or rolled back, as appropriate
	this.transaction.markAsApplied();
};

/**
 * Queue a modification.
 *
 * For available method names, see ve.dm.ElementLinearData and ve.dm.MetaLinearData.
 *
 * @param {Object} modification Object describing the modification
 * @param {string} modification.type 'data' or 'metadata'
 * @param {string} modification.method Method name to call on this.document.data or this.document.metadata
 * @param {Array} [modification.args] Arguments to pass to this method
 * @throws {Error} Unrecognized modification type
 * @throws {Error} Unrecognized modification method
 */
ve.dm.TransactionProcessor.prototype.queueModification = function ( modification ) {
	if ( modification.type !== 'data' && modification.type !== 'metadata' ) {
		throw new Error( 'Unrecognized modification type ' + modification.type );
	}
	if ( typeof this.document[modification.type][modification.method] !== 'function' ) {
		throw new Error( 'Unrecognized modification method ' + modification.method );
	}
	this.modificationQueue.push( modification );
};

/**
 * Apply all modifications queued through #queueModification.
 */
ve.dm.TransactionProcessor.prototype.applyModifications = function () {
	var i, len, dataObj, modifications = this.modificationQueue;
	this.modificationQueue = [];
	for ( i = 0, len = modifications.length; i < len; i++ ) {
		dataObj = this.document[modifications[i].type];
		dataObj[modifications[i].method].apply( dataObj, modifications[i].args || [] );
	}
};

/**
 * Advance the main data cursor.
 *
 * @method
 * @param {number} increment Number of positions to increment the cursor by
 */
ve.dm.TransactionProcessor.prototype.advanceCursor = function ( increment ) {
	this.cursor += increment;
	this.metadataCursor = 0;
};

/**
 * Apply the current annotation stacks.
 *
 * This will set all annotations in this.set and clear all annotations in `this.clear` on the data
 * between the offsets `this.cursor` and `this.cursor + to`.
 *
 * @method
 * @param {number} to Offset to stop annotating at, annotating starts at this.cursor
 * @throws {Error} Cannot annotate a branch element
 * @throws {Error} Annotation to be set is already set
 * @throws {Error} Annotation to be cleared is not set
 */
ve.dm.TransactionProcessor.prototype.applyAnnotations = function ( to ) {
	function setAndClear( anns, set, clear ) {
		if ( anns.containsAnyOf( set ) ) {
			throw new Error( 'Invalid transaction, annotation to be set is already set' );
		} else {
			anns.addSet( set );
		}
		if ( !anns.containsAllOf( clear ) ) {
			throw new Error( 'Invalid transaction, annotation to be cleared is not set' );
		} else {
			anns.removeSet( clear );
		}
	}

	var isElement, annotations, i, j, jlen;
	if ( this.set.isEmpty() && this.clear.isEmpty() ) {
		return;
	}
	// Set/clear annotations on data
	for ( i = this.cursor; i < to; i++ ) {
		isElement = this.document.data.isElementData( i );
		if ( isElement ) {
			if ( !ve.dm.nodeFactory.isNodeContent( this.document.data.getType( i ) ) ) {
				throw new Error( 'Invalid transaction, cannot annotate a non-content element' );
			}
			if ( this.document.data.isCloseElementData( i ) ) {
				// Closing content element, ignore
				continue;
			}
		}
		annotations = this.document.data.getAnnotationsFromOffset( i );
		setAndClear( annotations, this.set, this.clear );
		// Store annotation indexes in linear model
		this.queueModification( {
			type: 'data',
			method: 'setAnnotationsAtOffset',
			args: [ i + this.adjustment, annotations ]
		} );
	}
	// Set/clear annotations on metadata, but not on the edges of the range
	for ( i = this.cursor + 1; i < to; i++ ) {
		for ( j = 0, jlen = this.document.metadata.getDataLength( i ); j < jlen; j++ ) {
			annotations = this.document.metadata.getAnnotationsFromOffsetAndIndex( i, j );
			setAndClear( annotations, this.set, this.clear );
			this.queueModification( {
				type: 'metadata',
				method: 'setAnnotationsAtOffsetAndIndex',
				args: [ i + this.adjustment, j, annotations ]
			} );
		}
	}
	// Notify the synchronizer
	if ( this.cursor < to ) {
		this.synchronizer.pushAnnotation( new ve.Range( this.cursor + this.adjustment, to + this.adjustment ) );
	}
};

/**
 * Processing methods.
 *
 * Each method is specific to a type of action. Methods are called in the context of a transaction
 * processor, so they work similar to normal methods on the object.
 *
 * @class ve.dm.TransactionProcessor.processors
 * @singleton
 */

/**
 * Execute a retain operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This moves the cursor by op.length and applies annotations to the characters that the cursor
 * moved over.
 *
 * @method
 * @param {Object} op Operation object:
 * @param {number} op.length Number of elements to retain
 */
ve.dm.TransactionProcessor.processors.retain = function ( op ) {
	this.applyAnnotations( this.cursor + op.length );
	this.advanceCursor( op.length );
};

/**
 * Execute a metadata retain operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This moves the metadata cursor by op.length.
 *
 * @method
 * @param {Object} op Operation object:
 * @param {number} op.length Number of elements to retain
 */
ve.dm.TransactionProcessor.processors.retainMetadata = function ( op ) {
	this.metadataCursor += op.length;
};

/**
 * Execute an annotate operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This will add an annotation to or remove an annotation from `this.set` or `this.clear`.
 *
 * @method
 * @param {Object} op Operation object
 * @param {string} op.method Annotation method, either 'set' to add or 'clear' to remove
 * @param {string} op.bias End point of marker, either 'start' to begin or 'stop' to end
 * @param {string} op.annotation Annotation object to set or clear from content
 * @throws {Error} Invalid annotation method
 */
ve.dm.TransactionProcessor.processors.annotate = function ( op ) {
	var target;
	if ( op.method === 'set' ) {
		target = this.set;
	} else if ( op.method === 'clear' ) {
		target = this.clear;
	} else {
		throw new Error( 'Invalid annotation method ' + op.method );
	}
	if ( op.bias === 'start' ) {
		target.push( op.annotation );
	} else {
		target.remove( op.annotation );
	}
	// Tree sync is done by applyAnnotations()
};

/**
 * Execute an attribute operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This sets the attribute named `op.key` on the element at `this.cursor` to `op.to`, or unsets it if
 * `op.to === undefined`. `op.from `is not checked against the old value, but is used instead of `op.to`
 * in reverse mode. So if `op.from` is incorrect, the transaction will commit fine, but won't roll
 * back correctly.
 *
 * @method
 * @param {Object} op Operation object
 * @param {string} op.key Attribute name
 * @param {Mixed} op.from Old attribute value, or undefined if not previously set
 * @param {Mixed} op.to New attribute value, or undefined to unset
 */
ve.dm.TransactionProcessor.processors.attribute = function ( op ) {
	if ( !this.document.data.isElementData( this.cursor ) ) {
		throw new Error( 'Invalid element error, cannot set attributes on non-element data' );
	}
	this.queueModification( {
		type: 'data',
		method: 'setAttributeAtOffset',
		args: [ this.cursor + this.adjustment, op.key, op.to ]
	} );

	this.synchronizer.pushAttributeChange(
		this.document.getDocumentNode().getNodeFromOffset( this.cursor + 1 ),
		op.key,
		op.from,
		op.to
	);
};

/**
 * Execute a replace operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This replaces a range of linear model data with another at this.cursor, figures out how the model
 * tree needs to be synchronized, and queues this in the DocumentSynchronizer.
 *
 * op.remove isn't checked against the actual data (instead op.remove.length things are removed
 * starting at this.cursor), but it's used instead of op.insert in reverse mode. So if
 * op.remove is incorrect but of the right length, the transaction will commit fine, but won't roll
 * back correctly.
 *
 * @method
 * @param {Object} op Operation object
 * @param {Array} op.remove Linear model data to remove
 * @param {Array} op.insert Linear model data to insert
 */
ve.dm.TransactionProcessor.processors.replace = function ( op ) {
	var node, selection, range,
		remove = op.remove,
		insert = op.insert,
		removeMetadata = op.removeMetadata,
		insertMetadata = op.insertMetadata,
		removeLinearData = new ve.dm.ElementLinearData( this.document.getStore(), remove ),
		insertLinearData = new ve.dm.ElementLinearData( this.document.getStore(), insert ),
		removeIsContent = removeLinearData.isContentData(),
		insertIsContent = insertLinearData.isContentData(),
		removeHasStructure = removeLinearData.containsElementData(),
		insertHasStructure = insertLinearData.containsElementData(),
		operation = op,
		removeLevel = 0,
		insertLevel = 0,
		i,
		type,
		prevCursor,
		affectedRanges = [],
		scope,
		minInsertLevel = 0,
		coveringRange,
		scopeStart,
		scopeEnd,
		opAdjustment = 0,
		opRemove, opInsert, opRemoveMetadata, opInsertMetadata;
	if ( removeIsContent && insertIsContent ) {
		// Content replacement
		// Update the linear model
		this.queueModification( {
			type: 'data',
			method: 'batchSplice',
			args: [ this.cursor + this.adjustment, remove.length, insert ]
		} );
		// Keep the meta linear model in sync
		if ( removeMetadata !== undefined ) {
			this.queueModification( {
				type: 'metadata',
				method: 'batchSplice',
				args: [ this.cursor + this.adjustment, removeMetadata.length, insertMetadata ]
			} );
		} else {
			this.queueModification( {
				type: 'metadata',
				method: 'batchSplice',
				args: [ this.cursor + this.adjustment, remove.length, new Array( insert.length ) ]
			} );
		}
		// Get the node containing the replaced content
		selection = this.document.selectNodes(
			new ve.Range(
				this.cursor,
				this.cursor + remove.length
			),
			'leaves'
		);
		node = selection[0].node;
		if (
			!removeHasStructure && !insertHasStructure &&
			selection.length === 1 &&
			node && node.getType() === 'text'
		) {
			// Text-only replacement
			// Queue a resize for the text node
			this.synchronizer.pushResize( node, insert.length - remove.length );
		} else if (
			!removeHasStructure && !insertHasStructure && remove.length === 0 && insert.length > 0 &&
			selection.length === 1 && node && node.canContainContent() &&
			( selection[0].indexInNode !== undefined || node.getLength() === 0 )
		) {
			// Text-only addition where a text node didn't exist before. Create one
			this.synchronizer.pushInsertTextNode( node, selection[0].indexInNode || 0, insert.length - remove.length );
		} else {
			// Replacement is not exclusively text
			// Rebuild all covered nodes
			range = new ve.Range(
				selection[0].nodeOuterRange.start,
				selection[selection.length - 1].nodeOuterRange.end
			);
			this.synchronizer.pushRebuild( range,
				new ve.Range( range.start + this.adjustment,
					range.end + this.adjustment + insert.length - remove.length )
			);
		}

		// Advance the cursor
		this.advanceCursor( remove.length );
		this.adjustment += insert.length - remove.length;
	} else {
		// Structural replacement
		// It's possible that multiple replace operations are needed before the
		// model is back in a consistent state. This loop applies the current
		// replace operation to the linear model, then keeps applying subsequent
		// operations until the model is consistent. We keep track of the changes
		// and queue a single rebuild after the loop finishes.
		while ( true ) {
			if ( operation.type === 'replace' ) {
				opRemove = operation.remove;
				opInsert = operation.insert;
				opRemoveMetadata = operation.removeMetadata;
				opInsertMetadata = operation.insertMetadata;
				// Update the linear model
				this.queueModification( {
					type: 'data',
					method: 'batchSplice',
					args: [ this.cursor + this.adjustment, opRemove.length, opInsert ]
				} );
				// Keep the meta linear model in sync
				if ( opRemoveMetadata !== undefined ) {
					this.queueModification( {
						type: 'metadata',
						method: 'batchSplice',
						args: [ this.cursor + this.adjustment, opRemoveMetadata.length, opInsertMetadata ]
					} );
				} else {
					this.queueModification( {
						type: 'metadata',
						method: 'batchSplice',
						args: [ this.cursor + this.adjustment, opRemove.length, new Array( opInsert.length ) ]
					} );
				}
				affectedRanges.push( new ve.Range(
					this.cursor,
					this.cursor + opRemove.length
				) );
				prevCursor = this.cursor;
				this.advanceCursor( opRemove.length );

				// Paint the removed selection, figure out which nodes were
				// covered, and add their ranges to the affected ranges list
				if ( opRemove.length > 0 ) {
					selection = this.document.selectNodes( new ve.Range(
						prevCursor,
						prevCursor + opRemove.length
					), 'siblings' );
					for ( i = 0; i < selection.length; i++ ) {
						affectedRanges.push( selection[i].nodeOuterRange );
					}
				}
				// Walk through the remove and insert data
				// and keep track of the element depth change (level)
				// for each of these two separately. The model is
				// only consistent if both levels are zero.
				for ( i = 0; i < opRemove.length; i++ ) {
					type = opRemove[i].type;
					if ( type !== undefined ) {
						if ( type.charAt( 0 ) === '/' ) {
							// Closing element
							removeLevel--;
						} else {
							// Opening element
							removeLevel++;
						}
					}
				}
				// Keep track of the scope of the insertion
				// Normally this is the node we're inserting into, except if the
				// insertion closes elements it doesn't open (i.e. splits elements),
				// in which case it's the affected ancestor
				for ( i = 0; i < opInsert.length; i++ ) {
					type = opInsert[i].type;
					if ( type !== undefined ) {
						if ( type.charAt( 0 ) === '/' ) {
							// Closing element
							insertLevel--;
							if ( insertLevel < minInsertLevel ) {
								// Closing an unopened element at a higher
								// (more negative) level than before
								// Lazy-initialize scope
								scope = scope || this.document.getBranchNodeFromOffset( prevCursor );
								// Push the full range of the old scope as an affected range
								scopeStart = scope.getOffset();
								scopeEnd = scopeStart + scope.getOuterLength();
								affectedRanges.push( new ve.Range( scopeStart, scopeEnd ) );
								// Update scope
								scope = scope.getParent() || scope;
								minInsertLevel--;
							}
						} else {
							// Opening element
							insertLevel++;
						}
					}
				}
				// Update adjustment
				this.adjustment += opInsert.length - opRemove.length;
				opAdjustment += opInsert.length - opRemove.length;
			} else {
				// We know that other operations won't cause adjustments, so we
				// don't have to update adjustment
				this.executeOperation( operation );
			}
			if ( removeLevel === 0 && insertLevel === 0 ) {
				// The model is back in a consistent state, so we're done
				break;
			}
			// Get the next operation
			operation = this.nextOperation();
			if ( !operation ) {
				throw new Error( 'Unbalanced set of replace operations found' );
			}
		}

		// From all the affected ranges we have gathered, compute a range that covers all
		// of them, and rebuild that
		coveringRange = ve.Range.static.newCoveringRange( affectedRanges );
		this.synchronizer.pushRebuild(
			coveringRange,
			new ve.Range(
				coveringRange.start + this.adjustment - opAdjustment,
				coveringRange.end + this.adjustment
			)
		);
	}
};

/**
 * Execute a metadata replace operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * @method
 * @param {Object} op Operation object
 * @param {Array} op.remove Metadata to remove
 * @param {Array} op.insert Metadata to insert
 */
ve.dm.TransactionProcessor.processors.replaceMetadata = function ( op ) {
	this.queueModification( {
		type: 'metadata',
		method: 'spliceMetadataAtOffset',
		args: [ this.cursor + this.adjustment, this.metadataCursor, op.remove.length, op.insert ]
	} );
	this.metadataCursor += op.insert.length;
};
