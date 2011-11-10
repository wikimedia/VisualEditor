/**
 * Creates an es.DocumentLeafNode object.
 * 
 * @class
 * @abstract
 * @constructor
 */
es.DocumentLeafNode = function() {
	//
};

/* Methods */

/**
 * Checks if this node has child nodes.
 * 
 * @method
 * @see {es.DocumentNode.prototype.hasChildren}
 * @returns {Boolean} Whether this node has children
 */
es.DocumentLeafNode.prototype.hasChildren = function() {
	return false;
};
