/*!
 * VisualEditor DataModel ImageNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel image node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.ImageNode = function VeDmImageNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'image', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.ImageNode, ve.dm.LeafNode );

/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.ImageNode.rules = {
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
 * @see ve.dm.Converter
 * @static
 * @property
 */
ve.dm.ImageNode.converters = {
	'domElementTypes': ['img'],
	'toDomElement': function () {
		return document.createElement( 'img' );
	},
	'toDataElement': function () {
		return {
			'type': 'image'
		};
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'image', ve.dm.ImageNode );
