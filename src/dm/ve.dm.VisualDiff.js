/*!
 * VisualEditor DataModel VisualDiff class.
 *
 * @copyright See AUTHORS.txt
 */

/* global treeDiffer */

/**
 * VisualDiff
 *
 * Gets the diff between two VisualEditor DataModel DocumentNodes
 *
 * @class
 * @constructor
 * @param {ve.dm.Document|ve.dm.BranchNode} oldDocOrNode
 * @param {ve.dm.Document|ve.dm.BranchNode} newDocOrNode
 * @param {number} [timeout=1000] Timeout after which to stop performing linear diffs (in ms)
 */
ve.dm.VisualDiff = function VeDmVisualDiff( oldDocOrNode, newDocOrNode, timeout ) {
	const oldDoc = oldDocOrNode instanceof ve.dm.Document ? oldDocOrNode : oldDocOrNode.getDocument(),
		newDoc = newDocOrNode instanceof ve.dm.Document ? newDocOrNode : newDocOrNode.getDocument();

	this.oldDoc = oldDoc.cloneFromRange(
		oldDocOrNode instanceof ve.dm.DocumentNode || oldDocOrNode instanceof ve.dm.Document ?
			undefined :
			oldDocOrNode.getRange(),
		true,
		'noMetadata'
	);
	this.newDoc = newDoc.cloneFromRange(
		newDocOrNode instanceof ve.dm.DocumentNode || newDocOrNode instanceof ve.dm.Document ?
			undefined :
			newDocOrNode.getRange(),
		true,
		'noMetadata'
	);

	// Merge the old internal list into the new document, so that it knows
	// about removed references
	const tx = ve.dm.TransactionBuilder.static.newFromDocumentInsertion( this.newDoc, 0, this.oldDoc, new ve.Range( 0 ) );
	this.newDoc.commit( tx );

	// Set to read-only so that node offsets get cached
	this.oldDoc.setReadOnly( true );
	this.newDoc.setReadOnly( true );

	this.treeDiffer = treeDiffer;
	this.linearDiffer = new ve.DiffMatchPatch( this.oldDoc.getStore(), this.newDoc.getStore() );

	// Minimum ratio of content (same : different) allowed between two corresponding nodes
	this.diffThreshold = 0.5;

	this.endTime = Date.now() + ( timeout || 1000 );
	this.timedOut = false;

	// Calling getDocumentNode triggers the DM node tree to be built
	// so this must happen before things like freezeInternalListIndices
	const oldDocNode = this.oldDoc.getDocumentNode();
	const newDocNode = this.newDoc.getDocumentNode();

	this.freezeInternalListIndices( this.oldDoc );
	this.freezeInternalListIndices( this.newDoc );

	const oldInternalList = this.oldDoc.getInternalList();
	const newInternalList = this.newDoc.getInternalList();

	this.diff = {
		docDiff: this.diffDocs( oldDocNode, newDocNode, true ),
		internalListDiff: this.getInternalListDiff( oldInternalList, newInternalList ),
		metaListDiff: this.getMetaListDiff( oldDoc.getMetaList(), newDoc.getMetaList() )
	};

	// Make docs writable again, so they can be modified by DiffElement
	this.oldDoc.setReadOnly( false );
	this.newDoc.setReadOnly( false );
};

/* Inheritance */

OO.initClass( ve.dm.VisualDiff );

/**
 * Get the original linear data from a node
 *
 * @param {ve.dm.Node} node Node
 * @param {boolean} innerRange Get the node's inner range
 * @return {Array} Linear data
 */
ve.dm.VisualDiff.static.getDataFromNode = function ( node, innerRange ) {
	const doc = node.getRoot().getDocument();
	return doc.getData( innerRange ? node.getRange() : node.getOuterRange() );
};

/**
 * Compare the linear data for two nodes
 *
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Node from the new document
 * @return {boolean} The linear data is the same
 */
ve.dm.VisualDiff.static.compareNodes = function ( oldNode, newNode ) {
	if ( oldNode.length !== newNode.length || !oldNode.isDiffComparable( newNode ) ) {
		return false;
	}

	const oldData = this.getDataFromNode( oldNode );
	const newData = this.getDataFromNode( newNode );

	if ( JSON.stringify( oldData ) === JSON.stringify( newData ) ) {
		return true;
	}

	// If strings are not equal, the data may still be the same as far as
	// we are concerned so should compare them properly.
	const oldStore = oldNode.getRoot().getDocument().getStore();
	const newStore = newNode.getRoot().getDocument().getStore();

	for ( let i = 0, ilen = oldData.length; i < ilen; i++ ) {
		if ( oldData[ i ] !== newData[ i ] &&
			!ve.dm.ElementLinearData.static.compareElements( oldData[ i ], newData[ i ], oldStore, newStore ) ) {
			return false;
		}
	}

	return true;
};

/**
 * Attach the internal list indexOrder to each node referenced by the internal
 * list, ahead of document merge.
 *
 * @param {ve.dm.Document} doc
 */
