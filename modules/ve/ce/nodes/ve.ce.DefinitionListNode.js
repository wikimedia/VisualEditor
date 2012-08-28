/**
 * VisualEditor content editable DefinitionListNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for a definition list.
 *
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.DefinitionListNode} Model to observe
 */
ve.ce.DefinitionListNode = function ( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'definitionList', model, $( '<dl>' ) );
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

ve.ce.nodeFactory.register( 'definitionList', ve.ce.DefinitionListNode );

/* Inheritance */

ve.extendClass( ve.ce.DefinitionListNode, ve.ce.BranchNode );
