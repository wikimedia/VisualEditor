/*!
 * VisualEditor UserInterface DiffElement class.
 *
 * @copyright See AUTHORS.txt
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
	const diff = visualDiff.diff;

	// Parent constructor
	ve.ui.DiffElement.super.call( this, config );

	this.elementId = 0;

	this.$overlays = $( '<div>' ).addClass( 've-ui-diffElement-overlays' );
	this.$content = $( '<div>' ).addClass( 've-ui-diffElement-content' );
	this.$messages = $( '<div>' ).addClass( 've-ui-diffElement-messages' );
	this.$document = $( '<div>' ).addClass( 've-ui-diffElement-document' );
	this.$sidebar = $( '<div>' ).addClass( 've-ui-diffElement-sidebar' );

	this.descriptions = new ve.ui.ChangeDescriptionsSelectWidget();
	this.descriptions.connect( this, { highlight: 'onDescriptionsHighlight' } );
	// Set to an empty array before a series of diff computations to collect descriptions.
	// Set back to null after collecting values.
	this.descriptionItemsStack = null;

	this.$document.on( {
		mousemove: this.onDocumentMouseMove.bind( this )
	} );

	this.renderDiff( diff.docDiff, diff.internalListDiff, diff.metaListDiff, visualDiff.newDoc.getHtmlDocument() );

	if ( visualDiff.timedOut ) {
		const warning = new OO.ui.MessageWidget( {
			type: 'warning',
			classes: [ 've-ui-diffElement-warning' ],
			label: ve.msg( 'visualeditor-diff-timed-out' )
		} );
		this.$messages.append( warning.$element );
	}

	// DOM
	this.$element
		.append(
			this.$messages,
			this.$content.append( this.$document, this.$overlays ),
			this.$sidebar.append( this.descriptions.$element )
		)
		.addClass( 've-ui-diffElement' );
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
	function compareKeys( a, b ) {
		if ( typeof a === 'object' && typeof b === 'object' ) {
			return ve.compare( a, b );
		} else {
			return a === b;
		}
	}

	const attributeChanges = {};
	for ( const key in oldAttributes ) {
		if ( !compareKeys( oldAttributes[ key ], newAttributes[ key ] ) ) {
			attributeChanges[ key ] = { from: oldAttributes[ key ], to: newAttributes[ key ] };
		}
	}
	for ( const key in newAttributes ) {
		if ( !Object.prototype.hasOwnProperty.call( oldAttributes, key ) && newAttributes[ key ] !== undefined ) {
			attributeChanges[ key ] = { from: oldAttributes[ key ], to: newAttributes[ key ] };
		}
	}
	return attributeChanges;
};

/**
 * Get the original linear data from a node
 *
 * @param {ve.dm.Node} node Node
 * @return {Array} Linear data
 */
