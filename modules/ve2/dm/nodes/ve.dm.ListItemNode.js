/**
 * DataModel node for a list item.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.ListItemNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'listItem', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.ListItemNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': null,
	'parentNodeTypes': ['list']
};

/* Registration */

ve.dm.factory.register( 'listItem', ve.dm.ListItemNode );

/* Inheritance */

ve.extendClass( ve.dm.ListItemNode, ve.dm.BranchNode );
