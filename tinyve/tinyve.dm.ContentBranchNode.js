/**
 * TinyVE DM ContentBranchNode - Node that contains linearized content, e.g. paragraph
 *
 * This is a toy version of ve.dm.ContentBranchNode, which illustrates the main concepts
 */

/**
 * A ContentBranchNode in the DM tree.
 *
 * In real VE, each branch node type has its own subclass of `ve.dm.ContentBranchNode`, and the
 * subclasses are instantiated through a node factory so extensions can at types.
 *
 * In real VE, the linearized contents are stored inside `.children` in nodes of type
 * `ve.dm.TextNode`, `ve.dm.InlineImageNode` etc. By contrast, `tinyve.dm.ContentBranchNode`
 * does not have children (so it's slightly odd that it's a subclass of BranchNode at all).
 *
 * @class
 * @see {ve.dm.ContentBranchNode}
 * @see {ve.dm.NodeFactory}
 *
 * @constructor
 * @param {string} type The node type, e.g. 'p' or 'h1'
 * @param {tinyve.dm.BranchNode|null} [parent] The parent node, if any
 */
tinyve.dm.ContentBranchNode = function TinyVeDmContentBranchNode( type, parent = null ) {
	tinyve.dm.ContentBranchNode.super.call( this, type, parent );
};

OO.inheritClass( tinyve.dm.ContentBranchNode, tinyve.dm.BranchNode );

tinyve.dm.ContentBranchNode.prototype.canContainContent = function () {
	return true;
};
