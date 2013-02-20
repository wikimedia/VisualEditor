/*!
 * VisualEditor UserInterface LabeledWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LabeledWidget object.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $label Label element
 * @param {Object} [config] Config options
 * @cfg {jQuery|string} [label=''] Label text
 */
ve.ui.LabeledWidget = function VeUiLabeledWidget( $label, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.$label = $label;

	// Initialization
	this.setLabel( config.label );
};

/* Methods */

/**
 * Set the label.
 *
 * @method
 * @param {jQuery|string} [value] jQuery HTML node selection or string text value to use for label
 * @chainable
 */
ve.ui.LabeledWidget.prototype.setLabel = function ( value ) {
	if ( typeof value === 'string' && value.length && /[^\s]*/.test( value ) ) {
		this.$label.text( value );
	} else if ( value instanceof jQuery ) {
		this.$label.empty().append( value );
	} else {
		this.$label.html( '&nbsp;' );
	}
	return this;
};
