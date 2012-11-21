/**
 * VisualEditor content editable MWEntityNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for an entity.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.MWEntityNode} model Model to observe.
 */
ve.ce.MWEntityNode = function VeCeMWEntityNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, 'MWentity', model, $( '<span>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-MWEntityNode' );
	// Need cE=false to prevent selection issues
	this.$.attr( 'contenteditable', false );

	// Properties
	this.currentSource = null;

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWEntityNode, ve.ce.LeafNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.MWEntityNode.rules = {
	'canBeSplit': false
};

/* Methods */

/**
 * Responds to model update events.
 *
 * If the source changed since last update the image's src attribute will be updated accordingly.
 *
 * @method
 */
ve.ce.MWEntityNode.prototype.onUpdate = function () {
	this.$.text( this.model.getAttribute( 'character' ) );
};

/* Registration */

ve.ce.nodeFactory.register( 'MWentity', ve.ce.MWEntityNode );
