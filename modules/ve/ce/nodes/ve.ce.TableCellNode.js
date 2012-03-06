/**
 * Creates an ve.ce.TableCellNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param {ve.dm.TableCellNode} model Table cell model to view
 */
ve.ce.TableCellNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, $( '<td>' ) );

	// DOM Changes
	this.$
		.attr( 'style', model.getElementAttribute( 'html/style' ) )
		.addClass( 'es-tableCellView' );
};

/* Registration */

ve.ce.DocumentNode.splitRules.tableCell = {
	'self': false,
	'children': true
};

/* Inheritance */

ve.extendClass( ve.ce.TableCellNode, ve.ce.BranchNode );
