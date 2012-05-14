/**
 * DataModel node for a definition list item.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.DefinitionListItemNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'definitionListItem', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.DefinitionListItemNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'isWrapped': true,
	'childNodeTypes': null,
	'parentNodeTypes': ['definitionList']
};

/* Registration */

ve.dm.factory.register( 'definitionListItem', ve.dm.DefinitionListItemNode );

/* Inheritance */

ve.extendClass( ve.dm.DefinitionListItemNode, ve.dm.BranchNode );
