/*!
 * VisualEditor UserInterface DiffElement class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.DiffElement object.
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.VisualDiff} [visualDiff] Diff to visualize
 */
ve.ui.DiffElement = function VeUiDiffElement( visualDiff ) {
	var i, ilen, diff = visualDiff.diff;

	// Parent constructor
	OO.ui.Element.call( this );

	// CSS
	this.$element.addClass( 've-ui-diffElement' );
	this.classPrefix = 've-ui-diffElement-';

	// Documents
	this.oldDoc = visualDiff.oldDoc;
	this.newDoc = visualDiff.newDoc;
	this.oldDocChildren = this.oldDoc.getDocumentNode().children;
	this.newDocChildren = this.newDoc.getDocumentNode().children;

	// Diff
	this.oldToNew = diff.docChildrenOldToNew;
	this.newToOld = diff.docChildrenNewToOld;
	this.insert = diff.docChildrenInsert;
	this.remove = diff.docChildrenRemove;

	// HTML
	this.diffHtml = this.getDiffHtml();
	for ( i = 0, ilen = this.diffHtml.length; i < ilen; i++ ) {
		this.$element.append( this.diffHtml[ i ] );
	}
};

/* Inheritance */

OO.inheritClass( ve.ui.DiffElement, OO.ui.Element );

/* Methods */

/**
 * Get the HTML for displaying the diff
 *
 * @return {Array} HTML for each child of the document node
 */
ve.ui.DiffElement.prototype.getDiffHtml = function () {
	var i, j, k, ilen, jlen, klen, nodes, move,
		anyChanges = false,
		spacer = false,
		diffHtml = [],
		diffQueue = [];

	ilen = Math.max( this.oldDocChildren.length, this.newDocChildren.length );
	jlen = ilen;

	for ( i = 0, j = 0; i < ilen, j < jlen; i++, j++ ) {
		if ( this.oldDocChildren[ i ] === undefined ) {

			// Everything else in the new doc is an insert
			nodes = this.newDocChildren.slice( j );
			for ( k = 0, klen = nodes.length; k < klen; k++ ) {
				diffQueue.push( [ 'getNodeHtml', nodes[ k ], 'insert' ] );
			}

		} else if ( this.newDocChildren[ j ] === undefined ) {

			// Everything else in the old doc is a remove
			nodes = this.oldDocChildren.slice( i );
			for ( k = 0, klen = nodes.length; k < klen; k++ ) {
				diffQueue.push( [ 'getNodeHtml', nodes[ k ], 'remove' ] );
			}

		} else if ( this.remove.indexOf( i ) !== -1 ) {

			// The old node is a remove. Decrement the new node index
			// to compare the same new node to the next old node
			diffQueue.push( [ 'getNodeHtml', this.oldDocChildren[ i ], 'remove' ] );
			j--;

		} else if ( this.insert.indexOf( j ) !== -1 ) {

			// The new node is an insert. Decrement the old node index
			// to compare the same old node to the next new node
			diffQueue.push( [ 'getNodeHtml', this.newDocChildren[ j ], 'insert' ] );
			i--;

		} else if ( typeof this.newToOld[ j ] === 'number' ) {

			// The old and new node are exactly the same, but still
			// need to check if there has been a move
			move = this.newToOld[ j ] === i ? undefined :
				( this.newToOld[ j ] > i ? 'up' : 'down' );
			diffQueue.push( [ 'getNodeHtml', this.newDocChildren[ j ], 'none', move ] );

		} else {

			// The new node is modified from the old node. Get the
			// diff and also check if there has been a move
			move = this.newToOld[ j ].node === i ? undefined :
				( this.newToOld[ j ].node > i ? 'up' : 'down' );
			diffQueue.push( [ 'getChangedNodeHtml', this.newToOld[ j ].node, move ] );

		}
	}

	function isUnchanged( item ) {
		return !item || ( item[ 2 ] === 'none' && !item[ 3 ] );
	}

	for ( i = 0, ilen = diffQueue.length; i < ilen; i++ ) {
		if (
			!isUnchanged( diffQueue[ i - 1 ] ) ||
			!isUnchanged( diffQueue[ i ] ) ||
			!isUnchanged( diffQueue[ i + 1 ] )
		) {
			spacer = false;
			anyChanges = true;
			diffHtml.push(
				this[ diffQueue[ i ][ 0 ] ].apply( this, diffQueue[ i ].slice( 1 ) )
			);
		} else if ( !spacer ) {
			spacer = true;
			diffHtml.push( $( '<div class="ve-ui-diffElement-spacer">' ).text( '⋮' ) );
		}
	}

	if ( !anyChanges ) {
		return [ $( '<div class="ve-ui-diffElement-no-changes">' ).text( 'No changes' ) ];
	} else {
		return diffHtml;
	}

};

