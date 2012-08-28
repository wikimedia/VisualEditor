/**
 * VisualEditor content editable ParagraphNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for a paragraph.
 *
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ParagraphNode} Model to observe
 */
ve.ce.ParagraphNode = function ( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'paragraph', model, $( '<p>' ) );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.ParagraphNode.rules = {
	'canBeSplit': true
};

/* Registration */

ve.ce.nodeFactory.register( 'paragraph', ve.ce.ParagraphNode );

/* Inheritance */

ve.extendClass( ve.ce.ParagraphNode, ve.ce.BranchNode );
