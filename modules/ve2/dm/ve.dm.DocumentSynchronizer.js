/**
 * Creates an ve.dm.DocumentSynchronizer object.
 * 
 * This object is a utility for collecting actions to be performed on the model tree in multiple
 * steps as the linear model is modified my a transaction processor and then processing those queued
 * actions when the transaction is done being processed.
 * 
 * IMPORTANT NOTE: It is assumed that:
 *   - The linear model has already been updated for the pushed actions
 *   - Actions are pushed in increasing offset order
 *   - Actions are non-overlapping
 * 
 * @class
 * @constructor
 * @param {ve.dm.Document} doc Document to synchronize
 */
ve.dm.DocumentSynchronizer = function( doc ) {
	// Properties
	this.document = doc;
	this.actionQueue = [];
	this.eventQueue = [];
};

/* Static Members */

/**
 * Synchronization methods.
 * 
 * Each method is specific to a type of action. Methods are called in the context of a document
 * synchronizer, so they work similar to normal methods on the object.
 * 
 * @static
 * @member
 */
ve.dm.DocumentSynchronizer.synchronizers = {

	/* Static Methods */

	/**
	 * Synchronizes an annotation action.
	 * 
	 * @static
	 * @method
	 * @param {Object} action 
	 */
	'annotation': function( action ) {
		// Queue events for all leaf nodes covered by the range
		// TODO test me
		var i, selection = this.document.selectNodes( action.range, 'leaves' );
		for ( i = 0; i < selection.length; i++ ) {
			this.queueEvent( selection[i].node, 'annotation' );
			this.queueEvent( selection[i].node, 'update' );
		}
	},
	/**
	 * Synchronizes an attribute change action.
	 * 
	 * @static
	 * @method
	 * @param {Object} action 
	 */
	'attributeChange': function( action ) {
		this.queueEvent( action.node, 'attributeChange', action.key, action.from, action.to );
		this.queueEvent( action.node, 'update' );
	},
	/**
	 * Synchronizes a resize action.
	 * 
	 * @static
	 * @method
	 * @param {Object} action 
	 */
	'resize': function( action ) {
		action.node.adjustLength( action.adjustment );
		this.queueEvent( action.node, 'update' );
	},
	/**
	 * Synchronizes a rebuild action.
	 * 
	 * @static
	 * @method
	 * @param {Object} action 
	 */
	'rebuild': function( action ) {
		// Find the nodes contained by oldRange
		var selection = this.document.selectNodes( action.oldRange, 'siblings' );
		if ( selection.length === 0 ) {
			// WTF? Nothing to rebuild, I guess. Whatever.
			return;
		}
		
		// TODO index of firstNode in parent should be in the selectNodes result
		var firstNode = selection[0].node,
			parent = firstNode.getParent(),
			index = parent.indexOf( firstNode );
		
		this.document.rebuildNodes( parent, index, selection.length, action.oldRange.from,
			action.newRange.getLength()
		);
	}
};

/* Methods */

/**
 * Gets the document being synchronized.
 * 
 * @method
 * @returns {ve.dm.Document} Document being synchronized
 */
ve.dm.DocumentSynchronizer.prototype.getDocument = function() {
	return this.document;
};

/**
 * Add an annotation action to the queue.
 * 
 * This finds all leaf nodes covered wholly or partially by the given range, and emits annotation
 * events for all of them.
 * 
 * @method
 * @param {ve.Range} range Range that was annotated
 */
ve.dm.DocumentSynchronizer.prototype.pushAnnotation = function( range ) {
	this.actionQueue.push( {
		'type': 'annotation',
		'range': range
	} );
};

/**
 * Add an attribute change to the queue.
 * 
 * This emits an attributeChange event for the given node with the provided metadata.
 * 
 * @method
 * @param {ve.dm.Node} node Node whose attribute changed
 * @param {String} key Key of the attribute that changed
 * @param {Mixed} from Old value of the attribute
 * @param {Mixed} to New value of the attribute
 */
ve.dm.DocumentSynchronizer.prototype.pushAttributeChange = function( node, key, from, to ) {
	this.actionQueue.push( {
		'type': 'attributeChange',
		'node': node,
		'key': key,
		'from': from,
		'to': to
	} );
};

/**
 * Add a resize action to the queue.
 * 
 * This changes the length of a text node.
 * 
 * @method
 * @param {ve.dm.TextNode} node Node to resize
 * @param {Integer} adjustment Length adjustment to apply to the node
 */
ve.dm.DocumentSynchronizer.prototype.pushResize = function( node, adjustment ) {
	this.actionQueue.push( {
		'type': 'resize',
		'node': node,
		'adjustment': adjustment
	} );
};

/**
 * Add a rebuild action to the queue.
 * 
 * When a range of data has been changed arbitrarily this can be used to drop the nodes that
 * represented the original range and replace them with new nodes that represent the new range.
 * 
 * @method
 * @param {ve.Range} oldRange Range of old nodes to be dropped
 * @param {ve.Range} newRange Range for new nodes to be built from
 */
ve.dm.DocumentSynchronizer.prototype.pushRebuild = function( oldRange, newRange ) {
	this.actionQueue.push( {
		'type': 'rebuild',
		'oldRange': oldRange,
		'newRange': newRange
	} );
};

/**
 * Queue an event to be emitted on a node.
 * 
 * This method is called by methods defined in {ve.dm.DocumentSynchronizer.synchronizers}.
 * 
 * Duplicate events will be ignored only if all arguments match exactly. Hashes of each event that
 * has been queued are stored in the nodes they will eventually be fired on.
 * 
 * @method
 * @param {ve.dm.Node} node
 * @param {String} event Event name
 * @param {Mixed} [...] Additional arguments to be passed to the event when fired
 */
ve.dm.DocumentSynchronizer.prototype.queueEvent = function( node, event ) {
	// Check if this is already queued
	var args = Array.prototype.slice.call( arguments, 1 );
	var hash = $.toJSON( args );
	if ( !node.queuedEventHashes ) {
		node.queuedEventHashes = {};
	}
	if ( !node.queuedEventHashes[hash] ) {
		node.queuedEventHashes[hash] = true;
		this.eventQueue.push( { 'node': node, 'args': args } );
	}
};

/**
 * Synchronizes node tree using queued actions.
 * 
 * This method uses the static methods defined in {ve.dm.DocumentSynchronizer.synchronizers} and
 * calls them in the context of {this}.
 * 
 * After synchronization is complete all queued events will be emitted. Hashes of queued events that
 * have been stored on nodes are removed from the nodes after the events have all been emitted.
 * 
 * This method also clears both action and event queues.
 * 
 * @method
 */
ve.dm.DocumentSynchronizer.prototype.synchronize = function() {
	var action,
		event,
		i;
	// Execute the actions in the queue
	for ( i = 0; i < this.actionQueue.length; i++ ) {
		action = this.actionQueue[i];
		if ( action.type in ve.dm.DocumentSynchronizer.synchronizers ) {
			ve.dm.DocumentSynchronizer.synchronizers[action.type].call( this, action );
		} else {
			throw 'Invalid action type ' + action.type;
		}
	}
	// Emit events in the event queue
	for ( i = 0; i < this.eventQueue.length; i++ ) {
		event = this.eventQueue[i];
		event.node.emit.apply( event.node, event.args );
		delete event.node.queuedEventHashes;
	}
	// Clear queues
	this.actionQueue = [];
	this.eventQueue = [];
};
