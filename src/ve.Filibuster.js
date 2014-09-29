/*!
 * VisualEditor Logger class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */
/*global Set*/
/**
 * A scrupulous event logger that logs state at every function call, and
 * shortlists potentially significant observations for strict scrutiny.
 *
 * Functions are wrapped to log entry/exit. This creates a comprehensive log of
 * every watched function call (typically thousands per keystroke), together
 * with the corresponding call stack.
 *
 * Observer callbacks can be registered to watch certain global values (e.g.
 * the DOM/DM content and selection). These at every watched function
 * entry/exit, and when there is a change (typically a few times per keystroke),
 * an observation is logged. Each observation shows the state change and call
 * stack, and has a log number that points into the full call log.
 *
 * Function wrapping generally takes place after object initialization.
 * Property lookups that have already happened, e.g. in prior calls to
 * OO.EventEmitter's "connect" function, will not benefit from the wrapping. It
 * is possible to modify "connect" to perform late binding; see ve.Debug.js for
 * an example.
 *
 * This code is inspired by United States v. Carolene Products Company, 304
 * U.S. 144 (1938), Footnote Four.
 *
 * @class ve.Filibuster
 */

/**
 * @constructor
 * @param {string[]} eventNames List of event names to listen to
 */
ve.Filibuster = function VeFilibuster() {
	this.stack = [];
	this.count = 0;
	this.states = {};
	this.observers = {};
	this.observations = [];
	this.callLog = [];
	this.active = false;
	this.startTime = null;
};

OO.initClass( ve.Filibuster );

/**
 * Clears logs, without detaching observers
 */
ve.Filibuster.prototype.clearLogs = function () {
	var name;
	this.count = 0;
	for ( name in this.states ) {
		delete this.states[ name ];
	}
	this.observations.length = 0;
	this.callLog.length = 0;
};

/**
 * Attaches an observer callback. The callback returns a value representing the current state,
 * which must be a string, a number, a boolean, undefined or null (this ensures state values
 * are immutable and can be compared with strict equals).
 *
 * The observer will be called before and after every function call. An observation is logged
 * every time there is a difference between the current return value and the previous one.
 *
 * @param {string} name The name of the observer, for display in the logs.
 * @param {Function} callback The callback; must return string|number|boolean|undefined|null
 * @chainable
 */
ve.Filibuster.prototype.setObserver = function ( name, callback ) {
	this.observers[ name ] = callback;
	return this;
};

/**
 * Calls each observer, logging an observation if a change is detected. Called at the start
 * and end of every monitored function call.
 *
 * @param {string} action The function call phase: call|return|throw
 * @param {number} time Elapsed time since filibuster start
 */
ve.Filibuster.prototype.observe = function ( action, time ) {
	var name, callback, oldState, newState;

	for ( name in this.observers ) {
		callback = this.observers[ name ];
		oldState = this.states[ name ];
		try {
			newState = callback();
		} catch ( ex ) {
			newState = 'Error: ' + ex;
		}
		if ( newState && !( typeof newState ).match( /^(string|number|boolean)$/ ) ) {
			// Be strict about the allowed types, to ensure immutability
			ve.error( 'Illegal state:', newState );
			throw new Error( 'Illegal state: ' + newState );
		}

		if ( oldState !== newState ) {
			// Write observation
			this.observations.push( {
				name: name,
				logCount: this.count,
				time: time,
				oldState: oldState,
				newState: newState,
				stack: this.stack.slice(),
				action: action
			} );
			this.states[ name ] = newState;
		}
	}
};

/**
 * Log a function call. Called at the start and end of every monitored function call.
 *
 * @param {string} funcName The name of the function
 * @param {string} action The function call phase: call|return|throw
 * @param {Array|Mixed} data The call arguments, return value or exception
 */
ve.Filibuster.prototype.log = function ( funcName, action, data ) {
	var topFuncName, clonedData, time;
	if ( !this.active ) {
		return;
	}
	time = ve.now() - this.startTime;
	// Clone the data, to avoid anachronistic changes and for easy display
	clonedData = this.clonePlain( data );
	if ( action === 'call' ) {
		// Stack only contains clonedData so outside code won't mutate it.
		// Therefore we'll only need to slice it to preserve a snapshot.
		this.stack.push( { funcName: funcName, data: clonedData } );
	}
	this.count++;
	this.observe( action, time );
	this.callLog.push( {
		count: this.count,
		time: time,
		stack: this.stack.slice(),
		funcName: funcName,
		action: action,
		data: clonedData
	} );
	if ( action !== 'call' ) {
		if ( this.stack.length > 0 ) {
			topFuncName = this.stack[ this.stack.length - 1 ].funcName;
		} else {
			topFuncName = '(none)';
		}
		if ( this.stack.length === 0 || topFuncName !== funcName ) {
			throw new Error(
				'Expected funcName "' + topFuncName + '", got "' + funcName + '"'
			);
		}
		this.stack.pop();
	}
};

/**
 * Replace a reference to a function with a wrapper that performs logging.
 *
 * Note that the same function can be referenced multiple times; each reference would
 * need wrapping separately.
 *
 * @param {Object} container The container with the function as a property
 * @param {string} klassName The name of the container, for display in the logs
 * @param {string} fnName The property name of the function in the container
 * @chainable
 */

ve.Filibuster.prototype.wrapFunction = function ( container, klassName, fnName ) {
	var wrapper, fn, filibuster = this,
		fullName = ( klassName || 'unknown' ) + '.' + fnName;
	fn = container[ fnName ];
	wrapper = function () {
		var returnVal,
			fnReturned = false;
		filibuster.log( fullName, 'call', Array.prototype.slice.call( arguments ) );
		try {
			returnVal = fn.apply( this, arguments );
			fnReturned = true;
			return returnVal;
		} finally {
			if ( fnReturned ) {
				filibuster.log( fullName, 'return', returnVal );
			} else {
				filibuster.log( fullName, 'throw' );
			}
		}
	};
	wrapper.wrappedFunction = fn;
	container[ fnName ] = wrapper;
	return this;
};

