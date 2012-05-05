/**
 * ContentEditable node for a table cell.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.TableCellNode} Model to observe
 */
ve.ce.TableCellNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'tableCell', model, $( '<td></td>' ) );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.TableCellNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'tableCell', ve.ce.TableCellNode );

/* Inheritance */

ve.extendClass( ve.ce.TableCellNode, ve.ce.BranchNode );
