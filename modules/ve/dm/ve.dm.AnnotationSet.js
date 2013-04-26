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
 * @param {ve.dm.IndexValueStore} store Index-value store
 * @param {number[]} [indexes] Array of indexes into the store
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
 * Get an annotation or all annotations from the set.
 *
 * set.get( 5 ) returns the annotation at index 5, set.get() returns an array with all annotations in
 * the entire set.
 *
 * @method
 * @param {number} [index] If set, only get the annotation at the index
 * @returns {Array|ve.dm.Annotation|undefined} The annotation at index, or an array of all annotation in the set
 */
ve.dm.AnnotationSet.prototype.get = function ( index ) {
	if ( index !== undefined ) {
		return this.getStore().value( this.getIndex( index ) );
	} else {
		return this.getStore().values( this.getIndexes() );
	}
};

/**
 * Get store index from offset within annotation set.
 * @param {number} offset Offset within annotation set
 * @returns {number} Store index at specified offset
 */
ve.dm.AnnotationSet.prototype.getIndex = function ( offset ) {
	return this.storeIndexes[offset];
};

/**
 * Get all store indexes.
 * @returns {Array} Store indexes
 */
ve.dm.AnnotationSet.prototype.getIndexes = function () {
	return this.storeIndexes;
};

/**
 * Get the length of the set.
 *
 * @method
 * @returns {number} The number of annotations in the set
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
 * Check whether a given annotation occurs in the set.
 *
 * Annotations are compared by store index.
 *
 * @method
 * @param {ve.dm.Annotation} annotation Annotation
 * @returns {boolean} There is an annotation in the set with the same hash as annotation
 */
ve.dm.AnnotationSet.prototype.contains = function ( annotation ) {
	return this.indexOf( annotation ) !== -1;
};

/**
 * Check whether a given store index occurs in the set.
 *
 * @method
 * @param {number} annotation Index of annotation in the store
 * @returns {boolean} There is an annotation in the set with this store index
 */
ve.dm.AnnotationSet.prototype.containsIndex = function ( index ) {
	return ve.indexOf( index , this.getIndexes() ) !== -1;
};

/**
 * Check whether the set contains any of the annotations in another set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to compare the set with
 * @returns {boolean} There is at least one annotation in set that is also in the set
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
 * Check whether the set contains all of the annotations in another set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to compare the set with
 * @returns {boolean} All annotations in set are also in the set
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
 * Get the index of a given annotation in the set.
 *
 * @method
 * @param {ve.dm.Annotation} annotation Annotation to search for
 * @returns {number} Index of annotation in the set, or -1 if annotation is not in the set.
 */
ve.dm.AnnotationSet.prototype.indexOf = function ( annotation ) {
	return ve.indexOf( this.store.indexOfHash( ve.getHash( annotation ) ), this.getIndexes() );
};

/**
 * Filter the set by an item property.
 *
 * This returns a new set with all annotations in the set for which the callback returned true for.
 *
 * @method
 * @param {Function} callback Function that takes an annotation and returns boolean true to include
 * @param {boolean} [returnBool] For internal use only
 * @returns {ve.dm.AnnotationSet} New set containing only the matching annotations
 */
ve.dm.AnnotationSet.prototype.filter = function ( callback, returnBool ) {
	var i, length, result, storeIndex, annotation;

	if ( !returnBool ) {
		result = this.clone();
		// TODO: Should we be returning this on all methods that modify the original? Might help
		// with chainability, but perhaps it's also confusing because most chainable methods return
		// a new hash set.
		result.removeAll();
	}
	for ( i = 0, length = this.getLength(); i < length; i++ ) {
		storeIndex = this.getIndex( i );
		annotation = this.getStore().value( storeIndex );
		if ( callback( annotation ) ) {
			if ( returnBool ) {
				return true;
			} else {
				result.storeIndexes.push( storeIndex );
			}
		}
	}
	return returnBool ? false : result;
};

