/**
 * DataModel document.
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
		oldLength += parent.children[i].getOuterLength();
	}
	// Get a slice of the document where it's been changed
	var data = this.data.slice( offset, offset + newLength );
	// Build document fragment from data
	var fragment = new ve.dm.DocumentFragment( data, this );
	// Get generated child nodes from the document fragment
	var nodes = fragment.getDocumentNode().getChildren();
	// Replace nodes in the model tree
	ve.batchSplice( parent, index, numNodes, nodes );
	// Update offset map
	ve.batchSplice( this.offsetMap, offset, oldLength, fragment.getOffsetMap() );
	// Return inserted nodes
	return nodes;
};

/**
 * Gets a list of nodes and the ranges within them that a selection of the document covers.
 * 
 * @method
 * @param {ve.Range} range Range within document to select nodes
 * @param {String} [mode='leaves'] Type of selection to perform
 *     'leaves': Return all leaf nodes in the given range (descends all the way down)
 *     'siblings': Return a set of adjacent siblings covered by the range (descends as long as the
 *                    range is in a single node)
 * @returns {Array} List of objects describing nodes in the selection and the ranges therein
 *                  'node': Reference to a ve.dm.Node
 *                  'range': ve.Range, missing if the entire node is covered
 * @throws 'Invalid start offset' if range.start is out of range
 * @throws 'Invalid end offset' if range.end is out of range
 */
ve.dm.Document.prototype.selectNodes = function( range, mode ) {
	var	doc = this.getDocumentNode(),
		retval = [],
		start = range.start,
		end = range.end,
		stack = [ { 'node': doc, 'index': 0 } ],
		node,
		prevNode,
		nextNode,
		left,
		right,
		currentFrame = stack[0],
		startInside,
		endInside,
		startBetween,
		endBetween,
		startFound = false;

	mode = mode || 'leaves';
	if ( mode !== 'leaves' && mode !== 'siblings' ) {
		throw 'Invalid mode: ' + mode;
	}

	if ( start < 0 || start > doc.getLength() ) {
		throw 'Invalid start offset: ' + start;
	}
	if ( end < 0 || end > doc.getLength() ) {
		throw 'Invalid end offset: ' + end;
	}

	if ( !doc.children || doc.children.length === 0 ) {
		return [];
	}
	// TODO we could find the start more efficiently using the offset map
	left = doc.children[0].isWrapped() ? 1 : 0;

	while ( end >= left ) {
		node = currentFrame.node.children[currentFrame.index];
		prevNode = currentFrame.node.children[currentFrame.index - 1];
		nextNode = currentFrame.node.children[currentFrame.index + 1];
		right = left + node.getLength();
		// Is the start inside node?
		startInside = start >= left && start <= right;
		// Is the end inside node?
		endInside = end >= left && end <= right;
		// Is the start between prevNode and node or between the parent's opening and node?
		startBetween = node.isWrapped() ? start == left - 1 : start == left;
		// Is the end between node and nextNode or between node and the parent's closing?
		endBetween = node.isWrapped() ? end == right + 1 : end == right;

		if ( start == end && ( startBetween || endBetween ) ) {
			// Empty range in the parent, outside of any child
			return [ {
				'node': currentFrame.node,
				'range': new ve.Range( start, end )
			} ];
		} else if ( startBetween ) {
			// start is between the previous sibling and node
			// so the selection covers all of node and possibly more
			
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// Descend into node
				currentFrame = { 'node': node, 'index': 0 };
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				startFound = true;
				continue;
			} else {
				// All of node is covered
				// TODO should this have a range or not?
				retval.push( { 'node': node } );
				startFound = true;
			}
		} else if ( startInside && endInside ) {
			if ( node.children && node.children.length ) {
				// Descend into node
				currentFrame = { 'node': node, 'index': 0 };
				stack.push( currentFrame );
				// If the first child of node has an opening, skip over it
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// node is a leaf node and the range is entirely inside it
				return [ {
					'node': node,
					'range': new ve.Range( left, right )
				} ];
			}
		} else if ( startInside ) {
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// node is a branch node and the start is inside it
				// Descend into it
				currentFrame = { 'node': node, 'index': 0 };
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// node is a leaf node and the start is inside it
				// Add to retval and keep going
				retval.push( {
					'node': node,
					'range': new ve.Range( start, right )
				} );
				startFound = true;
			}
		} else if ( endBetween ) {
			// end is between node and the next sibling
			// start is not inside node, so the selection covers
			// all of node, then ends
			//retval.push( { 'node': node } );
			
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// Descend into node
				currentFrame = { 'node': node, 'index': 0 };
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// All of node is covered
				// TODO should this have a range or not?
				retval.push( { 'node': node } );
				return retval;
			}
		} else if ( endInside ) {
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// node is a branch node and the end is inside it
				// Descend into it
				currentFrame = { 'node': node, 'index': 0 };
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// node is a leaf node and the end is inside it
				// Add to retval and return
				retval.push( {
					'node': node,
					'range': new ve.Range( left, end )
				} );
				return retval;
			}
		} else if ( startFound ) {
			// Neither the start nor the end is inside node, but we found the start earlier,
			// so node must be between the start and the end
			// Add the entire node, so no range property
			//retval.push( { 'node': node } );
			
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// Descend into node
				currentFrame = { 'node': node, 'index': 0 };
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// All of node is covered
				// TODO should this have a range or not?
				retval.push( { 'node': node } );
			}
		}
		
		// Move to the next node
		if ( nextNode ) {
			// The next node exists
			// Advance the index; the start of the next iteration will essentially
			// do node = nextNode;
			currentFrame.index++;
			// Advance to the first offset inside nextNode
			left = right +
				// Skip over node's closing, if present
				( node.isWrapped() ? 1 : 0 ) +
				// Skip over nextNode's opening, if present
				( nextNode.isWrapped() ? 1 : 0 );
		} else {
			// There is no next node, move up the stack until there is one
			left = right;
			while ( !nextNode ) {
				stack.pop();
				if ( stack.length === 0 ) {
					// This shouldn't be possible
					return retval;
				}
				currentFrame = stack[stack.length - 1];
				currentFrame.index++;
				nextNode = currentFrame.node.children[currentFrame.index];
				// Skip over the parent node's closing
				// (this is present for sure, because the parent has children)
				left++;
			}
			
			// Skip over nextNode's opening if present
			if ( nextNode.isWrapped() ) {
				left++;
			}
		}
	}
	return retval;
};

/* Static methods */
/**
 * Checks if elements are present within data.
 * 
 * @static
 * @method
 * @param {Array} data Data to look for elements within
 * @returns {Boolean} If elements exist in data
 */
ve.dm.Document.containsElementData = function( data ) {
	for ( var i = 0, length = data.length; i < length; i++ ) {
		if ( data[i].type !== undefined ) {
			return true;
		}
	}
	return false;
};

/* Inheritance */

ve.extendClass( ve.dm.Document, ve.dm.DocumentFragment );