ve.dm.VisualDiff.prototype.freezeInternalListIndices = function ( doc ) {
	const nodes = doc.getInternalList().nodes,
		internalListGroups = doc.getInternalList().getNodeGroups();

	for ( const groupName in internalListGroups ) {
		const group = internalListGroups[ groupName ];
		const groupIndexOrder = group.indexOrder;
		for ( let i = 0, ilen = groupIndexOrder.length; i < ilen; i++ ) {
			const nodeIndex = groupIndexOrder[ i ];
			const refNodes = nodes[ groupName ].keyedNodes[ nodes[ groupName ].firstNodes[ nodeIndex ].registeredListKey ];
			for ( let j = 0, jlen = refNodes.length; j < jlen; j++ ) {
				doc.data.modifyData( refNodes[ j ].getOffset(), ( item ) => {
					ve.setProp( item, 'internal', 'overrideIndex', i + 1 );
				} );
			}
		}
	}
};

/**
 * @typedef {ve.dm.VisualDiff.ListDiff} DocDiff
 * @memberof ve.dm.VisualDiff
 * @property {ve.dm.Node} oldRoot
 * @property {ve.dm.Node} newRoot
 * @property {ve.dm.VisualDiff.AttributeDiff} attributeChange
 */

/**
 * Diff two nodes as documents, comaparing their children as lists.
 *
 * @param {ve.dm.Node} oldRoot Old root
 * @param {ve.dm.Node} newRoot New root
 * @param {boolean} skipInternalLists Skip internal list nodes
 * @return {ve.dm.VisualDiff.DocDiff} Object containing diff information
 */
ve.dm.VisualDiff.prototype.diffDocs = function ( oldRoot, newRoot, skipInternalLists ) {
	let oldChildren = oldRoot.children;
	let newChildren = newRoot.children;

	if ( skipInternalLists ) {
		oldChildren = oldChildren.filter( ( node ) => !( node instanceof ve.dm.InternalListNode ) );
		newChildren = newChildren.filter( ( node ) => !( node instanceof ve.dm.InternalListNode ) );
	}

	const diff = this.diffList( oldChildren, newChildren );

	diff.oldRoot = oldRoot;
	diff.newRoot = newRoot;

	if (
		oldRoot && newRoot &&
		// Actual document nodes don't have attributes as they
		// don'texist in the linear data
		!( oldRoot instanceof ve.dm.DocumentNode )
	) {
		diff.attributeChange = this.diffAttributes( oldRoot, newRoot );
	}

	return diff;
};

/**
 * @typedef {Object} ListDiff
 * @memberof ve.dm.VisualDiff
 * @property {ve.dm.Node[]} oldNodes
 * @property {ve.dm.Node[]} newNodes
 * @property {Object} oldToNew
 * @property {Object} newToOld
 * @property {number[]} remove
 * @property {number[]} insert
 */

/**
 * Get the diff between two lists of nodes.
 *
 * @param {ve.dm.Node[]} oldNodes Nodes from the old document
 * @param {ve.dm.Node[]} newNodes Nodes from the new document
 * @return {ve.dm.VisualDiff.ListDiff} Object containing diff information
 */
ve.dm.VisualDiff.prototype.diffList = function ( oldNodes, newNodes ) {
	const oldNodesToDiff = [],
		newNodesToDiff = [],
		diff = {
			oldNodes: oldNodes,
			newNodes: newNodes,
			oldToNew: {},
			newToOld: {},
			remove: [],
			insert: []
		};

	// STEP 1: Find identical nodes

	for ( let i = 0, ilen = oldNodes.length; i < ilen; i++ ) {
		for ( let j = 0, jlen = newNodes.length; j < jlen; j++ ) {
			if ( !Object.prototype.hasOwnProperty.call( diff.newToOld, j ) &&
				this.constructor.static.compareNodes( oldNodes[ i ], newNodes[ j ] )
			) {
				diff.oldToNew[ i ] = j;
				diff.newToOld[ j ] = i;
				break;
			}
			// If no new nodes equalled the old node, add it to nodes to diff
			if ( j === jlen - 1 ) {
				oldNodesToDiff.push( i );
			}
		}
	}

	for ( let j = 0, jlen = newNodes.length; j < jlen; j++ ) {
		if ( !Object.prototype.hasOwnProperty.call( diff.newToOld, j ) ) {
			newNodesToDiff.push( j );
		}
	}

	// STEP 2: Find removed, inserted and modified nodes

	if ( oldNodesToDiff.length !== 0 || newNodesToDiff.length !== 0 ) {
		if ( oldNodesToDiff.length === 0 ) {
			// Everything new is an insert
			diff.insert = newNodesToDiff;
		} else if ( newNodesToDiff.length === 0 ) {
			// Everything old is a remove
			diff.remove = oldNodesToDiff;
		} else {
			// Find out which remaining docChildren are removed, inserted or modified
			this.findModifiedNodes(
				oldNodesToDiff, newNodesToDiff, oldNodes, newNodes, diff
			);
		}
	}

	// STEP 3: Compute moves (up, down, no move)
	if ( Object.keys( diff.newToOld ).length > 0 ) {
		diff.moves = this.calculateDiffMoves( diff.oldToNew, diff.newToOld );
	} else {
		diff.moves = [];
	}

	return diff;
};

/**
 * Calculate how items in a new list have moved, compared to items in the old list.
 * More specifically, calculate the minimal moves, keeping the maximum possible number
 * of nodes unmoved. Do this by finding the longest increasing subsequence in the
 * sequence of oldDoc node indices, sorted by their corresponding newDoc nodes'
 * indices. Those indices in the longest increasing subsequence represent the unmoved
 * nodes.
 *
 * @param {Object.<number,number|Object>} oldToNew Map of oldDoc nodes to corresponding newDoc nodes.
 *   Keys are indices of nodes in the list. Values are either indices of nodes in the list for
 *   unchanged nodes, or objects where the `node` property is the index for changed nodes.
 * @param {Object.<number,number|Object>} newToOld Map of newDoc nodes to corresponding oldDoc nodes.
 *   Same format at oldToNew.
 * @return {Array.<number|string>} Record of whether and how each newDoc node has moved (0, 'up', 'down')
 */
ve.dm.VisualDiff.prototype.calculateDiffMoves = function ( oldToNew, newToOld ) {
	const oldPermuted = [],
		unmoved = 0,
		up = 'up',
		down = 'down';

	const getIndex = ( obj ) => typeof obj === 'number' ? obj : obj.node;

	// See https://en.wikipedia.org/wiki/Longest_increasing_subsequence
	function longestIncreasingSubsequence( sequence ) {
		const mvs = [],
			// finalIndices[i] holds:
			// - if i is 0, 0
			// - if there's an increasing subsequence of length i, the final item in that subsequence
			// - if i > length of longest increasing subsequence, undefined
			finalIndices = [],
			// previousIndices[i] holds:
			// - if i is in the longest increasing subsequence, the item before i in that subsequence
			// - otherwise, 0
			previousIndices = [];

		let currentLength = 0;
		finalIndices[ 0 ] = 0;

		// Perform algorithm (i.e. populate finalIndices and previousIndices)
		for ( let j = 0, jlen = sequence.length; j < jlen; j++ ) {
			let low = 1;
			let high = currentLength;
			while ( low <= high ) {
				const middle = Math.ceil( ( low + high ) / 2 );
				if ( sequence[ finalIndices[ middle ] ] < sequence[ j ] ) {
					low = middle + 1;
				} else {
					high = middle - 1;
				}
			}
			const newLength = low;
			previousIndices[ j ] = finalIndices[ newLength - 1 ];
			finalIndices[ newLength ] = j;
			if ( newLength > currentLength ) {
				currentLength = newLength;
			}
		}

		// Items in the longest increasing subsequence are oldDoc indices of unmoved nodes.
		// Mark corresponding newDoc indices of these unmoved nodes, in mvs array.
		let k = finalIndices[ currentLength ];
		for ( let j = currentLength, jlen = 0; j > jlen; j-- ) {
			const newIndex = getIndex( oldToNew[ sequence[ k ] ] );
			mvs[ newIndex ] = unmoved;
			k = previousIndices[ k ];
		}

		return mvs;
	}

	// Get oldDoc indices, sorted according to their order in the new doc
	const sortedKeys = Object.keys( newToOld ).sort( ( a, b ) => Number( a ) - Number( b ) );
	for ( let i = 0, ilen = sortedKeys.length; i < ilen; i++ ) {
		const oldIndex = getIndex( newToOld[ sortedKeys[ i ] ] );
		oldPermuted.push( oldIndex );
	}

	// Record which newDoc nodes have NOT moved. NB nodes inserted at the end of the
	// newDoc will be treated as not moved by default.
	const moves = longestIncreasingSubsequence( oldPermuted );

	// Record whether the remaining newDoc nodes have moved up or down
	// (or not at all, e.g. if they are an insert)
	let latestUnmoved;
	for ( let i = 0; i < Number( sortedKeys[ sortedKeys.length - 1 ] ) + 1; i++ ) {
		if ( !( i in newToOld ) ) {
			// This node must be an insert, so wasn't moved
			moves[ i ] = unmoved;
		} else if ( moves[ i ] === unmoved ) {
			// This is the latest unmoved node so far
			latestUnmoved = i;
		} else {
			// The node has moved
			if ( latestUnmoved === undefined ) {
				// This node comes before any unmoved nodes so must have moved up
				moves[ i ] = up;
			} else {
				// If this node's oldDoc index is higher than the latest unmoved
				// node's oldDoc index, then it must have moved up; otherwise it
				// must have moved down
				const nodeIndex = getIndex( newToOld[ i ] );
				const latestUnmovedIndex = getIndex( newToOld[ latestUnmoved ] );
				moves[ i ] = nodeIndex > latestUnmovedIndex ? up : down;
			}
		}
	}

	return moves;
};

/**
 * Diff each old node against each new node in the list. If the differs decide
 * that an old node is similar enough to a new node, record these as a change
 * from the old to the new node and don't diff either of these nodes any more.
 *
 * This might not find the optimal diff in some cases (e.g. if the old node is
 * similar to two of the new nodes), but diffing every old node against every
 * new node could have a heavy performance cost.
 *
 * @param {number[]} oldIndices Indices of the old nodes
 * @param {number[]} newIndices Indices of the new nodes
 * @param {ve.dm.Node[]} oldNodes Nodes from the old document
 * @param {ve.dm.Node[]} newNodes Nodes from the new document
 * @param {Object} diff Object that will contain information about the diff
 */
