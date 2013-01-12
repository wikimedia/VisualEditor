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

// TODO hybrid-ify meta nodes

ve.dm.MetaInlineNode.static.name = 'metaInline';

ve.dm.MetaInlineNode.static.matchTagNames = ve.dm.MetaBlockNode.static.matchTagNames;

ve.dm.MetaInlineNode.static.toDataElement = ve.dm.MetaBlockNode.static.toDataElement;

ve.dm.MetaInlineNode.static.toDomElement = ve.dm.MetaBlockNode.static.toDomElement;

/* Registration */

ve.dm.nodeFactory.register( 'metaInline', ve.dm.MetaInlineNode );
