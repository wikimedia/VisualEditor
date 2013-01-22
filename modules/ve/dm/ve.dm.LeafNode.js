/*!
 * VisualEditor DataModel LeafNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel leaf node.
 *
 * Leaf nodes can not have any children.
 *
 * @abstract
 * @extends ve.dm.Node
 * @mixins ve.LeafNode
 * @constructor
 * @param {string} type Symbolic name of node type
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.LeafNode = function VeDmLeafNode( type, length, element ) {
	// Mixin constructor
	ve.LeafNode.call( this );

	// Parent constructor
	ve.dm.Node.call( this, type, length, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.LeafNode, ve.dm.Node );

ve.mixinClass( ve.dm.LeafNode, ve.LeafNode );

/* Static properties */

ve.dm.LeafNode.static.childNodeTypes = [];

/* Methods */

/**
 * Get the annotations that apply to the node.
 *
 * Annotations are grabbed directly from the linear model, so they are updated live. If the linear
 * model element doesn't have a .annotations property, an empty set is returned.
 *
 * @method
 * @returns {ve.AnnotationSet} Annotation set (by reference!)
 */
ve.dm.LeafNode.prototype.getAnnotations = function () {
	return this.element.annotations || new ve.AnnotationSet();
};
