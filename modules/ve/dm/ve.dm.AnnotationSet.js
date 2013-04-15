/*!
 * VisualEditor DataModel AnnotationSet class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Annotation set.
 *
 * @constructor
 * @param {ve.dm.IndexValueStore} store Index value store
 * @param {Object[]} [indexes] Array of indexes into the store
 */
ve.dm.AnnotationSet = function VeDmAnnotationSet( store, indexes ) {
	// Parent constructor
	this.store = store;
	this.storeIndexes = indexes || [];
};

/* Methods */

/**
 * Get the index-value store.
 *
 * @method
 * @returns {ve.dm.IndexValueStore} Index-value store
 */
ve.dm.AnnotationSet.prototype.getStore = function () {
	return this.store;
};

/**
 * Get a clone.
 *
 * @method
 * @returns {ve.dm.AnnotationSet} Copy of annotation set
 */
ve.dm.AnnotationSet.prototype.clone = function () {
	return new ve.dm.AnnotationSet( this.getStore(), this.storeIndexes.slice( 0 ) );
};

/**
 * Get an annotation set containing only annotations within the set with a specific name.
 *
 * @method
 * @param {string} name Type name
 * @returns {ve.dm.AnnotationSet} Copy of annotation set
 */
ve.dm.AnnotationSet.prototype.getAnnotationsByName = function ( name ) {
	return this.filter( function ( annotation ) { return annotation.name === name; } );
};

/**
 * Check if any annotations in the set have a specific name.
 *
 * @method
 * @param {string} name Type name
 * @returns {boolean} Annotation of given type exists in the set
 */
