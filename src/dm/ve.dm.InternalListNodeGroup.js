/**
 * Named, documented class for the individual items in the `nodes` property of the
 * {@link ve.dm.InternalList} class.
 *
 * Practically, this represents a list of {@link ve.dm.MWReferenceNode} nodes that belong to the
 * same group.
 *
 * @class
 *
 * @constructor
 */
ve.dm.InternalListNodeGroup = function VeDmInternalListNodeGroup() {
	/**
	 * @private please do not use directly
	 * @property {Object.<string,ve.dm.Node[]>} keyedNodes Indexed by the internal listKey.
	 *
	 * Practically, one of these arrays can contain multiple elements when a reference (with the
	 * same group and same name) is reused. The arrays can never be empty.
	 */
	this.keyedNodes = {};

	/**
	 * @private please do not use directly
	 * @property {Array.<ve.dm.Node|undefined>} firstNodes When {@link keyedNodes} contains more
	 * than one node per listKey then firstNodes can be used to identify the node that appears first
	 * in the document. If there is only one node it's just that node. Array keys correspond to the
	 * values in the {@link indexOrder} array. Order is meaningless but dictated by indexOrder
	 * instead.
	 *
	 * Practically, this is the first occurence of a reused reference (with the same group and name)
	 * in a document. That document position dictates the reference's footnote number and the order
	 * in which references are rendered in their reference list.
	 *
	 * Note this is possibly a sparse array with elements missing in case initialization happened
	 * out of order. Skip these and use {@link indexOrder} as your primary source of truth.
	 */
	this.firstNodes = [];

	/**
	 * @private please do not use directly
	 * @property {number[]} indexOrder Sorted to reflect the order of first appearance in the
	 * document. Values are indexes for the {@link firstNodes} array.
	 *
	 * Practically, this usually starts as a simple [ 0, 1, 2, … ] array but changes when references
	 * are added, reused, moved, and removed.
	 */
	this.indexOrder = [];
};

/**
 * @return {boolean}
 */
ve.dm.InternalListNodeGroup.prototype.isEmpty = function () {
	// TODO: Using this.indexOrder.length would be cheaper, but at this point we cannot be sure the
	// internal data structures are intact.
	return Object.keys( this.keyedNodes ).length === 0;
};

/**
 * @param {string} key
 * @return {ve.dm.Node[]|undefined} All reference nodes (1 or more, never 0) that (re)use the same
 *  key. Undefined when the key is unknown.
 */
ve.dm.InternalListNodeGroup.prototype.getAllReuses = function ( key ) {
	return this.keyedNodes[ key ];
};

/**
 * @return {string[]}
 */
ve.dm.InternalListNodeGroup.prototype.getKeysInIndexOrder = function () {
	const remainingKeys = Object.keys( this.keyedNodes );
	return this.getFirstNodesInIndexOrder().map(
		// FIXME: This should be a fast lookup, but we currently don't have a map for that
		( node ) => remainingKeys.find( ( key, i ) => {
			// TODO: Can we be sure the first node via this.firstNodes is always at position 0?
			// If this is guaranteed we can replace this search with a single comparison.
			if ( this.keyedNodes[ key ].includes( node ) ) {
				// Performance optimization: Don't search again for the key we just found
				remainingKeys.splice( i, 1 );
				return true;
			}
			return false;
		} )
	);
};

/**
 * @return {ve.dm.Node[]}
 */
ve.dm.InternalListNodeGroup.prototype.getFirstNodesInIndexOrder = function () {
	const nodes = this.indexOrder.length > 1 ?
		this.indexOrder.map( ( i ) => this.firstNodes[ i ] ) :
		// Fallback in case there is nothing to sort or indexOrder got messed up
		this.firstNodes;
	// We need to filter non-existing values from non-sequential arrays, see tests
	return nodes.filter( ( n ) => n );
};

/**
 * @param {string} key
 * @return {ve.dm.Node|undefined} Undefined in case there are no known nodes with this key
 */
ve.dm.InternalListNodeGroup.prototype.getFirstNode = function ( key ) {
	const nodes = this.getAllReuses( key );
	if ( !nodes ) {
		return undefined;
	}
	// FIXME: This should be a fast lookup, but we currently don't have a map for that
	for ( const node in this.firstNodes ) {
		// TODO: Can we be sure the first node is at position 0? If this is guaranteed we can
		// replace this search with a single comparison.
		if ( nodes.includes( node ) ) {
			return node;
		}
	}
	// Fallback in case there is something wrong
	return nodes[ 0 ];
};

/**
 * Sort the indexOrder array within a group object.
 *
 * Items are sorted by the start offset of their firstNode, unless that node
 * has the 'placeholder' attribute, in which case it moved to the end of the
 * list, where it should be ignored.
 */
