/*!
 * ObjectOriented UserInterface InputLabelWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.InputLabelWidget object.
 *
 * CSS classes will be added to the button for each flag, each prefixed with 'oo-ui-InputLabelWidget-'
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {OO.ui.InputWidget|null} [input] Related input widget
 */
OO.ui.InputLabelWidget = function OoUiInputLabelWidget( config ) {
	// Config intialization
	config = $.extend( { 'input': null }, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$element, config );

	// Properties
	this.input = config.input;

	// Events
	this.$element.on( 'click', OO.ui.bind( this.onClick, this ) );

	// Initialization
	this.$element.addClass( 'oo-ui-inputLabelWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.InputLabelWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.InputLabelWidget, OO.ui.LabeledElement );

/* Static Properties */

OO.ui.InputLabelWidget.static.tagName = 'label';

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
OO.ui.InputLabelWidget.prototype.onClick = function () {
	if ( !this.disabled && this.input ) {
		this.input.$input.focus();
	}
	return false;
};
