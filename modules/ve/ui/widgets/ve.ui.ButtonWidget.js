/*!
 * VisualEditor UserInterface ButtonWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ButtonWidget object.
 *
 * @class
 * @extends ve.ui.Widget
 * @mixins ve.ui.FlaggableElement
 * @mixins ve.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.ButtonWidget = function VeUiButtonWidget( config ) {
	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Mixin constructors
	ve.ui.FlaggableElement.call( this, config );
	ve.ui.LabeledElement.call( this, this.$$( '<span>' ), config );

	// Events
	this.$.on( 'click', ve.bind( this.onClick, this ) );

	// Initialization
	this.$.addClass( 've-ui-buttonWidget' ).append( this.$label );
};

/* Inheritance */

ve.inheritClass( ve.ui.ButtonWidget, ve.ui.Widget );

ve.mixinClass( ve.ui.ButtonWidget, ve.ui.FlaggableElement );

ve.mixinClass( ve.ui.ButtonWidget, ve.ui.LabeledElement );

/* Events */

/**
 * @event click
 */

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 * @emits click
 */
ve.ui.ButtonWidget.prototype.onClick = function () {
	if ( !this.disabled ) {
		this.emit( 'click' );
	}
	return false;
};
