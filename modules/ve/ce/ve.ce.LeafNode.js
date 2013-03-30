/*!
 * VisualEditor ContentEditable LeafNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable leaf node.
 *
 * Leaf nodes can not have any children.
 *
 * @abstract
 * @extends ve.ce.Node
 * @mixins ve.LeafNode
 * @constructor
 * @param {ve.dm.LeafNode} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.LeafNode = function VeCeLeafNode( model, $element ) {
	// Mixin constructor
	ve.LeafNode.call( this );

	// Parent constructor
	ve.ce.Node.call( this, model, $element );

	// DOM Changes
	if ( model.isWrapped() ) {
		this.$.addClass( 've-ce-leafNode' );
	}
};

/* Inheritance */

ve.inheritClass( ve.ce.LeafNode, ve.ce.Node );

ve.mixinClass( ve.ce.LeafNode, ve.LeafNode );

/* Methods */

/**
 * Get annotated HTML fragments.
 *
 * @see ve.ce.ContentBranchNode
 *
 * An HTML fragment can be:
 * - an HTML string
 * - a jQuery object
 * - an array with an HTML string or jQuery object at index 0 and a ve.dm.AnnotationSet at index 1,
 *   i.e. ['htmlstring', ve.dm.AnnotationSet] or [$jQueryObj, ve.dm.AnnotationSet]
 *
 * The default implementation should be fine in most cases. A subclass only needs to override this
 * if the annotations aren't necessarily the same across the entire node (like in ve.ce.TextNode).
 *
 * @method
 * @returns {Array} Array of HTML fragments, i.e.
 *                   [ string | jQuery | [string|jQuery, ve.dm.AnnotationSet] ]
 */
ve.ce.LeafNode.prototype.getAnnotatedHtml = function () {
	return [ [ this.$, this.getModel().getAnnotations() ] ];
};
