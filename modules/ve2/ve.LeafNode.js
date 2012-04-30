/**
 * Mixin for leaf nodes
 * 
 * @class
 * @abstract
 * @constructor
 */
ve.LeafNode = function() {
	//
};

/**
 * Checks if this node can have children.
 * 
 * @method
 * @returns {Boolean} Always false
 */
ve.LeafNode.prototype.canHaveChildren = function() {
	return false;
};
