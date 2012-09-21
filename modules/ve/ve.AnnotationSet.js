/**
 * VisualEditor AnnotationSet class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Ordered set of annotations.
 *
 * @constructor
 * @extends {ve.OrderedHashSet}
 * @param {Object[]} annotations Array of annotation objects
 */
ve.AnnotationSet = function ( annotations ) {
	// Parent constructor
	ve.OrderedHashSet.call( this, ve.getHash, annotations );
};

/* Inheritance */

ve.inheritClass( ve.AnnotationSet, ve.OrderedHashSet );

/* Methods */

/**
 * Gets a clone.
 *
 * @method
 * @returns {ve.AnnotationSet} Copy of annotation set
 */
ve.AnnotationSet.prototype.clone = function () {
	return new ve.AnnotationSet( this );
};

/**
 * Gets an annotation set containing only annotations within this set of a given type.
 *
 * @method
 * @param {String|RegExp} type Regular expression or string to compare types with
 * @returns {ve.AnnotationSet} Copy of annotation set
 */
ve.AnnotationSet.prototype.getAnnotationsOfType = function ( type ) {
	return this.filter( 'type', type );
};

/**
 * Checks if any annotations in this set are of a given type.
 *
 * @method
 * @param {String|RegExp} type Regular expression or string to compare types with
 * @returns {Boolean} Annotation of given type exists in this set
 */
ve.AnnotationSet.prototype.hasAnnotationOfType = function ( type ) {
	return this.containsMatching( 'type', type );
};
