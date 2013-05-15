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
	var mwAttr = this.surface.view.focusedNode.model.getAttribute( 'mw' ),
		templateData = this.getTemplateData( mwAttr.target.wt ),
		param, pageName, fieldset, textInput, inputLabel, label;

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Add template page
	this.addPage( 'template', mwAttr.target.wt, 'template' );

	// Loop through parameters
	for ( param in mwAttr.params ) {
		pageName = 'parameter_' + param;
		label = templateData && templateData.params[param] ?
			templateData.params[param].label.en :
			param;

		this.addPage( pageName, label, 'parameter', 1 );

		// Create content
		fieldset = new ve.ui.FieldsetLayout( {
			'$$': this.$$, 'label': label, 'icon': 'parameter'
		} );
		textInput = new ve.ui.TextInputWidget( {
			'$$': this.$$, 'multiline': true
		} );
		textInput.$input.css('height', 100);

		if ( templateData && templateData.params[param] ) {
			inputLabel = new ve.ui.InputLabelWidget( {
				'$$': this.$$,
				'input': textInput,
				'label': templateData.params[param].description.en
			} );
			fieldset.$.append( inputLabel.$ );
		}

		fieldset.$.append( textInput.$ );
		this.pages[pageName].$.append( fieldset.$ );
		textInput.setValue( mwAttr.params[param].wt );
	}

};

ve.ui.MWTemplateDialog.prototype.getTemplateData = function ( /*templateName*/ ) {
	var templateData = {
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
			'param1': {
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
	return templateData;
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
