/*!
 * VisualEditor UserInterface SurfaceInspector class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface surface inspector.
 *
 * @class
 * @abstract
 * @extends ve.ui.Inspector
 *
 * @constructor
 * @param {ve.ui.SurfaceWindowSet} windowSet Window set this inspector is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.SurfaceInspector = function VeUiSurfaceInspector( windowSet, config ) {
	// Parent constructor
	ve.ui.Inspector.call( this, windowSet, config );

	// Properties
	this.surface = windowSet.getSurface();
};

/* Inheritance */

OO.inheritClass( ve.ui.SurfaceInspector, ve.ui.Inspector );

/* Methods */

/**
 * Handle inspector setup events.
 *
 * @method
 */
ve.ui.SurfaceInspector.prototype.onSetup = function () {
	this.previousSelection = this.surface.getModel().getSelection();
};

/**
 * Handle inspector open events.
 *
 * @method
 */
ve.ui.SurfaceInspector.prototype.onOpen = function () {
	this.initialSelection = this.surface.getModel().getSelection();
};
