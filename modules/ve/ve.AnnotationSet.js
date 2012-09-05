/**
 * VisualEditor AnnotationSet class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

ve.AnnotationSet = function ( annotations ) {
	// Inheritance
	ve.OrderedHashSet.call( this, ve.getHash, annotations );
};

ve.inheritClass( ve.AnnotationSet, ve.OrderedHashSet );

ve.AnnotationSet.prototype.clone = function () {
	return new ve.AnnotationSet( this );
};

ve.AnnotationSet.prototype.getAnnotationsOfType = function ( type ) {
	return this.filter( 'type', type );
};

ve.AnnotationSet.prototype.hasAnnotationOfType = function ( type ) {
	return this.containsMatching( 'type', type );
};
