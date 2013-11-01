/*!
 * ObjectOriented UserInterface MenuSectionItemWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.MenuSectionItemWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuSectionItemWidget = function OoUiMenuSectionItemWidget( data, config ) {
	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Initialization
	this.$element.addClass( 'oo-ui-menuSectionItemWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuSectionItemWidget, OO.ui.OptionWidget );

OO.ui.MenuSectionItemWidget.static.selectable = false;

OO.ui.MenuSectionItemWidget.static.highlightable = false;