ve.dm.AnnotationSet.prototype.hasAnnotationWithName = function ( name ) {
	return this.containsMatching( function ( annotation ) { return annotation.name === name; } );
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
ve.dm.AnnotationSet.prototype.get = function ( index ) {
	if ( index !== undefined ) {
		return this.getStore().value( this.getIndex( index ) );
	} else {
		return this.getStore().values( this.getIndexes() );
	}
};

/**
 * Get index-value store index from offset within annotation set.
 * @param {number} offset Offset within annotation set
 * @returns {number} Index-value store index at specified offset
 */
ve.dm.AnnotationSet.prototype.getIndex = function ( offset ) {
	return this.storeIndexes[offset];
};

/**
 * Get all index-value store indexes.
 * @returns {Array} Index-value store indexes
 */
ve.dm.AnnotationSet.prototype.getIndexes = function () {
	return this.storeIndexes;
};

/**
 * Get the length of the set.
 *
 * @method
 * @returns {number} The number of objects in the set
 */
ve.dm.AnnotationSet.prototype.getLength = function () {
	return this.storeIndexes.length;
};

/**
 * Check if the set is empty.
 *
 * @method
 * @returns {boolean} True if the set is empty, false otherwise
 */
ve.dm.AnnotationSet.prototype.isEmpty = function () {
	return this.getLength() === 0;
};

/**
 * Check whether a given value occurs in the set.
 *
 * Values are compared by IndexValueStore index.
 *
 * @method
 * @returns {boolean} There is an object in the set with the same hash as value
 */
ve.dm.AnnotationSet.prototype.contains = function ( value ) {
	return this.indexOf( value ) !== -1;
};

/**
 * Check whether the set contains any of the values in another set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to compare the set with
 * @returns {boolean} There is at least one value in set that is also in the set
 */
ve.dm.AnnotationSet.prototype.containsAnyOf = function ( set ) {
	var i, length, setIndexes = set.getIndexes(), thisIndexes = this.getIndexes();
	for ( i = 0, length = setIndexes.length; i < length; i++ ) {
		if ( ve.indexOf( setIndexes[i], thisIndexes ) !== -1 ) {
			return true;
		}
	}
	return false;
};

/**
 * Check whether the set contains all of the values in another set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to compare the set with
 * @returns {boolean} All values in set are also in the set
 */
ve.dm.AnnotationSet.prototype.containsAllOf = function ( set ) {
	var i, length, setIndexes = set.getIndexes(), thisIndexes = this.getIndexes();
	for ( i = 0, length = setIndexes.length; i < length; i++ ) {
		if ( ve.indexOf( setIndexes[i], thisIndexes ) === -1 ) {
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
 * @returns {number} Index of value in the set, or -1 if value is not in the set.
 */
ve.dm.AnnotationSet.prototype.indexOf = function ( value ) {
	return ve.indexOf( this.store.indexOfHash( ve.getHash( value ) ), this.getIndexes() );
};

/**
 * Filter the set by an item property.
 *
 * This returns a new set with all values in the set for which the callback returned true for.
 *
 * @method
 * @param {Function} callback Function that takes an annotation and returns boolean true to include
 * @param {boolean} [returnBool] For internal use only
 * @returns {ve.dm.AnnotationSet} New set containing only the matching values
 */
ve.dm.AnnotationSet.prototype.filter = function ( callback, returnBool ) {
	var i, length, result, value;

	if ( !returnBool ) {
		result = this.clone();
		// TODO: Should we be returning this on all methods that modify the original? Might help
		// with chainability, but perhaps it's also confusing because most chainable methods return
		// a new hash set.
		result.removeAll();
	}
	for ( i = 0, length = this.getLength(); i < length; i++ ) {
		value = this.getStore().value( this.getIndex( i ) );
		if ( callback( value ) ) {
			if ( returnBool ) {
				return true;
			} else {
				result.push( value );
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
 * @see ve.dm.AnnotationSet#filter
 *
 * @method
 * @param {Function} callback Function that takes an annotation and returns boolean true to include
 * @returns {boolean} True if at least one value matches, false otherwise
 */
ve.dm.AnnotationSet.prototype.containsMatching = function ( callback ) {
	return this.filter( callback, true );
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
ve.dm.AnnotationSet.prototype.add = function ( value, index ) {
	var storeIndex = this.getStore().index( value );
	// negative offset
	if ( index < 0 ) {
		index = this.getLength() + index;
	}
	// greater than length, add to end
	if ( index >= this.getLength() ) {
		this.push( value );
		return;
	}
	// if not in set already, splice in place
	if ( !this.contains( value ) ) {
		this.storeIndexes.splice( index, 0, storeIndex );
	}
};

/**
 * Add all values in the given set to the end of the set.
 *
 * Values from the other set that are already in the set will not be added again.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to add to the set
 */
ve.dm.AnnotationSet.prototype.addSet = function ( set ) {
	var i;
	for ( i = 0; i < set.getLength(); i++ ) {
		this.push( set.get( i ) );
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
ve.dm.AnnotationSet.prototype.push = function ( value ) {
	var storeIndex = this.getStore().index( value );
	if ( !this.contains( value ) ) {
		this.storeIndexes.push( storeIndex );
	}
};

/**
 * Remove the value at a given index.
 *
 * @method
 * @param {number} index Index to remove item at. If negative, the counts from the end, see add()
 * @throws {Error} Index out of bounds.
 */
ve.dm.AnnotationSet.prototype.removeAt = function ( index ) {
	if ( index < 0 ) {
		index = this.getLength() + index;
	}
	if ( index >= this.getLength() ) {
		throw new Error( 'Index out of bounds' );
	}
	this.storeIndexes.splice( index, 1 );
};

/**
 * Remove a given value from the set.
 *
 * If the value isn't in the set, nothing happens.
 *
 * @method
 * @param {Object} value Value to remove
 */
ve.dm.AnnotationSet.prototype.remove = function ( value ) {
	var index = this.indexOf( value );
	if ( index !== -1 ) {
		this.storeIndexes.splice( index, 1 );
	}
};

/**
 * Remove all values.
 *
 * @method
 */
ve.dm.AnnotationSet.prototype.removeAll = function () {
	this.storeIndexes = [];
};

/**
 * Remove all values in a given set from the set.
 *
 * Values that aren't in the set are ignored.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to remove from the set
 */
ve.dm.AnnotationSet.prototype.removeSet = function ( set ) {
	var i;
	for ( i = 0; i < set.getLength(); i++ ) {
		this.remove( set.get( i ) );
	}
};

/**
 * Remove all values that are not also in a given other set from the set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to intersect with the set
 */
ve.dm.AnnotationSet.prototype.removeNotInSet = function ( set ) {
	var i;
	for ( i = this.getLength() - 1; i >= 0; i-- ) {
		if ( !set.contains( this.get( i ) ) ) {
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
 * @returns {ve.dm.AnnotationSet} Copy of the set with the order reversed.
 */
ve.dm.AnnotationSet.prototype.reversed = function () {
	var newSet = this.clone();
	newSet.storeIndexes.reverse();
	return newSet;
};

/**
 * Merge another set into the set.
 *
 * This returns a copy, the original set is not modified.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Other set
 * @returns {ve.dm.AnnotationSet} Set containing all values in the set as well as all values in set
 */
ve.dm.AnnotationSet.prototype.mergeWith = function ( set ) {
	var newSet = this.clone();
	newSet.addSet( set );
	return newSet;
};

/**
 * Get the difference between the set and another set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Other set
 * @returns {ve.dm.AnnotationSet} New set containing all values that are in the set but not in set
 */
ve.dm.AnnotationSet.prototype.diffWith = function ( set ) {
	var newSet = this.clone();
	newSet.removeSet( set );
	return newSet;
};

/**
 * Get the intersection of the set with another set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Other set
 * @returns {ve.dm.AnnotationSet} New set containing all values that are both in the set and in set
 */
ve.dm.AnnotationSet.prototype.intersectWith = function ( set ) {
	var newSet = this.clone();
	newSet.removeNotInSet( set );
	return newSet;
};
