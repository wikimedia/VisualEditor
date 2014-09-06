/*!
 * VisualEditor ContentEditable block image caption node class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable block image caption item node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.BlockImageCaptionNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.BlockImageCaptionNode = function VeCeBlockImageCaptionNode( model, config ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );
};

/* Inheritance */

OO.inheritClass( ve.ce.BlockImageCaptionNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.BlockImageCaptionNode.static.name = 'imageCaption';

ve.ce.BlockImageCaptionNode.static.tagName = 'figcaption';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.BlockImageCaptionNode );
