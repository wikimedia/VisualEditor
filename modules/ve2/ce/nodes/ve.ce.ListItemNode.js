/**
 * ContentEditable node for a list item.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ListItemNode} Model to observe
 */
ve.ce.ListItemNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.ListItemNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'listItem', ve.ce.ListItemNode );

/* Inheritance */

ve.extendClass( ve.ce.ListItemNode, ve.ce.BranchNode );
