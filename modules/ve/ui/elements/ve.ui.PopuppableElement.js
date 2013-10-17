/*!
 * VisualEditor UserInterface PopuppableElement class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
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
ve.ui.PopuppableElement = function VeUiPopuppableElement( config ) {
	// Configuration initialization
	config = ve.extendObject( { 'popupWidth': 320 }, config );

	// Properties
	this.popup = new ve.ui.PopupWidget( ve.extendObject(
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
 * @returns {ve.ui.PopupWidget} Popup widget
 */
ve.ui.PopuppableElement.prototype.getPopup = function () {
	return this.popup;
};

/**
 * Show popup.
 *
 * @method
 */
ve.ui.PopuppableElement.prototype.showPopup = function () {
	this.popup.show().display( this.popupWidth, this.popupHeight );
};

/**
 * Hide popup.
 *
 * @method
 */
ve.ui.PopuppableElement.prototype.hidePopup = function () {
	this.popup.hide();
};
