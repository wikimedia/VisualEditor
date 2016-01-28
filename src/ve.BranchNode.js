/*!
 * VisualEditor BranchNode class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Branch node mixin.
 *
 * Extenders are expected to inherit from ve.Node.
 *
 * Branch nodes are immutable, which is why there are no methods for adding or removing children.
 * DataModel classes will add this functionality, and other subclasses will implement behavior that
 * mimics changes made to DataModel nodes.
 *
 * @class
 * @abstract
 * @constructor
 * @param {ve.Node[]} children Array of children to add
 */
ve.BranchNode = function VeBranchNode( children ) {
	this.children = Array.isArray( children ) ? children : [];
};

/* Setup */

OO.initClass( ve.BranchNode );

/* Static Methods */

/**
 * Traverse a branch node depth-first.
 *
 * @param {ve.BranchNode} node Branch node to traverse
 * @param {Function} callback Callback to execute for each traversed node
 * @param {ve.Node} callback.node Node being traversed
 */
ve.BranchNode.static.traverse = function ( node, callback ) {
	var i, len,
		children = node.getChildren();

	for ( i = 0, len = children.length; i < len; i++ ) {
		callback.call( this, children[ i ] );
		if ( children[ i ] instanceof ve.ce.BranchNode ) {
			this.traverse( children[ i ], callback );
		}
	}
};

/* Methods */

/**
 * Check if the node has children.
 *
 * @method
 * @return {boolean} Whether the node has children
 */
ve.BranchNode.prototype.hasChildren = function () {
	return true;
};

/**
 * Get child nodes.
 *
 * @method
 * @return {ve.Node[]} List of child nodes
 */
ve.BranchNode.prototype.getChildren = function () {
	return this.children;
};

/**
 * Get the index of a child node.
 *
 * @method
 * @param {ve.dm.Node} node Child node to find index of
 * @return {number} Index of child node or -1 if node was not found
 */
ve.BranchNode.prototype.indexOf = function ( node ) {
	return this.children.indexOf( node );
};

/**
 * Set the root node.
 *
 * @method
 * @see ve.Node#setRoot
 * @param {ve.Node} root Node to use as root
 */
ve.BranchNode.prototype.setRoot = function ( root ) {
	var i;
	if ( root === this.root ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.root = root;
	for ( i = 0; i < this.children.length; i++ ) {
		this.children[ i ].setRoot( root );
	}
};

/**
 * Set the document the node is a part of.
 *
 * @method
 * @see ve.Node#setDocument
 * @param {ve.Document} doc Document this node is a part of
 */
ve.BranchNode.prototype.setDocument = function ( doc ) {
	var i;
	if ( doc === this.doc ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.doc = doc;
	for ( i = 0; i < this.children.length; i++ ) {
		this.children[ i ].setDocument( doc );
	}
};

/**
 * Get a node from an offset.
 *
 * This method is pretty expensive. If you need to get different slices of the same content, get
 * the content first, then slice it up locally.
 *
 * @method
 * @param {number} offset Offset get node for
 * @param {boolean} [shallow] Do not iterate into child nodes of child nodes
 * @return {ve.Node|null} Node at offset, or null if none was found
 */
ve.BranchNode.prototype.getNodeFromOffset = function ( offset, shallow ) {
	var i, length, nodeLength, childNode,
		currentNode = this,
		nodeOffset = 0;
	if ( offset === 0 ) {
		return currentNode;
	}
	// TODO a lot of logic is duplicated in selectNodes(), abstract that into a traverser or something
	SIBLINGS:
	while ( currentNode.children.length ) {
		for ( i = 0, length = currentNode.children.length; i < length; i++ ) {
			childNode = currentNode.children[ i ];
			if ( childNode instanceof ve.ce.InternalListNode ) {
				break;
			}
			if ( offset === nodeOffset ) {
				// The requested offset is right before childNode, so it's not
				// inside any of currentNode's children, but is inside currentNode
				return currentNode;
			}
			nodeLength = childNode.getOuterLength();
			if ( offset >= nodeOffset && offset < nodeOffset + nodeLength ) {
				if ( !shallow && childNode.hasChildren() && childNode.getChildren().length ) {
					// One of the children contains the node; increment to
					// enter the node, then iterate through children
					nodeOffset += 1;
					currentNode = childNode;
					continue SIBLINGS;
				} else {
					return childNode;
				}
			}
			nodeOffset += nodeLength;
		}
		if ( offset === nodeOffset ) {
			// The requested offset is right before currentNode.children[i], so it's
			// not inside any of currentNode's children, but is inside currentNode
			return currentNode;
		}
	}
	return null;
};
