( function ( ve ) {
var module = undefined, $ = { isPlainObject: function () { throw new Error( 'No $.isPlainObject because no jQuery' ); } };
ve.dm = {};
/*!
 * OOjs v2.1.0 optimised for jQuery
 * https://www.mediawiki.org/wiki/OOjs
 *
 * Copyright 2011-2017 OOjs Team and other contributors.
 * Released under the MIT license
 * https://oojs.mit-license.org
 *
 * Date: 2017-05-30T22:56:52Z
 */
( function ( global ) {

'use strict';

/* exported toString */
var
	/**
	 * Namespace for all classes, static methods and static properties.
	 * @class OO
	 * @singleton
	 */
	oo = {},
	// Optimisation: Local reference to Object.prototype.hasOwnProperty
	hasOwn = oo.hasOwnProperty,
	toString = oo.toString;

/* Class Methods */

/**
 * Utility to initialize a class for OO inheritance.
 *
 * Currently this just initializes an empty static object.
 *
 * @param {Function} fn
 */
oo.initClass = function ( fn ) {
	fn.static = fn.static || {};
};

/**
 * Inherit from prototype to another using Object#create.
 *
 * Beware: This redefines the prototype, call before setting your prototypes.
 *
 * Beware: This redefines the prototype, can only be called once on a function.
 * If called multiple times on the same function, the previous prototype is lost.
 * This is how prototypal inheritance works, it can only be one straight chain
 * (just like classical inheritance in PHP for example). If you need to work with
 * multiple constructors consider storing an instance of the other constructor in a
 * property instead, or perhaps use a mixin (see OO.mixinClass).
 *
 *     function Thing() {}
 *     Thing.prototype.exists = function () {};
 *
 *     function Person() {
 *         Person.super.apply( this, arguments );
 *     }
 *     OO.inheritClass( Person, Thing );
 *     Person.static.defaultEyeCount = 2;
 *     Person.prototype.walk = function () {};
 *
 *     function Jumper() {
 *         Jumper.super.apply( this, arguments );
 *     }
 *     OO.inheritClass( Jumper, Person );
 *     Jumper.prototype.jump = function () {};
 *
 *     Jumper.static.defaultEyeCount === 2;
 *     var x = new Jumper();
 *     x.jump();
 *     x.walk();
 *     x instanceof Thing && x instanceof Person && x instanceof Jumper;
 *
 * @param {Function} targetFn
 * @param {Function} originFn
 * @throws {Error} If target already inherits from origin
 */
oo.inheritClass = function ( targetFn, originFn ) {
	var targetConstructor;

	if ( !originFn ) {
		throw new Error( 'inheritClass: Origin is not a function (actually ' + originFn + ')' );
	}
	if ( targetFn.prototype instanceof originFn ) {
		throw new Error( 'inheritClass: Target already inherits from origin' );
	}

	targetConstructor = targetFn.prototype.constructor;

	// Using ['super'] instead of .super because 'super' is not supported
	// by IE 8 and below (bug 63303).
	// Provide .parent as alias for code supporting older browsers which
	// allows people to comply with their style guide.
	// eslint-disable-next-line dot-notation
	targetFn[ 'super' ] = targetFn.parent = originFn;

	targetFn.prototype = Object.create( originFn.prototype, {
		// Restore constructor property of targetFn
		constructor: {
			value: targetConstructor,
			enumerable: false,
			writable: true,
			configurable: true
		}
	} );

	// Extend static properties - always initialize both sides
	oo.initClass( originFn );
	targetFn.static = Object.create( originFn.static );
};

/**
 * Copy over *own* prototype properties of a mixin.
 *
 * The 'constructor' (whether implicit or explicit) is not copied over.
 *
 * This does not create inheritance to the origin. If you need inheritance,
 * use OO.inheritClass instead.
 *
 * Beware: This can redefine a prototype property, call before setting your prototypes.
 *
 * Beware: Don't call before OO.inheritClass.
 *
 *     function Foo() {}
 *     function Context() {}
 *
 *     // Avoid repeating this code
 *     function ContextLazyLoad() {}
 *     ContextLazyLoad.prototype.getContext = function () {
 *         if ( !this.context ) {
 *             this.context = new Context();
 *         }
 *         return this.context;
 *     };
 *
 *     function FooBar() {}
 *     OO.inheritClass( FooBar, Foo );
 *     OO.mixinClass( FooBar, ContextLazyLoad );
 *
 * @param {Function} targetFn
 * @param {Function} originFn
 */
oo.mixinClass = function ( targetFn, originFn ) {
	var key;

	if ( !originFn ) {
		throw new Error( 'mixinClass: Origin is not a function (actually ' + originFn + ')' );
	}

	// Copy prototype properties
	for ( key in originFn.prototype ) {
		if ( key !== 'constructor' && hasOwn.call( originFn.prototype, key ) ) {
			targetFn.prototype[ key ] = originFn.prototype[ key ];
		}
	}

	// Copy static properties - always initialize both sides
	oo.initClass( targetFn );
	if ( originFn.static ) {
		for ( key in originFn.static ) {
			if ( hasOwn.call( originFn.static, key ) ) {
				targetFn.static[ key ] = originFn.static[ key ];
			}
		}
	} else {
		oo.initClass( originFn );
	}
};

/**
 * Test whether one class is a subclass of another, without instantiating it.
 *
 * Every class is considered a subclass of Object and of itself.
 *
 * @param {Function} testFn The class to be tested
 * @param {Function} baseFn The base class
 * @return {boolean} Whether testFn is a subclass of baseFn (or equal to it)
 */
oo.isSubclass = function ( testFn, baseFn ) {
	return testFn === baseFn || testFn.prototype instanceof baseFn;
};

/* Object Methods */

/**
 * Get a deeply nested property of an object using variadic arguments, protecting against
 * undefined property errors.
 *
 * `quux = OO.getProp( obj, 'foo', 'bar', 'baz' );` is equivalent to `quux = obj.foo.bar.baz;`
 * except that the former protects against JS errors if one of the intermediate properties
 * is undefined. Instead of throwing an error, this function will return undefined in
 * that case.
 *
 * @param {Object} obj
 * @param {...Mixed} [keys]
 * @return {Object|undefined} obj[arguments[1]][arguments[2]].... or undefined
 */
oo.getProp = function ( obj ) {
	var i,
		retval = obj;
	for ( i = 1; i < arguments.length; i++ ) {
		if ( retval === undefined || retval === null ) {
			// Trying to access a property of undefined or null causes an error
			return undefined;
		}
		retval = retval[ arguments[ i ] ];
	}
	return retval;
};

/**
 * Set a deeply nested property of an object using variadic arguments, protecting against
 * undefined property errors.
 *
 * `oo.setProp( obj, 'foo', 'bar', 'baz' );` is equivalent to `obj.foo.bar = baz;` except that
 * the former protects against JS errors if one of the intermediate properties is
 * undefined. Instead of throwing an error, undefined intermediate properties will be
 * initialized to an empty object. If an intermediate property is not an object, or if obj itself
 * is not an object, this function will silently abort.
 *
 * @param {Object} obj
 * @param {...Mixed} [keys]
 * @param {Mixed} [value]
 */
oo.setProp = function ( obj ) {
	var i,
		prop = obj;
	if ( Object( obj ) !== obj || arguments.length < 2 ) {
		return;
	}
	for ( i = 1; i < arguments.length - 2; i++ ) {
		if ( prop[ arguments[ i ] ] === undefined ) {
			prop[ arguments[ i ] ] = {};
		}
		if ( Object( prop[ arguments[ i ] ] ) !== prop[ arguments[ i ] ] ) {
			return;
		}
		prop = prop[ arguments[ i ] ];
	}
	prop[ arguments[ arguments.length - 2 ] ] = arguments[ arguments.length - 1 ];
};

/**
 * Delete a deeply nested property of an object using variadic arguments, protecting against
 * undefined property errors, and deleting resulting empty objects.
 *
 * @param {Object} obj
 * @param {...Mixed} [keys]
 */
oo.deleteProp = function ( obj ) {
	var i,
		prop = obj,
		props = [ prop ];
	if ( Object( obj ) !== obj || arguments.length < 2 ) {
		return;
	}
	for ( i = 1; i < arguments.length - 1; i++ ) {
		if ( prop[ arguments[ i ] ] === undefined || Object( prop[ arguments[ i ] ] ) !== prop[ arguments[ i ] ] ) {
			return;
		}
		prop = prop[ arguments[ i ] ];
		props.push( prop );
	}
	delete prop[ arguments[ i ] ];
	// Walk back through props removing any plain empty objects
	while ( ( prop = props.pop() ) && oo.isPlainObject( prop ) && !Object.keys( prop ).length ) {
		delete props[ props.length - 1 ][ arguments[ props.length ] ];
	}
};

/**
 * Create a new object that is an instance of the same
 * constructor as the input, inherits from the same object
 * and contains the same own properties.
 *
 * This makes a shallow non-recursive copy of own properties.
 * To create a recursive copy of plain objects, use #copy.
 *
 *     var foo = new Person( mom, dad );
 *     foo.setAge( 21 );
 *     var foo2 = OO.cloneObject( foo );
 *     foo.setAge( 22 );
 *
 *     // Then
 *     foo2 !== foo; // true
 *     foo2 instanceof Person; // true
 *     foo2.getAge(); // 21
 *     foo.getAge(); // 22
 *
 * @param {Object} origin
 * @return {Object} Clone of origin
 */
oo.cloneObject = function ( origin ) {
	var key, r;

	r = Object.create( origin.constructor.prototype );

	for ( key in origin ) {
		if ( hasOwn.call( origin, key ) ) {
			r[ key ] = origin[ key ];
		}
	}

	return r;
};

/**
 * Get an array of all property values in an object.
 *
 * @param {Object} obj Object to get values from
 * @return {Array} List of object values
 */
oo.getObjectValues = function ( obj ) {
	var key, values;

	if ( obj !== Object( obj ) ) {
		throw new TypeError( 'Called on non-object' );
	}

	values = [];
	for ( key in obj ) {
		if ( hasOwn.call( obj, key ) ) {
			values[ values.length ] = obj[ key ];
		}
	}

	return values;
};

/**
 * Use binary search to locate an element in a sorted array.
 *
 * searchFunc is given an element from the array. `searchFunc(elem)` must return a number
 * above 0 if the element we're searching for is to the right of (has a higher index than) elem,
 * below 0 if it is to the left of elem, or zero if it's equal to elem.
 *
 * To search for a specific value with a comparator function (a `function cmp(a,b)` that returns
 * above 0 if `a > b`, below 0 if `a < b`, and 0 if `a == b`), you can use
 * `searchFunc = cmp.bind( null, value )`.
 *
 * @param {Array} arr Array to search in
 * @param {Function} searchFunc Search function
 * @param {boolean} [forInsertion] If not found, return index where val could be inserted
 * @return {number|null} Index where val was found, or null if not found
 */
oo.binarySearch = function ( arr, searchFunc, forInsertion ) {
	var mid, cmpResult,
		left = 0,
		right = arr.length;
	while ( left < right ) {
		// Equivalent to Math.floor( ( left + right ) / 2 ) but much faster
		// eslint-disable-next-line no-bitwise
		mid = ( left + right ) >> 1;
		cmpResult = searchFunc( arr[ mid ] );
		if ( cmpResult < 0 ) {
			right = mid;
		} else if ( cmpResult > 0 ) {
			left = mid + 1;
		} else {
			return mid;
		}
	}
	return forInsertion ? right : null;
};

/**
 * Recursively compare properties between two objects.
 *
 * A false result may be caused by property inequality or by properties in one object missing from
 * the other. An asymmetrical test may also be performed, which checks only that properties in the
 * first object are present in the second object, but not the inverse.
 *
 * If either a or b is null or undefined it will be treated as an empty object.
 *
 * @param {Object|undefined|null} a First object to compare
 * @param {Object|undefined|null} b Second object to compare
 * @param {boolean} [asymmetrical] Whether to check only that a's values are equal to b's
 *  (i.e. a is a subset of b)
 * @return {boolean} If the objects contain the same values as each other
 */
oo.compare = function ( a, b, asymmetrical ) {
	var aValue, bValue, aType, bType, k;

	if ( a === b ) {
		return true;
	}

	a = a || {};
	b = b || {};

	if ( typeof a.nodeType === 'number' && typeof a.isEqualNode === 'function' ) {
		return a.isEqualNode( b );
	}

	for ( k in a ) {
		if ( !hasOwn.call( a, k ) || a[ k ] === undefined || a[ k ] === b[ k ] ) {
			// Support es3-shim: Without the hasOwn filter, comparing [] to {} will be false in ES3
			// because the shimmed "forEach" is enumerable and shows up in Array but not Object.
			// Also ignore undefined values, because there is no conceptual difference between
			// a key that is absent and a key that is present but whose value is undefined.
			continue;
		}

		aValue = a[ k ];
		bValue = b[ k ];
		aType = typeof aValue;
		bType = typeof bValue;
		if ( aType !== bType ||
			(
				( aType === 'string' || aType === 'number' || aType === 'boolean' ) &&
				aValue !== bValue
			) ||
			( aValue === Object( aValue ) && !oo.compare( aValue, bValue, true ) ) ) {
			return false;
		}
	}
	// If the check is not asymmetrical, recursing with the arguments swapped will verify our result
	return asymmetrical ? true : oo.compare( b, a, true );
};

/**
 * Create a plain deep copy of any kind of object.
 *
 * Copies are deep, and will either be an object or an array depending on `source`.
 *
 * @param {Object} source Object to copy
 * @param {Function} [leafCallback] Applied to leaf values after they are cloned but before they are added to the clone
 * @param {Function} [nodeCallback] Applied to all values before they are cloned.  If the nodeCallback returns a value other than undefined, the returned value is used instead of attempting to clone.
 * @return {Object} Copy of source object
 */
oo.copy = function ( source, leafCallback, nodeCallback ) {
	var key, destination;

	if ( nodeCallback ) {
		// Extensibility: check before attempting to clone source.
		destination = nodeCallback( source );
		if ( destination !== undefined ) {
			return destination;
		}
	}

	if ( Array.isArray( source ) ) {
		// Array (fall through)
		destination = new Array( source.length );
	} else if ( source && typeof source.clone === 'function' ) {
		// Duck type object with custom clone method
		return leafCallback ? leafCallback( source.clone() ) : source.clone();
	} else if ( source && typeof source.cloneNode === 'function' ) {
		// DOM Node
		return leafCallback ?
			leafCallback( source.cloneNode( true ) ) :
			source.cloneNode( true );
	} else if ( oo.isPlainObject( source ) ) {
		// Plain objects (fall through)
		destination = {};
	} else {
		// Non-plain objects (incl. functions) and primitive values
		return leafCallback ? leafCallback( source ) : source;
	}

	// source is an array or a plain object
	for ( key in source ) {
		destination[ key ] = oo.copy( source[ key ], leafCallback, nodeCallback );
	}

	// This is an internal node, so we don't apply the leafCallback.
	return destination;
};

/**
 * Generate a hash of an object based on its name and data.
 *
 * Performance optimization: <http://jsperf.com/ve-gethash-201208#/toJson_fnReplacerIfAoForElse>
 *
 * To avoid two objects with the same values generating different hashes, we utilize the replacer
 * argument of JSON.stringify and sort the object by key as it's being serialized. This may or may
 * not be the fastest way to do this; we should investigate this further.
 *
 * Objects and arrays are hashed recursively. When hashing an object that has a .getHash()
 * function, we call that function and use its return value rather than hashing the object
 * ourselves. This allows classes to define custom hashing.
 *
 * @param {Object} val Object to generate hash for
 * @return {string} Hash of object
 */
oo.getHash = function ( val ) {
	return JSON.stringify( val, oo.getHash.keySortReplacer );
};

/**
 * Sort objects by key (helper function for OO.getHash).
 *
 * This is a callback passed into JSON.stringify.
 *
 * @method getHash_keySortReplacer
 * @param {string} key Property name of value being replaced
 * @param {Mixed} val Property value to replace
 * @return {Mixed} Replacement value
 */
oo.getHash.keySortReplacer = function ( key, val ) {
	var normalized, keys, i, len;
	if ( val && typeof val.getHashObject === 'function' ) {
		// This object has its own custom hash function, use it
		val = val.getHashObject();
	}
	if ( !Array.isArray( val ) && Object( val ) === val ) {
		// Only normalize objects when the key-order is ambiguous
		// (e.g. any object not an array).
		normalized = {};
		keys = Object.keys( val ).sort();
		i = 0;
		len = keys.length;
		for ( ; i < len; i += 1 ) {
			normalized[ keys[ i ] ] = val[ keys[ i ] ];
		}
		return normalized;
	} else {
		// Primitive values and arrays get stable hashes
		// by default. Lets those be stringified as-is.
		return val;
	}
};

/**
 * Get the unique values of an array, removing duplicates
 *
 * @param {Array} arr Array
 * @return {Array} Unique values in array
 */
oo.unique = function ( arr ) {
	return arr.reduce( function ( result, current ) {
		if ( result.indexOf( current ) === -1 ) {
			result.push( current );
		}
		return result;
	}, [] );
};

/**
 * Compute the union (duplicate-free merge) of a set of arrays.
 *
 * Arrays values must be convertable to object keys (strings).
 *
 * By building an object (with the values for keys) in parallel with
 * the array, a new item's existence in the union can be computed faster.
 *
 * @param {...Array} arrays Arrays to union
 * @return {Array} Union of the arrays
 */
oo.simpleArrayUnion = function () {
	var i, ilen, arr, j, jlen,
		obj = {},
		result = [];

	for ( i = 0, ilen = arguments.length; i < ilen; i++ ) {
		arr = arguments[ i ];
		for ( j = 0, jlen = arr.length; j < jlen; j++ ) {
			if ( !obj[ arr[ j ] ] ) {
				obj[ arr[ j ] ] = true;
				result.push( arr[ j ] );
			}
		}
	}

	return result;
};

/**
 * Combine arrays (intersection or difference).
 *
 * An intersection checks the item exists in 'b' while difference checks it doesn't.
 *
 * Arrays values must be convertable to object keys (strings).
 *
 * By building an object (with the values for keys) of 'b' we can
 * compute the result faster.
 *
 * @private
 * @param {Array} a First array
 * @param {Array} b Second array
 * @param {boolean} includeB Whether to items in 'b'
 * @return {Array} Combination (intersection or difference) of arrays
 */
function simpleArrayCombine( a, b, includeB ) {
	var i, ilen, isInB,
		bObj = {},
		result = [];

	for ( i = 0, ilen = b.length; i < ilen; i++ ) {
		bObj[ b[ i ] ] = true;
	}

	for ( i = 0, ilen = a.length; i < ilen; i++ ) {
		isInB = !!bObj[ a[ i ] ];
		if ( isInB === includeB ) {
			result.push( a[ i ] );
		}
	}

	return result;
}

/**
 * Compute the intersection of two arrays (items in both arrays).
 *
 * Arrays values must be convertable to object keys (strings).
 *
 * @param {Array} a First array
 * @param {Array} b Second array
 * @return {Array} Intersection of arrays
 */
oo.simpleArrayIntersection = function ( a, b ) {
	return simpleArrayCombine( a, b, true );
};

/**
 * Compute the difference of two arrays (items in 'a' but not 'b').
 *
 * Arrays values must be convertable to object keys (strings).
 *
 * @param {Array} a First array
 * @param {Array} b Second array
 * @return {Array} Intersection of arrays
 */
oo.simpleArrayDifference = function ( a, b ) {
	return simpleArrayCombine( a, b, false );
};

/* global $ */

oo.isPlainObject = $.isPlainObject;

/* global hasOwn */

( function () {

	/**
	 * @class OO.EventEmitter
	 *
	 * @constructor
	 */
	oo.EventEmitter = function OoEventEmitter() {
		// Properties

		/**
		 * Storage of bound event handlers by event name.
		 *
		 * @property
		 */
		this.bindings = {};
	};

	oo.initClass( oo.EventEmitter );

	/* Private helper functions */

	/**
	 * Validate a function or method call in a context
	 *
	 * For a method name, check that it names a function in the context object
	 *
	 * @private
	 * @param {Function|string} method Function or method name
	 * @param {Mixed} context The context of the call
	 * @throws {Error} A method name is given but there is no context
	 * @throws {Error} In the context object, no property exists with the given name
	 * @throws {Error} In the context object, the named property is not a function
	 */
	function validateMethod( method, context ) {
		// Validate method and context
		if ( typeof method === 'string' ) {
			// Validate method
			if ( context === undefined || context === null ) {
				throw new Error( 'Method name "' + method + '" has no context.' );
			}
			if ( typeof context[ method ] !== 'function' ) {
				// Technically the property could be replaced by a function before
				// call time. But this probably signals a typo.
				throw new Error( 'Property "' + method + '" is not a function' );
			}
		} else if ( typeof method !== 'function' ) {
			throw new Error( 'Invalid callback. Function or method name expected.' );
		}
	}

	/**
	 * @private
	 * @param {OO.EventEmitter} ee
	 * @param {Function|string} method Function or method name
	 * @param {Object} binding
	 */
	function addBinding( ee, event, binding ) {
		var bindings;
		// Auto-initialize bindings list
		if ( hasOwn.call( ee.bindings, event ) ) {
			bindings = ee.bindings[ event ];
		} else {
			bindings = ee.bindings[ event ] = [];
		}
		// Add binding
		bindings.push( binding );
	}

	/* Methods */

	/**
	 * Add a listener to events of a specific event.
	 *
	 * The listener can be a function or the string name of a method; if the latter, then the
	 * name lookup happens at the time the listener is called.
	 *
	 * @param {string} event Type of event to listen to
	 * @param {Function|string} method Function or method name to call when event occurs
	 * @param {Array} [args] Arguments to pass to listener, will be prepended to emitted arguments
	 * @param {Object} [context=null] Context object for function or method call
	 * @throws {Error} Listener argument is not a function or a valid method name
	 * @chainable
	 */
	oo.EventEmitter.prototype.on = function ( event, method, args, context ) {
		validateMethod( method, context );

		// Ensure consistent object shape (optimisation)
		addBinding( this, event, {
			method: method,
			args: args,
			context: ( arguments.length < 4 ) ? null : context,
			once: false
		} );
		return this;
	};

	/**
	 * Add a one-time listener to a specific event.
	 *
	 * @param {string} event Type of event to listen to
	 * @param {Function} listener Listener to call when event occurs
	 * @chainable
	 */
	oo.EventEmitter.prototype.once = function ( event, listener ) {
		validateMethod( listener );

		// Ensure consistent object shape (optimisation)
		addBinding( this, event, {
			method: listener,
			args: undefined,
			context: null,
			once: true
		} );
		return this;
	};

	/**
	 * Remove a specific listener from a specific event.
	 *
	 * @param {string} event Type of event to remove listener from
	 * @param {Function|string} [method] Listener to remove. Must be in the same form as was passed
	 * to "on". Omit to remove all listeners.
	 * @param {Object} [context=null] Context object function or method call
	 * @chainable
	 * @throws {Error} Listener argument is not a function or a valid method name
	 */
	oo.EventEmitter.prototype.off = function ( event, method, context ) {
		var i, bindings;

		if ( arguments.length === 1 ) {
			// Remove all bindings for event
			delete this.bindings[ event ];
			return this;
		}

		validateMethod( method, context );

		if ( !hasOwn.call( this.bindings, event ) || !this.bindings[ event ].length ) {
			// No matching bindings
			return this;
		}

		// Default to null context
		if ( arguments.length < 3 ) {
			context = null;
		}

		// Remove matching handlers
		bindings = this.bindings[ event ];
		i = bindings.length;
		while ( i-- ) {
			if ( bindings[ i ].method === method && bindings[ i ].context === context ) {
				bindings.splice( i, 1 );
			}
		}

		// Cleanup if now empty
		if ( bindings.length === 0 ) {
			delete this.bindings[ event ];
		}
		return this;
	};

	/**
	 * Emit an event.
	 *
	 * @param {string} event Type of event
	 * @param {...Mixed} args First in a list of variadic arguments passed to event handler (optional)
	 * @return {boolean} Whether the event was handled by at least one listener
	 */
	oo.EventEmitter.prototype.emit = function ( event ) {
		var args = [],
			i, len, binding, bindings, method;

		if ( hasOwn.call( this.bindings, event ) ) {
			// Slicing ensures that we don't get tripped up by event handlers that add/remove bindings
			bindings = this.bindings[ event ].slice();
			for ( i = 1, len = arguments.length; i < len; i++ ) {
				args.push( arguments[ i ] );
			}
			for ( i = 0, len = bindings.length; i < len; i++ ) {
				binding = bindings[ i ];
				if ( typeof binding.method === 'string' ) {
					// Lookup method by name (late binding)
					method = binding.context[ binding.method ];
				} else {
					method = binding.method;
				}
				if ( binding.once ) {
					// Must unbind before calling method to avoid
					// any nested triggers.
					this.off( event, method );
				}
				method.apply(
					binding.context,
					binding.args ? binding.args.concat( args ) : args
				);
			}
			return true;
		}
		return false;
	};

	/**
	 * Connect event handlers to an object.
	 *
	 * @param {Object} context Object to call methods on when events occur
	 * @param {Object.<string,string>|Object.<string,Function>|Object.<string,Array>} methods List of
	 *  event bindings keyed by event name containing either method names, functions or arrays containing
	 *  method name or function followed by a list of arguments to be passed to callback before emitted
	 *  arguments.
	 * @chainable
	 */
	oo.EventEmitter.prototype.connect = function ( context, methods ) {
		var method, args, event;

		for ( event in methods ) {
			method = methods[ event ];
			// Allow providing additional args
			if ( Array.isArray( method ) ) {
				args = method.slice( 1 );
				method = method[ 0 ];
			} else {
				args = [];
			}
			// Add binding
			this.on( event, method, args, context );
		}
		return this;
	};

	/**
	 * Disconnect event handlers from an object.
	 *
	 * @param {Object} context Object to disconnect methods from
	 * @param {Object.<string,string>|Object.<string,Function>|Object.<string,Array>} [methods] List of
	 *  event bindings keyed by event name. Values can be either method names, functions or arrays
	 *  containing a method name.
	 *  NOTE: To allow matching call sites with connect(), array values are allowed to contain the
	 *  parameters as well, but only the method name is used to find bindings. Tt is discouraged to
	 *  have multiple bindings for the same event to the same listener, but if used (and only the
	 *  parameters vary), disconnecting one variation of (event name, event listener, parameters)
	 *  will disconnect other variations as well.
	 * @chainable
	 */
	oo.EventEmitter.prototype.disconnect = function ( context, methods ) {
		var i, event, method, bindings;

		if ( methods ) {
			// Remove specific connections to the context
			for ( event in methods ) {
				method = methods[ event ];
				if ( Array.isArray( method ) ) {
					method = method[ 0 ];
				}
				this.off( event, method, context );
			}
		} else {
			// Remove all connections to the context
			for ( event in this.bindings ) {
				bindings = this.bindings[ event ];
				i = bindings.length;
				while ( i-- ) {
					// bindings[i] may have been removed by the previous step's
					// this.off so check it still exists
					if ( bindings[ i ] && bindings[ i ].context === context ) {
						this.off( event, bindings[ i ].method, context );
					}
				}
			}
		}

		return this;
	};

}() );

( function () {

	/**
	 * Contain and manage a list of OO.EventEmitter items.
	 *
	 * Aggregates and manages their events collectively.
	 *
	 * This mixin must be used in a class that also mixes in OO.EventEmitter.
	 *
	 * @abstract
	 * @class OO.EmitterList
	 * @constructor
	 */
	oo.EmitterList = function OoEmitterList() {
		this.items = [];
		this.aggregateItemEvents = {};
	};

	/* Events */

	/**
	 * Item has been added
	 *
	 * @event add
	 * @param {OO.EventEmitter} item Added item
	 * @param {number} index Index items were added at
	 */

	/**
	 * Item has been moved to a new index
	 *
	 * @event move
	 * @param {OO.EventEmitter} item Moved item
	 * @param {number} index Index item was moved to
	 * @param {number} oldIndex The original index the item was in
	 */

	/**
	 * Item has been removed
	 *
	 * @event remove
	 * @param {OO.EventEmitter} item Removed item
	 * @param {number} index Index the item was removed from
	 */

	/**
	 * @event clear The list has been cleared of items
	 */

	/* Methods */

	/**
	 * Normalize requested index to fit into the bounds of the given array.
	 *
	 * @private
	 * @static
	 * @param {Array} arr Given array
	 * @param {number|undefined} index Requested index
	 * @return {number} Normalized index
	 */
	function normalizeArrayIndex( arr, index ) {
		return ( index === undefined || index < 0 || index >= arr.length ) ?
			arr.length :
			index;
	}

	/**
	 * Get all items.
	 *
	 * @return {OO.EventEmitter[]} Items in the list
	 */
	oo.EmitterList.prototype.getItems = function () {
		return this.items.slice( 0 );
	};

	/**
	 * Get the index of a specific item.
	 *
	 * @param {OO.EventEmitter} item Requested item
	 * @return {number} Index of the item
	 */
	oo.EmitterList.prototype.getItemIndex = function ( item ) {
		return this.items.indexOf( item );
	};

	/**
	 * Get number of items.
	 *
	 * @return {number} Number of items in the list
	 */
	oo.EmitterList.prototype.getItemCount = function () {
		return this.items.length;
	};

	/**
	 * Check if a list contains no items.
	 *
	 * @return {boolean} Group is empty
	 */
	oo.EmitterList.prototype.isEmpty = function () {
		return !this.items.length;
	};

	/**
	 * Aggregate the events emitted by the group.
	 *
	 * When events are aggregated, the group will listen to all contained items for the event,
	 * and then emit the event under a new name. The new event will contain an additional leading
	 * parameter containing the item that emitted the original event. Other arguments emitted from
	 * the original event are passed through.
	 *
	 * @param {Object.<string,string|null>} events An object keyed by the name of the event that should be
	 *  aggregated  (e.g., ‘click’) and the value of the new name to use (e.g., ‘groupClick’).
	 *  A `null` value will remove aggregated events.

	 * @throws {Error} If aggregation already exists
	 */
	oo.EmitterList.prototype.aggregate = function ( events ) {
		var i, item, add, remove, itemEvent, groupEvent;

		for ( itemEvent in events ) {
			groupEvent = events[ itemEvent ];

			// Remove existing aggregated event
			if ( Object.prototype.hasOwnProperty.call( this.aggregateItemEvents, itemEvent ) ) {
				// Don't allow duplicate aggregations
				if ( groupEvent ) {
					throw new Error( 'Duplicate item event aggregation for ' + itemEvent );
				}
				// Remove event aggregation from existing items
				for ( i = 0; i < this.items.length; i++ ) {
					item = this.items[ i ];
					if ( item.connect && item.disconnect ) {
						remove = {};
						remove[ itemEvent ] = [ 'emit', this.aggregateItemEvents[ itemEvent ], item ];
						item.disconnect( this, remove );
					}
				}
				// Prevent future items from aggregating event
				delete this.aggregateItemEvents[ itemEvent ];
			}

			// Add new aggregate event
			if ( groupEvent ) {
				// Make future items aggregate event
				this.aggregateItemEvents[ itemEvent ] = groupEvent;
				// Add event aggregation to existing items
				for ( i = 0; i < this.items.length; i++ ) {
					item = this.items[ i ];
					if ( item.connect && item.disconnect ) {
						add = {};
						add[ itemEvent ] = [ 'emit', groupEvent, item ];
						item.connect( this, add );
					}
				}
			}
		}
	};

	/**
	 * Add items to the list.
	 *
	 * @param {OO.EventEmitter|OO.EventEmitter[]} items Item to add or
	 *  an array of items to add
	 * @param {number} [index] Index to add items at. If no index is
	 *  given, or if the index that is given is invalid, the item
	 *  will be added at the end of the list.
	 * @chainable
	 * @fires add
	 * @fires move
	 */
	oo.EmitterList.prototype.addItems = function ( items, index ) {
		var i, oldIndex;

		if ( !Array.isArray( items ) ) {
			items = [ items ];
		}

		if ( items.length === 0 ) {
			return this;
		}

		index = normalizeArrayIndex( this.items, index );
		for ( i = 0; i < items.length; i++ ) {
			oldIndex = this.items.indexOf( items[ i ] );
			if ( oldIndex !== -1 ) {
				// Move item to new index
				index = this.moveItem( items[ i ], index );
				this.emit( 'move', items[ i ], index, oldIndex );
			} else {
				// insert item at index
				index = this.insertItem( items[ i ], index );
				this.emit( 'add', items[ i ], index );
			}
			index++;
		}

		return this;
	};

	/**
	 * Move an item from its current position to a new index.
	 *
	 * The item is expected to exist in the list. If it doesn't,
	 * the method will throw an exception.
	 *
	 * @private
	 * @param {OO.EventEmitter} item Items to add
	 * @param {number} newIndex Index to move the item to
	 * @return {number} The index the item was moved to
	 * @throws {Error} If item is not in the list
	 */
	oo.EmitterList.prototype.moveItem = function ( item, newIndex ) {
		var existingIndex = this.items.indexOf( item );

		if ( existingIndex === -1 ) {
			throw new Error( 'Item cannot be moved, because it is not in the list.' );
		}

		newIndex = normalizeArrayIndex( this.items, newIndex );

		// Remove the item from the current index
		this.items.splice( existingIndex, 1 );

		// If necessary, adjust new index after removal
		if ( existingIndex < newIndex ) {
			newIndex--;
		}

		// Move the item to the new index
		this.items.splice( newIndex, 0, item );

		return newIndex;
	};

	/**
	 * Utility method to insert an item into the list, and
	 * connect it to aggregate events.
	 *
	 * Don't call this directly unless you know what you're doing.
	 * Use #addItems instead.
	 *
	 * This method can be extended in child classes to produce
	 * different behavior when an item is inserted. For example,
	 * inserted items may also be attached to the DOM or may
	 * interact with some other nodes in certain ways. Extending
	 * this method is allowed, but if overriden, the aggregation
	 * of events must be preserved, or behavior of emitted events
	 * will be broken.
	 *
	 * If you are extending this method, please make sure the
	 * parent method is called.
	 *
	 * @protected
	 * @param {OO.EventEmitter} item Items to add
	 * @param {number} index Index to add items at
	 * @return {number} The index the item was added at
	 */
	oo.EmitterList.prototype.insertItem = function ( item, index ) {
		var events, event;

		// Add the item to event aggregation
		if ( item.connect && item.disconnect ) {
			events = {};
			for ( event in this.aggregateItemEvents ) {
				events[ event ] = [ 'emit', this.aggregateItemEvents[ event ], item ];
			}
			item.connect( this, events );
		}

		index = normalizeArrayIndex( this.items, index );

		// Insert into items array
		this.items.splice( index, 0, item );
		return index;
	};

	/**
	 * Remove items.
	 *
	 * @param {OO.EventEmitter[]} items Items to remove
	 * @chainable
	 * @fires remove
	 */
	oo.EmitterList.prototype.removeItems = function ( items ) {
		var i, item, index;

		if ( !Array.isArray( items ) ) {
			items = [ items ];
		}

		if ( items.length === 0 ) {
			return this;
		}

		// Remove specific items
		for ( i = 0; i < items.length; i++ ) {
			item = items[ i ];
			index = this.items.indexOf( item );
			if ( index !== -1 ) {
				if ( item.connect && item.disconnect ) {
					// Disconnect all listeners from the item
					item.disconnect( this );
				}
				this.items.splice( index, 1 );
				this.emit( 'remove', item, index );
			}
		}

		return this;
	};

	/**
	 * Clear all items
	 *
	 * @chainable
	 * @fires clear
	 */
	oo.EmitterList.prototype.clearItems = function () {
		var i, item,
			cleared = this.items.splice( 0, this.items.length );

		// Disconnect all items
		for ( i = 0; i < cleared.length; i++ ) {
			item = cleared[ i ];
			if ( item.connect && item.disconnect ) {
				item.disconnect( this );
			}
		}

		this.emit( 'clear' );

		return this;
	};

}() );

/**
 * Manage a sorted list of OO.EmitterList objects.
 *
 * The sort order is based on a callback that compares two items. The return value of
 * callback( a, b ) must be less than zero if a < b, greater than zero if a > b, and zero
 * if a is equal to b. The callback should only return zero if the two objects are
 * considered equal.
 *
 * When an item changes in a way that could affect their sorting behavior, it must
 * emit the itemSortChange event. This will cause it to be re-sorted automatically.
 *
 * This mixin must be used in a class that also mixes in OO.EventEmitter.
 *
 * @abstract
 * @class OO.SortedEmitterList
 * @mixins OO.EmitterList
 * @constructor
 * @param {Function} sortingCallback Callback that compares two items.
 */
oo.SortedEmitterList = function OoSortedEmitterList( sortingCallback ) {
	// Mixin constructors
	oo.EmitterList.call( this );

	this.sortingCallback = sortingCallback;

	// Listen to sortChange event and make sure
	// we re-sort the changed item when that happens
	this.aggregate( {
		sortChange: 'itemSortChange'
	} );

	this.connect( this, {
		itemSortChange: 'onItemSortChange'
	} );
};

oo.mixinClass( oo.SortedEmitterList, oo.EmitterList );

/* Events */

/**
 * An item has changed properties that affect its sort positioning
 * inside the list.
 *
 * @private
 * @event itemSortChange
 */

/* Methods */

/**
 * Handle a case where an item changed a property that relates
 * to its sorted order
 *
 * @param {OO.EventEmitter} item Item in the list
 */
oo.SortedEmitterList.prototype.onItemSortChange = function ( item ) {
	// Remove the item
	this.removeItems( item );
	// Re-add the item so it is in the correct place
	this.addItems( item );
};

/**
 * Change the sorting callback for this sorted list.
 *
 * The callback receives two items. The return value of callback(a, b) must be less than zero
 * if a < b, greater than zero if a > b, and zero if a is equal to b.
 *
 * @param {Function} sortingCallback Sorting callback
 */
oo.SortedEmitterList.prototype.setSortingCallback = function ( sortingCallback ) {
	var items = this.getItems();

	this.sortingCallback = sortingCallback;

	// Empty the list
	this.clearItems();
	// Re-add the items in the new order
	this.addItems( items );
};

/**
 * Add items to the sorted list.
 *
 * @chainable
 * @param {OO.EventEmitter|OO.EventEmitter[]} items Item to add or
 *  an array of items to add
 */
oo.SortedEmitterList.prototype.addItems = function ( items ) {
	var index, i, insertionIndex;

	if ( !Array.isArray( items ) ) {
		items = [ items ];
	}

	if ( items.length === 0 ) {
		return this;
	}

	for ( i = 0; i < items.length; i++ ) {
		// Find insertion index
		insertionIndex = this.findInsertionIndex( items[ i ] );

		// Check if the item exists using the sorting callback
		// and remove it first if it exists
		if (
			// First make sure the insertion index is not at the end
			// of the list (which means it does not point to any actual
			// items)
			insertionIndex <= this.items.length &&
			// Make sure there actually is an item in this index
			this.items[ insertionIndex ] &&
			// The callback returns 0 if the items are equal
			this.sortingCallback( this.items[ insertionIndex ], items[ i ] ) === 0
		) {
			// Remove the existing item
			this.removeItems( this.items[ insertionIndex ] );
		}

		// Insert item at the insertion index
		index = this.insertItem( items[ i ], insertionIndex );
		this.emit( 'add', items[ i ], index );
	}

	return this;
};

/**
 * Find the index a given item should be inserted at. If the item is already
 * in the list, this will return the index where the item currently is.
 *
 * @param {OO.EventEmitter} item Items to insert
 * @return {number} The index the item should be inserted at
 */
oo.SortedEmitterList.prototype.findInsertionIndex = function ( item ) {
	var list = this;

	return oo.binarySearch(
		this.items,
		// Fake a this.sortingCallback.bind( null, item ) call here
		// otherwise this doesn't pass tests in phantomJS
		function ( otherItem ) {
			return list.sortingCallback( item, otherItem );
		},
		true
	);

};

/* global hasOwn */

/**
 * @class OO.Registry
 * @mixins OO.EventEmitter
 *
 * @constructor
 */
oo.Registry = function OoRegistry() {
	// Mixin constructors
	oo.EventEmitter.call( this );

	// Properties
	this.registry = {};
};

/* Inheritance */

oo.mixinClass( oo.Registry, oo.EventEmitter );

/* Events */

/**
 * @event register
 * @param {string} name
 * @param {Mixed} data
 */

/**
 * @event unregister
 * @param {string} name
 * @param {Mixed} data Data removed from registry
 */

/* Methods */

/**
 * Associate one or more symbolic names with some data.
 *
 * Any existing entry with the same name will be overridden.
 *
 * @param {string|string[]} name Symbolic name or list of symbolic names
 * @param {Mixed} data Data to associate with symbolic name
 * @fires register
 * @throws {Error} Name argument must be a string or array
 */
oo.Registry.prototype.register = function ( name, data ) {
	var i, len;
	if ( typeof name === 'string' ) {
		this.registry[ name ] = data;
		this.emit( 'register', name, data );
	} else if ( Array.isArray( name ) ) {
		for ( i = 0, len = name.length; i < len; i++ ) {
			this.register( name[ i ], data );
		}
	} else {
		throw new Error( 'Name must be a string or array, cannot be a ' + typeof name );
	}
};

/**
 * Remove one or more symbolic names from the registry
 *
 * @param {string|string[]} name Symbolic name or list of symbolic names
 * @fires unregister
 * @throws {Error} Name argument must be a string or array
 */
oo.Registry.prototype.unregister = function ( name ) {
	var i, len, data;
	if ( typeof name === 'string' ) {
		data = this.lookup( name );
		if ( data !== undefined ) {
			delete this.registry[ name ];
			this.emit( 'unregister', name, data );
		}
	} else if ( Array.isArray( name ) ) {
		for ( i = 0, len = name.length; i < len; i++ ) {
			this.unregister( name[ i ] );
		}
	} else {
		throw new Error( 'Name must be a string or array, cannot be a ' + typeof name );
	}
};

/**
 * Get data for a given symbolic name.
 *
 * @param {string} name Symbolic name
 * @return {Mixed|undefined} Data associated with symbolic name
 */
oo.Registry.prototype.lookup = function ( name ) {
	if ( hasOwn.call( this.registry, name ) ) {
		return this.registry[ name ];
	}
};

/**
 * @class OO.Factory
 * @extends OO.Registry
 *
 * @constructor
 */
oo.Factory = function OoFactory() {
	// Parent constructor
	oo.Factory.super.call( this );
};

/* Inheritance */

oo.inheritClass( oo.Factory, oo.Registry );

/* Methods */

/**
 * Register a constructor with the factory.
 *
 * Classes must have a static `name` property to be registered.
 *
 *     function MyClass() {};
 *     OO.initClass( MyClass );
 *     // Adds a static property to the class defining a symbolic name
 *     MyClass.static.name = 'mine';
 *     // Registers class with factory, available via symbolic name 'mine'
 *     factory.register( MyClass );
 *
 * @param {Function} constructor Constructor to use when creating object
 * @throws {Error} Name must be a string and must not be empty
 * @throws {Error} Constructor must be a function
 */
oo.Factory.prototype.register = function ( constructor ) {
	var name;

	if ( typeof constructor !== 'function' ) {
		throw new Error( 'constructor must be a function, cannot be a ' + typeof constructor );
	}
	name = constructor.static && constructor.static.name;
	if ( typeof name !== 'string' || name === '' ) {
		throw new Error( 'Name must be a string and must not be empty' );
	}

	// Parent method
	oo.Factory.super.prototype.register.call( this, name, constructor );
};

/**
 * Unregister a constructor from the factory.
 *
 * @param {Function} constructor Constructor to unregister
 * @throws {Error} Name must be a string and must not be empty
 * @throws {Error} Constructor must be a function
 */
oo.Factory.prototype.unregister = function ( constructor ) {
	var name;

	if ( typeof constructor !== 'function' ) {
		throw new Error( 'constructor must be a function, cannot be a ' + typeof constructor );
	}
	name = constructor.static && constructor.static.name;
	if ( typeof name !== 'string' || name === '' ) {
		throw new Error( 'Name must be a string and must not be empty' );
	}

	// Parent method
	oo.Factory.super.prototype.unregister.call( this, name );
};

/**
 * Create an object based on a name.
 *
 * Name is used to look up the constructor to use, while all additional arguments are passed to the
 * constructor directly, so leaving one out will pass an undefined to the constructor.
 *
 * @param {string} name Object name
 * @param {...Mixed} [args] Arguments to pass to the constructor
 * @return {Object} The new object
 * @throws {Error} Unknown object name
 */
oo.Factory.prototype.create = function ( name ) {
	var obj, i,
		args = [],
		constructor = this.lookup( name );

	if ( !constructor ) {
		throw new Error( 'No class registered by that name: ' + name );
	}

	// Convert arguments to array and shift the first argument (name) off
	for ( i = 1; i < arguments.length; i++ ) {
		args.push( arguments[ i ] );
	}

	// We can't use the "new" operator with .apply directly because apply needs a
	// context. So instead just do what "new" does: create an object that inherits from
	// the constructor's prototype (which also makes it an "instanceof" the constructor),
	// then invoke the constructor with the object as context, and return it (ignoring
	// the constructor's return value).
	obj = Object.create( constructor.prototype );
	constructor.apply( obj, args );
	return obj;
};

/* eslint-env node */

/* istanbul ignore next */
if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = oo;
} else {
	global.OO = oo;
}

}( this ) );

/*!
 * VisualEditor IndexValueStore class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global SparkMD5 */

/**
 * Ordered append-only hash store, whose values once inserted are immutable
 *
 * Values are objects, strings or Arrays, and are hashed using an algorithm with low collision
 * probability: values with the same hash can be assumed equal.
 *
 * Values are stored in insertion order, and the store can be sliced to get a subset of values
 * inserted consecutively.
 *
 * Two stores can be merged even if they have differently computed hashes, so long as two values
 * will (with high probability) have the same hash only if equal. In this case, equivalent
 * values can have two different hashes.
 *
 * TODO: rename the class to reflect that it is no longer an index-value store
 *
 * @class
 * @constructor
 * @param {Object[]} [values] Values to insert
 */
ve.dm.IndexValueStore = function VeDmIndexValueStore( values ) {
	// Maps hashes to values
	this.hashStore = {};
	// Hashes in order of insertion (used for slicing)
	this.hashes = [];
	if ( values ) {
		this.indexes( values );
	}
};

/* Inheritance */

OO.initClass( ve.dm.IndexValueStore );

/* Static Methods */

/**
 * Deserialize a store from a JSONable object
 *
 * @param {Function} deserializeValue Deserializer for arbitrary store values
 * @param {Object} data Store serialized as a JSONable object
 * @return {ve.dm.IndexValueStore} Deserialized store
 */
ve.dm.IndexValueStore.static.deserialize = function ( deserializeValue, data ) {
	var hash,
		store = new ve.dm.IndexValueStore();

	store.hashes = data.hashes.slice();
	store.hashStore = {};
	for ( hash in data.hashStore ) {
		store.hashStore[ hash ] = deserializeValue( data.hashStore[ hash ] );
	}
	return store;
};

/* Methods */

/**
 * Serialize the store into a JSONable object
 *
 * @param {Function} serializeValue Serializer for arbitrary store values
 * @return {Object} Serialized store
 */
ve.dm.IndexValueStore.prototype.serialize = function ( serializeValue ) {
	var hash,
		serialized = {};

	for ( hash in this.hashStore ) {
		serialized[ hash ] = serializeValue( this.hashStore[ hash ] );
	}
	return {
		hashes: this.hashes.slice(),
		hashStore: serialized
	};
};

/**
 * Get the number of values in the store
 *
 * @return {number} Number of values in the store
 */
ve.dm.IndexValueStore.prototype.getLength = function () {
	return this.hashes.length;
};

ve.dm.IndexValueStore.prototype.truncate = function ( start ) {
	var i, len,
		removedHashes = this.hashes.splice( start );
	for ( i = 0, len = removedHashes.length; i < len; i++ ) {
		delete this.hashStore[ removedHashes[ i ] ];
	}
};

/**
 * Return a new store containing a slice of the values in insertion order
 *
 * @param {number} [start] Include values from position start onwards (default: 0)
 * @param {number} [end] Include values to position end exclusive (default: slice to end)
 * @return {ve.dm.IndexValueStore} Slice of the current store (with non-cloned value references)
 */
ve.dm.IndexValueStore.prototype.slice = function ( start, end ) {
	var i, len, hash,
		sliced = new this.constructor();

	sliced.hashes = this.hashes.slice( start, end );
	for ( i = 0, len = sliced.hashes.length; i < len; i++ ) {
		hash = sliced.hashes[ i ];
		sliced.hashStore[ hash ] = this.hashStore[ hash ];
	}
	return sliced;
};

/**
 * Clone a store.
 *
 * @deprecated Use #slice with no arguments.
 * @return {ve.dm.IndexValueStore} New store with the same contents as this one
 */
ve.dm.IndexValueStore.prototype.clone = function () {
	return this.slice();
};

/**
 * Insert a value into the store
 *
 * @method
 * @param {Object|string|Array} value Value to store
 * @param {string} [stringified] Stringified version of value; default OO.getHash( value )
 * @return {string} Hash value with low collision probability
 */
ve.dm.IndexValueStore.prototype.index = function ( value, stringified ) {
	var hash = this.indexOfValue( value, stringified );

	if ( !this.hashStore[ hash ] ) {
		if ( Array.isArray( value ) ) {
			this.hashStore[ hash ] = ve.copy( value );
		} else if ( typeof value === 'object' ) {
			this.hashStore[ hash ] = ve.cloneObject( value );
		} else {
			this.hashStore[ hash ] = value;
		}
		this.hashes.push( hash );
	}

	return hash;
};

/**
 * Replace a value's stored hash, e.g. if the value has changed and you want to discard the old one.
 *
 * @param {string} oldHash The value's previously stored hash
 * @param {Object|string|Array} value New value
 * @throws {Error} Old hash not found
 * @return {string} New hash
 */
ve.dm.IndexValueStore.prototype.replaceHash = function ( oldHash, value ) {
	var newHash = this.indexOfValue( value ),
		index = this.hashStore[ oldHash ];

	if ( index === undefined ) {
		throw new Error( 'Old hash not found: ' + oldHash );
	}

	delete this.hashStore[ oldHash ];

	if ( this.hashStore[ newHash ] === undefined ) {
		this.hashStore[ newHash ] = value;
		this.hashes.splice( this.hashes.indexOf( oldHash ), 1, newHash );
	}

	return newHash;
};

/**
 * Get the hash of a value without inserting it in the store
 *
 * @method
 * @param {Object|string|Array} value Value to hash
 * @param {string} [stringified] Stringified version of value; default OO.getHash( value )
 * @return {string} Hash value with low collision probability
 */
ve.dm.IndexValueStore.prototype.indexOfValue = function ( value, stringified ) {
	if ( typeof stringified !== 'string' ) {
		stringified = OO.getHash( value );
	}

	// We don't need cryptographically strong hashes, just low collision probability. Given
	// effectively random hash distribution, for n values hashed into a space of m hash
	// strings, the probability of a collision is roughly n^2 / (2m). We use 16 hex digits
	// of MD5 i.e. 2^64 possible hash strings, so given 2^16 stored values the collision
	// probability is about 2^-33 =~ 0.0000000001 , i.e. negligible.
	//
	// Prefix with a letter to prevent all numeric hashes, and to constrain the space of
	// possible object property values.
	return 'h' + SparkMD5.hash( stringified ).slice( 0, 16 );
};

/**
 * Get the hashes of values in the store
 *
 * Same as index but with arrays.
 *
 * @method
 * @param {Object[]} values Values to lookup or store
 * @return {string[]} The hashes of the values in the store
 */
ve.dm.IndexValueStore.prototype.indexes = function ( values ) {
	var i, length, hashes = [];
	for ( i = 0, length = values.length; i < length; i++ ) {
		hashes.push( this.index( values[ i ] ) );
	}
	return hashes;
};

/**
 * Get the value stored for a particular hash
 *
 * @method
 * @param {string} hash Hash to look up
 * @return {Object|undefined} Value stored for this hash if present, else undefined
 */
ve.dm.IndexValueStore.prototype.value = function ( hash ) {
	return this.hashStore[ hash ];
};

/**
 * Get the values stored for a list of hashes
 *
 * Same as value but with arrays.
 *
 * @method
 * @param {string[]} hashes Hashes to lookup
 * @return {Array} Values for these hashes (undefined for any not present)
 */
ve.dm.IndexValueStore.prototype.values = function ( hashes ) {
	var i, length, values = [];
	for ( i = 0, length = hashes.length; i < length; i++ ) {
		values.push( this.value( hashes[ i ] ) );
	}
	return values;
};

/**
 * Merge another store into this store.
 *
 * It is allowed for the two stores to have differently computed hashes, so long as two values
 * will (with high probability) have the same hash only if equal. In this case, equivalent
 * values can have two different hashes.
 *
 * Values are added in the order they appear in the other store. Objects added to the store are
 * added by reference, not cloned, unlike in .index()
 *
 * @param {ve.dm.IndexValueStore} other Store to merge into this one
 */
ve.dm.IndexValueStore.prototype.merge = function ( other ) {
	var i, len, hash;

	for ( i = 0, len = other.hashes.length; i < len; i++ ) {
		hash = other.hashes[ i ];
		if ( !Object.prototype.hasOwnProperty.call( this.hashStore, hash ) ) {
			this.hashStore[ hash ] = other.hashStore[ hash ];
			this.hashes.push( hash );
		}
	}
};

/**
 * Clone this store excluding certain values, like a set difference operation
 *
 * @param {ve.dm.IndexValueStore|Object} omit Store of values to omit, or object whose keys are hashes to emit
 * @return {ve.dm.IndexValueStore} All values in this that do not appear in other
 */
ve.dm.IndexValueStore.prototype.difference = function ( omit ) {
	var i, len, hash,
		store = new this.constructor();

	if ( omit instanceof ve.dm.IndexValueStore ) {
		omit = omit.hashStore;
	}
	for ( i = 0, len = this.hashes.length; i < len; i++ ) {
		hash = this.hashes[ i ];
		if ( !Object.prototype.hasOwnProperty.call( omit, hash ) ) {
			store.hashes.push( hash );
			store.hashStore[ hash ] = this.hashStore[ hash ];
		}
	}
	return store;
};

/**
 * @param {ve.dm.Transaction[]} transactions List of transactions
 * @return {ve.dm.IndexValueStore} The values in the transactions, in the order they occur
 */
ve.dm.IndexValueStore.prototype.filter = function ( transactions ) {
	var t, tLen, operations, o, oLen, op, hash, e, eLen, annotations, a, aLen,
		store = new ve.dm.IndexValueStore();

	for ( t = 0, tLen = transactions.length; t < tLen; t++ ) {
		operations = transactions[ t ].operations;
		for ( o = 0, oLen = operations.length; o < oLen; o++ ) {
			op = operations[ o ];
			if ( op.type === 'annotate' && op.bias === 'start' ) {
				hash = op.index;
				if ( !Object.prototype.hasOwnProperty.call( store.hashSet, hash ) ) {
					store.hashSet[ hash ] = this.hashSet[ hash ];
					store.hashes.push( hash );
				}
			}
			if ( op.type !== 'replace' ) {
				continue;
			}
			for ( e = 0, eLen = op.insert.length; e < eLen; e++ ) {
				annotations = op.insert[ e ][ 1 ];
				if ( !annotations ) {
					continue;
				}
				for ( a = 0, aLen = annotations.length; a < aLen; a++ ) {
					hash = annotations[ a ];
					if ( !Object.prototype.hasOwnProperty.call( store.hashSet, hash ) ) {
						store.hashSet[ hash ] = this.hashSet[ hash ];
						store.hashes.push( hash );
					}
				}
			}
		}
	}
	return store;
};

/*!
 * VisualEditor DataModel Transaction class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Transaction on ve.dm.ElementLinearData, preserving ve.dm.Document tree validity
 *
 * A transaction represents a mapping on ve.dm.ElementLinearData, from one state (the start
 * state) to another (the end state). The transaction is guaranteed not to break tree validity:
 * if the start state represents a syntactically valid ve.dm.Document tree (without unbalanced
 * tags, bare listItems, bare table cells etc), then the end state tree must be syntactically
 * valid too.
 *
 * A transaction is comprised of a list of operations, which must preserve tree validity as a
 * whole, though each individual operation may not. For example, a DivNode wrapping can be
 * removed by one operation removing the 'div' and another removing the '/div'.  The
 * ve.dm.TransactionBuilder.static.newFrom* methods help build transactions that preserve tree validity.
 *
 * @class
 * @constructor
 * @param {Object[]} [operations] Operations preserving tree validity as a whole; default []
 * @param {Number|null} [author] Positive integer author ID; default null
 */
ve.dm.Transaction = function VeDmTransaction( operations, author ) {
	this.operations = operations || [];
	this.applied = false;
	this.author = author || null;
};

/* Inheritance */

OO.initClass( ve.dm.Transaction );

/* Static Properties */

/**
 * Specification for how each type of operation should be reversed.
 *
 * This object maps operation types to objects, which map property names to reversal instructions.
 * A reversal instruction is either a string (which means the value of that property should be used)
 * or an object (which maps old values to new values). For instance, { from: 'to' }
 * means that the .from property of the reversed operation should be set to the .to property of the
 * original operation, and { method: { set: 'clear' } } means that if the .method property of
 * the original operation was 'set', the reversed operation's .method property should be 'clear'.
 *
 * If a property's treatment isn't specified, its value is simply copied without modification.
 * If an operation type's treatment isn't specified, all properties are copied without modification.
 *
 * @type {Object.<string,Object.<string,string|Object.<string, string>>>}
 */
ve.dm.Transaction.static.reversers = {
	annotate: { method: { set: 'clear', clear: 'set' } }, // swap 'set' with 'clear'
	attribute: { from: 'to', to: 'from' }, // swap .from with .to
	replace: { // swap .insert with .remove and .insertMetadata with .removeMetadata
		insert: 'remove',
		remove: 'insert',
		insertMetadata: 'removeMetadata',
		removeMetadata: 'insertMetadata'
	},
	replaceMetadata: { insert: 'remove', remove: 'insert' } // swap .insert with .remove
};

/* Static Methods */

// ve.dm.Transaction.newFrom* methods are added by ve.dm.TransactionBuilder for legacy support.

/**
 * Deserialize a transaction from a JSONable object
 *
 * @param {Object} data Transaction serialized as a JSONable object
 * @return {ve.dm.Transaction} Deserialized transaction
 */
ve.dm.Transaction.static.deserialize = function ( data ) {
	return new ve.dm.Transaction(
		// For this plain, serializable array, stringify+parse profiles faster than ve.copy
		JSON.parse( JSON.stringify( data.operations ) ),
		data.author
	);
};

/* Methods */

/**
 * Serialize the transaction into a JSONable object
 *
 * Values are not necessarily deep copied
 * @return {Object} Serialized transaction
 */
ve.dm.Transaction.prototype.serialize = function () {
	return {
		operations: this.operations,
		author: this.author
	};
};

/**
 * Push a retain operation
 *
 * @param {number} length Length > 0 of content data to retain
 */
ve.dm.Transaction.prototype.pushRetainOp = function ( length ) {
	this.operations.push( { type: 'retain', length: length } );
};

// TODO: Bring in adjustRetain from ve.dm.Change and replace ve.dm.TransactionBuilder#pushRetain

/**
 * Push a metadata retain operation
 *
 * @param {number} length Length > 0 of content data to retain
 */
ve.dm.Transaction.prototype.pushRetainMetadataOp = function ( length ) {
	this.operations.push( { type: 'retainMetadata', length: length } );
};

/**
 * Build a replace operation
 *
 * The `insertedDataOffset` and `insertedDataLength` parameters indicate the intended insertion
 * is wrapped with fixup data to preserve HTML validity. For instance, an intended table cell
 * insertion may have been fixed up by wrapping inside a table row, table section and table.
 *
 * @param {Array} remove Data to remove
 * @param {Array} insert Data to insert, possibly fixed up
 * @param {Array|undefined} removeMetadata Metadata to remove
 * @param {Array|undefined} insertMetadata Metadata to insert
 * @param {number} [insertedDataOffset] Offset of intended insertion within fixed up data
 * @param {number} [insertedDataLength] Length of intended insertion within fixed up data
 */
ve.dm.Transaction.prototype.pushReplaceOp = function ( remove, insert, removeMetadata, insertMetadata, insertedDataOffset, insertedDataLength ) {
	var op = { type: 'replace', remove: remove, insert: insert };
	if ( removeMetadata !== undefined && insertMetadata !== undefined ) {
		op.removeMetadata = removeMetadata;
		op.insertMetadata = insertMetadata;
	}
	if ( insertedDataOffset !== undefined && insertedDataLength !== undefined ) {
		op.insertedDataOffset = insertedDataOffset;
		op.insertedDataLength = insertedDataLength;
	}
	this.operations.push( op );
};

/**
 * Build a replaceMetadata operation
 *
 * @param {Array} remove Metadata to remove
 * @param {Array} insert Metadata to insert
 */
ve.dm.Transaction.prototype.pushReplaceMetadataOp = function ( remove, insert ) {
	this.operations.push( { type: 'replaceMetadata', remove: remove, insert: insert } );
};

/**
 * Build an attribute operation
 *
 * @param {string} key Name of attribute to change
 * @param {Mixed} from Value to change attribute from, or undefined if not previously set
 * @param {Mixed} to Value to change attribute to, or undefined to remove
 */
ve.dm.Transaction.prototype.pushAttributeOp = function ( key, from, to ) {
	this.operations.push( { type: 'attribute', key: key, from: from, to: to } );
};

/**
 * Build an annotate operation
 *
 * @param {string} method Method to use, either "set" or "clear"
 * @param {string} bias Bias, either "start" or "stop"
 * @param {Object} index Store index of annotation object
 */
ve.dm.Transaction.prototype.pushAnnotateOp = function ( method, bias, index ) {
	this.operations.push( { type: 'annotate', method: method, bias: bias, index: index } );
};

/**
 * Create a clone of this transaction.
 *
 * The returned transaction will be exactly the same as this one, except that its 'applied' flag
 * will be cleared. This means that if a transaction has already been committed, it will still
 * be possible to commit the clone. This is used for redoing transactions that were undone.
 *
 * @return {ve.dm.Transaction} Clone of this transaction
 */
ve.dm.Transaction.prototype.clone = function () {
	return new this.constructor(
		// For this plain, serializable array, stringify+parse profiles faster than ve.copy
		JSON.parse( JSON.stringify( this.operations ) ),
		this.author
	);
};

/**
 * Create a reversed version of this transaction.
 *
 * The returned transaction will be the same as this one but with all operations reversed. This
 * means that applying the original transaction and then applying the reversed transaction will
 * result in no net changes. This is used to undo transactions.
 *
 * @return {ve.dm.Transaction} Reverse of this transaction
 */
ve.dm.Transaction.prototype.reversed = function () {
	var i, len, op, newOp, reverse, prop, tx = new this.constructor();
	for ( i = 0, len = this.operations.length; i < len; i++ ) {
		op = this.operations[ i ];
		newOp = ve.copy( op );
		reverse = this.constructor.static.reversers[ op.type ] || {};
		for ( prop in reverse ) {
			if ( typeof reverse[ prop ] === 'string' ) {
				newOp[ prop ] = op[ reverse[ prop ] ];
			} else {
				newOp[ prop ] = reverse[ prop ][ op[ prop ] ];
			}
		}
		tx.operations.push( newOp );
	}
	tx.author = this.author;
	return tx;
};

/**
 * Check if the transaction would make any actual changes if processed.
 *
 * There may be more sophisticated checks that can be done, like looking for things being replaced
 * with identical content, but such transactions probably should not be created in the first place.
 *
 * @method
 * @return {boolean} Transaction is no-op
 */
ve.dm.Transaction.prototype.isNoOp = function () {
	if ( this.operations.length === 0 ) {
		return true;
	}
	if ( this.operations.length === 1 ) {
		return this.operations[ 0 ].type === 'retain';
	}
	if ( this.operations.length === 2 ) {
		return this.operations[ 0 ].type === 'retain' && this.operations[ 1 ].type === 'retainMetadata';
	}

	return false;
};

/**
 * Get all operations.
 *
 * @method
 * @return {Object[]} List of operations
 */
ve.dm.Transaction.prototype.getOperations = function () {
	return this.operations;
};

/**
 * Check if the transaction has any operations with a certain type.
 *
 * @method
 * @param {string} type Operation type
 * @return {boolean} Has operations of a given type
 */
ve.dm.Transaction.prototype.hasOperationWithType = function ( type ) {
	var i, len;
	for ( i = 0, len = this.operations.length; i < len; i++ ) {
		if ( this.operations[ i ].type === type ) {
			return true;
		}
	}
	return false;
};

/**
 * Check if the transaction has any content data operations, such as insertion or deletion.
 *
 * @method
 * @return {boolean} Has content data operations
 */
ve.dm.Transaction.prototype.hasContentDataOperations = function () {
	return this.hasOperationWithType( 'replace' );
};

/**
 * Check if the transaction has any element attribute operations.
 *
 * @method
 * @return {boolean} Has element attribute operations
 */
ve.dm.Transaction.prototype.hasElementAttributeOperations = function () {
	return this.hasOperationWithType( 'attribute' );
};

/**
 * Check if the transaction has any annotation operations.
 *
 * @method
 * @return {boolean} Has annotation operations
 */
ve.dm.Transaction.prototype.hasAnnotationOperations = function () {
	return this.hasOperationWithType( 'annotate' );
};

/**
 * Check whether the transaction has already been applied.
 *
 * @method
 * @return {boolean}
 */
ve.dm.Transaction.prototype.hasBeenApplied = function () {
	return this.applied;
};

/**
 * Mark the transaction as having been applied.
 *
 * Should only be called after committing the transaction.
 *
 * @see ve.dm.Transaction#hasBeenApplied
 */
ve.dm.Transaction.prototype.markAsApplied = function () {
	this.applied = true;
};

/**
 * Translate an offset based on a transaction.
 *
 * This is useful when you want to anticipate what an offset will be after a transaction is
 * processed.
 *
 * @method
 * @param {number} offset Offset in the linear model before the transaction has been processed
 * @param {boolean} [excludeInsertion] Map the offset immediately before an insertion to
 *  right before the insertion rather than right after
 * @return {number} Translated offset, as it will be after processing transaction
 */
ve.dm.Transaction.prototype.translateOffset = function ( offset, excludeInsertion ) {
	var i, op, insertLength, removeLength, prevAdjustment,
		cursor = 0,
		adjustment = 0;

	for ( i = 0; i < this.operations.length; i++ ) {
		op = this.operations[ i ];
		if ( op.type === 'replace' ) {
			insertLength = op.insert.length;
			removeLength = op.remove.length;
			prevAdjustment = adjustment;
			adjustment += insertLength - removeLength;
			if ( offset === cursor + removeLength ) {
				// Offset points to right after the removal or right before the insertion
				if ( excludeInsertion && insertLength > removeLength ) {
					// Translate it to before the insertion
					return offset + adjustment - insertLength + removeLength;
				} else {
					// Translate it to after the removal/insertion
					return offset + adjustment;
				}
			} else if ( offset === cursor ) {
				// The offset points to right before the removal or replacement
				if ( insertLength === 0 ) {
					// Translate it to after the removal
					return cursor + removeLength + adjustment;
				} else {
					// Translate it to before the replacement
					// To translate this correctly, we have to use adjustment as it was before
					// we adjusted it for this replacement
					return cursor + prevAdjustment;
				}
			} else if ( offset > cursor && offset < cursor + removeLength ) {
				// The offset points inside of the removal
				// Translate it to after the removal
				return cursor + removeLength + adjustment;
			}
			cursor += removeLength;
		} else if ( op.type === 'retain' ) {
			if ( offset >= cursor && offset < cursor + op.length ) {
				return offset + adjustment;
			}
			cursor += op.length;
		}
	}
	return offset + adjustment;
};

/**
 * Translate a range based on the transaction, with grow/shrink preference at changes
 *
 * This is useful when you want to anticipate what a selection will be after a transaction is
 * processed.
 *
 * @method
 * @see #translateOffset
 * @param {ve.Range} range Range in the linear model before the transaction has been processed
 * @param {boolean} [excludeInsertion] Do not grow the range to cover insertions
 *  on the boundaries of the range.
 * @return {ve.Range} Translated range, as it will be after processing transaction
 */
ve.dm.Transaction.prototype.translateRange = function ( range, excludeInsertion ) {
	var start = this.translateOffset( range.start, !excludeInsertion ),
		end = this.translateOffset( range.end, excludeInsertion );
	return range.isBackwards() ? new ve.Range( end, start ) : new ve.Range( start, end );
};

/**
 * Translate a range based on the transaction, with bias depending on author ID comparison
 *
 * Biases backward if !author || !this.author || author <= this.author
 *
 * @see #translateOffset
 * @param {ve.Range} range Range in the linear model before the transaction has been processed
 * @param {number} [author] Author ID of the range
 * @return {ve.Range} Translated range, as it will be after processing transaction
 */
ve.dm.Transaction.prototype.translateRangeWithAuthor = function ( range, author ) {
	var backward = !this.author || !author || author < this.author,
		start = this.translateOffset( range.start, backward ),
		end = this.translateOffset( range.end, backward );
	return range.isBackwards() ? new ve.Range( end, start ) : new ve.Range( start, end );
};

/**
 * Get the range that covers modifications made by this transaction.
 *
 * In the case of insertions, the range covers content the user intended to insert.
 * It ignores wrappers added by ve.dm.Document#fixUpInsertion.
 *
 * The returned range is relative to the new state, after the transaction is applied. So for a
 * simple insertion transaction, the range will cover the newly inserted data, and for a simple
 * removal transaction it will be a zero-length range.
 *
 * @param {ve.dm.Document} doc The document in the state to which the transaction applies
 * @param {boolean} includeInternalList Include changes within the internal list
 * @return {ve.Range|null} Range covering modifications, or null for a no-op transaction
 */
ve.dm.Transaction.prototype.getModifiedRange = function ( doc, includeInternalList ) {
	var i, len, op, start, end, internalListNode,
		docEndOffset = doc.data.getLength(),
		oldOffset = 0,
		offset = 0;

	if ( !includeInternalList ) {
		internalListNode = doc.getInternalList().getListNode();
		if ( internalListNode ) {
			docEndOffset = internalListNode.getOuterRange().start;
		}
	}

	opLoop:
	for ( i = 0, len = this.operations.length; i < len; i++ ) {
		op = this.operations[ i ];
		switch ( op.type ) {
			case 'retainMetadata':
				continue;

			case 'retain':
				if ( oldOffset + op.length > docEndOffset ) {
					break opLoop;
				}
				offset += op.length;
				oldOffset += op.length;
				break;

			case 'attribute':
				if ( start === undefined ) {
					start = offset;
				}
				// Attribute changes modify the element to their right but don't move the cursor
				end = offset + 1;
				break;

			default:
				if ( start === undefined ) {
					// This is the first non-retain operation, set start to right before it
					start = offset + ( op.insertedDataOffset || 0 );
				}
				if ( op.type === 'replace' ) {
					offset += op.insert.length;
					oldOffset += op.remove.length;
				}

				// Set end, so it'll end up being right after the last non-retain operation
				if ( op.insertedDataLength ) {
					end = start + op.insertedDataLength;
				} else {
					end = offset;
				}
				break;
		}
	}
	if ( start === undefined || end === undefined ) {
		// No-op transaction
		return null;
	}
	return new ve.Range( start, end );
};

/*!
 * VisualEditor DataModel Change class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global DOMPurify */

/**
 * DataModel change.
 *
 * A change is a list of transactions to be applied sequentially on top of a certain history
 * state, together with a set that includes all new store values (annotations and DOM elements)
 * introduced by those transactions.
 *
 * It can be thought of more abstractly as a function f: D1 -> D2 a document in a
 * specific start state D1, modifying parts of the document to produce a specific end state D2.
 *
 * For two changes f: D1 -> D2 and g: D2 -> D3 we define f.concat(g): D1 -> D3 as the change
 * obtained by applying f then g. By associativity of functions,
 * a.concat(b.concat(c)) = a.concat(b).concat(c) for any consecutive changes a, b, c. Writing
 *
 * x * y := x.concat(y) ,
 *
 * we have a * (b * c) = (a * b) * c, so we can just write either as a * b * c.
 *
 * For a change f: D1 -> D2 we define f.reversed() as the change D2 -> D1 such that
 * f.concat(f.reversed()) is the identity change D1 -> D1. Writing
 *
 * inv(x) := x.reversed() ,
 *
 * we have f * inv(f) = the identity change on D1 .
 *
 * Given two changes f: D1 -> D2 and g: D1 -> D3 , We would like to define f.rebasedOnto(g)
 * ("f rebased onto g") as a change that maps D3 onto some D4: conceptually, it is f
 * modified so it can be applied after g. This is a useful concept because it allows changes
 * written in parallel to be sequenced into a linear order. However, for some changes there
 * is no reasonable way to do this; e.g. when f and g both change the same word to something
 * different. In this case we make f.rebasedOnto(g) return null and we say it conflicts.
 *
 * Given f: D1 -> D2 , g: D1 -> D3, and x: D1 -> D4, we give three guarantees about rebasing:
 *
 * 1. g.rebasedOnto(f) conflicts if and only if f.rebasedOnto(g) conflicts.
 * 2. If there is no conflict, f.concat(g.rebasedOnto(f)) equals g.concat(g.rebasedOnto(f)).
 * 3. If there is no conflict, x.rebasedOnto(f).rebasedOnto(g) equals x.rebasedOnto(f + g).
 *
 * We can consider a conflicting transaction starting at some document D to be 0: D->null,
 * and regard any two conflicting transactions starting at D to be equal, and just write 0
 * where D1 is clear from context. Then, writing
 *
 * x|y := x.rebasedOnto(y),
 *
 * we can write our guarantees. Given f: D1 -> D2 , g: D1 -> D3, and x: D1 -> D4:
 *
 * 1. Change conflict well definedness: g|f = 0 if and only if f|g = 0.
 * 2. Change commutativity: f * g|f equals g * f|g .
 * 3. Rebasing piecewise: if (x|f)|g != 0, then (x|f)|g equals x|(f * g) .
 *
 * These guarantees let us reorder non-conflicting changes without affecting the resulting
 * document. They also let us move in the inverse direction ("rebase under"), from sequential
 * changes to parallel ones, for if f: D1 -> D2 and g: D2 -> D3, then g|inv(f)
 * maps from D1 to some D4, and conceptually it is g modified to apply without f having been
 * applied.
 *
 * Note that rebasing piecewise is *not* equivalent for changes that conflict: if you conflict
 * with f you might not conflict with f*g. For example, if x|f = 0 then
 *
 * (x|f)|inv(f) = 0 but x|(f * inv(f)) = x.
 *
 * @class
 * @constructor
 * @param {number} start Length of the history stack at change start
 * @param {ve.dm.Transaction[]} transactions Transactions to apply
 * @param {ve.dm.IndexValueStore[]} stores For each transaction, a collection of new store items
 * @param {Object} selections For each author ID (key), latest ve.dm.Selection
 */
ve.dm.Change = function VeDmChange( start, transactions, stores, selections ) {
	this.start = start;
	this.transactions = transactions;
	this.stores = stores;
	this.selections = selections;
};

/* Static methods */

ve.dm.Change.static = {};

/**
 * Deserialize a change from a JSONable object
 *
 * Store values can be deserialized, or kept verbatim; the latter is an optimization if the
 * Change object will be rebased and reserialized without ever being applied to a document.
 *
 * @param {Object} data Change serialized as a JSONable object
 * @param {ve.dm.Document} [doc] Document, used for creating proper selections if deserializing in the client
 * @param {boolean} [preserveStoreValues] Keep store values verbatim instead of deserializing
 * @return {ve.dm.Change} Deserialized change
 */
ve.dm.Change.static.deserialize = function ( data, doc, preserveStoreValues ) {
	var author, deserializeStore,
		selections = {};

	for ( author in data.selections ) {
		selections[ author ] = ve.dm.Selection.static.newFromJSON(
			doc,
			data.selections[ author ]
		);
	}
	deserializeStore = ve.dm.IndexValueStore.static.deserialize.bind(
		null,
		preserveStoreValues ? function noop( x ) {
			return x;
		} : this.deserializeValue
	);
	return new ve.dm.Change(
		data.start,
		data.transactions.map( ve.dm.Transaction.static.deserialize ),
		data.stores.map( deserializeStore ),
		selections
	);
};

ve.dm.Change.static.serializeValue = function ( value ) {
	if ( value instanceof ve.dm.Annotation ) {
		return { type: 'annotation', value: value.element };
	} else if ( Array.isArray( value ) && value[ 0 ] instanceof Node ) {
		return { type: 'domNodeArray', value: value.map( ve.getNodeHtml ) };
	} else {
		return { type: 'plain', value: value };
	}
};

ve.dm.Change.static.deserializeValue = function ( serialized ) {
	var rdfaAttrs;
	if ( serialized.type === 'annotation' ) {
		return ve.dm.annotationFactory.createFromElement( serialized.value );
	} else if ( serialized.type === 'domNodeArray' ) {
		rdfaAttrs = [ 'about', 'rel', 'resource', 'property', 'content', 'datatype', 'typeof' ];

		return serialized.value.map( function ( nodeHtml ) {
			return DOMPurify.sanitize( $.parseHTML( nodeHtml )[ 0 ], {
				ADD_ATTR: rdfaAttrs,
				ADD_URI_SAFE_ATTR: rdfaAttrs,
				FORBID_TAGS: [ 'style' ],
				RETURN_DOM_FRAGMENT: true
			} ).childNodes[ 0 ];
		} ).filter( function ( node ) {
			// Nodes can be sanitized to nothing (empty string or undefined)
			// so check it is truthy
			return node;
		} );
	} else if ( serialized.type === 'plain' ) {
		return serialized.value;
	} else {
		throw new Error( 'Unrecognised type: ' + serialized.type );
	}
};

/**
 * Rebase parallel transactions transactionA and transactionB onto each other
 *
 * Recalling that a transaction is a mapping from one ve.dm.ElementLinearData state to another,
 * suppose we have two parallel transactions, i.e.:
 *
 * - transactionA mapping docstate0 to some docstateA, and
 * - transactionB mapping docstate0 to some docstateB .
 *
 * Then we want rebasing to give us two new transactions:
 *
 * - aRebasedOntoB mapping docstateB to some docstateC, and
 * - bRebasedOntoA mapping docstateA to docstateC ,
 *
 * so that applying transactionA then bRebasedOntoA results in the same document state as
 * applying transactionB then aRebasedOntoB .
 *
 * However, it is useful to regard some transaction pairs as "conflicting" or unrebasable. In
 * this implementation, transactions are considered to conflict if they have active ranges that
 * overlap, where a transaction's "active range" means the smallest single range in the *start*
 * document outside which the contents are unchanged by the transaction. (In practice the
 * operations within the transaction actually specify which ranges map to where, giving a
 * natural and unambiguous definition of "active range". Also, the identity transaction on a
 * document state has no active range but is trivially rebasable with any parallel
 * transaction).
 *
 * For non-conflicting transactions, rebasing of each transaction is performed by resizing the
 * inactive range either before or after the transaction to accommodate the length difference
 * caused by the other transaction. There is ambiguity in the case where both transactions have
 * a zero-length active range at the same position (i.e. two inserts in the same place); in this
 * case, transactionA's insertion is put before transactionB's.
 *
 * It is impossible for rebasing defined this way to create an invalid transaction that breaks
 * tree validity. This is clear because every position in the rebased transaction's active
 * range has the same node ancestry as the corresponding position before the rebase (else a
 * tag must have changed both before and after that position, contradicting the fact that the
 * transactions' active ranges do not overlap).
 *
 * Also it is clear that for a pair of non-conflicting parallel transactions, applying either
 * one followed by the other rebased will result in the same final document state, as required.
 *
 * @param {ve.dm.Transaction} transactionA Transaction A
 * @param {ve.dm.Transaction} transactionB Transaction B, with the same document start state
 * @return {Mixed[]} [ aRebasedOntoB, bRebasedOntoA ], or [ null, null ] if conflicting
 */
ve.dm.Change.static.rebaseTransactions = function ( transactionA, transactionB ) {
	var infoA, infoB;
	/**
	 * Calculate a transaction's active range and length change
	 *
	 * @param {ve.dm.Transaction} transaction The transaction
	 * @return {Object} Active range and length change
	 * @return {number|undefined} return.start Start offset of the active range
	 * @return {number|undefined} return.end End offset of the active range
	 * @return {number} return.diff Length change the transaction causes
	 */
	function getActiveRangeAndLengthDiff( transaction ) {
		var i, len, op, start, end, active,
			offset = 0,
			annotations = 0,
			diff = 0;

		for ( i = 0, len = transaction.operations.length; i < len; i++ ) {
			op = transaction.operations[ i ];
			if ( op.type === 'annotate' ) {
				annotations += ( op.bias === 'start' ? 1 : -1 );
				continue;
			}
			active = annotations > 0 || (
				op.type !== 'retain' && op.type !== 'retainMetadata'
			);
			// Place start marker
			if ( active && start === undefined ) {
				start = offset;
			}
			// adjust offset and diff
			if ( op.type === 'retain' ) {
				offset += op.length;
			} else if ( op.type === 'replace' ) {
				offset += op.remove.length;
				diff += op.insert.length - op.remove.length;
			}
			// Place/move end marker
			if ( op.type === 'attribute' || op.type === 'replaceMetadata' ) {
				// Op with length 0 but that effectively modifies 1 position
				end = offset + 1;
			} else if ( active ) {
				end = offset;
			}
		}
		return { start: start, end: end, diff: diff };
	}

	/**
	 * Adjust (in place) the retain length at the start/end of an operations list
	 *
	 * @param {Object[]} ops Operations list
	 * @param {string} place Where to adjust, start|end
	 * @param {number} diff Adjustment; must not cause negative retain length
	 */
	function adjustRetain( ops, place, diff ) {
		var start = place === 'start',
			i = start ? 0 : ops.length - 1;

		if ( diff === 0 ) {
			return;
		}
		if ( !start && ops[ i ] && ops[ i ].type === 'retainMetadata' ) {
			i = ops.length - 2;
		}
		if ( ops[ i ] && ops[ i ].type === 'retain' ) {
			ops[ i ].length += diff;
			if ( ops[ i ].length < 0 ) {
				throw new Error( 'Negative retain length' );
			} else if ( ops[ i ].length === 0 ) {
				ops.splice( i, 1 );
			}
			return;
		}
		if ( diff < 0 ) {
			throw new Error( 'Negative retain length' );
		}
		ops.splice( start ? 0 : ops.length, 0, { type: 'retain', length: diff } );
	}

	transactionA = transactionA.clone();
	transactionB = transactionB.clone();
	infoA = getActiveRangeAndLengthDiff( transactionA );
	infoB = getActiveRangeAndLengthDiff( transactionB );

	if ( infoA.start === undefined || infoB.start === undefined ) {
		// One of the transactions is a no-op: only need to adjust its retain length.
		// We can safely adjust both, because the no-op must have diff 0
		adjustRetain( transactionA.operations, 'start', infoB.diff );
		adjustRetain( transactionB.operations, 'start', infoA.diff );
	} else if ( infoA.end <= infoB.start ) {
		// This includes the case where both transactions are insertions at the same
		// point
		adjustRetain( transactionB.operations, 'start', infoA.diff );
		adjustRetain( transactionA.operations, 'end', infoB.diff );
	} else if ( infoB.end <= infoA.start ) {
		adjustRetain( transactionA.operations, 'start', infoB.diff );
		adjustRetain( transactionB.operations, 'end', infoA.diff );
	} else {
		// The active ranges overlap: conflict
		return [ null, null ];
	}
	return [ transactionA, transactionB ];
};

/**
 * Rebase a change on top of a parallel committed one
 *
 * Since a change is a stack of transactions, we define change rebasing in terms of transaction
 * rebasing. We require transaction rebasing to meet the three guarantees described above for
 * change rebasing. To be precise, given any transactions a:D1->D2, b:D2->D3 and x:D1->D4, we
 * require that:
 *
 * 1. Transaction conflict well definedness: a|x = 0 if and only if x|a = 0.
 * 2. Transaction commutativity: a * x|a equals x * a|x .
 * 3. Rebasing piecewise: if (x|a)|b != 0, then (x|a)|b equals x|(a * b) .
 *
 * Given committed history consisting of transactions a1,a2,...,aN, and an uncommitted update
 * consisting of transactions b1,b2,...,bM, our approach is to rebase the whole list a1,...,aN
 * over b1, and at the same time rebase b1 onto a1*...*aN.
 * Then we repeat the process for b2, and so on. To rebase a1,...,aN over b1, the the following
 * approach would work:
 *
 * a1' := a1|b1
 * a2' := a2|(inv(a1) * b1 * a1')
 * a3' := a3|(inv(a2) * inv(a1) * b1 * a1' * a2')
 * ...
 *
 * That is, rebase a_i under a_i-1,...,a_1, then over b1,...,bM, then over a'1,...,a_i-1' .
 *
 * However, because of the way transactions are written, it's not actually easy to implement
 * transaction concatenation, so we would want to calculate a2' as piecewise rebases
 *
 * a2' = ((a2|inv(a1))|b1)|a1'
 *
 * which is unsatisfactory because a2|inv(a1) may well conflict even if a2|(inv(a1) * b1 * a1')
 * as a whole would not conflict (e.g. if b1 modifies only parts of the document distant from a1
 * and a2).
 *
 * So observe that by transaction commutivity we can rewrite a2' as:
 *
 * a2' := a2|(inv(a1) * a1 * b1|a1)
 * 	= a2|(b1|a1)
 *
 * and that b1|a1 conflicts only if a1|b1 conflicts (so this introduces no new conflicts). In
 * general we can write:
 *
 * a1' := a1|b1
 * b1' := b1|a1
 * a2' := a2|b1'
 * b1'' := b1'|a2
 * a3' := a3|b1''
 * b1''' := a1''|a3
 *
 * Continuing in this way, we obtain a1',...,aN' rebased over b1, and b1''''''' (N primes)
 * rebased onto a1 * ... * aN . Iteratively we can take the same approach to rebase over
 * b2,...,bM, giving both rebased lists as required.
 *
 * If any of the transaction rebases conflict, then we rebase the largest possible
 * non-conflicting initial segment b1,...,bK onto all of a1,...,aN (so clearly K < M).
 *
 * If there are two parallel inserts at the same location, then ordering is ambiguous. We
 * resolve this by putting the insert for the transaction with the highest author ID
 * first (Javascript less-than is used, so comparisons with a null author ID do not fail).
 * If the author IDs are the same, then A's insertion is put before B's.
 *
 * @param {ve.dm.Change} history Committed history
 * @param {ve.dm.Change} uncommitted New transactions, with same start as history
 * @return {Object} Rebased
 * @return {ve.dm.Change} return.rebased Rebase onto history of uncommitted (or an initial segment of it)
 * @return {ve.dm.Change} return.transposedHistory Rebase of history onto initial segment of uncommitted
 * @return {ve.dm.Change|null} return.rejected Unrebasable final segment of uncommitted
 */
ve.dm.Change.static.rebaseUncommittedChange = function ( history, uncommitted ) {
	var i, iLen, b, j, jLen, a, rebases, rebasedTransactionsA, rebased, transposedHistory,
		storeB, rebasedStoresA, storeA, author,
		transactionsA = history.transactions.slice(),
		transactionsB = uncommitted.transactions.slice(),
		storesA = history.stores.slice(),
		storesB = uncommitted.stores.slice(),
		selectionsA = OO.cloneObject( history.selections ),
		selectionsB = OO.cloneObject( uncommitted.selections ),
		rejected = null;

	if ( history.start !== uncommitted.start ) {
		throw new Error( 'Different starts: ' + history.start + ' and ' + uncommitted.start );
	}

	// For each element b_i of transactionsB, rebase the whole list transactionsA over b_i.
	// To rebase a1, a2, a3, ..., aN over b_i, first we rebase a1 onto b_i. Then we rebase
	// a2 onto some b', defined as
	//
	// b_i' := b_i|a1 , that is b_i.rebasedOnto(a1)
	//
	// (which as proven above is equivalent to inv(a1) * b_i * a1)
	//
	// Similarly we rebase a3 onto b_i'' := b_i'|a2, and so on.
	//
	// The rebased a_j are used for the transposed history: they will all get rebased over the
	// rest of transactionsB in the same way.
	// The fully rebased b_i forms the i'th element of the rebased transactionsB.
	//
	// If any rebase b_i|a_j fails, we stop rebasing at b_i (i.e. finishing with b_{i-1}).
	// We return
	// - rebased: (uncommitted sliced up to i) rebased onto history
	// - transposedHistory: history rebased onto (uncommitted sliced up to i)
	// - rejected: uncommitted sliced from i onwards
	bLoop:
	for ( i = 0, iLen = transactionsB.length; i < iLen; i++ ) {
		b = transactionsB[ i ];
		storeB = storesB[ i ];
		rebasedTransactionsA = [];
		rebasedStoresA = [];
		for ( j = 0, jLen = transactionsA.length; j < jLen; j++ ) {
			a = transactionsA[ j ];
			storeA = storesA[ j ];
			if ( b.author < a.author ) {
				rebases = ve.dm.Change.static.rebaseTransactions( b, a ).reverse();
			} else {
				rebases = ve.dm.Change.static.rebaseTransactions( a, b );
			}
			if ( rebases[ 0 ] === null ) {
				rejected = uncommitted.mostRecent( uncommitted.start + i );
				transactionsB.length = i;
				selectionsB = {};
				break bLoop;
			}
			rebasedTransactionsA[ j ] = rebases[ 0 ];
			rebasedStoresA[ j ] = storeA.difference( storeB );
			b = rebases[ 1 ];
			storeB = storeB.difference( storeA );
		}
		transactionsA = rebasedTransactionsA;
		storesA = rebasedStoresA;
		transactionsB[ i ] = b;
		storesB[ i ] = storeB;
	}

	// Length calculations below assume no removal of empty rebased transactions
	rebased = new ve.dm.Change(
		uncommitted.start + transactionsA.length,
		transactionsB,
		storesB,
		{}
	);
	transposedHistory = new ve.dm.Change(
		history.start + transactionsB.length,
		transactionsA,
		storesA,
		{}
	);
	for ( author in selectionsB ) {
		author = parseInt( author );
		rebased.selections[ author ] = selectionsB[ author ].translateByChange( transposedHistory, author );
	}
	for ( author in selectionsA ) {
		author = parseInt( author );
		transposedHistory.selections[ author ] = selectionsA[ author ].translateByChange( rebased, author );
	}
	return {
		rebased: rebased,
		transposedHistory: transposedHistory,
		rejected: rejected
	};
};

/* Methods */

/**
 * @return {boolean} True if this change has no transactions or selections
 */
ve.dm.Change.prototype.isEmpty = function () {
	return this.transactions.length === 0 && Object.keys( this.selections ).length === 0;
};

/**
 * @return {number} The number of transactions
 */
ve.dm.Change.prototype.getLength = function () {
	return this.transactions.length;
};

/**
 * @return {number|null} The first author in a transaction or selection change, or null if empty
 */
ve.dm.Change.prototype.firstAuthor = function () {
	var authors;
	if ( this.transactions.length ) {
		return this.transactions[ 0 ].author;
	}
	authors = Object.keys( this.selections );
	if ( authors.length ) {
		return parseInt( authors[ 0 ] );
	}
	return null;
};

/**
 * Get a human-readable summary of the change
 *
 * @return {string} Human-readable summary
 */
ve.dm.Change.prototype.summarize = function () {
	return '{ start: ' + this.start + ', txs: [ ' +
		this.transactions.map( function ( tx ) {
			return tx.summarize();
		} ).join( ', ' ) + ' ] }';
};

/**
 * Get the change that backs out this change.
 *
 * Note that applying it will not revert start or remove stored items
 *
 * @return {ve.dm.Change} The change that backs out this change
 */
ve.dm.Change.prototype.reversed = function () {
	return new ve.dm.Change(
		this.start + this.transactions.length,
		this.transactions.map( function ( tx ) {
			return ve.dm.Transaction.prototype.reversed.call( tx );
		} ).reverse(),
		// Empty store for each transaction (reverting cannot possibly add new annotations)
		this.transactions.map( function () {
			return new ve.dm.IndexValueStore();
		} ),
		{}
	);
};

/**
 * Rebase this change onto other (ready to apply on top of other)
 *
 * @param {ve.dm.Change} other Other change
 * @return {ve.dm.Change|null} Rebased change applicable on top of other, or null if rebasing fails
 * @throws {Error} If this change and other have different starts
 */
ve.dm.Change.prototype.rebasedOnto = function ( other ) {
	var rebases = this.constructor.static.rebaseUncommittedChange( other, this );
	return rebases.rejected ? null : rebases.rebased;
};

/**
 * Build a composite change from two consecutive changes
 *
 * @param {ve.dm.Change} other Change that starts immediately after this
 * @return {ve.dm.Change} Composite change
 * @throws {Error} If other does not start immediately after this
 */
ve.dm.Change.prototype.concat = function ( other ) {
	if ( other.start !== this.start + this.transactions.length ) {
		throw new Error( 'this ends at ' + ( this.start + this.transactions.length ) +
			' but other starts at ' + other.start );
	}
	return new ve.dm.Change(
		this.start,
		this.transactions.concat( other.transactions ),
		this.stores.concat( other.stores ),
		other.selections
	);
};

/**
 * Push another change onto this change
 *
 * @param {ve.dm.Change} other Change that starts immediately after this
 * @throws {Error} If other does not start immediately after this
 */
ve.dm.Change.prototype.push = function ( other ) {
	if ( other.start !== this.start + this.getLength() ) {
		throw new Error( 'this ends at ' + ( this.start + this.getLength() ) +
			' but other starts at ' + other.start );
	}
	Array.prototype.push.apply( this.transactions, other.transactions );
	Array.prototype.push.apply( this.stores, other.stores );
	this.selections = OO.cloneObject( other.selections );
};

/**
 * Build a composite change from two parallel changes
 *
 * @param {ve.dm.Change} other Change parallel to this
 * @return {ve.dm.Change} Composite change
 * @throws {Error} If this change and other have different starts
 */
ve.dm.Change.prototype.concatRebased = function ( other ) {
	return this.concat( other.rebasedOnto( this ) );
};

/**
 * Build a change from the last (most recent) transactions
 *
 * @param {number} start Start offset
 * @return {ve.dm.Change} Subset of this change with only the most recent transactions
 */
ve.dm.Change.prototype.mostRecent = function ( start ) {
	if ( arguments.length > 1 ) {
		throw new Error( 'storeStart is no longer needed' );
	}
	return new ve.dm.Change(
		start,
		this.transactions.slice( start - this.start ),
		this.stores.slice( start - this.start ),
		OO.cloneObject( this.selections )
	);
};

/**
 * Build a change from the first (least recent) transactions of this change.
 *
 * Always removes selections.
 *
 * @param {number} length Number of transactions
 * @return {ve.dm.Change} Subset of this change with only the least recent transactions
 */
ve.dm.Change.prototype.truncate = function ( length ) {
	if ( arguments.length > 1 ) {
		throw new Error( 'storeLength is no longer needed' );
	}
	return new ve.dm.Change(
		this.start,
		this.transactions.slice( 0, length ),
		this.stores.slice( 0, length ),
		{}
	);
};

/**
 * Apply change to surface
 *
 * @param {ve.dm.Surface} surface Surface in change start state
 */
ve.dm.Change.prototype.applyTo = function ( surface ) {
	this.stores.forEach( function ( store ) {
		surface.documentModel.store.merge( store );
	} );
	this.transactions.forEach( function ( tx ) {
		surface.change( tx );
		// Don't mark as applied: this.start already tracks this
		tx.applied = false;
	} );
};

/**
 * Unapply change to surface, including truncating history and store
 *
 * @param {ve.dm.Surface} surface Surface in change end state
 */
ve.dm.Change.prototype.unapplyTo = function ( surface ) {
	var doc = surface.documentModel,
		historyLength = doc.completeHistory.length - this.getLength(),
		storeLength = doc.store.getLength();
	this.stores.forEach( function ( store ) {
		storeLength -= store.getLength();
	} );
	this.transactions.slice().reverse().forEach( function ( tx ) {
		surface.change( tx.reversed() );
	} );
	doc.completeHistory.length = historyLength;
	doc.store.truncate( storeLength );
};

/**
 * Append change transactions to history
 *
 * @param {ve.dm.Document} documentModel
 * @throws {Error} If this change does not start at the top of the history
 */
ve.dm.Change.prototype.addToHistory = function ( documentModel ) {
	if ( this.start !== documentModel.completeHistory.length ) {
		throw new Error( 'this starts at ' + this.start +
			' but history ends at ' + documentModel.completeHistory.length );
	}
	// FIXME this code should probably be in dm.Document
	this.stores.forEach( function ( store ) {
		documentModel.store.merge( store );
	} );
	ve.batchPush( documentModel.completeHistory, this.transactions );
	documentModel.storeLengthAtHistoryLength[ documentModel.completeHistory.length ] = documentModel.store.getLength();
};

/**
 * Remove change transactions from history
 *
 * @param {ve.dm.Document} documentModel
 * @throws {Error} If this change does not end at the top of the history
 */
ve.dm.Change.prototype.removeFromHistory = function ( documentModel ) {
	var storeLength;
	if ( this.start + this.getLength() !== documentModel.completeHistory.length ) {
		throw new Error( 'this ends at ' + ( this.start + this.getLength() ) +
			' but history ends at ' + documentModel.completeHistory.length );
	}
	documentModel.completeHistory.length -= this.transactions.length;
	storeLength = documentModel.store.getLength();
	this.stores.forEach( function ( store ) {
		storeLength -= store.getLength();
	} );
	documentModel.store.truncate( storeLength );
};

/**
 * Serialize the change to a JSONable object
 *
 * Store values can be serialized, or kept verbatim (which only makes sense if they are serialized
 * already, i.e. the Change object was created by #deserialize without deserializing store values).
 *
 * @param {boolean} [preserveStoreValues] If true, keep store values verbatim instead of serializing
 * @return {ve.dm.Change} Deserialized change
 */
ve.dm.Change.prototype.serialize = function ( preserveStoreValues ) {
	var author, serializeStoreValues, serializeStore,
		selections = {};

	for ( author in this.selections ) {
		selections[ author ] = this.selections[ author ].toJSON();
	}
	serializeStoreValues = preserveStoreValues ? function noop( x ) {
		return x;
	} : this.constructor.static.serializeValue;
	serializeStore = function ( store ) {
		return store.serialize( serializeStoreValues );
	};
	return {
		start: this.start,
		transactions: this.transactions.map( function ( tx ) {
			return tx.serialize();
		} ),
		stores: this.stores.map( serializeStore ),
		selections: selections
	};
};

/*!
 * VisualEditor DataModel rebase document state class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-env node, es6 */

/**
 * DataModel rebase document state
 *
 * @class
 *
 * @constructor
 */
ve.dm.RebaseDocState = function VeDmRebaseDocState() {
	/**
	 * @property {ve.dm.Change} history History as one big change
	 */
	this.history = new ve.dm.Change( 0, [], [], {} );

	/**
	 * @property {Map.<number, Object>} authors Information about each author
	 */
	this.authors = new Map();
};

/* Inheritance */

OO.initClass( ve.dm.RebaseDocState );

/*!
 * VisualEditor DataModel rebase server class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */
/* eslint-env node, es6 */

/**
 * DataModel rebase server
 *
 * @class
 *
 * @constructor
 * @param {Function} [logCallback]
 */
ve.dm.RebaseServer = function VeDmRebaseServer( logCallback ) {
	this.stateForDoc = new Map();
	this.logEvent = logCallback || function () {};
};

OO.initClass( ve.dm.RebaseServer );

/* Methods */

/**
 * Get the state of a document by name.
 *
 * @param {string} doc Name of a document
 * @return {ve.dm.RebaseDocState} Document state
 */
ve.dm.RebaseServer.prototype.getDocState = function ( doc ) {
	if ( !this.stateForDoc.has( doc ) ) {
		this.stateForDoc.set( doc, new ve.dm.RebaseDocState() );
	}
	return this.stateForDoc.get( doc );
};

ve.dm.RebaseServer.prototype.getAuthorData = function ( doc, author ) {
	var state = this.getDocState( doc );
	if ( !state.authors.has( author ) ) {
		state.authors.set( author, {
			displayName: '',
			rejections: 0,
			continueBase: null,
			// TODO use cryptographic randomness here and convert to hex
			token: Math.random(),
			active: true
		} );
	}
	return state.authors.get( author );
};

/**
 * Update document history
 *
 * @param {string} doc Name of a document
 * @param {number} author Author ID
 * @param {ve.dm.Change} [newHistory] New history to append
 * @param {number} [rejections] Unacknowledged rejections for author
 * @param {ve.dm.Change} [continueBase] Continue base for author
 */
ve.dm.RebaseServer.prototype.updateDocState = function ( doc, author, newHistory, rejections, continueBase ) {
	var state = this.getDocState( doc ),
		authorData = state.authors.get( author );
	if ( newHistory ) {
		state.history.push( newHistory );
	}
	if ( rejections !== undefined ) {
		authorData.rejections = rejections;
	}
	if ( continueBase ) {
		authorData.continueBase = continueBase;
	}
};

ve.dm.RebaseServer.prototype.setAuthorName = function ( doc, authorId, authorName ) {
	var authorData = this.getAuthorData( doc, authorId );
	authorData.displayName = authorName;
};

ve.dm.RebaseServer.prototype.getAllNames = function ( doc ) {
	var result = {},
		state = this.getDocState( doc );
	state.authors.forEach( function ( authorData, authorId ) {
		if ( authorData.active ) {
			result[ authorId ] = authorData.displayName;
		}
	} );
	return result;
};

/**
 * Attempt to rebase and apply a change to a document.
 *
 * The change can be a new change, or a continued change. A continuated change means one that
 * follows on immediately from the author's last submitted change, other than possibly being
 * rebased onto some more recent committed history.
 *
 * @param {string} doc Document name
 * @param {number} author Author ID
 * @param {number} backtrack How many transactions are backtracked from the previous submission
 * @param {ve.dm.Change} change Change to apply
 * @return {ve.dm.Change} Accepted change (or initial segment thereof), as rebased
 */
ve.dm.RebaseServer.prototype.applyChange = function applyChange( doc, author, backtrack, change ) {
	var base, rejections, result, appliedChange,
		state = this.getDocState( doc ),
		authorData = this.getAuthorData( doc, author );

	base = authorData.continueBase || change.truncate( 0 );
	rejections = authorData.rejections || 0;
	if ( rejections > backtrack ) {
		// Follow-on does not fully acknowledge outstanding conflicts: reject entirely
		rejections = rejections - backtrack + change.transactions.length;
		this.updateDocState( doc, author, null, rejections, null );
		// FIXME argh this publishes an empty change, which is not what we want
		appliedChange = state.history.truncate( 0 );
	} else if ( rejections < backtrack ) {
		throw new Error( 'Backtrack=' + backtrack + ' > ' + rejections + '=rejections' );
	} else {
		if ( change.start > base.start ) {
			// Remote has rebased some committed changes into its history since base was built.
			// They are guaranteed to be equivalent to the start of base. See mathematical
			// docs for proof (Cuius rei demonstrationem mirabilem sane deteximus hanc marginis
			// exiguitas non caperet).
			base = base.mostRecent( change.start );
		}
		base = base.concat( state.history.mostRecent( base.start + base.getLength() ) );

		result = ve.dm.Change.static.rebaseUncommittedChange( base, change );
		rejections = result.rejected ? result.rejected.getLength() : 0;
		this.updateDocState( doc, author, result.rebased, rejections, result.transposedHistory );
		appliedChange = result.rebased;
	}
	this.logEvent( {
		type: 'applyChange',
		doc: doc,
		author: author,
		incoming: change,
		applied: appliedChange,
		backtrack: backtrack,
		rejections: rejections
	} );
	return appliedChange;
};

ve.dm.RebaseServer.prototype.removeAuthor = function ( doc, author ) {
	var state = this.getDocState( doc );
	state.authors.delete( author );
};

/*!
 * VisualEditor Range class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 *
 * @constructor
 * @param {number} [from=0] Anchor offset
 * @param {number} [to=from] Focus offset
 */
ve.Range = function VeRange( from, to ) {
	// For ease of debugging, check arguments.length when applying defaults, to preserve
	// invalid arguments such as undefined and NaN that indicate a programming error.
	// Range calculation errors can often propagate quite far before surfacing, so the
	// indication is important.
	this.from = arguments.length >= 1 ? from : 0;
	this.to = arguments.length >= 2 ? to : this.from;
	this.start = this.from < this.to ? this.from : this.to;
	this.end = this.from < this.to ? this.to : this.from;
};

/* Inheritance */

OO.initClass( ve.Range );

/**
 * @property {number} from Starting offset
 */

/**
 * @property {number} to Ending offset
 */

/**
 * @property {number} start Starting offset (the lesser of #to and #from)
 */

/**
 * @property {number} end Ending offset (the greater of #to and #from)
 */

/* Static Methods */

/**
 * Create a new range from a JSON serialization of a range
 *
 * @see ve.Range#toJSON
 *
 * @param {string} json JSON serialization
 * @return {ve.Range} New range
 */
ve.Range.static.newFromJSON = function ( json ) {
	return this.newFromHash( JSON.parse( json ) );
};

/**
 * Create a new range from a range hash object
 *
 * @see ve.Range#toJSON
 *
 * @param {Object} hash Hash object
 * @return {ve.Range} New range
 */
ve.Range.static.newFromHash = function ( hash ) {
	return new ve.Range( hash.from, hash.to );
};

/**
 * Create a range object that covers all of the given ranges.
 *
 * @static
 * @param {ve.Range[]} ranges Array of ve.Range objects (at least one)
 * @param {boolean} backwards Return a backwards range
 * @return {ve.Range} Range that spans all of the given ranges
 */
ve.Range.static.newCoveringRange = function ( ranges, backwards ) {
	var minStart, maxEnd, i, range;
	if ( ranges.length === 0 ) {
		throw new Error( 'newCoveringRange() requires at least one range' );
	}
	minStart = ranges[ 0 ].start;
	maxEnd = ranges[ 0 ].end;
	for ( i = 1; i < ranges.length; i++ ) {
		if ( ranges[ i ].start < minStart ) {
			minStart = ranges[ i ].start;
		}
		if ( ranges[ i ].end > maxEnd ) {
			maxEnd = ranges[ i ].end;
		}
	}
	if ( backwards ) {
		range = new ve.Range( maxEnd, minStart );
	} else {
		range = new ve.Range( minStart, maxEnd );
	}
	return range;
};

/* Methods */

/**
 * Get a clone.
 *
 * @return {ve.Range} Clone of range
 */
ve.Range.prototype.clone = function () {
	return new this.constructor( this.from, this.to );
};

/**
 * Check if an offset is within the range.
 *
 * Specifically we mean the whole element at a specific offset, so in effect
 * this is the same as #containsRange( new ve.Range( offset, offset + 1 ) ).
 *
 * @param {number} offset Offset to check
 * @return {boolean} If offset is within the range
 */
ve.Range.prototype.containsOffset = function ( offset ) {
	return offset >= this.start && offset < this.end;
};

/**
 * Check if another range is within the range.
 *
 * @param {ve.Range} range Range to check
 * @return {boolean} If other range is within the range
 */
ve.Range.prototype.containsRange = function ( range ) {
	return range.start >= this.start && range.end <= this.end;
};

/**
 * Check if another range is touching this one
 *
 * This includes ranges which touch this one, e.g. [1,3] & [3,5],
 * ranges which overlap this one, and ranges which cover
 * this one completely, e.g. [1,3] & [0,5].
 *
 * Useful for testing if two ranges can be joined (using #expand)
 *
 * @param {ve.Range} range Range to check
 * @return {boolean} If other range touches this range
 */
ve.Range.prototype.touchesRange = function ( range ) {
	return range.end >= this.start && range.start <= this.end;
};

/**
 * Check if another range overlaps this one
 *
 * This includes ranges which intersect this one, e.g. [1,3] & [2,4],
 * and ranges which cover this one completely, e.g. [1,3] & [0,5],
 * but *not* ranges which only touch, e.g. [0,2] & [2,4].
 *
 * @param {ve.Range} range Range to check
 * @return {boolean} If other range overlaps this range
 */
ve.Range.prototype.overlapsRange = function ( range ) {
	return range.end > this.start && range.start < this.end;
};

/**
 * Get the length of the range.
 *
 * @return {number} Length of range
 */
ve.Range.prototype.getLength = function () {
	return this.end - this.start;
};

/**
 * Gets a range with reversed direction.
 *
 * @return {ve.Range} A new range
 */
ve.Range.prototype.flip = function () {
	return new ve.Range( this.to, this.from );
};

/**
 * Get a range that's a translated version of this one.
 *
 * @param {number} distance Distance to move range by
 * @return {ve.Range} New translated range
 */
ve.Range.prototype.translate = function ( distance ) {
	return new ve.Range( this.from + distance, this.to + distance );
};

/**
 * Check if two ranges are equal, taking direction into account.
 *
 * @param {ve.Range|null} other
 * @return {boolean}
 */
ve.Range.prototype.equals = function ( other ) {
	return other && this.from === other.from && this.to === other.to;
};

/**
 * Check if two ranges are equal, ignoring direction.
 *
 * @param {ve.Range|null} other
 * @return {boolean}
 */
ve.Range.prototype.equalsSelection = function ( other ) {
	return other && this.end === other.end && this.start === other.start;
};

/**
 * Create a new range with a truncated length.
 *
 * @param {number} limit Maximum length of new range (negative for left-side truncation)
 * @return {ve.Range} A new range
 */
ve.Range.prototype.truncate = function ( limit ) {
	if ( limit >= 0 ) {
		return new ve.Range(
			this.start, Math.min( this.start + limit, this.end )
		);
	} else {
		return new ve.Range(
			Math.max( this.end + limit, this.start ), this.end
		);
	}
};

/**
 * Expand a range to include another range, preserving direction.
 *
 * @param {ve.Range} other Range to expand to include
 * @return {ve.Range} Range covering this range and other
 */
ve.Range.prototype.expand = function ( other ) {
	return ve.Range.static.newCoveringRange( [ this, other ], this.isBackwards() );
};

/**
 * Check if the range is collapsed.
 *
 * A collapsed range has equal start and end values making its length zero.
 *
 * @return {boolean} Range is collapsed
 */
ve.Range.prototype.isCollapsed = function () {
	return this.from === this.to;
};

/**
 * Check if the range is backwards, i.e. from > to
 *
 * @return {boolean} Range is backwards
 */
ve.Range.prototype.isBackwards = function () {
	return this.from > this.to;
};

/**
 * Get a object summarizing the range for JSON serialization
 *
 * @return {Object} Object for JSON serialization
 */
ve.Range.prototype.toJSON = function () {
	return {
		type: 'range',
		from: this.from,
		to: this.to
	};
};

/*!
 * VisualEditor Selection class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @abstract
 * @constructor
 * @param {ve.dm.Document} doc Document
 */
ve.dm.Selection = function VeDmSelection( doc ) {
	this.documentModel = doc;
};

/* Inheritance */

OO.initClass( ve.dm.Selection );

/* Static Properties */

ve.dm.Selection.static.type = null;

/* Static Methods */

/**
 * Create a new selection from a JSON serialization
 *
 * @param {ve.dm.Document} doc Document to create the selection on
 * @param {string|Object} json JSON serialization or hash object
 * @return {ve.dm.Selection} New selection
 * @throws {Error} Unknown selection type
 */
ve.dm.Selection.static.newFromJSON = function ( doc, json ) {
	var hash = typeof json === 'string' ? JSON.parse( json ) : json,
		constructor = ve.dm.selectionFactory.lookup( hash.type );

	if ( !constructor ) {
		throw new Error( 'Unknown selection type ' + hash.name );
	}

	return constructor.static.newFromHash( doc, hash );
};

/**
 * Create a new selection from a hash object
 *
 * @abstract
 * @method
 * @param {ve.dm.Document} doc Document to create the selection on
 * @param {Object} hash Hash object
 * @return {ve.dm.Selection} New selection
 */
ve.dm.Selection.static.newFromHash = null;

/* Methods */

/**
 * Test for selection equality
 */
ve.dm.Selection.prototype.equals = null;

/**
 * Get a JSON serialization of this selection
 *
 * @abstract
 * @method
 * @return {Object} Object for JSON serialization
 */
ve.dm.Selection.prototype.toJSON = null;

/**
 * Get a textual description of this selection, for debugging purposes
 *
 * @abstract
 * @method
 * @return {string} Textual description
 */
ve.dm.Selection.prototype.getDescription = null;

/**
 * Create a copy of this selection
 *
 * @abstract
 * @method
 * @return {ve.dm.Selection} Cloned selection
 */
ve.dm.Selection.prototype.clone = null;

/**
 * Get a new selection at the start point of this one
 *
 * @abstract
 * @method
 * @return {ve.dm.Selection} Collapsed selection
 */
ve.dm.Selection.prototype.collapseToStart = null;

/**
 * Get a new selection at the end point of this one
 *
 * @abstract
 * @method
 * @return {ve.dm.Selection} Collapsed selection
 */
ve.dm.Selection.prototype.collapseToEnd = null;

/**
 * Get a new selection at the 'from' point of this one
 *
 * @abstract
 * @method
 * @return {ve.dm.Selection} Collapsed selection
 */
ve.dm.Selection.prototype.collapseToFrom = null;

/**
 * Get a new selection at the 'to' point of this one
 *
 * @abstract
 * @method
 * @return {ve.dm.Selection} Collapsed selection
 */
ve.dm.Selection.prototype.collapseToTo = null;

/**
 * Check if a selection is collapsed
 *
 * @abstract
 * @method
 * @return {boolean} Selection is collapsed
 */
ve.dm.Selection.prototype.isCollapsed = null;

/**
 * Apply translations from a transaction
 *
 * @abstract
 * @method
 * @param {ve.dm.Transaction} tx Transaction
 * @param {boolean} [excludeInsertion] Do not grow to cover insertions at boundaries
 * @return {ve.dm.Selection} A new translated selection
 */
ve.dm.Selection.prototype.translateByTransaction = null;

/**
 * Apply translations from a transaction, with bias depending on author ID comparison
 *
 * @abstract
 * @method
 * @param {ve.dm.Transaction} tx Transaction
 * @param {number} author The selection's author ID
 * @return {ve.dm.Selection} A new translated selection
 */
ve.dm.Selection.prototype.translateByTransactionWithAuthor = null;

/**
 * Apply translations from a set of transactions
 *
 * @param {ve.dm.Transaction[]} txs Transactions
 * @param {boolean} [excludeInsertion] Do not grow to cover insertions at boundaries
 * @return {ve.dm.Selection} A new translated selection
 */
ve.dm.Selection.prototype.translateByTransactions = function ( txs, excludeInsertion ) {
	var i, l, selection = this;
	for ( i = 0, l = txs.length; i < l; i++ ) {
		selection = selection.translateByTransaction( txs[ i ], excludeInsertion );
	}
	return selection;
};

/**
 * Apply translations from a change
 *
 * @param {ve.dm.Change} change The change
 * @param {number} author The author ID of this selection
 * @return {ve.dm.Selection} A new translated selection
 */
ve.dm.Selection.prototype.translateByChange = function ( change, author ) {
	var i, len,
		selection = this;
	for ( i = 0, len = change.transactions.length; i < len; i++ ) {
		selection = selection.translateByTransactionWithAuthor(
			change.transactions[ i ],
			author
		);
	}
	return selection;
};

/**
 * Check if this selection is null
 *
 * @return {boolean} The selection is null
 */
ve.dm.Selection.prototype.isNull = function () {
	return false;
};

/**
 * Get the content ranges for this selection
 *
 * @abstract
 * @method
 * @return {ve.Range[]} Ranges
 */
ve.dm.Selection.prototype.getRanges = null;

/**
 * Get the covering linear range for this selection
 *
 * @abstract
 * @method
 * @return {ve.Range|null} Covering range, if not null
 */
ve.dm.Selection.prototype.getCoveringRange = null;

/**
 * Get the document model this selection applies to
 *
 * @return {ve.dm.Document} Document model
 */
ve.dm.Selection.prototype.getDocument = function () {
	return this.documentModel;
};

/**
 * Get the name of the selection type
 *
 * @return {string} Selection type name
 */
ve.dm.Selection.prototype.getName = function () {
	return this.constructor.static.name;
};

/**
 * Check if two selections are equal
 *
 * @abstract
 * @method
 * @param {ve.dm.Selection} other Other selection
 * @return {boolean} Selections are equal
 */
ve.dm.Selection.prototype.equals = null;

/* Factory */

ve.dm.selectionFactory = new OO.Factory();

/*!
 * VisualEditor Null Selection class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @extends ve.dm.Selection
 * @param {ve.dm.Document} doc
 * @constructor
 */
ve.dm.NullSelection = function VeDmNullSelection( doc ) {
	// Parent constructor
	ve.dm.NullSelection.super.call( this, doc );
};

/* Inheritance */

OO.inheritClass( ve.dm.NullSelection, ve.dm.Selection );

/* Static Properties */

ve.dm.NullSelection.static.name = 'null';

/* Static Methods */

/**
 * @inheritdoc
 */
ve.dm.NullSelection.static.newFromHash = function ( doc ) {
	return new ve.dm.NullSelection( doc );
};

/* Methods */

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.toJSON = function () {
	return {
		type: this.constructor.static.name
	};
};

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.getDescription = function () {
	return 'Null';
};

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.clone = function () {
	return new this.constructor( this.getDocument() );
};

ve.dm.NullSelection.prototype.collapseToStart = ve.dm.NullSelection.prototype.clone;

ve.dm.NullSelection.prototype.collapseToEnd = ve.dm.NullSelection.prototype.clone;

ve.dm.NullSelection.prototype.collapseToFrom = ve.dm.NullSelection.prototype.clone;

ve.dm.NullSelection.prototype.collapseToTo = ve.dm.NullSelection.prototype.clone;

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.isCollapsed = function () {
	return true;
};

ve.dm.NullSelection.prototype.translateByTransaction = ve.dm.NullSelection.prototype.clone;

ve.dm.NullSelection.prototype.translateByTransactionWithAuthor = ve.dm.NullSelection.prototype.clone;

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.getRanges = function () {
	return [];
};

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.getCoveringRange = function () {
	return null;
};

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.equals = function ( other ) {
	return this === other || (
		!!other &&
		other.constructor === this.constructor &&
		this.getDocument() === other.getDocument()
	);
};

/**
 * @inheritdoc
 */
ve.dm.NullSelection.prototype.isNull = function () {
	return true;
};

/* Registration */

ve.dm.selectionFactory.register( ve.dm.NullSelection );

/*!
 * VisualEditor Linear Selection class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @extends ve.dm.Selection
 * @constructor
 * @param {ve.dm.Document} doc Document
 * @param {ve.Range} range Range
 */
ve.dm.LinearSelection = function VeDmLinearSelection( doc, range ) {
	// Parent constructor
	ve.dm.LinearSelection.super.call( this, doc );

	this.range = range;
};

/* Inheritance */

OO.inheritClass( ve.dm.LinearSelection, ve.dm.Selection );

/* Static Properties */

ve.dm.LinearSelection.static.name = 'linear';

/* Static Methods */

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.static.newFromHash = function ( doc, hash ) {
	return new ve.dm.LinearSelection( doc, ve.Range.static.newFromHash( hash.range ) );
};

/* Methods */

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.toJSON = function () {
	return {
		type: this.constructor.static.name,
		range: this.range
	};
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.getDescription = function () {
	return 'Linear: ' + this.range.from + ' - ' + this.range.to;
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.clone = function () {
	return new this.constructor( this.getDocument(), this.getRange() );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.collapseToStart = function () {
	return new this.constructor( this.getDocument(), new ve.Range( this.getRange().start ) );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.collapseToEnd = function () {
	return new this.constructor( this.getDocument(), new ve.Range( this.getRange().end ) );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.collapseToFrom = function () {
	return new this.constructor( this.getDocument(), new ve.Range( this.getRange().from ) );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.collapseToTo = function () {
	return new this.constructor( this.getDocument(), new ve.Range( this.getRange().to ) );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.isCollapsed = function () {
	return this.getRange().isCollapsed();
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.translateByTransaction = function ( tx, excludeInsertion ) {
	return new this.constructor( this.getDocument(), tx.translateRange( this.getRange(), excludeInsertion ) );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.translateByTransactionWithAuthor = function ( tx, author ) {
	return new this.constructor( this.getDocument(), tx.translateRangeWithAuthor( this.getRange(), author ) );
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.getRanges = function () {
	return [ this.range ];
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.getCoveringRange = function () {
	return this.range;
};

/**
 * Get the range for this selection
 *
 * @return {ve.Range} Range
 */
ve.dm.LinearSelection.prototype.getRange = function () {
	return this.range;
};

/**
 * @inheritdoc
 */
ve.dm.LinearSelection.prototype.equals = function ( other ) {
	return this === other || (
		!!other &&
		other.constructor === this.constructor &&
		this.getDocument() === other.getDocument() &&
		this.getRange().equals( other.getRange() )
	);
};

/* Registration */

ve.dm.selectionFactory.register( ve.dm.LinearSelection );

/*!
 * VisualEditor Table Selection class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @extends ve.dm.Selection
 * @constructor
 * @param {ve.dm.Document} doc Document model
 * @param {ve.Range} tableRange Table range
 * @param {number} fromCol Starting column
 * @param {number} fromRow Starting row
 * @param {number} [toCol] End column
 * @param {number} [toRow] End row
 * @param {boolean} [expand] Expand the selection to include merged cells
 */
ve.dm.TableSelection = function VeDmTableSelection( doc, tableRange, fromCol, fromRow, toCol, toRow, expand ) {
	// Parent constructor
	ve.dm.TableSelection.super.call( this, doc );

	this.tableRange = tableRange;
	this.tableNode = null;

	toCol = toCol === undefined ? fromCol : toCol;
	toRow = toRow === undefined ? fromRow : toRow;

	this.fromCol = fromCol;
	this.fromRow = fromRow;
	this.toCol = toCol;
	this.toRow = toRow;
	this.startCol = fromCol < toCol ? fromCol : toCol;
	this.startRow = fromRow < toRow ? fromRow : toRow;
	this.endCol = fromCol < toCol ? toCol : fromCol;
	this.endRow = fromRow < toRow ? toRow : fromRow;
	this.intendedFromCol = this.fromCol;
	this.intendedFromRow = this.fromRow;
	this.intendedToCol = this.toCol;
	this.intendedToRow = this.toRow;

	if ( expand ) {
		this.expand();
	}
};

/* Inheritance */

OO.inheritClass( ve.dm.TableSelection, ve.dm.Selection );

/* Static Properties */

ve.dm.TableSelection.static.name = 'table';

/* Static Methods */

/**
 * @inheritdoc
 */
ve.dm.TableSelection.static.newFromHash = function ( doc, hash ) {
	return new ve.dm.TableSelection(
		doc,
		ve.Range.static.newFromHash( hash.tableRange ),
		hash.fromCol,
		hash.fromRow,
		hash.toCol,
		hash.toRow
	);
};

/* Methods */

/**
 * Expand the selection to cover all merged cells
 *
 * @private
 */
ve.dm.TableSelection.prototype.expand = function () {
	var cell, i,
		lastCellCount = 0,
		startCol = Infinity,
		startRow = Infinity,
		endCol = -Infinity,
		endRow = -Infinity,
		colBackwards = this.fromCol > this.toCol,
		rowBackwards = this.fromRow > this.toRow,
		cells = this.getMatrixCells();

	while ( cells.length > lastCellCount ) {
		for ( i = 0; i < cells.length; i++ ) {
			cell = cells[ i ];
			startCol = Math.min( startCol, cell.col );
			startRow = Math.min( startRow, cell.row );
			endCol = Math.max( endCol, cell.col + cell.node.getColspan() - 1 );
			endRow = Math.max( endRow, cell.row + cell.node.getRowspan() - 1 );
		}
		this.startCol = startCol;
		this.startRow = startRow;
		this.endCol = endCol;
		this.endRow = endRow;
		this.fromCol = colBackwards ? endCol : startCol;
		this.fromRow = rowBackwards ? endRow : startRow;
		this.toCol = colBackwards ? startCol : endCol;
		this.toRow = rowBackwards ? startRow : endRow;

		lastCellCount = cells.length;
		cells = this.getMatrixCells();
	}
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.clone = function () {
	return new this.constructor(
		this.getDocument(),
		this.tableRange,
		this.fromCol,
		this.fromRow,
		this.toCol,
		this.toRow
	);
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.toJSON = function () {
	return {
		type: this.constructor.static.name,
		tableRange: this.tableRange,
		fromCol: this.fromCol,
		fromRow: this.fromRow,
		toCol: this.toCol,
		toRow: this.toRow
	};
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.getDescription = function () {
	return (
		'Table: ' +
		this.tableRange.from + ' - ' + this.tableRange.to +
		', ' +
		'c' + this.fromCol + ' r' + this.fromRow +
		' - ' +
		'c' + this.toCol + ' r' + this.toRow
	);
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.collapseToStart = function () {
	return new this.constructor( this.getDocument(), this.tableRange, this.startCol, this.startRow, this.startCol, this.startRow );
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.collapseToEnd = function () {
	return new this.constructor( this.getDocument(), this.tableRange, this.endCol, this.endRow, this.endCol, this.endRow );
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.collapseToFrom = function () {
	return new this.constructor( this.getDocument(), this.tableRange, this.fromCol, this.fromRow, this.fromCol, this.fromRow );
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.collapseToTo = function () {
	return new this.constructor( this.getDocument(), this.tableRange, this.toCol, this.toRow, this.toCol, this.toRow );
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.getRanges = function () {
	var i, l, ranges = [],
		cells = this.getMatrixCells();
	for ( i = 0, l = cells.length; i < l; i++ ) {
		ranges.push( cells[ i ].node.getRange() );
	}
	return ranges;
};

/**
 * @inheritdoc
 *
 * Note that this returns the table range, and not the minimal range covering
 * all cells, as that would be far more expensive to compute.
 */
ve.dm.TableSelection.prototype.getCoveringRange = function () {
	return this.tableRange;
};

/**
 * Get all the ranges required to build a table slice from the selection
 *
 * In addition to the outer ranges of the cells, this also includes the start and
 * end tags of table rows, sections and the table itself.
 *
 * @return {ve.Range[]} Ranges
 */
ve.dm.TableSelection.prototype.getTableSliceRanges = function () {
	var i, node,
		ranges = [],
		matrix = this.getTableNode().getMatrix();

	// Arrays are non-overlapping so avoid duplication
	// by indexing by range.start
	function pushNode( node ) {
		var range = node.getOuterRange();
		ranges[ range.start ] = new ve.Range( range.start, range.start + 1 );
		ranges[ range.end - 1 ] = new ve.Range( range.end - 1, range.end );
	}

	// Get the start and end tags of every parent of the cell
	// up to and including the TableNode
	for ( i = this.startRow; i <= this.endRow; i++ ) {
		node = matrix.getRowNode( i );
		pushNode( node );
		while ( ( node = node.getParent() ) && node ) {
			pushNode( node );
			if ( node instanceof ve.dm.TableNode ) {
				break;
			}
		}
	}

	return ranges
		// Condense sparse array
		.filter( function ( r ) { return r; } )
		// Add cell ranges
		.concat( this.getOuterRanges() )
		// Sort
		.sort( function ( a, b ) { return a.start - b.start; } );
};

/**
 * Get outer ranges of the selected cells
 *
 * @return {ve.Range[]} Outer ranges
 */
ve.dm.TableSelection.prototype.getOuterRanges = function () {
	var i, l, ranges = [],
		cells = this.getMatrixCells();
	for ( i = 0, l = cells.length; i < l; i++ ) {
		ranges.push( cells[ i ].node.getOuterRange() );
	}
	return ranges;
};

/**
 * Retrieves all cells (no placeholders) within a given selection.
 *
 * @param {boolean} [includePlaceholders] Include placeholders in result
 * @return {ve.dm.TableMatrixCell[]} List of table cells
 */
ve.dm.TableSelection.prototype.getMatrixCells = function ( includePlaceholders ) {
	var row, col, cell,
		matrix = this.getTableNode().getMatrix(),
		cells = [],
		visited = {};

	for ( row = this.startRow; row <= this.endRow; row++ ) {
		for ( col = this.startCol; col <= this.endCol; col++ ) {
			cell = matrix.getCell( row, col );
			if ( !cell ) {
				continue;
			}
			if ( !includePlaceholders && cell.isPlaceholder() ) {
				cell = cell.owner;
			}
			if ( !visited[ cell.key ] ) {
				cells.push( cell );
				visited[ cell.key ] = true;
			}
		}
	}
	return cells;
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.isCollapsed = function () {
	return false;
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.translateByTransaction = function ( tx, excludeInsertion ) {
	var newRange = tx.translateRange( this.tableRange, excludeInsertion );

	if ( newRange.isCollapsed() ) {
		return new ve.dm.NullSelection( this.getDocument() );
	}
	return new this.constructor(
		this.getDocument(), newRange,
		this.fromCol, this.fromRow, this.toCol, this.toRow
	);
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.translateByTransactionWithAuthor = function ( tx, author ) {
	var newRange = tx.translateRangeWithAuthor( this.tableRange, author );

	if ( newRange.isCollapsed() ) {
		return new ve.dm.NullSelection( this.getDocument() );
	}
	return new this.constructor(
		this.getDocument(), newRange,
		this.fromCol, this.fromRow, this.toCol, this.toRow
	);
};

/**
 * Check if the selection spans a single cell
 *
 * @return {boolean} The selection spans a single cell
 */
ve.dm.TableSelection.prototype.isSingleCell = function () {
	// Quick check for single non-merged cell
	return ( this.fromRow === this.toRow && this.fromCol === this.toCol ) ||
		// Check for a merged single cell by ignoring placeholders
		this.getMatrixCells().length === 1;
};

/**
 * Check if the selection is mergeable or unmergeable
 *
 * The selection must span more than one matrix cell, but only
 * one table section.
 *
 * @return {boolean} The selection is mergeable or unmergeable
 */
ve.dm.TableSelection.prototype.isMergeable = function () {
	var r, sectionNode, lastSectionNode, matrix;

	if ( this.getMatrixCells( true ).length <= 1 ) {
		return false;
	}

	matrix = this.getTableNode().getMatrix();

	// Check all sections are the same
	for ( r = this.endRow; r >= this.startRow; r-- ) {
		sectionNode = matrix.getRowNode( r ).findParent( ve.dm.TableSectionNode );
		if ( lastSectionNode && sectionNode !== lastSectionNode ) {
			// Can't merge across sections
			return false;
		}
		lastSectionNode = sectionNode;
	}
	return true;
};

/**
 * Get the selection's table node
 *
 * @return {ve.dm.TableNode} Table node
 */
ve.dm.TableSelection.prototype.getTableNode = function () {
	if ( !this.tableNode ) {
		this.tableNode = this.getDocument().getBranchNodeFromOffset( this.tableRange.start + 1 );
	}
	return this.tableNode;
};

/**
 * Clone this selection with adjusted row and column positions
 *
 * Placeholder cells are skipped over so this method can be used for cursoring.
 *
 * @param {number} fromColOffset Starting column offset
 * @param {number} fromRowOffset Starting row offset
 * @param {number} [toColOffset] End column offset
 * @param {number} [toRowOffset] End row offset
 * @param {number} [wrap] Wrap to the next/previous row if column limits are exceeded
 * @return {ve.dm.TableSelection} Adjusted selection
 */
ve.dm.TableSelection.prototype.newFromAdjustment = function ( fromColOffset, fromRowOffset, toColOffset, toRowOffset, wrap ) {
	var fromCell, toCell, wrapDir,
		matrix = this.getTableNode().getMatrix();

	if ( toColOffset === undefined ) {
		toColOffset = fromColOffset;
	}

	if ( toRowOffset === undefined ) {
		toRowOffset = fromRowOffset;
	}

	function adjust( mode, cell, offset ) {
		var nextCell,
			col = cell.col,
			row = cell.row,
			dir = offset > 0 ? 1 : -1;

		while ( offset !== 0 ) {
			if ( mode === 'col' ) {
				col += dir;
				// Out of bounds
				if ( col >= matrix.getColCount( row ) ) {
					if ( wrap && row < matrix.getRowCount() - 1 ) {
						// Subtract columns in current row
						col -= matrix.getColCount( row );
						row++;
						wrapDir = 1;
					} else {
						break;
					}
				} else if ( col < 0 ) {
					if ( wrap && row > 0 ) {
						row--;
						// Add columns in previous row
						col += matrix.getColCount( row );
						wrapDir = -1;
					} else {
						break;
					}
				}
			} else {
				row += dir;
				if ( row >= matrix.getRowCount() || row < 0 ) {
					// Out of bounds
					break;
				}
			}
			nextCell = matrix.getCell( row, col );
			// Skip if same as current cell (i.e. merged cells), or null
			if ( !nextCell || nextCell.equals( cell ) ) {
				continue;
			}
			offset -= dir;
			cell = nextCell;
		}
		return cell;
	}

	fromCell = matrix.getCell( this.intendedFromRow, this.intendedFromCol );
	if ( fromColOffset ) {
		fromCell = adjust( 'col', fromCell, fromColOffset );
	}
	if ( fromRowOffset ) {
		fromCell = adjust( 'row', fromCell, fromRowOffset );
	}

	toCell = matrix.getCell( this.intendedToRow, this.intendedToCol );
	if ( toColOffset ) {
		toCell = adjust( 'col', toCell, toColOffset );
	}
	if ( toRowOffset ) {
		toCell = adjust( 'row', toCell, toRowOffset );
	}

	// Collapse to end/start if wrapping forwards/backwards
	if ( wrapDir > 0 ) {
		fromCell = toCell;
	} else if ( wrapDir < 0 ) {
		toCell = fromCell;
	}

	return new this.constructor(
		this.getDocument(),
		this.tableRange,
		fromCell.col,
		fromCell.row,
		toCell.col,
		toCell.row,
		true
	);
};

/**
 * @inheritdoc
 */
ve.dm.TableSelection.prototype.equals = function ( other ) {
	return this === other || (
		!!other &&
		other.constructor === this.constructor &&
		this.getDocument() === other.getDocument() &&
		this.tableRange.equals( other.tableRange ) &&
		this.fromCol === other.fromCol &&
		this.fromRow === other.fromRow &&
		this.toCol === other.toCol &&
		this.toRow === other.toRow
	);
};

/**
 * Get the number of rows covered by the selection
 *
 * @return {number} Number of rows covered
 */
ve.dm.TableSelection.prototype.getRowCount = function () {
	return this.endRow - this.startRow + 1;
};

/**
 * Get the number of columns covered by the selection
 *
 * @return {number} Number of columns covered
 */
ve.dm.TableSelection.prototype.getColCount = function () {
	return this.endCol - this.startCol + 1;
};

/**
 * Check if the table selection covers one or more full rows
 *
 * @return {boolean} The table selection covers one or more full rows
 */
ve.dm.TableSelection.prototype.isFullRow = function () {
	var matrix = this.getTableNode().getMatrix();
	return this.getColCount() === matrix.getMaxColCount();
};

/**
 * Check if the table selection covers one or more full columns
 *
 * @return {boolean} The table selection covers one or more full columns
 */
ve.dm.TableSelection.prototype.isFullCol = function () {
	var matrix = this.getTableNode().getMatrix();
	return this.getRowCount() === matrix.getRowCount();
};

/* Registration */

ve.dm.selectionFactory.register( ve.dm.TableSelection );
}( module.exports ) );
