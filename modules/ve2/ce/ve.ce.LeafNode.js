/**
 * ContentEditable node that can not have any children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.LeafNode}
 * @extends {ve.ce.Node}
 * @param {String} type Symbolic name of node type
 * @param model {ve.dm.LeafNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.LeafNode = function( type, model, $element ) {
	// Inheritance
	ve.LeafNode.call( this );
	ve.ce.Node.call( this, type, model, $element );

	// DOM Changes
	if ( model.isWrapped() ) {
		this.$.addClass( 've-ce-leafNode' );
	}
};

/* Inheritance */

ve.extendClass( ve.ce.LeafNode, ve.LeafNode );
ve.extendClass( ve.ce.LeafNode, ve.ce.Node );
