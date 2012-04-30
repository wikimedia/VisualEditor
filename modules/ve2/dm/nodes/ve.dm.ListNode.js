/**
 * Data model node for a list.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.ListNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'list', children, attributes );
};

/* Static Members */

/**
 * @see ve.dm.NodeFactory
 */
ve.dm.ListNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'childNodeTypes': ['listItem'],
	'parentNodeTypes': null
};

/* Registration */

ve.dm.factory.register( 'list', ve.dm.ListNode );

/* Inheritance */

ve.extendClass( ve.dm.ListNode, ve.dm.BranchNode );
