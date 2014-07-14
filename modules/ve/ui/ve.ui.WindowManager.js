/*!
 * VisualEditor UserInterface WindowManager class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Window manager for  windows.
 *
 * @class
 * @extends OO.ui.WindowManager
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {ve.ui.Overlay} [overlay] Overlay to use for menus
 */
ve.ui.WindowManager = function VeUiWindowManager( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	ve.ui.WindowManager.super.call( this, config );

	// Properties
	this.overlay = config.overlay || null;
};

/* Inheritance */

OO.inheritClass( ve.ui.WindowManager, OO.ui.WindowManager );

/* Methods */

/**
 * Get overlay for menus.
 *
 * @return {ve.ui.Overlay|null} Menu overlay, null if none was configured
 */
ve.ui.WindowManager.prototype.getOverlay = function () {
	return this.overlay;
};
