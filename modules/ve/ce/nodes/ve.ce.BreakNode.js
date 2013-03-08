/*!
 * VisualEditor ContentEditable BreakNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable break node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.BreakNode} model Model to observe
 */
ve.ce.BreakNode = function VeCeBreakNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, $( '<br>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-BreakNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.BreakNode, ve.ce.LeafNode );

/* Static Properties */

ve.ce.BreakNode.static.name = 'break';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.BreakNode );
