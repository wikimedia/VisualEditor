/*!
 * VisualEditor user interface MetaDialog class.
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
 * @param {ve.Surface} surface
 */
ve.ui.MetaDialog = function VeUiMetaDialog( surface ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface );

	// TODO: Construct meta dialog inside .ve-ui-dialog-container
};

/* Inheritance */

ve.inheritClass( ve.ui.MetaDialog, ve.ui.Dialog );


/* Static Properties */

/**
 * Localized message for dialog title.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.MetaDialog.static.dialogTitleMessage = 'visualeditor-dialog-meta-title';

/* Methods */
