/**
 * ContentEditable node for an alien inline node.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.AlienInlineNode} Model to observe
 */
ve.ce.AlienInlineNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'alienInline', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienInlineNode' );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );

	// Intialization
	var _this = this;

	/* We might need some of those at some point */
	/*
	this.$.on( {
		'mousedown': function() {
			_this.$.css( '-webkit-user-select', 'none' );
		},
		'mouseup': function() {
			_this.$.css( '-webkit-user-select', '' );
		},
	} );

	this.$.attr( 'contenteditable', false );
	*/

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

ve.ce.AlienInlineNode.prototype.onUpdate = function() {
	this.$.html( this.model.getAttribute( 'html' ) );
};

/* Registration */

ve.ce.factory.register( 'alienInline', ve.ce.AlienInlineNode );

/* Inheritance */

ve.extendClass( ve.ce.AlienInlineNode, ve.ce.LeafNode );
