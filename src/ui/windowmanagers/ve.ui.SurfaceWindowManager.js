/*!
 * VisualEditor UserInterface SurfaceWindowManager class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Window manager for desktop inspectors.
 *
 * @class
 * @extends ve.ui.WindowManager
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface this belongs to
 * @param {Object} [config] Configuration options
 * @param {ve.ui.Overlay} [config.overlay] Overlay to use for menus
 */
ve.ui.SurfaceWindowManager = function VeUiSurfaceWindowManager( surface, config = {} ) {
	// Properties
	// Set up surface before calling the parent so we can request
	// specific surface-related details from within the constructor.
	this.surface = surface;

	// Parent constructor
	ve.ui.SurfaceWindowManager.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.SurfaceWindowManager, ve.ui.WindowManager );

/* Methods */

/**
 * Get surface.
 *
 * @return {ve.ui.Surface} Surface this belongs to
 */
ve.ui.SurfaceWindowManager.prototype.getSurface = function () {
	return this.surface;
};