ve.dm.VisualDiff.prototype.findModifiedNodes = function ( oldIndices, newIndices, oldNodes, newNodes, diff ) {
	const ilen = oldIndices.length,
		jlen = newIndices.length;

	let i, j;
	for ( i = 0; i < ilen; i++ ) {
		for ( j = 0; j < jlen; j++ ) {
			if ( oldIndices[ i ] !== null && newIndices[ j ] !== null ) {
				const diffResults = this.diffNodes( oldNodes[ oldIndices[ i ] ], newNodes[ newIndices[ j ] ] );

				if ( diffResults && (
					'linearDiff' in diffResults || diffResults.attributeChange || diffResults.treeDiff ||
					// List diff
					this.hasChanges( diffResults )
				) ) {
					diff.oldToNew[ oldIndices[ i ] ] = {
						node: newIndices[ j ],
						diff: diffResults
					};
					diff.newToOld[ newIndices[ j ] ] = {
						node: oldIndices[ i ]
					};

					oldIndices[ i ] = null;
					newIndices[ j ] = null;
					break;
				}
			}
		}
	}

	// Any nodes remaining in the 'toDiff' arrays are removes and inserts
	for ( i = 0; i < ilen; i++ ) {
		if ( oldIndices[ i ] !== null ) {
			diff.remove.push( oldIndices[ i ] );
		}
	}
	for ( j = 0; j < jlen; j++ ) {
		if ( newIndices[ j ] !== null ) {
			diff.insert.push( newIndices[ j ] );
		}
	}
};

/**
 * Get the diff between a node from the old document and a node from the new
 * document.
 *
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Node from the new document
 * @param {boolean} [noTreeDiff] Don't perform a tree diff of the nodes (used internally to avoid recursion)
 * @return {ve.dm.VisualDiff.LeafDiff|ve.dm.VisualDiff.ListDiff|ve.dm.VisualDiff.DocDiff|ve.dm.VisualDiff.TreeDiff|boolean} The diff, or false if the nodes are too different
 */
ve.dm.VisualDiff.prototype.diffNodes = function ( oldNode, newNode, noTreeDiff ) {
	// If not diff comparable, return no diff
	if ( !( oldNode.isDiffComparable( newNode ) ) ) {
		return false;
	}

	let diff = false;
	// Diff according to whether node behaves like a leaf, list, or tree (default)
	if ( oldNode.isDiffedAsLeaf() ) {
		diff = this.diffLeafNodes( oldNode, newNode );
	} else if ( oldNode.isDiffedAsList() ) {
		diff = this.diffListNodes( oldNode, newNode );
	} else if ( oldNode.isDiffedAsDocument() ) {
		diff = this.diffDocs( oldNode, newNode );
	} else if ( !noTreeDiff ) {
		diff = this.diffTreeNodes( oldNode, newNode );
	}

	return diff;
};

/**
 * @typedef {Object} LeafDiff
 * @memberof ve.dm.VisualDiff
 * @property {ve.dm.VisualDiff.AttributeDiff|boolean} attributeChange
 * @property {Array|boolean} linearDiff
 */

/**
 * Diff two leaf nodes
 *
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Node from the new document
 * @return {ve.dm.VisualDiff.LeafDiff|boolean} Leaf diff, or false if the nodes are too different
 * or if the diff timed out
 */
ve.dm.VisualDiff.prototype.diffLeafNodes = function ( oldNode, newNode ) {
	let linearDiff = null;

	if ( oldNode.canContainContent() ) {
		const changeRecord = {
			keepLength: oldNode.length,
			diffLength: 0
		};
		linearDiff = this.diffContent( oldNode, newNode );
		if ( !( linearDiff ) ) {
			return false;
		}
		this.updateChangeRecordLinearDiff( linearDiff, changeRecord );
		if ( this.underDiffThreshold( changeRecord ) ) {
			return false;
		}
	}

	const diff = {
		attributeChange: this.diffAttributes( oldNode, newNode ),
		linearDiff: linearDiff
	};

	return diff;
};

/**
 * Diff two list nodes
 *
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Node from the new document
 * @return {ve.dm.VisualDiff.ListDiff|boolean} Leaf diff, or false if the nodes are too different
 * or if the diff timed out
 */
