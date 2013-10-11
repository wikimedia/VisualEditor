/*!
 * VisualEditor UserInterface SurfaceDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface surface dialog.
 *
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.SurfaceWindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.SurfaceDialog = function VeUiSurfaceDialog( windowSet, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, windowSet, config );

	// Properties
	this.surface = windowSet.getSurface();
};

/* Inheritance */

OO.inheritClass( ve.ui.SurfaceDialog, ve.ui.Dialog );
