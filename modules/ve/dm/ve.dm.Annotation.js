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
 * @extends {ve.dm.Model}
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

/**
 * Automatically apply annotation to content inserted after it.
 *
 * @type {boolean}
 */
ve.dm.Annotation.static.applyToAppendedContent = true;

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

/**
 * Get an object containing comparable annotation properties.
 *
 * This is used by the converter to merge adjacent annotations.
 *
 * @returns {Object} An object containing a subset of the annotation's properties
 */
ve.dm.Annotation.prototype.getComparableObject = function () {
	return {
		'type': this.getType(),
		'attributes': this.getAttributes()
	};
};

/**
 * HACK: This method strips data-parsoid from HTML attributes for comparisons.
 *
 * This should be removed once similar annotation merging is handled correctly
 * by Parsoid.
 *
 * @returns {Object} An object all HTML attributes except data-parsoid
 */
ve.dm.Annotation.prototype.getComparableHtmlAttributes = function () {
	var comparableAttributes, attributes = this.getHtmlAttributes();

	if ( attributes[0] ) {
		comparableAttributes = ve.copyObject( attributes[0].values );
		delete comparableAttributes['data-parsoid'];
		return comparableAttributes;
	} else {
		return {};
	}
};

/**
 * HACK: This method adds in HTML attributes so comparable objects aren't serialized
 * together if they have different HTML attributes.
 *
 * This method needs to be different from getComparableObject which is
 * still used for editing annotations.
 *
 * @returns {Object} An object containing a subset of the annotation's properties and HTML attributes
 */
ve.dm.Annotation.prototype.getComparableObjectForSerialization = function () {
	var object = this.getComparableObject(),
		htmlAttributes = this.getComparableHtmlAttributes();

	if ( !ve.isEmptyObject( htmlAttributes ) ) {
		object.htmlAttributes = htmlAttributes;
	}
	return object;
};