/*!
 * VisualEditor DataModel MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki image node.
 *
 * @class
 * @extends ve.dm.ImageNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWInlineImageNode = function VeDmMWInlineImageNode( length, element ) {
	ve.dm.ImageNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWInlineImageNode, ve.dm.ImageNode );

/* Static Properties */

ve.dm.MWInlineImageNode.static.name = 'MWinlineimage';

ve.dm.MWInlineImageNode.static.matchTagNames = null;

// TODO: Develop better method to test for generated content
ve.dm.MWInlineImageNode.static.generatedContent = true;

ve.dm.MWInlineImageNode.static.matchRdfaTypes = [ 'mw:Image' ];

ve.dm.MWInlineImageNode.static.toDataElement = function ( domElements ) {
	var children = Array.prototype.slice.call( domElements[0].children, 0 ),
		parentResult = ve.dm.ImageNode.static.toDataElement.apply(
			this, [ children ].concat( Array.prototype.slice.call( arguments, 1 ) )
		);
	return ve.extendObject( true, parentResult, {
		'type': 'MWinlineimage',
		'attributes': {
			'isLinked': domElements[0].nodeName.toLowerCase() === 'a'
		}
	} );
};

ve.dm.MWInlineImageNode.static.toDomElements = function ( dataElement, doc ) {
	var wrapper = doc.createElement( dataElement.attributes.isLinked ? 'a' : 'span' ),
		imageDomElement = ve.dm.ImageNode.static.toDomElements.apply( this, arguments )[0];
	wrapper.appendChild( imageDomElement );
	return [ wrapper ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWInlineImageNode );
