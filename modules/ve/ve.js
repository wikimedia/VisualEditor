/**
 * VisualEditor namespace.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Namespace for all VisualEditor classes, static methods and static properties.
 */
window.ve = {
	// List of instances of visual editors
	'instances': []
};

/* Utility functions */

/**
 * Extends a constructor with the prototype of another.
 *
 * When using this, it's required to include a call to the constructor of the parent class as the
 * first code in the child class's constructor.
 *
 * @example
 *     // Define parent class
 *     function Foo() {
 *         // code here
 *     }
 *     // Define child class
 *     function Bar() {
 *         // Call parent constructor
 *         Foo.call( this );
 *     }
 *     // Extend prototype
 *     ve.extendClass( Bar, Foo );
 *
 * @static
 * @method
 * @param {Function} dst Class to extend
 * @param {Function} [..] List of base classed to use methods from
 */
ve.extendClass = function ( dst ) {
	var i, method, base,
		length = arguments.length;
	for ( i = 1; i < length; i++ ) {
		base = arguments[i].prototype;
		for ( method in base ) {
			if ( typeof base[method] === 'function' && !( method in dst.prototype ) ) {
				dst.prototype[method] = base[method];
			}
		}
	}
};

ve.isPlainObject = $.isPlainObject;

ve.isEmptyObject = $.isEmptyObject;

/**
 * Check whether given variable is an array. Should not use `instanceof` or
 * `constructor` due to the inability to detect arrays from a different
 * scope.
 * @static
 * @method
 * @until ES5: Array.isArray.
 * @param {Mixed} x
 * @return {Boolean}
 */
ve.isArray = $.isArray;

/**
 * Create a function calls the given function in a certain context.
 * If a function does not have an explicit context, it is determined at
 * executin time based on how it is invoked (e.g. object member, call/apply,
 * global scope, etc.).
 * Performance optimization: http://jsperf.com/function-bind-shim-perf
 *
 * @static
 * @method
 * @until ES5: Function.prototype.bind.
 * @param {Function} func Function to bind.
 * @param {Object} context Context for the function.
 * @param {Mixed} [..] Variadic list of arguments to prepend to arguments
 * to the bound function.
 * @return {Function} The bound.
 */
ve.bind = $.proxy;

/**
 * Wrapper for Array.prototype.indexOf
 * @static
 * @method
 * @until ES5
 * @param {Mixed} value Element to search for.
 * @param {Array} array Array to search in.
 * @param {Integer} [fromIndex=0] Index to being searching from.
 * @return {Number} Index of value in array, or -1 if not found.
 * Values are compared without type coersion.
 */
ve.indexOf = $.inArray;

/**
 * Merge properties of one or more objects into another.
 * Preserves original object's inheritance (e.g. Array, Object, whatever).
 * In case of array or array-like objects only the indexed properties
 * are copied over.
 * Beware: If called with only one argument, it will consider
 * 'target' as 'source' and 'this' as 'target'. Which means
 * ve.extendObject( { a: 1 } ); sets ve.a = 1;
 *
 * @param {Boolean} [recursive=false]
 * @param {Mixed} target Object that will receive the new properties.
 * @param {Mixed} [..] Variadic list of objects containing properties
 * to be merged into the targe.
 * @return {Mixed} Modified version of first or second argument.
 */
ve.extendObject = $.extend;

/**
 * Generates a hash of an object based on its name and data.
 *
 * To avoid two objects with the same values generating different hashes, we utilize the replacer
 * argument of JSON.stringify and sort the object by key as it's being serialized. This may or may
 * not be the fastest way to do this; we should investigate this further.
 *
 * @static
 * @method
 * @param {Object} obj Object to generate hash for
 * @returns {String} Hash of object
 */
ve.getHash = function ( value ) {
    return JSON.stringify( value, ve.getHash.keySortReplacer );
};

/**
 * Helper function for ve.getHash which sorts objects by key.
 *
 * This is a callback passed into JSON.stringify.
 *
 * @static
 * @method
 * @param {String} key Property name of value being replaced
 * @param {Mixed} value Property value to replace
 * @returns {Mixed} Replacement value
 */
ve.getHash.keySortReplacer = function ( key, value ) {
    if ( value.constructor !== Object ) {
        return value;
    }
    return ve.reduceArray( ve.getObjectKeys( value ).sort(), function( sorted, key ) {
        sorted[key] = value[key];
        return sorted;
    }, {} );
};

/**
 * Reduces an array using a callback function.
 *
 * Native reduce will be used if available.
 *
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce
 *
 * @static
 * @method
 * @param {Array} arr Array to reduce
 * @param {Function} callback Function to execute for each element in the array
 * @param {Mixed} [initialValue] First argument to the first call of the callback
 * @returns {Array} Reduced array
 */
ve.reduceArray = function ( arr, callback, initialValue ) {
	// Use native implementation if available
	if ( Array.prototype.reduce ) {
		return arr.reduce( callback, initialValue );
	}
	if ( arr === null || arr === undefined ) {
		throw new TypeError( 'Object is null or undefined' );
	}
	var curr,
		i = 0,
		length = arr.length || 0;
	if ( typeof callback !== 'function' ) {
		// ES5 : 'If IsCallable(callbackfn) is false, throw a TypeError exception.'
		throw new TypeError( 'First argument is not callable' );
	}
	if ( initialValue === undefined ) {
		if ( length === 0 ) {
			throw new TypeError( 'Array length is 0 and initialValue is undefined' );
		}
		curr = arr[0];
		// Start accumulating at the second element
		i = 1;
	} else {
		curr = initialValue;
	}
	while ( i < length ) {
		if ( i in arr ) {
			curr = callback.call( undefined, curr, arr[i], i, arr );
		}
		++i;
	}
	return curr;
};

