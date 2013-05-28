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

ve.dm.MWImageCaptionNode.static.name = 'mwImageCaption';

ve.dm.MWImageCaptionNode.static.matchTagNames = [];

ve.dm.MWImageCaptionNode.static.parentNodeTypes = [ 'mwBlockImage' ];

ve.dm.MWImageCaptionNode.static.toDataElement = function () {
	// Probably not needed
	return { 'type': 'mwImageCaption' };
};

ve.dm.MWImageCaptionNode.static.toDomElements = function ( dataElement, doc ) {
	// TODO: Parsoid requires figcaption tag to have class mw-figcaption set in order to be
	// serialized correctly, however this is going to change in the future and then this code can
	// be simplified.
	var figcaption = doc.createElement( 'figcaption' );
	figcaption.setAttribute( 'class', 'mw-figcaption' );
	return [ figcaption ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWImageCaptionNode );