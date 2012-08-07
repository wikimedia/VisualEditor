/**
 * VisualEditor content editable AlienInlineNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for an alien inline node.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.AlienInlineNode} Model to observe
 */
ve.ce.AlienInlineNode = function ( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'alienInline', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienInlineNode' );
	this.$.attr( 'contenteditable', false );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );

	// Intialization
	this.onUpdate();
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.AlienInlineNode.rules = {
	'canBeSplit': false
};

/* Methods */

ve.ce.AlienInlineNode.prototype.onUpdate = function () {
	this.$.html( this.model.getAttribute( 'html' ) );
};

/* Registration */

ve.ce.nodeFactory.register( 'alienInline', ve.ce.AlienInlineNode );

/* Inheritance */

ve.extendClass( ve.ce.AlienInlineNode, ve.ce.LeafNode );
