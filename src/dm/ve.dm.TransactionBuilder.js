/*!
 * VisualEditor DataModel Transaction builder class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Transaction builder: build transactions based on current ve.dm.Document state
 *
 * @class
 * @constructor
 */
ve.dm.TransactionBuilder = function VeDmTransactionBuilder() {
	// TODO: rewrite to store the current ve.dm.Document as a property
	this.transaction = new ve.dm.Transaction();
};

/* Inheritance */

OO.initClass( ve.dm.TransactionBuilder );

/* Static Methods */

/**
 * Generate a transaction that replaces data in a range.
 *
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {ve.Range} range Range of data to remove
 * @param {Array} data Data to insert
 * @param {boolean} [removeMetadata=false] Remove metadata instead of collapsing it
 * @return {ve.dm.Transaction} Transaction that replaces data
 * @throws {Error} Invalid range
 */
ve.dm.TransactionBuilder.static.newFromReplacement = function ( doc, range, data, removeMetadata ) {
	var endOffset,
		txBuilder = new ve.dm.TransactionBuilder();
	endOffset = txBuilder.pushRemoval( doc, 0, range, removeMetadata );
	endOffset = txBuilder.pushInsertion( doc, endOffset, endOffset, data );
	txBuilder.pushFinalRetain( doc, endOffset );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that inserts data at an offset.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {number} offset Offset to insert at
 * @param {Array} data Data to insert
 * @return {ve.dm.Transaction} Transaction that inserts data
 */
ve.dm.TransactionBuilder.static.newFromInsertion = function ( doc, offset, data ) {
	var txBuilder = new ve.dm.TransactionBuilder(),
		endOffset = txBuilder.pushInsertion( doc, 0, offset, data );
	// Retain to end of document, if needed (for completeness)
	txBuilder.pushFinalRetain( doc, endOffset );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that removes data from a range.
 *
 * There are three possible results from a removal:
 *
 * - Remove content only
 *    - Occurs when the range starts and ends on elements of different type, depth or ancestry
 * - Remove entire elements and their content
 *    - Occurs when the range spans across an entire element
 * - Merge two elements by removing the end of one and the beginning of another
 *    - Occurs when the range starts and ends on elements of similar type, depth and ancestry
 *
 * This function uses the following logic to decide what to actually remove:
 *
 * 1. Elements are only removed if range being removed covers the entire element
 * 2. Elements can only be merged if {@link ve.dm.Node#canBeMergedWith} returns true
 * 3. Merges take place at the highest common ancestor
 *
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {ve.Range} range Range of data to remove
 * @param {boolean} [removeMetadata=false] Remove metadata instead of collapsing it
 * @return {ve.dm.Transaction} Transaction that removes data
 * @throws {Error} Invalid range
 */
ve.dm.TransactionBuilder.static.newFromRemoval = function ( doc, range, removeMetadata ) {
	var txBuilder = new ve.dm.TransactionBuilder(),
		endOffset = txBuilder.pushRemoval( doc, 0, range, removeMetadata );

	// Ensure no transaction leaves the document in a completely empty state
	if ( range.start === 0 && range.end >= doc.getInternalList().getListNode().getOuterRange().start ) {
		endOffset = txBuilder.pushInsertion( doc, endOffset, endOffset, [
			{ type: 'paragraph' },
			{ type: '/paragraph' }
		] );
	}

	// Retain to end of document, if needed (for completeness)
	txBuilder.pushFinalRetain( doc, endOffset );
	return txBuilder.getTransaction();
};

/**
 * Build a transaction that inserts the contents of a document at a given offset.
 *
 * This is typically used to merge changes to a document slice back into the main document. If newDoc
 * is a document slice of doc, it's assumed that there were no changes to doc's internal list since
 * the slice, so any differences between internal items that doc and newDoc have in common will
 * be resolved in newDoc's favor.
 *
 * @param {ve.dm.Document} doc Main document in the state to which the transaction start applies
 * @param {number} offset Offset to insert at
 * @param {ve.dm.Document} newDoc Document to insert
 * @param {ve.Range} [newDocRange] Range from the new document to insert (defaults to entire document)
 * @return {ve.dm.Transaction} Transaction that inserts the nodes and updates the internal list
 */
ve.dm.TransactionBuilder.static.newFromDocumentInsertion = function ( doc, offset, newDoc, newDocRange ) {
	var i, len, listMerge, data, metadata, listData, listMetadata, linearData,
		oldEndOffset, newEndOffset, txBuilder, insertion, spliceItemRange, spliceListNodeRange,
		listNode = doc.internalList.getListNode(),
		listNodeRange = listNode.getRange(),
		newListNode = newDoc.internalList.getListNode(),
		newListNodeRange = newListNode.getRange(),
		newListNodeOuterRange = newListNode.getOuterRange();

	if ( newDocRange ) {
		data = new ve.dm.ElementLinearData( doc.getStore(), newDoc.getData( newDocRange, true ) );
		metadata = new ve.dm.MetaLinearData( doc.getStore(), newDoc.getMetadata( newDocRange, true ) );
	} else {
		// Get the data and the metadata, but skip over the internal list
		data = new ve.dm.ElementLinearData( doc.getStore(),
			newDoc.getData( new ve.Range( 0, newListNodeOuterRange.start ), true ).concat(
				newDoc.getData( new ve.Range( newListNodeOuterRange.end, newDoc.data.getLength() ), true )
			)
		);
		metadata = new ve.dm.MetaLinearData( doc.getStore(),
			newDoc.getMetadata( new ve.Range( 0, newListNodeOuterRange.start ), true ).concat(
				newListNodeOuterRange.end < newDoc.data.getLength() ? newDoc.getMetadata(
					new ve.Range( newListNodeOuterRange.end + 1, newDoc.data.getLength() ), true
				) : []
			)
		);
		// TODO deal with metadata right before and right after the internal list
	}

	// Merge the stores
	doc.getStore().merge( newDoc.getStore() );

	listMerge = doc.internalList.merge( newDoc.internalList, newDoc.origInternalListLength || 0 );
	// Remap the indexes in the data
	data.remapInternalListIndexes( listMerge.mapping, doc.internalList );
	// Get data for the new internal list
	if ( newDoc.origDoc === doc ) {
		// newDoc is a document slice based on doc, so all the internal list items present in doc
		// when it was cloned are also in newDoc. We need to get the newDoc version of these items
		// so that changes made in newDoc are reflected.
		if ( newDoc.origInternalListLength > 0 ) {
			oldEndOffset = doc.internalList.getItemNode( newDoc.origInternalListLength - 1 ).getOuterRange().end;
			newEndOffset = newDoc.internalList.getItemNode( newDoc.origInternalListLength - 1 ).getOuterRange().end;
		} else {
			oldEndOffset = listNodeRange.start;
			newEndOffset = newListNodeRange.start;
		}
		linearData = new ve.dm.ElementLinearData(
			doc.getStore(),
			newDoc.getData( new ve.Range( newListNodeRange.start, newEndOffset ), true )
		);
		listData = linearData.data
			.concat( doc.getData( new ve.Range( oldEndOffset, listNodeRange.end ), true ) );
		listMetadata = newDoc.getMetadata( new ve.Range( newListNodeRange.start, newEndOffset ), true )
			.concat( doc.getMetadata( new ve.Range( oldEndOffset, listNodeRange.end ), true ) );
	} else {
		// newDoc is brand new, so use doc's internal list as a base
		listData = doc.getData( listNodeRange, true );
		listMetadata = doc.getMetadata( listNodeRange, true );
	}
	for ( i = 0, len = listMerge.newItemRanges.length; i < len; i++ ) {
		linearData = new ve.dm.ElementLinearData(
			doc.getStore(),
			newDoc.getData( listMerge.newItemRanges[ i ], true )
		);
		listData = listData.concat( linearData.data );
		// We don't have to worry about merging metadata at the edges, because there can't be
		// metadata between internal list items
		listMetadata = listMetadata.concat( newDoc.getMetadata( listMerge.newItemRanges[ i ], true ) );
	}

	txBuilder = new ve.dm.TransactionBuilder();

	if ( offset <= listNodeRange.start ) {
		// offset is before listNodeRange
		// First replace the node, then the internal list

		// Fix up the node insertion
		insertion = doc.fixupInsertion( data.data, offset );
		txBuilder.pushRetain( insertion.offset );
		txBuilder.pushReplace( doc, insertion.offset, insertion.remove, insertion.data, metadata.data );
		txBuilder.pushRetain( listNodeRange.start - ( insertion.offset + insertion.remove ) );
		txBuilder.pushReplace( doc, listNodeRange.start, listNodeRange.end - listNodeRange.start,
			listData, listMetadata
		);
		txBuilder.pushFinalRetain( doc, listNodeRange.end );
	} else if ( offset >= listNodeRange.end ) {
		// offset is after listNodeRange
		// First replace the internal list, then the node

		// Fix up the node insertion
		insertion = doc.fixupInsertion( data.data, offset );
		txBuilder.pushRetain( listNodeRange.start );
		txBuilder.pushReplace( doc, listNodeRange.start, listNodeRange.end - listNodeRange.start,
			listData, listMetadata
		);
		txBuilder.pushRetain( insertion.offset - listNodeRange.end );
		txBuilder.pushReplace( doc, insertion.offset, insertion.remove, insertion.data, metadata.data );
		txBuilder.pushFinalRetain( doc, insertion.offset + insertion.remove );
	} else if ( offset >= listNodeRange.start && offset <= listNodeRange.end ) {
		// offset is within listNodeRange
		// Merge data into listData, then only replace the internal list
		// Find the internalItem we are inserting into
		i = 0;
		// Find item node in doc
		while (
			( spliceItemRange = doc.internalList.getItemNode( i ).getRange() ) &&
			offset > spliceItemRange.end
		) {
			i++;
		}

		if ( newDoc.origDoc === doc ) {
			// Get spliceItemRange from newDoc
			spliceItemRange = newDoc.internalList.getItemNode( i ).getRange();
			spliceListNodeRange = newListNodeRange;
		} else {
			// Get spliceItemRange from doc; the while loop has already set it
			spliceListNodeRange = listNodeRange;
		}
		ve.batchSplice( listData, spliceItemRange.start - spliceListNodeRange.start,
			spliceItemRange.end - spliceItemRange.start, data.data );
		ve.batchSplice( listMetadata, spliceItemRange.start - spliceListNodeRange.start,
			spliceItemRange.end - spliceItemRange.start, metadata.data );

		txBuilder.pushRetain( listNodeRange.start );
		txBuilder.pushReplace( doc, listNodeRange.start, listNodeRange.end - listNodeRange.start,
			listData, listMetadata
		);
		txBuilder.pushFinalRetain( doc, listNodeRange.end );
	}
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that changes one or more attributes.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {number} offset Offset of element
 * @param {Object.<string,Mixed>} attr List of attribute key and value pairs, use undefined value
 *  to remove an attribute
 * @return {ve.dm.Transaction} Transaction that changes an element
 * @throws {Error} Cannot set attributes to non-element data
 * @throws {Error} Cannot set attributes on closing element
 */
ve.dm.TransactionBuilder.static.newFromAttributeChanges = function ( doc, offset, attr ) {
	var txBuilder = new ve.dm.TransactionBuilder(),
		data = doc.getData();
	// Verify element exists at offset
	if ( data[ offset ].type === undefined ) {
		throw new Error( 'Cannot set attributes to non-element data' );
	}
	// Verify element is not a closing
	if ( data[ offset ].type.charAt( 0 ) === '/' ) {
		throw new Error( 'Cannot set attributes on closing element' );
	}
	// Retain up to element
	txBuilder.pushRetain( offset );
	// Change attributes
	txBuilder.pushAttributeChanges( attr, data[ offset ].attributes || {} );
	// Retain to end of document
	txBuilder.pushFinalRetain( doc, offset );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that annotates content.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {ve.Range} range Range to annotate
 * @param {string} method Annotation mode
 *  - `set`: Adds annotation to all content in range
 *  - `clear`: Removes instances of annotation from content in range
 * @param {ve.dm.Annotation} annotation Annotation to set or clear
 * @return {ve.dm.Transaction} Transaction that annotates content
 */
ve.dm.TransactionBuilder.static.newFromAnnotation = function ( doc, range, method, annotation ) {
	var covered, type, annotatable,
		txBuilder = new ve.dm.TransactionBuilder(),
		data = doc.data,
		index = doc.getStore().index( annotation ),
		i = range.start,
		span = i,
		on = false,
		insideContentNode = false,
		ignoreChildrenDepth = 0;

	// Iterate over all data in range, annotating where appropriate
	while ( i < range.end ) {
		if ( data.isElementData( i ) ) {
			type = data.getType( i );
			if ( ve.dm.nodeFactory.shouldIgnoreChildren( type ) ) {
				ignoreChildrenDepth += data.isOpenElementData( i ) ? 1 : -1;
			}
			if ( ve.dm.nodeFactory.isNodeContent( type ) ) {
				if ( method === 'set' && !ve.dm.nodeFactory.canNodeTakeAnnotationType( type, annotation ) ) {
					// Blacklisted annotations can't be set
					annotatable = false;
				} else {
					annotatable = true;
				}
			} else {
				// Structural nodes are never annotatable
				annotatable = false;
			}
		} else {
			// Text is always annotatable
			annotatable = true;
		}
		// No annotations if we're inside an ignoreChildren node
		annotatable = annotatable && !ignoreChildrenDepth;
		if (
			!annotatable ||
			( insideContentNode && !data.isCloseElementData( i ) )
		) {
			// Structural element opening or closing, or entering a content node
			if ( on ) {
				txBuilder.pushRetain( span );
				txBuilder.pushStopAnnotating( method, index );
				span = 0;
				on = false;
			}
		} else if (
			( !data.isElementData( i ) || !data.isCloseElementData( i ) ) &&
			!insideContentNode
		) {
			// Character or content element opening
			if ( data.isElementData( i ) ) {
				insideContentNode = true;
			}
			if ( method === 'set' ) {
				// Don't re-apply matching annotation
				covered = data.getAnnotationsFromOffset( i ).containsComparable( annotation );
			} else {
				// Expect comparable annotations to be removed individually otherwise
				// we might try to remove more than one annotation per character, which
				// a single transaction can't do.
				covered = data.getAnnotationsFromOffset( i ).contains( annotation );
			}
			if ( ( covered && method === 'set' ) || ( !covered && method === 'clear' ) ) {
				// Skip annotated content
				if ( on ) {
					txBuilder.pushRetain( span );
					txBuilder.pushStopAnnotating( method, index );
					span = 0;
					on = false;
				}
			} else {
				// Cover non-annotated content
				if ( !on ) {
					txBuilder.pushRetain( span );
					txBuilder.pushStartAnnotating( method, index );
					span = 0;
					on = true;
				}
			}
		} else if ( data.isCloseElementData( i ) ) {
			// Content closing, skip
			insideContentNode = false;
		}
		span++;
		i++;
	}
	txBuilder.pushRetain( span );
	if ( on ) {
		txBuilder.pushStopAnnotating( method, index );
	}
	txBuilder.pushFinalRetain( doc, range.end );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that inserts metadata elements.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {number} offset Offset of element
 * @param {number} index Index of metadata cursor within element
 * @param {Array} newElements New elements to insert
 * @return {ve.dm.Transaction} Transaction that inserts the metadata elements
 */
ve.dm.TransactionBuilder.static.newFromMetadataInsertion = function ( doc, offset, index, newElements ) {
	var txBuilder = new ve.dm.TransactionBuilder(),
		data = doc.metadata,
		elements = data.getData( offset ) || [];

	if ( newElements.length === 0 ) {
		return txBuilder.getTransaction(); // no-op
	}

	// Retain up to element
	txBuilder.pushRetain( offset );
	// Retain up to metadata element (second dimension)
	txBuilder.pushRetainMetadata( index );
	// Insert metadata elements
	txBuilder.pushReplaceMetadata(
		[], newElements
	);
	// Retain up to end of metadata elements (second dimension)
	txBuilder.pushRetainMetadata( elements.length - index );
	// Retain to end of document
	txBuilder.pushFinalRetain( doc, offset, elements.length );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that removes metadata elements.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {number} offset Offset of element
 * @param {ve.Range} range Range of metadata to remove
 * @return {ve.dm.Transaction} Transaction that removes metadata elements
 * @throws {Error} Cannot remove metadata from empty list
 * @throws {Error} Range out of bounds
 */
ve.dm.TransactionBuilder.static.newFromMetadataRemoval = function ( doc, offset, range ) {
	var selection,
		txBuilder = new ve.dm.TransactionBuilder(),
		data = doc.metadata,
		elements = data.getData( offset ) || [];

	if ( !elements.length ) {
		throw new Error( 'Cannot remove metadata from empty list' );
	}

	if ( range.start < 0 || range.end > elements.length ) {
		throw new Error( 'Range out of bounds' );
	}

	selection = elements.slice( range.start, range.end );

	if ( selection.length === 0 ) {
		return txBuilder.getTransaction(); // no-op.
	}

	// Retain up to element
	txBuilder.pushRetain( offset );
	// Retain up to metadata element (second dimension)
	txBuilder.pushRetainMetadata( range.start );
	// Remove metadata elements
	txBuilder.pushReplaceMetadata(
		selection, []
	);
	// Retain up to end of metadata elements (second dimension)
	txBuilder.pushRetainMetadata( elements.length - range.end );
	// Retain to end of document (unless we're already off the end )
	txBuilder.pushFinalRetain( doc, offset, elements.length );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that replaces a single metadata element.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {number} offset Offset of element
 * @param {number} index Index of metadata cursor within element
 * @param {Object} newElement New element to insert
 * @return {ve.dm.Transaction} Transaction that replaces a metadata element
 * @throws {Error} Metadata index out of bounds
 */
ve.dm.TransactionBuilder.static.newFromMetadataElementReplacement = function ( doc, offset, index, newElement ) {
	var oldElement,
		txBuilder = new ve.dm.TransactionBuilder(),
		data = doc.getMetadata(),
		elements = data[ offset ] || [];

	if ( index >= elements.length ) {
		throw new Error( 'Metadata index out of bounds' );
	}

	oldElement = elements[ index ];

	// Retain up to element
	txBuilder.pushRetain( offset );
	// Retain up to metadata element (second dimension)
	txBuilder.pushRetainMetadata( index );
	// Remove metadata elements
	txBuilder.pushReplaceMetadata(
		[ oldElement ], [ newElement ]
	);
	// Retain up to end of metadata elements (second dimension)
	txBuilder.pushRetainMetadata( elements.length - index - 1 );
	// Retain to end of document (unless we're already off the end )
	txBuilder.pushFinalRetain( doc, offset, elements.length );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that converts elements that can contain content.
 *
 * @static
 * @method
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {ve.Range} range Range to convert
 * @param {string} type Symbolic name of element type to convert to
 * @param {Object} attr Attributes to initialize element with
 * @return {ve.dm.Transaction} Transaction that converts content branches
 */
ve.dm.TransactionBuilder.static.newFromContentBranchConversion = function ( doc, range, type, attr ) {
	var i, selected, branch, branchOuterRange,
		txBuilder = new ve.dm.TransactionBuilder(),
		selection = doc.selectNodes( range, 'leaves' ),
		opening = { type: type },
		closing = { type: '/' + type },
		previousBranch,
		previousBranchOuterRange;
	// Add attributes to opening if needed
	if ( ve.isPlainObject( attr ) ) {
		opening.attributes = attr;
	} else {
		attr = {};
	}
	// Replace the wrappings of each content branch in the range
	for ( i = 0; i < selection.length; i++ ) {
		selected = selection[ i ];
		branch = selected.node.isContent() ? selected.node.getParent() : selected.node;
		if ( branch.canContainContent() ) {
			// Skip branches that are already of the target type and have all attributes in attr
			// set already.
			if ( branch.getType() === type && ve.compare( attr, branch.getAttributes(), true ) ) {
				continue;
			}
			branchOuterRange = branch.getOuterRange();
			// Don't convert the same branch twice
			if ( branch === previousBranch ) {
				continue;
			}

			// Retain up to this branch, considering where the previous one left off
			txBuilder.pushRetain(
				branchOuterRange.start - ( previousBranch ? previousBranchOuterRange.end : 0 )
			);
			if ( branch.getType() === type ) {
				// Same type, different attributes, so we only need an attribute change
				txBuilder.pushAttributeChanges( attr, branch.getAttributes() );
				// Retain the branch, including its opening and closing
				txBuilder.pushRetain( branch.getOuterLength() );
			} else {
				// Types differ, so we need to replace the opening and closing
				// Replace the opening
				txBuilder.pushReplace( doc, branchOuterRange.start, 1, [ ve.copy( opening ) ] );
				// Retain the contents
				txBuilder.pushRetain( branch.getLength() );
				// Replace the closing
				txBuilder.pushReplace( doc, branchOuterRange.end - 1, 1, [ ve.copy( closing ) ] );
			}
			// Remember this branch and its range for next time
			previousBranch = branch;
			previousBranchOuterRange = branchOuterRange;
		}
	}
	// Retain until the end
	txBuilder.pushFinalRetain( doc, previousBranch ? previousBranchOuterRange.end : 0 );
	return txBuilder.getTransaction();
};

/**
 * Generate a transaction that wraps, unwraps or replaces structure.
 *
 * The unwrap parameters are checked against the actual model data, and
 * an exception is thrown if the type fields don't match. This means you
 * can omit attributes from the unwrap parameters, those are automatically
 * picked up from the model data instead.
 *
 * NOTE: This function currently does not fix invalid parent/child relationships, so it will
 * happily convert paragraphs to listItems without wrapping them in a list if that's what you
 * ask it to do. We'll probably fix this later but for now the caller is responsible for giving
 * valid instructions.
 *
 * Changing a paragraph to a header:
 *     Before: [ {type: 'paragraph'}, 'a', 'b', 'c', {type: '/paragraph'} ]
 *     newFromWrap( new ve.Range( 1, 4 ), [ {type: 'paragraph'} ], [ {type: 'heading', level: 1 } ] );
 *     After: [ {type: 'heading', level: 1 }, 'a', 'b', 'c', {type: '/heading'} ]
 *
 * Changing a set of paragraphs to a list:
 *     Before: [ {type: 'paragraph'}, 'a', {type: '/paragraph'}, {'type':'paragraph'}, 'b', {'type':'/paragraph'} ]
 *     newFromWrap( new ve.Range( 0, 6 ), [], [ {type: 'list' } ], [], [ {type: 'listItem', attributes: {styles: ['bullet']}} ] );
 *     After: [ {type: 'list'}, {type: 'listItem', attributes: {styles: ['bullet']}}, {'type':'paragraph'} 'a',
 *              {type: '/paragraph'}, {type: '/listItem'}, {type: 'listItem', attributes: {styles: ['bullet']}},
 *              {type: 'paragraph'}, 'b', {type: '/paragraph'}, {type: '/listItem'}, {type: '/list'} ]
 *
 * @param {ve.dm.Document} doc Document in pre-transaction state
 * @param {ve.Range} range Range to wrap/unwrap/replace around
 * @param {Array} unwrapOuter Opening elements to unwrap. These must be immediately *outside* the range
 * @param {Array} wrapOuter Opening elements to wrap around the range
 * @param {Array} unwrapEach Opening elements to unwrap from each top-level element in the range
 * @param {Array} wrapEach Opening elements to wrap around each top-level element in the range
 * @return {ve.dm.Transaction}
 */
ve.dm.TransactionBuilder.static.newFromWrap = function ( doc, range, unwrapOuter, wrapOuter, unwrapEach, wrapEach ) {
	var i, j, unwrapOuterData, startOffset, unwrapEachData, closingWrapEach,
		txBuilder = new ve.dm.TransactionBuilder(),
		depth = 0;

	// Function to generate arrays of closing elements in reverse order
	function closingArray( openings ) {
		var i,
			closings = [],
			len = openings.length;
		for ( i = 0; i < len; i++ ) {
			closings[ closings.length ] = { type: '/' + openings[ len - i - 1 ].type };
		}
		return closings;
	}
	/* closingUnwrapEach = */ closingArray( unwrapEach );
	closingWrapEach = closingArray( wrapEach );

	// TODO: check for and fix nesting validity like fixupInsertion does
	if ( range.start > unwrapOuter.length ) {
		// Retain up to the first thing we're unwrapping
		// The outer unwrapping takes place *outside*
		// the range, so compensate for that
		txBuilder.pushRetain( range.start - unwrapOuter.length );
	} else if ( range.start < unwrapOuter.length ) {
		throw new Error( 'unwrapOuter is longer than the data preceding the range' );
	}

	// Replace the opening elements for the outer unwrap&wrap
	if ( wrapOuter.length > 0 || unwrapOuter.length > 0 ) {
		// Verify that wrapOuter matches the data at this position
		unwrapOuterData = doc.data.slice( range.start - unwrapOuter.length, range.start );
		for ( i = 0; i < unwrapOuterData.length; i++ ) {
			if ( unwrapOuterData[ i ].type !== unwrapOuter[ i ].type ) {
				throw new Error( 'Element in unwrapOuter does not match: expected ' +
					unwrapOuter[ i ].type + ' but found ' + unwrapOuterData[ i ].type );
			}
		}
		// Instead of putting in unwrapOuter as given, put it in the
		// way it appears in the model so we pick up any attributes
		txBuilder.pushReplace( doc, range.start - unwrapOuter.length, unwrapOuter.length, ve.copy( wrapOuter ) );
	}

	if ( wrapEach.length > 0 || unwrapEach.length > 0 ) {
		// Visit each top-level child and wrap/unwrap it
		// TODO figure out if we should use the tree/node functions here
		// rather than iterating over offsets, it may or may not be faster
		for ( i = range.start; i < range.end; i++ ) {
			if ( doc.data.isElementData( i ) ) {
				// This is a structural offset
				if ( !doc.data.isCloseElementData( i ) ) {
					// This is an opening element
					if ( depth === 0 ) {
						// We are at the start of a top-level element
						// Replace the opening elements

						// Verify that unwrapEach matches the data at this position
						unwrapEachData = doc.data.slice( i, i + unwrapEach.length );
						for ( j = 0; j < unwrapEachData.length; j++ ) {
							if ( unwrapEachData[ j ].type !== unwrapEach[ j ].type ) {
								throw new Error( 'Element in unwrapEach does not match: expected ' +
									unwrapEach[ j ].type + ' but found ' +
									unwrapEachData[ j ].type );
							}
						}
						// Instead of putting in unwrapEach as given, put it in the
						// way it appears in the model, so we pick up any attributes
						txBuilder.pushReplace( doc, i, unwrapEach.length, ve.copy( wrapEach ) );

						// Store this offset for later
						startOffset = i + unwrapEach.length;
					}
					depth++;
				} else {
					// This is a closing element
					depth--;
					if ( depth === 0 ) {
						// We are at the end of a top-level element
						// Advance past the element, then back up past the unwrapEach
						j = ( i + 1 ) - unwrapEach.length;
						// Retain the contents of what we're wrapping
						txBuilder.pushRetain( j - startOffset );
						// Replace the closing elements
						txBuilder.pushReplace( doc, j, unwrapEach.length, ve.copy( closingWrapEach ) );
					}
				}
			}
		}
	} else {
		// There is no wrapEach/unwrapEach to be done, just retain
		// up to the end of the range
		txBuilder.pushRetain( range.end - range.start );
	}

	// this is a no-op if unwrapOuter.length===0 and wrapOuter.length===0
	txBuilder.pushReplace( doc, range.end, unwrapOuter.length, closingArray( wrapOuter ) );

	// Retain up to the end of the document
	txBuilder.pushFinalRetain( doc, range.end + unwrapOuter.length );

	return txBuilder.getTransaction();
};

/* Methods */

/**
 * Get the transaction
 *
 * @return {ve.dm.Transaction} The transaction
 */
ve.dm.TransactionBuilder.prototype.getTransaction = function () {
	return this.transaction;
};

/**
 * Add a final retain operation to finish off a transaction (internal helper).
 *
 * @private
 * @method
 * @param {ve.dm.Document} doc The document in the state to which the transaction applies
 * @param {number} offset Final offset edited by the transaction up to this point.
 * @param {number} [metaOffset=0] Final metadata offset edited, if non-zero.
 */
ve.dm.TransactionBuilder.prototype.pushFinalRetain = function ( doc, offset, metaOffset ) {
	var data = doc.data,
		metadata = doc.metadata,
		finalMetadata = metadata.getData( data.getLength() );
	if ( offset < doc.data.getLength() ) {
		this.pushRetain( doc.data.getLength() - offset );
		metaOffset = 0;
	}
	// if there is trailing metadata, push a final retainMetadata
	if ( finalMetadata !== undefined && finalMetadata.length > 0 ) {
		this.transaction.pushRetainMetadata( finalMetadata.length - ( metaOffset || 0 ) );
	}
};

/**
 * Add a retain operation.
 *
 * @method
 * @param {number} length Length of content data to retain
 * @throws {Error} Cannot retain backwards
 */
ve.dm.TransactionBuilder.prototype.pushRetain = function ( length ) {
	var end;
	if ( length < 0 ) {
		throw new Error( 'Invalid retain length, cannot retain backwards:' + length );
	}
	if ( length ) {
		end = this.transaction.operations.length - 1;
		if (
			this.transaction.operations.length &&
			this.transaction.operations[ end ].type === 'retain'
		) {
			this.transaction.operations[ end ].length += length;
		} else {
			this.transaction.pushRetainOp( length );
		}
	}
};

/**
 * Add a retain metadata operation.
 * // TODO: this is a copy/paste of pushRetain (at the moment). Consider a refactor.
 *
 * @method
 * @param {number} length Length of content data to retain
 * @throws {Error} Cannot retain backwards
 */
ve.dm.TransactionBuilder.prototype.pushRetainMetadata = function ( length ) {
	var end;
	if ( length < 0 ) {
		throw new Error( 'Invalid retain length, cannot retain backwards:' + length );
	}
	if ( length ) {
		end = this.transaction.operations.length - 1;
		if (
			this.transaction.operations.length &&
			this.transaction.operations[ end ].type === 'retainMetadata'
		) {
			this.transaction.operations[ end ].length += length;
		} else {
			this.transaction.pushRetainMetadataOp( length );
		}
	}
};

/**
 * Adds a replace op to remove the desired range and, where required, splices in retain ops
 * to prevent the deletion of undeletable nodes.
 *
 * An extra `replaceMetadata` operation might be pushed at the end if the
 * affected region contains metadata; see
 * {@link ve.dm.TransactionBuilder#pushReplace} for details.
 *
 * @param {ve.dm.Document} doc The document in the state to which the transaction applies
 * @param {number} removeStart Offset to start removing from
 * @param {number} removeEnd Offset to remove to
 * @param {boolean} [removeMetadata=false] Remove metadata instead of collapsing it
 * @return {number} End offset of the removal
 */
ve.dm.TransactionBuilder.prototype.addSafeRemoveOps = function ( doc, removeStart, removeEnd, removeMetadata ) {
	var i, queuedRetain,
		retainStart = removeStart,
		undeletableStackDepth = 0;
	// Iterate over removal range and use a stack counter to determine if
	// we are inside an undeletable node
	for ( i = removeStart; i < removeEnd; i++ ) {
		if ( doc.data.isElementData( i ) && !ve.dm.nodeFactory.isNodeDeletable( doc.data.getType( i ) ) ) {
			if ( !doc.data.isCloseElementData( i ) ) {
				if ( undeletableStackDepth === 0 ) {
					if ( queuedRetain ) {
						this.pushRetain( queuedRetain );
					}
					this.pushReplace( doc, removeStart, i - removeStart, [], removeMetadata ? [] : undefined );
					retainStart = i;
				}
				undeletableStackDepth++;
			} else {
				undeletableStackDepth--;
				if ( undeletableStackDepth === 0 ) {
					queuedRetain = i + 1 - retainStart;
					removeStart = i + 1;
				}
			}
		}
	}
	if ( removeEnd - removeStart ) {
		if ( queuedRetain ) {
			this.pushRetain( queuedRetain );
		}
		this.pushReplace( doc, removeStart, removeEnd - removeStart, [], removeMetadata ? [] : undefined );
		retainStart = removeEnd;
	}
	return retainStart;
};

/**
 * Add a replace operation (internal helper).
 *
 * @private
 * @method
 * @param {Array} remove Data removed.
 * @param {Array} insert Data to insert.
 * @param {Array|undefined} removeMetadata Metadata removed.
 * @param {Array} insertMetadata Metadata to insert.
 * @param {number} [insertedDataOffset] Inserted data offset
 * @param {number} [insertedDataLength] Inserted data length
 */
ve.dm.TransactionBuilder.prototype.pushReplaceInternal = function ( remove, insert, removeMetadata, insertMetadata, insertedDataOffset, insertedDataLength ) {
	if ( remove.length === 0 && insert.length === 0 ) {
		return; // no-op
	}
	this.transaction.pushReplaceOp( remove, insert, removeMetadata, insertMetadata, insertedDataOffset, insertedDataLength );
};

/**
 * Add a replace operation, keeping metadata in sync if required.
 *
 * Note that metadata attached to removed content is moved so that it
 * attaches just before the inserted content.  If there is
 * metadata attached to the removed content but there is no inserted
 * content, then an extra `replaceMetadata` operation is pushed in order
 * to properly insert the merged metadata before the character immediately
 * after the removed content. (Note that there is an extra metadata element
 * after the final data element; if the removed region is at the very end of
 * the document, the inserted `replaceMetadata` operation targets this
 * final metadata element.)
 *
 * @method
 * @param {ve.dm.Document} doc The document in the state to which the transaction applies
 * @param {number} offset Offset to start at
 * @param {number} removeLength Number of data items to remove
 * @param {Array} insert Data to insert
 * @param {Array} [insertMetadata] Overwrite the metadata with this data, rather than collapsing it
 * @param {number} [insertedDataOffset] Offset of the originally inserted data in the resulting operation data
 * @param {number} [insertedDataLength] Length of the originally inserted data in the resulting operation data
 */
ve.dm.TransactionBuilder.prototype.pushReplace = function ( doc, offset, removeLength, insert, insertMetadata, insertedDataOffset, insertedDataLength ) {
	var extraMetadata, end, lastOp, penultOp, range, remove, removeMetadata,
		isRemoveEmpty, isInsertEmpty, mergedMetadata;

	if ( removeLength === 0 && insert.length === 0 ) {
		// Don't push no-ops
		return;
	}

	end = this.transaction.operations.length - 1;
	lastOp = end >= 0 ? this.transaction.operations[ end ] : null;
	penultOp = end >= 1 ? this.transaction.operations[ end - 1 ] : null;
	range = new ve.Range( offset, offset + removeLength );
	remove = doc.getData( range );
	removeMetadata = doc.getMetadata( range );
	// ve.compare compares arrays as objects, so no need to check against
	// an array of the same length for emptiness.
	isRemoveEmpty = ve.compare( removeMetadata, [] );
	isInsertEmpty = insertMetadata && ve.compare( insertMetadata, [] );
	mergedMetadata = [];

	if ( !insertMetadata && !isRemoveEmpty ) {
		// if we are removing a range which includes metadata, we need to
		// collapse it.  If there's nothing to insert, we also need to add
		// an extra `replaceMetadata` operation later in order to insert the
		// collapsed metadata.
		insertMetadata = ve.dm.MetaLinearData.static.merge( removeMetadata );
		if ( insert.length === 0 ) {
			extraMetadata = insertMetadata[ 0 ];
			insertMetadata = [];
		} else {
			// pad out at end so insert metadata is the same length as insert data
			ve.batchSplice( insertMetadata, 1, 0, new Array( insert.length - 1 ) );
		}
		isInsertEmpty = ve.compare( insertMetadata, new Array( insertMetadata.length ) );
	} else if ( isInsertEmpty && isRemoveEmpty ) {
		// No metadata changes, don't pollute the transaction with [undefined, undefined, ...]
		insertMetadata = undefined;
	}

	// simple replaces can be combined
	// (but don't do this if there is metadata to be removed and the previous
	// replace had a non-zero insertion, because that would shift the metadata
	// location.  also skip this if the last replace deliberately removed
	// metadata instead of merging it.)
	if (
		lastOp && lastOp.type === 'replaceMetadata' &&
		lastOp.insert.length > 0 && lastOp.remove.length === 0 &&
		penultOp && penultOp.type === 'replace' &&
		penultOp.insert.length === 0 /* this is always true */
	) {
		mergedMetadata = [ lastOp.insert ];
		this.transaction.operations.pop();
		lastOp = penultOp;
		/* fall through */
	}
	// merge, where extraMetadata will not be required
	if (
		lastOp && lastOp.type === 'replace' &&
		!( lastOp.insert.length > 0 && insertMetadata !== undefined ) &&
		lastOp.insertedDataOffset === undefined && !extraMetadata &&
		// don't merge if we mergedMetadata and had to insert non-empty
		// metadata as a result
		!( mergedMetadata.length > 0 && insertMetadata !== undefined && !isInsertEmpty )
	) {
		lastOp = this.transaction.operations.pop();
		this.pushReplace(
			doc,
			offset - lastOp.remove.length,
			lastOp.remove.length + removeLength,
			lastOp.insert.concat( insert ),
			(
				lastOp.insertMetadata || new Array( lastOp.insert.length )
			).concat(
				mergedMetadata
			).concat(
				( insertMetadata === undefined || isInsertEmpty ) ?
				new Array( insert.length - mergedMetadata.length ) :
				insertMetadata
			),
			insertedDataOffset,
			insertedDataLength
		);
		return;
	}
	// merge a "remove after remove" (where extraMetadata will be required)
	if (
		lastOp && lastOp.type === 'replace' &&
		lastOp.insert.length === 0 && insert.length === 0 &&
		( lastOp.removeMetadata === undefined || mergedMetadata.length > 0 ) &&
		( insertMetadata === undefined || extraMetadata )
	) {
		lastOp = this.transaction.operations.pop();
		this.pushReplace(
			doc,
			offset - lastOp.remove.length,
			lastOp.remove.length + removeLength,
			[]
		);
		return;
	}

	if ( lastOp && lastOp.type === 'replaceMetadata' ) {
		// `replace` operates on the metadata at the given offset; the transaction
		// touches the same region twice if `replace` follows a `replaceMetadata`
		// without a `retain` in between.
		throw new Error( 'replace after replaceMetadata not allowed' );
	}

	this.transaction.pushReplaceOp( remove, insert, removeMetadata, insertMetadata, insertedDataOffset, insertedDataLength );

	if ( extraMetadata !== undefined ) {
		this.pushReplaceMetadata( [], extraMetadata );
	}
};

/**
 * Add a replace metadata operation
 *
 * @method
 * @param {Array} remove Metadata to remove
 * @param {Array} insert Metadata to replace 'remove' with
 */
ve.dm.TransactionBuilder.prototype.pushReplaceMetadata = function ( remove, insert ) {
	if ( remove.length === 0 && insert.length === 0 ) {
		// Don't push no-ops
		return;
	}
	this.transaction.pushReplaceMetadataOp( remove, insert );
};

/**
 * Add an element attribute change operation.
 *
 * @method
 * @param {string} key Name of attribute to change
 * @param {Mixed} from Value change attribute from, or undefined if not previously set
 * @param {Mixed} to Value to change attribute to, or undefined to remove
 */
ve.dm.TransactionBuilder.prototype.pushReplaceElementAttribute = function ( key, from, to ) {
	this.transaction.pushAttributeOp( key, from, to );
};

/**
 * Add a series of element attribute change operations.
 *
 * @param {Object} changes Object mapping attribute names to new values
 * @param {Object} oldAttrs Object mapping attribute names to old values
 */
ve.dm.TransactionBuilder.prototype.pushAttributeChanges = function ( changes, oldAttrs ) {
	var key;
	for ( key in changes ) {
		if ( oldAttrs[ key ] !== changes[ key ] ) {
			this.pushReplaceElementAttribute( key, oldAttrs[ key ], changes[ key ] );
		}
	}
};

/**
 * Add a start annotating operation.
 *
 * @method
 * @param {string} method Method to use, either "set" or "clear"
 * @param {Object} index Store index of annotation object to start setting or clearing from content data
 */
ve.dm.TransactionBuilder.prototype.pushStartAnnotating = function ( method, index ) {
	this.transaction.pushAnnotateOp( method, 'start', index );
};

/**
 * Add a stop annotating operation.
 *
 * @method
 * @param {string} method Method to use, either "set" or "clear"
 * @param {Object} index Store index of annotation object to stop setting or clearing from content data
 */
ve.dm.TransactionBuilder.prototype.pushStopAnnotating = function ( method, index ) {
	this.transaction.pushAnnotateOp( method, 'stop', index );
};

/**
 * Internal helper method for newFromInsertion and newFromReplacement.
 * Adds an insertion to an existing transaction object.
 *
 * @private
 * @param {ve.dm.Document} doc The document in the state to which the transaction applies
 * @param {number} currentOffset Offset up to which the transaction has gone already
 * @param {number} insertOffset Offset to insert at
 * @param {Array} data Linear model data to insert
 * @return {number} End offset of the insertion
 */
ve.dm.TransactionBuilder.prototype.pushInsertion = function ( doc, currentOffset, insertOffset, data ) {
	// Fix up the insertion
	var insertion = doc.fixupInsertion( data, insertOffset );
	// Retain up to insertion point, if needed
	this.pushRetain( insertion.offset - currentOffset );
	// Insert data
	this.pushReplace(
		doc, insertion.offset, insertion.remove, insertion.data, undefined,
		insertion.insertedDataOffset, insertion.insertedDataLength
	);
	return insertion.offset + insertion.remove;
};

/**
 * Internal helper method for newFromRemoval and newFromReplacement.
 * Adds a removal to an existing transaction object.
 *
 * @private
 * @param {ve.dm.Document} doc The document in the state to which the transaction applies
 * @param {number} currentOffset Offset up to which the transaction has gone already
 * @param {ve.Range} range Range to remove
 * @param {boolean} [removeMetadata=false] Remove metadata instead of collapsing it
 * @return {number} End offset of the removal
 */
ve.dm.TransactionBuilder.prototype.pushRemoval = function ( doc, currentOffset, range, removeMetadata ) {
	var i, selection, first, last, nodeStart, nodeEnd,
		offset = currentOffset,
		removeStart = null,
		removeEnd = null;
	// Validate range
	if ( range.isCollapsed() ) {
		// Empty range, nothing to remove
		this.pushRetain( range.start - currentOffset );
		return range.start;
	}
	// Select nodes and validate selection
	selection = doc.selectNodes( range, 'covered' );
	if ( selection.length === 0 ) {
		// Empty selection? Something is wrong!
		throw new Error( 'Invalid range, cannot remove from ' + range.start + ' to ' + range.end );
	}
	first = selection[ 0 ];
	last = selection[ selection.length - 1 ];
	// If the first and last node are mergeable, merge them
	if ( first.node.canBeMergedWith( last.node ) ) {
		if ( !first.range && !last.range ) {
			// First and last node are both completely covered, remove them
			removeStart = first.nodeOuterRange.start;
			removeEnd = last.nodeOuterRange.end;
		} else {
			// Either the first node or the last node is partially covered, so remove
			// the selected content. The other node might be fully covered, in which case
			// we remove its contents (nodeRange). For fully covered content nodes, we must
			// remove the entire node (nodeOuterRange).
			removeStart = (
				first.range ||
				( first.node.isContent() ? first.nodeOuterRange : first.nodeRange )
			).start;
			removeEnd = (
				last.range ||
				( last.node.isContent() ? last.nodeOuterRange : last.nodeRange )
			).end;
		}
		this.pushRetain( removeStart - currentOffset );
		removeEnd = this.addSafeRemoveOps( doc, removeStart, removeEnd, removeMetadata );
		// All done
		return removeEnd;
	}

	// The selection wasn't mergeable, so remove nodes that are completely covered, and strip
	// nodes that aren't
	for ( i = 0; i < selection.length; i++ ) {
		if ( !selection[ i ].range ) {
			// Entire node is covered, remove it
			nodeStart = selection[ i ].nodeOuterRange.start;
			nodeEnd = selection[ i ].nodeOuterRange.end;
		} else {
			// Part of the node is covered, remove that range
			nodeStart = selection[ i ].range.start;
			nodeEnd = selection[ i ].range.end;
		}

		// Merge contiguous removals. Only apply a removal when a gap appears, or at the
		// end of the loop
		if ( removeEnd === null ) {
			// First removal
			removeStart = nodeStart;
			removeEnd = nodeEnd;
		} else if ( removeEnd === nodeStart ) {
			// Merge this removal into the previous one
			removeEnd = nodeEnd;
		} else {
			// There is a gap between the previous removal and this one

			// Push the previous removal first
			this.pushRetain( removeStart - offset );
			offset = this.addSafeRemoveOps( doc, removeStart, removeEnd, removeMetadata );

			// Now start this removal
			removeStart = nodeStart;
			removeEnd = nodeEnd;
		}
	}
	// Apply the last removal, if any
	if ( removeEnd !== null ) {
		this.pushRetain( removeStart - offset );
		offset = this.addSafeRemoveOps( doc, removeStart, removeEnd, removeMetadata );
	}
	return offset;
};

// Add newFrom* methods to ve.dm.Transaction for legacy support.

ve.dm.Transaction.newFromReplacement = ve.dm.TransactionBuilder.static.newFromReplacement;
ve.dm.Transaction.newFromInsertion = ve.dm.TransactionBuilder.static.newFromInsertion;
ve.dm.Transaction.newFromRemoval = ve.dm.TransactionBuilder.static.newFromRemoval;
ve.dm.Transaction.newFromDocumentInsertion = ve.dm.TransactionBuilder.static.newFromDocumentInsertion;
ve.dm.Transaction.newFromAttributeChanges = ve.dm.TransactionBuilder.static.newFromAttributeChanges;
ve.dm.Transaction.newFromAnnotation = ve.dm.TransactionBuilder.static.newFromAnnotation;
ve.dm.Transaction.newFromMetadataInsertion = ve.dm.TransactionBuilder.static.newFromMetadataInsertion;
ve.dm.Transaction.newFromMetadataRemoval = ve.dm.TransactionBuilder.static.newFromMetadataRemoval;
ve.dm.Transaction.newFromMetadataElementReplacement = ve.dm.TransactionBuilder.static.newFromMetadataElementReplacement;
ve.dm.Transaction.newFromContentBranchConversion = ve.dm.TransactionBuilder.static.newFromContentBranchConversion;
ve.dm.Transaction.newFromWrap = ve.dm.TransactionBuilder.static.newFromWrap;