ve.dm.VisualDiff.prototype.diffListNodes = function ( oldNode, newNode ) {
	const oldFlatList = {
			nodes: [],
			metadata: [],
			indices: []
		},
		newFlatList = {
			nodes: [],
			metadata: [],
			indices: []
		};

	this.flattenList( oldNode, oldFlatList, 0 );
	this.flattenList( newNode, newFlatList, 0 );

	let i, ilen;
	for ( i = 0, ilen = oldFlatList.nodes.length; i < ilen; i++ ) {
		oldFlatList.indices.push( { indexOrder: i } );
	}
	for ( i = 0, ilen = newFlatList.nodes.length; i < ilen; i++ ) {
		newFlatList.indices.push( { indexOrder: i } );
	}

	const listDiff = this.diffList( oldFlatList.nodes, newFlatList.nodes );
	listDiff.oldList = oldFlatList;
	listDiff.newList = newFlatList;

	// Do metadata diff of all aligned nodes
	for ( i in listDiff.oldToNew ) {
		const newItem = listDiff.oldToNew[ i ];
		const isNewItemIndex = typeof newItem === 'number';
		const j = isNewItemIndex ? newItem : newItem.node;

		const oldMetadata = oldFlatList.metadata[ i ];
		const newMetadata = newFlatList.metadata[ j ];

		const listNodeAttributeChange = this.diffAttributes( oldMetadata.listNode, newMetadata.listNode, 'listType' );
		const listItemAttributeChange = this.diffAttributes( oldMetadata.listItem, newMetadata.listItem );
		const depthChange = oldMetadata.depth === newMetadata.depth ? false :
			{
				oldAttributes: { listItemDepth: oldMetadata.depth },
				newAttributes: { listItemDepth: newMetadata.depth }
			};

		if ( listNodeAttributeChange || listItemAttributeChange || depthChange ) {
			// Some attributes have changed for this item
			// This item may already have attribute changes (e.g. heading attribute change inlist)
			const attributeChange = ( !isNewItemIndex && newItem.diff.attributeChange ) || {};
			if ( listNodeAttributeChange ) {
				attributeChange.listNodeAttributeChange = listNodeAttributeChange;
			}
			if ( listItemAttributeChange ) {
				attributeChange.listItemAttributeChange = listItemAttributeChange;
			}
			if ( depthChange ) {
				attributeChange.depthChange = depthChange;
			}

			if ( isNewItemIndex ) {
				listDiff.oldToNew[ i ] = {
					node: j,
					diff: {
						attributeChange: attributeChange
					}
				};
			} else {
				listDiff.oldToNew[ i ].diff.attributeChange = attributeChange;
			}
			listDiff.newToOld[ j ] = { node: i };
		}
	}

	if ( !this.hasChanges( listDiff ) ) {
		return false;
	}

	return listDiff;
};

/**
 * Flatten a (potentially nested) list, ready for diffing. Lists are common, and
 * tree diffs of lists are expensive, so lists are flattened then diffed as
 * linear structures.
 *
 * Appends information for each list item to a flat list object. Will be called
 * once for each list node within a nested list.
 *
 * Only nested lists at the end of list items are flattened.
 *
 * If a list item contains a non-list node that contains a list, that list will
 * not get flattened out. A list node followed by a non-list node will not be
 * flattened out either. If a list item contains more than one identical list
 * node, they will be flattened out to the same depth, and the information that
 * they were separate lists will be lost.
 *
 * If a list item contains more than one un-flattened node, each one of them
 * will be treated as a separate list item when flattened, but the original
 * items will be put back together later. (T345891)
 *
 * @param {ve.dm.Node} listNode A list node, possibly nested inside another list
 * @param {Object} flatList Flat structure describing the entire list
 * @param {number} depth Depth of this list node with respect to the outermost
 */
ve.dm.VisualDiff.prototype.flattenList = function ( listNode, flatList, depth ) {
	const listItems = listNode.children;

	for ( let i = 0, ilen = listItems.length; i < ilen; i++ ) {
		const listItem = listItems[ i ];

		// If listItem has no children, make the item itself the contents (e.g. an AlienBlockNode in a list)
		if ( !listItem.children ) {
			flatList.metadata.push( {
				listNode: listNode,
				listItem: listItem,
				depth: depth
			} );
			flatList.nodes.push( listItem );
			continue;
		}

		const listContents = listItem.children;

		// Find the first sub-list
		let firstListIndex = listContents.length;
		while ( firstListIndex >= 1 && listContents[ firstListIndex - 1 ].isDiffedAsList() ) {
			firstListIndex--;
		}

		for ( let j = 0, jlen = listContents.length; j < jlen; j++ ) {
			const listContent = listContents[ j ];
			if ( j >= firstListIndex ) {
				this.flattenList( listContent, flatList, depth + 1 );
			} else {
				flatList.metadata.push( {
					listNode: listNode,
					listItem: listItem,
					depth: depth,
					isContinued: j > 0
				} );
				flatList.nodes.push( listContent );
			}
		}
	}
};

/**
 * Align two tree structures
 *
 * @param {treeDiffer.Tree} oldTree Tree rooted at the old node
 * @param {treeDiffer.Tree} newTree Tree rooted at the new node
 * @return {Array|boolean} Corresponding tree node indices, or false if timed out
 */
ve.dm.VisualDiff.prototype.alignTrees = function ( oldTree, newTree ) {
	const transactions = new this.treeDiffer.Differ( oldTree, newTree ).transactions;

	if ( transactions === null ) {
		// Tree diff timed out
		this.timedOut = true;
		return false;
	}

	return transactions[ oldTree.orderedNodes.length - 1 ][ newTree.orderedNodes.length - 1 ];
};

