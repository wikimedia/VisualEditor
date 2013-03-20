/*!
 * VisualEditor OrderedHashSet class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Ordered hash set.
 *
 * Objects are treated as equal if their hashes are equal. This means that you can't add two objects
 * with the same hash, and it also means that you can search for one object and get a different one
 * back that has the same hash.
 *
 * The second parameter to this constructor can be an array of objects, or an existing
 * ve.OrderedHashSet object. In both cases, the new Set will be a shallow copy: object references
 * to the individual objects will be maintained, but references to the original array or
 * ve.OrderedHashSet will not be.
 *
 * @abstract
 * @constructor
 * @param {Function} hash Hash function
 * @param {Array|ve.OrderedHashSet} [items] Items to populate the set with
 */
ve.OrderedHashSet = function VeOrderedHashSet( hash, items ) {
	var i;
	this.hash = hash;
	// Array of object references
	this.arr = [];
	// Object mapping object hashes to object references
	this.map = {};

	// HACK HACK HACK
	// We should fix our inheritance so instanceof works
	if ( items instanceof ve.OrderedHashSet || items instanceof ve.AnnotationSet ) {
		this.map = ve.extendObject( {}, items.map );
		this.arr = items.arr.slice( 0 );
	} else if ( ve.isArray( items ) && items.length > 0 ) {
		this.arr = items.slice( 0 );
		for ( i = 0; i < this.arr.length; i++ ) {
			this.map[this.hash( this.arr[i] )] = this.arr[i];
		}
	}
};

/* Methods */

/**
 * Create a clone of the set, with the same hash function and the same contents.
 *
 * @method
 * @returns {ve.OrderedHashSet}
 */
ve.OrderedHashSet.prototype.clone = function () {
	return new ve.OrderedHashSet( this.hash, this );
};

/**
 * Get a value or all values from the set.
 *
 * set.get( 5 ) returns the object at index 5, set.get() returns an array with all objects in
 * the entire set.
 *
 * @method
 * @param {number} [index] If set, only get the element at the index
 * @returns {Array|Object|undefined} The object at index, or an array of all objects in the set
 */
ve.OrderedHashSet.prototype.get = function ( index ) {
	if ( index !== undefined ) {
		return this.arr[index];
	} else {
		return this.arr.slice();
	}
};

/**
 * Get the length of the set.
 *
 * @method
 * @returns {number} The number of objects in the set
 */
ve.OrderedHashSet.prototype.getLength = function () {
	return this.arr.length;
};

/**
 * Check if the set is empty.
 *
 * @method
 * @returns {boolean} True if the set is empty, false otherwise
 */
ve.OrderedHashSet.prototype.isEmpty = function () {
	return this.arr.length === 0;
};

/**
 * Check whether a given value occurs in the set.
 *
 * Values are compared by hash.
 *
 * @method
 * @returns {boolean} There is an object in the set with the same hash as value
 */
ve.OrderedHashSet.prototype.contains = function ( value ) {
	return this.hash( value ) in this.map;
};

/**
 * Check whether the set contains any of the values in another set.
 *
 * @method
 * @param {ve.OrderedHashSet} set Set to compare the set with
 * @returns {boolean} There is at least one value in set that is also in the set
 */
ve.OrderedHashSet.prototype.containsAnyOf = function ( set ) {
	var key;
	for ( key in set.map ) {
		if ( key in this.map ) {
			return true;
		}
	}
	return false;
};

/**
 * Check whether the set contains all of the values in another set.
 *
 * @method
 * @param {ve.OrderedHashSet} set Set to compare the set with
 * @returns {boolean} All values in set are also in the set
 */
ve.OrderedHashSet.prototype.containsAllOf = function ( set ) {
	var key;
	for ( key in set.map ) {
		if ( !( key in this.map ) ) {
			return false;
		}
	}
	return true;
};

/**
 * Get the index of a given value in the set.
 *
 * @method
 * @param {Object} value Value to search for
 * @returns {number} Index of value in the set, or -1 if value is not in the set
 */
ve.OrderedHashSet.prototype.indexOf = function ( value ) {
	var hash = this.hash( value );
	if ( hash in this.map ) {
		return ve.indexOf( this.map[hash], this.arr );
	} else {
		return -1;
	}
};

/**
 * Filter the set by an item property.
 *
 * This returns a new set with all values in the set for which value.property matches filter (if
 * filter is a RegExp) or is equal to filter,
 *
 * @method
 * @param {string} property Property to check
 * @param {Mixed|RegExp} filter Regular expression or value to filter for
 * @param {boolean} [returnBool] For internal use only
 * @returns {ve.OrderedHashSet} New set containing only the matching values
 */
ve.OrderedHashSet.prototype.filter = function ( property, filter, returnBool ) {
	var i, result;
	if ( !returnBool ) {
		// TODO: Consider alternative ways to instantiate a new set of the same type as the subclass
		result = this.clone();
		// TODO: Should we be returning this on all methods that modify the original? Might help
		// with chainability, but perhaps it's also confusing because most chainable methods return
		// a new hash set.
		result.removeAll();
	}
	for ( i = 0; i < this.arr.length; i++ ) {
		if (
			( filter instanceof RegExp && filter.test( this.arr[i][property] ) ) ||
			( typeof filter === 'string' && this.arr[i][property] === filter )
		) {
			if ( returnBool ) {
				return true;
			} else {
				result.push( this.arr[i] );
			}
		}
	}
	return returnBool ? false : result;
};

