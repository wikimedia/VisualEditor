/*!
 * VisualEditor UserInterface IconButtonWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.IconButtonWidget object.
 *
 * @class
 * @extends ve.ui.ButtonWidget
 * @mixins ve.ui.IconedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.IconButtonWidget = function VeUiIconButtonWidget( config ) {
	// Parent constructor
	ve.ui.ButtonWidget.call( this, config );

	// Mixin constructors
	ve.ui.IconedElement.call( this, this.$$( '<span>' ), config );

	// Initialization
	this.$button.prepend( this.$icon );
	this.$.addClass( 've-ui-iconButtonWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.IconButtonWidget, ve.ui.ButtonWidget );

ve.mixinClass( ve.ui.IconButtonWidget, ve.ui.IconedElement );

/* Static Properties */

ve.ui.IconButtonWidget.static.emptyHtml = '';
