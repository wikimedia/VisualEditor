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
 *     'coveredNodes': Do not descend into nodes that are entirely covered by the range. The result
 *                     is similar to that of 'leaves' except that if a node is entirely covered, its
 *                     children aren't returned separately.
 *     'siblings': Return a set of adjacent siblings covered by the range (descends as long as the
 *                    range is in a single node)
 * @returns {Array} List of objects describing nodes in the selection and the ranges therein
 *                  'node': Reference to a ve.dm.Node
 *                  'range': ve.Range, missing if the entire node is covered
 *                  'index': Index of the node in its parent, missing if node has no parent
 *                  'indexInNode': If range is a zero-length range between two children of node,
 *                                 this is set to the index of the child following range (or to
 *                                 node.children.length+1 if range is between the last child and
 *                                 the end). Missing in all other cases
 *                  'nodeRange': Range covering the inside of the entire node
 * @throws 'Invalid start offset' if range.start is out of range
 * @throws 'Invalid end offset' if range.end is out of range
 */
ve.Document.prototype.selectNodes = function( range, mode ) {
	range.normalize();
	var	doc = this.documentNode,
		retval = [],
		start = range.start,
		end = range.end,
		stack = [ {
			// Node we are currently stepping through
			// Note each iteration visits a child of node, not node itself
			'node': doc,
			// Index of the child in node we're visiting
			'index': 0,
			// First offset inside node
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
		startFound = false,
		nodeRange,
		isWrapped;

	mode = mode || 'leaves';
	if ( mode !== 'leaves' && mode !== 'covered' && mode !== 'siblings' ) {
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
		nodeRange = new ve.Range( 0, doc.getLength() );
		return [ {
			'node': doc,
			'range': new ve.Range( start, end ),
			'index': 0,
			'nodeRange': nodeRange,
			'nodeOuterRange': nodeRange
		} ];
	}
	// TODO maybe we could find the start more efficiently using the offset map
	left = doc.children[0].isWrapped() ? 1 : 0;

	do {
		node = currentFrame.node.children[currentFrame.index];
		prevNode = currentFrame.node.children[currentFrame.index - 1];
		nextNode = currentFrame.node.children[currentFrame.index + 1];
		right = left + node.getLength();
		// Is the start inside node?
		startInside = start >= left && start <= right;
		// Is the end inside node?
		endInside = end >= left && end <= right;
		// Does the node have wrapping elements around it
		isWrapped = node.isWrapped();
		// Is the start between prevNode and node or between the parent's opening and node?
		startBetween = isWrapped ? start == left - 1 : start == left;
		// Is the end between node and nextNode or between node and the parent's closing?
		endBetween = isWrapped ? end == right + 1 : end == right;

		if ( start == end && ( startBetween || endBetween ) && node.isWrapped() ) {
			// Empty range in the parent, outside of any child
			nodeRange = new ve.Range( currentFrame.startOffset,
				currentFrame.startOffset + currentFrame.node.getLength()
			);
			isWrapped = currentFrame.node.isWrapped();
			retval = [ {
				'node': currentFrame.node,
				'indexInNode': currentFrame.index + ( endBetween ? 1 : 0 ),
				'range': new ve.Range( start, end ),
				'nodeRange': nodeRange,
				'nodeOuterRange': new ve.Range(
					nodeRange.start - isWrapped, nodeRange.end + isWrapped
				)
			} ];
			parentFrame = stack[stack.length - 2];
			if ( parentFrame ) {
				retval[0].index = parentFrame.index;
			}
		} else if ( startBetween ) {
			// start is between the previous sibling and node
			// so the selection covers all or part of node
			
			// Descend if
			// * we are in leaves mode, OR
			// * we are in covered mode and the end is inside node
			if ( ( mode === 'leaves' || ( mode === 'covered' && endInside ) ) &&
				node.children && node.children.length
			) {
				// Descend into node
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				startFound = true;
				continue;
			} else if ( !endInside ) {
				// All of node is covered
				retval.push( {
					'node': node,
					// no 'range' because the entire node is covered
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
				} );
				startFound = true;
			} else {
				// Part of node is covered
				return [ {
					'node': node,
					'range': new ve.Range( start, end ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
				} ];
			}
		} else if ( startInside && endInside ) {
			if ( node.children && node.children.length ) {
				// Descend into node
				// If the first child of node has an opening, skip over it
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				continue;
			} else {
				// node is a leaf node and the range is entirely inside it
				return [ {
					'node': node,
					'range': new ve.Range( start, end ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
				} ];
			}
		} else if ( startInside ) {
			if ( ( mode === 'leaves' || mode === 'covered' )
				&& node.children && node.children.length
			) {
				// node is a branch node and the start is inside it
				// Descend into it
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				continue;
			} else {
				// node is a leaf node and the start is inside it
				// Add to retval and keep going
				retval.push( {
					'node': node,
					'range': new ve.Range( start, right ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
				} );
				startFound = true;
			}
		} else if ( endBetween ) {
			// end is between node and the next sibling
			// start is not inside node, so the selection covers
			// all of node, then ends
			
			if ( mode === 'leaves' && node.children && node.children.length ) {
				// Descend into node
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				continue;
			} else {
				// All of node is covered
				retval.push( {
					'node': node,
					// no 'range' because the entire node is covered
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
				} );
				return retval;
			}
		} else if ( endInside ) {
			if ( ( mode === 'leaves' || mode === 'covered' )
				&& node.children && node.children.length
			) {
				// node is a branch node and the end is inside it
				// Descend into it
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				continue;
			} else {
				// node is a leaf node and the end is inside it
				// Add to retval and return
				retval.push( {
					'node': node,
					'range': new ve.Range( left, end ),
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
				} );
				return retval;
			}
		} else if ( startFound ) {
			// Neither the start nor the end is inside node, but we found the start earlier,
			// so node must be between the start and the end
			// Add the entire node, so no range property
			
			if ( mode === 'leaves' && node.children && node.children.length ) {
				// Descend into node
				if ( node.children[0].isWrapped() ) {
					left++;
				}
				currentFrame = {
					'node': node,
					'index': 0,
					'startOffset': left
				};
				stack.push( currentFrame );
				continue;
			} else {
				// All of node is covered
				retval.push( {
					'node': node,
					// no 'range' because the entire node is covered
					'index': currentFrame.index,
					'nodeRange': new ve.Range( left, right ),
					'nodeOuterRange': new ve.Range( left - isWrapped, right + isWrapped )
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
			left = right +
				// Skip over node's closing, if present
				( node.isWrapped() ? 1 : 0 );
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
	} while ( end >= left );
	return retval;
};
