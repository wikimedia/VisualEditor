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
		param;

	this.paramsKeys = [];
	this.paramsToInputs = {};

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Add template page
	this.addPage( 'template', mwAttr.target.wt, 'template' );

	// Loop through parameters
	for ( param in mwAttr.params ) {
		this.createPage(
			param,
			mwAttr.params[param],
			templateData && templateData.params[param]
		);
	}
};

/**
 * Handle creating page for single parameter.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.createPage = function( key, value, singleTemplateData ) {
	var pageName = 'parameter_' + key,
		label = singleTemplateData ? singleTemplateData.label.en : key,
		fieldset, textInput, inputLabel;

	fieldset = new ve.ui.FieldsetLayout( { '$$': this.$$, 'label': label, 'icon': 'parameter' } );
	textInput = new ve.ui.TextInputWidget( { '$$': this.$$, 'multiline': true } );
	textInput.$input.css('height', 100);

	if ( singleTemplateData  ) {
		inputLabel = new ve.ui.InputLabelWidget( {
			'$$': this.$$,
			'input': textInput,
			'label': singleTemplateData.description.en
		} );
		fieldset.$.append( inputLabel.$ );
	}

	fieldset.$.append( textInput.$ );
	textInput.setValue( value.wt );
	this.addPage( pageName, label, 'parameter', 1 );
	this.pages[pageName].$.append( fieldset.$ );

	this.paramsKeys.push( key );
	this.paramsToInputs[key] = textInput;
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
ve.ui.MWTemplateDialog.prototype.onClose = function ( action ) {
	var mwAttr, i;
	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	if ( action === 'apply' ) {
		mwAttr = ve.cloneObject( this.surface.view.focusedNode.model.getAttribute( 'mw' ) );
		mwAttr.params = {};
		for ( i = 0; i < this.paramsKeys.length; i++ ) {
			mwAttr.params[this.paramsKeys[i]] = {
				'wt': this.paramsToInputs[this.paramsKeys[i]].getValue()
			};
		}
		this.surface.model.change(
			ve.dm.Transaction.newFromAttributeChange(
				this.surface.model.documentModel,
				this.surface.view.focusedNode.getOffset(),
				'mw',
				mwAttr
			)
		);
	}

	this.clearPages();
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTemplate', ve.ui.MWTemplateDialog );

ve.ui.viewRegistry.register( 'mwTemplate', ve.ui.MWTemplateDialog );
