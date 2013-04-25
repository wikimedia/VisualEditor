/*!
 * VisualEditor ContentEditable View class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic base class for CE views.
 *
 * @abstract
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Model} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.View = function VeCeView( model, $element ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.model = model;
	this.$ = $element || $( '<div>' );
	this.live = false;

	// Initialization
	this.$.data( 'view', this );
	if ( this.constructor.static.renderHtmlAttributes ) {
		ve.setDomAttributes(
			this.$[0],
			this.model.getAttributes( 'html/0/' ),
			this.constructor.static.domAttributeWhitelist
		);
	}
};

/* Inheritance */

ve.mixinClass( ve.ce.View, ve.EventEmitter );

/* Events */

/**
 * @event live
 */

/* Static Members */

ve.ce.View.static = {};

/**
 * Allowed attributes for DOM elements.
 *
 * This list includes attributes that are generally safe to include in HTML loaded from a
 * foreign source and displaying it inside the browser. It doesn't include any event attributes,
 * for instance, which would allow arbitrary JavaScript execution. This alone is not enough to
 * make HTML safe to display, but it helps.
 *
 * TODO: Rather than use a single global list, set these on a per-view basis to something that makes
 * sense for that view in particular.
 *
 * @static
 * @property static.domAttributeWhitelist
 * @inheritable
 */
ve.ce.View.static.domAttributeWhitelist = [
	'abbr', 'about', 'align', 'alt', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing',
	'char', 'charoff', 'cite', 'class', 'clear', 'color', 'colspan', 'datatype', 'datetime',
	'dir', 'face', 'frame', 'headers', 'height', 'href', 'id', 'itemid', 'itemprop', 'itemref',
	'itemscope', 'itemtype', 'lang', 'noshade', 'nowrap', 'property', 'rbspan', 'rel',
	'resource', 'rev', 'rowspan', 'rules', 'scope', 'size', 'span', 'src', 'start', 'style',
	'summary', 'title', 'type', 'typeof', 'valign', 'value', 'width'
];

/**
 * Whether or not HTML attributes listed in domAttributeWhitelist and present in HTMLDOM should be
 * added to node anchor (this.$).
 *
 * @static
 * @property static.renderHtmlAttributes
 * @inheritable
 */
ve.ce.View.static.renderHtmlAttributes = true;

/* Methods */

/**
 * Get the model the view observes.
 *
 * @method
 * @returns {ve.dm.Node} Model the view observes
 */
ve.ce.View.prototype.getModel = function () {
	return this.model;
};

/**
 * Check if the view is attached to the live DOM.
 *
 * @method
 * @returns {boolean} View is attached to the live DOM
 */
ve.ce.View.prototype.isLive = function () {
	return this.live;
};

/**
 * Set live state.
 *
 * @method
 * @param {boolean} live The view has been attached to the live DOM (use false on detach)
 * @emits live
 */
ve.ce.View.prototype.setLive = function ( live ) {
	this.live = live;
	this.emit( 'live' );
};
