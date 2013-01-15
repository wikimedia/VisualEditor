/*!
 * VisualEditor DataModel ListItemNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel list item node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.ListItemNode = function VeDmListItemNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'listItem', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.ListItemNode, ve.dm.BranchNode );

/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.ListItemNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': null,
	'parentNodeTypes': ['list']
};

/**
 * Node converters.
 *
 * @see ve.dm.Converter
 * @static
 * @property
 */
ve.dm.ListItemNode.converters = {
	'domElementTypes': ['li'],
	'toDomElement': function () {
		return document.createElement( 'li' );
	},
	'toDataElement': function () {
		return {
			'type': 'listItem'
		};
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'listItem', ve.dm.ListItemNode );
