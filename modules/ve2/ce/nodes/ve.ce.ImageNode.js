/**
 * ContentEditable node for an image.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.ImageNode} Model to observe
 */
ve.ce.ImageNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.ImageNode.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'image', ve.ce.ImageNode );

/* Inheritance */

ve.extendClass( ve.ce.ImageNode, ve.ce.LeafNode );
