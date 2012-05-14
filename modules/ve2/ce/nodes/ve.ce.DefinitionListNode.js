/**
 * ContentEditable node for a definition list.
 *
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.DefinitionListNode} Model to observe
 */
ve.ce.DefinitionListNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'definitionList', model, $( '<dl></dl>' ) );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.DefinitionListNode.rules = {
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'definitionList', ve.ce.DefinitionListNode );

/* Inheritance */

ve.extendClass( ve.ce.DefinitionListNode, ve.ce.BranchNode );
