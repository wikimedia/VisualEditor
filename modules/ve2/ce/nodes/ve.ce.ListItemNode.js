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
	ve.ce.BranchNode.call( this, model, ve.ce.ListItemNode.getDomElement( model ) );
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

ve.ce.ListItemNode.domNodeTypes = {
	'item': 'li',
	'definition': 'dd',
	'term': 'dt'
};

/* Static Methods */

ve.ce.ListItemNode.getDomElement = function( model ) {
	var style = model.getElementAttribute( 'style' ),
		type = ve.ce.ListItemNode.domNodeTypes[style];
	if ( type === undefined ) {
		throw 'Invalid style attribute in list node model: ' + style;
	}
	return $( '<' + type + '></' + type + '>' );
};

/* Registration */

ve.ce.factory.register( 'listItem', ve.ce.ListItemNode );

/* Inheritance */

ve.extendClass( ve.ce.ListItemNode, ve.ce.BranchNode );
