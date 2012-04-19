/**
 * Mixin for branch node functionality
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
