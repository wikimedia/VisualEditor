/**
 * ContentEditable node for a document.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.AlienNode} Model to observe
 */
ve.ce.AlienNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'alien', model );

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
		'display': 'inline',
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
ve.ce.AlienNode.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'canBeSplit': false
};

/* Methods */

ve.ce.AlienNode.prototype.onUpdate = function() {
	this.$.html( this.model.getAttribute( 'html' ) );
};

/* Registration */

ve.ce.factory.register( 'alien', ve.ce.AlienNode );

/* Inheritance */

ve.extendClass( ve.ce.AlienNode, ve.ce.LeafNode );
