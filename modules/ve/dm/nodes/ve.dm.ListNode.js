/*!
 * VisualEditor DataModel ListNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel list node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.ListNode = function VeDmListNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'list', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.ListNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.ListNode.defaultAttributes = {
	'style': 'bullet'
};

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.ListNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': ['listItem'],
	'parentNodeTypes': null
};

ve.dm.ListNode.static.name = 'list';

ve.dm.ListNode.static.matchTagNames = [ 'ul', 'ol' ];

ve.dm.ListNode.static.toDataElement = function ( domElement ) {
	var style = domElement.nodeName.toLowerCase() === 'ol' ? 'number' : 'bullet';
	return { 'type': 'list', 'attributes': { 'style': style } };
};

ve.dm.ListNode.static.toDomElement = function ( dataElement ) {
	var tag = dataElement.attributes && dataElement.attributes.style === 'number' ? 'ol' : 'ul';
	return document.createElement( tag );
};


/* Registration */

ve.dm.nodeFactory.register( 'list', ve.dm.ListNode );
