/**
 * ContentEditable node for a paragraph.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ParagraphNode} Model to observe
 */
ve.ce.ParagraphNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.ParagraphNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'canBeSplit': true
};

/* Registration */

ve.ce.factory.register( 'paragraph', ve.ce.ParagraphNode );

/* Inheritance */

ve.extendClass( ve.ce.ParagraphNode, ve.ce.BranchNode );
