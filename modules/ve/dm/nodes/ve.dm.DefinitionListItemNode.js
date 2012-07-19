/**
 * DataModel node for a definition list item.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.DefinitionListItemNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'definitionListItem', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.DefinitionListItemNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': null,
	'parentNodeTypes': ['definitionList']
};

/**
 * Node converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.DefinitionListItemNode.converters = {
	'domElementTypes': ['dt', 'dd'],
	'toDomElement': function( type, element ) {
		return element.attributes && ( {
			'term': document.createElement( 'dt' ),
			'definition': document.createElement( 'dd' )
		} )[element.attributes.style];
	},
	'toDataElement': function( tag, element ) {
		return ( {
			'dt': { 'type': 'definitionListItem', 'attributes': { 'style': 'term' } },
			'dd': { 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } }
		} )[tag];
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'definitionListItem', ve.dm.DefinitionListItemNode );

/* Inheritance */

ve.extendClass( ve.dm.DefinitionListItemNode, ve.dm.BranchNode );
