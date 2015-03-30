/*!
 * VisualEditor UserInterface MobileWindowManager class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Window manager for mobile windows.
 *
 * @class
 * @extends ve.ui.SurfaceWindowManager
 *
 * @constructor
 * @param {ve.ui.Surface} Surface this belongs to
 * @param {Object} [config] Configuration options
 * @cfg {ve.ui.Overlay} [overlay] Overlay to use for menus
 */
ve.ui.MobileWindowManager = function VeUiMobileWindowManager( surface, config ) {
	// Parent constructor
	ve.ui.MobileWindowManager.super.call( this, surface, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.MobileWindowManager, ve.ui.SurfaceWindowManager );

/* Static Properties */

ve.ui.MobileWindowManager.static.sizes = {
	full: {
		width: '100%',
		height: '100%'
	}
};
ve.ui.MobileWindowManager.static.defaultSize = 'full';

/* Methods */
