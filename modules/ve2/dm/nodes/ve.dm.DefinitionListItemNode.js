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
	'tags': 'dl',
	'toHtml': function( type, element ) {
		return ve.dm.createHtmlElement( 'dl' );
	},
	'toData': function( tag, element ) {
		return { 'type': 'definitionList' };
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'definitionListItem', ve.dm.DefinitionListItemNode );

/* Inheritance */

ve.extendClass( ve.dm.DefinitionListItemNode, ve.dm.BranchNode );
