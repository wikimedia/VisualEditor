/*!
 * VisualEditor user interface ContentDialog class.
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
ve.ui.ContentDialog = function VeUiContentDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.ContentDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.ContentDialog.static.titleMessage = 'visualeditor-dialog-content-title';

/* Registration */

ve.ui.dialogFactory.register( 'content', ve.ui.ContentDialog );
