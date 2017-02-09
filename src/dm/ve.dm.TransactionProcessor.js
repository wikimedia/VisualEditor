/*!
 * VisualEditor DataModel TransactionProcessor class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
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
 * @param {boolean} isStaging Transaction is being applied in staging mode
 * @constructor
 */
ve.dm.TransactionProcessor = function VeDmTransactionProcessor( doc, transaction, isStaging ) {
	// Properties
	this.document = doc;
	this.transaction = transaction;
	this.operations = transaction.getOperations();
	this.isStaging = isStaging;
	this.modificationQueue = [];
	this.rollbackQueue = [];
	this.eventQueue = [];
	// Linear model offset that we're currently at. Operations in the transaction are ordered, so
	// the cursor only ever moves forward.
	this.cursor = 0;
	// Adjustment that needs to be added to linear model offsets in the original linear model
	// to get offsets in the half-updated linear model. Arguments to queued modifications all use
	// unadjusted offsets; this is needed to adjust those offsets after other modifications have been
	// made to the linear model that have caused offsets to shift.
	this.adjustment = 0;
	// Set and clear are sets of annotations which should be added or removed to content being
	// inserted or retained.
	this.set = new ve.dm.AnnotationSet( this.document.getStore() );
	this.clear = new ve.dm.AnnotationSet( this.document.getStore() );
	// State tracking for unbalanced replace operations
	this.replaceRemoveLevel = 0;
	this.replaceInsertLevel = 0;
	this.replaceMinInsertLevel = 0;
	this.retainDepth = 0;
	this.replaceSpliceQueue = [];
};

/* Static members */

/* See ve.dm.TransactionProcessor.modifiers */
ve.dm.TransactionProcessor.modifiers = {};

/* See ve.dm.TransactionProcessor.processors */
ve.dm.TransactionProcessor.processors = {};

/* Methods */

/**
 * Execute an operation.
 *
 * @private
 * @param {Object} op Operation object to execute
 * @throws {Error} Operation type is not supported
 */
ve.dm.TransactionProcessor.prototype.executeOperation = function ( op ) {
	if ( Object.prototype.hasOwnProperty.call( ve.dm.TransactionProcessor.processors, op.type ) ) {
		ve.dm.TransactionProcessor.processors[ op.type ].call( this, op );
	} else {
		throw new Error( 'Invalid operation error. Operation type is not supported: ' + op.type );
	}
};

/**
 * Process all operations.
 *
 * When all operations are done being processed, the document will be synchronized.
 *
 * @private
 */
ve.dm.TransactionProcessor.prototype.process = function () {
	var i, completed;

	// First process each operation to gather modifications in the modification queue.
	// If an exception occurs during this stage, we don't need to do anything to recover,
	// because no modifications were made yet.
	for ( i = 0; i < this.operations.length; i++ ) {
		this.executeOperation( this.operations[ i ] );
	}
	if ( this.replaceSpliceQueue.length > 0 ) {
		throw new Error( 'Unbalanced set of replace operations found' );
	}

	// Apply the queued modifications
	try {
		completed = false;
		this.applyModifications();
		completed = true;
	} finally {
		// Don't catch and re-throw errors so that they are reported properly
		if ( !completed ) {
			// Restore the linear model to its original state
			this.rollbackModifications();
			// The tree may have been left in some sort of half-baked state, so rebuild it
			// from scratch
			this.document.rebuildTree();
		}
	}
	// Mark the transaction as committed
	this.transaction.markAsApplied();
	// Emit events in the queue
	this.emitQueuedEvents();
};

/**
 * Queue a modification.
 *
 * @private
 * @param {Object} modification Object describing the modification
 * @param {string} modification.type Name of a method in ve.dm.TransactionProcessor.modifiers
 * @param {Array} [modification.args] Arguments to pass to this method
 * @throws {Error} Unrecognized modification type
 */
ve.dm.TransactionProcessor.prototype.queueModification = function ( modification ) {
	if ( typeof ve.dm.TransactionProcessor.modifiers[ modification.type ] !== 'function' ) {
		throw new Error( 'Unrecognized modification type ' + modification.type );
	}
	this.modificationQueue.push( modification );
};

/**
 * Queue an undo function. If an exception is thrown while modifying, #rollbackModifications will
 * invoke these functions in reverse order.
 *
 * @param {Function} func Undo function to add to the queue
 */
ve.dm.TransactionProcessor.prototype.queueUndoFunction = function ( func ) {
	this.rollbackQueue.push( func );
};

/**
 * Apply all modifications queued through #queueModification, and add their rollback functions
 * to this.rollbackQueue.
 *
 * @private
 */
ve.dm.TransactionProcessor.prototype.applyModifications = function () {
	var i, len, modifier, modifications = this.modificationQueue;
	this.modificationQueue = [];
	for ( i = 0, len = modifications.length; i < len; i++ ) {
		modifier = ve.dm.TransactionProcessor.modifiers[ modifications[ i ].type ];
		modifier.apply( this, modifications[ i ].args || [] );
	}
};

/**
 * Roll back all modifications that have been applied so far. This invokes the callbacks returned
 * by the modifier functions.
 *
 * @private
 */
ve.dm.TransactionProcessor.prototype.rollbackModifications = function () {
	var i, rollbacks = this.rollbackQueue;
	this.rollbackQueue = [];
	for ( i = rollbacks.length - 1; i >= 0; i-- ) {
		rollbacks[ i ]();
	}
};

/**
 * Queue an event to be emitted on a node.
 *
 * Duplicate events will be ignored only if all arguments match exactly (i.e. are reference-equal).
 *
 * @private
 * @param {ve.dm.Node} node
 * @param {string} event Event name
 * @param {...Mixed} [args] Additional arguments to be passed to the event when fired
 */
ve.dm.TransactionProcessor.prototype.queueEvent = function ( node ) {
	var args = Array.prototype.slice.call( arguments, 1 );
	this.eventQueue.push( {
		node: node,
		args: args.concat( this.transaction )
	} );
};

/**
 * Emit all events queued through #queueEvent.
 *
 * @private
 */
ve.dm.TransactionProcessor.prototype.emitQueuedEvents = function () {
	var i, event,
		queue = this.eventQueue;

	function isDuplicate( otherEvent ) {
		return otherEvent.node === event.node &&
			otherEvent.args.every( function ( arg, index ) {
				return arg === event.args[ index ];
			} );
	}

	this.eventQueue = [];
	for ( i = 0; i < queue.length; i++ ) {
		event = queue[ i ];
		// Check if this event is a duplicate of something we've already emitted
		if ( !queue.slice( 0, i ).some( isDuplicate ) ) {
			event.node.emit.apply( event.node, event.args );
		}
	}
};

/**
 * Advance the main data cursor.
 *
 * @private
 * @param {number} increment Number of positions to increment the cursor by
 */
ve.dm.TransactionProcessor.prototype.advanceCursor = function ( increment ) {
	this.cursor += increment;
};

/**
 * Apply the current annotation stacks.
 *
 * This will set all annotations in this.set and clear all annotations in `this.clear` on the data
 * between the offsets `this.cursor` and `this.cursor + to`. Annotations are set at the highest
 * annotation set offset below which annotations are uniform across the whole range.
 *
 * @private
 * @param {number} to Offset to stop annotating at, annotating starts at this.cursor
 * @throws {Error} Cannot annotate a branch element
 * @throws {Error} Annotation to be set is already set
 * @throws {Error} Annotation to be cleared is not set
 */
