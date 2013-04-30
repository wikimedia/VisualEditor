/*!
 * VisualEditor namespace.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

( function () {
	var ve, hasOwn;

	/**
	 * Namespace for all VisualEditor classes, static methods and static properties.
	 * @class
	 * @singleton
	 */
	ve = {
		// List of instances of ve.Surface
		'instances': []
		//'actionFactory' instantiated in ve.ActionFactory.js
	};

	/* Utility Functions */

	hasOwn = Object.prototype.hasOwnProperty;

	/* Static Methods */

	/**
	 * Create an object that inherits from another object.
	 *
	 * @method
	 * @until ES5: Object.create
	 * @source <https://github.com/Krinkle/K-js>
	 * @param {Object} origin Object to inherit from
	 * @return {Object} Empty object that inherits from origin
	 */
	ve.createObject = Object.create || function ( origin ) {
		function O() {}
		O.prototype = origin;
		var r = new O();

		return r;
	};

	/**
	 * Utility for common usage of ve.createObject for inheriting from one
	 * prototype to another.
	 *
	 * Beware: This redefines the prototype, call before setting your prototypes.
	 * Beware: This redefines the prototype, can only be called once on a function.
	 *  If called multiple times on the same function, the previous prototype is lost.
	 *  This is how prototypal inheritance works, it can only be one straight chain
	 *  (just like classical inheritance in PHP for example). If you need to work with
	 *  multiple constructors consider storing an instance of the other constructor in a
	 *  property instead, or perhaps use a mixin (see ve.mixinClass).
	 *
	 *     function Foo() {}
	 *     Foo.prototype.jump = function () {};
	 *
	 *     function FooBar() {}
	 *     ve.inheritClass( FooBar, Foo );
	 *     FooBar.prop.feet = 2;
	 *     FooBar.prototype.walk = function () {};
	 *
	 *     function FooBarQuux() {}
	 *     ve.inheritClass( FooBarQuux, FooBar );
	 *     FooBarQuux.prototype.jump = function () {};
	 *
	 *     FooBarQuux.prop.feet === 2;
	 *     var fb = new FooBar();
	 *     fb.jump();
	 *     fb.walk();
	 *     fb instanceof Foo && fb instanceof FooBar && fb instanceof FooBarQuux;
	 *
	 * @method
	 * @source <https://github.com/Krinkle/K-js>
	 * @param {Function} targetFn
	 * @param {Function} originFn
	 * @throws {Error} If target already inherits from origin
	 */
	ve.inheritClass = function ( targetFn, originFn ) {
		if ( targetFn.prototype instanceof originFn ) {
			throw new Error( 'Target already inherits from origin' );
		}

		// Doesn't really require ES5 (jshint/jshint#74@github)
		/*jshint es5: true */
		var targetConstructor = targetFn.prototype.constructor;

		targetFn.prototype = ve.createObject( originFn.prototype );

		// Restore constructor property of targetFn
		targetFn.prototype.constructor = targetConstructor;

		// Extend static properties
		originFn.static = originFn.static || {};
		targetFn.static = ve.createObject( originFn.static );

		// Copy mixin tracking
		targetFn.mixins = originFn.mixins ? originFn.mixins.slice( 0 ) : [];
	};

	/**
	 * Utility to copy over *own* prototype properties of a mixin.
	 * The 'constructor' (whether implicit or explicit) is not copied over.
	 *
	 * This does not create inheritance to the origin. If inheritance is needed
	 * use ve.inheritClass instead.
	 *
	 * Beware: This can redefine a prototype property, call before setting your prototypes.
	 * Beware: Don't call before ve.inheritClass.
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
	 *     ve.inheritClass( FooBar, Foo );
	 *     ve.mixinClass( FooBar, ContextLazyLoad );
	 *
	 * @method
	 * @source <https://github.com/Krinkle/K-js>
	 * @param {Function} targetFn
	 * @param {Function} originFn
	 */
	ve.mixinClass = function ( targetFn, originFn ) {
		var key;

		// Copy prototype properties
		for ( key in originFn.prototype ) {
			if ( key !== 'constructor' && hasOwn.call( originFn.prototype, key ) ) {
				targetFn.prototype[key] = originFn.prototype[key];
			}
		}

		// Copy static properties
		if ( originFn.static ) {
			targetFn.static = targetFn.static || {};
			for ( key in originFn.static ) {
				if ( hasOwn.call( originFn.static, key ) ) {
					targetFn.static[key] = originFn.static[key];
				}
			}
		}

		// Track mixins
		targetFn.mixins = targetFn.mixins || [];
		targetFn.mixins.push( originFn );
	};

	/**
	 * Check if a class or object uses a mixin.
	 *
	 * @param {Function|Object} a Class or object to check
	 * @param {Function} mixin Mixin to check for
	 * @return {Boolean} Class or object uses mixin
	 */
	ve.isMixedIn = function ( subject, mixin ) {
		if ( subject.constructor ) {
			subject = subject.constructor;
		}
		return subject.mixins && subject.mixins.indexOf( mixin ) !== -1;
	};

	/**
	 * Create a new object that is an instance of the same
	 * constructor as the input, inherits from the same object
	 * and contains the same own properties.
	 *
	 * This makes a shallow non-recursive copy of own properties.
	 * To create a recursive copy of plain objects, use ve.copyObject.
	 *
	 *     var foo = new Person( mom, dad );
	 *     foo.setAge( 21 );
	 *     var foo2 = ve.cloneObject( foo );
	 *     foo.setAge( 22 );
	 *
	 *     // Then
	 *     foo2 !== foo; // true
	 *     foo2 instanceof Person; // true
	 *     foo2.getAge(); // 21
	 *     foo.getAge(); // 22
	 *
	 * @method
	 * @source <https://github.com/Krinkle/K-js>
	 * @param {Object} origin
	 * @return {Object} Clone of origin
	 */
	ve.cloneObject = function ( origin ) {
		var key, r;

		r = ve.createObject( origin.constructor.prototype );

		for ( key in origin ) {
			if ( hasOwn.call( origin, key ) ) {
				r[key] = origin[key];
			}
		}

		return r;
	};

	/**
	 * Check to see if an object is a plain object (created using "{}" or "new Object").
	 *
	 * @method
	 * @source <http://api.jquery.com/jQuery.isPlainObject/>
	 * @param {Object} obj The object that will be checked to see if it's a plain object
	 * @return {boolean}
	 */
	ve.isPlainObject = $.isPlainObject;

	/**
	 * Check to see if an object is empty (contains no properties).
	 *
	 * @method
	 * @source <http://api.jquery.com/jQuery.isEmptyObject/>
	 * @param {Object} obj The object that will be checked to see if it's empty
	 * @return {boolean}
	 */
	ve.isEmptyObject = $.isEmptyObject;

	/**
	 * Check whether given variable is an array. Should not use `instanceof` or
	 * `constructor` due to the inability to detect arrays from a different
	 * scope.
	 *
	 * @method
	 * @source <http://api.jquery.com/jQuery.isArray/>
	 * @until ES5: Array.isArray
	 * @param {Mixed} x
	 * @return {boolean}
	 */
	ve.isArray = $.isArray;

	/**
	 * Create a function that calls the given function in a certain context.
	 * If a function does not have an explicit context, it is determined at
	 * execution time based on how it is invoked (e.g. object member, call/apply,
	 * global scope, etc.).
	 * Performance optimization: http://jsperf.com/function-bind-shim-perf
	 *
	 * @method
	 * @until ES5: Function.prototype.bind
	 * @param {Function} func Function to bind
	 * @param {Object} context Context for the function
	 * @param {Mixed...} [args] Variadic list of arguments to prepend to arguments
	 *   to the bound function
	 * @return {Function} The bound
	 */
	ve.bind = $.proxy;

	/**
	 * Wrapper for Array.prototype.indexOf.
	 *
	 * Values are compared without type coercion.
	 *
	 * @method
	 * @until ES5
	 * @param {Mixed} value Element to search for
	 * @param {Array} array Array to search in
	 * @param {number} [fromIndex=0] Index to being searching from
	 * @return {number} Index of value in array, or -1 if not found
	 */
	ve.indexOf = $.inArray;

	/**
	 * Array.prototype.filter
	 *
	 * @method
	 * @until ES5
	 * @param {Array} array Array to filter
	 * @param {Function} callback Callback to call on each element of array
	 * @param {Mixed} [context] Context (this object) for callback
	 * @returns {Array} Array of elements in array for which callback returned true
	 */
	ve.filterArray = function ( array, callback, context ) {
		var i, len, value, result = [];
		if ( array.filter ) {
			return array.filter( callback, context );
		} else {
			for ( i = 0, len = array.length; i < len; i++ ) {
				if ( i in array ) {
					value = array[i];
					if ( callback.call( context, value, i, array ) ) {
						result.push( value );
					}
				}
			}
			return result;
		}
	};

	/**
	 * Compute the union (duplicate-free merge) of a set of arrays.
	 *
	 * Arrays values must be convertable to object keys (strings)
	 *
	 * By building an object (with the values for keys) in parallel with
	 * the array, a new item's existence in the union can be computed faster
	 *
	 * @param {Array...} arrays Arrays to union
	 * @returns {Array} Union of the arrays
	 */
	ve.simpleArrayUnion = function () {
		var i, ilen, j, jlen, arr, obj = {}, result = [];
		for ( i = 0, ilen = arguments.length; i < ilen; i++ ) {
			arr = arguments[i];
			for ( j = 0, jlen = arr.length; j < jlen; j++ ) {
				if ( !obj[arr[j]] ) {
					obj[arr[j]] = true;
					result.push( arr[j] );
				}
			}
		}
		return result;
	};

	/**
	 * Compute the intersection of two arrays (items in both arrays).
	 *
	 * Arrays values must be convertable to object keys (strings)
	 *
	 * @param {Array} a First array
	 * @param {Array} b Second array
	 * @returns {Array} Intersection of arrays
	 */
	ve.simpleArrayIntersection = function ( a, b ) {
		return ve.simpleArrayCombine( a, b, true );
	};

	/**
	 * Compute the difference of two arrays (items in 'a' but not 'b').
	 *
	 * Arrays values must be convertable to object keys (strings)
	 *
	 * @param {Array} a First array
	 * @param {Array} b Second array
	 * @returns {Array} Intersection of arrays
	 */
	ve.simpleArrayDifference = function ( a, b ) {
		return ve.simpleArrayCombine( a, b, false );
	};

	/**
	 * Combine arrays (intersection or difference).
	 *
	 * An intersection checks the item exists in 'b' while difference checks it doesn't.
	 *
	 * Arrays values must be convertable to object keys (strings)
	 *
	 * By building an object (with the values for keys) of 'b' we can
	 * compute the result faster
	 *
	 * @param {Array} a First array
	 * @param {Array} b Second array
	 * @param {boolean} includeB Include items in 'b'
	 * @returns {Array} Combination (intersection or difference) of arrays
	 */
	ve.simpleArrayCombine = function ( a, b, includeB ) {
		var i, ilen, isInB, bObj = {}, result = [];
		for ( i = 0, ilen = b.length; i < ilen; i++ ) {
			bObj[b[i]] = true;
		}
		for ( i = 0, ilen = a.length; i < ilen; i++ ) {
			isInB = !!bObj[a[i]];
			if ( isInB === includeB ) {
				result.push( a[i] );
			}
		}
		return result;
	};

	/**
	 * Merge properties of one or more objects into another.
	 * Preserves original object's inheritance (e.g. Array, Object, whatever).
	 * In case of array or array-like objects only the indexed properties
	 * are copied over.
	 * Beware: If called with only one argument, it will consider
	 * 'target' as 'source' and 'this' as 'target'. Which means
	 * ve.extendObject( { a: 1 } ); sets ve.a = 1;
	 *
	 * @method
	 * @param {boolean} [recursive=false]
	 * @param {Mixed} [target] Object that will receive the new properties
	 * @param {Mixed...} [sources] Variadic list of objects containing properties
	 * to be merged into the targe.
	 * @return {Mixed} Modified version of first or second argument
	 */
	ve.extendObject = $.extend;

	/**
	 * Generates a hash of an object based on its name and data.
	 * Performance optimization: http://jsperf.com/ve-gethash-201208#/toJson_fnReplacerIfAoForElse
	 *
	 * To avoid two objects with the same values generating different hashes, we utilize the replacer
	 * argument of JSON.stringify and sort the object by key as it's being serialized. This may or may
	 * not be the fastest way to do this; we should investigate this further.
	 *
	 * Objects and arrays are hashed recursively. When hashing an object that has a .getHash()
	 * function, we call that function and use its return value rather than hashing the object
	 * ourselves. This allows classes to define custom hashing.
	 *
	 * @method
	 * @param {Object} val Object to generate hash for
	 * @returns {string} Hash of object
	 */
	ve.getHash = function ( val ) {
		return JSON.stringify( val, ve.getHash.keySortReplacer );
	};

	/**
	 * Helper function for ve.getHash which sorts objects by key.
	 *
	 * This is a callback passed into JSON.stringify.
	 *
	 * @method
	 * @param {string} key Property name of value being replaced
	 * @param {Mixed} val Property value to replace
	 * @returns {Mixed} Replacement value
	 */
	ve.getHash.keySortReplacer = function ( key, val ) {
		var normalized, keys, i, len;
		if ( val && typeof val.getHashObject === 'function' ) {
			// This object has its own custom hash function, use it
			val = val.getHashObject();
		}
		if ( !ve.isArray( val ) && Object( val ) === val ) {
			// Only normalize objects when the key-order is ambiguous
			// (e.g. any object not an array).
			normalized = {};
			keys = ve.getObjectKeys( val ).sort();
			i = 0;
			len = keys.length;
			for ( ; i < len; i += 1 ) {
				normalized[keys[i]] = val[keys[i]];
			}
			return normalized;

		// Primitive values and arrays get stable hashes
		// by default. Lets those be stringified as-is.
		} else {
			return val;
		}
	};

	/**
	 * Gets an array of all property names in an object.
	 *
	 * This falls back to the native impelentation of Object.keys if available.
	 * Performance optimization: http://jsperf.com/object-keys-shim-perf#/fnHasown_fnForIfcallLength
	 *
	 * @method
	 * @until ES5
	 * @param {Object} Object to get properties from
	 * @returns {string[]} List of object keys
	 */
	ve.getObjectKeys = Object.keys || function ( obj ) {
		var key, keys;

		if ( Object( obj ) !== obj ) {
			throw new TypeError( 'Called on non-object' );
		}

		keys = [];
		for ( key in obj ) {
			if ( hasOwn.call( obj, key ) ) {
				keys[keys.length] = key;
			}
		}

		return keys;
	};

	/**
	 * Gets an array of all property values in an object.
	 *
	 * @method
	 * @param {Object} Object to get values from
	 * @returns {Array} List of object values
	 */
	ve.getObjectValues = function ( obj ) {
		var key, values;

		if ( Object( obj ) !== obj ) {
			throw new TypeError( 'Called on non-object' );
		}

		values = [];
		for ( key in obj ) {
			if ( hasOwn.call( obj, key ) ) {
				values[values.length] = obj[key];
			}
		}

		return values;
	};

	/**
	 * Recursively compares string and number property between two objects.
	 *
	 * A false result may be caused by property inequality or by properties in one object missing from
	 * the other. An asymmetrical test may also be performed, which checks only that properties in the
	 * first object are present in the second object, but not the inverse.
	 *
	 * @method
	 * @param {Object} a First object to compare
	 * @param {Object} b Second object to compare
	 * @param {boolean} [asymmetrical] Whether to check only that b contains values from a
	 * @returns {boolean} If the objects contain the same values as each other
	 */
	ve.compareObjects = function ( a, b, asymmetrical ) {
		var aValue, bValue, aType, bType, k;
		for ( k in a ) {
			aValue = a[k];
			bValue = b[k];
			aType = typeof aValue;
			bType = typeof bValue;
			if ( aType !== bType ||
				( ( aType === 'string' || aType === 'number' ) && aValue !== bValue ) ||
				( ve.isPlainObject( aValue ) && !ve.compareObjects( aValue, bValue ) ) ) {
				return false;
			}
		}
		// If the check is not asymmetrical, recursing with the arguments swapped will verify our result
		return asymmetrical ? true : ve.compareObjects( b, a, true );
	};

	/**
	 * Recursively compare two arrays.
	 *
	 * @method
	 * @param {Array} a First array to compare
	 * @param {Array} b Second array to compare
	 * @param {boolean} [objectsByValue] Use ve.compareObjects() to compare objects instead of ===
	 */
	ve.compareArrays = function ( a, b, objectsByValue ) {
		var i,
			aValue,
			bValue,
			aType,
			bType;
		if ( a.length !== b.length ) {
			return false;
		}
		for ( i = 0; i < a.length; i++ ) {
			aValue = a[i];
			bValue = b[i];
			aType = typeof aValue;
			bType = typeof bValue;
			if (
				aType !== bType ||
				!(
					(
						ve.isArray( aValue ) &&
						ve.isArray( bValue ) &&
						ve.compareArrays( aValue, bValue )
					) ||
					(
						objectsByValue &&
						ve.isPlainObject( aValue ) &&
						ve.compareObjects( aValue, bValue )
					) ||
					aValue === bValue
				)
			) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Gets a deep copy of an array's string, number, array, plain-object and cloneable object contents.
	 *
	 * @method
	 * @param {Array} source Array to copy
	 * @param {Function} [callback] Applied to leaf values before they added to the clone
	 * @returns {Array} Copy of source array
	 */
	ve.copyArray = function ( source, callback ) {
		var i, sourceValue, sourceType,
			destination = [];
		for ( i = 0; i < source.length; i++ ) {
			sourceValue = source[i];
			sourceType = typeof sourceValue;
			if ( ve.isPlainObject( sourceValue ) ) {
				destination.push( ve.copyObject( sourceValue, callback ) );
			} else if ( ve.isArray( sourceValue ) ) {
				destination.push( ve.copyArray( sourceValue, callback ) );
			} else if ( sourceValue && typeof sourceValue.clone === 'function' ) {
				destination.push( callback ? callback( sourceValue.clone() ) : sourceValue.clone() );
			} else if ( sourceValue && typeof sourceValue.cloneNode === 'function' ) {
				destination.push( callback ? callback( sourceValue.cloneNode( true ) ) : sourceValue.cloneNode( true ) );
			} else {
				destination.push( callback ? callback( sourceValue ) : sourceValue );
			}
		}
		return destination;
	};

	/**
	 * Gets a deep copy of an object's string, number, array and plain-object properties.
	 *
	 * @method
	 * @param {Object} source Object to copy
	 * @param {Function} [callback] Applied to leaf values before they added to the clone
	 * @returns {Object} Copy of source object
	 */
	ve.copyObject = function ( source, callback ) {
		var key, sourceValue, sourceType,
			destination = {};
		if ( typeof source.clone === 'function' ) {
			return source.clone();
		}
		for ( key in source ) {
			sourceValue = source[key];
			sourceType = typeof sourceValue;
			if ( ve.isPlainObject( sourceValue ) ) {
				destination[key] = ve.copyObject( sourceValue, callback );
			} else if ( ve.isArray( sourceValue ) ) {
				destination[key] = ve.copyArray( sourceValue, callback );
			} else if ( sourceValue && typeof sourceValue.clone === 'function' ) {
				destination[key] = callback ? callback( sourceValue.clone() ) : sourceValue.clone();
			} else if ( sourceValue && typeof sourceValue.cloneNode === 'function' ) {
				destination[key] = callback ? callback( sourceValue.cloneNode( true ) ) : sourceValue.cloneNode( true );
			} else {
				destination[key] = callback ? callback( sourceValue ) : sourceValue;
			}
		}
		return destination;
	};

	/**
	 * Splice one array into another.
	 *
	 * This is the equivalent of arr.splice( offset, remove, d1, d2, d3, ... ) except that arguments are
	 * specified as an array rather than separate parameters.
	 *
	 * This method has been proven to be faster than using slice and concat to create a new array, but
	 * performance tests should be conducted on each use of this method to verify this is true for the
	 * particular use. Also, browsers change fast, never assume anything, always test everything.
	 *
	 * @method
	 * @param {Array} arr Array to remove from and insert into. Will be modified
	 * @param {number} offset Offset in arr to splice at. This may NOT be negative, unlike the
	 *                         'index' parameter in Array.prototype.splice
	 * @param {number} remove Number of elements to remove at the offset. May be zero
	 * @param {Array} data Array of items to insert at the offset. May not be empty if remove=0
	 * @returns {Array} Array of items removed
	 */
	ve.batchSplice = function ( arr, offset, remove, data ) {
		// We need to splice insertion in in batches, because of parameter list length limits which vary
		// cross-browser - 1024 seems to be a safe batch size on all browsers
		var index = 0, batchSize = 1024, toRemove = remove, spliced, removed = [];
		if ( data.length === 0 ) {
			// Special case: data is empty, so we're just doing a removal
			// The code below won't handle that properly, so we do it here
			return arr.splice( offset, remove );
		}
		while ( index < data.length ) {
			// Call arr.splice( offset, remove, i0, i1, i2, ..., i1023 );
			// Only set remove on the first call, and set it to zero on subsequent calls
			spliced = arr.splice.apply(
				arr, [index + offset, toRemove].concat( data.slice( index, index + batchSize ) )
			);
			if ( toRemove > 0 ) {
				removed = spliced;
			}
			index += batchSize;
			toRemove = 0;
		}
		return removed;
	};

	/**
	 * Insert one array into another. This just calls `ve.batchSplice( dst, offset, 0, src )`.
	 *
	 * @method
	 * @see #batchSplice
	 */
	ve.insertIntoArray = function ( dst, offset, src ) {
		ve.batchSplice( dst, offset, 0, src );
	};

	/**
	 * Get a deeply nested property of an object using variadic arguments, protecting against
	 * undefined property errors.
	 *
	 * `quux = getProp( obj, 'foo', 'bar', 'baz' );` is equivalent to `quux = obj.foo.bar.baz;`
	 * except that the former protects against JS errors if one of the intermediate properties
	 * is undefined. Instead of throwing an error, this function will return undefined in
	 * that case.
	 *
	 * @param {Object} obj
	 * @param {Mixed...} [keys]
	 * @returns obj[arguments[1]][arguments[2]].... or undefined
	 */
	ve.getProp = function ( obj ) {
		var i, retval = obj;
		for ( i = 1; i < arguments.length; i++ ) {
			if ( retval === undefined || retval === null ) {
				// Trying to access a property of undefined or null causes an error
				return undefined;
			}
			retval = retval[arguments[i]];
		}
		return retval;
	};

	/**
	 * Set a deeply nested property of an object using variadic arguments, protecting against
	 * undefined property errors.
	 *
	 * `ve.setProp( obj, 'foo', 'bar', 'baz' );` is equivalent to `obj.foo.bar = baz;` except that
	 * the former protects against JS errors if one of the intermediate properties is
	 * undefined. Instead of throwing an error, undefined intermediate properties will be
	 * initialized to an empty object. If an intermediate property is null, or if obj itself
	 * is undefined or null, this function will silently abort.
	 *
	 * @param {Object} obj
	 * @param {Mixed...} [keys]
	 * @param {Mixed} [value]
	 */
	ve.setProp = function ( obj /*, keys ... , value */ ) {
		var i, prop = obj;
		if ( Object( obj ) !== obj ) {
			return;
		}
		for ( i = 1; i < arguments.length - 2; i++ ) {
			if ( prop[arguments[i]] === undefined ) {
				prop[arguments[i]] = {};
			}
			if ( prop[arguments[i]] === null || typeof prop[arguments[i]] !== 'object' ) {
				return;
			}
			prop = prop[arguments[i]];
		}
		prop[arguments[arguments.length - 2]] = arguments[arguments.length - 1];
	};

	/**
	 * Logs data to the console.
	 *
	 * This implementation does nothing, to add a real implmementation ve.debug needs to be loaded.
	 *
	 * @method
	 * @param {Mixed...} [args] Data to log
	 */
	ve.log = function () {
		// don't do anything, this is just a stub
	};

	/**
	 * Logs an object to the console.
	 *
	 * This implementation does nothing, to add a real implmementation ve.debug needs to be loaded.
	 *
	 * @method
	 * @param {Object} obj
	 */
	ve.dir = function () {
		// don't do anything, this is just a stub
	};

	/**
	 * Ported from: http://underscorejs.org/underscore.js
	 *
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing.
	 *
	 * @method
	 * @param func
	 * @param wait
	 * @param immediate
	 */
	ve.debounce = function ( func, wait, immediate ) {
		var timeout;
		return function () {
			var context = this,
				args = arguments,
				later = function () {
					timeout = null;
					if ( !immediate ) {
						func.apply( context, args );
					}
				};
			if ( immediate && !timeout ) {
				func.apply( context, args );
			}
			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
		};
	};

	/**
	 * Gets a localized message.
	 *
	 * @method
	 * @param {string} key Message key
	 * @param {Mixed...} [params] Message parameters
	 */
	ve.msg = function () {
		// Avoid using ve.bind because ve.init.platform doesn't exist yet.
		// TODO: Fix dependency issues between ve.js and ve.init.platform
		return ve.init.platform.getMessage.apply( ve.init.platform, arguments );
	};

	/**
	 * Escapes non-word characters so they can be safely used as HTML attribute values.
	 *
	 * This method is basically a copy of mw.html.escape.
	 *
	 * @see #escapeHtml_escapeHtmlCharacter
	 * @method
	 * @param {string} value Attribute value to escape
	 * @returns {string} Escaped attribute value
	 */
	ve.escapeHtml = function ( value ) {
		return value.replace( /['"<>&]/g, ve.escapeHtml.escapeHtmlCharacter );
	};

	/**
	 * Helper function for ve.escapeHtml which escapes a character for use in HTML.
	 *
	 * This is a callback passed into String.prototype.replace.
	 *
	 * @method escapeHtml_escapeHtmlCharacter
	 * @private
	 * @param {string} key Property name of value being replaced
	 * @returns {string} Escaped charcater
	 */
	ve.escapeHtml.escapeHtmlCharacter = function ( value ) {
		switch ( value ) {
			case '\'':
				return '&#039;';
			case '"':
				return '&quot;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			default:
				return value;
		}
	};

	/**
	 * Generate an opening HTML tag.
	 *
	 * This method copies part of mw.html.element() in MediaWiki.
	 *
	 * NOTE: While the values of attributes are escaped, the tag name and the names of
	 * attributes (i.e. the keys in the attributes objects) are NOT ESCAPED. The caller is
	 * responsible for making sure these are sane tag/attribute names and do not contain
	 * unsanitized content from an external source (e.g. from the user or from the web).
	 *
	 * @param {string} tag HTML tag name
	 * @param {Object} attributes Key-value map of attributes for the tag
	 * @return {string} Opening HTML tag
	 */
	ve.getOpeningHtmlTag = function ( tagName, attributes ) {
		var html, attrName, attrValue;
		html = '<' + tagName;
		for ( attrName in attributes ) {
			attrValue = attributes[attrName];
			if ( attrValue === true ) {
				// Convert name=true to name=name
				attrValue = attrName;
			} else if ( attrValue === false ) {
				// Skip name=false
				continue;
			}
			html += ' ' + attrName + '="' + ve.escapeHtml( String( attrValue ) ) + '"';
		}
		html += '>';
		return html;
	};

	/**
	 * Get the attributes of a DOM element as an object with key/value pairs
	 * @param {HTMLElement} element
	 * @returns {Object}
	 */
	ve.getDomAttributes = function ( element ) {
		var result = {}, i;
		for ( i = 0; i < element.attributes.length; i++ ) {
			result[element.attributes[i].name] = element.attributes[i].value;
		}
		return result;
	};

	/**
	 * Set the attributes of a DOM element as an object with key/value pairs
	 *
	 * @param {HTMLElement} element DOM element to apply attributes to
	 * @param {Object} attributes Attributes to apply
	 * @param {string[]} [whitelist] List of attributes to exclusively allow (all lower case names)
	 */
	ve.setDomAttributes = function ( element, attributes, whitelist ) {
		var key;
		// Duck-typing for attribute setting
		if ( !element.setAttribute || !element.removeAttribute ) {
			return;
		}
		for ( key in attributes ) {
			if ( attributes[key] === undefined || attributes[key] === null ) {
				element.removeAttribute( key );
			} else {
				if ( whitelist && whitelist.indexOf( key.toLowerCase() ) === -1 ) {
					continue;
				}
				element.setAttribute( key, attributes[key] );
			}
		}
	};

	/**
	 * Check whether a given DOM element is of a block or inline type
	 * @param {HTMLElement} element
	 * @returns {boolean} True if element is block, false if it is inline
	 */
	ve.isBlockElement = function ( element ) {
		return ve.isBlockElementType( element.nodeName.toLowerCase() );
	};

	/**
	 * Check whether a given tag name is a block or inline tag
	 * @param {string} nodeName All-lowercase HTML tag name
	 * @returns {boolean} True if block, false if inline
	 */
	ve.isBlockElementType = function ( nodeName ) {
		return ve.indexOf( nodeName, ve.isBlockElementType.blockTypes ) !== -1;
	};

	/**
	 * Private data for ve.isBlockElementType()
	 */
	ve.isBlockElementType.blockTypes = [
		'div', 'p',
		// tables
		'table', 'tbody', 'thead', 'tfoot', 'caption', 'th', 'tr', 'td',
		// lists
		'ul', 'ol', 'li', 'dl', 'dt', 'dd',
		// HTML5 heading content
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
		// HTML5 sectioning content
		'article', 'aside', 'body', 'nav', 'section', 'footer', 'header', 'figure',
		'figcaption', 'fieldset', 'details', 'blockquote',
		// other
		'hr', 'button', 'canvas', 'center', 'col', 'colgroup', 'embed',
		'map', 'object', 'pre', 'progress', 'video'
	];

	/**
	 * Create an HTMLDocument from an HTML string
	 *
	 * The html parameter is supposed to be a full HTML document with a doctype and an `<html>` tag.
	 * If you pass a document fragment, it may or may not work, this is at the mercy of the browser.
	 *
	 * To create an empty document, pass the empty string.
	 *
	 * @param {string} html HTML string
	 * @returns {HTMLDocument} Document constructed from the HTML string
	 */
	ve.createDocumentFromHTML = function ( html ) {
		// Here's how this function should look:
		//
		//     var newDocument = document.implementation.createHTMLDocument( '' );
		//     newDocument.open();
		//     newDocument.write( html );
		//     newDocument.close();
		//     return newDocument;
		//
		// (Or possibly something involving DOMParser.prototype.parseFromString, but that's Firefox-only
		// for now.)
		//
		// Sadly, it's impossible:
		// * On IE 9, calling open()/write() on such a document throws an "Unspecified error" (sic).
		// * On Firefox 20, calling open()/write() doesn't actually do anything, including writing.
		//   This is reported as Firefox bug 867102.
		// * On Opera 12, calling open()/write() behaves as if called on window.document, replacing the
		//   entire contents of the page with new HTML. This is reported as Opera bug DSK-384486.
		//
		// Funnily, in all of those browsers it's apparently perfectly legal and possible to access the
		// newly created document's DOM itself, including modifying documentElement's innerHTML, which
		// would achieve our goal. But that requires some nasty magic to strip off the <html></html> tag
		// itself, so we're not doing that. (We can't use .outerHTML, either, as the spec disallows
		// assigning to it for the root element.)
		//
		// There is one more way - create an <iframe>, append it to current document, and access its
		// contentDocument. The only browser having issues with that is Opera (sometimes the accessible
		// value is not actually a Document, but something which behaves just like an empty regular
		// object...), so we're detecting that and using the innerHTML hack described above.

		// Create an invisible iframe
		var newDocument, $iframe = $( '<iframe frameborder="0" width="0" height="0" />'),
			iframe = $iframe.get( 0 );
		// Attach it to the document. We have to do this to get a new document out of it
		document.documentElement.appendChild( iframe );
		// Write the HTML to it
		newDocument = ( iframe.contentWindow && iframe.contentWindow.document ) || iframe.contentDocument;
		newDocument.open();
		newDocument.write( html ); // Party like it's 1995!
		newDocument.close();
		// Detach the iframe
		// FIXME detaching breaks access to newDocument in IE
		iframe.parentNode.removeChild( iframe );

		if ( !newDocument.body ) {
			// Surprise! The document is not a document!
			// Fun fact: this never happens on Opera when debugging with Dragonfly.
			newDocument = document.implementation.createHTMLDocument( '' );
			// Carefully unwrap the HTML out of the root node (and doctype, if any).
			// <html> might have some arguments here, but they're apparently not important.
			html = html.replace(/^\s*(?:<!doctype[^>]*>)?\s*<html[^>]*>/i, '' );
			html = html.replace(/<\/html>\s*$/i, '' );
			newDocument.documentElement.innerHTML = html;
		}

		return newDocument;
	};

	/**
	 * Get the actual inner HTML of a DOM node.
	 *
	 * In most browsers, .innerHTML is broken and eats newlines in `<pre>`s, see
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=838954 . This function detects this behavior
	 * and works around it, to the extent possible. `<pre>\nFoo</pre>` will become `<pre>Foo</pre>`
	 * if the browser is broken, but newlines are preserved in all other cases.
	 *
	 * @param {HTMLElement} element HTML element to get inner HTML of
	 * @returns {string} Inner HTML
	 */
	ve.properInnerHTML = function ( element ) {
		var div, $element;
		if ( ve.isPreInnerHTMLBroken === undefined ) {
			// Test whether newlines in `<pre>` are serialized back correctly
			div = document.createElement( 'div' );
			div.innerHTML = '<pre>\n\n</pre>';
			ve.isPreInnerHTMLBroken = div.innerHTML === '<pre>\n</pre>';
		}

		if ( !ve.isPreInnerHTMLBroken ) {
			return element.innerHTML;
		}

		// Workaround for bug 42469: if a `<pre>` starts with a newline, that means .innerHTML will
		// screw up and stringify it with one fewer newline. Work around this by adding a newline.
		// If we don't see a leading newline, we still don't know if the original HTML was
		// `<pre>Foo</pre>` or `<pre>\nFoo</pre>` , but that's a syntactic difference, not a
		// semantic one, and handling that is Parsoid's job.
		$element = $( element ).clone();
		$element.find( 'pre, textarea, listing' ).each( function() {
			var matches;
			if ( this.firstChild && this.firstChild.nodeType === Node.TEXT_NODE ) {
				matches = this.firstChild.data.match( /^(\r\n|\r|\n)/ );
				if ( matches && matches[1] ) {
					// Prepend a newline exactly like the one we saw
					this.firstChild.insertData( 0, matches[1] );
				}
			}
		} );
		return $element.get( 0 ).innerHTML;
	};

	// Based on the KeyEvent DOM Level 3 (add more as you need them)
	// http://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010410/DOM3-Events.html#events-Events-KeyEvent
	ve.Keys = window.KeyEvent || {
		'DOM_VK_UNDEFINED': 0,
		'DOM_VK_BACK_SPACE': 8,
		'DOM_VK_RETURN': 13,
		'DOM_VK_LEFT': 37,
		'DOM_VK_UP': 38,
		'DOM_VK_RIGHT': 39,
		'DOM_VK_DOWN': 40,
		'DOM_VK_DELETE': 46
	};

	// Expose
	window.ve = ve;
}() );
