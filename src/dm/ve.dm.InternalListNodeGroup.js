/**
 * Named, documented class for the individual items in the `nodes` property of the
 * {@link ve.dm.InternalList} class.
 *
 * Practically, this represents a list of {@link ve.dm.MWReferenceNode} nodes that belong to the
 * same group.
 *
 * @class
 *
 * @constructor
 */
ve.dm.InternalListNodeGroup = function VeDmInternalListNodeGroup() {
	/**
	 * @property {Object.<string,ve.dm.Node[]>} keyedNodes Indexed by the internal listKey.
	 *
	 * Practically, one of these arrays can contain multiple elements when a reference (with the
	 * same group and same name) is reused. The arrays can never be empty.
	 */
	this.keyedNodes = {};

	/**
	 * @property {ve.dm.Node[]} firstNodes When {@link keyedNodes} contains more than one node per
	 * listKey then firstNodes can be used to identify the node that appears first in the document.
	 * If there is only one node it's just that node. Array keys correspond to the values in the
	 * {@link indexOrder} array. Order is meaningless but dictated by indexOrder instead.
	 *
	 * Practically, this is the first occurence of a reused reference (with the same group and name)
	 * in a document. That document position dictates the reference's footnote number and the order
	 * in which references are rendered in their reference list.
	 */
	this.firstNodes = [];

	/**
	 * @property {number[]} indexOrder Sorted to reflect the order of first appearance in the
	 * document. Values are indexes for the {@link firstNodes} array.
	 *
	 * Practically, this usually starts as a simple [ 0, 1, 2, … ] array but changes when references
	 * are added, reused, moved, and removed.
	 */
	this.indexOrder = [];

	/**
	 * @internal private to {@link ve.dm.InternalList.getUniqueListKey}, do not use!
	 * @property {Object.<string,string>} uniqueListKeys Internal cache for previously generated
	 * listKeys to make sure the same {@link ve.dm.InternalList.getUniqueListKey} call always
	 * returns the same value
	 */
	this.uniqueListKeys = {};

	/**
	 * @internal private to {@link ve.dm.InternalList.getUniqueListKey}, do not use!
	 * @property {Object.<string,boolean>} uniqueListKeysInUse Internal cache to mark listKeys as
	 * used. The values are meaningless.
	 */
	this.uniqueListKeysInUse = {};
};