/**
 * Wrap the functions in a class with wrappers that perform logging.
 *
 * @param {Object} klass The class with the function as a property
 * @param {Function[]} [blacklist] Functions that should not be wrapped
 * @chainable
 */
ve.Filibuster.prototype.wrapClass = function ( klass, blacklist ) {
	var i, len, fnName, fn, fnNames, container;
	container = klass.prototype;
	fnNames = Object.getOwnPropertyNames( container );
	for ( i = 0, len = fnNames.length; i < len; i++ ) {
		fnName = fnNames[i];
		if ( fnName === 'prototype' || fnName === 'constructor' ) {
			continue;
		}
		fn = container[fnName];
		if ( typeof fn !== 'function' || fn.wrappedFunction ) {
			continue;
		}
		if ( blacklist && blacklist.indexOf( fn ) !== -1 ) {
			continue;
		}
		this.wrapFunction( container, klass.name, fnName );
	}
	return this;
};

/**
 * Recursively wrap the functions in a namespace with wrappers that perform logging.
 *
 * @param {Object} ns The namespace whose functions should be wrapped
 * @param {string} nsName The name of the namespace, for display in logs
 * @param {Function[]} [blacklist] Functions that should not be wrapped
 * @chainable
 */
ve.Filibuster.prototype.wrapNamespace = function ( ns, nsName, blacklist ) {
	var i, len, propNames, propName, prop, isConstructor;
	propNames = Object.getOwnPropertyNames( ns );
	for ( i = 0, len = propNames.length; i < len; i++ ) {
		propName = propNames[i];
		prop = ns[propName];
		if ( blacklist && blacklist.indexOf( prop ) !== -1 ) {
			continue;
		}
		isConstructor = (
			typeof prop === 'function' &&
			!$.isEmptyObject( prop.prototype )
		);
		if ( isConstructor ) {
			this.wrapClass( prop, blacklist );
		} else if ( typeof prop === 'function' ) {
			this.wrapFunction( ns, nsName, propName );
		} else if ( $.isPlainObject( prop ) ) {
			// might be a namespace; recurse
			this.wrapNamespace( prop, nsName + '.' + propName, blacklist );
		}
	}
	return this;
};

/**
 * Start logging
 */
ve.Filibuster.prototype.start = function () {
	this.active = true;
	this.startTime = ve.now();
};

/**
 * Stop logging
 */
ve.Filibuster.prototype.stop = function () {
	this.active = false;
};

/**
 * get an HTML representation of the observations
 */
ve.Filibuster.prototype.getObservationsHtml = function () {
	function getStackHtml( stackItem ) {
		return ve.escapeHtml(
			stackItem.funcName + '( ' + stackItem.data.map( function ( x ) {
				return JSON.stringify( x );
			} ).join( ', ' ) + ' )'
		);
	}

	function getObservationHtml( observation ) {
		return ( '<tr><td>' +
			[
				observation.time.toString(),
				observation.name,
				String( observation.logCount ),
				String( observation.oldState ),
				String( observation.newState ),
				String( observation.action )
			].map( ve.escapeHtml ).join( '</td><td>' ) +
			'</td><td>' +
			observation.stack.slice().reverse().map( getStackHtml ).join( '<br>' ) +
			'</td></tr>'
		);
	}
	return (
		'<table class="ve-filibuster">' +
		'<tr><th>Time</th><th>Type</th><th>Log</th><th>Old State</th><th>New State</th><th>Action</th><th>Stack</th></tr>' +
		this.observations.map( getObservationHtml ).join( '' ) +
		'</table>'
	);
};

/**
 * Get a plain-old-data deep clone of val.
 *
 * The resulting value is easily dumpable, and will not change if val changes.
 *
 * @param {Object|string|number|undefined} val Value to analyze
 * @param {Set} [seen] Seen objects, for recursion detection
 * @return {Object|string|number|undefined} Plain old data object
 */
ve.Filibuster.prototype.clonePlain = function ( val, seen ) {
	var plainVal,
		filibuster = this;
	if ( seen === undefined ) {
		seen = new Set();
	}
	if ( Array.isArray( val ) ) {
		if ( seen.has( val ) ) {
			return '...';
		}
		seen.add( val );
		return val.map( function ( x ) {
			return filibuster.clonePlain( x, seen );
		} );
	} else if ( typeof val === 'function' ) {
		return '(function ' + val.name + ')';
	} else if ( val === null ) {
		return null;
	} else if ( val === window ) {
		return '(window)';
	} else if ( typeof val !== 'object' ) {
		return val;
	} else if ( val.constructor === ve.Range ) {
		return { 've.Range': [ val.from, val.to ] };
	} else if ( val.constructor === ve.dm.Transaction ) {
		return { 've.dm.Transaction': val.operations.map( function ( op ) {
			return filibuster.clonePlain( op );
		} ) };
	} else if ( val.constructor !== Object ) {
		// Not a plain old object
		return '(' + ( val.constructor.name || 'unknown' ) + ')';
	} else {
		if ( seen.has( val ) ) {
			return '...';
		}
		seen.add( val );
		plainVal = {};
		Object.getOwnPropertyNames( val ).forEach( function ( k ) {
			plainVal[ k ] = filibuster.clonePlain( val[ k ], seen );
		} );
		return plainVal;
	}
};
