/*!
 * VisualEditor DataModel MetaInlineNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel inline meta node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MetaInlineNode = function VeDmMetaInlineNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'metaInline', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MetaInlineNode, ve.dm.LeafNode );


/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.MetaInlineNode.rules = {
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
ve.dm.MetaInlineNode.converters = ve.dm.MetaBlockNode.converters;

/* Registration */

ve.dm.nodeFactory.register( 'metaInline', ve.dm.MetaInlineNode );
