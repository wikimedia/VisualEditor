/**
 * Creates an ve.ce.TableRowNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param {ve.dm.TableRowNode} model Table row model to view
 */
ve.ce.TableRowNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, $( '<tr>' ), true );
	
	// DOM Changes
	this.$
		.attr( 'style', model.getElementAttribute( 'html/style' ) )
		.addClass( 'es-tableRowView' );
};

/* Registration */

ve.ce.DocumentNode.splitRules.tableRow = {
	'self': false,
	'children': false
};

/* Inheritance */

ve.extendClass( ve.ce.TableRowNode, ve.ce.BranchNode );
