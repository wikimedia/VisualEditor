/*!
 * VisualEditor ContentEditable ParagraphNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable paragraph node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.ParagraphNode} model Model to observe
 */
ve.ce.ParagraphNode = function VeCeParagraphNode( model ) {
	// Parent constructor
	ve.ce.ContentBranchNode.call( this, model, $( '<p>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.ParagraphNode, ve.ce.ContentBranchNode );

/* Static Properties */

ve.ce.ParagraphNode.static.name = 'paragraph';

ve.ce.ParagraphNode.static.canBeSplit = true;

/* Registration */

ve.ce.nodeFactory.register( ve.ce.ParagraphNode );
