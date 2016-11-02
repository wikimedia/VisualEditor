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
		diffHtml = [];

	ilen = Math.max( this.oldDocChildren.length, this.newDocChildren.length );
	jlen = ilen;

	for ( i = 0, j = 0; i < ilen, j < jlen; i++, j++ ) {
		if ( this.oldDocChildren[ i ] === undefined ) {

			// Everything else in the new doc is an insert
			nodes = this.newDocChildren.slice( j );
			for ( k = 0, klen = nodes.length; k < klen; k++ ) {
				diffHtml.push( this.getNodeHtml( nodes[ k ], 'insert' ) );
			}

		} else if ( this.newDocChildren[ j ] === undefined ) {

			// Everything else in the old doc is a remove
			nodes = this.oldDocChildren.slice( i );
			for ( k = 0, klen = nodes.length; k < klen; k++ ) {
				diffHtml.push( this.getNodeHtml( nodes[ k ], 'remove' ) );
			}

		} else if ( this.remove.indexOf( i ) !== -1 ) {

			// The old node is a remove. Decrement the new node index
			// to compare the same new node to the next old node
			diffHtml.push( this.getNodeHtml( this.oldDocChildren[ i ], 'remove' ) );
			j--;

		} else if ( this.insert.indexOf( j ) !== -1 ) {

			// The new node is an insert. Decrement the old node index
			// to compare the same old node to the next new node
			diffHtml.push( this.getNodeHtml( this.newDocChildren[ j ], 'insert' ) );
			i--;

		} else if ( typeof ( this.newToOld[ j ] ) === 'number' ) {

			// The old and new node are exactly the same, but still
			// need to check if there has been a move
			move = this.newToOld[ j ] === i ? undefined :
				( this.newToOld[ j ] > i ? 'up' : 'down' );
			diffHtml.push( this.getNodeHtml( this.newDocChildren[ j ], 'none', move ) );

		} else {

			// The new node is modified from the old node. Get the
			// diff and also check if there has been a move
			move = this.newToOld[ j ].node === i ? undefined :
				( this.newToOld[ j ].node > i ? 'up' : 'down' );
			diffHtml.push( this.getChangedNodeHtml( this.newToOld[ j ].node, move ) );

		}
	}

	return diffHtml;
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
	var nodeData, nodeDoc, nodeHtml;

	nodeDoc = action === 'remove' ? this.oldDoc : this.newDoc;

	// Get the linear model for the node
	nodeData = nodeDoc.getData( node.getOuterRange() );

	// Add the classes to the outer element (in case there was a move)
	nodeData[ 0 ] = this.addClassesToNode( nodeData[ 0 ], nodeDoc, action, move );

	// Get the html for the linear model with classes
	// Doc is always the new doc when inserting into the store
	nodeHtml = ve.dm.converter.getDomFromModel(
		nodeDoc.cloneWithData(
			new ve.dm.ElementLinearData( this.newDoc.getStore(), nodeData )
		)
	).body.innerHTML;

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
		iModified, jModified, nodeHtml,
		newNodeIndex = this.oldToNew[ oldNodeIndex ].node,
		nodeRange = this.newDocChildren[ newNodeIndex ].getOuterRange(),
		nodeData = this.newDoc.getData( nodeRange ),
		alreadyProcessed = {
			remove: [],
			insert: []
		},
		markedNodes = {
			remove: [],
			insert: []
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
	 * Modify the linear data to reflect the diff, one node at a time. (Nodes here
	 * are descendants of the child of the document, which have been tree diffed.)
	 * At this level, a ve.dm.BranchNode could either have been inserted or removed,
	 * whereas a ve.dm.ContentBranchNode could also have been changed, meaning that
	 * part of its data has been inserted and/or removed.
	 *
	 * We start with data from the new document, then (1) splice in data
	 * corresponding to any removed nodes from the old document, and (2) highlight
	 * and data that has been removed or inserted.
	 *
	 * @param {number} nodeIndex The index of the node in its tree's orderedNodes
	 * array.
	 * @param {string} action 'remove', 'insert' or 'change'
	 * @param {string} [move] 'up' or 'down' if the node has moved
	 */
	function nodesInsertOrRemove( nodeIndex, action, move ) {
		var i, ilen,
			doc, nodes,
			subNodeTreeNode,
			subNode,
			subNodeRange,
			subNodeData,
			spliceIndex,
			annotatedData,
			descendant, descendants,
			outerNodeRange, outerNodeData,
			correspondingNodesObject, tree,
			parentNode, siblingNodes,
			rightMostLeftSiblingNode,
			oldPreviousNode, newPreviousNodeRange,
			insertIndex;

		// Define tree and doc
		tree = action === 'remove' ? oldTree : newTree;
		doc = action === 'remove' ? this.oldDoc : this.newDoc;
		nodes = action === 'remove' ? oldNodes : newNodes;

		// Get the outer node
		outerNodeRange = action === 'remove' ? tree.orderedNodes[ nodeIndex ].node.getOuterRange() : nodeRange;
		outerNodeData = action === 'remove' ? doc.getData( outerNodeRange ) : nodeData;
		subNodeTreeNode = nodes[ nodeIndex ];

		// Get subNode and add action class
		subNode = subNodeTreeNode.node;
		subNodeRange = subNode.getOuterRange();
		spliceIndex = subNodeRange.from - outerNodeRange.from;
		subNodeData = outerNodeData.splice( spliceIndex, subNodeRange.to - subNodeRange.from );
		subNodeData[ 0 ] = this.addClassesToNode( subNodeData[ 0 ], doc, action, move );

		if ( action === 'remove' ) {
			correspondingNodesObject = correspondingNodes.oldToNew;
			parentNode = subNodeTreeNode.parent;
			siblingNodes = parentNode.children;
			rightMostLeftSiblingNode = null;
		} else {
			correspondingNodesObject = correspondingNodes.newToOld;
		}

		// If node is a CBN, annotate it
		if ( subNode instanceof ve.dm.ContentBranchNode ) {
			annotatedData = subNodeData.splice( 1, subNodeData.length - 2 );
			annotatedData = action === 'change' ? diffInfo[ k ].linearDiff : annotatedData;
			annotatedData = this.annotateNode( this.getDataAsLinearDiff( annotatedData, action ) );
			ve.batchSplice( subNodeData, 1, 0, annotatedData );
		}

		// Splice in the modified subNode
		ve.batchSplice( outerNodeData, spliceIndex, 0, subNodeData );

		// If action is insert or remove, make node's descendants the same
		if ( action !== 'change' ) {
			descendants = tree.getNodeDescendants( subNodeTreeNode );
			for ( i = 0, ilen = descendants.length; i < ilen; i++ ) {

				descendant = descendants[ i ];

				if ( descendant.index in correspondingNodesObject ) {

					markedNodes[ action ].push( correspondingNodesObject[ descendant.index ] );

				} else if ( correspondingNodes[ action ].indexOf( descendant.index ) !== -1 ) {

					// Get subNode and add action class
					subNode = descendant.node;
					subNodeRange = subNode.getOuterRange();
					spliceIndex = subNodeRange.from - outerNodeRange.from;
					subNodeData = outerNodeData.splice( spliceIndex, subNodeRange.to - subNodeRange.from );
					subNodeData[ 0 ] = this.addClassesToNode( subNodeData[ 0 ], doc, action );

					// If node is a CBN, annotate it
					if ( subNode instanceof ve.dm.ContentBranchNode ) {
						annotatedData = subNodeData.splice( 1, subNodeData.length - 2 );
						annotatedData = action === 'change' ? diffInfo[ k ].linearDiff : annotatedData;
						annotatedData = this.annotateNode( this.getDataAsLinearDiff( annotatedData, action ) );
						ve.batchSplice( subNodeData, 1, 0, annotatedData );
					}

					// Splice in the modified subNode
					ve.batchSplice( outerNodeData, spliceIndex, 0, subNodeData );
					alreadyProcessed[ action ].push( descendant.index );

				}
			}
		}

		if ( action === 'insert' || action === 'change' ) {
			nodeData = outerNodeData;
		} else {
			// Check if this node has left siblings
			for ( i = 0, ilen = siblingNodes.length; i < ilen; i++ ) {
				// Children should be in index order
				if ( siblingNodes[ i ].index === subNodeTreeNode.index ) {
					break;
				} else {
					rightMostLeftSiblingNode = siblingNodes[ i ];
				}
			}
			// If so, find the rightmost one and its corresponding new node
			if ( rightMostLeftSiblingNode !== null ) {
				oldPreviousNode = rightMostLeftSiblingNode;
				newPreviousNodeRange = newNodes[ correspondingNodes.oldToNew[ oldPreviousNode.index ] ].node.getOuterRange();
				insertIndex = newPreviousNodeRange.to - nodeRange.from - 1;
			} else {
				oldPreviousNode = parentNode;
				newPreviousNodeRange = newNodes[ correspondingNodes.oldToNew[ oldPreviousNode.index ] ].node.getRange();
				insertIndex = newPreviousNodeRange.from - nodeRange.from;
			}
			// Splice in the subnode's annotated data just after the new node's open tag
			ve.batchSplice( nodeData, insertIndex, 0, outerNodeData );
		}

	}

	ilen = Math.max( oldNodes.length, newNodes.length );
	jlen = ilen;
	for ( i = 0, j = 0; i < ilen && j < jlen; i++, j++ ) {

		iModified = newNodes.length - 1 - i;
		jModified = oldNodes.length - 1 - j;

		if ( iModified < 0 ) {

			// The rest of the nodes have been removed
			if ( alreadyProcessed.remove.indexOf( jModified ) === -1 ) {
				nodesInsertOrRemove.call( this, jModified, 'remove', move );
			}

		} else if ( jModified < 0 ) {

			// The rest of the nodes have been inserted
			if ( alreadyProcessed.insert.indexOf( iModified ) === -1 ) {
				nodesInsertOrRemove.call( this, iModified, 'insert', move );
			}

		} else if ( correspondingNodes.newToOld[ iModified ] === jModified ) {

			// Insert, remove or check for change
			if ( markedNodes.insert.indexOf( iModified ) !== -1 ) {
				nodesInsertOrRemove.call( this, iModified, 'insert', move );
			} else if ( markedNodes.remove.indexOf( jModified ) !== -1 ) {
				nodesInsertOrRemove.call( this, jModified, 'remove', move );
			} else {
				for ( k = 0, klen = treeDiff.length; k < klen; k++ ) {
					if ( treeDiff[ k ][ 0 ] === iModified && treeDiff[ k ][ 1 ] === jModified ) {
						nodesInsertOrRemove.call( this, iModified, 'change', move );
					}
				}
			}

		} else if ( correspondingNodes.newToOld[ iModified ] === undefined ) {

			// The new node was inserted
			if ( alreadyProcessed.insert.indexOf( iModified ) === -1 ) {
				nodesInsertOrRemove.call( this, iModified, 'insert', move );
			}
			j--;

		} else if ( correspondingNodes.newToOld[ iModified ] < jModified ) {

			// The old node was removed
			if ( alreadyProcessed.remove.indexOf( jModified ) === -1 ) {
				nodesInsertOrRemove.call( this, jModified, 'remove', move );
			}
			i--;

		}
	}

	nodeHtml = ve.dm.converter.getDomFromModel(
		this.newDoc.cloneWithData(
			new ve.dm.ElementLinearData( this.newDoc.getStore(), nodeData )
		)
	).body.innerHTML;

	nodeHtml = $( '<div>' ).addClass( this.classPrefix + 'doc-child-change' ).append( nodeHtml );

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

	if ( action ) {
		classes.push( this.classPrefix + action );
	}
	if ( move ) {
		classes.push( this.classPrefix + move );
	}

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

	return node;
};

