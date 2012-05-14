/**
 * Mixin for branch nodes.
 *
 * Branch nodes are immutable, which is why there are no methods for adding or removing children.
 * DataModel classes will add this functionality, and other subclasses will implement behavior that
 * mimcs changes made to data model nodes.
 *
 * @class
 * @abstract
 * @constructor
 * @param {ve.Node[]} children Array of children to add
 */
ve.BranchNode = function( children ) {
	this.children = ve.isArray( children ) ? children : [];
};

/**
 * Gets a list of child nodes.
 *
 * @method
 * @returns {ve.Node[]} List of child nodes
 */
ve.BranchNode.prototype.getChildren = function() {
	return this.children;
};

/**
 * Gets the index of a given child node.
 *
 * @method
 * @param {ve.dm.Node} node Child node to find index of
 * @returns {Integer} Index of child node or -1 if node was not found
 */
ve.BranchNode.prototype.indexOf = function( node ) {
	return ve.inArray( node, this.children );
};

/**
 * Sets the root node this node is a descendent of.
 *
 * @method
 * @see {ve.Node.prototype.setRoot}
 * @param {ve.Node} root Node to use as root
 */
ve.BranchNode.prototype.setRoot = function( root ) {
	if ( root == this.root ) {
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
ve.BranchNode.prototype.setDocument = function( doc ) {
	if ( doc == this.doc ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.doc = doc;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setDocument( doc );
	}
};

/**
 * Gets the content offset of a node.
 *
 * TODO: Rewrite this method to not use recursion, because the function call overhead is expensive
 *
 * @method
 * @param {ve.Node} node Node to get offset of
 * @returns {Integer} Offset of node or -1 of node was not found
 */
ve.BranchNode.prototype.getOffsetFromNode = function( node ) {
	if ( node === this ) {
		return 0;
	}
	if ( this.children.length ) {
		var offset = 0,
			childNode;
		for ( var i = 0, length = this.children.length; i < length; i++ ) {
			childNode = this.children[i];
			if ( childNode === node ) {
				return offset;
			}
			if ( childNode.canHaveChildren() && childNode.getChildren().length ) {
				var childOffset = this.getOffsetFromNode.call( childNode, node );
				if ( childOffset !== -1 ) {
					return offset + 1 + childOffset;
				}
			}
			offset += childNode.getOuterLength();
		}
	}
	return -1;
};
