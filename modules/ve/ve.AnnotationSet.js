/*!
 * VisualEditor AnnotationSet class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Annotation set.
 *
 * @extends ve.OrderedHashSet
 * @constructor
 * @param {Object[]} annotations Array of annotation objects
 */
ve.AnnotationSet = function VeAnnotationSet( annotations ) {
	// Parent constructor
	ve.OrderedHashSet.call( this, ve.getHash, annotations );
};

/* Inheritance */

ve.inheritClass( ve.AnnotationSet, ve.OrderedHashSet );

/* Methods */

/**
 * Get a clone.
 *
 * @method
 * @returns {ve.AnnotationSet} Copy of annotation set
 */
ve.AnnotationSet.prototype.clone = function () {
	return new ve.AnnotationSet( this );
};

/**
 * Get an annotation set containing only annotations within the set with a specific name.
 *
 * @method
 * @param {string|RegExp} name Regular expression or string to compare types with
 * @returns {ve.AnnotationSet} Copy of annotation set
 */
ve.AnnotationSet.prototype.getAnnotationsByName = function ( name ) {
	return this.filter( 'name', name );
};

/**
 * Check if any annotations in the set have a specific name.
 *
 * @method
 * @param {string|RegExp} name Regular expression or string to compare names with
 * @returns {boolean} Annotation of given type exists in the set
 */
ve.AnnotationSet.prototype.hasAnnotationWithName = function ( name ) {
	return this.containsMatching( 'name', name );
};
