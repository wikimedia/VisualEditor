/*!
 * VisualEditor DataModel AlienBlockNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel alien block node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienBlockNode = function VeDmAlienBlockNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'alienBlock', 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.AlienBlockNode, ve.dm.LeafNode );

/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.AlienBlockNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

ve.dm.AlienBlockNode.static.name = 'alienBlock';

ve.dm.AlienBlockNode.static.matchTagNames = [];

/* Registration */

ve.dm.nodeFactory.register( 'alienBlock', ve.dm.AlienBlockNode );
