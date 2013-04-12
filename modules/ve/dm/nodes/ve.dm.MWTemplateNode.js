/*!
 * VisualEditor DataModel MWTemplateNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki template node.
 *
 * @class
 * @abstract
 * @extends ve.dm.GeneratedContentNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWTemplateNode = function VeDmMWTemplateNode( length, element ) {
	// Parent constructor
	ve.dm.GeneratedContentNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWTemplateNode, ve.dm.GeneratedContentNode );

/* Static members */

ve.dm.MWTemplateNode.static.name = 'MWtemplate';

ve.dm.MWTemplateNode.static.matchTagNames = null;

ve.dm.MWTemplateNode.static.matchRdfaTypes = [ 'mw:Object/Template' ];

ve.dm.MWTemplateNode.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		mw: dataElement.mw
	};
};

ve.dm.MWTemplateNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement,
		about = domElements[0].getAttribute( 'about' ),
		mw = JSON.parse( domElements[0].getAttribute( 'data-mw' ) );
	dataElement = {
		'type': this.name,
		'mw': mw,
		'about': about
	};
	this.storeHtml( dataElement, domElements, converter.getStore() );
	return dataElement;
};

ve.dm.MWTemplateNode.static.toDomElements = function ( dataElement, doc ) {
	var span = doc.createElement( 'span' );
	// All we need to send back to Parsoid is the original template marker,
	// with a reconstructed data-mw property.
	span.setAttribute( 'about', dataElement.about );
	span.setAttribute( 'typeof', 'mw:Object/Template' );
	span.setAttribute( 'data-mw', JSON.stringify( dataElement.mw ) );
	return [ span ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWTemplateNode );
