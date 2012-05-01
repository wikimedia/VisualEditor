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
	ve.ce.BranchNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
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
