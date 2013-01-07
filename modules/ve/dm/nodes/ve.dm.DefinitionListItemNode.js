/*!
 * VisualEditor data model DefinitionListItemNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node for a definition list item.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.DefinitionListItemNode = function VeDmDefinitionListItemNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'definitionListItem', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.DefinitionListItemNode, ve.dm.BranchNode );

/* Static Members */

ve.dm.DefinitionListItemNode.defaultAttributes = {
	'style': 'term'
};

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.DefinitionListItemNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': null,
	'parentNodeTypes': ['definitionList']
};

/**
 * Node converters.
 *
 * @see ve.dm.Converter
 * @static
 * @property
 */
ve.dm.DefinitionListItemNode.converters = {
	'domElementTypes': ['dt', 'dd'],
	'toDomElement': function ( type, element ) {
		return element.attributes && ( {
			'term': document.createElement( 'dt' ),
			'definition': document.createElement( 'dd' )
		} )[element.attributes.style];
	},
	'toDataElement': function ( tag ) {
		return ( {
			'dt': { 'type': 'definitionListItem', 'attributes': { 'style': 'term' } },
			'dd': { 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } }
		} )[tag];
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'definitionListItem', ve.dm.DefinitionListItemNode );
