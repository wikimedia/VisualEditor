/*!
 * VisualEditor UserInterface Element class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.Element object.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {Function} [$$] jQuery for the frame the widget is in
 */
ve.Element = function VeElement( config ) {
	// Initialize config
	config = config || {};
	// Properties
	this.$$ = config.$$ || ve.Element.static.get$$( document );
	this.$ = this.$$( this.$$.context.createElement( this.getTagName() ) );
};

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
ve.Element.static = {};

/**
 * HTML tag name.
 *
 * This may be ignored if getTagName is overridden.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.Element.static.tagName = 'div';

/* Static Methods */

/**
 * Gets a jQuery function within a specific document.
 *
 * @method
 * @param {jQuery|HTMLElement|HTMLDocument|Window} context Context to bind the function to
 * @param {ve.ui.Frame} [frame] Frame of the document context
 * @returns {Function} Bound jQuery function
 */
ve.Element.static.get$$ = function ( context, frame ) {
	function wrapper( selector ) {
		return $( selector, wrapper.context );
	}

	wrapper.context = this.getDocument( context );

	if ( frame ) {
		wrapper.frame = frame;
	}

	return wrapper;
};

/**
 * Get the document of an element.
 *
 * @method
 * @param {jQuery|HTMLElement|HTMLDocument|Window} context Context to bind the function to
 * @return {HTMLDocument} Document object
 * @throws {Error} If context is invalid
 */
ve.Element.static.getDocument = function ( context ) {
	var doc =
		// jQuery - selections created "offscreen" won't have a context, so .context isn't reliable
		( context[0] && context[0].ownerDocument ) ||
		// HTMLElement
		context.ownerDocument ||
		// Window
		context.document ||
		// HTMLDocument
		( context.nodeType === 9 && context );

	if ( doc ) {
		return doc;
	}

	throw new Error( 'Invalid context' );
};

/**
 * Get the window of an element or document.
 *
 * @method
 * @param {jQuery|HTMLElement|HTMLDocument|Window} context Context to bind the function to
 * @return {Window} Window object
 */
ve.Element.static.getWindow = function ( context ) {
	var doc = this.getDocument( context );
	return doc.parentWindow || doc.defaultView;
};

/* Methods */

/**
 * Get the HTML tag name.
 *
 * Override this method to base the result on instance information.
 *
 * @method
 * @return {string} HTML tag name
 */
ve.Element.prototype.getTagName = function () {
	return this.constructor.static.tagName;
};

/**
 * Get the DOM document.
 *
 * @method
 * @return {HTMLDocument} Document object
 */
ve.Element.prototype.getElementDocument = function () {
	return ve.Element.static.getDocument( this.$ );
};

/**
 * Get the DOM window.
 *
 * @method
 * @return {Window} Window object
 */
ve.Element.prototype.getElementWindow = function () {
	return ve.Element.static.getWindow( this.$ );
};
