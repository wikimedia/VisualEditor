/*!
 * VisualEditor DataModel AlienInlineNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel inline alien node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienInlineNode = function VeDmAlienInlineNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'alienInline', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.AlienInlineNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.AlienInlineNode.static.name = 'alienInline';

ve.dm.AlienInlineNode.static.matchTagNames = [];

ve.dm.AlienInlineNode.static.isContent = true;

/* Registration */

ve.dm.modelRegistry.register( ve.dm.AlienInlineNode );
