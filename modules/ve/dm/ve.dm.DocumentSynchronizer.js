/**
 * Creates an ve.dm.DocumentSynchronizer object.
 * 
 * This object is a utility for collecting actions to be performed on the model tree
 * in multiple steps and then processing those actions in a single step.
 * 
 * @class
 * @constructor
 */
ve.dm.DocumentSynchronizer = function( model ) {
	// Properties
	this.model = model;
	this.actions = [];
};

/* Methods */

ve.dm.DocumentSynchronizer.prototype.getModel = function() {
	return this.model;
};

/**
 * Add an insert action to the queue
 * @param {ve.dm.BranchNode} node Node to insert
 * @param {Integer} [offset] Offset of the inserted node, if known
 */
ve.dm.DocumentSynchronizer.prototype.pushInsert = function( node, offset ) {
	this.actions.push( {
		'type': 'insert',
		'node': node,
		'offset': offset || null
	} );
};

/**
 * Add a delete action to the queue
 * @param {ve.dm.BranchNode} node Node to delete
 */
ve.dm.DocumentSynchronizer.prototype.pushDelete = function( node ) {
	this.actions.push( {
		'type': 'delete',
		'node': node
	} );
};

/**
 * Add a rebuild action to the queue. This rebuilds one or more nodes from data
 * found in the linear model.
 * @param {ve.Range} oldRange Range that the old nodes used to span. This is
 *                            used to find the old nodes in the model tree.
 * @param {ve.Range} newRange Range that contains the new nodes. This is used
 *                            to get the new node data from the linear model.
 */
ve.dm.DocumentSynchronizer.prototype.pushRebuild = function( oldRange, newRange ) {
	oldRange.normalize();
	newRange.normalize();
	this.actions.push( {
		'type': 'rebuild',
		'oldRange': oldRange,
		'newRange': newRange
	} );
};

/**
 * Add a resize action to the queue. This changes the content length of a leaf node.
 * @param {ve.dm.BranchNode} node Node to resize
 * @param {Integer} adjustment Length adjustment to apply to the node
 */
ve.dm.DocumentSynchronizer.prototype.pushResize = function( node, adjustment ) {
	this.actions.push( {
		'type': 'resize',
		'node': node,
		'adjustment': adjustment
	} );
};

/**
 * Add an update action to the queue
 * @param {ve.dm.BranchNode} node Node to update
 */
ve.dm.DocumentSynchronizer.prototype.pushUpdate = function( node ) {
	this.actions.push( {
		'type': 'update',
		'node': node
	} );
};

/**
 * Apply queued actions to the model tree. This assumes that the linear model
 * has already been updated, but the model tree has not yet been.
 * 
 * @method
 */
ve.dm.DocumentSynchronizer.prototype.synchronize = function() {
	// TODO: Normalize the actions list to clean up nested actions
	// Perform all actions
	var	action,
		offset,
		parent;
	for ( var i = 0, len = this.actions.length; i < len; i++ ) {
		action = this.actions[i];
		offset = action.offset || null;
		switch ( action.type ) {
			case 'insert':
				// Compute the offset if it wasn't provided
				if ( offset === null ) {
					offset = this.model.getOffsetFromNode( action.node );
				}
				// Insert the new node at the given offset
				var target = this.model.getNodeFromOffset( offset + 1 );
				if ( target === this.model ) {
					// Insert at the beginning of the document
					this.model.splice( 0, 0, action.node );
				} else if ( target === null ) {
					// Insert at the end of the document
					this.model.splice( this.model.getElementLength(), 0, action.node );
				} else {
					// Insert before the element currently at the offset
					parent = target.getParent();
					parent.splice( parent.indexOf( target ), 0, action.node );
				}
				break;
			case 'delete':
				// Replace original node with new node
				parent = action.node.getParent();
				parent.splice( parent.indexOf( action.node ), 1 );
				break;
			case 'rebuild':
				// Generate the new nodes
				var newNodes = ve.dm.DocumentNode.createNodesFromData(
					this.model.getData( action.newRange )
				);
				
				// Find the node(s) contained by oldRange. This is done by repeatedly
				// invoking selectNodes() in shallow mode until we find the right node(s).
				// TODO this traversal could be made more efficient once we have an offset map
				// TODO I need to add this recursive shallow stuff to selectNodes() as a 'siblings' mode
				var selection, node = this.model, range = action.oldRange;
				while ( true ) {
					selection = node.selectNodes( range, true );
					// We stop descending if:
					// * we got more than one node, OR
					// * we got a leaf node, OR
					// * we got no range, which means the entire node is covered, OR
					// * we got the same node back, which means we'd get in an infinite loop
					if ( selection.length != 1 ||
						!selection[0].node.hasChildren() ||
						!selection[0].range ||
						selection[0].node == node
					) {
						break;
					}
					// Descend into this node
					node = selection[0].node;
					range = selection[0].range;
				}
				if ( selection[0].node == this.model ) {
					// We got some sort of weird input, ignore it
					break;
				}
				
				// The first node we're removing is selection[0].node , and we're removing
				// selection.length adjacent nodes
				parent = selection[0].node.getParent();
				// TODO selectNodes() output knows the index of selection[0].node in its parent, should expose it
				ve.batchedSplice( parent, parent.indexOf( selection[0].node ), selection.length, newNodes );
				break;
			case 'resize':
				// Adjust node length - causes update events to be emitted
				action.node.adjustContentLength( action.adjustment );
				break;
			case 'update':
				// Emit update events
				action.node.emit( 'update' );
				break;
		}
	}
	
	// We've processed the queue, clear it
	this.actions = [];
};
