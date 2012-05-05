/**
 * ContentEditable node for preformatted content.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.PreformattedNode} Model to observe
 */
ve.ce.PreformattedNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'preformatted', model, $( '<pre></pre>' ) );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.PreformattedNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'canBeSplit': true
};

/* Registration */

ve.ce.factory.register( 'preformatted', ve.ce.PreformattedNode );

/* Inheritance */

ve.extendClass( ve.ce.PreformattedNode, ve.ce.BranchNode );
