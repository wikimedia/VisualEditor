/*!
 * VisualEditor DataModel NodeAnnotationRange class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * NodeAnnotationRange - an annotation with a range inside some `ve.dm.ContentBranchNode`
 *
 * The range is relative to the node offset. It is not live, i.e. not automatically updated when
 * the document changes (unlike a `ve.dm.SurfaceFragment`), but its validity will be preserved
 * under changes unless they modify the ContentBranchNode itself. This is useful for caching
 * in `ve.dm.Document#cachedData`.
 *
 * @class
 * @constructor
 * @param {ve.dm.ContentBranchNode} node The node with respect to which ranges are relative
 * @param {ve.dm.Annotation} annotation
 * @param {ve.Range} relativeRange The range, given relative to node.getOffset()
 */
ve.dm.NodeAnnotationRange = function VeDmNodeAnnotationRange( node, annotation, relativeRange ) {
	this.node = node;
	this.annotation = annotation;
	this.relativeRange = relativeRange;
};

/* Getters */

/**
 * @property {ve.Range} range Absolute range, accessor for backward compatibility
 */
Object.defineProperty( ve.dm.NodeAnnotationRange.prototype, 'range', { get: function () {
	return this.getAbsoluteRange();
}, enumerable: true, configurable: false } );

/* Methods */

/**
 * @return {ve.dm.Annotation} The annotation
 */
ve.dm.NodeAnnotationRange.prototype.getAnnotation = function () {
	return this.annotation;
};

/**
 * @return {ve.Range} The absolute range (i.e. the relative to the document node)
 */
ve.dm.NodeAnnotationRange.prototype.getAbsoluteRange = function () {
	return this.relativeRange.translate( this.node.getOffset() );
};
