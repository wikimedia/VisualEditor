/*!
 * VisualEditor ContentEditable AlienBlockNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
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

/* Registration */

ve.ce.nodeFactory.register( 'alienBlock', ve.ce.AlienBlockNode );
