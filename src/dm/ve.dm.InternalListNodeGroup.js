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
	 * @private
	 * @property {Object.<string,string>} uniqueListKeys Internal cache for previously generated
	 * listKeys to make sure the same {@link getUniqueListKey} call always returns the same value
	 */
	this.uniqueListKeys = {};

	/**
	 * @private
	 * @property {Object.<string,boolean>} uniqueListKeysInUse Internal cache to mark listKeys as
	 * used. The values are meaningless.
	 */
	this.uniqueListKeysInUse = {};
};

/**
 * Get a unique list key for this group.
 *
 * The returned list key is added to the list of unique list keys used in this group so that it
 * won't be allocated again. It will also be associated to oldListKey so that if the same oldListKey
 * is passed in again later, the previously allocated name will be returned.
 *
 * @param {string} oldListKey Current list key to associate the generated list key with
 * @param {string} prefix Prefix to distinguish generated keys from non-generated ones
 * @return {string} Generated unique list key, or existing unique key associated with oldListKey
 */
ve.dm.InternalListNodeGroup.prototype.getUniqueListKey = function ( oldListKey, prefix ) {
	if ( oldListKey in this.uniqueListKeys ) {
		return this.uniqueListKeys[ oldListKey ];
	}

	let num = 0;
	while ( this.keyedNodes[ prefix + num ] || this.uniqueListKeysInUse[ prefix + num ] ) {
		num++;
	}

	this.uniqueListKeys[ oldListKey ] = prefix + num;
	// FIXME: We can as well store the last number instead of this list, reducing the footprint
	this.uniqueListKeysInUse[ prefix + num ] = true;
	return prefix + num;
};
