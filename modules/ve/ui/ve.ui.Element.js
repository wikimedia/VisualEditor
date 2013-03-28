/*!
 * VisualEditor UserInterface Element class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Element object.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {Function} [$$=$] jQuery for the frame the widget is in
 */
ve.ui.Element = function VeUiElement( config ) {
	// Initialize config
	config = ve.extendObject( { '$$': $ }, config );

	// Properties
	this.$$ = config.$$;
	this.$ = this.$$( '<' + this.constructor.static.tagName + '>' );
};

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
ve.ui.Element.static = {};

/**
 * HTML element name.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.Element.static.tagName = 'div';
