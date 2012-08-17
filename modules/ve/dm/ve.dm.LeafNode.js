/**
 * VisualEditor data model LeafNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node that can not have children.
 *
 * @class
 * @abstract
 * @constructor
 * @extends {ve.LeafNode}
 * @extends {ve.dm.Node}
 * @param {String} type Symbolic name of node type
 * @param {Integer} [length] Length of content data in document
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 * @param {Object} [internal] Reference to internal data object
 */
ve.dm.LeafNode = function ( type, length, attributes, internal ) {
	// Inheritance
	ve.dm.Node.call( this, type, length, attributes, internal );
	ve.LeafNode.call( this );
};

/* Methods */

/* Inheritance */

ve.extendClass( ve.dm.LeafNode, ve.LeafNode, ve.dm.Node );
