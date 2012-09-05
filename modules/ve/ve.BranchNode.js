/**
 * VisualEditor BranchNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Mixin for branch nodes.
 * Extenders are expected to inherit from ve.Node.
 *
 * Branch nodes are immutable, which is why there are no methods for adding or removing children.
 * DataModel classes will add this functionality, and other subclasses will implement behavior that
 * mimcs changes made to data model nodes.
 *
 * @mixin
 * @abstract
 * @constructor
 * @param {ve.Node[]} children Array of children to add
 */
ve.BranchNode = function ( children ) {
	this.children = ve.isArray( children ) ? children : [];
};

/**
 * Checks if this node has child nodes.
 *
 * @method
 * @see {ve.Node.prototype.hasChildren}
 * @returns {Boolean} Whether this node has children
 */
ve.BranchNode.prototype.hasChildren = function () {
	return true;
};

/**
 * Gets a list of child nodes.
 *
 * @method
 * @returns {ve.Node[]} List of child nodes
 */
ve.BranchNode.prototype.getChildren = function () {
	return this.children;
};

/**
 * Gets the index of a given child node.
 *
 * @method
 * @param {ve.dm.Node} node Child node to find index of
 * @returns {Number} Index of child node or -1 if node was not found
 */
ve.BranchNode.prototype.indexOf = function ( node ) {
	return ve.indexOf( node, this.children );
};

/**
 * Sets the root node this node is a descendent of.
 *
 * @method
 * @see {ve.Node.prototype.setRoot}
 * @param {ve.Node} root Node to use as root
 */
ve.BranchNode.prototype.setRoot = function ( root ) {
	if ( root === this.root ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.root = root;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setRoot( root );
	}
};

/**
 * Sets the document this node is a part of.
 *
 * @method
 * @see {ve.Node.prototype.setDocument}
 * @param {ve.Document} root Node to use as root
 */
ve.BranchNode.prototype.setDocument = function ( doc ) {
	if ( doc === this.doc ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.doc = doc;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setDocument( doc );
	}
};

/**
 * Gets the node at a given offset.
 *
 * This method is pretty expensive. If you need to get different slices of the same content, get
 * the content first, then slice it up locally.
 *
 * TODO: Rewrite this method to not use recursion, because the function call overhead is expensive
 *
 * @method
 * @param {Number} offset Offset get node for
 * @param {Boolean} [shallow] Do not iterate into child nodes of child nodes
 * @returns {ve.Node|null} Node at offset, or null if non was found
 */
ve.BranchNode.prototype.getNodeFromOffset = function ( offset, shallow ) {
	if ( offset === 0 ) {
		return this;
	}
	// TODO a lot of logic is duplicated in selectNodes(), abstract that into a traverser or something
	if ( this.children.length ) {
		var i, length, nodeLength, childNode,
			nodeOffset = 0;
		for ( i = 0, length = this.children.length; i < length; i++ ) {
			childNode = this.children[i];
			if ( offset === nodeOffset ) {
				// The requested offset is right before childNode,
				// so it's not inside any of this's children, but inside this
				return this;
			}
			nodeLength = childNode.getOuterLength();
			if ( offset >= nodeOffset && offset < nodeOffset + nodeLength ) {
				if ( !shallow && childNode.hasChildren() && childNode.getChildren().length ) {
					return this.getNodeFromOffset.call( childNode, offset - nodeOffset - 1 );
				} else {
					return childNode;
				}
			}
			nodeOffset += nodeLength;
		}
		if ( offset === nodeOffset ) {
			// The requested offset is right before this.children[i],
			// so it's not inside any of this's children, but inside this
			return this;
		}
	}
	return null;
};

/**
 * Gets the content offset of a node.
 *
 * TODO: Rewrite this method to not use recursion, because the function call overhead is expensive
 *
 * @method
 * @param {ve.Node} node Node to get offset of
 * @returns {Number} Offset of node or -1 of node was not found
 */
ve.BranchNode.prototype.getOffsetFromNode = function ( node ) {
	if ( node === this ) {
		return 0;
	}
	if ( this.children.length ) {
		var i, length, childOffset, childNode,
			offset = 0;
		for ( i = 0, length = this.children.length; i < length; i++ ) {
			childNode = this.children[i];
			if ( childNode === node ) {
				return offset;
			}
			if ( childNode.canHaveChildren() && childNode.getChildren().length ) {
				childOffset = this.getOffsetFromNode.call( childNode, node );
				if ( childOffset !== -1 ) {
					return offset + 1 + childOffset;
				}
			}
			offset += childNode.getOuterLength();
		}
	}
	return -1;
};

/**
 * Traverse leaf nodes depth first.
 *
 * Callback functions are expected to accept a node and index argument. If a callback returns false,
 * iteration will stop.
 *
 * @param {Function} callback Function to execute for each leaf node
 * @param {ve.Node} [from] Node to start at. Must be a descendant of this node
 * @param {Boolean} [reverse] Whether to iterate backwards
 */
ve.BranchNode.prototype.traverseLeafNodes = function ( callback, from, reverse ) {
		// Stack of indices that lead from this to node
	var indexStack = [],
		// Node whose children we're currently traversing
		node = this,
		// Index of the child node we're currently visiting
		index = reverse ? node.children.length - 1 : 0,
		// Shortcut for node.children[index]
		childNode,
		// Result of the last invocation of the callback
		callbackResult,
		// Variables for the loop that builds indexStack if from is specified
		n, p, i;
	
	if ( from !== undefined ) {
		// Reverse-engineer the index stack by starting at from and
		// working our way up until we reach this
		n = from;
		while ( n !== this ) {
			p = n.getParent();
			if ( !p ) {
				// n is a root node and we haven't reached this
				// That means from isn't a descendant of this
				throw new Error( 'from parameter passed to traverseLeafNodes() must be a descendant' );
			}
			// Find the index of n in p
			i = p.indexOf( n );
			if ( i === -1 ) {
				// This isn't supposed to be possible
				throw new Error( 'Tree corruption detected: node isn\'t in its parent\'s children array' );
			}
			indexStack.push( i );
			// Move up
			n = p;
		}
		// We've built the indexStack in reverse order, so reverse it
		indexStack = indexStack.reverse();
		
		// Set up the variables such that from will be visited next
		index = indexStack.pop();
		node = from.getParent(); // from is a descendant of this so its parent exists
		
		// If we're going in reverse, then we still need to visit from if it's
		// a leaf node, but we should not descend into it
		// So if from is not a leaf node, skip it now
		if ( reverse && from.canHaveChildren() ) {
			index--;
		}
	}
	
	while ( true ) {
		childNode = node.children[index];
		if ( childNode === undefined ) {
			if ( indexStack.length > 0 ) {
				// We're done traversing the current node, move back out of it
				node = node.getParent();
				index = indexStack.pop();
				// Move to the next child
				index += reverse ? -1 : 1;
				continue;
			} else {
				// We can't move up any more, so we're done
				return;
			}
		}
		
		if ( childNode.canHaveChildren() ) {
			// Descend into this node
			node = childNode;
			// Push our current index onto the stack
			indexStack.push( index );
			// Set the current index to the first element we're visiting
			index = reverse ? node.children.length - 1 : 0;
		} else {
			// This is a leaf node, visit it
			callbackResult = callback( childNode ); // TODO what is index?
			if ( callbackResult === false ) {
				// The callback is telling us to stop
				return;
			}
			// Move to the next child
			index += reverse ? -1 : 1;
		}
	}
};
