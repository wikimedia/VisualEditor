/**
 * VisualEditor data model DefinitionListNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node for a definition list.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 * @param {Object} [internal] Reference to internal data object
 */
ve.dm.DefinitionListNode = function ve_dm_DefinitionListNode( children, attributes, internal ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'definitionList', children, attributes, internal );
};

/* Inheritance */

ve.inheritClass( ve.dm.DefinitionListNode, ve.dm.BranchNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.DefinitionListNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': ['definitionListItem'],
	'parentNodeTypes': null
};

/**
 * Node converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.DefinitionListNode.converters = {
	'domElementTypes': ['dl'],
	'toDomElement': function ( type, element ) {
		return document.createElement( 'dl' );
	},
	'toDataElement': function ( tag, element ) {
		return { 'type': 'definitionList' };
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'definitionList', ve.dm.DefinitionListNode );
