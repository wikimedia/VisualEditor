/**
 * Mixin for twig nodes
 * 
 * @class
 * @abstract
 * @constructor
 */
ve.TwigNode = function() {
	//
};

/* Methods */

/**
 * @see {ve.Node.prototype.canHaveChildren}
 */
ve.TwigNode.prototype.canHaveChildren = function() {
	return true;
};

/**
 * @see {ve.Node.prototype.canHaveGrandchildren}
 */
ve.TwigNode.prototype.canHaveGrandchildren = function () {
	return false;
};
