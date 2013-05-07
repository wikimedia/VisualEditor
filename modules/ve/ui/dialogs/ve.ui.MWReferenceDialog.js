/*!
 * VisualEditor user interface MWReferenceDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Document dialog.
 *
 * @class
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.MWReferenceDialog = function VeUiMWReferenceDialog( surface ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWReferenceDialog.static.titleMessage = 'visualeditor-dialog-reference-title';

ve.ui.MWReferenceDialog.static.icon = 'reference';

ve.ui.MWReferenceDialog.static.modelClasses = [ ve.dm.MWReferenceNode ];

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWReferenceDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWReferenceDialog.prototype.onOpen = function () {
	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWReferenceDialog.prototype.onClose = function () {
	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwReference', ve.ui.MWReferenceDialog );

ve.ui.viewRegistry.register( 'mwReference', ve.ui.MWReferenceDialog );
