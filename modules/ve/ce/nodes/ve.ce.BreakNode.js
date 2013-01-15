/*!
 * VisualEditor ContentEditable BreakNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
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
	ve.ce.LeafNode.call( this, 'break', model, $( '<br>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-BreakNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.BreakNode, ve.ce.LeafNode );

/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @property
 */
ve.ce.BreakNode.rules = {
	'canBeSplit': false
};

/* Registration */

ve.ce.nodeFactory.register( 'break', ve.ce.BreakNode );
