/**
 * ContentEditable node for an alien block node.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.AlienBlockNode} Model to observe
 */
ve.ce.AlienBlockNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'alienBlock', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienBlockNode' );
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
ve.ce.AlienBlockNode.rules = {
	'canBeSplit': false
};

/* Methods */

ve.ce.AlienBlockNode.prototype.onUpdate = function() {
	this.$.html( this.model.getAttribute( 'html' ) );
};

/* Registration */

ve.ce.factory.register( 'alienBlock', ve.ce.AlienBlockNode );

/* Inheritance */

ve.extendClass( ve.ce.AlienBlockNode, ve.ce.LeafNode );
