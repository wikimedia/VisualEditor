/**
 * Data model node that can not have children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.LeafNode}
 * @extends {ve.dm.Node}
 * @param {String} type Symbolic name of node type 
 * @param {Integer} [length] Length of content data in document
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.LeafNode = function( type, length, attributes ) {
	// Inheritance
	ve.LeafNode.call( this );
	ve.dm.Node.call( this, type, length, attributes );
};

/* Methods */

/* Inheritance */

ve.extendClass( ve.dm.LeafNode, ve.LeafNode );
ve.extendClass( ve.dm.LeafNode, ve.dm.Node );
