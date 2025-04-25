/*!
 * Extremely detailed logging of function calls and state changes
 *
 * @copyright See AUTHORS.txt
 */

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
 * That means property lookups that have already happened (e.g. through
 * .bind or setTimeout in a constructor) will not pass through the wrapper.
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
	this.count = 0;
	this.states = {};
	this.observers = {};
	// Tree of call frames
	this.callTree = { children: [] };
	// Current call frame
	this.frame = this.callTree;
	// Path (index offsets) to current call frame
	this.callPath = [];
	// Index offset tree: {
	//   changes: {enter: xxx, exit: xxx }
	//   children: { index offset tree }
	// }
	this.observationTree = { children: {} };
	this.active = false;
	this.startTime = null;
};

OO.initClass( ve.Filibuster );

/**
 * Clears logs, without detaching observers
 */
ve.Filibuster.prototype.clearLogs = function () {
	this.count = 0;
	for ( const name in this.states ) {
		delete this.states[ name ];
	}
	this.observationTree.children = {};
	this.callTree.children.length = 0;
	this.frame = this.callTree;
	this.callPath.length = 0;
};

/**
 * Attaches an observer callback. The callback returns a value representing the current state,
 * which must be a string (this ensures state values are immutable, comparable with strict
 * equality and easily dumpable).
 *
 * The observer will be called before and after every function call. An observation is logged
 * every time there is a difference between the current return value and the previous one.
 *
 * @param {string} name The name of the observer, for display in the logs.
 * @param {Function} callback The callback; must return a string
 * @return {ve.Filibuster}
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
 */
ve.Filibuster.prototype.observe = function ( action ) {
	const changes = {};

	for ( const name in this.observers ) {
		const callback = this.observers[ name ];
		const oldState = this.states[ name ];
		let newState;
		try {
			newState = callback();
		} catch ( ex ) {
			newState = 'Error: ' + ex;
		}
		if ( typeof newState !== 'string' ) {
			// Be strict about the allowed types, to ensure immutability
			ve.error( 'Illegal state:', newState );
			throw new Error( 'Illegal state: ' + newState );
		}

		if ( this.states[ name ] !== newState ) {
			if ( Object.prototype.hasOwnProperty.call( this.states, name ) ) {
				// State change: write observation
				changes[ name ] = {
					oldState: oldState,
					newState: newState
				};
			}
			this.states[ name ] = newState;
		}
	}

	// Save any changes into observations tree
	if ( Object.keys( changes ).length > 0 ) {
		// Navigate along tree branch, creating as necessary
		let ptr = this.observationTree;
		for ( let j = 0, jLen = this.callPath.length; j < jLen; j++ ) {
			const offset = this.callPath[ j ];
			if ( !ptr.children ) {
				ptr.children = {};
			}
			if ( !ptr.children[ offset ] ) {
				ptr.children[ offset ] = {};
			}
			ptr = ptr.children[ offset ];
		}
		if ( !ptr.changes ) {
			ptr.changes = {};
		}
		if ( action === 'call' ) {
			ptr.changes.enter = changes;
		} else {
			ptr.changes.exit = changes;
		}
	}
};

/**
 * Log a function call. Called at the start and end of every monitored function call.
 *
 * @param {string} funcName The name of the function
 * @param {string} action The function call phase: call|return|throw
 * @param {Array} [args] The call arguments (if action === 'call')
 * @param {any} [returned] The return value (if action === 'return')
 */
