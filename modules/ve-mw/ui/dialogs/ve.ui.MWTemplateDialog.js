/*
 * VisualEditor user interface MWTemplateDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog for editing MediaWiki templates.
 *
 * @class
 * @extends ve.ui.MWTransclusionDialog
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.MWTemplateDialog = function VeUiMWTemplateDialog( windowSet, config ) {
	// Parent constructor
	ve.ui.MWTransclusionDialog.call( this, windowSet, config );

	// Properties
	this.node = null;
	this.transclusion = null;
	this.loaded = false;
};

/* Inheritance */

OO.inheritClass( ve.ui.MWTemplateDialog, ve.ui.MWTransclusionDialog );

/* Static Properties */

ve.ui.MWTemplateDialog.static.name = 'transclusion';

ve.ui.MWTemplateDialog.static.titleMessage = 'visualeditor-dialog-transclusion-title';

ve.ui.MWTemplateDialog.static.icon = 'template';

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.MWTemplateDialog.prototype.getBookletLayout = function () {
	return new OO.ui.BookletLayout( {
		'$': this.$,
		'continuous': true,
		'autoFocus': true,
		'outlined': true
	} );
};

/* Registration */

ve.ui.dialogFactory.register( ve.ui.MWTemplateDialog );
