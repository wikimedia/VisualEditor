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

	// TODO: move to .css file
	this.$.css( {
		'display': 'block',
		'border': 'rgba(0,0,0,0.3) dashed 1px',
		'background-color': 'rgba(255,255,186,0.3)'
	} );
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
