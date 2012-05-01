/**
 * ContentEditable node for a heading.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.HeadingNode} Model to observe
 */
ve.ce.HeadingNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.HeadingNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'canBeSplit': true
};

/* Registration */

ve.ce.factory.register( 'heading', ve.ce.HeadingNode );

/* Inheritance */

ve.extendClass( ve.ce.HeadingNode, ve.ce.BranchNode );
