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

ve.LeafNode.prototype.canHaveChildren = function() {
	return false;
};
