/**
 * ContentEditable node for a table.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.TableNode} Model to observe
 */
ve.ce.TableNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, $( '<table></table>' ) );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.TableNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'table', ve.ce.TableNode );

/* Inheritance */

ve.extendClass( ve.ce.TableNode, ve.ce.BranchNode );
