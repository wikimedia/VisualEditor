/*!
 * VisualEditor ContentEditable Annotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic ContentEditable annotation.
 *
 * This is an abstract class, annotations should extend this and call this constructor from their
 * constructor. You should not instantiate this class directly.
 *
 * Subclasses of ve.dm.Annotation should have a corresponding subclass here that controls rendering.
 *
 * @class
 * @constructor
 * @param {ve.dm.Annotation} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.Annotation = function VeCeAnnotation( model, $element ) {
	// Properties
	this.model = model;
	this.$ = $element || $( '<span>' );
	this.parent = null;
	this.live = false;

	// Initialization
	this.$.data( 'annotation', this );
	ve.setDomAttributes(
		this.$[0],
		this.model.getAttributes( 'html/0/' ),
		this.constructor.static.domAttributeWhitelist
	);
};

/* Events */

/**
 * @event live
 */

/* Static Members */

// TODO create a single base class for ce.Node and ce.Annotation

ve.ce.Annotation.static = {};

/**
 * Allowed attributes for DOM elements.
 *
 * This list includes attributes that are generally safe to include in HTML loaded from a
 * foreign source and displaying it inside the browser. It doesn't include any event attributes,
 * for instance, which would allow arbitrary JavaScript execution. This alone is not enough to
 * make HTML safe to display, but it helps.
 *
 * TODO: Rather than use a single global list, set these on a per-annotation basis to something that makes
 * sense for that annotation in particular.
 *
 * @static
 * @property static.domAttributeWhitelist
 * @inheritable
 */
ve.ce.Annotation.static.domAttributeWhitelist = [
	'abbr', 'about', 'align', 'alt', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing',
	'char', 'charoff', 'cite', 'class', 'clear', 'color', 'colspan', 'datatype', 'datetime',
	'dir', 'face', 'frame', 'headers', 'height', 'href', 'id', 'itemid', 'itemprop', 'itemref',
	'itemscope', 'itemtype', 'lang', 'noshade', 'nowrap', 'property', 'rbspan', 'rel',
	'resource', 'rev', 'rowspan', 'rules', 'scope', 'size', 'span', 'src', 'start', 'style',
	'summary', 'title', 'type', 'typeof', 'valign', 'value', 'width'
];

/* Methods */

/**
 * Get the model this CE annotation observes.
 *
 * @method
 * @returns {ve.ce.Annotation} Model
 */
ve.ce.Annotation.prototype.getModel = function () {
	return this.model;
};

/**
 * Check if the annotation is attached to the live DOM.
 *
 * @method
 * @returns {boolean} Annotation is attached to the live DOM
 */
ve.ce.Annotation.prototype.isLive = function () {
	return this.live;
};

/**
 * Set live state.
 *
 * @method
 * @param {boolean} live The annotation has been attached to the live DOM (use false on detach)
 * @emits live
 */
ve.ce.Annotation.prototype.setLive = function ( live ) {
	this.live = live;
	this.emit( 'live' );
};