/**
 * Gets an array of all property names in an object.
 *
 * This falls back to the native impelentation of Object.keys if available.
 *
 * @static
 * @method
 * @until ES5
 * @param {Object} Object to get properties from
 * @returns {String[]} List of object keys
 */
ve.getObjectKeys = Object.keys || function ( obj ) {
	var keys = [],
		key,
		hop = Object.prototype.hasOwnProperty;
	for ( key in obj ) {
		if ( hop.call( obj, key ) ) {
			keys.push( key );
		}
	}
	return keys;
};

/**
 * Gets an array of all property values in an object.
 *
 * @static
 * @method
 * @param {Object} Object to get values from
 * @returns {Array} List of object values
 */
ve.getObjectValues = function ( obj ) {
	var values = [],
		key,
		hop = Object.prototype.hasOwnProperty;
	for ( key in obj ) {
		if ( hop.call( obj, key ) ) {
			values.push( obj[key] );
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
 * @static
 * @method
 * @param {Object} a First object to compare
 * @param {Object} b Second object to compare
 * @param {Boolean} [asymmetrical] Whether to check only that b contains values from a
 * @returns {Boolean} If the objects contain the same values as each other
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
 * @static
 * @method
 * @param {Array} a First array to compare
 * @param {Array} b Second array to compare
 * @param {Boolean} [objectsByValue] Use ve.compareObjects() to compare objects instead of ===
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
 * Gets a deep copy of an array's string, number, array and plain-object contents.
 *
 * @static
 * @method
 * @param {Array} source Array to copy
 * @returns {Array} Copy of source array
 */
ve.copyArray = function ( source ) {
	var i, sourceValue, sourceType,
		destination = [];
	for ( i = 0; i < source.length; i++ ) {
		sourceValue = source[i];
		sourceType = typeof sourceValue;
		if ( sourceType === 'string' || sourceType === 'number' ) {
			destination.push( sourceValue );
		} else if ( ve.isPlainObject( sourceValue ) ) {
			destination.push( ve.copyObject( sourceValue ) );
		} else if ( ve.isArray( sourceValue ) ) {
			destination.push( ve.copyArray( sourceValue ) );
		}
	}
	return destination;
};

/**
 * Gets a deep copy of an object's string, number, array and plain-object properties.
 *
 * @static
 * @method
 * @param {Object} source Object to copy
 * @returns {Object} Copy of source object
 */
ve.copyObject = function ( source ) {
	var key, sourceValue, sourceType,
		destination = {};
	for ( key in source ) {
		sourceValue = source[key];
		sourceType = typeof sourceValue;
		if ( sourceType === 'string' || sourceType === 'number' ) {
			destination[key] = sourceValue;
		} else if ( ve.isPlainObject( sourceValue ) ) {
			destination[key] = ve.copyObject( sourceValue );
		} else if ( ve.isArray( sourceValue ) ) {
			destination[key] = ve.copyArray( sourceValue );
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
 * @static
 * @method
 * @param {Array} arr Array to remove from and insert into. Will be modified
 * @param {Number} offset Offset in arr to splice at. May be negative; see the 'index'
 * parameter for Array.prototype.splice()
 * @param {Number} remove Number of elements to remove at the offset. May be zero
 * @param {Array} data Array of items to insert at the offset
 */
ve.batchSplice = function ( arr, offset, remove, data ) {
	// We need to splice insertion in in batches, because of parameter list length limits which vary
	// cross-browser - 1024 seems to be a safe batch size on all browsers
	var index = 0, batchSize = 1024, toRemove = remove;
	
	if ( data.length === 0 ) {
		// Special case: data is empty, so we're just doing a removal
		// The code below won't handle that properly, so we do it here
		arr.splice( offset, remove );
		return;
	}
	
	while ( index < data.length ) {
		// Call arr.splice( offset, remove, i0, i1, i2, ..., i1023 );
		// Only set remove on the first call, and set it to zero on subsequent calls
		arr.splice.apply(
			arr, [index + offset, toRemove].concat( data.slice( index, index + batchSize ) )
		);
		index += batchSize;
		toRemove = 0;
	}
};

/**
 * Insert one array into another. This just calls ve.batchSplice( dst, offset, 0, src )
 *
 * @static
 * @method
 * @see ve.batchSplice
 */
ve.insertIntoArray = function ( dst, offset, src ) {
	ve.batchSplice( dst, offset, 0, src );
};

/**
 * Logs data to the console.
 *
 * This implementation does nothing, to add a real implmementation ve.debug needs to be loaded.
 *
 * @static
 * @method
 * @param {Mixed} [...] Data to log
 */
ve.log = function () {
	// don't do anything, this is just a stub
};

/**
 * Logs an object to the console.
 *
 * This implementation does nothing, to add a real implmementation ve.debug needs to be loaded.
 *
 * @static
 * @method
 * @param {Object} obj Object to log
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
 * @static
 * @method
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
 * @static
 * @method
 * @param {String} key Message key
 * @param {Mixed} [...] Message parameters
 */
ve.msg = function () {
	return ve.init.platform.getMessage.apply( ve.init.platform, arguments );
};
