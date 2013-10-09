/*!
 * ObjectOriented UserInterface MenuItemWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.MenuItemWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuItemWidget = function OoUiMenuItemWidget( data, config ) {
	// Configuration initialization
	config = OO.ui.extendObject( { 'icon': 'check' }, config );

	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Initialization
	this.$.addClass( 'oo-ui-menuItemWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuItemWidget, OO.ui.OptionWidget );
