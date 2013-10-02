/*!
 * VisualEditor UserInterface PushButtonWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.PushButtonWidget object.
 *
 * @class
 * @extends ve.ui.ButtonWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.PushButtonWidget = function VeUiPushButtonWidget( config ) {
	// Parent constructor
	ve.ui.ButtonWidget.call( this, config );

	// Initialization
	this.$.addClass( 've-ui-pushButtonWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.PushButtonWidget, ve.ui.ButtonWidget );
