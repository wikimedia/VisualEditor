/*!
 * VisualEditor user interface InputLabelWidget class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.InputLabelWidget object.
 *
 * CSS classes will be added to the button for each flag, each prefixed with 've-ui-InputLabelWidget-'
 *
 * @abstract
 * @class
 * @constructor
 * @extends ve.ui.Widget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {string} label Button label
 * @param {string[]} [flags] List of styling flags, e.g. 'primary', 'destructive' or 'constructive'
 */
ve.ui.InputLabelWidget = function VeUiInputLabelWidget( $$, label, input ) {
	// Parent constructor
	ve.ui.Widget.call( this, $$, $( '<label>' ) );

	// Properties
	this.input = input || null;

	// Events
	this.$.on(
		'click',
		ve.bind( function () {
			if ( this.input ) {
				this.input.$input.focus();
			}
		}, this )
	);

	// Initialization
	this.$
		.text( label )
		.addClass( 've-ui-InputLabelWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.InputLabelWidget, ve.ui.Widget );
