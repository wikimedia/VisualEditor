/*!
 * VisualEditor DataModel CenterNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel center node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.CenterNode = function VeDmCenterNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'center', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.CenterNode, ve.dm.BranchNode );

/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.CenterNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': null,
	'parentNodeTypes': null
};

/**
 * Node converters.
 *
 * @see ve.dm.Converter
 * @static
 * @property
 */
ve.dm.CenterNode.converters = {
	'domElementTypes': ['center'],
	'toDomElement': function () {
		return document.createElement( 'center' );
	},
	'toDataElement': function () {
		return {
			'type': 'center'
		};
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'center', ve.dm.CenterNode );