ve.ui.DiffElement.static.getDataFromNode = function ( node ) {
	const doc = node.getRoot().getDocument();
	return doc.getData( node.getOuterRange() );
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
	if ( this.lastItem ) {
		this.getDiffElementById( this.lastItem.getData() ).css( 'outline', '' );
		this.$overlays.empty();
	}
	if ( item ) {
		const overlayRect = this.$overlays[ 0 ].getBoundingClientRect();
		const elementRects = ve.ce.FocusableNode.static.getRectsForElement( this.getDiffElementById( item.getData() ), overlayRect ).rects;
		for ( let i = 0, l = elementRects.length; i < l; i++ ) {
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
	const elementId = $( e.target ).closest( '[data-diff-id]' ).attr( 'data-diff-id' );
	if ( elementId !== undefined ) {
		this.descriptions.highlightItem(
			this.descriptions.findItemFromData( +elementId )
		);
	} else {
		this.descriptions.highlightItem();
	}
};

/**
 * Reposition the description items so they are not above their position in the document
 */
ve.ui.DiffElement.prototype.positionDescriptions = function () {
	this.descriptions.getItems().forEach( ( item ) => {
		item.$element.css( 'margin-top', '' );

		const itemRect = item.$element[ 0 ].getBoundingClientRect();
		const $element = this.getDiffElementById( item.getData() );
		if ( !$element.length ) {
			// Changed element isn't visible - probably shouldn't happen
			return;
		}
		const elementRect = ve.ce.FocusableNode.static.getRectsForElement( $element ).boundingRect;

		// elementRect can currently be null for meta items, e.g. <link>
		if ( elementRect && elementRect.top > itemRect.top ) {
			item.$element.css( 'margin-top', elementRect.top - itemRect.top - 5 );
		}
	} );
	this.$document.css( 'min-height', this.$sidebar.height() );
};

/**
 * Process a diff queue, skipping over sequential nodes with no changes
 *
 * @param {Array[]} queue Diff queue
 * @return {Array.<Array|null>}
 */
ve.ui.DiffElement.prototype.processQueue = function processQueue( queue ) {
	let hasChanges = false,
		lastItemSpacer = false,
		needsSpacer = false,
		headingContext = null,
		headingContextSpacer = false;
	const processedQueue = [];

	function isUnchanged( item ) {
		return !item || ( item[ 2 ] === 'none' && !item[ 3 ] );
	}

	function addSpacer() {
		processedQueue.push( null );
		lastItemSpacer = true;
	}

	function addItem( item ) {
		processedQueue.push( item );
		lastItemSpacer = false;
	}

	function isHeading( item ) {
		switch ( item[ 0 ] ) {
			case 'getNodeData':
			case 'getNodeElements':
				return item[ 1 ] instanceof ve.dm.HeadingNode;
			case 'getChangedNodeData':
			case 'getChangedNodeElements':
				return item[ 3 ] instanceof ve.dm.HeadingNode;
		}
	}

	for ( let k = 0, klen = queue.length; k < klen; k++ ) {
		if (
			!isUnchanged( queue[ k - 1 ] ) ||
			!isUnchanged( queue[ k ] ) ||
			!isUnchanged( queue[ k + 1 ] )
		) {
			hasChanges = true;
			if ( headingContext ) {
				// Don't render headingContext if current or next node is a heading
				if ( !isHeading( queue[ k ] ) && !isHeading( queue[ k + 1 ] ) ) {
					if ( headingContextSpacer ) {
						addSpacer();
					}
					addItem( headingContext );
				} else if ( isHeading( queue[ k + 1 ] ) ) {
					// Skipping the context header becuase the next node is a heading
					// so reinstate the spacer.
					needsSpacer = true;
				}
				headingContext = null;
			}
			if ( needsSpacer && !lastItemSpacer ) {
				addSpacer();
				needsSpacer = false;
			}
			addItem( queue[ k ] );

			if ( isHeading( queue[ k ] ) ) {
				// Heading was rendered, no need to show it as context
				headingContext = null;
			}
		} else {
			// Heading skipped, maybe show as context later
			if ( isHeading( queue[ k ] ) ) {
				headingContext = isUnchanged( queue[ k ] ) ? queue[ k ] : null;
				headingContextSpacer = needsSpacer;
				needsSpacer = false;
			} else {
				needsSpacer = true;
			}
		}
	}

	// Trailing spacer
	if ( hasChanges && needsSpacer && !lastItemSpacer ) {
		addSpacer();
	}

	return processedQueue;
};

/**
 * @param {Array.<Array|null>} queue Diff queue
 * @param {HTMLElement} parentNode Parent node to render to
 * @param {HTMLElement} spacerNode Spacer node template
 */
ve.ui.DiffElement.prototype.renderQueue = function ( queue, parentNode, spacerNode ) {
	queue.forEach( ( item ) => {
		if ( item ) {
			const elements = this[ item[ 0 ] ].apply( this, item.slice( 1 ) );
			while ( elements.length ) {
				parentNode.appendChild(
					parentNode.ownerDocument.adoptNode( elements[ 0 ] )
				);
				elements.shift();
			}
		} else {
			parentNode.appendChild(
				parentNode.ownerDocument.adoptNode( spacerNode.cloneNode( true ) )
			);
		}
	} );
};

/**
 * Render the diff
 *
 * @param {Object} diff Object describing the diff
 * @param {Object} internalListDiff Object describing the diff of the internal list
 * @param {Object} metaListDiff Object describing the diff of the meta list
 * @param {HTMLDocument} newHtmlDocument HTML document of context, for resolving attributes
 */
ve.ui.DiffElement.prototype.renderDiff = function ( diff, internalListDiff, metaListDiff, newHtmlDocument ) {
	const documentNode = this.$document[ 0 ],
		diffQueue = [];

	let internalListDiffQueue = [];

	const documentSpacerNode = document.createElement( 'div' );
	documentSpacerNode.setAttribute( 'class', 've-ui-diffElement-spacer' );
	documentSpacerNode.appendChild( document.createTextNode( '⋮' ) );

	const internalListSpacerNode = document.createElement( 'li' );
	internalListSpacerNode.setAttribute( 'class', 've-ui-diffElement-internalListSpacer' );
	internalListSpacerNode.appendChild( documentSpacerNode.cloneNode( true ) );

	const referencesListDiffs = {};
	Object.keys( internalListDiff.groups ).forEach( ( group ) => {
		const referencesListContainer = document.createElement( 'ol' );
		const internalListGroup = internalListDiff.groups[ group ];

		this.iterateDiff( internalListGroup, {
			insert: function ( newNode, newIndex ) {
				internalListDiffQueue.push( [ 'getInternalListNodeElements', newNode, 'insert', null, newIndex ] );
			},
			remove: function ( oldNode, oldIndex ) {
				internalListDiffQueue.push( [ 'getInternalListNodeElements', oldNode, 'remove', null, oldIndex ] );
			},
			move: function ( newNode, move, newIndex ) {
				internalListDiffQueue.push( [ 'getInternalListNodeElements', newNode, 'none', move, newIndex ] );
			},
			changed: function ( nodeDiff, oldNode, newNode, move, oldIndex, newIndex ) {
				internalListDiffQueue.push( [ 'getInternalListChangedNodeElements', nodeDiff, oldNode, newNode, move, newIndex ] );
			}
		} );

		this.descriptionItemsStack = [];
		this.renderQueue(
			this.processQueue( internalListDiffQueue ),
			referencesListContainer, internalListSpacerNode
		);
		referencesListDiffs[ group ] = {
			element: referencesListContainer,
			action: internalListGroup.changes ? 'change' : 'none',
			descriptionItemsStack: this.descriptionItemsStack,
			shown: false
		};
		this.descriptionItemsStack = null;

		internalListDiffQueue = [];
	} );

	this.descriptionItemsStack = [];
	let referencesListDiff;

	function handleRefList( node, move ) {
		if (
			node.type === 'mwReferencesList' &&
			( referencesListDiff = referencesListDiffs[ node.element.attributes.listGroup ] )
		) {
			// New node is a references list node. If a reference has
			// changed, the references list nodes appear unchanged,
			// because of how the internal list works. However, we
			// already have the HTML for the diffed references list,
			// (which contains details of changes if there are any) so
			// just get that.
			diffQueue.push( [ 'getRefListNodeElements', referencesListDiff.element, referencesListDiff.action, move, referencesListDiff.descriptionItemsStack ] );
			referencesListDiff.shown = true;
			return true;
		}
		return false;
	}

	this.iterateDiff( diff, {
		insert: function ( newNode ) {
			if ( !handleRefList( newNode, null ) ) {
				diffQueue.push( [ 'getNodeElements', newNode, 'insert', null ] );
			}
		},
		remove: function ( oldNode ) {
			if ( !handleRefList( oldNode, null ) ) {
				diffQueue.push( [ 'getNodeElements', oldNode, 'remove', null ] );
			}
		},
		move: function ( newNode, move ) {
			diffQueue.push( [ 'getNodeElements', newNode, 'none', move ] );
		},
		preChanged: function ( oldNode, newNode, move ) {
			return handleRefList( newNode, move );
		},
		changed: function ( nodeDiff, oldNode, newNode, move ) {
			diffQueue.push( [ 'getChangedNodeElements', nodeDiff, oldNode, newNode, move ] );
		}
	} );

	// Show any ref list diffs that weren't picked up by the main diff loop above,
	// e.g. during a section diff.
	Object.keys( referencesListDiffs ).forEach( ( group ) => {
		referencesListDiff = referencesListDiffs[ group ];
		if ( !referencesListDiff.shown ) {
			diffQueue.push( [ 'getRefListNodeElements', referencesListDiff.element, referencesListDiff.action, null, referencesListDiff.descriptionItemsStack ] );
		}
	} );

	this.renderQueue(
		this.processQueue( diffQueue ),
		documentNode, documentSpacerNode
	);

	this.renderMetaListDiff( metaListDiff, documentNode, documentSpacerNode );

	this.descriptions.addItems( this.descriptionItemsStack );
	this.descriptionItemsStack = null;

	ve.resolveAttributes( documentNode, newHtmlDocument, ve.dm.Converter.static.computedAttributes );

	if ( !documentNode.children.length ) {
		const noChanges = document.createElement( 'div' );
		noChanges.setAttribute( 'class', 've-ui-diffElement-no-changes' );
		noChanges.appendChild( document.createTextNode( ve.msg( 'visualeditor-diff-no-changes' ) ) );
		documentNode.innerHTML = '';
		documentNode.appendChild( noChanges );
	}

	this.$element
		.toggleClass( 've-ui-diffElement-hasDescriptions', !this.descriptions.isEmpty() );
};

ve.ui.DiffElement.prototype.renderMetaListDiff = function ( metaListDiff, documentNode, documentSpacerNode ) {
	Object.keys( metaListDiff ).forEach( ( group ) => {
		const handler = ve.ui.metaListDiffRegistry.lookup( group );
		if ( handler ) {
			const diffQueue = [];
			this.iterateDiff( metaListDiff[ group ], {
				insert: ( newNode ) => {
					diffQueue.push( [ 'getNodeElements', newNode, 'insert', null ] );
				},
				remove: ( oldNode ) => {
					diffQueue.push( [ 'getNodeElements', oldNode, 'remove', null ] );
				},
				move: ( newNode, move ) => {
					diffQueue.push( [ 'getNodeElements', newNode, 'none', move ] );
				},
				changed: ( nodeDiff, oldNode, newNode, move ) => {
					diffQueue.push( [ 'getChangedNodeElements', nodeDiff, oldNode, newNode, move ] );
				}
			} );
			handler( this, diffQueue, documentNode, documentSpacerNode );
		}
	} );
};

/**
 * Get the HTML for the diff of a removed, inserted, or unchanged-but-moved node.
 *
 * @param {ve.dm.Node} node The node being diffed. Will be from the old
 * document if it has been removed, or the new document if it has been inserted
 * or moved
 * @param {string} action 'remove', 'insert' or, if moved, 'none'
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @return {HTMLElement[]} Elements (not owned by window.document)
 */
ve.ui.DiffElement.prototype.getNodeElements = function ( node, action, move ) {
	const nodeData = this.getNodeData( node, action, move );

	return this.wrapNodeData( node.getRoot().getDocument(), nodeData );
};

/**
 * Get the DOM from linear data and wrap it for the diff.
 *
 * @param {ve.dm.Document} nodeDoc Node's document model
 * @param {Array} nodeData Linear data for the diff
 * @return {HTMLElement[]} Elements (not owned by window.document)
 */
ve.ui.DiffElement.prototype.wrapNodeData = function ( nodeDoc, nodeData ) {
	const documentSlice = nodeDoc.cloneWithData( nodeData );
	documentSlice.getStore().merge( nodeDoc.getStore() );
	const nodeElements = ve.dm.converter.getDomFromModel( documentSlice, ve.dm.Converter.static.PREVIEW_MODE ).body;

	// Convert NodeList to real array
	return Array.prototype.slice.call( nodeElements.childNodes );
};

/**
 * Get the linear data for the diff of a removed, inserted, or
 * unchanged-but-moved node.
 *
 * @param {ve.dm.Node} node
 * @param {string} action  'remove', 'insert' or, if moved, 'none'
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @return {Array} Linear Data
 */
ve.ui.DiffElement.prototype.getNodeData = function ( node, action, move ) {
	// Get the linear model for the node
	const nodeData = this.constructor.static.getDataFromNode( node );

	// Add the classes to the outer element
	this.addAttributesToElement( nodeData, 0, { 'data-diff-action': action } );
	this.markMove( move, nodeData );

	return nodeData;
};

/**
 * Get the HTML for the diff of a node that has been changed.
 *
 * @param {Object} diff Object describing the diff
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Corresponding node from the new document
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @return {HTMLElement[]} Elements (not owned by window.document)
 */
ve.ui.DiffElement.prototype.getChangedNodeElements = function ( diff, oldNode, newNode, move ) {
	const nodeData = this.getChangedNodeData( diff, oldNode, newNode, move );

	return this.wrapNodeData( newNode.getRoot().getDocument(), nodeData );
};

/**
 * Get the linear data for the diff of a node that has been changed.
 *
 * @param {Object} diff Object describing the diff
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Corresponding node from the new document
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @param {boolean} [noTreeDiff] Don't perform a tree diff of the nodes (used internally to avoid recursion)
 * @return {Array|boolean} Linear data for the diff, or false
 */
ve.ui.DiffElement.prototype.getChangedNodeData = function ( diff, oldNode, newNode, move, noTreeDiff ) {
	let nodeData;

	// Choose the appropriate method for the type of node
	if ( newNode.isDiffedAsLeaf() ) {
		nodeData = this.getChangedLeafNodeData( newNode, diff, move );
	} else if ( newNode.isDiffedAsList() ) {
		nodeData = this.getChangedListNodeData( newNode, diff );
	} else if ( newNode.isDiffedAsDocument() ) {
		nodeData = this.getChangedDocListData( newNode, diff );
	} else if ( !noTreeDiff ) {
		nodeData = this.getChangedTreeNodeData( oldNode, newNode, diff );
	} else {
		return false;
	}

	this.markMove( move, nodeData );

	return nodeData;
};

/**
 * Get the linear data for the diff of a leaf-like node that has been changed.
 *
 * @param {ve.dm.Node} newNode Corresponding node from the new document
 * @param {Object} diff Object describing the diff
 * @return {Array} Linear data for the diff
 */
ve.ui.DiffElement.prototype.getChangedLeafNodeData = function ( newNode, diff ) {
	const nodeData = this.constructor.static.getDataFromNode( newNode ),
		linearDiff = diff.linearDiff,
		attributeChange = diff.attributeChange;

	if ( linearDiff ) {
		// If there is a content change, splice it in
		const annotatedData = this.annotateNode( linearDiff, newNode );
		ve.batchSplice( nodeData, 1, newNode.length, annotatedData );
	}
	if ( attributeChange ) {
		// If there is no content change, just add change class
		this.addAttributesToElement(
			nodeData, 0, { 'data-diff-action': 'structural-change' }
		);
		const item = this.compareNodeAttributes( nodeData, 0, attributeChange );
		if ( item ) {
			this.descriptionItemsStack.push( item );
		}
	}

	return nodeData;
};

/**
 * Append list item
 *
 * @private
 * @param {Array} diffData
 * @param {number} insertIndex
 * @param {ve.dm.ListNode} listNode
 * @param {Array} listNodeData List node opening
 * @param {Array} listItemData
 * @param {number} depthChange
 * @return {number}
 */
ve.ui.DiffElement.prototype.appendListItem = function ( diffData, insertIndex, listNode, listNodeData, listItemData, depthChange ) {
	if ( depthChange === 0 ) {
		// Current list item belongs to the same list as the previous list item
		ve.batchSplice( diffData, insertIndex, 0, listItemData );
		insertIndex += listItemData.length;

	} else if ( depthChange > 0 ) {
		// Begin a new nested list, with this node's ancestor nodes
		const linearData = [];
		linearData.unshift( listNodeData[ 0 ] );

		let k, klen;
		const doc = listNode.getRoot().getDocument();
		// Nested list may be nested by multiple levels
		for ( k = 0, klen = depthChange - 1; k < klen; k++ ) {
			const listItemNode = listNode.parent;
			linearData.unshift( doc.data.data[ listItemNode.getOuterRange().from ] );
			listNode = listItemNode.parent;
			linearData.unshift( doc.data.data[ listNode.getOuterRange().from ] );
		}

		// Splice in the content, and splice that into the diff data
		ve.batchSplice( linearData, linearData.length, 0, listItemData );
		for ( k = 0, klen = depthChange - 1; k < klen; k++ ) {
			linearData.push( { type: '/list' } );
			linearData.push( { type: '/listItem' } );
		}
		linearData.push( { type: '/list' } );

		// Splice into previous list item
		insertIndex -= 1;
		ve.batchSplice( diffData, insertIndex, 0, linearData );

		// Adjust the insertIndex to be at the end of this content
		insertIndex += 2 * ( depthChange - 1 ) + 1 + listItemData.length;

	} else if ( depthChange < 0 ) {
		// Skip over close elements to get out of nested list(s)
		insertIndex += 2 * -depthChange;

		// Splice in the data and adjust the insert index
		ve.batchSplice( diffData, insertIndex, 0, listItemData );
		insertIndex += listItemData.length;
	}

	return insertIndex;
};

/**
 * Get the linear data for a document-like node that has been changed
 *
 * @param {ve.dm.Node} newDoclistNode Node from new document
 * @param {Object} diff Object describing the diff
 * @param {boolean} neverProcess Never process the diffQueue (always show the whole document)
 * @return {Array} Linear data for the diff
 */
ve.ui.DiffElement.prototype.getChangedDocListData = function ( newDoclistNode, diff, neverProcess ) {
	const diffData = [];
	let diffQueue = [];

	const spacerData = [ { type: 'div' }, '⋮', { type: '/div' } ];
	this.addAttributesToElement( spacerData, 0, { class: 've-ui-diffElement-spacer' } );

	this.iterateDiff( diff, {
		insert: ( newNode ) => {
			diffQueue.push( [ 'getNodeData', newNode, 'insert', null ] );
		},
		remove: ( oldNode ) => {
			diffQueue.push( [ 'getNodeData', oldNode, 'remove', null ] );
		},
		move: ( newNode, move ) => {
			diffQueue.push( [ 'getNodeData', newNode, 'none', move ] );
		},
		changed: ( nodeDiff, oldNode, newNode, move ) => {
			diffQueue.push( [ 'getChangedNodeData', nodeDiff, oldNode, newNode, move ] );
		}
	} );

	let hasAttributeChanges = false;
	const newDoclistNodeData = this.constructor.static.getDataFromNode( newDoclistNode );
	if ( diff.attributeChange ) {
		const item = this.compareNodeAttributes( newDoclistNodeData, 0, diff.attributeChange );
		if ( item ) {
			this.descriptionItemsStack.push( item );
			hasAttributeChanges = true;
		}
	}

	// When the doc cotainer has attribute changes, show the whole node.
	// Otherwise use processQueue to filter out unchanged context
	if ( !neverProcess && !hasAttributeChanges ) {
		diffQueue = this.processQueue( diffQueue );
	}
	diffQueue.forEach( ( diffItem ) => {
		if ( diffItem ) {
			ve.batchPush( diffData, this[ diffItem[ 0 ] ].apply( this, diffItem.slice( 1 ) ) );
		} else {
			ve.batchPush( diffData, spacerData.slice() );
		}
	} );

	// Wrap in newDocListNode
	diffData.unshift( newDoclistNodeData[ 0 ] );
	diffData.push( newDoclistNodeData[ newDoclistNodeData.length - 1 ] );

	return diffData;
};

/**
 * Iterate over a diff object and run more meaningful callbacks
 *
 * @param {Object|Array} diff Diff object, or array (InternalListDiff)
 * @param {Object} callbacks Callbacks
 * @param {Function} callbacks.insert Node inserted, arguments:
 *  {ve.dm.Node} newNode
 *  {number} newIndex
 * @param {Function} callbacks.remove Node removed, arguments:
 *  {ve.dm.Node} oldNode
 *  {number} oldIndex
 * @param {Function} callbacks.move Node moved, arguments:
 *  {ve.dm.Node} newNode
 *  {number} newIndex
 *  {string|null} move
 * @param {Function} callbacks.changed Node changed, arguments:
 *  {Object} nodeDiff
 *  {ve.dm.Node} oldNode
 *  {ve.dm.Node} newNode
 *  {number} oldIndex
 *  {number} newIndex
 *  {string|null} move
 */
ve.ui.DiffElement.prototype.iterateDiff = function ( diff, callbacks ) {
	// Internal list diffs set 'diff' to a number to shortcut computing the list diff
	// for fully inserted/removed lists.
	// TODO: Remove this special case and use a regular list diff
	if ( Array.isArray( diff ) ) {
		diff.forEach( ( item ) => {
			let node;
			switch ( item.diff ) {
				case 1:
					node = diff.newList.children[ item.nodeIndex ];
					callbacks.insert( node, item.indexOrder );
					break;
				case -1:
					node = diff.oldList.children[ item.nodeIndex ];
					callbacks.remove( node, item.indexOrder );
					break;
			}
		} );
		return;
	}

	const len = Math.max( diff.oldNodes.length, diff.newNodes.length );

	for ( let i = 0, j = 0; i < len || j < len; i++, j++ ) {
		const move = diff.moves[ j ] === 0 ? null : diff.moves[ j ];

		if ( diff.oldNodes[ i ] === undefined ) {
			// Everything else in the new doc list is an insert
			while ( j < diff.newNodes.length ) {
				callbacks.insert( diff.newNodes[ j ], j );
				j++;
			}
		} else if ( diff.newNodes[ j ] === undefined ) {
			// Everything else in the old doc is a remove
			while ( i < diff.oldNodes.length ) {
				callbacks.remove( diff.oldNodes[ i ], i );
				i++;
			}
		} else if ( diff.remove.indexOf( i ) !== -1 ) {
			// The old node is a remove. Decrement the new node index
			// to compare the same new node to the next old node
			callbacks.remove( diff.oldNodes[ i ], i );
			j--;
		} else if ( diff.insert.indexOf( j ) !== -1 ) {
			// The new node is an insert. Decrement the old node index
			// to compare the same old node to the next new node
			callbacks.insert( diff.newNodes[ j ], j );
			i--;
		} else if (
			callbacks.preChanged &&
			callbacks.preChanged( diff.oldNodes[ i ], diff.newNodes[ j ], move, i, j )
		) {
			// preChanged ran
		} else if ( typeof diff.newToOld[ j ] === 'number' ) {
			// The old and new node are exactly the same
			callbacks.move( diff.newNodes[ j ], move, j );
		} else {
			const oldNodeIndex = diff.newToOld[ j ].node;
			const oldNode = diff.oldNodes[ oldNodeIndex ];
			const newNode = diff.newNodes[ diff.oldToNew[ oldNodeIndex ].node ];
			const nodeDiff = diff.oldToNew[ oldNodeIndex ].diff;

			// The new node is modified from the old node
			callbacks.changed( nodeDiff, oldNode, newNode, move, i, j );
		}
	}
};

/**
 * Get the linear data for the diff of a list-like node that has been changed.
 *
 * @param {ve.dm.Node} newListNode Corresponding node from the new document
 * @param {Object} diff Object describing the diff
 * @return {Array} Linear data for the diff
 */
ve.ui.DiffElement.prototype.getChangedListNodeData = function ( newListNode, diff ) {
	const diffData = [];

	// These will be adjusted for each item
	let insertIndex = 1;
	let depth = -1;
	const listNodesInfoCache = new Map();

	const listDiffItems = [];

	this.iterateDiff( diff, {
		insert: ( newNode, index ) => {
			listDiffItems.push( {
				node: newNode,
				metadata: diff.newList.metadata[ index ],
				action: 'insert'
			} );
		},
		remove: ( oldNode, index ) => {
			listDiffItems.push( {
				node: oldNode,
				metadata: diff.oldList.metadata[ index ],
				action: 'remove'
			} );
		},
		move: ( newNode, move, index ) => {
			listDiffItems.push( {
				node: newNode,
				metadata: diff.newList.metadata[ index ],
				action: 'none',
				move: move
			} );
		},
		changed: ( nodeDiff, oldNode, newNode, move, oldIndex, newIndex ) => {
			listDiffItems.push( {
				node: newNode,
				metadata: diff.newList.metadata[ newIndex ],
				diff: nodeDiff,
				move: move
			} );
		}
	} );

	const processedListDiffItems = [];

	let lastItemSpacer = false;
	let lastShownDepth = 0;
	const lastItemAtDepth = {};
	listDiffItems.forEach( ( item, i ) => {
		function isUnchanged( queueItem ) {
			return !queueItem || ( queueItem.action === 'none' && !queueItem.move );
		}

		if (
			isUnchanged( item ) &&
			isUnchanged( listDiffItems[ i - 1 ] ) &&
			isUnchanged( listDiffItems[ i + 1 ] )
		) {
			if ( !lastItemSpacer ) {
				processedListDiffItems.push( {
					node: null,
					metadata: item.metadata,
					action: 'none'
				} );
				lastItemSpacer = true;
			}
		} else {
			while ( lastShownDepth < item.metadata.depth - 1 ) {
				lastShownDepth++;
				if ( lastItemAtDepth[ lastShownDepth ] ) {
					processedListDiffItems.push( {
						node: null,
						metadata: lastItemAtDepth[ lastShownDepth ].metadata,
						action: 'none'
					} );
				}
			}
			processedListDiffItems.push( item );
			lastItemSpacer = false;
			lastShownDepth = item.metadata.depth;
		}

		lastItemAtDepth[ item.metadata.depth ] = item;
	} );

	// Splice in each item with its diff annotations
	processedListDiffItems.forEach( ( item ) => {
		let contentData;
		let isSpacer = false;

		if ( !item.diff ) {
			if ( !item.node ) {
				contentData = [ { type: 'paragraph' }, '…', { type: '/paragraph' } ];
				isSpacer = true;
				this.addAttributesToElement( contentData, 0, { 'data-diff-action': 'none' } );
			} else {
				// Get the linear data for the list item's content
				contentData = this.getNodeData( item.node, item.action, item.move || null );
			}
		} else {
			// Item is changed. Get the linear data for the diff
			contentData = this.getChangedNodeData(
				item.diff,
				null,
				item.node,
				item.move || null
			);
		}

		// Calculate the change in depth
		const newDepth = item.metadata.depth;
		const depthChange = newDepth - depth;

		// Get linear data. Also get list node, since may need ancestors
		const listNode = item.metadata.listNode;
		let listNodeInfo;
		if ( !listNodesInfoCache.has( listNode ) ) {
			// Only re-fetch list node data once per list
			listNodeInfo = {
				data: [ this.constructor.static.getDataFromNode( listNode )[ 0 ] ],
				changeDone: false
			};
			listNodesInfoCache.set( listNode, listNodeInfo );
		} else {
			listNodeInfo = listNodesInfoCache.get( listNode );
		}

		const listItemNode = item.metadata.listItem;
		// Get linear data of list item
		let listItemData = this.constructor.static.getDataFromNode( listItemNode );
		if ( isSpacer ) {
			this.addAttributesToElement( listItemData, 0, { 'data-diff-list-spacer': '' } );
		} else {
			// TODO: Make this a node property, instead of a magic attribute
			if ( listNode.getAttribute( 'style' ) === 'number' ) {
				// Manually number list items for <ol>'s which contain removals
				// TODO: Consider if the <ol> contains a `start` attribute (not currently handled by DM)
				const indexInOwnList = listNode.children.indexOf( listItemNode );
				this.addAttributesToElement( listItemData, 0, { value: indexInOwnList + 1 } );
			}
			if ( item.action === 'none' && !item.move ) {
				this.addAttributesToElement( listItemData, 0, {
					'data-diff-list-none': ''
				} );
			}
		}

		// e.g. AlienBlockNode, content node is same as 'listItem', so don't duplicate content
		if ( item.node === listItemNode ) {
			listItemData = contentData;
		} else {
			ve.batchSplice( listItemData, 1, listItemData.length - 2, contentData );
		}

		// Check for attribute changes
		if ( item.diff && item.diff.attributeChange ) {
			const attributeChange = {
				oldAttributes: {},
				newAttributes: {}
			};

			[ 'listNodeAttributeChange', 'depthChange', 'listItemAttributeChange' ].forEach( ( listChangeType ) => {
				if ( item.diff.attributeChange[ listChangeType ] ) {
					if ( listChangeType === 'listNodeAttributeChange' && depthChange > 0 ) {
						const change = this.compareNodeAttributes( listNodeInfo.data, 0, item.diff.attributeChange[ listChangeType ] );
						if ( change ) {
							this.descriptionItemsStack.push( change );
							listNodeInfo.changeDone = true;
						}
					} else if ( listChangeType !== 'listNodeAttributeChange' || !listNodeInfo.changeDone ) {
						ve.extendObject( attributeChange.oldAttributes, item.diff.attributeChange[ listChangeType ].oldAttributes );
						ve.extendObject( attributeChange.newAttributes, item.diff.attributeChange[ listChangeType ].newAttributes );
					}
				}
			} );

			const listItemChange = this.compareNodeAttributes( listItemData, 0, attributeChange );
			if ( listItemChange ) {
				this.descriptionItemsStack.push( listItemChange );
			}
		}

		if ( item.metadata.isContinued ) {
			ve.batchSplice( diffData, insertIndex - 1, 0, contentData );
			insertIndex += contentData.length;

		} else {
			// Record the index to splice in the next list item data into the diffData
			insertIndex = this.appendListItem(
				diffData, insertIndex, listNode, listNodeInfo.data, listItemData, depthChange
			);
		}

		depth = newDepth;
	} );

	return diffData;
};

/**
 * Get the linear data for the diff of a tree-like node that has been changed.
 * Any node that is not leaf-like or list-like is treated as tree-like.
 *
 * @param {ve.dm.Node} oldTreeNode Node from the old document
 * @param {ve.dm.Node} newTreeNode Corresponding node from the new document
 * @param {Object} diff Object describing the diff
 * @return {Array} Linear data for the diff
 */
ve.ui.DiffElement.prototype.getChangedTreeNodeData = function ( oldTreeNode, newTreeNode, diff ) {
	const nodeData = this.constructor.static.getDataFromNode( newTreeNode ),
		nodeRange = newTreeNode.getOuterRange(),
		treeDiff = diff.treeDiff,
		diffInfo = diff.diffInfo,
		oldNodes = diff.oldTreeOrderedNodes,
		newNodes = diff.newTreeOrderedNodes,
		correspondingNodes = diff.correspondingNodes,
		structuralRemoves = [],
		highestRemovedAncestors = {};

	/**
	 * Splice in the removed data for the subtree rooted at this node, from the old
	 * document.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	const highlightRemovedNode = ( nodeIndex ) => {

		const findRemovedAncestor = ( n ) => {
			if ( !n.parent || structuralRemoves.indexOf( n.parent.index ) === -1 ) {
				return n.index;
			} else {
				return findRemovedAncestor( n.parent );
			}
		};

		const getRemoveData = ( n, index ) => {
			const data = this.constructor.static.getDataFromNode( n.node );
			this.addAttributesToElement( data, 0, {
				'data-diff-action': 'remove'
			} );

			while ( n && n.index !== index ) {
				n = n.parent;
				const tempData = this.constructor.static.getDataFromNode( n.node );
				data.unshift( tempData[ 0 ] );
				data.push( tempData[ tempData.length - 1 ] );
				this.addAttributesToElement( data, 0, {
					'data-diff-action': 'structural-remove'
				} );
			}

			return data;
		};

		const orderedNode = oldNodes[ nodeIndex ];
		const node = orderedNode.node;

		if ( node.isDiffedAsTree() && node.hasChildren() ) {
			// Record that the node has been removed, but don't display it, for now
			// TODO: describe the change for the attribute diff
			structuralRemoves.push( nodeIndex );

		} else {
			// Display the removed node, and all its ancestors, up to the first ancestor that
			// hasn't been removed.
			const highestRemovedAncestor = oldNodes[ findRemovedAncestor( orderedNode ) ];
			const removeData = getRemoveData( orderedNode, highestRemovedAncestor.index );
			let insertIndex;

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
				const siblingNodes = highestRemovedAncestor.parent.children;
				let newPreviousNodeIndex;
				for ( let x = 0, xlen = siblingNodes.length; x < xlen; x++ ) {
					if ( siblingNodes[ x ].index === highestRemovedAncestor.index ) {
						break;
					} else {
						const oldPreviousNodeIndex = siblingNodes[ x ].index;
						if ( correspondingNodes.oldToNew[ oldPreviousNodeIndex ] !== undefined ) {
							newPreviousNodeIndex = correspondingNodes.oldToNew[ oldPreviousNodeIndex ];
						}
					}
				}

				// If previous node was found among siblings, insert the removed subtree just
				// after its corresponding node in the new document. Otherwise insert the
				// removed subtree just inside its parent node's corresponding node.
				if ( newPreviousNodeIndex !== undefined ) {
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
	};

	/**
	 * Mark this node as inserted.
	 *
	 * @param {number} nodeIndex The index of this node in the subtree rooted at
	 * this document child
	 */
	const highlightInsertedNode = ( nodeIndex ) => {
		// Find index of first data element for this node
		const node = newNodes[ nodeIndex ].node;
		const nodeRangeStart = node.getOuterRange().from - nodeRange.from;

		// Add insert class
		this.addAttributesToElement(
			nodeData, nodeRangeStart, {
				'data-diff-action': ( node.isDiffedAsTree() && node.hasChildren() ) ? 'structural-insert' : 'insert'
			}
		);
	};

	/**
	 * Mark this node as changed and, if it is a content branch node, splice in
	 * the diff data.
	 *
	 * @param {number} oldIdx Old node index
	 * @param {number} newIdx New node index
	 * @param {Object} info Diff information relating to this node's change
	 */
	const highlightChangedNode = ( oldIdx, newIdx, info ) => {
		// The new node was changed.
		// Get data for this node
		const oldNode = oldNodes[ oldIdx ].node;
		const newNode = newNodes[ newIdx ].node;
		const nodeRangeStart = newNode.getOuterRange().from - nodeRange.from;

		let nodeDiffData = this.getChangedNodeData( info, oldNode, newNode, null, true );
		if ( nodeDiffData ) {
			// Diff was handled e.g. by leaf/list/doc differ
			ve.batchSplice( nodeData, nodeRangeStart, newNode.getOuterLength(), nodeDiffData );
			// TODO: Check if there were actually changes in the sub-diff
		} else {
			if ( info.linearDiff ) {
				// If there is a content change, splice it in
				nodeDiffData = info.linearDiff;
				const annotatedData = this.annotateNode( nodeDiffData, newNode );
				ve.batchSplice( nodeData, nodeRangeStart + 1, newNode.getLength(), annotatedData );
			}
			if ( info.attributeChange ) {
				// If there is no content change, just add change class
				this.addAttributesToElement(
					nodeData, nodeRangeStart, { 'data-diff-action': 'structural-change' }
				);
				const item = this.compareNodeAttributes( nodeData, nodeRangeStart, info.attributeChange );
				if ( item ) {
					this.descriptionItemsStack.push( item );
				}
			}
		}
	};

	// Iterate backwards over trees so that changes are made from right to left
	// of the data, to avoid having to update ranges
	const len = Math.max( oldNodes.length, newNodes.length );

	for ( let i = 0, j = 0; i < len && j < len; i++, j++ ) {
		const newIndex = newNodes.length - 1 - i;
		const oldIndex = oldNodes.length - 1 - j;

		if ( newIndex < 0 ) {
			// The rest of the nodes have been removed
			highlightRemovedNode( oldIndex );

		} else if ( oldIndex < 0 ) {
			// The rest of the nodes have been inserted
			highlightInsertedNode( newIndex );

		} else if ( correspondingNodes.newToOld[ newIndex ] === oldIndex ) {
			// The new node was changed.
			for ( let k = 0, klen = treeDiff.length; k < klen; k++ ) {
				if ( treeDiff[ k ][ 0 ] === oldIndex && treeDiff[ k ][ 1 ] === newIndex ) {
					if ( !diffInfo[ k ] ) {
						// We are treating these nodes as removed and inserted
						highlightInsertedNode( newIndex );
						highlightRemovedNode( oldIndex );
					} else {
						// There could be any combination of content, attribute and type changes
						highlightChangedNode( oldIndex, newIndex, diffInfo[ k ] );
					}
				}
			}

		} else if ( correspondingNodes.newToOld[ newIndex ] === undefined ) {
			// The new node was inserted.
			highlightInsertedNode( newIndex );
			j--;

		} else if ( correspondingNodes.newToOld[ newIndex ] < oldIndex ) {
			// The old node was removed.
			highlightRemovedNode( oldIndex );
			i--;
		}
	}

	// Push new description items from the queue
	this.descriptions.addItems( this.descriptionItemsStack );
	this.descriptionItemsStack = [];

	return nodeData;
};

/**
 * Add the relevant attributes to references list node HTML, whether changed or
 * unchanged (but not inserted or removed - in these cases we just use
 * getNodeElements).
 *
 * @param {HTMLElement} referencesListContainer Div containing the references list
 * @param {string} action 'change' or 'none'
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @param {OO.ui.OptionWidget[]} items Change descriptions for the reference list
 * @return {HTMLElement[]} Elements to display
 */
ve.ui.DiffElement.prototype.getRefListNodeElements = function ( referencesListContainer, action, move, items ) {
	this.markMove( move, referencesListContainer );
	this.descriptionItemsStack.push.apply( this.descriptionItemsStack, items );

	return [ referencesListContainer ];
};

/**
 * Get the HTML for the diff of a single internal list item that has been removed
 * from the old document, inserted into the new document, or that is unchanged.
 *
 * @param {ve.dm.InternalItemNode} internalListItemNode Internal list item node
 * @param {string} action 'remove', 'insert' or 'none'
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @param {number} index
 * @return {HTMLElement[]} Elements (not owned by window.document)
 */
ve.ui.DiffElement.prototype.getInternalListNodeElements = function ( internalListItemNode, action, move, index ) {
	const contents = internalListItemNode.children,
		listItemNode = document.createElement( 'li' );

	if ( contents.length ) {
		contents.forEach( ( node ) => {
			const elements = this.getNodeElements( node, action, move );

			listItemNode.appendChild(
				listItemNode.ownerDocument.adoptNode( elements[ 0 ] )
			);
		} );
	} else {
		// TODO: This is MW-Cite-specific behaviour that VE core
		// should know nothing about. Move to MWDiffElement?
		$( listItemNode ).append(
			$( '<span>' )
				.addClass( 've-ce-mwReferencesListNode-muted' )
				.text( ve.msg( 'cite-ve-referenceslist-missingref-in-list' ) )
		).attr( 'data-diff-action', action );
	}
	listItemNode.setAttribute( 'value', index + 1 );

	return [ listItemNode ];
};

/**
 * Get the HTML for the linear diff of a single internal list item that has changed
 * from the old document to the new document.
 *
 * @param {Object} diff List item diff
 * @param {ve.dm.InternalItemNode} oldNode
 * @param {ve.dm.InternalItemNode} newNode
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @param {number} newIndex
 * @return {HTMLElement[]} HTML elements to display the linear diff
 */
ve.ui.DiffElement.prototype.getInternalListChangedNodeElements = function ( diff, oldNode, newNode, move, newIndex ) {
	const listItemNode = document.createElement( 'li' );
	let data = this.getChangedDocListData( newNode, diff, true );

	// Remove internal list wrapper
	data = data.slice( 1, data.length - 2 );

	this.markMove( move, listItemNode );
	const newDoc = newNode.getRoot().getDocument();
	const documentSlice = newDoc.cloneWithData( data, true, true );
	const body = ve.dm.converter.getDomFromModel( documentSlice, ve.dm.Converter.static.PREVIEW_MODE ).body;
	while ( body.childNodes.length ) {
		listItemNode.appendChild(
			listItemNode.ownerDocument.adoptNode( body.childNodes[ 0 ] )
		);
	}

	listItemNode.setAttribute( 'value', newIndex + 1 );

	return [ listItemNode ];
};

/**
 * Compare attributes of two nodes
 *
 * @param {Array} data Linear data containing new node
 * @param {number} offset Offset in data
 * @param {Object} attributeChange Attribute change object containing oldAttributes and newAttributes
 * @return {OO.ui.OptionWidget|null} Change description item, or null if nothing to describe
 */
ve.ui.DiffElement.prototype.compareNodeAttributes = function ( data, offset, attributeChange ) {
	const attributeChanges = this.constructor.static.compareAttributes( attributeChange.oldAttributes, attributeChange.newAttributes );

	const changes = ve.dm.modelRegistry.lookup( data[ offset ].type ).static.describeChanges( attributeChanges, attributeChange.newAttributes, data[ offset ] );

	// Don't describe the same change twice
	if ( changes.length && (
		!( data[ offset ].internal ) ||
		!( data[ offset ].internal.diff ) ||
		data[ offset ].internal.diff[ 'data-diff-id' ] === undefined )
	) {
		const item = this.getChangeDescriptionItem( changes );
		this.addAttributesToElement( data, offset, { 'data-diff-id': item.getData() } );
		return item;
	}

	return null;
};

/**
 * Get a change description item from a set of changes
 *
 * @param {Array} changes List of changes, each change being either text or a Node array
 * @param {string[]} classes Additional classes
 * @return {OO.ui.OptionWidget} Change description item
 */
ve.ui.DiffElement.prototype.getChangeDescriptionItem = function ( changes, classes ) {
	const elementId = this.elementId;
	let $label = $( [] );

	for ( let i = 0, l = changes.length; i < l; i++ ) {
		const $change = $( '<div>' );
		if ( typeof changes[ i ] === 'string' ) {
			$change.text( changes[ i ] );
		} else {
			// changes[ i ] is definitely not an HTML string in this branch
			// eslint-disable-next-line no-jquery/no-append-html
			$change.append( changes[ i ] );
		}
		$label = $label.add( $change );
	}
	// eslint-disable-next-line mediawiki/class-doc
	const item = new OO.ui.OptionWidget( {
		label: $label,
		data: elementId,
		classes: [ 've-ui-diffElement-attributeChange', ...classes || [] ]
	} );
	this.elementId++;
	return item;
};

/**
 * Mark an element with attributes to be added later by the converter.
 *
 * @param {Array} data Data containing element to be marked
 * @param {number} offset Offset of element to be marked
 * @param {Object} attributes Attributes to set
 */
ve.ui.DiffElement.prototype.addAttributesToElement = function ( data, offset, attributes ) {
	const newElement = ve.copy( data[ offset ] );

	// NB we modify the linear data here, but then this is a cloned document.
	for ( const key in attributes ) {
		if ( attributes[ key ] !== undefined ) {
			ve.setProp( newElement, 'internal', 'diff', key, attributes[ key ] );
		}
	}

	// Don't let any nodes get unwrapped
	ve.deleteProp( newElement, 'internal', 'generated' );

	data.splice( offset, 1, newElement );
};

/**
 * Mark an HTML element or data element as moved
 *
 * @param {string|null} move 'up' or 'down' if the node has moved
 * @param {HTMLElement|Array} elementOrData Linear data or HTMLElement
 * @param {number} [offset=0] Linear mode offset
 */
ve.ui.DiffElement.prototype.markMove = function ( move, elementOrData, offset ) {
	if ( !move ) {
		return;
	}
	// The following messages are used here:
	// * visualeditor-diff-moved-up
	// * visualeditor-diff-moved-down
	// The following classes are used here:
	// * ve-ui-diffElement-moved-up
	// * ve-ui-diffElement-moved-down
	const item = this.getChangeDescriptionItem( [ ve.msg( 'visualeditor-diff-moved-' + move ) ], [ 've-ui-diffElement-moved-' + move ] );
	if ( Array.isArray( elementOrData ) ) {
		this.addAttributesToElement( elementOrData, offset || 0, { 'data-diff-move': move, 'data-diff-id': item.getData() } );
	} else {
		elementOrData.setAttribute( 'data-diff-move', move );
		elementOrData.setAttribute( 'data-diff-id', item.getData() );
	}
	this.descriptionItemsStack.push( item );
};

/**
 * Annotate some data to highlight diff
 *
 * @param {Array} linearDiff Linear diff, mapping arrays of linear data to diff
 *  actions (remove, insert or retain)
 * @param {ve.dm.Node} newNode Node from the new document
 * @return {Array} Data with annotations added
 */
ve.ui.DiffElement.prototype.annotateNode = function ( linearDiff, newNode ) {
	const DIFF_DELETE = ve.DiffMatchPatch.static.DIFF_DELETE,
		DIFF_INSERT = ve.DiffMatchPatch.static.DIFF_INSERT,
		DIFF_CHANGE_DELETE = ve.DiffMatchPatch.static.DIFF_CHANGE_DELETE,
		DIFF_CHANGE_INSERT = ve.DiffMatchPatch.static.DIFF_CHANGE_INSERT,
		items = [],
		newDoc = newNode.getRoot().getDocument();
	let start = 0; // The starting index for a range for building an annotation

	// Make a new document from the diff
	const diffDocData = linearDiff[ 0 ][ 1 ].slice();
	const ilen = linearDiff.length;
	for ( let i = 1; i < ilen; i++ ) {
		ve.batchPush( diffDocData, linearDiff[ i ][ 1 ] );
	}
	const diffDoc = newDoc.cloneWithData( diffDocData );

	// Add spans with the appropriate attributes for removes and inserts
	// TODO: do insert and remove outside of loop
	for ( let i = 0; i < ilen; i++ ) {
		const end = start + linearDiff[ i ][ 1 ].length;
		if ( start !== end ) {
			const range = new ve.Range( start, end );
			const type = linearDiff[ i ][ 0 ];
			if ( type !== 0 ) {
				let typeAsString, domElementType, annType;
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
				const domElement = document.createElement( domElementType );
				domElement.setAttribute( 'data-diff-action', typeAsString );
				const domElements = [ domElement ];

				const changes = [];
				if ( linearDiff[ i ].annotationChanges ) {
					linearDiff[ i ].annotationChanges.forEach( ( annotationChange ) => {
						let attributeChanges;
						if ( annotationChange.oldAnnotation && annotationChange.newAnnotation ) {
							attributeChanges = this.constructor.static.compareAttributes(
								annotationChange.oldAnnotation.getAttributes(),
								annotationChange.newAnnotation.getAttributes()
							);
							ve.batchPush( changes, ve.dm.modelRegistry.lookup( annotationChange.newAnnotation.getType() ).static.describeChanges(
								attributeChanges, annotationChange.newAnnotation.getAttributes(), annotationChange.newAnnotation.getElement()
							) );
						} else if ( annotationChange.newAnnotation ) {
							ve.batchPush( changes, annotationChange.newAnnotation.describeAdded() );
						} else if ( annotationChange.oldAnnotation ) {
							ve.batchPush( changes, annotationChange.oldAnnotation.describeRemoved() );
						}
					} );
				}
				if ( linearDiff[ i ].attributeChanges ) {
					const element = linearDiff[ i ][ 1 ][ 0 ];
					linearDiff[ i ].attributeChanges.forEach( ( attributeChange ) => {
						const attributeChanges = this.constructor.static.compareAttributes(
							attributeChange.oldAttributes,
							attributeChange.newAttributes
						);
						ve.batchPush( changes, ve.dm.modelRegistry.lookup( element.type ).static.describeChanges(
							attributeChanges, element.attributes, element
						) );
					} );
				}
				if ( changes.length ) {
					const item = this.getChangeDescriptionItem( changes );
					domElement.setAttribute( 'data-diff-id', item.getData() );
					items.push( item );
				}

				const originalDomElementsHash = diffDoc.getStore().hash(
					domElements,
					domElements.map( ve.getNodeHtml ).join( '' )
				);
				const annHash = diffDoc.getStore().hash(
					ve.dm.annotationFactory.create( annType, {
						type: annType,
						originalDomElementsHash: originalDomElementsHash
					} )
				);

				// Insert annotation above annotations that span the entire range
				// and at least one character more
				const annHashLists = [];
				for (
					let j = Math.max( 0, range.start - 1 );
					j < Math.min( range.end + 1, diffDoc.data.getLength() );
					j++
				) {
					annHashLists[ j ] =
						diffDoc.data.getAnnotationHashesFromOffset( j );
				}
				const height = Math.min(
					ve.getCommonStartSequenceLength(
						annHashLists.slice(
							Math.max( 0, range.start - 1 ),
							range.end
						)
					),
					ve.getCommonStartSequenceLength(
						annHashLists.slice(
							range.start,
							Math.min( range.end + 1, diffDoc.data.getLength() )
						)
					)
				);
				for ( let j = range.start; j < range.end; j++ ) {
					annHashLists[ j ].splice( height, 0, annHash );
					diffDoc.data.setAnnotationHashesAtOffset(
						j,
						annHashLists[ j ]
					);
				}
			}
		}
		start = end;
	}
	this.descriptionItemsStack.push.apply( this.descriptionItemsStack, items );

	// Merge the stores and get the data
	newDoc.getStore().merge( diffDoc.getStore() );
	const annotatedLinearDiff = diffDoc.getData( { start: 0, end: diffDoc.getLength() } );

	return annotatedLinearDiff;
};

ve.ui.metaListDiffRegistry = new OO.Registry();