/**
 * Check if the set contains at least one annotation where a given property matches a given filter.
 *
 * This is equivalent to (but more efficient than) `!this.filter( .. ).isEmpty()`.
 *
 * @see ve.dm.AnnotationSet#filter
 *
 * @method
 * @param {Function} callback Function that takes an annotation and returns boolean true to include
 * @returns {boolean} True if at least one annotation matches, false otherwise
 */
ve.dm.AnnotationSet.prototype.containsMatching = function ( callback ) {
	return this.filter( callback, true );
};

/**
 * Add an annotation to the set.
 *
 * If the annotation is already present in the set, nothing happens.
 *
 * The annotation will be inserted before the annotation that is currently at the given index. If index is
 * negative, it will be counted from the end (i.e. index -1 is the last item, -2 the second-to-last,
 * etc.). If index is out of bounds, the annotation will be added to the end of the set.
 *
 * @method
 * @param {ve.dm.Annotation} annotation Annotation to add
 * @param {number} index Index to add the annotation at
 */
ve.dm.AnnotationSet.prototype.add = function ( annotation, index ) {
	var storeIndex = this.getStore().index( annotation );
	// negative offset
	if ( index < 0 ) {
		index = this.getLength() + index;
	}
	// greater than length, add to end
	if ( index >= this.getLength() ) {
		this.push( annotation );
		return;
	}
	// if not in set already, splice in place
	if ( !this.containsIndex( storeIndex ) ) {
		this.storeIndexes.splice( index, 0, storeIndex );
	}
};

/**
 * Add all annotations in the given set to the end of the set.
 *
 * Annotations from the other set that are already in the set will not be added again.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to add to the set
 */
ve.dm.AnnotationSet.prototype.addSet = function ( set ) {
	this.storeIndexes = ve.simpleArrayUnion( this.getIndexes(), set.getIndexes() );
};

/**
 * Add an annotation at the end of the set.
 *
 * If the annotation is already present in the set, nothing happens.
 *
 * @method
 * @param {ve.dm.Annotation} annotation Annotation to add
 */
ve.dm.AnnotationSet.prototype.push = function ( annotation ) {
	var storeIndex = this.getStore().index( annotation );
	if ( !this.containsIndex( storeIndex ) ) {
		this.storeIndexes.push( storeIndex );
	}
};

/**
 * Remove the annotation at a given index.
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
 * Remove a given annotation from the set.
 *
 * If the annotation isn't in the set, nothing happens.
 *
 * @method
 * @param {ve.dm.Annotation} annotation Annotation to remove
 */
ve.dm.AnnotationSet.prototype.remove = function ( annotation ) {
	var index = this.indexOf( annotation );
	if ( index !== -1 ) {
		this.storeIndexes.splice( index, 1 );
	}
};

/**
 * Remove all annotations.
 *
 * @method
 */
ve.dm.AnnotationSet.prototype.removeAll = function () {
	this.storeIndexes = [];
};

/**
 * Remove all annotations in a given set from the set.
 *
 * Annotations that aren't in the set are ignored.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to remove from the set
 */
ve.dm.AnnotationSet.prototype.removeSet = function ( set ) {
	this.storeIndexes = ve.simpleArrayDifference( this.getIndexes(), set.getIndexes() );
};

/**
 * Remove all annotations that are not also in a given other set from the set.
 *
 * @method
 * @param {ve.dm.AnnotationSet} set Set to intersect with the set
 */
ve.dm.AnnotationSet.prototype.removeNotInSet = function ( set ) {
	this.storeIndexes = ve.simpleArrayIntersection( this.getIndexes(), set.getIndexes() );
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
 * @returns {ve.dm.AnnotationSet} Set containing all annotations in the set as well as all annotations in set
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
 * @returns {ve.dm.AnnotationSet} New set containing all annotations that are in the set but not in set
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
 * @returns {ve.dm.AnnotationSet} New set containing all annotations that are both in the set and in set
 */
ve.dm.AnnotationSet.prototype.intersectWith = function ( set ) {
	var newSet = this.clone();
	newSet.removeNotInSet( set );
	return newSet;
};
