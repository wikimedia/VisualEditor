/**
 * Data model node for a document.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.LeafNode}
 * @param {Integer} [length] Length of content data in document
 */
ve.dm.TextNode = function( length ) {
	// Inheritance
	ve.dm.LeafNode.call( this, 'text', length );
};

/* Static Members */

/**
 * @see ve.dm.NodeFactory
 */
ve.dm.TextNode.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

/* Methods */

/**
 * Gets the outer length, which for a text node is the same as the inner length.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.dm.TextNode.prototype.getOuterLength = function() {
	return this.length;
};

/* Registration */

ve.dm.factory.register( 'text', ve.dm.TextNode );

/* Inheritance */

ve.extendClass( ve.dm.TextNode, ve.dm.LeafNode );
