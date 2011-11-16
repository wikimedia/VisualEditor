/**
 * Creates an es.TableCellView object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentViewBranchNode}
 * @param {es.TableCellModel} model Table cell model to view
 */
es.TableCellView = function( model ) {
	// Inheritance
	es.DocumentViewBranchNode.call( this, model, $( '<td>' ) );

	// DOM Changes
	this.$
		.attr( 'style', model.getElementAttribute( 'html/style' ) )
		.addClass( 'es-tableCellView' );
};

/* Registration */

es.DocumentView.splitRules.tableCell = {
	'self': false,
	'children': true
};

/* Inheritance */

es.extendClass( es.TableCellView, es.DocumentViewBranchNode );
