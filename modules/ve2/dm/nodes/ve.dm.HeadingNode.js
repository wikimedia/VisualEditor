/**
 * Data model node for a heading.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.LeafNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.HeadingNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'heading', children, attributes );
};

/* Static Members */

ve.dm.HeadingNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'childNodeTypes': null,
	'parentNodeTypes': null
};

/* Registration */

ve.dm.factory.register( 'heading', ve.dm.HeadingNode );

/* Inheritance */

ve.extendClass( ve.dm.HeadingNode, ve.dm.BranchNode );
