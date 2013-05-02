/*!
 * VisualEditor EventEmitter class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Event emitter.
 *
 * @class
 * @constructor
 * @property {Object} bindings
 */
ve.EventEmitter = function VeEventEmitter() {
	// Properties
	this.bindings = {};
};

/* Methods */

/**
 * Emit an event.
 *
 * @method
 * @param {string} event Type of event
 * @param {Mixed} args First in a list of variadic arguments passed to event handler (optional)
 * @returns {boolean} If event was handled by at least one listener
 */
ve.EventEmitter.prototype.emit = function ( event ) {
	var i, len, binding, bindings, args;

	if ( event in this.bindings ) {
		// Slicing ensures that we don't get tripped up by event handlers that add/remove bindings
		bindings = this.bindings[event].slice();
		args = Array.prototype.slice.call( arguments, 1 );
		for ( i = 0, len = bindings.length; i < len; i++ ) {
			binding = bindings[i];
			binding.callback.apply(
				binding.context,
				binding.args ? binding.args.concat( args ) : args
			);
		}
		return true;
	}
	return false;
};

/**
 * Add a listener to events of a specific event.
 *
 * @method
 * @param {string} event Type of event to listen to
 * @param {Function} callback Function to call when event occurs
 * @param {Array} [args] Arguments to pass to listener, will be prepended to emitted arguments
 * @param {Object} [context=null] Object to use as context for callback function or call method on
 * @throws {Error} Listener argument is not a function or method name
 * @chainable
 */
ve.EventEmitter.prototype.on = function ( event, callback, args, context ) {
	// Validate callback
	if ( typeof callback !== 'function' ) {
		throw new Error( 'Invalid callback. Function or method name expected.' );
	}

	// Auto-initialize binding
	if ( !( event in this.bindings ) ) {
		this.bindings[event] = [];
	}

	// Add binding
	this.bindings[event].push( {
		'callback': callback,
		'args': args,
		'context': context || null
	} );
	return this;
};

/**
 * Remove a specific listener from a specific event.
 *
 * @method
 * @param {string} event Type of event to remove listener from
 * @param {Function} [callback] Listener to remove, omit to remove all
 * @chainable
 * @throws {Error} Listener argument is not a function
 */
ve.EventEmitter.prototype.off = function ( event, callback ) {
	var i, bindings;

	if ( arguments.length === 1 ) {
		// Remove all bindings for event
		if ( event in this.bindings ) {
			delete this.bindings[event];
		}
	} else {
		if ( typeof callback !== 'function' ) {
			throw new Error( 'Invalid callback. Function expected.' );
		}
		if ( !( event in this.bindings ) || !this.bindings[event].length ) {
			// No matching bindings
			return this;
		}
		// Remove matching handlers
		bindings = this.bindings[event];
		i = bindings.length;
		while ( i-- ) {
			if ( bindings[i].callback === callback ) {
				bindings.splice( i, 1 );
			}
		}
		// Cleanup if now empty
		if ( bindings.length === 0 ) {
			delete this.bindings[event];
		}
	}
	return this;
};

/**
 * Connect event handlers to an object.
 *
 * @method
 * @param {Object} context Object to call methods on when events occur
 * @param {Object.<string,string>|Object.<string,Function>|Object.<string,Array>} methods List of
 * event bindings keyed by event name containing either method names, functions or arrays containing
 * method name or function followed by a list of arguments to be passed to callback before emitted
 * arguments
 * @chainable
 */
ve.EventEmitter.prototype.connect = function ( context, methods ) {
	var method, callback, args, event;

	for ( event in methods ) {
		method = methods[event];
		// Allow providing additional args
		if ( ve.isArray( method ) ) {
			args = method.slice( 1 );
			method = method[0];
		} else {
			args = [];
		}
		// Allow callback to be a method name
		if ( typeof method === 'string' ) {
			// Validate method
			if ( !context[method] || typeof context[method] !== 'function' ) {
				throw new Error( 'Method not found: ' + method );
			}
			// Resolve to function
			callback = context[method];
		} else {
			callback = method;
		}
		// Add binding
		this.on.apply( this, [ event, callback, args, context ] );
	}
	return this;
};

/**
 * Disconnect event handlers from an object.
 *
 * @method
 * @param {Object} context Object to disconnect methods from
 * @param {Object.<string,string>|Object.<string,Function>|Object.<string,Array>} [methods] List of
 * event bindings keyed by event name containing either method names or functions
 * @chainable
 */
ve.EventEmitter.prototype.disconnect = function ( context, methods ) {
	var i, method, callback, event, bindings;

	if ( methods ) {
		for ( event in methods ) {
			method = methods[event];
			if ( typeof method === 'string' ) {
				// Validate method
				if ( !context[method] || typeof context[method] !== 'function' ) {
					throw new Error( 'Method not found: ' + method );
				}
				// Resolve to function
				callback = context[method];
			} else {
				callback = method;
			}
			bindings = this.bindings[event];
			i = bindings.length;
			while ( i-- ) {
				if ( bindings[i].context === context && bindings[i].callback === callback ) {
					bindings.splice( i, 1 );
				}
			}
			if ( bindings.length === 0 ) {
				delete this.bindings[event];
			}
		}
	} else {
		for ( event in this.bindings ) {
			bindings = this.bindings[event];
			i = bindings.length;
			while ( i-- ) {
				if ( bindings[i].context === context ) {
					bindings.splice( i, 1 );
				}
			}
			if ( bindings.length === 0 ) {
				delete this.bindings[event];
			}
		}
	}

	return this;
};

/**
 * Adds a one-time listener to a specific event.
 *
 * @method
 * @param {string} event Type of event to listen to
 * @param {Function} listener Listener to call when event occurs
 * @chainable
 */
ve.EventEmitter.prototype.once = function ( event, listener ) {
	var eventEmitter = this;
	return this.on( event, function listenerWrapper() {
		eventEmitter.off( event, listenerWrapper );
		listener.apply( eventEmitter, Array.prototype.slice.call( arguments, 0 ) );
	} );
};
