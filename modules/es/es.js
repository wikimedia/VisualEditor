/**
 * EditSurface namespace.
 * 
 * All classes and functions will be attached to this object to keep the global namespace clean.
 */
es = {};

/* Functions */

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
 *     extend( Bar, Foo );
 * 
 * @static
 * @method
 * @param {Function} dst Class to extend
 * @param {Function} src Base class to use methods from
 */
es.extendClass = function( dst, src ) {
	var base = new src();
	for ( var method in base ) {
		if ( typeof base[method] === 'function' && !( method in dst.prototype ) ) {
			dst.prototype[method] = base[method];
		}
	}
};

es.extendObject = $.extend;

es.isPlainObject = $.isPlainObject;

es.isEmptyObject = $.isEmptyObject;

es.isArray = $.isArray;

/**
 * Wrapper for Array.prototype.indexOf
 * 
 * @param {Mixed} value Element to search for
 * @param {Array} array Array to search in
 * @param {Integer} [fromIndex=0] Index to being searching from
 * @return {Number} Index of value in array, or -1 if not found. Comparisons are done with ===
 */
es.inArray = $.inArray;

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
es.compareObjects = function( a, b, asymmetrical ) {
	var aValue, bValue, aType, bType;
	var k;
	for ( k in a ) {
		aValue = a[k];
		bValue = b[k];
		aType = typeof aValue;
		bType = typeof bValue;
		if ( aType !== bType ||
			( ( aType === 'string' || aType === 'number' ) && aValue !== bValue ) ||
			( es.isPlainObject( aValue ) && !es.compareObjects( aValue, bValue ) ) ) {
			return false;
		}
	}
	// If the check is not asymmetrical, recursing with the arguments swapped will verify our result
	return asymmetrical ? true : es.compareObjects( b, a, true );
};

/**
 * Recursively compare two arrays.
 * 
 * @static
 * @method
 * @param {Array} a First array to compare
 * @param {Array} b Second array to compare
 * @param {Boolean} [compareObjects] If true, use es.compareObjects() to compare objects, otherwise use ===
 */
es.compareArrays = function( a, b, compareObjects ) {
	var i, aValue, bValue, aType, bType;
	if ( a.length !== b.length ) {
		return false;
	}
	for ( i = 0; i < a.length; i++ ) {
		aValue = a[i];
		bValue = b[i];
		aType = typeof aValue;
		bType = typeof bValue;
		if ( aType !== bType || !(
			( es.isArray( aValue ) && es.isArray( bValue ) && es.compareArrays( aValue, bValue ) ) ||
			( compareObjects && es.isPlainObject( aValue ) && es.compareObjects( aValue, bValue ) ) ||
			aValue === bValue
		) ) {
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
es.copyArray = function( source ) {
	var destination = [];
	for ( var i = 0; i < source.length; i++ ) {
		var sourceValue = source[i],
			sourceType = typeof sourceValue;
		if ( sourceType === 'string' || sourceType === 'number' ) {
			destination.push( sourceValue );
		} else if ( es.isPlainObject( sourceValue ) ) {
			destination.push( es.copyObject( sourceValue ) );
		} else if ( es.isArray( sourceValue ) ) {
			destination.push( es.copyArray( sourceValue ) );
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
es.copyObject = function( source ) {
	var destination = {};
	for ( var key in source ) {
		var sourceValue = source[key],
			sourceType = typeof sourceValue;
		if ( sourceType === 'string' || sourceType === 'number' ) {
			destination[key] = sourceValue;
		} else if ( es.isPlainObject( sourceValue ) ) {
			destination[key] = es.copyObject( sourceValue );
		} else if ( es.isArray( sourceValue ) ) {
			destination[key] = es.copyArray( sourceValue );
		}
	}
	return destination;
};

/**
 * Splice one array into another. This is the equivalent of arr.splice( offset, 0, i1, i2, i3, ... )
 * except that i1, i2, i3, ... are specified as an array rather than separate parameters.
 * 
 * @static
 * @method
 * @param {Array} dst Array to splice insertion into. Will be modified
 * @param {Number} offset Offset in arr to splice insertion in at. May be negative; see the 'index'
 * parameter for Array.prototype.splice()
 * @param {Array} src Array of items to insert
 */
es.insertIntoArray = function( dst, offset, src ) {
	// We need to splice insertion in in batches, because of parameter list length limits which vary
	// cross-browser - 1024 seems to be a safe batch size on all browsers
	var index = 0, batchSize = 1024;
	while ( index < src.length ) {
		// Call arr.splice( offset, 0, i0, i1, i2, ..., i1023 );
		dst.splice.apply(
			dst, [index + offset, 0].concat( src.slice( index, index + batchSize ) )
		);
		index += batchSize;
	}
};

/**
 * Gets a string with a pattern repeated a given number of times.
 * 
 * @static
 * @method
 * @param {String} pattern Pattern to repeat
 * @param {Integer} count Number of times to repeat pattern
 * @returns {String} String of repeated pattern
 */
es.repeatString = function( pattern, count ) {
	if ( count < 1 ) {
		return '';
	}
	var result = '';
	while ( count > 0 ) {
		if ( count & 1 ) { result += pattern; }
		count >>= 1;
		pattern += pattern;
	}
	return result;
};
