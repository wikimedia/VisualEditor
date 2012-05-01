/**
 * ContentEditable node for a list.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ListNode} Model to observe
 */
ve.ce.ListNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, ve.ce.ListNode.getDomElement( model ) );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.ListNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

ve.ce.ListNode.domNodeTypes = {
	'bullet': 'ul',
	'number': 'ol',
	'definition': 'dl'
};

/* Static Methods */

ve.ce.ListNode.getDomElement = function( model ) {
	var style = model.getElementAttribute( 'style' ),
		type = ve.ce.ListNode.domNodeTypes[style];
	if ( type === undefined ) {
		throw 'Invalid style attribute in list node model: ' + style;
	}
	return $( '<' + type + '></' + type + '>' );
};

/* Registration */

ve.ce.factory.register( 'list', ve.ce.ListNode );

/* Inheritance */

ve.extendClass( ve.ce.ListNode, ve.ce.BranchNode );
