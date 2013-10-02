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
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [width=320] Width of popup
 * @cfg {number} [height] Height of popup
 * @cfg {Object} [popup] Configuration to pass to popup
 */
ve.ui.PopupButtonWidget = function VeUiPopupButtonWidget( config ) {
	// Configuration initialization
	config = ve.extendObject( { 'width': 320 }, config );

	// Parent constructor
	ve.ui.IconButtonWidget.call( this, config );

	// Properties
	this.popup = new ve.ui.PopupWidget( ve.extendObject(
		{ 'align': 'center', 'autoClose': true },
		config.popup,
		{ '$$': this.$$, '$autoCloseIgnore': this.$ }
	) );
	this.width = config.width;
	this.height = config.height;

	// Initialization
	this.$.addClass( 've-ui-popupButtonWidget' );
	this.$.append( this.popup.$ );
};

/* Inheritance */

ve.inheritClass( ve.ui.PopupButtonWidget, ve.ui.IconButtonWidget );

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

/**
 * Get popup.
 *
 * @method
 * @returns {ve.ui.PopupWidget} Popup widget
 */
ve.ui.PopupButtonWidget.prototype.getPopup = function () {
	return this.popup;
};

/**
 * Show popup.
 *
 * @method
 */
ve.ui.PopupButtonWidget.prototype.showPopup = function () {
	this.popup.show().display( this.width, this.height );
};

/**
 * Hide popup.
 *
 * @method
 */
ve.ui.PopupButtonWidget.prototype.hidePopup = function () {
	this.popup.hide();
};
