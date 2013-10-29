/*!
 * ObjectOriented UserInterface Widget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * User interface control.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixin OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [disabled=false] Disable
 */
OO.ui.Widget = function OoUiWidget( config ) {
	// Initialize config
	config = OO.ui.extendObject( { 'disabled': false }, config );

	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.disabled = config.disabled;

	// Initialization
	this.$.addClass( 'oo-ui-widget' );
	this.setDisabled( this.disabled );
};

/* Inheritance */

OO.inheritClass( OO.ui.Widget, OO.ui.Element );

OO.mixinClass( OO.ui.Widget, OO.EventEmitter );

/* Methods */

/**
 * Check if the widget is disabled.
 *
 * @method
 * @param {boolean} Button is disabled
 */
OO.ui.Widget.prototype.isDisabled = function () {
	return this.disabled;
};

/**
 * Set the disabled state of the widget.
 *
 * This should probably change the widgets's appearance and prevent it from being used.
 *
 * @method
 * @param {boolean} disabled Disable button
 * @chainable
 */
OO.ui.Widget.prototype.setDisabled = function ( disabled ) {
	this.disabled = !!disabled;
	if ( this.disabled ) {
		this.$.addClass( 'oo-ui-widget-disabled' );
	} else {
		this.$.removeClass( 'oo-ui-widget-disabled' );
	}
	return this;
};
