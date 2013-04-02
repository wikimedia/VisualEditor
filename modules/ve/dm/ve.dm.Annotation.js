/*!
 * VisualEditor DataModel Annotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic DataModel annotation.
 *
 * This is an abstract class, annotations should extend this and call this constructor from their
 * constructor. You should not instantiate this class directly.
 *
 * Annotations in the linear model are instances of subclasses of this class. Subclasses should
 * only override static properties and functions.
 *
 * @class
 * @constructor
 * @param {Object} element Linear model annotation
 */
ve.dm.Annotation = function VeDmAnnotation( element ) {
	// Parent constructor
	ve.dm.Model.call( this, element );
	// Properties
	this.name = this.constructor.static.name; // For ease of filtering
};

/* Inheritance */

ve.inheritClass( ve.dm.Annotation, ve.dm.Model );

/* Static properties */

/**
 * About grouping is not supported for annotations; setting this to true has no effect.
 *
 * @static
 * @property {boolean} static.enableAboutGrouping
 * @inheritable
 */
ve.dm.Annotation.static.enableAboutGrouping = false;

/* Methods */

/**
 * Convenience wrapper for .toDomElements() on the current annotation
 * @method
 * @param {HTMLDocument} [doc] HTML document to use to create elements
 * @see ve.dm.Model#toDomElements
 */
ve.dm.Annotation.prototype.getDomElements = function ( doc ) {
	return this.constructor.static.toDomElements( this.element, doc || document );
};
