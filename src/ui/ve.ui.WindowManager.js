/*!
 * VisualEditor UserInterface WindowManager class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Window manager.
 *
 * @class
 * @extends OO.ui.WindowManager
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {ve.ui.Overlay} [config.overlay] Overlay to use for menus
 */
ve.ui.WindowManager = function VeUiWindowManager( config = {} ) {
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

/**
 * TODO: Upstream to OOUI
 *
 * @inheritdoc
 */
ve.ui.WindowManager.prototype.destroy = function () {
	const promise = this.clearWindows();
	this.$element.remove();
	return promise;
};