ve.dm.TransactionProcessor.prototype.applyAnnotations = function ( to ) {
	var annotationsForOffset, setIndex, isElement, annotations, i;

	function setAndClear( anns, set, clear, index ) {
		if ( anns.containsAnyOf( set ) ) {
			throw new Error( 'Invalid transaction, annotation to be set is already set' );
		} else {
			anns.addSet( set, index );
		}
		if ( !anns.containsAllOf( clear ) ) {
			throw new Error( 'Invalid transaction, annotation to be cleared is not set' );
		} else {
			anns.removeSet( clear );
		}
	}

	if ( this.set.isEmpty() && this.clear.isEmpty() ) {
		return;
	}
	// Set/clear annotations on data
	annotationsForOffset = [];
	for ( i = this.cursor; i < to; i++ ) {
		annotationsForOffset[ i - this.cursor ] = this.document.data.getAnnotationsFromOffset( i );
	}
	// Calculate highest offset below which annotations are uniform across the whole range
	setIndex = ve.getCommonStartSequenceLength(
		annotationsForOffset.map( function ( annotations ) {
			return annotations.storeIndexes;
		} )
	);

	for ( i = this.cursor; i < to; i++ ) {
		isElement = this.document.data.isElementData( i );
		if ( isElement ) {
			if ( !ve.dm.nodeFactory.canNodeSerializeAsContent( this.document.data.getType( i ) ) ) {
				throw new Error( 'Invalid transaction, cannot annotate a non-content element' );
			}
			if ( this.document.data.isCloseElementData( i ) ) {
				// Closing content element, ignore
				continue;
			}
		}
		annotations = this.document.data.getAnnotationsFromOffset( i );
		setAndClear( annotations, this.set, this.clear, setIndex );
		// Store annotation indexes in linear model
		this.queueModification( {
			type: 'annotateData',
			args: [ i, annotations ]
		} );
	}
	// Queue a "modification" that emits annotate events
	if ( this.cursor < to ) {
		this.queueModification( {
			type: 'emitAnnotate',
			args: [ new ve.Range( this.cursor, to ) ]
		} );
	}
};

/**
 * Modifier methods.
 *
 * Each method executes a specific type of linear model modification, updates the model tree, and
 * returns a function that undoes the linear model modification, in case we need to recover the
 * previous linear model state. (The returned undo function does not undo the model tree update.)
 * Methods are called in the context of a transaction processor, so they work similar to normal
 * methods on the object.
 *
 * @class ve.dm.TransactionProcessor.modifiers
 * @singleton
 */

/**
 * Splice data into / out of the data array, and synchronize the tree.
 *
 * For efficiency, this function modifies the splice operation objects (i.e. the elements
 * of the splices array). It also relies on these objects not being modified by others later.
 *
 * @param {Object[]} splices Array of splice operations to execute. Properties:
 *  {number} splices[].offset Offset to remove/insert at (unadjusted)
 *  {number} splices[].removeLength Number of elements to remove
 *  {Array} splices[].insert Data to insert; for efficiency, objects are inserted without cloning
 * @param {number} splitAncestorLevel How many levels of ancestors were split (closed by inserted data)
 *  For example, if inserting `</p><p>` splitAncestorLevel=1, and if inserting `</p></li></ul><ul><li><p>`
 *  splitAncestorLevel=3
 */
