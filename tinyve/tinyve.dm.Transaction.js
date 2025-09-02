/**
 * TinyVE DM Transaction
 *
 * This is a toy version of ve.dm.Transaction which illustrates the main concepts
 */

/**
 * A mapping on tinyve.dm.Document#data that preserves tinyve.dm.Document tree well-formedness.
 *
 * A transaction consists of a list of operations of two type: retain and replace. To apply
 * the list, a conceptual cursor passes through the document's linear data from start to finish
 * in a single pass.
 *
 * A retain operation looks like:
 * {
 *     type: 'retain',
 *     length: 6
 * }
 * This means skip the cursor forward 6 steps without changing anything.
 *
 * A replace operation looks like:
 * {
 *     type: 'replace',
 *     remove: [ 'f', 'o', 'o' ],
 *     insert: [ 'b', 'a', 'r' ]
 * }
 * This means remove the characters 'foo' at the cursor and replace them with 'bar'.
 *
 * @class
 *
 * @constructor
 * @param {Array} operations Operations preserving tree well-formedness as a whole
 */
tinyve.dm.Transaction = function TinyVeDmTransaction( operations ) {
	/**
	 * @property {Array} operations The operations
	 */
	this.operations = OO.copy( operations );
};

OO.initClass( tinyve.dm.Transaction );

/**
 * Create a reversed version of this transaction, to undo the modifications
 *
 * @return {tinyve.dm.Transaction} Reversed version of this transaction
 */
tinyve.dm.Transaction.prototype.reversed = function () {
	const reversedOperations = this.operations.map( ( op ) => {
		// Retain operation: don't change
		if ( op.type === 'retain' ) {
			return op;
		}
		// Replace operation: swap insert and remove
		return {
			type: 'replace',
			remove: op.insert,
			insert: op.remove
		};
	} );
	return new tinyve.dm.Transaction( reversedOperations );
};
