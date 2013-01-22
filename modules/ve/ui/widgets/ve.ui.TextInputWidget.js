/*!
 * VisualEditor user interface TextInputWidget class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.TextInputWidget object.
 *
 * @class
 * @constructor
 * @extends ve.ui.InputWidget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {string} [name] Input name, used by HTML forms
 * @param {string} [value] Input value
 */
ve.ui.TextInputWidget = function VeUiTextInputWidget( $$, name, value ) {
	// Parent constructor
	ve.ui.InputWidget.call( this, $$, 'text', name, value );

	// Initialization
	this.$.addClass( 've-ui-textInputWidget' ).attr( 'type', 'text' );
};

/* Inheritance */

ve.inheritClass( ve.ui.TextInputWidget, ve.ui.InputWidget );
