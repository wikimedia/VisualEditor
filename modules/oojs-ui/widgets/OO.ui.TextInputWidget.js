/*!
 * ObjectOriented UserInterface TextInputWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.TextInputWidget object.
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [placeholder] Placeholder text
 * @cfg {string} [icon] Symbolic name of icon
 * @cfg {boolean} [multiline=false] Allow multiple lines of text
 */
OO.ui.TextInputWidget = function OoUiTextInputWidget( config ) {
	config = config || {};

	// Parent constructor
	OO.ui.InputWidget.call( this, config );

	// Properties
	this.pending = 0;
	this.multiline = !!config.multiline;

	// Events
	this.$input.on( 'keypress', OO.ui.bind( this.onKeyPress, this ) );

	// Initialization
	this.$.addClass( 'oo-ui-textInputWidget' );
	if ( config.icon ) {
		this.$.addClass( 'oo-ui-textInputWidget-decorated' );
		this.$.append(
			$( '<span>' )
				.addClass( 'oo-ui-textInputWidget-icon oo-ui-icon-' + config.icon )
				.mousedown( OO.ui.bind( function () {
					this.$input.focus();
					return false;
				}, this ) )
		);
	}
	if ( config.placeholder ) {
		this.$input.attr( 'placeholder', config.placeholder );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.TextInputWidget, OO.ui.InputWidget );

/* Events */

/**
 * User presses enter inside the text box.
 *
 * Not called if input is multiline.
 *
 * @event enter
 */

/* Methods */

/**
 * Handles key press events.
 *
 * @param {jQuery.Event} e Key press event
 * @fires enter If enter key is pressed and input is not multiline
 */
OO.ui.TextInputWidget.prototype.onKeyPress = function ( e ) {
	if ( e.which === OO.ui.Keys.ENTER && !this.multiline ) {
		this.emit( 'enter' );
	}
};

/**
 * Get input element.
 *
 * @method
 * @param {Object} [config] Configuration options
 * @returns {jQuery} Input element
 */
OO.ui.TextInputWidget.prototype.getInputElement = function ( config ) {
	return config.multiline ? this.$$( '<textarea>' ) : this.$$( '<input>' ).attr( 'type', 'text' );
};

/* Methods */

/**
 * Checks if input is pending.
 *
 * @method
 * @returns {boolean} Input is pending
 */
OO.ui.TextInputWidget.prototype.isPending = function () {
	return !!this.pending;
};

/**
 * Increases the pending stack.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputWidget.prototype.pushPending = function () {
	this.pending++;
	this.$.addClass( 'oo-ui-textInputWidget-pending' );
	this.$input.addClass( 'oo-ui-texture-pending' );
	return this;
};

/**
 * Reduces the pending stack.
 *
 * Clamped at zero.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputWidget.prototype.popPending = function () {
	this.pending = Math.max( 0, this.pending - 1 );
	if ( !this.pending ) {
		this.$.removeClass( 'oo-ui-textInputWidget-pending' );
		this.$input.removeClass( 'oo-ui-texture-pending' );
	}
	return this;
};