ve.dm.TransactionProcessor.modifiers.splice = function ( splices, splitAncestorLevel ) {
	var i, s, selection, node, parent, textNode, splitAncestor, index, numNodes,
		startOffset, newLength,
		lengthDiff = 0,
		data = this.document.data,
		dataSplices = [],
		syncCompleted = false;

	// We're about to do lots of things that can go wrong, so queue an undo function now
	// that undoes all splices that we got to
	this.queueUndoFunction( function () {
		var i, s;
		for ( i = splices.length - 1; i >= 0; i-- ) {
			s = splices[ i ];
			if ( s.removedData !== undefined ) {
				data.batchSplice( s.offset, s.insert.length, s.removedData );
			}
		}
	} );

	// Apply splices to the linmod and record how to undo them
	for ( i = 0; i < splices.length; i++ ) {
		s = splices[ i ];

		// Adjust s.offset for previous modifications that have already been synced to the tree;
		// this value is used by the tree sync code later.
		s.treeOffset = s.offset + this.adjustment;
		// Also adjust s.offset for previous iterations of this loop (i.e. unsynced modifications);
		// this is the value we need for the actual array splice.
		s.offset = s.treeOffset + lengthDiff;

		// Perform the splice and put the removed data in s, for the undo function
		s.removedData = data.batchSplice( s.offset, s.removeLength, s.insert );
		lengthDiff += s.insert.length - s.removeLength;
		dataSplices.push( s );
	}
	this.adjustment += lengthDiff;

	// Synchronize the tree. There are three cases:
	// - If the splice only deleted and inserted text, find the text node and resize it
	// - If the splice only inserted text in a place where a text node doesn't currently exist, create one
	// - Otherwise, rebuild the affected nodes
	// Because in the first two cases the removal and insertion only contain text, those cases can only arise
	// when there is only one data splice (because a multi-splice only happens if the first splice
	// is unbalanced, which means it must remove/insert openings/closings).
	if (
		// There is only one data splice
		dataSplices.length === 1 &&
		// The data it removes does not contain openings/closings
		!new ve.dm.FlatLinearData(
				this.document.getStore(),
				dataSplices[ 0 ].removedData
			).containsElementData() &&
		// The data it inserts does not contain openings/closings
		!new ve.dm.FlatLinearData(
				this.document.getStore(),
				dataSplices[ 0 ].insert
			).containsElementData()
	) {
		selection = this.document.selectNodes(
			new ve.Range(
				dataSplices[ 0 ].treeOffset,
				dataSplices[ 0 ].treeOffset + dataSplices[ 0 ].removeLength
			),
			'leaves'
		);
		if ( selection.length === 1 ) {
			node = selection[ 0 ].node;
			if ( node && node.getType() === 'text' ) {
				// Resize the text node
				parent = node.getParent();
				if ( parent && node.getLength() + lengthDiff === 0 ) {
					// Automatically delete empty text nodes
					parent.splice( parent.indexOf( node ), 1 );
				} else {
					node.adjustLength( lengthDiff );
				}
				syncCompleted = true;
			} else if (
				// Pure insertion
				dataSplices[ 0 ].insert.length > 0 &&
				dataSplices[ 0 ].removeLength === 0 &&
				// at a structural offset in a ContentBranchNode
				node && node.canContainContent() &&
				( selection[ 0 ].indexInNode !== undefined || node.getLength() === 0 )
			) {
				// Insert a new text node
				textNode = new ve.dm.TextNode();
				textNode.setLength( dataSplices[ 0 ].insert.length );
				node.splice( selection[ 0 ].indexInNode || 0, 0, textNode );
				syncCompleted = true;
			}
		}
	}

	if ( !syncCompleted && dataSplices.length > 0 ) {
		// None of the special cases triggered, so we need to do a rebuild
		if ( splitAncestorLevel > 0 ) {
			// The insertion closes a pre-existing node. Find that node so we can ensure it gets rebuilt.
			splitAncestor = this.document.getBranchNodeFromOffset( dataSplices[ 0 ].treeOffset );
			// splitAncestor is now set to the node containing the insertion point.
			// If splitAncestorLevel=1, then this is the node we need to rebuild;
			// if splitAncestorLevel > 1 then we need to ascend splitAncestorLevel-1 times.
			for ( i = 0; i < splitAncestorLevel - 1; i++ ) {
				splitAncestor = splitAncestor.getParent() || splitAncestor;
			}
		}

		// To determine which nodes to rebuild, we select the covering range of the splice
		// (from the start of the first splice to the end of the last splice) in the tree,
		// get the set of siblings containing this range, and rebuild those siblings.
		// However, if we have a splitAncestor, we also need to ensure it gets rebuilt. To do that,
		// we move the start of the range back to right before the opening of splitAncestor, which
		// ensures that the first returned sibling will be splitAncestor or one of its ancestors.
		// We know this won't move the start forwards because splitAncestor was identified using
		// getBranchNodeFromOffset( dataSplices[ 0 ].treeOffset ), and splitAncestor.getOffset() + 1
		// is the lowest value of x such that getBranchNodeFromOffset( x ) returns splitAncestor, so
		// splitAncestor.getOffset() + 1 <= dataSplices[ 0 ].treeOffset,
		// so splitAncestor.getOffset() < dataSplices[ 0 ].treeOffset
		selection = this.document.selectNodes(
			new ve.Range(
				splitAncestor ? splitAncestor.getOffset() : dataSplices[ 0 ].treeOffset,
				dataSplices[ dataSplices.length - 1 ].treeOffset + dataSplices[ dataSplices.length - 1 ].removeLength
			),
			'siblings'
		);

		node = selection[ 0 ].node;
		if ( selection[ 0 ].indexInNode !== undefined || !node.getParent() ) {
			// If indexInNode is set, this is a pure insertion in a structural position in node
			parent = node;
			// If we are inserting into an empty document, node will be the root node
			// but indexInNode won't be set due to a bug in selectNodes(), so use 0 in that case.
			index = selection[ 0 ].indexInNode || 0;
			numNodes = 0;
			startOffset = selection[ 0 ].range.start;
			// If indexInNode is set or node is the root, then the input range must have been zero-length,
			// so selection.length must be 1 and selection[ 0 ].range.end must equal startOffset.
			// This means selection[ selection.length - 1 ].range.end - startOffset + lengthDiff
			// is really just lengthDiff
			newLength = lengthDiff;
		} else {
			// Otherwise, this is a rebuild of a set of siblings
			parent = node.getParent();
			index = selection[ 0 ].index; // === node.getParent().indexOf( node )
			numNodes = selection.length;
			startOffset = selection[ 0 ].nodeOuterRange.start;
			newLength = selection[ selection.length - 1 ].nodeOuterRange.end - startOffset + lengthDiff;
		}

		this.document.rebuildNodes( parent, index, numNodes, startOffset, newLength );
	}
};

