/*!
 * VisualEditor data model TableCellNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node for a table cell.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.TableCellNode = function VeDmTableCellNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'tableCell', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.TableCellNode, ve.dm.BranchNode );

/* Static Members */

ve.dm.TableCellNode.defaultAttributes = {
	'style': 'data'
};

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.TableCellNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': null,
	'parentNodeTypes': ['tableRow']
};

/**
 * Node converters.
 *
 * @see ve.dm.Converter
 * @static
 * @property
 */
ve.dm.TableCellNode.converters = {
	'domElementTypes': ['td', 'th'],
	'toDomElement': function ( type, element ) {
		return element.attributes && ( {
			'data': document.createElement( 'td' ),
			'header': document.createElement( 'th' )
		} )[element.attributes.style];
	},
	'toDataElement': function ( tag ) {
		return ( {
			'td': { 'type': 'tableCell', 'attributes': { 'style': 'data' } },
			'th': { 'type': 'tableCell', 'attributes': { 'style': 'header' } }
		} )[tag];
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'tableCell', ve.dm.TableCellNode );
