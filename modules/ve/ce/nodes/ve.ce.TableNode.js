/**
 * Creates an ve.ce.TableNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param {ve.dm.TableNode} model Table model to view
 */
ve.ce.TableNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, $( '<table>' ) );
	
	// DOM Changes
	this.$
		.attr( 'style', model.getElementAttribute( 'html/style' ) )
		.addClass( 'es-tableView' );
};

/* Registration */

ve.ce.DocumentNode.splitRules.table = {
	'self': false,
	'children': false
};

/* Inheritance */

ve.extendClass( ve.ce.TableNode, ve.ce.BranchNode );
