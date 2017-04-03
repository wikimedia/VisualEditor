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
 */
ve.ui.DiffElement = function VeUiDiffElement( visualDiff ) {
	var diff = visualDiff.diff;

	// Parent constructor
	ve.ui.DiffElement.super.call( this );

	this.elementId = 0;

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

	this.$overlays = $( '<div>' ).addClass( 've-ui-diffElement-overlays' );
	this.$content = $( '<div>' ).addClass( 've-ui-diffElement-content' );
	this.$document = $( '<div>' ).addClass( 've-ui-diffElement-document' );
	this.$sidebar = $( '<div>' ).addClass( 've-ui-diffElement-sidebar' );

	this.descriptions = new ve.ui.ChangeDescriptionsSelectWidget();
	this.descriptions.connect( this, { highlight: 'onDescriptionsHighlight' } );
	this.descriptionItemsStack = [];
	this.onWindowResizeDebounced = ve.debounce( this.onWindowResize.bind( this ), 250 );
	$( this.getElementWindow() ).on( 'resize', this.onWindowResizeDebounced );

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
 * Handle window resize events
 *
 * @param {jQuery.Event} event Window resize event
 */
ve.ui.DiffElement.prototype.onWindowResize = function () {
	this.positionDescriptions();
};

/**
 * Reposition the description items so they are not above their position in the document
 */
ve.ui.DiffElement.prototype.positionDescriptions = function () {
	var diffElement = this;
	this.descriptions.getItems().forEach( function ( item ) {
		var elementRect, itemRect;

		item.$element.css( 'margin-top', '' );

		itemRect = item.$element[ 0 ].getBoundingClientRect();
		elementRect = diffElement.getDiffElementById( item.getData() )[ 0 ].getBoundingClientRect();

		if ( elementRect.top > itemRect.top ) {
			item.$element.css( 'margin-top', elementRect.top - itemRect.top - 5 );
		}

	} );
	this.$document.css( 'min-height', this.$sidebar.height() );
};

/**
 * Destroy the diff and remove global handlers
 */
ve.ui.DiffElement.prototype.destroy = function () {
	$( this.getElementWindow() ).off( 'resize', this.onWindowResizeDebounced );
	this.$element.remove();
};

/**
 * Render the diff
 */
ve.ui.DiffElement.prototype.renderDiff = function () {
	var i, j, k, ilen, jlen, klen, nodes, move, elements, spacerNode, noChanges,
		documentNode = this.$document[ 0 ],
		anyChanges = false,
		spacer = false,
		diffQueue = [];

	spacerNode = document.createElement( 'div' );
	spacerNode.setAttribute( 'class', 've-ui-diffElement-spacer' );
	spacerNode.appendChild( document.createTextNode( '⋮' ) );

	ilen = Math.max( this.oldDocChildren.length, this.newDocChildren.length );
	jlen = ilen;

	for ( i = 0, j = 0; i < ilen, j < jlen; i++, j++ ) {
		if ( this.oldDocChildren[ i ] === undefined ) {

			// Everything else in the new doc is an insert
			nodes = this.newDocChildren.slice( j );
			for ( k = 0, klen = nodes.length; k < klen; k++ ) {
				diffQueue.push( [ 'getNodeElements', nodes[ k ], 'insert' ] );
			}

		} else if ( this.newDocChildren[ j ] === undefined ) {

			// Everything else in the old doc is a remove
			nodes = this.oldDocChildren.slice( i );
			for ( k = 0, klen = nodes.length; k < klen; k++ ) {
				diffQueue.push( [ 'getNodeElements', nodes[ k ], 'remove' ] );
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

			// The old and new node are exactly the same, but still
			// need to check if there has been a move
			move = this.newToOld[ j ] === i ? undefined :
				( this.newToOld[ j ] > i ? 'up' : 'down' );
			diffQueue.push( [ 'getNodeElements', this.newDocChildren[ j ], 'none', move ] );

		} else {

			// The new node is modified from the old node. Get the
			// diff and also check if there has been a move
			move = this.newToOld[ j ].node === i ? undefined :
				( this.newToOld[ j ].node > i ? 'up' : 'down' );
			diffQueue.push( [ 'getChangedNodeElements', this.newToOld[ j ].node, move ] );

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
			elements = this[ diffQueue[ i ][ 0 ] ].apply( this, diffQueue[ i ].slice( 1 ) );
			while ( elements.length ) {
				documentNode.appendChild(
					documentNode.ownerDocument.adoptNode( elements[ 0 ] )
				);
				elements.shift();
			}
		} else if ( !spacer ) {
			spacer = true;
			documentNode.appendChild( spacerNode.cloneNode( true ) );
		}
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
 * @return {HTMLElement[]} HTML to display the action/move
 */
ve.ui.DiffElement.prototype.getNodeElements = function ( node, action, move ) {
	var nodeData, body, element,
		nodeDoc = action === 'remove' ? this.oldDoc : this.newDoc,
		documentSlice = nodeDoc.cloneFromRange( node.getOuterRange() );

	// Get the linear model for the node
	nodeData = documentSlice.data.data;

	// Add the classes to the outer element (in case there was a move)
	nodeData[ 0 ] = this.addAttributesToNode( nodeData[ 0 ], nodeDoc, { 'data-diff-action': action, 'data-diff-move': move } );

	// Get the html for the linear model with classes
	// Doc is always the new doc when inserting into the store
	documentSlice.getStore().merge( this.newDoc.getStore() );
	// forClipboard is true, so that we can render otherwise invisible nodes
	body = ve.dm.converter.getDomFromModel( documentSlice, true ).body;

	if ( action !== 'none' ) {
		element = document.createElement( 'div' );
		element.setAttribute( 'class', 've-ui-diffElement-doc-child-change' );
		while ( body.childNodes.length ) {
			element.appendChild(
				element.ownerDocument.adoptNode( body.childNodes[ 0 ] )
			);
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
		var i, ilen, node, removeData, siblingNodes,
			newPreviousNodeIndex, oldPreviousNodeIndex, insertIndex,
			highestRemovedAncestor;

		function findRemovedAncestor( node ) {
			if ( !node.parent || structuralRemoves.indexOf( node.parent.index ) === -1 ) {
				return node.index;
			} else {
				return findRemovedAncestor( node.parent );
			}
		}

		function getRemoveData( node, index ) {
			var removeData, tempData;

			removeData = this.oldDoc.getData( node.node.getOuterRange() );
			removeData[ 0 ] = this.addAttributesToNode( removeData[ 0 ], this.oldDoc, {
				'data-diff-action': 'remove'
			} );

			while ( node && node.index !== index ) {
				node = node.parent;
				tempData = this.oldDoc.getData( node.node.getOuterRange() );
				removeData.unshift( tempData[ 0 ] );
				removeData.push( tempData[ tempData.length - 1 ] );
				removeData[ 0 ] = this.addAttributesToNode( removeData[ 0 ], this.oldDoc, {
					'data-diff-action': 'structural-remove'
				} );
			}

			return removeData;
		}

		node = oldNodes[ nodeIndex ];

		if ( !node.node.canContainContent() ) {

			// Record that the node has been removed, but don't display it, for now
			// TODO: describe the change for the attribute diff
			structuralRemoves.push( nodeIndex );

		} else {

			// Display the removed node, and all its ancestors, up to the first ancestor that
			// hasn't been removed.
			highestRemovedAncestor = oldNodes[ findRemovedAncestor( node ) ];
			removeData = getRemoveData.call( this, node, highestRemovedAncestor.index );

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
		node = newNodes[ nodeIndex ];
		nodeRangeStart = node.node.getOuterRange().from - nodeRange.from;

		// Add insert class
		nodeData[ nodeRangeStart ] = this.addAttributesToNode(
			nodeData[ nodeRangeStart ], this.newDoc, {
				'data-diff-action': node.node.canContainContent() ? 'insert' : 'structural-insert'
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
		node = newNodes[ nodeIndex ];
		nodeRangeStart = node.node.getOuterRange().from - nodeRange.from;

		if ( diffInfo.linearDiff ) {
			// If there is a content change, splice it in
			nodeDiffData = diffInfo.linearDiff;
			annotatedData = this.annotateNode( nodeDiffData );
			ve.batchSplice( nodeData, nodeRangeStart + 1, node.node.length, annotatedData );
		}
		if ( diffInfo.attributeChange ) {
			// If there is no content change, just add change class
			nodeData[ nodeRangeStart ] = this.addAttributesToNode(
				nodeData[ nodeRangeStart ], this.newDoc, { 'data-diff-action': 'structural-change' }
			);
			item = this.compareNodeAttributes( nodeData, nodeRangeStart, this.newDoc, diffInfo.attributeChange );
			this.descriptionItemsStack.unshift( item );
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
						highlightRemovedNode.call( this, oldIndex );
						highlightInsertedNode.call( this, newIndex );

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
 * Compare attributes of two nodes
 *
 * @param {Array} data Linear data containing new node
 * @param {number} offset Offset in data
 * @param {ve.dm.Document} doc Document model
 * @param {Object} attributeChange Attribute change object containing oldAttributes and newAttributes
 * @return {OO.ui.OptionWidget} Change description item
 */
ve.ui.DiffElement.prototype.compareNodeAttributes = function ( data, offset, doc, attributeChange ) {
	var changes, item,
		attributeChanges = this.constructor.static.compareAttributes( attributeChange.oldAttributes, attributeChange.newAttributes );

	changes = ve.dm.modelRegistry.lookup( data[ offset ].type ).static.describeChanges( attributeChanges, attributeChange.newAttributes, data[ offset ] );
	item = this.getChangeDescriptionItem( changes );
	data[ offset ] = this.addAttributesToNode( data[ offset ], doc, { 'data-diff-id': item.getData() } );
	return item;
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
		annIndex, annIndexLists, j, height,
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

				if ( linearDiff[ i ].annotationChanges ) {
					changes = [];
					linearDiff[ i ].annotationChanges.forEach( function ( annotationChange ) { // eslint-disable-line no-loop-func
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
					if ( changes.length ) {
						item = diffElement.getChangeDescriptionItem( changes );
						domElement.setAttribute( 'data-diff-id', item.getData() );
						items.push( item );
					}
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
