/**
 * DataModel node for a document.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.LeafNode}
 * @param {Integer} [length] Length of content data in document
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.ImageNode = function( length, attributes ) {
	// Inheritance
	ve.dm.LeafNode.call( this, 'image', 0, attributes );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.ImageNode.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'isWrapped': true,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

/* Registration */

ve.dm.factory.register( 'image', ve.dm.ImageNode );

/* Inheritance */

ve.extendClass( ve.dm.ImageNode, ve.dm.LeafNode );
