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
	ve.ce.BranchNode.call( this, model );
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

/* Registration */

ve.ce.factory.register( 'list', ve.ce.ListNode );

/* Inheritance */

ve.extendClass( ve.ce.ListNode, ve.ce.BranchNode );
