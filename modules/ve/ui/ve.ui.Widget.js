/**
 * VisualEditor user interface Widget class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Widget object.
 *
 * @class
 * @abstract
 * @extends ve.EventEmitter
 * @constructor
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {jQuery} [$element] Widget element
 */
ve.ui.Widget = function VeUiWidget( $$, $element ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.$$ = $$;
	this.$ = $element || this.$$( '<div>' );

	// Initialization
	this.$.addClass( 've-ui-widget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.Widget, ve.EventEmitter );
