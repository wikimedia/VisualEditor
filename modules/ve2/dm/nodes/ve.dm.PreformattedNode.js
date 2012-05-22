/**
 * DataModel node for a preformatted.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.LeafNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.PreformattedNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'preformatted', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.PreformattedNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': true,
	'childNodeTypes': null,
	'parentNodeTypes': null
};

/* Registration */

ve.dm.factory.register( 'preformatted', ve.dm.PreformattedNode );

/* Inheritance */

ve.extendClass( ve.dm.PreformattedNode, ve.dm.BranchNode );
