/**
 * VisualEditor data model MWEntityNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node for a document.
 *
 * @class
 * @constructor
 * @extends {ve.dm.LeafNode}
 * @param {Number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWEntityNode = function VeDmMWEntityNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'MWentity', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWEntityNode, ve.dm.LeafNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.MWEntityNode.rules = {
	'isWrapped': true,
	'isContent': true,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

/**
 * Node converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.MWEntityNode.converters = {
	'domElementTypes': ['span'], // HACK uses special treatment in ve.dm.Converter instead
	'toDomElement': function ( type, dataElement ) {
		var domElement = document.createElement( 'span' ),
			textNode = document.createTextNode( dataElement.attributes.character );
		domElement.setAttribute( 'typeof', 'mw:Entity' );
		domElement.appendChild( textNode );
		return domElement;
	},
	'toDataElement': function ( tag, domElement ) {
		return {
			'type': 'MWentity',
			'attributes': {
				'character': domElement.textContent
			}
		};
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'MWentity', ve.dm.MWEntityNode );
