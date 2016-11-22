/*!
 * VisualEditor DataModel VisualDiff
 *  class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global diff_match_patch, treeDiffer */

/**
 * VisualDiff
 *
 * Gets the diff between two VisualEditor DataModel DocumentNodes
 *
 * @class
 * @constructor
 * @param {ve.dm.Document} oldDoc
 * @param {ve.dm.Document} newDoc
 */
ve.dm.VisualDiff = function VeDmVisualDiff( oldDoc, newDoc ) {

	this.oldDoc = oldDoc.cloneFromRange();
	this.newDoc = newDoc.cloneFromRange();
	this.oldDocNode = oldDoc.getDocumentNode();
	this.newDocNode = newDoc.getDocumentNode();
	this.oldDocChildren = this.oldDocNode.children;
	this.newDocChildren = this.newDocNode.children;
	this.treeDiffer = treeDiffer;
	// eslint-disable-next-line camelcase,new-cap
	this.linearDiffer = new diff_match_patch( this.oldDoc.getStore(), this.newDoc.getStore(), true );

	this.diff = this.getDiff();
};

/**
 * Get the diff between the two documents, in two steps: (1) Compare the children
 * of the old and new document nodes and record any pair where the old child and
 * new child are identical. (If an old child is identical to two new children, it
 * will be paired with the first one only.) (2) If any children of the old or new
 * document nodes remain unpaired, decide whether they are an old child that has
 * been removed, a new child that has been inserted, or a pair in which the old
 * child was changed into the new child.
 *
 * @return {Object} Diff object containing all the information needed to display
 * the diff.
 */
ve.dm.VisualDiff.prototype.getDiff = function () {
	var i, ilen, j, jlen,
		oldDocChildrenToDiff = [],
		newDocChildrenToDiff = [];

	this.diff = {
		docChildrenOldToNew: {},
		docChildrenNewToOld: {},
		docChildrenRemove: [],
		docChildrenInsert: []
	};

	// STEP 1: Find identical document-node children

	for ( i = 0, ilen = this.oldDocChildren.length; i < ilen; i++ ) {
		for ( j = 0, jlen = this.newDocChildren.length; j < jlen; j++ ) {
			if ( !this.diff.docChildrenNewToOld.hasOwnProperty( j ) &&
				this.compareDocChildren( this.oldDocChildren[ i ], this.newDocChildren[ j ] ) ) {

				this.diff.docChildrenOldToNew[ i ] = j;
				this.diff.docChildrenNewToOld[ j ] = i;
				break;

			}
			// If no new nodes equalled the old node, add it to nodes to diff
			if ( j === jlen - 1 ) {
				oldDocChildrenToDiff.push( i );
			}
		}
	}

	for ( j = 0; j < jlen; j++ ) {
		if ( !this.diff.docChildrenNewToOld.hasOwnProperty( j ) ) {
			newDocChildrenToDiff.push( j );
		}
	}

	// STEP 2: Find removed, inserted and modified document-node children

	if ( oldDocChildrenToDiff.length !== 0 || newDocChildrenToDiff.length !== 0 ) {

		if ( oldDocChildrenToDiff.length === 0 ) {

			// Everything new is an insert
			this.diff.docChildrenInsert = newDocChildrenToDiff;

		} else if ( newDocChildrenToDiff.length === 0 ) {

			// Everything old is a remove
			this.diff.docChildrenRemove = oldDocChildrenToDiff;

		} else {

			// Find out which remaining docChildren are removed, inserted or modified
			this.findModifiedDocChildren( oldDocChildrenToDiff, newDocChildrenToDiff );

		}
	}

	return this.diff;
};

/**
 * Compare the linear data for two nodes
 *
 * @param {ve.dm.Node} oldDocChild Child of the old document node
 * @param {ve.dm.Node} newDocChild Child of the new document node
 * @return {boolean} The linear data is the same
 */