/**
 * Get the HTML for the diff of a single child of the document node that has
 * been removed from the old document, inserted into the new document, or that
 * has moved but is otherwise unchanged.
 *
 * @param {ve.dm.Node} node The node being diffed. Will be from the old
 * document if it has been removed, or the new document if it has been inserted
 * or moved
 * @param {string} action 'remove', 'insert' or, if moved, 'none'
 * @param {string} [move] 'up' or 'down' if the node has moved
 * @return {string} HTML to display the action/move
 */
ve.ui.DiffElement.prototype.getNodeHtml = function ( node, action, move ) {
	var nodeData, nodeHtml,
		nodeDoc = action === 'remove' ? this.oldDoc : this.newDoc,
		documentSlice = nodeDoc.cloneFromRange( node.getOuterRange() );

	// Get the linear model for the node
	nodeData = documentSlice.data.data;

	// Add the classes to the outer element (in case there was a move)
	nodeData[ 0 ] = this.addClassesToNode( nodeData[ 0 ], nodeDoc, action, move );

	// Get the html for the linear model with classes
	// Doc is always the new doc when inserting into the store
	documentSlice.getStore().merge( this.newDoc.getStore() );
	nodeHtml = ve.dm.converter.getDomFromModel( documentSlice ).body.innerHTML;

	if ( action !== 'none' ) {
		nodeHtml = $( '<div>' ).addClass( this.classPrefix + 'doc-child-change' ).append( nodeHtml );
	}

	return nodeHtml;
};

/**
 * Get the HTML for the diff of a single child of the document node that has
 * changed from the old document to the new document. It may also have moved.
 *
 * @param {number} oldNodeIndex The index of the old node in this.oldDocChildren
 * @param {string} [move] 'up' or 'down' if the node has moved
 * @return {string} HTML to display the action/move
 */
