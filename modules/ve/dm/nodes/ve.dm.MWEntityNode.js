/*!
 * VisualEditor DataModel MWEntityNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki entitiy node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWEntityNode = function VeDmMWEntityNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'MWentity', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWEntityNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.MWEntityNode.static.name = 'MWentity';

ve.dm.MWEntityNode.static.isContent = true;

ve.dm.MWEntityNode.static.matchTagNames = [ 'span' ];

ve.dm.MWEntityNode.static.matchRdfaTypes = [ 'mw:Entity' ]; // TODO ignored, still using a converter hack

ve.dm.MWEntityNode.static.toDataElement = function ( domElement ) {
	return { 'type': 'MWentity', 'attributes': { 'character': domElement.textContent } };
};

ve.dm.MWEntityNode.static.toDomElement = function ( dataElement ) {
	var domElement = document.createElement( 'span' ),
		textNode = document.createTextNode( dataElement.attributes.character );
	domElement.setAttribute( 'typeof', 'mw:Entity' );
	domElement.appendChild( textNode );
	return domElement;
};

/* Registration */

ve.dm.modelRegistry.register( 'MWentity', ve.dm.MWEntityNode );
