/*!
 * VisualEditor UserInterface DiffElement class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates a ve.ui.DiffElement object.
 *
 * @class
 * @extends OO.ui.Element
 *
 * @constructor
 * @param {ve.dm.VisualDiff} [visualDiff] Diff to visualize
 * @param {Object} [config]
 */
ve.ui.DiffElement = function VeUiDiffElement( visualDiff, config ) {
	var tx, diff = visualDiff.diff;

	// Parent constructor
	ve.ui.DiffElement.super.call( this, config );

	this.elementId = 0;

	// Documents
	this.oldDoc = visualDiff.oldDoc;
	this.newDoc = visualDiff.newDoc;
	this.oldDocChildren = visualDiff.oldDocChildren;
	this.newDocChildren = visualDiff.newDocChildren;

	// Merge the old internal list into the new document, so that it knows
	// about removed references
	tx = ve.dm.TransactionBuilder.static.newFromDocumentInsertion( this.newDoc, 0, this.oldDoc, new ve.Range( 0 ) );
	this.newDoc.commit( tx );

	// Internal list
	this.newDocInternalListNode = visualDiff.newDocInternalListNode;
	this.oldDocInternalListNode = visualDiff.oldDocInternalListNode;

	// Diff
	this.oldToNew = diff.docDiff.rootChildrenOldToNew;
	this.newToOld = diff.docDiff.rootChildrenNewToOld;
	this.insert = diff.docDiff.rootChildrenInsert;
	this.remove = diff.docDiff.rootChildrenRemove;
	this.moves = diff.docDiff.moves;
	this.internalListDiff = diff.internalListDiff;

	this.$overlays = $( '<div>' ).addClass( 've-ui-diffElement-overlays' );
	this.$content = $( '<div>' ).addClass( 've-ui-diffElement-content' );
	this.$document = $( '<div>' ).addClass( 've-ui-diffElement-document' );
	this.$sidebar = $( '<div>' ).addClass( 've-ui-diffElement-sidebar' );

	this.descriptions = new ve.ui.ChangeDescriptionsSelectWidget();
	this.descriptions.connect( this, { highlight: 'onDescriptionsHighlight' } );
	this.descriptionItemsStack = [];

	this.$document.on( {
		mousemove: this.onDocumentMouseMove.bind( this )
	} );

	// DOM
	this.$element
		.append(
			this.$overlays,
			this.$content.append( this.$document ),
			this.$sidebar.append( this.descriptions.$element )
		)
		.addClass( 've-ui-diffElement' );

	this.renderDiff();
};

/* Inheritance */

OO.inheritClass( ve.ui.DiffElement, OO.ui.Element );

/* Static methods */

/**
 * Compare attribute sets between two elements
 *
 * @param {Object} oldAttributes Old attributes
 * @param {Object} newAttributes New attributes
 * @return {Object} Keyed set of attributes
 */
ve.ui.DiffElement.static.compareAttributes = function ( oldAttributes, newAttributes ) {
	var key,
		attributeChanges = {};

	function compareKeys( a, b ) {
		if ( typeof a === 'object' && typeof b === 'object' ) {
			return ve.compare( a, b );
		} else {
			return a === b;
		}
	}

	for ( key in oldAttributes ) {
		if ( !compareKeys( oldAttributes[ key ], newAttributes[ key ] ) ) {
			attributeChanges[ key ] = { from: oldAttributes[ key ], to: newAttributes[ key ] };
		}
	}
	for ( key in newAttributes ) {
		if ( !oldAttributes.hasOwnProperty( key ) && newAttributes[ key ] !== undefined ) {
			attributeChanges[ key ] = { from: oldAttributes[ key ], to: newAttributes[ key ] };
		}
	}
	return attributeChanges;
};

/* Methods */

/**
 * Get a diff element in the document from its elementId
 *
 * @param {number} elementId ID
 * @return {jQuery} Element
 */
ve.ui.DiffElement.prototype.getDiffElementById = function ( elementId ) {
	return this.$document.find( '[data-diff-id=' + elementId + ']' );
};

/**
 * Handle description item hightlight events
 *
 * @param {OO.ui.OptionWidget} item Description item
 */
ve.ui.DiffElement.prototype.onDescriptionsHighlight = function ( item ) {
	var i, l, elementRects, overlayRect;
	if ( this.lastItem ) {
		this.getDiffElementById( this.lastItem.getData() ).css( 'outline', '' );
		this.$overlays.empty();
	}
	if ( item ) {
		overlayRect = this.$overlays[ 0 ].getBoundingClientRect();
		elementRects = ve.ce.FocusableNode.static.getRectsForElement( this.getDiffElementById( item.getData() ), overlayRect ).rects;
		for ( i = 0, l = elementRects.length; i < l; i++ ) {
			this.$overlays.append(
				$( '<div>' ).addClass( 've-ui-diffElement-highlight' ).css( {
					top: elementRects[ i ].top,
					left: elementRects[ i ].left,
					width: elementRects[ i ].width,
					height: elementRects[ i ].height
				} )
			);
		}
		this.lastItem = item;
	}
};

