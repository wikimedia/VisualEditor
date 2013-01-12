/*!
 * VisualEditor DataModel MetaBlockNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel meta block node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MetaBlockNode = function VeDmMetaBlockNode( length, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'metaBlock', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MetaBlockNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.MetaBlockNode.static.name = 'metaBlock';

ve.dm.MetaBlockNode.static.matchTagNames = [ 'meta' ];

ve.dm.MetaBlockNode.static.toDataElement = function () {
	throw new Error( 'No toDataElement for metaBlock, supposed to be handled by converter hack' );
};

ve.dm.MetaBlockNode.static.toDomElement = function ( dataElement ) {
	var style = dataElement.attributes && dataElement.attributes.style || 'meta',
		isLink = style === 'link',
		domElement;
	if ( style === 'comment' ) {
		return document.createComment( dataElement.attributes && dataElement.attributes.text || '' );
	}
	domElement = document.createElement( isLink ? 'link' : 'meta' );
	if ( dataElement.attributes && dataElement.attributes.key !== null ) {
		domElement.setAttribute( isLink ? 'rel' : 'property', dataElement.attributes.key );
	}
	if ( dataElement.attributes && dataElement.attributes.value ) {
		domElement.setAttribute( isLink ? 'href' : 'content', dataElement.attributes.value );
	}
	return domElement;
};

/* Registration */

ve.dm.nodeFactory.register( 'metaBlock', ve.dm.MetaBlockNode );