/**
 * @typedef {Object} TreeDiff
 * @memberof ve.dm.VisualDiff
 * @property {ve.DiffTreeNode[]} oldTreeOrderedNodes - Nodes of the old tree, deepest first then in document order
 * @property {ve.DiffTreeNode[]} newTreeOrderedNodes - Nodes of the new tree, deepest first then in document order
 * @property {Array[]} treeDiff - Node correspondences as indexes in *TreeOrderedNodes
 * @property {number[]} treeDiff.i - The i'th correspondence [ oldTreeOrderedNodes index, newTreeOrderedNodes index ]
 * @property {Object|null} diffInfo - Linear diffs applying to each corresponding node pair
 * @property {Object} diffInfo.i - Linear diff applying to i'th node in newTreeOrderedNodes
 * @property {Array|boolean} diffInfo.i.linearDiff - Output of #diffContent
 * @property {ve.dm.VisualDiff.AttributeDiff|boolean} diffInfo.i.attributeChange Attribute diff
 */

/**
 * Do a tree diff. There are three steps: (1) Do a tree diff to find the minimal
 * transactions between the old tree and the new tree. Allowed transactions
 * are: remove a node, insert a node, or change an old node to a new node. (The
 * cost of each transaction is the same, and the change always costs the same,
 * no matter how similar the nodes are.) The tree differ is not currently aware
 * of legal relationships between nodes, and ve.dm.ContentBranchNodes are
 * treated as leaves. (2) Do a linear diff on the linear data of any changed
 * pair that are both ve.dm.ContentBranchNodes. (3) Find the ratio of the
 * linear data that has changed to the linear data that is retained. If this is
 * above a threshold, the nodes are too different and the old node has not
 * been changed to make the new node, and the diff should be discarded.
 * Otherwise the diff should be cleaned and returned.
 *
 * TODO: It would be possible to discover within-node moves by comparing
 * removed and inserted nodes from the tree differ.
 *
 * @param {ve.dm.Node} oldTreeNode Node from the old document
 * @param {ve.dm.Node} newTreeNode Node from the new document
 * @return {ve.dm.VisualDiff.TreeDiff|boolean} Diff object, or false if the nodes are too different or if the diff timed out.
 */
ve.dm.VisualDiff.prototype.diffTreeNodes = function ( oldTreeNode, newTreeNode ) {
	const changeRecord = {
			removeLength: 0,
			insertLength: 0,
			diffLength: 0,
			keepLength: 0
		},
		diffInfo = [];

	const oldTree = new this.treeDiffer.Tree( oldTreeNode, ve.DiffTreeNode );
	const newTree = new this.treeDiffer.Tree( newTreeNode, ve.DiffTreeNode );

	const treeDiff = this.alignTrees( oldTree, newTree );

	if ( treeDiff === false ) {
		// Diff timed out
		return false;
	}

	// Length of old content is length of old node minus the open and close
	// tags for each node
	changeRecord.keepLength = oldTreeNode.length - 2 * ( oldTree.orderedNodes.length - 1 );

	for ( let i = 0, ilen = treeDiff.length; i < ilen; i++ ) {
		if ( treeDiff[ i ][ 0 ] !== null && treeDiff[ i ][ 1 ] !== null ) {
			// There is a change
			const oldNode = oldTree.orderedNodes[ treeDiff[ i ][ 0 ] ].node;
			const newNode = newTree.orderedNodes[ treeDiff[ i ][ 1 ] ].node;

			if ( !oldNode.isDiffedAsTree() && !newNode.isDiffedAsTree() ) {
				diffInfo[ i ] = this.diffNodes( oldNode, newNode, true );
			} else if ( oldNode.isDiffComparable( newNode ) ) {
				const attributeChange = this.diffAttributes( oldNode, newNode );
				if ( attributeChange ) {
					diffInfo[ i ] = {
						linearDiff: null,
						attributeChange: this.diffAttributes( oldNode, newNode )
					};
				}
			}

		} else if ( treeDiff[ i ][ 0 ] !== null ) {
			// Node was removed
			const oldNode = oldTree.orderedNodes[ treeDiff[ i ][ 0 ] ].node;
			if ( !oldNode.isDiffedAsTree() ) {
				this.updateChangeRecord( oldNode.length, true, changeRecord );
			}

		} else {
			// Node was inserted
			const newNode = newTree.orderedNodes[ treeDiff[ i ][ 1 ] ].node;
			if ( !newNode.isDiffedAsTree() ) {
				this.updateChangeRecord( newNode.length, false, changeRecord );
			}
		}
	}

	// Only return the diff if a high enough proportion of the content is
	// unchanged; otherwise, these nodes don't correspond and shouldn't be
	// diffed.
	if ( this.underDiffThreshold( changeRecord ) ) {
		return false;
	}

	return {
		treeDiff: treeDiff,
		diffInfo: diffInfo,
		oldTreeOrderedNodes: oldTree.orderedNodes,
		newTreeOrderedNodes: newTree.orderedNodes,
		correspondingNodes: this.treeDiffer.Differ.prototype.getCorrespondingNodes(
			treeDiff, oldTree.orderedNodes.length, newTree.orderedNodes.length
		)
	};
};

/**
 * @typedef {Object} AttributeDiff
 * @memberof ve.dm.VisualDiff
 * @property {Object} oldAttributes
 * @property {Object} newAttributes
 */

/**
 * Find the difference between attributes of two nodes
 *
 * @param {ve.dm.Node} oldNode Node from the old document
 * @param {ve.dm.Node} newNode Node from the new document
 * @param {string} [diffTypeAsAttribute] Diff the type of the node as an attribute with this name
 * @return {ve.dm.VisualDiff.AttributeDiff|boolean} The attributes diff, or false if unchanged
 */
