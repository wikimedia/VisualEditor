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
 * @extends ve.ui.PagedDialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 */
ve.ui.MWTemplateDialog = function VeUiMWTemplateDialog( surface ) {
	// Parent constructor
	ve.ui.PagedDialog.call( this, surface );

	this.templateData = {
		'title': 'Template:Unsigned',
		'params': {
			'user': {
				'label': {
					'en': 'User'
				},
				'description': {
					'en': 'Name or IP of user who left the comment'
				},
				'required': true,
				'type': 'string/wiki-user-name',
				'aliases': [
						'1'
				],
				'deprecated': false,
				'default': ''
			},
			'timestamp': {
				'label': {
					'en': 'Time stamp'
				},
				'description': {
					'en': 'datestamp from edit history (remember to label it UTC)'
				},
				'aliases': [
						'2'
				],
				'required': false,
				'deprecated': false,
				'default': '',
				'type': 'unknown'
			}
		}
	};
};

/* Inheritance */

ve.inheritClass( ve.ui.MWTemplateDialog, ve.ui.PagedDialog );

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
	ve.ui.PagedDialog.prototype.initialize.call( this );
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.onOpen = function () {
	var param;

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Add template page
	this.addPage( 'template', this.templateData.title, 'template' );

	// Add page for each parameter
	for ( param in this.templateData.params ) {
		this.addPage(
			'parameter_' + param,
			this.templateData.params[param].label.en, // TODO: use proper language instead of hardcoded 'en'
			'parameter',
			1
		);
	}

};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWTemplateDialog.prototype.onClose = function () {
	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );
	this.clearPages();
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTemplate', ve.ui.MWTemplateDialog );

ve.ui.viewRegistry.register( 'mwTemplate', ve.ui.MWTemplateDialog );
