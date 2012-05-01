/**
 * ContentEditable node for a table row.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.TableRowNode} Model to observe
 */
ve.ce.TableRowNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, $( '<tr></tr>' ) );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.TableRowNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'tableRow', ve.ce.TableRowNode );

/* Inheritance */

ve.extendClass( ve.ce.TableRowNode, ve.ce.BranchNode );
