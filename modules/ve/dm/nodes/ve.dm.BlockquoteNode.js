/*!
 * VisualEditor DataModel BlockquoteNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel blockquote node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.LeafNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.BlockquoteNode = function VeDmBlockquoteNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.BlockquoteNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.BlockquoteNode.static.name = 'blockquote';

ve.dm.BlockquoteNode.static.matchTagNames = [ 'blockquote' ];

ve.dm.BlockquoteNode.static.toDataElement = function () {
	return { 'type': 'blockquote' };
};

ve.dm.BlockquoteNode.static.toDomElements = function ( dataElement, doc ) {
	return [ doc.createElement( 'blockquote' ) ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.BlockquoteNode );
