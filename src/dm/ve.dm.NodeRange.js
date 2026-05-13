/*!
 * VisualEditor DataModel NodeRange class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * NodeRange - a range inside some `ve.dm.ContentBranchNode`
 *
 * The range is relative to the node offset. It is not live, i.e. not automatically updated when
 * the document changes (unlike a `ve.dm.SurfaceFragment`), but its validity will be preserved
 * under changes unless they modify the ContentBranchNode itself. This is useful for caching
 * in `ve.dm.Document#cachedData`.
 *
 * @class
 * @constructor
 * @param {ve.dm.ContentBranchNode} node The node with respect to which ranges are relative
 * @param {ve.Range} relativeRange The range, given relative to node.getOffset()
 */
ve.dm.NodeRange = function VeDmNodeRange( node, relativeRange ) {
	this.node = node;
	this.relativeRange = relativeRange;
};

OO.initClass( ve.dm.NodeRange );

/* Methods */

/**
 * @return {ve.Range} The absolute range (i.e. the range relative to the document node)
 */
ve.dm.NodeRange.prototype.getAbsoluteRange = function () {
	return this.relativeRange.translate( this.node.getOffset() );
};
