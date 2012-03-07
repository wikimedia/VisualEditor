/**
 * Creates an ve.ce.LeafNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.LeafNode}
 * @extends {ve.ce.Node}
 * @param model {ve.ModelNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.LeafNode = function( model, $element ) {
	// Inheritance
	ve.LeafNode.call( this );
	ve.ce.Node.call( this, model, $element );

	this.$.data('view', this);
	this.$.addClass('ce-leafNode');

	// Properties
	this.contentView = new ve.ce.Content( model, this.$, this );

	// Events
	this.contentView.on( 'update', this.emitUpdate );
};

/* Methods */

/**
 * Render content.
 * 
 * @method
 */
ve.ce.LeafNode.prototype.renderContent = function() {
	this.contentView.render();
};

ve.ce.LeafNode.prototype.getDOMText = function() {
	return ve.ce.getDOMText( this.$[0] );
};

/* Inheritance */

ve.extendClass( ve.ce.LeafNode, ve.LeafNode );
ve.extendClass( ve.ce.LeafNode, ve.ce.Node );
