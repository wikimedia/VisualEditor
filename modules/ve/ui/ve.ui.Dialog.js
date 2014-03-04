/*!
 * VisualEditor UserInterface Dialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog with an associated surface.
 *
 * @class
 * @abstract
 * @extends OO.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface inspector is for
 * @param {Object} [config] Configuration options
 */
ve.ui.Dialog = function VeUiDialog( surface, config ) {
	// Parent constructor
	OO.ui.Dialog.call( this, config );

	// Properties
	this.surface = surface;
};

/* Inheritance */

OO.inheritClass( ve.ui.Dialog, OO.ui.Dialog );
