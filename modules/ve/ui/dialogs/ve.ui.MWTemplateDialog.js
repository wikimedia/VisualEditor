/*!
 * VisualEditor user interface MWTemplateDialog class.
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
 * @param {ve.ui.Surface} surface
 */
ve.ui.MWTemplateDialog = function VeUiMWTemplateDialog( surface ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWTemplateDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWTemplateDialog.static.titleMessage = 'visualeditor-dialog-template-title';

ve.ui.MWTemplateDialog.static.icon = 'template';

ve.ui.MWTemplateDialog.static.modelClasses = [ ve.dm.MWTemplateNode ];

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.onOpen = function () {
	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWTemplateDialog.prototype.onClose = function () {
	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTemplate', ve.ui.MWTemplateDialog );

ve.ui.viewRegistry.register( 'mwTemplate', ve.ui.MWTemplateDialog );
