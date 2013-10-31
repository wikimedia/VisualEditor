/*!
 * ObjectOriented UserInterface PopuppableElement class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Popuppable element.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [popupWidth=320] Width of popup
 * @cfg {number} [popupHeight] Height of popup
 * @cfg {Object} [popup] Configuration to pass to popup
 */
OO.ui.PopuppableElement = function OoUiPopuppableElement( config ) {
	// Configuration initialization
	config = $.extend( { 'popupWidth': 320 }, config );

	// Properties
	this.popup = new OO.ui.PopupWidget( $.extend(
		{ 'align': 'center', 'autoClose': true },
		config.popup,
		{ '$$': this.$$, '$autoCloseIgnore': this.$ }
	) );
	this.popupWidth = config.popupWidth;
	this.popupHeight = config.popupHeight;
};

/* Methods */

/**
 * Get popup.
 *
 * @method
 * @returns {OO.ui.PopupWidget} Popup widget
 */
OO.ui.PopuppableElement.prototype.getPopup = function () {
	return this.popup;
};

/**
 * Show popup.
 *
 * @method
 */
OO.ui.PopuppableElement.prototype.showPopup = function () {
	this.popup.show().display( this.popupWidth, this.popupHeight );
};

/**
 * Hide popup.
 *
 * @method
 */
OO.ui.PopuppableElement.prototype.hidePopup = function () {
	this.popup.hide();
};