/**
 * Set annotations at a given data offset.
 *
 * @param {number} offset Offset in data array (unadjusted)
 * @param {ve.dm.AnnotationSet} annotations New set of annotations; overwrites old set
 */
ve.dm.TransactionProcessor.modifiers.annotateData = function ( offset, annotations ) {
	var oldAnnotations,
		data = this.document.data;
	offset += this.adjustment;

	data.setAnnotationsAtOffset( offset, annotations );

	oldAnnotations = data.getAnnotationsFromOffset( offset );
	this.queueUndoFunction( function () {
		data.setAnnotationsAtOffset( offset, oldAnnotations );
	} );
};

/**
 * Emit annotate and update events on all leaf nodes in the given range.
 *
 * @param {ve.Range} range Range that was annotated (unadjusted)
 */
ve.dm.TransactionProcessor.modifiers.emitAnnotate = function ( range ) {
	var i, selection;
	range = range.translate( this.adjustment );

	selection = this.document.selectNodes( range, 'leaves' );
	for ( i = 0; i < selection.length; i++ ) {
		this.queueEvent( selection[ i ].node, 'annotation' );
		this.queueEvent( selection[ i ].node, 'update', this.isStaging );
	}
};

/**
 * Set an attribute at a given offset.
 *
 * @param {number} offset Offset in data array (unadjusted)
 * @param {string} key Attribute name
 * @param {Mixed} value New attribute value
 */
ve.dm.TransactionProcessor.modifiers.setAttribute = function ( offset, key, value ) {
	var item, oldValue, node,
		data = this.document.data;
	offset += this.adjustment;

	item = data.getData( offset );
	oldValue = item.attributes && item.attributes[ key ];
	data.setAttributeAtOffset( offset, key, value );
	this.queueUndoFunction( function () {
		data.setAttributeAtOffset( offset, key, oldValue );
	} );

	node = this.document.getDocumentNode().getNodeFromOffset( offset + 1 );
	this.queueEvent( node, 'attributeChange', key, oldValue, value );
	this.queueEvent( node, 'update', this.isStaging );
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
	var i, type, retainedData;
	if ( this.replaceSpliceQueue.length > 0 ) {
		// Track the depth of retained data when in the middle of an unbalanced replace
		retainedData = this.document.getData( new ve.Range( this.cursor, this.cursor + op.length ) );
		for ( i = 0; i < retainedData.length; i++ ) {
			type = retainedData[ i ].type;
			if ( type !== undefined ) {
				this.retainDepth += type.charAt( 0 ) === '/' ? -1 : 1;
			}
		}
	}
	this.applyAnnotations( this.cursor + op.length );
	this.advanceCursor( op.length );
};

/**
 * Execute an annotate operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This will add an annotation to or remove an annotation from `this.set` or `this.clear`.
 * This will then cause those annotations to be set or cleared from text and elements
 * when a retain passes over them.
 *
 * @method
 * @param {Object} op Operation object
 * @param {string} op.method Annotation method, either 'set' to add or 'clear' to remove
 * @param {string} op.bias End point of marker, either 'start' to begin or 'stop' to end
 * @param {string} op.annotation Annotation object to set or clear from content
 * @throws {Error} Invalid annotation method
 */
