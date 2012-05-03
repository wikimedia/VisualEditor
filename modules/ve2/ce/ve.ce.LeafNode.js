/**
 * ContentEditable node that can not have any children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.LeafNode}
 * @extends {ve.ce.Node}
 * @param model {ve.dm.LeafNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.LeafNode = function( model, $element ) {
	// Inheritance
	ve.LeafNode.call( this );
	ve.ce.Node.call( this, model, $element );
};

/* Abstract Methods */

/**
 * Renders this node into this.$.
 * 
 * @abstract
 * @method
 * @throws 've.ce.LeafNode.render not implemented in this subclass'
 */
ve.ce.LeafNode.prototype.render = function() {
	throw 've.ce.LeafNode.render not implemented in this subclass: ' + this.constructor;
};

/* Inheritance */

ve.extendClass( ve.ce.LeafNode, ve.LeafNode );
ve.extendClass( ve.ce.LeafNode, ve.ce.Node );
