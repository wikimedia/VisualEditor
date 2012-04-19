/**
 * Mixin for branch node functionality
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
 * @see {ve.Node.prototype.canHaveChildren}
 */
ve.BranchNode.prototype.canHaveChildren = function() {
	return true;
};

/**
 * @see {ve.Node.prototype.canHaveGrandchildren}
 */
ve.BranchNode.prototype.canHaveGrandchildren = function () {
	return true;
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
 * Sets the root node to this and all of its descendants, recursively.
 * 
 * @method
 * @see {ve.Node.prototype.setRoot}
 * @param {ve.Node} root Node to use as root
 */
ve.dm.BranchNode.prototype.setRoot = function( root ) {
	if ( root == this.root ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	
	this.root = root;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setRoot( root );
	}
};