ve.dm.TransactionProcessor.processors.annotate = function ( op ) {
	var target, annotation;
	if ( op.method === 'set' ) {
		target = this.set;
	} else if ( op.method === 'clear' ) {
		target = this.clear;
	} else {
		throw new Error( 'Invalid annotation method ' + op.method );
	}
	annotation = this.document.getStore().value( op.index );
	if ( !annotation ) {
		throw new Error( 'No annotation stored for ' + op.index );
	}
	if ( op.bias === 'start' ) {
		target.push( annotation );
	} else {
		target.remove( annotation );
	}
	// Actual changes are done by applyAnnotations() called from the retain processor
};

/**
 * Execute an attribute operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This sets the attribute named `op.key` on the element at `this.cursor` to `op.to`, or unsets it if
 * `op.to === undefined`. `op.from` is not checked against the old value, but is used instead of `op.to`
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
		type: 'setAttribute',
		args: [ this.cursor, op.key, op.to ]
	} );
};

/**
 * Execute a replace operation.
 *
 * This method is called within the context of a transaction processor instance.
 *
 * This replaces a range of linear model data with another at this.cursor, and either queues up
 * splice modifications for this immediately, or stores these modification in a buffer until
 * a later replace operation restores nesting balance, at which point all buffered splices
 * are added to the queue as one big multi-splice modification.
 *
 * Counting from the start of a replacement, nesting balance is considered lost when there is a
 * non-zero net nesting change (i.e. open tag count minus close tag count) in either inserted data
 * or removed data; for instance `[+<p>+][-<h1>-]` causes nesting balance to be lost. Nesting
 * balance is then considered restored when the cumulative nesting change returns to zero for all
 * of: inserted data, removed data, and retained data. For instance,
 * `[+<div>+]<ul><li><div><p>foo</p>[+</div>+]<p>bar</p>[+<div>+]<p>baz</p></div></li></ul>[+</div>+]`
 * is a minimal operation sequence causing a loss then restoration of nesting balance. For most
 * plausible operation sequences, this criterion is sufficient to ensure that the multi-splice
 * modification as a whole preserves tree validity of the linear model data; however, for certain
 * sequences such as `<p>foo[+</p><h1>+]bar[+</h1><p>+]baz</p>` it is not sufficient.
 *
 * op.remove isn't checked against the actual data (instead, op.remove.length things are removed
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
	var i, type;

	// It's possible that multiple replace operations are needed before the
	// model is back in a consistent state. In this case, we want to enqueue
	// a single multi-splice modification that applies all these replacements
	// at once, so that the code executing that modification has enough information
	// to synchronize the tree. We perform this grouping by buffering unbalanced
	// replacements in this.replaceSpliceQueue until we encounter a balancing replace,
	// at which point we flush this buffer.

	// Walk through the remove and insert data
	// and keep track of the element depth change (level)
	// for each of these two separately. The model is
	// only consistent if both levels are zero.
	for ( i = 0; i < op.remove.length; i++ ) {
		type = op.remove[ i ].type;
		if ( type !== undefined ) {
			if ( type.charAt( 0 ) === '/' ) {
				// Closing element
				this.replaceRemoveLevel--;
			} else {
				// Opening element
				this.replaceRemoveLevel++;
			}
		}
	}
	for ( i = 0; i < op.insert.length; i++ ) {
		type = op.insert[ i ].type;
		if ( type !== undefined ) {
			if ( type.charAt( 0 ) === '/' ) {
				// Closing element
				this.replaceInsertLevel--;
				// Keep track of the lowest (most negative) insert level
				if ( this.replaceInsertLevel < this.replaceMinInsertLevel ) {
					this.replaceMinInsertLevel = this.replaceInsertLevel;
				}
			} else {
				// Opening element
				this.replaceInsertLevel++;
			}
		}
	}
	// Queue up splice operations
	this.replaceSpliceQueue.push( {
		type: 'data',
		offset: this.cursor,
		removeLength: op.remove.length,
		insert: op.insert
	} );

	this.advanceCursor( op.remove.length );

	if ( this.replaceRemoveLevel === 0 && this.replaceInsertLevel === 0 && this.retainDepth === 0 ) {
		// Things are balanced again, flush the queue
		this.queueModification( {
			type: 'splice',
			args: [ this.replaceSpliceQueue, -this.replaceMinInsertLevel ]
		} );
		this.replaceSpliceQueue = [];
		this.replaceMinInsertLevel = 0;
	}
};