ve.Filibuster.prototype.log = function ( funcName, action, args, returned ) {
	if ( !this.active ) {
		return;
	}
	const time = ve.now() - this.startTime;
	if ( action === 'call' ) {
		// Descend down the call tree (adding a new frame)
		// Store arguments as a cloned plain object, to avoid anachronistic changes and
		// for easy display.
		const parentFrame = this.frame;
		if ( !parentFrame.children ) {
			parentFrame.children = [];
		}
		this.callPath.push( parentFrame.children.length );
		this.frame = {
			count: this.count++,
			funcName: funcName,
			args: this.constructor.static.clonePlain( args ),
			// returned: xxx,
			// thrown: xxx
			start: time,
			// end: xxx,
			// children: xxx,
			parent: parentFrame
		};
		parentFrame.children.push( this.frame );
	}

	this.observe( action, time );

	if ( action === 'return' || action === 'throw' ) {
		// Check funcName, store values, ascend call tree
		if ( this.frame.funcName === undefined ) {
			throw new Error(
				'No call logged, but leaving "' + funcName + '" (' + action + ')'
			);
		}
		if ( this.frame.funcName !== funcName ) {
			throw new Error(
				'Logged call to "' + this.frame.funcName + '"' +
				' but leaving "' + funcName + '" (' + action + ')'
			);
		}
		this.frame.end = time;
		if ( action === 'return' ) {
			this.frame.returned = this.constructor.static.clonePlain( returned );
		} else if ( action === 'throw' ) {
			this.frame.thrown = true;
		}

		this.frame = this.frame.parent;
		this.callPath.pop();
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
 * @return {ve.Filibuster}
 * @chainable
 */
ve.Filibuster.prototype.wrapFunction = function ( container, klassName, fnName ) {
	const filibuster = this,
		fullName = ( klassName || 'unknown' ) + '.' + fnName;
	const fn = container[ fnName ];
	const wrapper = function () {
		let returnVal,
			fnReturned = false;
		filibuster.log( fullName, 'call', Array.prototype.slice.call( arguments ), undefined );
		try {
			returnVal = fn.apply( this, arguments );
			fnReturned = true;
			filibuster.log( fullName, 'return', undefined, returnVal );
			return returnVal;
		} finally {
			if ( !fnReturned ) {
				// Can't easily get the error without affecting the call stack
				filibuster.log( fullName, 'throw', undefined, undefined );
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
 * @param {Function[]} [nowrapList] Functions that should not be wrapped
 * @return {ve.Filibuster}
 * @chainable
 */
ve.Filibuster.prototype.wrapClass = function ( klass, nowrapList ) {
	const container = klass.prototype;
	const fnNames = Object.getOwnPropertyNames( container );
	for ( let i = 0, len = fnNames.length; i < len; i++ ) {
		const fnName = fnNames[ i ];
		if ( fnName === 'prototype' || fnName === 'constructor' ) {
			continue;
		}
		const fn = container[ fnName ];
		if ( typeof fn !== 'function' || fn.wrappedFunction ) {
			continue;
		}
		if ( nowrapList && nowrapList.includes( fn ) ) {
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
 * @param {Function[]} [nowrapList] Functions that should not be wrapped
 * @return {ve.Filibuster}
 * @chainable
 */
ve.Filibuster.prototype.wrapNamespace = function ( ns, nsName, nowrapList ) {
	const propNames = Object.getOwnPropertyNames( ns );
	for ( let i = 0, len = propNames.length; i < len; i++ ) {
		const propName = propNames[ i ];
		const prop = ns[ propName ];
		if ( nowrapList && nowrapList.includes( prop ) ) {
			continue;
		}
		const isConstructor = (
			typeof prop === 'function' &&
			!ve.isEmptyObject( prop.prototype )
		);
		if ( isConstructor ) {
			this.wrapClass( prop, nowrapList );
		} else if ( typeof prop === 'function' ) {
			this.wrapFunction( ns, nsName, propName );
		} else if ( $.isPlainObject( prop ) ) {
			// Might be a namespace; recurse
			this.wrapNamespace( prop, nsName + '.' + propName, nowrapList );
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
 * Get an HTML representation of part of the call tree, opened at each observation
 *
 * In general, building HTML fragments like this is ugly; but this turns out to give
 * better performance if the HTML representation is really large.
 *
 * @param {number[]} [branchPath] Path to the part of the tree to represent
 * @return {string} HTML representation
 */
ve.Filibuster.prototype.getObservationsHtml = function ( branchPath ) {
	function showArgs( args ) {
		return '<b>(</b>' + ve.escapeHtml( args.map( ( arg ) => JSON.stringify( arg ) ).join( ', ' ) ) + '<b>)</b>';
	}

	function showVal( val ) {
		return ve.escapeHtml( JSON.stringify( val ) );
	}

	function showChanges( changes, phase ) {
		return (
			( phase === 'enter' ? '<hr>' : '' ) +
			'<div class="ve-filibuster-changes">' +
			Object.keys( changes ).map( ( name ) => (
				'<b>' + ve.escapeHtml( name + ' old' ) + '</b><br>' +
					ve.escapeHtml( changes[ name ].oldState ) + '<br>' +
					'<b>' + ve.escapeHtml( name + ' new' ) + '</b><br>' +
					ve.escapeHtml( changes[ name ].newState )
			) ).join( '<br>' ) +
			'</div>' +
			( phase === 'exit' ? '<hr>' : '' )
		);
	}

	function showCallOpen( frame ) {
		return (
			'<b>' + frame.count + '</b> ' +
			'(' + frame.start.toFixed( 2 ) + 'ms-' + frame.end.toFixed( 2 ) + 'ms) ' +
			'<b>' + ve.escapeHtml( frame.funcName ) + '</b>' +
			showArgs( frame.args )
		);
	}

	function showCallClose( frame ) {
		return (
			'<b>exit ' + ve.escapeHtml( frame.funcName ) + '</b>' +
			'--->' +
			( frame.thrown ? 'thrown' : showVal( frame.returned ) )
		);
	}

	function showCallSkip( frame ) {
		return (
			'<b>' + frame.count + '</b> ' +
			'(' + frame.start.toFixed( 2 ) + 'ms-' + frame.end.toFixed( 2 ) + 'ms) ' +
			'<b>' + ve.escapeHtml( frame.funcName ) + '</b>' +
			showArgs( frame.args ) +
			'<span />' +
			'--->' +
			( frame.thrown ? 'thrown' : showVal( frame.returned ) )
		);
	}

	function getFragments( frames, observations, path ) {
		const html = [];
		html.push( '<ul>' );
		for ( let j = 0, jLen = frames.length; j < jLen; j++ ) {
			const frame = frames[ j ];
			const observation = observations[ j ];
			if ( observation && observation.changes && observation.changes.enter ) {
				html.push( showChanges( observation.changes.enter, 'enter' ) );
			}
			const expanded = observation && observation.children;
			const expandable = !expanded && frame.children && frame.children.length > 0;
			html.push( '<li class="ve-filibuster-frame' );
			if ( expandable ) {
				html.push( ' ve-filibuster-frame-expandable' );
			}
			html.push(
				'" data-ve-filibuster-frame="' +
				ve.escapeHtml( JSON.stringify( path.concat( j ) ) ) + '">'
			);
			if ( expanded ) {
				html.push( showCallOpen( frame ) );
				html.push.apply( html, getFragments(
					frame.children || [],
					observation.children,
					path.concat( j )
				) );
				html.push( showCallClose( frame ) );
			} else {
				html.push( showCallSkip( frame ) );
			}
			html.push( '</li>' );
			if ( observation && observation.changes && observation.changes.exit ) {
				html.push( showChanges( observation.changes.exit, 'exit' ) );
			}
		}
		html.push( '</ul>' );
		return html;
	}

	let callTree = this.callTree;
	let observationTree = this.observationTree;
	// Walk to the specified part of the tree
	if ( !branchPath ) {
		branchPath = [];
	}
	for ( let i = 0, iLen = branchPath.length; i < iLen; i++ ) {
		callTree = callTree.children[ branchPath[ i ] ];
		if ( observationTree && observationTree.children ) {
			observationTree = observationTree.children[ branchPath[ i ] ];
		} else {
			// No observations on this branch
			observationTree = undefined;
		}
	}

	return getFragments(
		callTree.children || [],
		( observationTree && observationTree.children ) || {},
		branchPath
	).join( '' );
};

/* Static methods */

/**
 * Get a plain-old-data deep clone of val.
 *
 * The resulting value is easily dumpable, and will not change if val changes.
 *
 * @param {Object|string|number|undefined|null} val Value to analyze
 * @param {Set} [seen] Seen objects, for recursion detection
 * @return {Object|string|number|null} Plain old data object
 */
ve.Filibuster.static.clonePlain = function ( val, seen ) {
	if ( seen === undefined ) {
		seen = new Set();
	}
	if ( Array.isArray( val ) ) {
		if ( seen.has( val ) ) {
			return '…';
		}
		seen.add( val );
		return val.map( ( x ) => this.clonePlain( x, seen ) );
	} else if ( typeof val === 'function' ) {
		return '(function ' + val.name + ')';
	} else if ( typeof val === 'undefined' ) {
		return '(undefined)';
	} else if ( val === null ) {
		return null;
	} else if ( val === window ) {
		return '(window)';
	} else if ( typeof val !== 'object' ) {
		return val;
	} else if ( val.constructor === ve.Range ) {
		return { 've.Range': [ val.from, val.to ] };
	} else if ( val.constructor === ve.dm.Transaction ) {
		return { 've.dm.Transaction': val.operations.map( ( op ) => this.clonePlain( op ) ) };
	} else if ( val instanceof ve.dm.Selection ) {
		return { 've.dm.Selection': val.getDescription() };
	} else if ( val.constructor === ve.dm.AnnotationSet ) {
		return {
			've.dm.AnnotationSet': val.getStore()
				.values( val.getHashes() )
				.map( ( annotation ) => annotation.name )
		};
	} else if ( val.constructor !== Object ) {
		// Not a plain old object
		return '(' + ( val.constructor.name || 'unknown' ) + ')';
	} else {
		if ( seen.has( val ) ) {
			return '…';
		}
		seen.add( val );
		const plainVal = {};
		Object.getOwnPropertyNames( val ).forEach( ( k ) => {
			plainVal[ k ] = this.clonePlain( val[ k ], seen );
		} );
		return plainVal;
	}
};
