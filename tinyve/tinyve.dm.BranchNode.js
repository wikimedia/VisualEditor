/**
 * TinyVE DM BranchNode - index tree branch Node
 *
 * This is a toy version of ve.dm.BranchNode, which illustrates the main concepts
 */

/**
 * A branch node in the DM tree. Branch node simply means a node that can contain child nodes.
 *
 * In real VE, each branch node type has its own subclass of `ve.dm.Node`, and the subclasses
 * are instantiated through a node factory so extensions can at types.
 *
 * @class
 * @see {ve.dm.BranchNode}
 * @see {ve.dm.NodeFactory}
 *
 * @constructor
 * @param {string} type The node type, e.g. 'document' or 'p'
 * @param {tinyve.dm.BranchNode|null} [parent] The parent node, if any
 */
tinyve.dm.BranchNode = function TinyVeDmBranchNode( type, parent = null ) {
	// Parent constructor
	tinyve.dm.BranchNode.super.call( this, type, parent );

	// Mixin constructor
	OO.EventEmitter.call( this );

	/**
	 * @property {tinyve.dm.Node[]} children Child nodes
	 */
	this.children = [];
};

OO.inheritClass( tinyve.dm.BranchNode, tinyve.dm.Node );
OO.mixinClass( tinyve.dm.BranchNode, OO.EventEmitter );

/**
 * Add/remove child nodes from this node
 *
 * Child nodes being added should already match the linear data
 *
 * @param {number} index Index in the child list to splice
 * @param {number} deleteCount Number of items to delete
 * @param {tinyve.dm.Node[]} nodes Nodes to add
 * @return {tinyve.dm.Node[]} Nodes removed
 */
tinyve.dm.BranchNode.prototype.splice = function ( index, deleteCount, ...nodes ) {
	let diff = 0;
	const removals = this.children.splice( index, deleteCount, ...nodes );
	removals.forEach( ( node ) => {
		diff -= node.getOuterLength();
	} );

	nodes.forEach( ( node ) => {
		diff += node.getOuterLength();
	} );

	this.adjustLength( diff );
	this.emit( 'splice', index, deleteCount, ...nodes );
	return removals;
};
