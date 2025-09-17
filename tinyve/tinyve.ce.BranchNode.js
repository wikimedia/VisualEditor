/**
 * TinyVE CE Branch node
 *
 * This is a toy version of ve.ce.BranchNode and subclasses, which illustrates the main concepts
 */

/**
 * A branch node in the CE tree.
 *
 * In real VE, each branch node type has its own subclass of `ve.ce.BranchNode`, and the
 * subclasses are instantiated through a node factory so extensions can at types.
 *
 * @class
 * @see {ve.ce.BranchNode}
 * @see {ve.ce.NodeFactory}
 *
 * @constructor
 * @param {tinyve.dm.BranchNode} model Model for which this object is a view
 * @param {tinyve.ce.Surface} surface Surface view to which this object belongs
 */
tinyve.ce.BranchNode = function TinyVeCeBranchNode( model, surface ) {
	// Parent constructor
	tinyve.ce.BranchNode.super.call( this, model, surface );

	/**
	 * @property {tinyve.ce.Node[]} children Child nodes
	 */
	this.children = [];

	this.$element.addClass( 'tinyve-ce-BranchNode' );

	this.initialize();
};

OO.inheritClass( tinyve.ce.BranchNode, tinyve.ce.Node );

/* Methods */

tinyve.ce.BranchNode.prototype.initialize = function () {
	this.children = [];
	this.onSplice( 0, 0, ...this.model.children );
	this.model.connect( this, { splice: 'onSplice' } );
};

/**
 * This is where content actually gets added to/removed from the ContentEditable surface. The
 * modification happens as a change in the child nodes of this node.
 *
 * In real VE, the functionality is in `ve.ce.BranchNode`, since there is a separate base class
 * for leaf nodes (which cannot have children).
 *
 * @param {number} index The index in the child list where the splice will occur
 * @param {number} deleteCount The number of items to remove
 * @param {tinyve.dm.Node[]} modelNodes Model nodes to add
 */
tinyve.ce.BranchNode.prototype.onSplice = function ( index, deleteCount, ...modelNodes ) {
	const viewNodes = modelNodes.map( ( modelNode ) => {
		const viewNode = this.surface.buildNode( modelNode );
		return viewNode;
	} );
	const removals = this.children.splice( index, deleteCount, ...viewNodes );
	removals.forEach( ( viewNode ) => {
		viewNode.$element.detach();
	} );
	const insertPoint = this.$element[ 0 ].childNodes[ index ] || null;
	viewNodes.forEach( ( viewNode ) => {
		// Attach the node into the DOM
		this.$element[ 0 ].insertBefore( viewNode.$element[ 0 ], insertPoint );
	} );
};