ve.ui.DiffElement.prototype.getChangedNodeHtml = function ( oldNodeIndex, move ) {
	var i, ilen, j, jlen, k, klen,
		iModified, jModified, classes, nodeHtml,
		newNodeIndex = this.oldToNew[ oldNodeIndex ].node,
		nodeRange = this.newDocChildren[ newNodeIndex ].getOuterRange(),
		documentSlice = this.newDoc.cloneFromRange( nodeRange ),
		nodeData = documentSlice.data.data,
		alreadyProcessed = {
			remove: {},
			insert: {}
		},
		diff = this.oldToNew[ oldNodeIndex ].diff,
		treeDiff = diff.treeDiff,
		diffInfo = diff.diffInfo,
		oldTree = diff.oldTree,
		newTree = diff.newTree,
		oldNodes = oldTree.orderedNodes,
		newNodes = newTree.orderedNodes,
		correspondingNodes = this.oldToNew[ oldNodeIndex ].correspondingNodes;

	/**
	 * Splice in the removed data for the subtree rooted at this node, from the old
	 * document.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	function highlightRemovedSubTree( nodeIndex ) {
		var i, ilen, subTreeRootNode, subTreeRootNodeData, siblingNodes,
			newPreviousNodeIndex, oldPreviousNodeIndex, insertIndex, descendants;

		// Get outer data for this node from the old doc and add remove class
		subTreeRootNode = oldNodes[ nodeIndex ];
		subTreeRootNodeData = this.oldDoc.getData( subTreeRootNode.node.getOuterRange() );
		subTreeRootNodeData[ 0 ] = this.addClassesToNode( subTreeRootNodeData[ 0 ], this.oldDoc, 'remove' );

		// Find the node that corresponds to the "previous node" of this node. The
		// "previous node" is either:
		// - the rightmost left sibling that corresponds to a node in the new document
		// - or if there isn't one, then this node's parent (which must correspond to
		// a node in the new document, or this node would have been marked already
		// processed)
		siblingNodes = subTreeRootNode.parent.children;
		for ( i = 0, ilen = siblingNodes.length; i < ilen; i++ ) {
			if ( siblingNodes[ i ].index === nodeIndex ) {
				break;
			} else {
				oldPreviousNodeIndex = siblingNodes[ i ].index;
				newPreviousNodeIndex = correspondingNodes.oldToNew[ oldPreviousNodeIndex ] || newPreviousNodeIndex;
			}
		}

		// If previous node was found among siblings, insert the removed subtree just
		// after its corresponding node in the new document. Otherwise insert the
		// removed subtree just inside its parent node's correspondign node.
		if ( newPreviousNodeIndex ) {
			insertIndex = newNodes[ newPreviousNodeIndex ].node.getRange().to - nodeRange.from;
		} else {
			newPreviousNodeIndex = correspondingNodes.oldToNew[ subTreeRootNode.parent.index ];
			insertIndex = newNodes[ newPreviousNodeIndex ].node.getRange().from - nodeRange.from;
		}
		ve.batchSplice( nodeData, insertIndex, 0, subTreeRootNodeData );

		// Mark all children as already processed
		// In the future, may also annotate all descendants
		descendants = oldTree.getNodeDescendants( subTreeRootNode );
		for ( i = 0, ilen = descendants.length; i < ilen; i++ ) {
			alreadyProcessed.remove[ descendants[ i ].index ] = true;
		}
	}

	/**
	 * Mark this node as inserted.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	function highlightInsertedSubTree( nodeIndex ) {
		var i, ilen, subTreeRootNode, subTreeRootNodeRangeStart, descendants;

		// Find index of first data element for this node
		subTreeRootNode = newNodes[ nodeIndex ];
		subTreeRootNodeRangeStart = subTreeRootNode.node.getOuterRange().from - nodeRange.from;

		// Add insert class
		nodeData[ subTreeRootNodeRangeStart ] = this.addClassesToNode(
			nodeData[ subTreeRootNodeRangeStart ], this.newDoc, 'insert'
		);

		// Mark all children as already processed
		// In the future, may also annotate all descendants
		descendants = newTree.getNodeDescendants( subTreeRootNode );
		for ( i = 0, ilen = descendants.length; i < ilen; i++ ) {
			alreadyProcessed.insert[ descendants[ i ].index ] = true;
		}
	}

	/**
	 * Mark this node as changed and, if it is a content branch node, splice in
	 * the diff data.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	function highlightChangedSubTree( nodeIndex ) {
		var subTreeRootNode, subTreeRootNodeRangeStart, subTreeRootNodeData, annotatedData;

		// The new node was changed.
		// Get data for this node
		subTreeRootNode = newNodes[ nodeIndex ];
		subTreeRootNodeRangeStart = subTreeRootNode.node.getOuterRange().from - nodeRange.from;

		if ( subTreeRootNode.node instanceof ve.dm.ContentBranchNode ) {
			// If node is a CBN, splice in the annotated diff
			subTreeRootNodeData = diffInfo[ k ].linearDiff;
			annotatedData = this.annotateNode( subTreeRootNodeData );
			ve.batchSplice( nodeData, subTreeRootNodeRangeStart + 1, subTreeRootNode.node.length, annotatedData );
		} else {
			// If node is a BN, add change class
			nodeData[ subTreeRootNodeRangeStart ] = this.addClassesToNode(
				nodeData[ subTreeRootNodeRangeStart ], this.newDoc, 'change'
			);
		}
	}

	// Iterate backwards over trees so that changes are made from right to left
	// of the data, to avoid having to update ranges
	ilen = Math.max( oldNodes.length, newNodes.length );
	jlen = ilen;
	for ( i = 0, j = 0; i < ilen && j < jlen; i++, j++ ) {

		iModified = newNodes.length - 1 - i;
		jModified = oldNodes.length - 1 - j;

		if ( iModified < 0 ) {

			// The rest of the nodes have been removed
			if ( !( jModified in alreadyProcessed.remove ) ) {
				highlightRemovedSubTree.call( this, jModified );
			}

		} else if ( jModified < 0 ) {

			// The rest of the nodes have been inserted
			if ( !( iModified in alreadyProcessed.insert ) ) {
				highlightInsertedSubTree.call( this, iModified );
			}

		} else if ( correspondingNodes.newToOld[ iModified ] === jModified ) {

			// The new node was changed.
			for ( k = 0, klen = treeDiff.length; k < klen; k++ ) {
				if ( treeDiff[ k ][ 0 ] === iModified && treeDiff[ k ][ 1 ] === jModified ) {
					if ( !( iModified in alreadyProcessed.remove ) &&
						!( iModified in alreadyProcessed.insert ) ) {

						highlightChangedSubTree.call( this, iModified );

					}
				}
			}

		} else if ( correspondingNodes.newToOld[ iModified ] === undefined ) {

			// The new node was inserted.
			if ( !( iModified in alreadyProcessed.insert ) ) {
				highlightInsertedSubTree.call( this, iModified );
			}
			j--;

		} else if ( correspondingNodes.newToOld[ iModified ] < jModified ) {

			// The old node was removed.
			if ( !( jModified in alreadyProcessed.remove ) ) {
				highlightRemovedSubTree.call( this, jModified );
			}
			i--;

		}
	}

	documentSlice.getStore().merge( this.newDoc.getStore() );
	nodeHtml = ve.dm.converter.getDomFromModel( documentSlice ).body.innerHTML;

	// The following classes are used here:
	// * ve-ui-diffElement-doc-child-change
	// * ve-ui-diffElement-up
	// * ve-ui-diffElement-down
	classes = this.classPrefix + 'doc-child-change' + ( move ? ' ' + this.classPrefix + move : '' );
	nodeHtml = $( '<div>' ).addClass( classes ).append( nodeHtml );

	return nodeHtml;

};

/**
 * Add classes to highlight diff actions
 *
 * @param {Object} nodeData Linear data to be highlighted
 * @param {ve.dm.Document} nodeDoc The document from which the data is taken
 * @param {string} action 'remove', 'insert' or 'change'
 * @param {string} [move] 'up' or 'down' if the node has moved
 * @return {Object} Highlighted linear data
 */
ve.ui.DiffElement.prototype.addClassesToNode = function ( nodeData, nodeDoc, action, move ) {
	var originalDomElementsIndex,
		domElement, domElements,
		node = ve.copy( nodeData ),
		classes = [];

	// The following classes are used here:
	// * ve-ui-diffElement-up
	// * ve-ui-diffElement-down
	// * ve-ui-diffElement-remove
	// * ve-ui-diffElement-insert
	// * ve-ui-diffElement-change
	if ( action ) {
		classes.push( this.classPrefix + action );
	}
	if ( move ) {
		classes.push( this.classPrefix + move );
	}

	// Don't let any nodes get unwrapped
	if ( ve.getProp( node, 'internal', 'generated' ) ) {
		delete node.internal.generated;
	}

	if ( ve.getProp( node, 'attributes', 'unrecognizedClasses' ) ) {
		// ClassAttributeNodes don't copy over original classes, so
		// add to the unrecognizedClasses list instead
		// TODO: Other node types may take control of their class lists
		node.attributes.unrecognizedClasses.push( classes );
	} else {
		if ( node.originalDomElementsIndex ) {
			domElements = ve.copy( nodeDoc.getStore().value( node.originalDomElementsIndex ) );
			domElements[ 0 ] = domElements[ 0 ].cloneNode( true );
			domElements[ 0 ].classList.add.apply( domElements[ 0 ].classList, classes );
		} else {
			domElement = document.createElement( 'span' );
			domElement.setAttribute( 'class', classes.join( ' ' ) );
			domElements = [ domElement ];
		}

		originalDomElementsIndex = this.newDoc.getStore().index(
			domElements, domElements.map( ve.getNodeHtml ).join( '' )
		);

		node.originalDomElementsIndex = originalDomElementsIndex;
	}

	return node;
};

/**
 * Annotate some data to highlight diff
 *
 * @param {Array} linearDiff Linear diff, mapping arrays of linear data to diff
 * actions (remove, insert or retain)
 * @return {Array} Data with annotations added
 */
ve.ui.DiffElement.prototype.annotateNode = function ( linearDiff ) {
	var i, ilen, range, type, annType,
		start = 0, // The starting index for a range for building an annotation
		end, transaction, annotatedLinearDiff,
		domElement, domElements, originalDomElementsIndex,
		diffDoc, diffDocData, diffClass;

	// Make a new document from the diff
	diffDocData = linearDiff[ 0 ][ 1 ];
	for ( i = 1, ilen = linearDiff.length; i < ilen; i++ ) {
		diffDocData = diffDocData.concat( linearDiff[ i ][ 1 ] );
	}
	diffDoc = this.newDoc.cloneWithData( diffDocData );

	// Add spans with the appropriate class for removes and inserts
	// TODO: do insert and remove outside of loop
	for ( i = 0; i < ilen; i++ ) {
		end = start + linearDiff[ i ][ 1 ].length;
		if ( start !== end ) {
			range = { start: start, end: end };
			type = linearDiff[ i ][ 0 ];
			if ( type === 1 || type === -1 ) {
				diffClass = this.classPrefix + ( type === 1 ? 'insert' : 'remove' );
				domElement = document.createElement( type === 1 ? 'ins' : 'del' );
				domElement.setAttribute( 'class', diffClass );
				domElements = [ domElement ];
				originalDomElementsIndex = diffDoc.getStore().index(
					domElements,
					domElements.map( ve.getNodeHtml ).join( '' )
				);
				annType = type === 1 ? 'textStyle/insert' : 'textStyle/delete';
				transaction = ve.dm.TransactionBuilder.static.newFromAnnotation(
					diffDoc, range, 'set',
					ve.dm.annotationFactory.create(
						annType,
						{
							type: annType,
							originalDomElementsIndex: originalDomElementsIndex
						}
					)
				);
				diffDoc.commit( transaction );
			}
		}
		start = end;
	}

	// Merge the stores and get the data
	this.newDoc.getStore().merge( diffDoc.getStore() );
	annotatedLinearDiff = diffDoc.getData( { start: 0, end: diffDoc.getLength() } );

	return annotatedLinearDiff;
};
