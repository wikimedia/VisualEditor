/*!
 * treeDiffer.TreeNode
 *
 * Released under the MIT license
 */

/**
 * TreeNode
 *
 * Abstract TreeNode class for Trees to be diffed. It should be extended,
 * then a Tree should be built by passing the root node and the name of
 * the new class into the Tree constructor.
 *
 * @class
 * @constructor
 * @param {Object} node Object representing a node to be wrapped
 */
treeDiffer.TreeNode = function ( node ) {
	this.node = node;
	this.children = [];
	this.index = null;
	this.leftmost = null;
};

/**
 * Add a node to the list of this node's children
 *
 * @param {treeDiffer.TreeNode} child
 */
treeDiffer.TreeNode.prototype.addChild = function ( child ) {
	this.children.push( child );
	child.parent = this;
};

/**
 * Check if another TreeNode is equal to this node. Conditions for equality
 * will depend on the use case.
 */
treeDiffer.TreeNode.prototype.isEqual = null;

/**
 * Get the children of the original node wrapped by this tree node. How to
 * find and filter children will depend on the use case.
 */
treeDiffer.TreeNode.prototype.getOriginalNodeChildren = null;
