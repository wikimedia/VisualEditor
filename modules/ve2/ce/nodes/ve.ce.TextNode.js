/**
 * ContentEditable node for text.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.TextNode} Model to observe
 */
ve.ce.TextNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.TextNode.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'canBeSplit': true
};

/* Methods */

/**
 * Gets the outer length, which for a text node is the same as the inner length.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.ce.TextNode.prototype.getOuterLength = function() {
	return this.length;
};

/* Registration */

ve.ce.factory.register( 'text', ve.ce.TextNode );

/* Inheritance */

ve.extendClass( ve.ce.TextNode, ve.ce.LeafNode );
