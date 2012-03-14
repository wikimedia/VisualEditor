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
 * Add a rebuild action to the queue. This rebuilds a node from data
 * found in the linear model.
 * @param {ve.dm.BranchNode} node Node to rebuild
 * @param {Integer} adjustment Length adjustment to apply to the node
 * @param {Integer} offset Offset of the node, if known
 */
ve.dm.DocumentSynchronizer.prototype.pushRebuild = function( node, adjustment, offset ) {
	this.actions.push( {
		'type': 'rebuild',
		'node': node,
		'adjustment': adjustment,
		'offset': offset || null
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
				// Compute the offset if it wasn't provided
				if ( offset === null ) {
					offset = this.model.getOffsetFromNode( action.node );
				}
				// Replace original node with new node
				var newNodes = ve.dm.DocumentNode.createNodesFromData( this.model.getData(
					new ve.Range( offset, action.node.getElementLength() + action.adjustment )
				) );
				parent = action.node.getParent();
				ve.batchedSplice( parent, parent.indexOf( action.node ), 1, newNodes );
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
