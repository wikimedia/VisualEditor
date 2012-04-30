/**
 * Data model node for a document.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.DocumentNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'document', children, attributes );
};

/* Static Members */

ve.dm.DocumentNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'childNodeTypes': null,
	'parentNodeTypes': []
};

/* Methods */

/**
 * Gets the outer length, which for a document node is the same as the inner length.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.dm.DocumentNode.prototype.getOuterLength = function() {
	return this.length;
};

/* Registration */

ve.dm.factory.register( 'document', ve.dm.DocumentNode );

/* Inheritance */

ve.extendClass( ve.dm.DocumentNode, ve.dm.BranchNode );
