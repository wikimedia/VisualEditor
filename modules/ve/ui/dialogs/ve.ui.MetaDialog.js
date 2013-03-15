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
ve.ui.MetaDialog.static.titleMessage = 'visualeditor-dialog-meta-title';

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MetaDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.outlinePanel = new ve.ui.PanelLayout( { '$$': this.$$ } );
	this.editorPanel = new ve.ui.PanelLayout( { '$$': this.$$ } );
	this.layout = new ve.ui.GridLayout(
		[this.outlinePanel, this.editorPanel],
		{ '$$': this.$$, 'widths': [1, 2] }
	);

	// Initialization
	this.$body.append( this.layout.$ );
	this.layout.update();
};

/* Registration */

ve.ui.dialogFactory.register( 'meta', ve.ui.MetaDialog );