ve.dm.VisualDiff.prototype.diffAttributes = function ( oldNode, newNode, diffTypeAsAttribute ) {
	const oldAttributes = oldNode.getAttributes();
	const newAttributes = newNode.getAttributes();
	if ( diffTypeAsAttribute ) {
		oldAttributes[ diffTypeAsAttribute ] = oldNode.getType();
		newAttributes[ diffTypeAsAttribute ] = newNode.getType();
	}
	const attributesUnchanged = ve.compare( oldNode.getAttributes(), newNode.getAttributes() );

	if ( attributesUnchanged ) {
		return false;
	}
	return {
		oldAttributes: oldAttributes,
		newAttributes: newAttributes
	};
};

/**
 * Find the difference between linear data in two content branch nodes
 *
 * @param {ve.dm.ContentBranchNode} oldNode Node from the old document
 * @param {ve.dm.ContentBranchNode} newNode Node from the new document
 * @return {Array|boolean} The linear diff, or false if timed out
 */
ve.dm.VisualDiff.prototype.diffContent = function ( oldNode, newNode ) {
	let linearDiff;

	if ( Date.now() < this.endTime ) {
		linearDiff = this.linearDiffer.getCleanDiff(
			this.constructor.static.getDataFromNode( oldNode, true ),
			this.constructor.static.getDataFromNode( newNode, true ),
			{ keepOldText: false }
		);
		this.timedOut = !!linearDiff.timedOut;
	} else {
		this.timedOut = true;
		return false;
	}

	return linearDiff;
};

/**
 * Increment the record of the length of changed and unchanged content for
 * a node, given the length the removed or inserted content in one of its
 * descendants
 *
 * @param {number} length Length of removed or inserted content
 * @param {boolean} removed The content was removed (if false, was inserted)
 * @param {Object} changeRecord Record of the running totals for changed and
 * unchanged content
 */
ve.dm.VisualDiff.prototype.updateChangeRecord = function ( length, removed, changeRecord ) {
	changeRecord.diffLength += length;
	if ( removed ) {
		changeRecord.keepLength -= length;
	}
};

/**
 * Increment the record of the length of changed and unchanged content for
 * a node, given the linear diff for one of its descendants
 *
 * @param {Array} linearDiff Diff of the content
 * @param {Object} changeRecord Record of the running totals for changed and
 * unchanged content
 */
ve.dm.VisualDiff.prototype.updateChangeRecordLinearDiff = function ( linearDiff, changeRecord ) {
	const DIFF_INSERT = ve.DiffMatchPatch.static.DIFF_INSERT,
		DIFF_DELETE = ve.DiffMatchPatch.static.DIFF_DELETE;

	for ( let i = 0, ilen = linearDiff.length; i < ilen; i++ ) {
		if ( linearDiff[ i ][ 0 ] === DIFF_INSERT ) {
			this.updateChangeRecord( linearDiff[ i ][ 1 ].length, false, changeRecord );
		} else if ( linearDiff[ i ][ 0 ] === DIFF_DELETE ) {
			this.updateChangeRecord( linearDiff[ i ][ 1 ].length, true, changeRecord );
		}
	}
};

/**
 * Check whether the proportion of changed content between two nodes is under
 * the threshold for accepting that the two nodes correspond.
 *
 * @param {Object} changeRecord Record for the proportion of content changed
 * @return {boolean} The proportion of changed content is under the threshold
 */
ve.dm.VisualDiff.prototype.underDiffThreshold = function ( changeRecord ) {
	return changeRecord.keepLength < this.diffThreshold * changeRecord.diffLength;
};

/**
 * @typedef {Object} MetaListDiff
 * @memberof ve.dm.VisualDiff
 * @property {Object.<string,ve.dm.VisualDiff.ListDiff>} groups List diffs, indexed by group
 */

/**
 * Calculate a meta list diff
 *
 * @param {ve.dm.MetaList} oldMetaList
 * @param {ve.dm.MetaList} newMetaList
 * @return {ve.dm.VisualDiff.MetaListDiff}
 */
ve.dm.VisualDiff.prototype.getMetaListDiff = function ( oldMetaList, newMetaList ) {
	const oldItemsByGroup = {};
	oldMetaList.items.forEach( ( metaItem ) => {
		const group = metaItem.getGroup();
		oldItemsByGroup[ group ] = oldItemsByGroup[ group ] || [];
		oldItemsByGroup[ group ].push( metaItem );
	} );
	const newItemsByGroup = {};
	newMetaList.items.forEach( ( metaItem ) => {
		const group = metaItem.getGroup();
		newItemsByGroup[ group ] = newItemsByGroup[ group ] || [];
		newItemsByGroup[ group ].push( metaItem );
	} );
	const groups = OO.simpleArrayUnion(
		Object.keys( oldItemsByGroup ),
		Object.keys( newItemsByGroup )
	);
	const groupDiffs = {};
	groups.forEach( ( group ) => {
		groupDiffs[ group ] = this.diffList(
			oldItemsByGroup[ group ] || [],
			newItemsByGroup[ group ] || []
		);
	} );
	return groupDiffs;
};

