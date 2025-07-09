/*!
 * VisualEditor DataModel Annotation class.
 *
 * @copyright See AUTHORS.txt
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
 * @extends ve.dm.Model
 * @constructor
 * @param {Object} element Linear model annotation
 * @param {ve.dm.HashValueStore} store Store used by annotation
 */
ve.dm.Annotation = function VeDmAnnotation( element, store ) {
	// Parent constructor
	ve.dm.Annotation.super.call( this, element );

	// Properties
	this.name = this.constructor.static.name; // For ease of filtering
	this.store = store;
};

/* Inheritance */

OO.inheritClass( ve.dm.Annotation, ve.dm.Model );

/* Static properties */

/**
 * About grouping is not supported for annotations; setting this to true has no effect.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
ve.dm.Annotation.static.enableAboutGrouping = false;

/**
 * Automatically apply annotation to content inserted after it.
 *
 * @property {boolean}
 * @see ve.ce.TextState#getChangeTransaction
 */
ve.dm.Annotation.static.applyToAppendedContent = true;

/**
 * Automatically apply annotation to content inserted within it.
 *
 * This includes content inserted after the annotation (appended content).
 *
 * @property {boolean}
 * @see ve.ce.TextState#getChangeTransaction
 */
ve.dm.Annotation.static.applyToInsertedContent = true;

/**
 * Accept this annotation when the browser spontaneously adds it to view's DOM.
 *
 * @property {boolean}
 */
ve.dm.Annotation.static.inferFromView = false;

/**
 * Annotations which are removed when this one is applied
 *
 * @property {string[]}
 */
ve.dm.Annotation.static.removes = [];

/**
 * Move whitespace at the edge of the transaction outside of it when converting
 *
 * e.g. "foo<b> bar </b>baz" -> "foo <b>bar</b> baz"
 *
 * @property {boolean}
 */
ve.dm.Annotation.static.trimWhitespace = true;

/**
 * Static function to convert a linear model data element for this annotation type back to
 * a DOM element.
 *
 * As special facilities for annotations, the annotated content that the returned element will
 * wrap around is passed in as childDomElements, and this function may return an empty array to
 * indicate that the annotation should produce no output. In that case, the child DOM elements will
 * not be wrapped in anything and will be inserted directly into this annotation's parent.
 *
 * @abstract
 * @static
 * @inheritable
 * @method
 * @param {ve.dm.LinearData.Element|ve.dm.LinearData.Item[]} dataElement Linear model element or array of linear model data
 * @param {HTMLDocument} doc HTML document for creating elements
 * @param {ve.dm.Converter} converter Converter object to optionally call .getDomSubtreeFromData() on
 * @param {Node[]} childDomElements Children that will be appended to the returned element
 * @return {HTMLElement[]} Array of DOM elements; only the first element is used; may be empty
 */
ve.dm.Annotation.static.toDomElements = null;

/* Methods */

/**
 * @inheritdoc
 */
ve.dm.Annotation.prototype.getStore = function () {
	return this.store;
};

/**
 * Get an object containing comparable annotation properties.
 *
 * This is used by the converter to merge adjacent annotations.
 *
 * @return {Object} An object containing a subset of the annotation's properties
 */
ve.dm.Annotation.prototype.getComparableObject = function () {
	const hashObject = this.getHashObject();
	delete hashObject.originalDomElementsHash;
	return hashObject;
};

/**
 * FIXME T126037: This method strips data-parsoid & RESTBase IDs from HTML attributes for comparisons.
 *
 * This should be removed once similar annotation merging is handled correctly
 * by Parsoid.
 *
 * @return {Object} An object all HTML attributes except data-parsoid & RESTBase IDs
 */
ve.dm.Annotation.prototype.getComparableHtmlAttributes = function () {
	const domElements = this.store && this.getOriginalDomElements( this.store );

	/* istanbul ignore next */
	if ( domElements && domElements[ 0 ] ) {
		const comparableAttributes = ve.getDomAttributes( domElements[ 0 ] );
		delete comparableAttributes[ 'data-parsoid' ];

		if ( comparableAttributes.id ) {
			const metadataIdRegExp = ve.init.platform.getMetadataIdRegExp();
			if ( metadataIdRegExp && metadataIdRegExp.test( comparableAttributes.id ) ) {
				delete comparableAttributes.id;
			}
		}

		return comparableAttributes;
	}
	return {};
};

/**
 * FIXME T126038: This method adds in HTML attributes so comparable objects
 * aren't serialized together if they have different HTML attributes.
 *
 * This method needs to be different from #getComparableObject which is
 * still used for editing annotations.
 *
 * @return {Object} An object containing a subset of the annotation's properties and HTML attributes
 */
ve.dm.Annotation.prototype.getComparableObjectForSerialization = function () {
	const object = this.getComparableObject(),
		htmlAttributes = this.getComparableHtmlAttributes();

	if ( !ve.isEmptyObject( htmlAttributes ) ) {
		object.htmlAttributes = htmlAttributes;
	}
	return object;
};

/**
 * Check if the annotation was generated by the converter
 *
 * Used by compareToForSerialization to avoid merging generated annotations.
 *
 * @return {boolean} The annotation was generated
 */
ve.dm.Annotation.prototype.isGenerated = function () {
	// Only annotations and nodes generated by the converter have originalDomElements set.
	// If this annotation was not generated by the converter, this.getOriginalDomElements()
	// will return an empty array.
	return this.getOriginalDomElementsHash() !== undefined;
};

/**
 * Compare two annotations using #getComparableObject
 *
 * @param {ve.dm.Annotation} annotation Other annotation to compare against
 * @return {boolean} Annotation is comparable
 */
ve.dm.Annotation.prototype.compareTo = function ( annotation ) {
	return ve.compare(
		this.getComparableObject(),
		annotation.getComparableObject()
	);
};

/**
 * FIXME T126039: Compare to another annotation for serialization
 *
 * Compares two annotations using #getComparableObjectForSerialization, unless
 * they are both generated annotations, in which case they must be identical.
 *
 * @param {ve.dm.Annotation} annotation Annotation to compare to
 * @return {boolean} The other annotation is similar to this one
 */
ve.dm.Annotation.prototype.compareToForSerialization = function ( annotation ) {
	// If both annotations were generated
	if ( this.isGenerated() && annotation.isGenerated() ) {
		return ve.compare( this.getHashObject(), annotation.getHashObject() );
	}

	return ve.compare(
		this.getComparableObjectForSerialization(),
		annotation.getComparableObjectForSerialization()
	);
};

/**
 * Describe the addition of this annotation to some text
 *
 * @return {Array} Descriptions, list of strings or Node arrays
 */
ve.dm.Annotation.prototype.describeAdded = function () {
	return [];
};

/**
 * Describe the removal of this annotation from some text
 *
 * @return {Array} Descriptions, list of strings or Node arrays
 */
ve.dm.Annotation.prototype.describeRemoved = function () {
	return [];
};
