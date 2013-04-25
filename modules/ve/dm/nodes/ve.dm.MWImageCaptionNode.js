/*!
 * VisualEditor DataModel MWImageCaptionNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel image caption item node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWImageCaptionNode = function VeDmMWImageCaptionNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, children, element );
};

ve.inheritClass( ve.dm.MWImageCaptionNode, ve.dm.BranchNode );

ve.dm.MWImageCaptionNode.static.name = 'MWimagecaption';

ve.dm.MWImageCaptionNode.static.matchTagNames = [];

ve.dm.MWImageCaptionNode.static.parentNodeTypes = [ 'MWblockimage' ];

ve.dm.MWImageCaptionNode.static.toDataElement = function () {
	// Probably not needed
	return { 'type': 'MWimagecaption' };
};

ve.dm.MWImageCaptionNode.static.toDomElements = function ( dataElement, doc ) {
	return [ doc.createElement( 'figcaption' ) ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWImageCaptionNode );