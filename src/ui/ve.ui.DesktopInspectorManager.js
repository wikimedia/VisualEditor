/*!
 * VisualEditor UserInterface DesktopInspectorManager class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Window manager for desktop inspectors.
 *
 * @class
 * @extends ve.ui.WindowManager
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {ve.ui.Overlay} [overlay] Overlay to use for menus
 */
ve.ui.DesktopInspectorManager = function VeUiDesktopInspectorManager( config ) {
	// Parent constructor
	ve.ui.DesktopInspectorManager.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.DesktopInspectorManager, ve.ui.WindowManager );

/* Static Properties */

ve.ui.DesktopInspectorManager.static.sizes = {
	small: {
		width: 200,
		maxHeight: '100%'
	},
	medium: {
		width: 300,
		maxHeight: '100%'
	},
	large: {
		width: 400,
		maxHeight: '100%'
	},
	full: {
		// These can be non-numeric because they are never used in calculations
		width: '100%',
		height: '100%'
	}
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DesktopInspectorManager.prototype.getSetupDelay = function () {
	return 0;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopInspectorManager.prototype.getReadyDelay = function () {
	return 0;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopInspectorManager.prototype.getHoldDelay = function () {
	return 0;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopInspectorManager.prototype.getTeardownDelay = function () {
	return 0;
};
