/*!
 * ObjectOriented UserInterface PopupButtonWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Button that shows and hides a popup.
 *
 * @class
 * @extends OO.ui.IconButtonWidget
 * @mixins OO.ui.PopuppableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.PopupButtonWidget = function OoUiPopupButtonWidget( config ) {
	// Parent constructor
	OO.ui.IconButtonWidget.call( this, config );

	// Mixin constructors
	OO.ui.PopuppableElement.call( this, config );

	// Initialization
	this.$
		.addClass( 'oo-ui-popupButtonWidget' )
		.append( this.popup.$ );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupButtonWidget, OO.ui.IconButtonWidget );

OO.mixinClass( OO.ui.PopupButtonWidget, OO.ui.PopuppableElement );

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
OO.ui.PopupButtonWidget.prototype.onClick = function ( e ) {
	// Skip clicks within the popup
	if ( $.contains( this.popup.$[0], e.target ) ) {
		return;
	}

	if ( !this.disabled ) {
		if ( this.popup.isVisible() ) {
			this.hidePopup();
		} else {
			this.showPopup();
		}
		OO.ui.IconButtonWidget.prototype.onClick.call( this );
	}
	return false;
};
