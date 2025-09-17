/**
 * TinyVE DM Document - clean representation of the document content
 *
 * This is a toy version of ve.dm.Document which illustrates the main concepts
 */

/**
 * Clean representation of the document content
 *
 * @class
 *
 * @constructor
 * @param {Array} linearData The linear data representation of the starting document content
 */
tinyve.dm.Document = function TinyVeDmDocument( linearData ) {
	/**
	 * @property {Array} data The linear data representation
	 */
	this.data = OO.copy( linearData );

	/**
	 * @property {tinyve.dm.Node} documentNode Node index tree of node offsets and lengths
	 */
	this.documentNode = null;

	/**
	 * @property {tinyve.dm.Transaction[]} completeHistory Complete transaction history
	 */
	this.completeHistory = [
		// Start with a single transaction that retains the whole document
		new tinyve.dm.Transaction( [ { type: 'retain', length: this.data.length } ] )
	];

	this.buildNodeTree();
};

OO.initClass( tinyve.dm.Document );

/**
 * Build a node index tree for linear data, from scratch
 */
tinyve.dm.Document.prototype.buildNodeTree = function () {
	let node = new tinyve.dm.BranchNode( 'document' );
	const nodeStack = [ node ];
	this.data.forEach( ( item ) => {
		const isClosing = item.type && item.type.startsWith( '/' );
		const isOpening = item.type && !isClosing;
		if ( isOpening ) {
			if ( [ 'p', 'h1', 'h2', 'h3' ].includes( item.type ) ) {
				node = new tinyve.dm.ContentBranchNode( item.type, node );
			} else if ( [ 'ul', 'li' ].includes( item.type ) ) {
				node = new tinyve.dm.BranchNode( item.type, node );
			} else {
				throw new Error( 'Unknown node type: ' + item.type );
			}
			nodeStack.push( node );
		} else if ( isClosing ) {
			node.parent.innerLength += node.innerLength + 2;
			node.parent.children.push( node );
			nodeStack.pop();
			node = nodeStack[ nodeStack.length - 1 ];
		} else {
			node.innerLength++;
		}
	} );
	this.documentNode = nodeStack[ 0 ];
};

/**
 * Rebuild the subtree inside a branch node, from linear model data
 *
 * The node's contents will be thrown away. The length of the node itself, and all nodes
 * outside this one, are assumed to match the linear model.
 *
 * @param {tinyve.dm.BranchNode} branchNode Node to rebuild
 * @param {number} lengthChange The length change since the node was built
 */
tinyve.dm.Document.prototype.rebuildTreeNode = function ( branchNode, lengthChange ) {
	if ( branchNode instanceof tinyve.dm.ContentBranchNode ) {
		branchNode.adjustLength( lengthChange );
		branchNode.emit( 'update' );
		return;
	}
	const range = branchNode.getRange();
	const data = this.data.slice( range.start, range.end + lengthChange );
	// Create a temporary document in order to generate the new nodes (as top-level siblings)
	const tempDocument = new tinyve.dm.Document( data );
	const addedNodes = tempDocument.documentNode.children;
	addedNodes.forEach( ( node ) => {
		node.parent = branchNode;
	} );
	// Move the nodes from the temporary document into this node
	const removedNodes = branchNode.splice( 0, branchNode.children.length, ...addedNodes );
	removedNodes.forEach( ( node ) => {
		node.parent = null;
	} );
};

/**
 * Apply a transaction's modifications on the document data.
 *
 * This implementation just changes the linear data then rebuilds the node trees afresh.
 *
 * In real VE, this is far more complex. See `ve.dm.TreeModifier`.
 *
 * 1. The list of linear operations are rewritten into a sequence of "tree operations". Unlike
 * linear operations, *each* tree operation preserves tree well-formedness. This means the tree
 * can be modified step by step instead of rebuilt afresh.
 *
 * 2. Each tree operation is applied individually, to the linear model, then to the DM tree,
 * then (via 'splice' events) to the CE tree. These modifications are *synchronous* — i.e. the
 * current operation finishes being processed before the next operation is processed, and all
 * are processed before #commit returns.
 *
 * @param {tinyve.dm.Transaction} transaction The transaction to apply
 */
tinyve.dm.Document.prototype.commit = function ( transaction ) {
	const newData = OO.copy( this.data );

	// Apply the transaction to this.data
	let i = 0;
	let replaceStart = null;
	let replaceEnd = null;
	let lengthChange = 0;
	transaction.operations.forEach( ( op ) => {
		if ( op.type === 'retain' ) {
			i += op.length;
			return;
		}
		// Else op.type === 'replace'
		if ( replaceStart === null ) {
			replaceStart = i;
		}
		replaceEnd = i + op.remove.length;
		const willRemove = newData.slice( i, i + op.remove.length );
		if ( !OO.compare( willRemove, op.remove ) ) {
			throw new Error( 'Removal mismatch' );
		}
		lengthChange += op.insert.length - op.remove.length;
		newData.splice( i, op.remove.length, ...OO.copy( op.insert ) );
	} );
	this.data = newData;
	const node = this.getContainingNode( new tinyve.Range( replaceStart, replaceEnd ) );
	this.rebuildTreeNode( node, lengthChange );
	this.completeHistory.push( transaction );
};

/**
 * Get the smallest node that entirely contains the given range
 *
 * @param {tinyve.Range} range The range
 * @param {tinyve.dm.BranchNode} [branchNode=this.documentNode] Branch node that entirely contains the range
 * @param {number} [offset=branchNode.getOffset()] The offset of that branch node
 * @return {tinyve.dm.Node} Smallest node that entirely contains the range
 */
tinyve.dm.Document.prototype.getContainingNode = function ( range, branchNode = this.documentNode, offset = branchNode.getOffset() ) {
	for ( const child of branchNode.children ) {
		// Increment offset for opening tag
		offset += 1;
		if ( range.start < offset ) {
			// The range starts before this child; return current node
			return branchNode;
		}
		if ( range.end > offset + child.innerLength ) {
			// The range ends after this child. Increment offset for node + closing tag
			offset += child.innerLength + 1;
			continue;
		}
		// Else the range lies within this child
		return this.getContainingNode( range, child, offset );
	}
	return branchNode;
};
