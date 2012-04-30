/**
 * ContentEditable node that can not have any children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.LeafNode}
 * @extends {ve.ce.Node}
 * @param model {ve.dm.LeafNode} Model to observe
 */
ve.ce.LeafNode = function( model ) {
	// Inheritance
	ve.LeafNode.call( this );
	ve.ce.Node.call( this, model );
};

/* Methods */

/**
 * Render content.
 * 
 * @method
 */
ve.ce.LeafNode.prototype.render = function() {
	//
};

/* Inheritance */

ve.extendClass( ve.ce.LeafNode, ve.LeafNode );
ve.extendClass( ve.ce.LeafNode, ve.ce.Node );
