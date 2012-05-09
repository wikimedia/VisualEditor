/**
 * Creates an ve.dm.DocumentSynchronizer object.
 * 
 * This object is a utility for collecting actions to be performed on the model tree
 * in multiple steps and then processing those actions in a single step.
 * 
 * NOTE: An 'update' event is emitted for every node that is touched by the synchronizer in any
 * way, but only once for every node. Other events are emitted as we go.
 * 
 * IMPORTANT NOTE: It is assumed that:
 * The linear model has already been updated for the pushed actions
 * Actions are pushed in increasing offset order
 * Actions are non-overlapping
 * 
 * @class
 * @constructor
 * @param {ve.dm.Document} doc Document to synchronize
 */
ve.dm.DocumentSynchronizer = function( doc ) {
	// Properties
	this.document = doc;
	this.actions = [];
	this.eventQueue = [];
};

/* Methods */

ve.dm.DocumentSynchronizer.prototype.getDocument = function() {
	return this.document;
};

/**
 * Add an annotation action to the queue. This finds all leaf nodes covered wholly or partially
 * by the given range, and emits annotation events for all of them.
 * @param {ve.Range} range Range that was annotated
 */
ve.dm.DocumentSynchronizer.prototype.pushAnnotation = function( range ) {
	this.actions.push( {
		'type': 'annotation',
		'range': range
	} );
};

/**
 * Add an attribute change to the queue. This emits an attributeChange event for the given node
 * with the provided metadata.
 * @param {ve.dm.Node} node Node whose attribute changed
 * @param {String} key Key of the attribute that changed
 * @param from Old value of the attribute
 * @param to New value of the attribute
 */
ve.dm.DocumentSynchronizer.prototype.pushAttributeChange = function( node, key, from, to ) {
	this.actions.push( {
		'type': 'attributeChange',
		'node': node,
		'key': key,
		'from': from,
		'to': to
	} );
};

/**
 * Add a resize action to the queue. This changes the length of a text node.
 * @param {ve.dm.TextNode} node Node to resize
 * @param {Integer} adjustment Length adjustment to apply to the node
 */
ve.dm.DocumentSynchronizer.prototype.pushResize = function( node, adjustment ) {
	this.actions.push( {
		'type': 'resize',
		'node': node,
		'adjustment': adjustment
	} );
};

ve.dm.DocumentSynchronizer.prototype.pushRebuild = function( oldRange, newRange ) {
	this.actions.push( {
		'type': 'rebuild',
		'oldRange': oldRange,
		'newRange': newRange
	} );
};

ve.dm.DocumentSynchronizer.prototype.annotation = function( action ) {
	// Queue events for all leaf nodes covered by the range
	// TODO test me
	var i, selection = this.document.selectNodes( action.range, 'leaves' );
	for ( i = 0; i < selection.length; i++ ) {
		this.queueEvent( selection[i].node, 'annotation' );
		this.queueEvent( selection[i].node, 'update' );
	}
};

ve.dm.DocumentSynchronizer.prototype.attributeChange = function( action ) {
	this.queueEvent( action.node, 'attributeChange', action.key, action.from, action.to );
	this.queueEvent( action.node, 'update' );
};

ve.dm.DocumentSynchronizer.prototype.resize = function( action ) {
	action.node.adjustLength( action.adjustment );
	this.queueEvent( action.node, 'update' );
};

ve.dm.DocumentSynchronizer.prototype.rebuild = function( action ) {
	// Find the nodes contained by oldRange
	var selection = this.document.selectNodes( action.oldRange, 'siblings' );
	if ( selection.length == 0 ) {
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
};

ve.dm.DocumentSynchronizer.prototype.queueEvent = function( node, event ) {
	// Check if this is already queued
	var args = Array.prototype.slice.call( arguments, 1 );
	var hash = $.toJSON( args );
	if ( !node.DSqueuedevents ) {
		node.DSqueuedevents = {};
	}
	if ( node.DSqueuedevents[hash] ) {
		return;
	}
	
	node.DSqueuedevents[hash] = true;
	this.eventQueue.push( { 'node': node, 'args': args } );
};

ve.dm.DocumentSynchronizer.prototype.emitEvents = function() {
	var i, event;
	for ( i = 0; i < this.eventQueue.length; i++ ) {
		event = this.eventQueue[i];
		event.node.emit.apply( event.node, event.args );
		delete event.node.DSqueuedevents;
	}
	this.eventQueue = [];
};

ve.dm.DocumentSynchronizer.prototype.synchronize = function() {
	var action, i;
	// Execute the actions in the queue
	for ( i = 0; i < this.actions.length; i++ ) {
		action = this.actions[i];
		if ( action.type in this ) {
			this[action.type]( action );
		} else {
			throw 'Invalid action type ' + action.type;
		}
	}
	
	this.emitEvents();
	this.actions = [];
};