/**
 * @typedef {Object} InternalListDiff
 * @memberof ve.dm.VisualDiff
 * @property {Object.<string,ve.dm.VisualDiff.ListDiff>} groups List diffs, indexed by group
 * @property {ve.dm.InternalListNode} oldDocInternalListNode
 * @property {ve.dm.InternalListNode} newDocInternalListNode
 */

/*
 * Get the diff between the old document's internal list and the new document's
 * internal list. The diff is grouped by list group, and each node in each list
 * group is marked as removed, inserted, the same, or changed (in which case the
 * linear diff is given).
 *
 * @param {ve.dm.InternalList} oldInternalList
 * @param {ve.dm.InternalList} newInternalList
 * @return {ve.dm.VisualDiff.InternalListDiff} Internal list diff object
 */
ve.dm.VisualDiff.prototype.getInternalListDiff = function ( oldInternalList, newInternalList ) {
	const oldDocNodeGroups = oldInternalList.getNodeGroups(),
		newDocNodeGroups = newInternalList.getNodeGroups(),
		oldDocInternalListNode = oldInternalList.getListNode(),
		newDocInternalListNode = newInternalList.getListNode(),
		groups = [],
		groupDiffs = {};
	let oldDocInternalListItems,
		newDocInternalListItems;

	function getInternalListItemsToDiff( indexOrder, nodes, action ) {
		const internalListItems = {
			toDiff: [],
			indices: []
		};

		for ( let j = 0, jlen = indexOrder.length; j < jlen; j++ ) {
			const nodeIndex = indexOrder[ j ];
			if ( nodeIndex !== null ) {
				internalListItems.toDiff.push( nodes[ nodeIndex ] );
				internalListItems.indices.push( {
					diff: action,
					indexOrder: j,
					nodeIndex: nodeIndex
				} );
			}
		}

		return internalListItems;
	}

	// Find all groups common to old and new docs
	// Also find inserted groups
	for ( const group in newDocNodeGroups ) {
		if ( group in oldDocNodeGroups ) {
			groups.push( {
				group: group,
				action: 'diff'
			} );
		} else {
			groups.push( {
				group: group,
				action: 'insert'
			} );
		}
	}

	// Find removed groups
	for ( const group in oldDocNodeGroups ) {
		if ( !( group in newDocNodeGroups ) ) {
			groups.push( {
				group: group,
				action: 'remove'
			} );
		}
	}

	// Diff the internal list items for each group
	for ( let i = 0, ilen = groups.length; i < ilen; i++ ) {
		const group = groups[ i ];

		let diff = null;
		switch ( group.action ) {
			case 'diff':
				// Get old and new doc internal list items for this group
				oldDocInternalListItems = getInternalListItemsToDiff(
					oldDocNodeGroups[ group.group ].indexOrder,
					oldDocInternalListNode.children
				);
				newDocInternalListItems = getInternalListItemsToDiff(
					newDocNodeGroups[ group.group ].indexOrder,
					newDocInternalListNode.children
				);

				// Diff internal list items
				diff = this.diffList(
					oldDocInternalListItems.toDiff,
					newDocInternalListItems.toDiff
				);

				if ( !this.hasChanges( diff, true ) ) {
					diff = null;
				}
				break;

			case 'insert': {
				// Get new doc internal list items for this group and mark as inserted
				const listItems = getInternalListItemsToDiff(
					newDocNodeGroups[ group.group ].indexOrder,
					newDocInternalListNode.children,
					1
				);
				diff = listItems.indices;
				diff.newNodes = listItems.toDiff;
				break;
			}

			case 'remove': {
				// Get old doc internal list items for this group and mark as removed
				const listItems = getInternalListItemsToDiff(
					oldDocNodeGroups[ group.group ].indexOrder,
					oldDocInternalListNode.children,
					-1
				);
				diff = listItems.indices;
				diff.oldNodes = listItems.toDiff;
				break;
			}
		}

		if ( diff ) {
			diff.changes = true;
			diff.oldList = oldDocInternalListNode;
			diff.newList = newDocInternalListNode;
			groupDiffs[ group.group ] = diff;
		}
	}

	return {
		groups: groupDiffs,
		oldNode: oldDocInternalListNode,
		newNode: newDocInternalListNode
	};
};

/**
 * Check if a list diff object has any changes
 *
 * @param {Object} diff Diff object
 * @param {boolean} isInternalListDiff Is an internal list diff
 * @return {boolean} The diff object has changes
 */
ve.dm.VisualDiff.prototype.hasChanges = function ( diff, isInternalListDiff ) {
	function containsDiff( diffObject ) {
		for ( const n in diffObject ) {
			if ( typeof diffObject[ n ] !== 'number' ) {
				return true;
			}
		}
		return false;
	}

	// Do not match within-document lists that have no corresponding list items
	if ( !isInternalListDiff && ve.isEmptyObject( diff.oldToNew ) ) {
		return false;
	}

	// Check there actually are any changes
	return ( diff.remove.length > 0 || diff.insert.length > 0 ) ||
		( containsDiff( diff.oldToNew ) || containsDiff( diff.moves ) );
};
