/*!
 * VisualEditor ContentEditable ListItemNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable image caption item node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.MWImageCaptionNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWImageCaptionNode = function VeCeMWImageCaptionNode( model, config ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWImageCaptionNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.MWImageCaptionNode.static.name = 'MWimagecaption';

ve.ce.MWImageCaptionNode.static.tagName = 'figcaption';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWImageCaptionNode );