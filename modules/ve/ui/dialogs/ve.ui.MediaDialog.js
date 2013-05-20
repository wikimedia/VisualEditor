/*!
 * VisualEditor user interface MediaDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Document dialog.
 *
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MediaDialog = function VeUiMediaDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MediaDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MediaDialog.static.titleMessage = 'visualeditor-dialog-media-title';

ve.ui.MediaDialog.static.icon = 'picture';

ve.ui.MediaDialog.static.modelClasses = [ ve.dm.ImageNode ];

/* Methods */

/* Registration */

ve.ui.dialogFactory.register( 'media', ve.ui.MediaDialog );

ve.ui.viewRegistry.register( 'media', ve.ui.MediaDialog );
