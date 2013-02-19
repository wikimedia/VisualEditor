/*!
 * VisualEditor ContentEditable AlienInlineNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable alien inline node.
 *
 * @class
 * @extends ve.ce.AlienNode
 * @constructor
 * @param {ve.dm.AlienInlineNode} model Model to observe.
 */
ve.ce.AlienInlineNode = function VeCeAlienInlineNode( model ) {
	// Parent constructor
	ve.ce.AlienNode.call( this, 'alienInline', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienInlineNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienInlineNode, ve.ce.AlienNode );

/* Registration */

ve.ce.nodeFactory.register( 'alienInline', ve.ce.AlienInlineNode );
