/**
 * TinyVE DM Node - index tree node
 *
 * This is a toy version of ve.dm.Node and subclasses, which illustrates the main concepts
 */

/**
 * A node in the DM tree.
 *
 * This is a node index tree indexing the linear model. In other words, it ONLY contains the
 * tree relationship and the node lengths, NOT any text content — it is just a convenient index
 * of the tree structure inherent in the linear model.
 *
 * The `length` property refers to the inner length, i.e. from just after the open tag to just
 * before the close tag.
 *
 * In real VE, each node type has its own subclass of `ve.dm.Node`, and the subclasses are
 * instantiated through a node factory so extensions can at types.
 *
 * @class
 * @see {ve.dm.Node}
 * @see {ve.dm.NodeFactory}
 *
 * @constructor
 * @param {string} type The node type, e.g. 'document' or 'p'
 * @param {tinyve.dm.BranchNode|null} [parent] The parent node, if any
 */
tinyve.dm.Node = function TinyVeDmNode( type, parent = null ) {
	/**
	 * @property {string} type Node type, e.g. 'document' or 'ul' or 'p'. In real VE,
	 * different node types become different subclasses of ve.dm.Node.
	 */
	this.type = type;

	/**
	 * @property {tinyve.dm.Node|null} parent Parent node, if any
	 */
	this.parent = parent;

	/**
	 * @property {number} innerLength Length in the linear model, excluding the node's open/close tags
	 */
	this.innerLength = 0;
};

OO.initClass( tinyve.dm.Node );

/**
 * Check if the node has enclosing tags in the linear model
 *
 * @return {boolean} Whether the node has enclosing tags in the linear model
 */
tinyve.dm.Node.prototype.isWrapped = function () {
	// The document node doesn't have enclosing tags
	return this.type !== 'document';
};

/**
 * Check if the node is a ContentBranchNode, i.e. its contents are linearized content data
 *
 * @return {boolean} Whether the node is a ContentBranchNode
 */
tinyve.dm.Node.prototype.canContainContent = function () {
	return false;
};

/**
 * Adjust the length, to match a linear data change
 *
 * @param {number} adjustment Amount to adjust the length by
 */
tinyve.dm.Node.prototype.adjustLength = function ( adjustment ) {
	this.innerLength += adjustment;
	if ( this.parent ) {
		this.parent.adjustLength( adjustment );
	}
};

/**
 * Find the offset just after this node's open tag in the linear model.
 *
 * This can be done efficiently by recursing up parent offsets and adding
 * previous sibling lengths.
 *
 * @see {ve.Node#getOffset}
 * @return {number} Offset
 */
tinyve.dm.Node.prototype.getOffset = function () {
	if ( this.parent === null ) {
		return 0;
	}
	let offset = 1 + this.parent.getOffset();
	for ( let i = this.parent.children.indexOf( this ) - 1; i >= 0; i-- ) {
		const previousSibling = this.parent.children[ i ];
		offset += previousSibling.innerLength;
		if ( previousSibling.isWrapped() ) {
			// Count the open+close tags
			offset += 2;
		}
	}
	return offset;
};

/**
 * Get this node's inner range
 *
 * @return {tinyve.Range} This node's range in the linear model, excluding its opening/closing tags
 */
tinyve.dm.Node.prototype.getRange = function () {
	const offset = this.getOffset();
	return new tinyve.Range( offset, offset + this.innerLength );
};

/**
 * Get this node's outer range
 *
 * @return {tinyve.Range} This node's range in the linear model, including its opening/closing tags
 */
tinyve.dm.Node.prototype.getOuterRange = function () {
	let range = this.getRange();
	if ( this.isWrapped() ) {
		// Grow the range to include opening/closing tags
		range = new tinyve.Range( range.start - 1, range.end + 1 );
	}
	return range;
};

tinyve.dm.Node.prototype.getOuterLength = function () {
	return this.innerLength + ( this.isWrapped() ? 2 : 0 );
};