/**
 * Get linear data in the linear diff format
 *
 * @param {Array} nodeData
 * @param {string} action 'remove', 'insert' or 'change'
 * @return {Array}
 */
ve.ui.DiffElement.prototype.getDataAsLinearDiff = function ( nodeData, action ) {
	switch ( action ) {
		case 'insert':
			return [ [ 1, nodeData ] ];
		case 'remove':
			return [ [ -1, nodeData ] ];
		case 'change':
			return nodeData;
	}
};

/**
 * Annotate some data to highlight diff
 *
 * @param {Array} linearDiff Linear diff, mapping arrays of linear data to diff
 * actions (remove, insert or retain)
 * @return {Array} Data with annotations added
 */
ve.ui.DiffElement.prototype.annotateNode = function ( linearDiff ) {
	var i, ilen, range,
		start = 0, // The starting index for a range for building an annotation
		end, transaction, annotatedLinearDiff,
		domElement, domElements, originalDomElementsIndex,
		diffDoc, diffDocData, diffClass;

	// Make a new document from the diff
	diffDocData = linearDiff[ 0 ][ 1 ];
	for ( i = 1, ilen = linearDiff.length; i < ilen; i++ ) {
		diffDocData = diffDocData.concat( linearDiff[ i ][ 1 ] );
	}
	diffDoc = ve.init.target.surface.model.documentModel.cloneWithData( diffDocData );

	// Add spans with the appropriate class for removes and inserts
	// TODO: do insert and remove outside of loop
	for ( i = 0; i < ilen; i++ ) {
		end = start + linearDiff[ i ][ 1 ].length;
		if ( start !== end ) {
			range = { start: start, end: end };
			if ( linearDiff[ i ][ 0 ] === 1 || linearDiff[ i ][ 0 ] === -1 ) {
				diffClass = this.classPrefix + ( linearDiff[ i ][ 0 ] === 1 ? 'insert' : 'remove' );
				domElement = document.createElement( 'span' );
				domElement.setAttribute( 'class', diffClass );
				domElements = [ domElement ];
				originalDomElementsIndex = diffDoc.getStore().index(
					domElements,
					domElements.map( ve.getNodeHtml ).join( '' )
				);
				transaction = ve.dm.Transaction.newFromAnnotation( diffDoc, range, 'set', new ve.dm.SpanAnnotation( {
					type: 'textStyle/span',
					originalDomElementsIndex: originalDomElementsIndex
				} ) );
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
