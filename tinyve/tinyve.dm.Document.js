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