ve.dm.InternalListNodeGroup.prototype.sortGroupIndexes = function () {
	this.indexOrder.sort( ( index1, index2 ) => {
		const node1 = this.firstNodes[ index1 ];
		const node2 = this.firstNodes[ index2 ];
		// Sometimes there is no node at the time of sorting (T350902) so move these to the end to be ignored
		if ( !node1 ) {
			return !node2 ? 0 : 1;
		} else if ( !node2 ) {
			return -1;
		}
		// Sort placeholder nodes to the end, so they don't interfere with numbering
		if ( node1.getAttribute( 'placeholder' ) ) {
			return node2.getAttribute( 'placeholder' ) ? 0 : 1;
		} else if ( node2.getAttribute( 'placeholder' ) ) {
			return -1;
		}
		return node1.getRange().start - node2.getRange().start;
	} );
};

/**
 * @param {string} key
 * @param {ve.dm.Node} newNode New node to append to the end of the list of nodes with the same key
 */
ve.dm.InternalListNodeGroup.prototype.appendNode = function ( key, newNode ) {
	this.appendNodeWithKnownIndex( key, newNode, this.firstNodes.length );
};

/**
 * @param {string} key
 * @param {ve.dm.Node} newNode Reference node to add
 * @param {number} index Existing index; ignored when this is not the first node for this key
 */
ve.dm.InternalListNodeGroup.prototype.appendNodeWithKnownIndex = function ( key, newNode, index ) {
	if ( !( key in this.keyedNodes ) ) {
		this.keyedNodes[ key ] = [];
		// This is literally the first node, so record it as such
		this.firstNodes[ index ] = newNode;
		this.indexOrder.push( index );
	}
	this.keyedNodes[ key ].push( newNode );
};

/**
 * @param {string} key
 * @param {ve.dm.Node} newNode Reference node to insert at document position
 * @param {number} [index] Existing index; ignored when this is not the first node for this key
 */
ve.dm.InternalListNodeGroup.prototype.insertNodeInDocumentOrder = function ( key, newNode, index ) {
	const nodes = this.getAllReuses( key );
	// Fall back to the cheaper method if possible
	if ( !nodes ) {
		if ( index === undefined ) {
			this.appendNode( key, newNode );
		} else {
			this.appendNodeWithKnownIndex( key, newNode, index );
		}
		return;
	}

	const start = newNode.getRange().start;
	let i = 0;
	// Warning, this assumes the nodes array is in document order!
	while ( nodes[ i ] && nodes[ i ].getRange().start <= start ) {
		i++;
	}

	// Check if the old node we are going to move was a first node
	const firstNodeIndex = this.firstNodes.indexOf( nodes[ i ] );
	if ( firstNodeIndex !== -1 ) {
		this.firstNodes[ firstNodeIndex ] = newNode;
	}

	// Finally insert the new node and push all following nodes one down
	nodes.splice( i, 0, newNode );
};

/**
 * @param {string} key
 * @param {ve.dm.Node} node Reference node to remove
 */
ve.dm.InternalListNodeGroup.prototype.unsetNode = function ( key, node ) {
	const nodes = this.getAllReuses( key );
	if ( !nodes ) {
		return;
	}

	let i = nodes.indexOf( node );
	if ( i !== -1 ) {
		nodes.splice( i, 1 );
		if ( !nodes.length ) {
			delete this.keyedNodes[ key ];
		}
	}

	// This is extra defensive for the moment because we have no control over all callers
	i = this.firstNodes.indexOf( node );
	if ( i !== -1 ) {
		this.firstNodes[ i ] = nodes[ 0 ];
		if ( !nodes.length ) {
			// This intentionally leaves a gap in the array behind. Needed so that the numbers of
			// the other elements don't change.
			delete this.firstNodes[ i ];
			i = this.indexOrder.indexOf( i );
			if ( i !== -1 ) {
				this.indexOrder.splice( i, 1 );
			}
		}
	}
};

/**
 * Generate a unique, human-readable list key that can be used instead of an item's internal list
 * key. Calls with the same oldListKey will return the same value again.
 *
 * Practically, this is used to auto-generate unique names for previously unnamed references,
 * e.g. `name=":0"` and so on.
 *
 * @param {string} oldListKey Current list key (typically something like "auto/0") to associate the
 *  generated list key with
 * @param {string} prefix Prefix for the generated key. Must match the prefix used in
 *  {@link keyedNodes} (typically "literal/") for the duplicate detection to work.
 * @return {string} Generated unique list key, or existing unique key associated with oldListKey
 */
ve.dm.InternalListNodeGroup.prototype.getUniqueListKey = function ( oldListKey, prefix ) {
	// Initialize properties dynamically; nobody needs to see this before it's used
	if ( !this.uniqueListKeys ) {
		this.uniqueListKeys = {};
		this.uniqueNameSequence = 0;
	} else if ( oldListKey in this.uniqueListKeys ) {
		return this.uniqueListKeys[ oldListKey ];
	}

	let result;
	do {
		result = prefix + this.uniqueNameSequence++;
		// Skip values that already appear in the document, e.g. from previous edits
	} while ( this.keyedNodes[ result ] );

	this.uniqueListKeys[ oldListKey ] = result;
	return result;
};
