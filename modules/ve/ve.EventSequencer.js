/*!
 * VisualEditor EventSequencer class.
 *
 * @copyright 2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * EventSequencer class with pre-event and post-event listeners.
 *
 * Post-event listeners are fired as soon as possible after the
 * corresponding native event. They are similar to the setTimeout(f, 0)
 * idiom, except that they are guaranteed to execute before any subsequent
 * pre-event listener. Therefore, events are executed in the 'right order'.
 *
 * This matters when many events are added to the event queue in one go.
 * For instance, browsers often queue 'keydown' and 'keypress' in immediate
 * sequence, so a setTimeout(f, 0) defined in the keydown listener will run
 * *after* the keypress listener (i.e. in the 'wrong' order). EventSequencer
 * ensures that this does not happen.
 *
 * @constructor
 * @param {HTMLElement} node Node to which listeners should be attached
 * @param {string[]} eventNames List of event Names to listen to
 * @param {Function} [boundLogFunc] Logging function, pre-bound with ve.bind
 */
ve.EventSequencer = function ( node, eventNames, boundLogFunc ) {
	var i, len, eventName, $node = $( node );
	this.node = node;
	this.preListenersForEvent = {};
	this.postListenersForEvent = {};
	this.log = boundLogFunc || function () {};

	/**
	 * @property {Object[]}
	 *  - id {number} Id for setTimeout
	 *  - func {Function} Post-event listener
	 *  - ev {jQuery.Event} Browser event
         *  - eventName {string} Name, such as keydown
         */
	this.pendingCalls = [];
	for ( i = 0, len = eventNames.length; i < len; i++ ) {
		eventName = eventNames[i];
		$node.on( eventName, ve.bind( this.onEvent, this, eventName ) );
		this.preListenersForEvent[eventName] = [];
		this.postListenersForEvent[eventName] = [];
	}
};

/**
 * Add a listener to be fired just before the browser native action
 * @method
 * @param {string} eventName Javascript name of the event, e.g. 'keydown'
 * @param {Function} listener Listener accepting a single argument 'event'
 */
ve.EventSequencer.prototype.addPreListener = function( eventName, listener ) {
	this.preListenersForEvent[eventName].push( listener );
};

/**
 * Add a listener to be fired as soon as possible after the native action
 * @method
 * @param {string} eventName Javascript name of the event, e.g. 'keydown'
 * @param {Function} listener Listener accepting a single argument 'event'
 */
ve.EventSequencer.prototype.addPostListener = function( eventName, listener ) {
	this.postListenersForEvent[eventName].push( listener );
};

/**
 * Generic listener method which does the sequencing
 * @method
 * @param {string} eventName Javascript name of the event, e.g. 'keydown'
 * @param {jQuery.Event} ev The browser event
 */
ve.EventSequencer.prototype.onEvent = function( eventName, ev ) {
	var i, len, preListener, postListener, pendingCall;
	this.log( '(EventSequencer: onEvent', eventName, ev, ')' );
	this.runAllPendingCallsNow();
	for ( i = 0, len = this.preListenersForEvent[eventName].length; i < len; i++ ) {
		// Length cache is required, as a preListener could add another preListener
		preListener = this.preListenersForEvent[eventName][i];
		this.log( '(EventSequencer: preListener', eventName, ev, ')' );
		preListener( ev );
	}
	for ( i = 0, len = this.postListenersForEvent[eventName].length; i < len; i++ ) {
		// Length cache for style
		postListener = this.postListenersForEvent[eventName][i];

		// Create a cancellable pending call
		// - Create the pendingCall object first
		// - then create the setTimeout invocation to modify pendingCall.id
		// - then set pendingCall.id to the setTimeout id, so the call can cancel itself
		// Must wrap everything in a function call, to create the required closure.
		pendingCall = { 'func': postListener, 'id': null, 'ev': ev, 'eventName': eventName };
		/*jshint loopfunc:true */
		( function ( pendingCall, ev, log ) {
			var id = setTimeout( function () {
				if ( pendingCall.id === null ) {
					return; // Seems to be necessary in Chromium
				}
				pendingCall.id = null;
				log( '(EventSequencer: reached postListener', eventName, ev, ')' );
				pendingCall.func( ev );
			} );
			pendingCall.id = id;
		} )( pendingCall, ev, this.log );
		/*jshint loopfunc:false */
		this.pendingCalls.push( pendingCall );
	}
};

/**
 * Run any pending listeners, and clear the pending queue
 * @method
 */
ve.EventSequencer.prototype.runAllPendingCallsNow = function () {
	var i, pendingCall;
	this.log( '(EventSequencer: runAllPendingCallsNow', this.pendingCalls, ')' );
	for ( i = 0; i < this.pendingCalls.length; i++ ) {
		// Length cache not possible, as a pending call appends another pending call.
		pendingCall = this.pendingCalls[i];
		if ( pendingCall.id === null ) {
			continue; // already run
		}
		clearTimeout( pendingCall.id );
		pendingCall.id = null;
		this.log( '(EventSequencer: reached postListener', pendingCall, ')' );
		// Force to run now
		pendingCall.func( pendingCall.ev );
	}
	this.pendingCalls = [];
};
