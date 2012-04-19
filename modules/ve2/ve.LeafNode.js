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

/* Methods */

/**
 * @see {ve.Node.prototype.canHaveChildren}
 */
ve.LeafNode.prototype.canHaveChildren = function() {
	return false;
};

/**
 * @see {ve.Node.prototype.canHaveGrandchildren}
 */
ve.LeafNode.prototype.canHaveGrandchildren = function () {
	return false;
};
