/*!
 * VisualEditor UserInterface TitledPanelLayout class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.TitledPanelLayout object.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $title Label element
 * @param {Object} [config] Config options
 * @cfg {jQuery|string} [title=''] Title text
 */
ve.ui.TitledPanelLayout = function VeUiTitledPanelLayout( $title, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.$title = $title;

	// Initialization
	this.$title.addClass( 've-ui-titledPanelLayout-title' );
	this.setTitle( config.title );
};

/* Methods */

/**
 * Set the title.
 *
 * @method
 * @param {jQuery|string} [value] jQuery HTML node selection or string text value to use for label
 * @chainable
 */
ve.ui.TitledPanelLayout.prototype.setTitle = function ( value ) {
	if ( typeof value === 'string' && value.length && /[^\s]*/.test( value ) ) {
		this.$title.text( value );
	} else if ( value instanceof jQuery ) {
		this.$title.empty().append( value );
	} else {
		this.$title.html( '&nbsp;' );
	}
	return this;
};