ve.dm.VisualDiff.prototype.compareDocChildren = function ( oldDocChild, newDocChild ) {
	var i, ilen, oldData, newData, oldStore, newStore;

	if ( oldDocChild.length !== newDocChild.length || oldDocChild.type !== newDocChild.type ) {
		return false;
	}

	oldData = this.oldDoc.getData( oldDocChild.getOuterRange() );
	newData = this.newDoc.getData( newDocChild.getOuterRange() );

	if ( oldData.length !== newData.length ) {
		return false;
	}
	if ( JSON.stringify( oldData ) === JSON.stringify( newData ) ) {
		return true;
	}

	// If strings are not equal, the data may still be the same as far as
	// we are concerned so should compare them properly.
	oldStore = this.oldDoc.getStore();
	newStore = this.newDoc.getStore();

	for ( i = 0, ilen = oldData.length; i < ilen; i++ ) {
		if ( oldData[ i ] !== newData[ i ] &&
			!ve.dm.ElementLinearData.static.compareElements( oldData[ i ], newData[ i ], oldStore, newStore ) ) {
			return false;
		}
	}

	return true;
};

/**
 * Diff each child of the old document node against each child of the new
 * document; but if the differs decide that an old child is similar enough to a
 * new child, record these as a change from the old child to the new child and
 * don't diff any more children against either child.
 *
 * This might not find the optimal diff in some cases (e.g. if the old child is
 * similar to two of the new children), but diffing every old child against
 * every new child could have a heavy performance cost.
 *
 * @param {Array} oldDocChildren The children of the old document with no
 * identical partners in the new document
 * @param {Array} newDocChildren The children of the new document with no
 * identical partners in the old document
 */
ve.dm.VisualDiff.prototype.findModifiedDocChildren = function ( oldDocChildren, newDocChildren ) {
	var diff, i, j,
		ilen = oldDocChildren.length,
		jlen = newDocChildren.length;

	for ( i = 0; i < ilen; i++ ) {
		for ( j = 0; j < jlen; j++ ) {

			if ( oldDocChildren[ i ] !== null && newDocChildren[ j ] !== null ) {

				// Try to diff the nodes. If they are too different, diff will be false
				diff = this.getDocChildDiff(
					this.oldDocChildren[ oldDocChildren[ i ] ],
					this.newDocChildren[ newDocChildren[ j ] ]
				);

				if ( diff ) {
					this.diff.docChildrenOldToNew[ oldDocChildren[ i ] ] = {
						node: newDocChildren[ j ],
						diff: diff,
						// TODO: Neaten this
						correspondingNodes: this.treeDiffer.Differ.prototype.getCorrespondingNodes( diff.treeDiff, diff.oldTree.orderedNodes.length, diff.newTree.orderedNodes.length )
					};
					this.diff.docChildrenNewToOld[ newDocChildren[ j ] ] = {
						node: oldDocChildren[ i ]
					};

					oldDocChildren[ i ] = null;
					newDocChildren[ j ] = null;
					break;
				}

			}

		}
	}

	// Any nodes remaining in the 'toDiff' arrays are removes and inserts
	for ( i = 0; i < ilen; i++ ) {
		if ( oldDocChildren[ i ] !== null ) {
			this.diff.docChildrenRemove.push( oldDocChildren[ i ] );
		}
	}
	for ( j = 0; j < jlen; j++ ) {
		if ( newDocChildren[ j ] !== null ) {
			this.diff.docChildrenInsert.push( newDocChildren[ j ] );
		}
	}

};

/**
 * Get the diff between a child of the old coument node and a child of the new
 * document node. There are three steps: (1) Do a tree diff to find the minimal
 * transactions between the old child and the new child. Allowed transactions
 * are: remove a node, insert a node, or change an old node to a new node. (The
 * cost of each transaction is the same, and the change always costs the same,
 * no matter how similar the nodes are.) The tree differ is not currently aware
 * of legal relationships between nodes, and ve.dm.ContentBranchNodes are
 * treated as leaves. (2) Do a linear diff on the linear data of any changed
 * pair that are both ve.dm.ContentBranchNodes. (3) Find the ratio of the
 * linear data that has changed to the linear data that is retained. If this is
 * above a threshold, the children are too different and the old child has not
 * been changed to make the new child, and the diff should be discarded.
 * Otherwise the diff should be cleaned and returned.
 *
 * TODO: It would be possible to discover moves by comparing removed and
 * inserted nodes from the tree differ.
 *
 * @param {ve.dm.Node} oldDocChild Child of the old document node
 * @param {ve.dm.Node} newDocChild Child of the new document node
 * @return {Array|boolean} The diff, or false if the children are too different
 */
ve.dm.VisualDiff.prototype.getDocChildDiff = function ( oldDocChild, newDocChild ) {
	var i, ilen, j, jlen,
		treeDiff, linearDiff,
		oldNode, newNode,
		oldDocChildTree,
		newDocChildTree,
		removeLength,
		insertLength,
		diffLength = 0,
		keepLength = 0,
		diffInfo = {};

	/**
	 * Get the index of the first or last wordbreak in a data array
	 *
	 * @param {Array} data Linear data
	 * @param {boolean} reversed Get the index of the last wordbreak
	 * @return {number} Index of the first or last wordbreak, or -1 if no
	 * wordbreak was found
	 */
	function findWordbreaks( data, reversed ) {
		var offset,
			dataString = new ve.dm.DataString( data );

		offset = unicodeJS.wordbreak.moveBreakOffset(
			reversed ? -1 : 1,
			dataString,
			reversed ? data.length : 0
		);

		if ( offset === 0 || offset === data.length ) {
			return -1;
		} else {
			// If searching forwards take the caracter to the left
			return offset - ( !reversed ? 1 : 0 );
		}
	}

	/**
	 * The perfect diff is not always human-friendly, so clean it up.
	 * Make sure retained content spans whole words (no wordbreaks),
	 * and "de-stripe" any sequences of alternating removes and inserts
	 * (with no retains) to look like one continuous removal and one continuous
	 * insert.
	 *
	 * TODO: Clean up cases like:
	 * - insert "word1"
	 * - retain " "
	 * - remove "word2"
	 * - retain " "
	 * - insert "word3"
	 * - retain " "
	 * - remove "word4"
	 *
	 * Additionally clean up mistakes made by the linear differ, such as removing
	 * and inserting identical content (insetead of retaining it) and removing,
	 * inserting or retaining an empty content array.
	 *
	 * @param {Array} diff Linear diff, as arrays of inserted, removed and retained
	 * content
	 * @return {Array} A human-friendlier linear diff
	 */
	function getCleanDiff( diff ) {
		var i, ilen, action, data, firstWordbreak, lastWordbreak, start, end,
			previousData = null,
			previousAction = null,
			cleanDiff = [],
			remove = [],
			insert = [];

		// Where the same data is removed and inserted, replace it with a retain
		for ( i = 0; i < diff.length; i++ ) {
			action = diff[ i ][ 0 ];
			data = diff[ i ][ 1 ];
			// Should improve on JSON.stringify
			if ( action + previousAction === 0 && JSON.stringify( data ) === JSON.stringify( previousData ) ) {
				diff.splice( i - 1, 2, [ 0, data ] );
				i++;
			}
			previousAction = action;
			previousData = data;
		}
		previousData = null;
		previousAction = null;

		// Join any consecutive actions that are the same
		for ( i = 0; i < diff.length; i++ ) {
			action = diff[ i ][ 0 ];
			if ( action === previousAction ) {
				diff[ i - 1 ][ 1 ] = diff[ i - 1 ][ 1 ].concat( diff[ i ][ 1 ] );
				diff.splice( i, 1 );
				i--;
			} else if ( diff[ i ][ 1 ].length === 0 ) {
				diff.splice( i, 1 );
				i--;
				continue;
			}
			previousAction = action;
		}

		// Convert any retains that do not end and start with spaces into remove-
		// inserts
		for ( i = 0; i < diff.length; i++ ) {
			action = diff[ i ][ 0 ];
			data = diff[ i ][ 1 ];
			if ( action === 0 ) {

				start = [];
				end = [];
				firstWordbreak = findWordbreaks( data, false );
				lastWordbreak = firstWordbreak === -1 ? -1 : findWordbreaks( data, true );

				if ( firstWordbreak === -1 ) {
					// If there was no wordbreak, retain should be replaced with
					// remove-insert
					diff.splice( i, 1, [ -1, data ], [ 1, data ] );
					i++;
				} else {
					if ( i !== diff.length - 1 ) {
						// Unless we are at the end of the diff, replace the portion
						// after the last wordbreak.
						end = data.splice( lastWordbreak );
					}
					if ( i !== 0 ) {
						// Unless we are at the start of the diff, replace the portion
						// before the first wordbreak.
						start = data.splice( 0, firstWordbreak + 1 );
					}

					// At this point the only portion we want to retain is what's left of
					// data (if anything; if firstWordbreak === lastWordbreak !== -1, then
					// data has been spliced away completely).
					if ( start.length > 0 ) {
						diff.splice( i, 0, [ -1, start ], [ 1, start ] );
						i += 2;
					}
					if ( end.length > 0 ) {
						diff.splice( i + 1, 0, [ -1, end ], [ 1, end ] );
						i += 2;
					}

				}

			}
		}

		// In a sequence of -remove-insert-remove-insert- make the removes into a
		// single action and the inserts into a single action
		for ( i = 0, ilen = diff.length; i < ilen; i++ ) {
			action = diff[ i ][ 0 ];
			data = diff[ i ][ 1 ];
			if ( action === -1 ) {
				remove = remove.concat( data );
			} else if ( action === 1 ) {
				insert = insert.concat( data );
			} else if ( action === 0 && data.length > 0 ) {
				if ( remove.length > 0 ) {
					cleanDiff.push( [ -1, remove ] );
				}
				remove = [];
				if ( insert.length > 0 ) {
					cleanDiff.push( [ 1, insert ] );
				}
				insert = [];
				cleanDiff.push( diff[ i ] );
			}
		}

		if ( remove.length > 0 ) {
			cleanDiff.push( [ -1, remove ] );
		}
		if ( insert.length > 0 ) {
			cleanDiff.push( [ 1, insert ] );
		}

		return cleanDiff;
	}

	oldDocChildTree = new this.treeDiffer.Tree( oldDocChild, ve.DiffTreeNode );
	newDocChildTree = new this.treeDiffer.Tree( newDocChild, ve.DiffTreeNode );

	treeDiff = new this.treeDiffer.Differ( oldDocChildTree, newDocChildTree )
		.transactions[ oldDocChildTree.orderedNodes.length - 1 ][ newDocChildTree.orderedNodes.length - 1 ];

	// Length of old content is length of old node minus the open and close
	// tags for each child node
	keepLength = oldDocChild.length - 2 * ( oldDocChildTree.orderedNodes.length - 1 );

	for ( i = 0, ilen = treeDiff.length; i < ilen; i++ ) {

		removeLength = 0;
		insertLength = 0;

		if ( treeDiff[ i ][ 0 ] !== null && treeDiff[ i ][ 1 ] !== null ) {

			// There is a change
			oldNode = oldDocChildTree.orderedNodes[ treeDiff[ i ][ 0 ] ].node;
			newNode = newDocChildTree.orderedNodes[ treeDiff[ i ][ 1 ] ].node;

			if ( !( oldNode instanceof ve.dm.ContentBranchNode ) &&
				!( newNode instanceof ve.dm.ContentBranchNode ) ) {

				// There is no content change
				continue;

			} else if ( !( newNode instanceof ve.dm.ContentBranchNode ) ) {

				// Content was removed
				removeLength = oldNode.length;

			} else if ( !( oldNode instanceof ve.dm.ContentBranchNode ) ) {

				// Content was inserted
				insertLength = newNode.length;

			// If we got this far, they are both CBNs
			} else {

				linearDiff = this.linearDiffer.diff_main(
					this.oldDoc.getData( oldNode.getRange() ),
					this.newDoc.getData( newNode.getRange() )
				);

				linearDiff = getCleanDiff( linearDiff );

				diffInfo[ i ] = { linearDiff: linearDiff };

				// Record how much content was removed and inserted
				for ( j = 0, jlen = linearDiff.length; j < jlen; j++ ) {
					if ( linearDiff[ j ][ 0 ] === 1 ) {
						insertLength += linearDiff[ j ][ 1 ].length;
					} else if ( linearDiff[ j ][ 0 ] === -1 ) {
						removeLength += linearDiff[ j ][ 1 ].length;
					}
				}

			}

		} else if ( treeDiff[ i ][ 0 ] !== null ) {

			// Node was removed
			oldNode = oldDocChildTree.orderedNodes[ treeDiff[ i ][ 0 ] ];
			if ( oldNode.node instanceof ve.dm.ContentBranchNode ) {
				removeLength = oldNode.node.length;
			}

		} else {

			// Node was inserted
			newNode = newDocChildTree.orderedNodes[ treeDiff[ i ][ 1 ] ];
			if ( newNode.node instanceof ve.dm.ContentBranchNode ) {
				insertLength = newNode.node.length;
			}

		}

		keepLength -= removeLength;
		diffLength += removeLength + insertLength;

	}

	// Only return the diff if enough content has changed
	if ( keepLength < 0.5 * diffLength ) {
		return false;
	}
	return {
		treeDiff: treeDiff,
		diffInfo: diffInfo,
		oldTree: oldDocChildTree,
		newTree: newDocChildTree
	};

};
