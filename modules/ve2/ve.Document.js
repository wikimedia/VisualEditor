/**
 * Generic document.
 * 
 * @class
 * @constructor
 * @param model {ve.Node} Model to observe
 */
ve.Document = function( documentNode ) {
	// Properties
	this.documentNode = documentNode;
};

/* Methods */

/**
 * Gets the root of the document's node tree.
 * 
 * @method
 * @returns {ve.Node} Root of node tree
 */
ve.Document.prototype.getDocumentNode = function() {
	return this.documentNode;
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
 *                  'index': Index of the node in its parent
 *                  'nodeRange': Range covering the inside of the entire node
 * @throws 'Invalid start offset' if range.start is out of range
 * @throws 'Invalid end offset' if range.end is out of range
 */
ve.Document.prototype.selectNodes = function( range, mode ) {
	var	doc = this.documentNode,
		retval = [],
		start = range.start,
		end = range.end,
		stack = [ {
			'node': doc,
			'index': 0,
			'startOffset': 0
		} ],
		node,
		prevNode,
		nextNode,
		left,
		right,
		currentFrame = stack[0],
		parentFrame,
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
		// Document has no children. This is weird
		return [ {
			'node': doc,
			'range': new ve.Range( start, end ),
			'index': 0,
			'parentRange': new ve.Range( 0, doc.getLength() )
		} ];
	}
	// TODO maybe we could find the start more efficiently using the offset map
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
			parentFrame = stack[stack.length - 2];
			return [ {
				'node': currentFrame.node,
				'range': new ve.Range( start, end ),
				'index': parentFrame.index,
				'nodeRange': new ve.Range( parentFrame.startOffset,
					parentFrame.startOffset + currentFrame.node.getLength()
				)
			} ];
		} else if ( startBetween ) {
			// start is between the previous sibling and node
			// so the selection covers all of node and possibly more
			
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// Descend into node
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				startFound = true;
				continue;
			} else {
				// All of node is covered
				retval.push( {
					'node': node,
					// no 'range' because the entire node is covered
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right )
				} );
				startFound = true;
			}
		} else if ( startInside && endInside ) {
			if ( node.children && node.children.length ) {
				// Descend into node
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
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
					'range': new ve.Range( left, right ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right )
				} ];
			}
		} else if ( startInside ) {
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// node is a branch node and the start is inside it
				// Descend into it
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
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
					'range': new ve.Range( start, right ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right )
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
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// All of node is covered
				retval.push( {
					'node': node,
					// no 'range' because the entire node is covered
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right )
				} );
				return retval;
			}
		} else if ( endInside ) {
			if ( mode == 'leaves' && node.children && node.children.length ) {
				// node is a branch node and the end is inside it
				// Descend into it
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
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
					'range': new ve.Range( left, end ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right )
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
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				continue;
			} else {
				// All of node is covered
				retval.push( {
					'node': node,
					// no 'range' because the entire node is covered
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right )
				} );
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
