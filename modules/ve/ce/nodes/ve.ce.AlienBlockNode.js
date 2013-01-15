/*!
 * VisualEditor ContentEditable AlienBlockNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable alien block node.
 *
 * @class
 * @extends ve.ce.AlienNode
 * @constructor
 * @param {ve.dm.AlienBlockNode} model Model to observe.
 */
ve.ce.AlienBlockNode = function VeCeAlienBlockNode( model ) {
	// Parent constructor
	ve.ce.AlienNode.call( this, 'alienBlock', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienBlockNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienBlockNode, ve.ce.AlienNode );

/* Static Properties */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @property
 */
ve.ce.AlienBlockNode.rules = {
	'canBeSplit': false
};

/* Methods */

/* Registration */

ve.ce.nodeFactory.register( 'alienBlock', ve.ce.AlienBlockNode );
