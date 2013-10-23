/*!
 * ObjectOriented UserInterface BarToolGroup class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Horizontal bar layout of tools as icon buttons.
 *
 * @class
 * @abstract
 * @extends OO.ui.ToolGroup
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.BarToolGroup = function OoUiBarToolGroup( toolbar, config ) {
	// Parent constructor
	OO.ui.ToolGroup.call( this, toolbar, config );

	// Initialization
	this.$.addClass( 'oo-ui-barToolGroup' );
};

/* Inheritance */

OO.inheritClass( OO.ui.BarToolGroup, OO.ui.ToolGroup );

/* Static Properties */

OO.ui.BarToolGroup.static.labelTooltips = true;

OO.ui.BarToolGroup.static.accelTooltips = true;
