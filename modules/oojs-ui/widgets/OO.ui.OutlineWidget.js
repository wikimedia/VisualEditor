/*!
 * ObjectOriented UserInterface OutlineWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Create an OO.ui.OutlineWidget object.
 *
 * @class
 * @extends OO.ui.SelectWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.OutlineWidget = function OoUiOutlineWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.SelectWidget.call( this, config );

	// Initialization
	this.$.addClass( 'oo-ui-outlineWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.OutlineWidget, OO.ui.SelectWidget );
