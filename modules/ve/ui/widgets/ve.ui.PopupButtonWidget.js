/*!
 * VisualEditor UserInterface PopupButtonWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Button that shows and hides a popup.
 *
 * @class
 * @extends ve.ui.IconButtonWidget
 * @mixins ve.ui.PopuppableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.PopupButtonWidget = function VeUiPopupButtonWidget( config ) {
	// Parent constructor
	ve.ui.IconButtonWidget.call( this, config );

	// Mixin constructors
	ve.ui.PopuppableElement.call( this, config );

	// Initialization
	this.$
		.addClass( 've-ui-popupButtonWidget' )
		.append( this.popup.$ );
};

/* Inheritance */

OO.inheritClass( ve.ui.PopupButtonWidget, ve.ui.IconButtonWidget );

OO.mixinClass( ve.ui.PopupButtonWidget, ve.ui.PopuppableElement );

/* Methods */

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.ui.PopupButtonWidget.prototype.onClick = function ( e ) {
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
		ve.ui.IconButtonWidget.prototype.onClick.call( this );
	}
	return false;
};
