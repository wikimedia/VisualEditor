/**
 * Data model node that can have leaf children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.TwigNode}
 * @extends {ve.dm.BranchNode}
 * @param {String} type Symbolic name of node type 
 * @param {Array} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.TwigNode = function( type, children, attributes ) {
	// Inheritance
	ve.TwigNode.call( this );
	ve.dm.BranchNode.call( this, type, children, attributes );
};

/* Methods */

/* Inheritance */

ve.extendClass( ve.dm.TwigNode, ve.dm.BranchNode );
ve.extendClass( ve.dm.TwigNode, ve.TwigNode );
