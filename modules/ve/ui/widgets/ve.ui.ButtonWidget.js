/*!
 * VisualEditor user interface ButtonWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ButtonWidget object.
 *
 * CSS classes will be added to the button for each flag, each prefixed with 've-ui-buttonWidget-'
 *
 * @abstract
 * @class
 * @constructor
 * @extends ve.ui.Widget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {string} label Button label
 * @param {string[]} [flags] List of styling flags, e.g. 'primary', 'destructive' or 'constructive'
 */
ve.ui.ButtonWidget = function VeUiButtonWidget( $$, label, flags ) {
	// Parent constructor
	ve.ui.Widget.call( this, $$, $( '<a>' ) );

	// Properties
	this.$label = this.$$( '<span>' );

	// Events
	this.$.on( 'click', ve.bind( this.onClick, this ) );

	// Initialization
	this.$label
		.addClass( 've-ui-buttonWidget-label' )
		.text( label );
	this.$
		.addClass( 've-ui-buttonWidget' )
		.append( this.$label );
	if ( ve.isArray( flags ) ) {
		this.$.addClass( 've-ui-buttonWidget-' + flags.join( ' ve-ui-buttonWidget-' ) );
	}
};

/* Inheritance */

ve.inheritClass( ve.ui.ButtonWidget, ve.ui.Widget );

/**
 * @event click
 */

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.ButtonWidget.prototype.onClick = function ( e ) {
	if ( !this.disabled ) {
		this.emit( 'click' );
	}
	e.preventDefault();
	return false;
};