/**
 * Handle document mouse move events
 *
 * @param {jQuery.Event} e Mouse move event
 */
ve.ui.DiffElement.prototype.onDocumentMouseMove = function ( e ) {
	var elementId = $( e.target ).closest( '[data-diff-id]' ).attr( 'data-diff-id' );
	if ( elementId !== undefined ) {
		this.descriptions.highlightItem(
			this.descriptions.getItemFromData( +elementId )
		);
	} else {
		this.descriptions.highlightItem();
	}
};

/**
 * Reposition the description items so they are not above their position in the document
 */
ve.ui.DiffElement.prototype.positionDescriptions = function () {
	var diffElement = this;
	this.descriptions.getItems().forEach( function ( item ) {
		var elementRect, itemRect, $element;

		item.$element.css( 'margin-top', '' );

		itemRect = item.$element[ 0 ].getBoundingClientRect();
		$element = diffElement.getDiffElementById( item.getData() );
		if ( !$element.length ) {
			// Changed element isn't visible - probably shouldn't happen
			return;
		}
		elementRect = ve.ce.FocusableNode.static.getRectsForElement( $element ).boundingRect;

		if ( elementRect.top > itemRect.top ) {
			item.$element.css( 'margin-top', elementRect.top - itemRect.top - 5 );
		}

	} );
	this.$document.css( 'min-height', this.$sidebar.height() );
};

/**
 * Render the diff
 */
