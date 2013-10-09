/*!
 * ObjectOriented UserInterface IconButtonWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.IconButtonWidget object.
 *
 * @class
 * @extends OO.ui.ButtonWidget
 * @mixins OO.ui.IconedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.IconButtonWidget = function OoUiIconButtonWidget( config ) {
	// Parent constructor
	OO.ui.ButtonWidget.call( this, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$$( '<span>' ), config );

	// Initialization
	this.$button.prepend( this.$icon );
	this.$.addClass( 'oo-ui-iconButtonWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.IconButtonWidget, OO.ui.ButtonWidget );

OO.mixinClass( OO.ui.IconButtonWidget, OO.ui.IconedElement );

/* Static Properties */

OO.ui.IconButtonWidget.static.emptyHtml = '';
