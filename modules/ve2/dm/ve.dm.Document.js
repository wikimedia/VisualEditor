/**
 * Document object.
 * 
 * @class
 * @constructor
 * @param {Array} data Linear model data to start with
 */
ve.dm.Document = function( data ) {
	// Inheritance
	ve.dm.DocumentFragment.call( this, data );
};

/* Methods */

/**
 * Rebuild one or more nodes from a linear model fragment.
 * 
 * The data provided to this method may contain either one node or multiple sibling nodes, but it
 * must be balanced and valid. Data provided to this method also may not contain any content at the
 * top level. The tree and offset map are updated during this operation.
 * 
 * Process:
 *  1. Nodes between {index} and {index} + {numNodes} in {parent} will be removed
 *  2. Data will be retrieved from this.data using {offset} and {newLength}
 *  3. A document fragment will be generated from the retrieved data
 *  4. The document fragment's offset map will be inserted into this document at {offset}
 *  5. The document fragment's nodes will be inserted into {parent} at {index}
 * 
 * Use cases:
 *  1. Rebuild old nodes and offset data after a change to the linear model.
 *  2. Insert new nodes and offset data after a insertion in the linear model.
 * 
 * @param {ve.dm.Node} parent Parent of the node(s) being rebuilt
 * @param {Integer} index Index within parent to rebuild or insert nodes
 *   - If {numNodes} == 0: Index to insert nodes at
 *   - If {numNodes} >= 1: Index of first node to rebuild
 * @param {Integer} numNodes Total number of nodes to rebuild
 *   - If {numNodes} == 0: Nothing  will be rebuilt, but the node(s) built from data will be
 *     inserted before {index}. To insert nodes at the end, use number of children in {parent}
 *   - If {numNodes} == 1: Only the node at {index} will be rebuilt
 *   - If {numNodes} > 1: The node at {index} and the next {numNodes-1} nodes will be rebuilt
 * @param {Integer} offset Linear model offset to rebuild or insert offset map data
 *   - If {numNodes} == 0: Offset to insert offset map data at
 *   - If {numNodes} >= 1: Offset to remove old and insert new offset map data at
 * @param {Integer} newLength Length of data in linear model to rebuild or insert nodes for
 * @returns {ve.dm.Node[]} Array containing the rebuilt/inserted nodes
 */
ve.dm.Document.prototype.rebuildNodes = function( parent, index, numNodes, offset, newLength ) {
	// Compute the length of the old nodes (so we can splice their offsets out of the offset map)
	var oldLength = 0;
	for ( var i = index; i < index + numNodes; i++ ) {
		oldLength += parent.children[i].getElementLength();
	}
	// Get a slice of the document where it's been changed
	var data = this.data.slice( offset, offset + newLength );
	// Build document fragment from data
	var fragment = new ve.dm.DocumentFragment( this, data );
	// Get generated child nodes from the document fragment
	var nodes = fragment.getRootNode().getChildren();
	// Replace nodes in the model tree
	ve.batchedSplice( parent.children, index, numNodes, nodes );
	// Update offset map
	ve.batchedSplice( this.offsetMap, offset, oldLength, fragment.getOffsetMap() );
	// Return inserted nodes
	return nodes;
};

/* Inheritance */

ve.extendClass( ve.dm.Document, ve.dm.DocumentFragment );