ve.ui.DiffElement.prototype.renderDiff = function () {
	var i, j, ilen, jlen, move, documentSpacerNode, internalListSpacerNode, li, groupName,
		noChanges, group, headingNode, names, category, internalListGroup,
		internalListDiffDiv, anyInternalListChanges, internalListItem,
		documentNode = this.$document[ 0 ],
		anyChanges = false,
		diffQueue = [],
		internalListDiffQueue = [];

	function processQueue( queue, parentNode, spacerNode ) {
		var spacer, elements, i, ilen;

		function isUnchanged( item ) {
			return !item || ( item[ 2 ] === 'none' && !item[ 3 ] );
		}

		for ( i = 0, ilen = queue.length; i < ilen; i++ ) {
			if (
				!isUnchanged( queue[ i - 1 ] ) ||
				!isUnchanged( queue[ i ] ) ||
				!isUnchanged( queue[ i + 1 ] )
			) {
				spacer = false;
				anyChanges = true;
				elements = this[ queue[ i ][ 0 ] ].apply( this, queue[ i ].slice( 1 ) );
				while ( elements.length ) {
					parentNode.appendChild(
						parentNode.ownerDocument.adoptNode( elements[ 0 ] )
					);
					elements.shift();
				}
			} else if ( !spacer ) {
				spacer = true;
				parentNode.appendChild(
					parentNode.ownerDocument.adoptNode( spacerNode.cloneNode( true ) )
				);
			}
		}

		return elements;
	}

	documentSpacerNode = document.createElement( 'div' );
	documentSpacerNode.setAttribute( 'class', 've-ui-diffElement-spacer' );
	documentSpacerNode.appendChild( document.createTextNode( '⋮' ) );

	// Wrap iternal list spacer in <ol> to match indentation
	internalListSpacerNode = document.createElement( 'ol' );
	internalListSpacerNode.setAttribute( 'class', 've-ui-diffElement-internalListSpacer' );
	li = document.createElement( 'li' );
	internalListSpacerNode.appendChild( li );
	li.appendChild( documentSpacerNode.cloneNode( true ) );

	// Render the internal list diff, i.e. all reflists with changed nodes.
	// TODO: It would be nice if the reflists could be rendered in place in the document; however,
	// they could be hard to find if they are within a template, so for now they are just shown at
	// the end of the diff.
	internalListDiffDiv = document.createElement( 'div' );
	internalListDiffDiv.setAttribute( 'class', 've-ui-diffElement-internalListDiff' );
	for ( group in this.internalListDiff ) {

		internalListGroup = this.internalListDiff[ group ];
		names = group.split( '/' );
		category = names[ 0 ].toLowerCase();
		groupName = names[ 1 ];
		if ( groupName ) {
			groupName = ve.msg( 'visualeditor-internal-list-diff-group-name-' + category, groupName );
		} else {
			groupName = ve.msg( 'visualeditor-internal-list-diff-default-group-name-' + category );
		}

		if ( !internalListGroup.changes ) {
			continue;
		}

		anyInternalListChanges = true;
		headingNode = document.createElement( 'h2' );
		headingNode.setAttribute( 'data-diff-action', 'none' );
		headingNode.appendChild( document.createTextNode( groupName ) );
		internalListDiffDiv.appendChild( headingNode );
		for ( i = 0, ilen = internalListGroup.length; i < ilen; i++ ) {
			internalListItem = internalListGroup[ i ];

			if ( internalListItem.diff === 1 ) {

				internalListDiffQueue.push( [ 'getInternalListNodeElements', internalListItem, 'insert' ] );

			} else if ( internalListItem.diff === -1 ) {

				internalListDiffQueue.push( [ 'getInternalListNodeElements', internalListItem, 'remove' ] );

			} else if ( internalListItem.diff === 0 ) {

				internalListDiffQueue.push( [ 'getInternalListNodeElements', internalListItem, 'none' ] );

			} else {

				internalListDiffQueue.push( [ 'getInternalListChangedNodeElements', internalListItem ] );

			}
		}

		processQueue.call( this, internalListDiffQueue, internalListDiffDiv, internalListSpacerNode );
		internalListDiffQueue = [];
	}

	ilen = Math.max( this.oldDocChildren.length, this.newDocChildren.length );
	jlen = ilen;

	for ( i = 0, j = 0; i < ilen || j < jlen; i++, j++ ) {
		if ( this.oldDocChildren[ i ] === undefined ) {

			// Everything else in the new doc is an insert
			while ( j < this.newDocChildren.length ) {
				diffQueue.push( [ 'getNodeElements', this.newDocChildren[ j ], 'insert' ] );
				j++;
			}

		} else if ( this.newDocChildren[ j ] === undefined ) {

			// Everything else in the old doc is a remove
			while ( i < this.oldDocChildren.length ) {
				diffQueue.push( [ 'getNodeElements', this.oldDocChildren[ i ], 'remove' ] );
				i++;
			}

		} else if ( this.remove.indexOf( i ) !== -1 ) {

			// The old node is a remove. Decrement the new node index
			// to compare the same new node to the next old node
			diffQueue.push( [ 'getNodeElements', this.oldDocChildren[ i ], 'remove' ] );
			j--;

		} else if ( this.insert.indexOf( j ) !== -1 ) {

			// The new node is an insert. Decrement the old node index
			// to compare the same old node to the next new node
			diffQueue.push( [ 'getNodeElements', this.newDocChildren[ j ], 'insert' ] );
			i--;

		} else if ( typeof this.newToOld[ j ] === 'number' ) {

			// The old and new node are exactly the same, but there may be a move
			move = this.moves[ j ] === 0 ? undefined : this.moves[ j ];
			diffQueue.push( [ 'getNodeElements', this.newDocChildren[ j ], 'none', move ] );

		} else {

			// The new node is modified from the old node, and there may be a move
			move = this.moves[ j ] === 0 ? undefined : this.moves[ j ];
			diffQueue.push( [ 'getChangedNodeElements', this.newToOld[ j ].node, move ] );

		}
	}

	processQueue.call( this, diffQueue, documentNode, documentSpacerNode );
	this.descriptions.addItems( this.descriptionItemsStack );
	this.descriptionItemsStack = [];

	if ( anyInternalListChanges ) {
		documentNode.appendChild( internalListDiffDiv );
	}

	ve.resolveAttributes( documentNode, this.newDoc.getHtmlDocument(), ve.dm.Converter.static.computedAttributes );
	ve.targetLinksToNewWindow( documentNode );

	if ( !anyChanges ) {
		noChanges = document.createElement( 'div' );
		noChanges.setAttribute( 'class', 've-ui-diffElement-no-changes' );
		noChanges.appendChild( document.createTextNode( ve.msg( 'visualeditor-diff-no-changes' ) ) );
		documentNode.innerHTML = '';
		documentNode.appendChild( noChanges );
	}

	this.$element.toggleClass( 've-ui-diffElement-hasDescriptions', !this.descriptions.isEmpty() );
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
 * @return {HTMLElement[]} Elements (not owned by window.document)
 */
ve.ui.DiffElement.prototype.getNodeElements = function ( node, action, move ) {
	var nodeData, doc, body, element, annIndex, annType,
		nodeDoc = action === 'remove' ? this.oldDoc : this.newDoc,
		documentSlice = nodeDoc.cloneFromRange( node.getOuterRange() );

	// Get the linear model for the node
	nodeData = documentSlice.data.data;

	// Add the classes to the outer element (in case there was a move)
	nodeData[ 0 ] = this.addAttributesToNode( nodeData[ 0 ], nodeDoc, { 'data-diff-action': action, 'data-diff-move': move } );

	if ( action !== 'none' ) {
		// Add <del> or <ins> annotation
		annType = action === 'remove' ? 'textStyle/delete' : 'textStyle/insert';
		annIndex = documentSlice.getStore().index(
			ve.dm.annotationFactory.create( annType, {
				type: annType
			} )
		);
		ve.dm.Document.static.addAnnotationsToData(
			nodeData,
			new ve.dm.AnnotationSet( documentSlice.getStore(), [ annIndex ] )
		);
	}

	// Get the html for the linear model with classes
	// Doc is always the new doc when inserting into the store
	documentSlice.getStore().merge( this.newDoc.getStore() );

	// forClipboard is true, so that we can render otherwise invisible nodes
	doc = ve.dm.converter.getDomFromModel( documentSlice, true );
	body = doc.body;

	if ( action !== 'none' ) {
		element = doc.createElement( 'div' );
		element.setAttribute( 'class', 've-ui-diffElement-doc-child-change' );
		while ( body.childNodes.length ) {
			element.appendChild( body.childNodes[ 0 ] );
		}
		return [ element ];
	}

	// Convert NodeList to real array
	return Array.prototype.slice.call( body.childNodes );
};

/**
 * Get the HTML for the diff of a single child of the document node that has
 * changed from the old document to the new document. It may also have moved.
 *
 * @param {number} oldNodeIndex The index of the old node in this.oldDocChildren
 * @param {string} [move] 'up' or 'down' if the node has moved
 * @return {HTMLElement[]} HTML elements to display the action/move
 */
ve.ui.DiffElement.prototype.getChangedNodeElements = function ( oldNodeIndex, move ) {
	var i, ilen, j, jlen, k, klen,
		newIndex, oldIndex, element, body,
		newNodeIndex = this.oldToNew[ oldNodeIndex ].node,
		nodeRange = this.newDocChildren[ newNodeIndex ].getOuterRange(),
		documentSlice = this.newDoc.cloneFromRange( nodeRange ),
		nodeData = documentSlice.data.data,
		diff = this.oldToNew[ oldNodeIndex ].diff,
		treeDiff = diff.treeDiff,
		diffInfo = diff.diffInfo,
		oldTree = diff.oldTree,
		newTree = diff.newTree,
		oldNodes = oldTree.orderedNodes,
		newNodes = newTree.orderedNodes,
		correspondingNodes = this.oldToNew[ oldNodeIndex ].correspondingNodes,
		structuralRemoves = [],
		highestRemovedAncestors = {};

	/**
	 * Splice in the removed data for the subtree rooted at this node, from the old
	 * document.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	function highlightRemovedNode( nodeIndex ) {
		var i, ilen, orderedNode, node, removeData, siblingNodes,
			newPreviousNodeIndex, oldPreviousNodeIndex, insertIndex,
			highestRemovedAncestor;

		function findRemovedAncestor( orderedNode ) {
			if ( !orderedNode.parent || structuralRemoves.indexOf( orderedNode.parent.index ) === -1 ) {
				return orderedNode.index;
			} else {
				return findRemovedAncestor( orderedNode.parent );
			}
		}

		function getRemoveData( orderedNode, index ) {
			var removeData, tempData;

			removeData = this.oldDoc.getData( orderedNode.node.getOuterRange() );
			removeData[ 0 ] = this.addAttributesToNode( removeData[ 0 ], this.oldDoc, {
				'data-diff-action': 'remove'
			} );

			while ( orderedNode && orderedNode.index !== index ) {
				orderedNode = orderedNode.parent;
				tempData = this.oldDoc.getData( orderedNode.node.getOuterRange() );
				removeData.unshift( tempData[ 0 ] );
				removeData.push( tempData[ tempData.length - 1 ] );
				removeData[ 0 ] = this.addAttributesToNode( removeData[ 0 ], this.oldDoc, {
					'data-diff-action': 'structural-remove'
				} );
			}

			return removeData;
		}

		orderedNode = oldNodes[ nodeIndex ];
		node = orderedNode.node;

		if ( !node.canContainContent() && node.hasChildren() ) {

			// Record that the node has been removed, but don't display it, for now
			// TODO: describe the change for the attribute diff
			structuralRemoves.push( nodeIndex );

		} else {

			// Display the removed node, and all its ancestors, up to the first ancestor that
			// hasn't been removed.
			highestRemovedAncestor = oldNodes[ findRemovedAncestor( orderedNode ) ];
			removeData = getRemoveData.call( this, orderedNode, highestRemovedAncestor.index );

			// Work out where to insert the removed subtree
			if ( highestRemovedAncestor.index in highestRemovedAncestors ) {

				// The highest removed ancestor has already been spliced into nodeData, so remove
				// it from this subtree and splice the rest of this subtree in
				removeData.shift();
				removeData.pop();
				insertIndex = highestRemovedAncestors[ highestRemovedAncestor.index ];

			} else if ( !highestRemovedAncestor.parent ) {

				// If this node is a child of the document node, then it won't have a "previous
				// node" (see below), in which case, insert it just before its corresponding
				// node in the new document.
				insertIndex = newNodes[ correspondingNodes.oldToNew[ highestRemovedAncestor.index ] ]
					.node.getOuterRange().from - nodeRange.from;

			} else {

				// Find the node that corresponds to the "previous node" of this node. The
				// "previous node" is either:
				// - the rightmost left sibling that corresponds to a node in the new document
				// - or if there isn't one, then this node's parent (which must correspond to
				// a node in the new document, or this node would have been marked already
				// processed)
				siblingNodes = highestRemovedAncestor.parent.children;
				for ( i = 0, ilen = siblingNodes.length; i < ilen; i++ ) {
					if ( siblingNodes[ i ].index === highestRemovedAncestor.index ) {
						break;
					} else {
						oldPreviousNodeIndex = siblingNodes[ i ].index;
						newPreviousNodeIndex = correspondingNodes.oldToNew[ oldPreviousNodeIndex ] || newPreviousNodeIndex;
					}
				}

				// If previous node was found among siblings, insert the removed subtree just
				// after its corresponding node in the new document. Otherwise insert the
				// removed subtree just inside its parent node's corresponding node.
				if ( newPreviousNodeIndex ) {
					insertIndex = newNodes[ newPreviousNodeIndex ].node.getOuterRange().to - nodeRange.from;
				} else {
					newPreviousNodeIndex = correspondingNodes.oldToNew[ highestRemovedAncestor.parent.index ];
					insertIndex = newNodes[ newPreviousNodeIndex ].node.getRange().from - nodeRange.from;
				}

				// If more content branch node descendants of the highest removed node have
				// also been removed, record the index where their subtrees will need to be
				// spliced in.
				highestRemovedAncestors[ highestRemovedAncestor.index ] = insertIndex + 1;

			}

			ve.batchSplice( nodeData, insertIndex, 0, removeData );
		}
	}

	/**
	 * Mark this node as inserted.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	function highlightInsertedNode( nodeIndex ) {
		var node, nodeRangeStart;

		// Find index of first data element for this node
		node = newNodes[ nodeIndex ].node;
		nodeRangeStart = node.getOuterRange().from - nodeRange.from;

		// Add insert class
		nodeData[ nodeRangeStart ] = this.addAttributesToNode(
			nodeData[ nodeRangeStart ], this.newDoc, {
				'data-diff-action': ( !node.canContainContent() && node.hasChildren() ) ? 'structural-insert' : 'insert'
			}
		);
	}

	/**
	 * Mark this node as changed and, if it is a content branch node, splice in
	 * the diff data.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 * @param {Object} diffInfo Information relating to this node's change
	 */
	function highlightChangedNode( nodeIndex, diffInfo ) {
		var node, nodeRangeStart, nodeDiffData, annotatedData, item;

		// The new node was changed.
		// Get data for this node
		node = newNodes[ nodeIndex ].node;
		nodeRangeStart = node.getOuterRange().from - nodeRange.from;

		if ( diffInfo.linearDiff ) {
			// If there is a content change, splice it in
			nodeDiffData = diffInfo.linearDiff;
			annotatedData = this.annotateNode( nodeDiffData );
			ve.batchSplice( nodeData, nodeRangeStart + 1, node.length, annotatedData );
		}
		if ( diffInfo.attributeChange ) {
			// If there is no content change, just add change class
			nodeData[ nodeRangeStart ] = this.addAttributesToNode(
				nodeData[ nodeRangeStart ], this.newDoc, { 'data-diff-action': 'structural-change' }
			);
			item = this.compareNodeAttributes( nodeData, nodeRangeStart, this.newDoc, diffInfo.attributeChange );
			if ( item ) {
				this.descriptionItemsStack.unshift( item );
			}
		}
	}

	// Iterate backwards over trees so that changes are made from right to left
	// of the data, to avoid having to update ranges
	ilen = Math.max( oldNodes.length, newNodes.length );
	jlen = ilen;
	for ( i = 0, j = 0; i < ilen && j < jlen; i++, j++ ) {

		newIndex = newNodes.length - 1 - i;
		oldIndex = oldNodes.length - 1 - j;

		if ( newIndex < 0 ) {

			// The rest of the nodes have been removed
			highlightRemovedNode.call( this, oldIndex );

		} else if ( oldIndex < 0 ) {

			// The rest of the nodes have been inserted
			highlightInsertedNode.call( this, newIndex );

		} else if ( correspondingNodes.newToOld[ newIndex ] === oldIndex ) {

			// The new node was changed.
			for ( k = 0, klen = treeDiff.length; k < klen; k++ ) {
				if ( treeDiff[ k ][ 0 ] === oldIndex && treeDiff[ k ][ 1 ] === newIndex ) {

					if ( diffInfo[ k ].replacement ) {

						// We are treating these nodes as removed and inserted
						highlightInsertedNode.call( this, newIndex );
						highlightRemovedNode.call( this, oldIndex );

					} else {

						// There could be any combination of content, attribute and type changes
						highlightChangedNode.call( this, newIndex, diffInfo[ k ] );

					}

				}
			}

		} else if ( correspondingNodes.newToOld[ newIndex ] === undefined ) {

			// The new node was inserted.
			highlightInsertedNode.call( this, newIndex );
			j--;

		} else if ( correspondingNodes.newToOld[ newIndex ] < oldIndex ) {

			// The old node was removed.
			highlightRemovedNode.call( this, oldIndex );
			i--;

		}
	}

	// Push new description items from the queue
	this.descriptions.addItems( this.descriptionItemsStack );
	this.descriptionItemsStack = [];

	element = document.createElement( 'div' );
	element.setAttribute( 'class', 've-ui-diffElement-doc-child-change' );
	if ( move ) {
		element.setAttribute( 'data-diff-move', move );
	}

	documentSlice.getStore().merge( this.newDoc.getStore() );
	// forClipboard is true, so that we can render otherwise invisible nodes
	body = ve.dm.converter.getDomFromModel( documentSlice, true ).body;

	while ( body.childNodes.length ) {
		element.appendChild(
			element.ownerDocument.adoptNode( body.childNodes[ 0 ] )
		);
	}

	return [ element ];
};

/**
 * Get the HTML for the diff of a single internal list item that has been removed
 * from the old document, inserted into the new document, or that is unchanged.
 *
 * @param {Object} internalListItem Information about the internal list item's diff
 * @param {string} action 'remove', 'insert' or 'none'
 * @return {HTMLElement[]} Elements (not owned by window.document)
 */
ve.ui.DiffElement.prototype.getInternalListNodeElements = function ( internalListItem, action ) {
	var elements,
		internalListNode = action === 'remove' ? this.oldDocInternalListNode : this.newDocInternalListNode,
		node = internalListNode.children[ internalListItem.nodeIndex ].children[ 0 ],
		listNode = document.createElement( 'ol' ),
		listItemNode = document.createElement( 'li' );

	if ( node && node.length ) {
		elements = this.getNodeElements( node, action );

		listItemNode.appendChild(
			listItemNode.ownerDocument.adoptNode( elements[ 0 ] )
		);
	} else {
		// TODO: This is MW-Cite-specific behaviour that VE core
		// should know nothing about. Move to MWDiffElement?
		$( listItemNode ).append(
			$( '<span>' )
				.addClass( 've-ce-mwReferencesListNode-muted' )
				.text( ve.msg( 'cite-ve-referenceslist-missingref' ) )
		).attr( 'data-diff-action', action );
	}
	listNode.setAttribute( 'start', internalListItem.indexOrder + 1 );
	listNode.appendChild( listItemNode );

	return [ listNode ];
};

/**
 * Get the HTML for the linear diff of a single internal list item that has changed
 * from the old document to the new document.
 *
 * @param {Object} internalListItem Information about the internal list item's diff
 * @return {HTMLElement[]} HTML elements to display the linear diff
 */
ve.ui.DiffElement.prototype.getInternalListChangedNodeElements = function ( internalListItem ) {
	var element, documentSlice, nodeData, body,
		listNode = document.createElement( 'ol' ),
		listItemNode = document.createElement( 'li' ),
		linearDiff = internalListItem.diff.diffInfo[ 0 ].linearDiff,
		annotatedData = this.annotateNode( linearDiff );

	element = document.createElement( 'div' );
	element.setAttribute( 'class', 've-ui-diffElement-doc-child-change' );
	documentSlice = this.newDoc.cloneFromRange( { from: 0, to: 0 } );
	documentSlice.getStore().merge( this.newDoc.getStore() );
	nodeData = documentSlice.data.data;
	ve.batchSplice( nodeData, 0, 0, annotatedData );
	body = ve.dm.converter.getDomFromModel( documentSlice, true ).body;
	while ( body.childNodes.length ) {
		element.appendChild(
			element.ownerDocument.adoptNode( body.childNodes[ 0 ] )
		);
	}

	listItemNode.appendChild(
		listItemNode.ownerDocument.adoptNode( element )
	);

	listNode.setAttribute( 'start', internalListItem.indexOrder + 1 );
	listNode.appendChild( listItemNode );

	return [ listNode ];
};

/**
 * Compare attributes of two nodes
 *
 * @param {Array} data Linear data containing new node
 * @param {number} offset Offset in data
 * @param {ve.dm.Document} doc Document model
 * @param {Object} attributeChange Attribute change object containing oldAttributes and newAttributes
 * @return {OO.ui.OptionWidget|null} Change description item, or null if nothing to describe
 */
ve.ui.DiffElement.prototype.compareNodeAttributes = function ( data, offset, doc, attributeChange ) {
	var changes, item,
		attributeChanges = this.constructor.static.compareAttributes( attributeChange.oldAttributes, attributeChange.newAttributes );

	changes = ve.dm.modelRegistry.lookup( data[ offset ].type ).static.describeChanges( attributeChanges, attributeChange.newAttributes, data[ offset ] );
	if ( changes.length ) {
		item = this.getChangeDescriptionItem( changes );
		data[ offset ] = this.addAttributesToNode( data[ offset ], doc, { 'data-diff-id': item.getData() } );
		return item;
	}
	return null;
};

/**
 * Get a change description item from a set of changes
 *
 * @param {Object} changes Changes
 * @return {OO.ui.OptionWidget} Change description item
 */
ve.ui.DiffElement.prototype.getChangeDescriptionItem = function ( changes ) {
	var i, l, item,
		elementId = this.elementId,
		$label = $( [] );

	for ( i = 0, l = changes.length; i < l; i++ ) {
		$label = $label.add( $( '<div>' ).text( changes[ i ] ) );
	}
	item = new OO.ui.OptionWidget( {
		label: $label,
		data: elementId,
		classes: [ 've-ui-diffElement-attributeChange' ]
	} );
	this.elementId++;
	return item;
};

/**
 * Add attributes to a node.
 *
 * @param {Object} nodeData Linear data to be highlighted
 * @param {ve.dm.Document} nodeDoc The document from which the data is taken
 * @param {Object} attributes Attributes to set
 * @return {Object} Highlighted linear data
 */
ve.ui.DiffElement.prototype.addAttributesToNode = function ( nodeData, nodeDoc, attributes ) {
	var key, originalDomElementsIndex, domElements,
		node = ve.copy( nodeData );

	// Don't let any nodes get unwrapped
	if ( ve.getProp( node, 'internal', 'generated' ) ) {
		delete node.internal.generated;
	}

	if ( node.originalDomElementsIndex ) {
		domElements = ve.copy( nodeDoc.getStore().value( node.originalDomElementsIndex ) );
		domElements.map( function ( element ) {
			return element.cloneNode( true );
		} );
	} else {
		domElements = [ document.createElement( 'span' ) ];
	}
	for ( key in attributes ) {
		if ( attributes[ key ] !== undefined ) {
			// eslint-disable-next-line no-loop-func
			domElements.forEach( function ( element ) {
				element.setAttribute( key, attributes[ key ] );
			} );
		}
	}
	originalDomElementsIndex = this.newDoc.getStore().index(
		domElements, domElements.map( ve.getNodeHtml ).join( '' )
	);
	node.originalDomElementsIndex = originalDomElementsIndex;

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
	var i, ilen, range, type, typeAsString, annType, domElementType, changes, item,
		annIndex, annIndexLists, j, height, element,
		DIFF_DELETE = ve.DiffMatchPatch.static.DIFF_DELETE,
		DIFF_INSERT = ve.DiffMatchPatch.static.DIFF_INSERT,
		DIFF_CHANGE_DELETE = ve.DiffMatchPatch.static.DIFF_CHANGE_DELETE,
		DIFF_CHANGE_INSERT = ve.DiffMatchPatch.static.DIFF_CHANGE_INSERT,
		items = [],
		start = 0, // The starting index for a range for building an annotation
		end, annotatedLinearDiff,
		domElement, domElements, originalDomElementsIndex,
		diffDoc, diffDocData,
		diffElement = this;

	// Make a new document from the diff
	diffDocData = linearDiff[ 0 ][ 1 ];
	for ( i = 1, ilen = linearDiff.length; i < ilen; i++ ) {
		diffDocData = diffDocData.concat( linearDiff[ i ][ 1 ] );
	}
	diffDoc = this.newDoc.cloneWithData( diffDocData );

	// Add spans with the appropriate attributes for removes and inserts
	// TODO: do insert and remove outside of loop
	for ( i = 0; i < ilen; i++ ) {
		end = start + linearDiff[ i ][ 1 ].length;
		if ( start !== end ) {
			range = new ve.Range( start, end );
			type = linearDiff[ i ][ 0 ];
			if ( type !== 0 ) {
				switch ( type ) {
					case DIFF_DELETE:
						typeAsString = 'remove';
						domElementType = 'del';
						annType = 'textStyle/delete';
						break;
					case DIFF_INSERT:
						typeAsString = 'insert';
						domElementType = 'ins';
						annType = 'textStyle/insert';
						break;
					case DIFF_CHANGE_DELETE:
						typeAsString = 'change-remove';
						domElementType = 'span';
						annType = 'textStyle/span';
						break;
					case DIFF_CHANGE_INSERT:
						typeAsString = 'change-insert';
						domElementType = 'span';
						annType = 'textStyle/span';
						break;
				}
				domElement = document.createElement( domElementType );
				domElement.setAttribute( 'data-diff-action', typeAsString );
				domElements = [ domElement ];

				changes = [];
				if ( linearDiff[ i ].annotationChanges ) {
					// eslint-disable-next-line no-loop-func
					linearDiff[ i ].annotationChanges.forEach( function ( annotationChange ) {
						var attributeChanges;
						if ( annotationChange.oldAnnotation && annotationChange.newAnnotation ) {
							attributeChanges = diffElement.constructor.static.compareAttributes(
								annotationChange.oldAnnotation.getAttributes(),
								annotationChange.newAnnotation.getAttributes()
							);
							changes = changes.concat( ve.dm.modelRegistry.lookup( annotationChange.newAnnotation.getType() ).static.describeChanges(
								attributeChanges, annotationChange.newAnnotation.getAttributes(), annotationChange.newAnnotation.getElement()
							) );
						}
					} );
				}
				if ( linearDiff[ i ].attributeChanges ) {
					element = linearDiff[ i ][ 1 ][ 0 ];
					// eslint-disable-next-line no-loop-func
					linearDiff[ i ].attributeChanges.forEach( function ( attributeChange ) {
						var attributeChanges = diffElement.constructor.static.compareAttributes(
							attributeChange.oldAttributes,
							attributeChange.newAttributes
						);
						changes = changes.concat( ve.dm.modelRegistry.lookup( element.type ).static.describeChanges(
							attributeChanges, element.attributes, element
						) );
					} );
				}
				if ( changes.length ) {
					item = diffElement.getChangeDescriptionItem( changes );
					domElement.setAttribute( 'data-diff-id', item.getData() );
					items.push( item );
				}

				originalDomElementsIndex = diffDoc.getStore().index(
					domElements,
					domElements.map( ve.getNodeHtml ).join( '' )
				);
				annIndex = diffDoc.getStore().index(
					ve.dm.annotationFactory.create( annType, {
						type: annType,
						originalDomElementsIndex: originalDomElementsIndex
					} )
				);

				// Insert annotation above annotations that span the entire range
				// and at least one character more
				annIndexLists = [];
				for (
					j = Math.max( 0, range.start - 1 );
					j < Math.min( range.end + 1, diffDoc.data.getLength() );
					j++
				) {
					annIndexLists[ j ] =
						diffDoc.data.getAnnotationIndexesFromOffset( j );
				}
				height = Math.min(
					ve.getCommonStartSequenceLength(
						annIndexLists.slice(
							Math.max( 0, range.start - 1 ),
							range.end
						)
					),
					ve.getCommonStartSequenceLength(
						annIndexLists.slice(
							range.start,
							Math.min( range.end + 1, diffDoc.data.getLength() )
						)
					)
				);
				for ( j = range.start; j < range.end; j++ ) {
					annIndexLists[ j ].splice( height, 0, annIndex );
					diffDoc.data.setAnnotationIndexesAtOffset(
						j,
						annIndexLists[ j ]
					);
				}
			}
		}
		start = end;
	}
	this.descriptionItemsStack.unshift.apply( this.descriptionItemsStack, items );

	// Merge the stores and get the data
	this.newDoc.getStore().merge( diffDoc.getStore() );
	annotatedLinearDiff = diffDoc.getData( { start: 0, end: diffDoc.getLength() } );

	return annotatedLinearDiff;
};
