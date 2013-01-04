/*!
 * VisualEditor content editable ParagraphNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for a paragraph.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.ParagraphNode} model Model to observe
 */
ve.ce.ParagraphNode = function VeCeParagraphNode( model ) {
	// Parent constructor
	ve.ce.ContentBranchNode.call( this, 'paragraph', model, $( '<p>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.ParagraphNode, ve.ce.ContentBranchNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @property
 */
ve.ce.ParagraphNode.rules = {
	'canBeSplit': true
};

/* Registration */

ve.ce.nodeFactory.register( 'paragraph', ve.ce.ParagraphNode );
