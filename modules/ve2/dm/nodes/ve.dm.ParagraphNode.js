/**
 * DataModel node for a paragraph.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.LeafNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.ParagraphNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'paragraph', children, attributes );
};

/* Static Members */

/**
 * @see ve.dm.NodeFactory
 */
ve.dm.ParagraphNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'childNodeTypes': null,
	'parentNodeTypes': null
};

/* Registration */

ve.dm.factory.register( 'paragraph', ve.dm.ParagraphNode );

/* Inheritance */

ve.extendClass( ve.dm.ParagraphNode, ve.dm.BranchNode );
