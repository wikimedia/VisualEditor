/*!
 * ObjectOriented UserInterface MenuToolGroup class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Drop down menu layout of tools as selectable menu items.
 *
 * @class
 * @abstract
 * @extends OO.ui.PopupToolGroup
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuToolGroup = function OoUiMenuToolGroup( toolbar, config ) {
	// Parent constructor
	OO.ui.PopupToolGroup.call( this, toolbar, config );

	// Events
	this.toolbar.connect( this, { 'updateState': 'onUpdateState' } );

	// Initialization
	this.$element.addClass( 'oo-ui-menuToolGroup' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuToolGroup, OO.ui.PopupToolGroup );

/* Static Properties */

OO.ui.MenuToolGroup.static.accelTooltips = true;

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * When the state changes, the title of each active item in the menu will be joined together and
 * used as a label for the group. The label will be empty if none of the items are active.
 *
 * @method
 */
OO.ui.MenuToolGroup.prototype.onUpdateState = function () {
	var name,
		labelTexts = [];

	for ( name in this.tools ) {
		if ( this.tools[name].isActive() ) {
			labelTexts.push( this.tools[name].$label.find( '.oo-ui-tool-title' ).text() );
		}
	}

	this.setLabel( labelTexts.join( ', ' ) );
};