/**
 * Check if the set contains at least one value where a given property matches a given filter.
 *
 * This is equivalent to (but more efficient than) `!this.filter( .. ).isEmpty()`.
 *
 * @see ve.OrderedHashSet#filter
 *
 * @method
 * @param {string} property
 * @param {Mixed|RegExp} filter
 * @returns {boolean} True if at least one value matches, false otherwise
 */
ve.OrderedHashSet.prototype.containsMatching = function ( property, filter ) {
	return this.filter( property, filter, true );
};

/**
 * Add a value to the set.
 *
 * If the value is already present in the set, nothing happens.
 *
 * The value will be inserted before the value that is currently at the given index. If index is
 * negative, it will be counted from the end (i.e. index -1 is the last item, -2 the second-to-last,
 * etc.). If index is out of bounds, the value will be added to the end of the set.
 *
 * @method
 * @param {Object} value Value to add
 * @param {number} index Index to add the value at
 */
ve.OrderedHashSet.prototype.add = function ( value, index ) {
	var hash;
	if ( index < 0 ) {
		index = this.arr.length + index;
	}
	if ( index >= this.arr.length ) {
		this.push( value );
		return;
	}

	hash = this.hash( value );
	if ( !( hash in this.map ) ) {
		this.arr.splice( index, 0, value );
		this.map[hash] = value;
	}
};

/**
 * Add all values in the given set to the end of the set.
 *
 * Values from the other set that are already in the set will not be added again.
 *
 * @method
 * @param {ve.OrderedHashSet} set Set to add to the set
 */
ve.OrderedHashSet.prototype.addSet = function ( set ) {
	var i;
	for ( i = 0; i < set.arr.length; i++ ) {
		this.push( set.arr[i] );
	}
};

/**
 * Add a value at the end of the set.
 *
 * If the value is already present in the set, nothing happens.
 *
 * @method
 * @param {Object} value Value to add
 */
ve.OrderedHashSet.prototype.push = function ( value ) {
	var hash = this.hash( value );
	if ( !( hash in this.map ) ) {
		this.arr.push( value );
		this.map[hash] = value;
	}
};

/**
 * Remove the value at a given index.
 *
 * @method
 * @param {number} index Index to remove item at. If negative, the counts from the end, see add()
 * @throws {Error} Index out of bounds
 */
ve.OrderedHashSet.prototype.removeAt = function ( index ) {
	if ( index < 0 ) {
		index = this.arr.length + index;
	}
	if ( index >= this.arr.length ) {
		throw new Error( 'Index out of bounds' );
	}
	delete this.map[this.hash( this.arr[index] )];
	this.arr.splice( index, 1 );
};

/**
 * Remove a given value from the set.
 *
 * If the value isn't in the set, nothing happens.
 *
 * @method
 * @param {Object} value Value to remove
 */
ve.OrderedHashSet.prototype.remove = function ( value ) {
	var index, hash = this.hash( value );
	if ( hash in this.map ) {
		index = ve.indexOf( this.map[hash], this.arr );
		delete this.map[hash];
		this.arr.splice( index, 1 );
	}
};

/**
 * Remove all values.
 *
 * @method
 */
ve.OrderedHashSet.prototype.removeAll = function () {
	var i = this.arr.length;
	while ( i-- ) {
		this.remove( this.arr[i] );
	}
};

/**
 * Remove all values in a given set from the set.
 *
 * Values that aren't in the set are ignored.
 *
 * @method
 * @param {ve.OrderedHashSet} set Set to remove from the set
 */
ve.OrderedHashSet.prototype.removeSet = function ( set ) {
	var i;
	for ( i = 0; i < set.arr.length; i++ ) {
		this.remove( set.arr[i] );
	}
};

/**
 * Remove all values that are not also in a given other set from the set.
 *
 * @method
 * @param {ve.OrderedHashSet} set Set to intersect with the set
 */
ve.OrderedHashSet.prototype.removeNotInSet = function ( set ) {
	var i;
	for ( i = this.arr.length - 1; i >= 0; i-- ) {
		if ( !set.contains( this.arr[i] ) ) {
			this.removeAt( i );
		}
	}
};

/**
 * Reverse the set.
 *
 * This returns a copy, the original set is not modified.
 *
 * @method
 * @returns {ve.OrderedHashSet} Copy of the set with the order reversed
 */
ve.OrderedHashSet.prototype.reversed = function () {
	var newSet = this.clone();
	newSet.arr.reverse();
	return newSet;
};

/**
 * Merge another set into the set.
 *
 * This returns a copy, the original set is not modified.
 *
 * @method
 * @param {ve.OrderedHashSet} set Other set
 * @returns {ve.OrderedHashSet} Set containing all values in the set as well as all values in set
 */
ve.OrderedHashSet.prototype.mergeWith = function ( set ) {
	var newSet = this.clone();
	newSet.addSet( set );
	return newSet;
};

/**
 * Get the difference between the set and another set.
 *
 * @method
 * @param {ve.OrderedHashSet} set Other set
 * @returns {ve.OrderedHashSet} New set containing all values that are in the set but not in set
 */
ve.OrderedHashSet.prototype.diffWith = function ( set ) {
	var newSet = this.clone();
	newSet.removeSet( set );
	return newSet;
};

/**
 * Get the intersection of the set with another set.
 *
 * @method
 * @param {ve.OrderedHashSet} set Other set
 * @returns {ve.OrderedHashSet} New set containing all values that are both in the set and in set
 */
ve.OrderedHashSet.prototype.intersectWith = function ( set ) {
	var newSet = this.clone();
	newSet.removeNotInSet( set );
	return newSet;
};
