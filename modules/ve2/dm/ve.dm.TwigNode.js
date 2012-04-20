/**
 * Data model node that can have leaf children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.TwigNode}
 * @extends {ve.dm.BranchNode}
 * @param {String} type Symbolic name of node type 
 * @param {ve.dm.Node[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.TwigNode = function( type, children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, type, children, attributes );
	ve.TwigNode.call( this );
};

/* Methods */

/* Inheritance */

ve.extendClass( ve.dm.TwigNode, ve.TwigNode );
ve.extendClass( ve.dm.TwigNode, ve.dm.BranchNode );
