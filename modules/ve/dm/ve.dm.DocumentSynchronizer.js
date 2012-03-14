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
 * Adds an action to the synchronizer.
 * 
 * @method
 * @param {String} type Type of action, can be: "insert", "delete", "rebuild", "resize" or "update"
 * @param {ve.dm.Node} node Node this action is related to
 * @param {Integer|null} offset Offset of node, improves performance if this has already been calculated.
 *                         Only used for insert and rebuild actions
 * @param {Integer} adjustment Node length adjustment, if any
 */
ve.dm.DocumentSynchronizer.prototype.pushAction = function( type, node, offset, adjustment ) {
	this.actions.push( {
		'type': type,
		'node': node,
		'offset': offset,
		'adjustment': adjustment || 0
	} );
};

/**
 * Applies queued actions to the model tree.
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
		offset = action.offset;
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
