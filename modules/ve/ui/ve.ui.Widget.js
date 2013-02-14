/*!
 * VisualEditor user interface Widget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
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
	this.disabled = false;

	// Initialization
	this.$.addClass( 've-ui-widget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.Widget, ve.EventEmitter );

/* Methods */

/**
 * Check if the widget is disabled.
 *
 * @method
 * @param {boolean} Button is disabled
 */
ve.ui.Widget.prototype.isDisabled = function () {
	return this.disabled;
};

/**
 * Set the disabled state of the widget.
 *
 * This should probably change the widgets's appearance and prevent it from being used.
 *
 * @method
 * @param {boolean} state Disable button
 */
ve.ui.Widget.prototype.setDisabled = function ( state ) {
	this.disabled = !!state;
	if ( this.disabled ) {
		this.$.addClass( 've-ui-widget-disabled' );
	} else {
		this.$.removeClass( 've-ui-widget-disabled' );
	}
};
