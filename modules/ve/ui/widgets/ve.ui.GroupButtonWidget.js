/*!
 * VisualEditor UserInterface GroupButtonWidget class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.GroupButtonWidget object.
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @param {Object} [config] Configuration options
 * @cfg {Object} [group] Button group parameters organized by { 'label': returnValue }
 *  where 'returnValue' is the value associated with the button
 */
ve.ui.GroupButtonWidget = function VeUiGroupButtonWidget( config ) {
	var item, button, arrButtons = [];

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$( '<div>' ), config );

	// Initialization
	this.value = null;
	this.group = config.group;
	this.buttons = {};
	// Set up the buttons
	for ( item in this.group ) {
		button = new OO.ui.ButtonWidget( {
			'label': item,
		} );
		// store value
		button.returnValue = this.group[item];
		arrButtons.push( button );
	}

	this.addItems( arrButtons );

	this.$element.append( this.$group.addClass( 've-ui-groupButtonWidget' ) );
};

/* Inheritance */

OO.inheritClass( ve.ui.GroupButtonWidget, OO.ui.Widget );

OO.mixinClass( ve.ui.GroupButtonWidget, OO.ui.GroupElement );
