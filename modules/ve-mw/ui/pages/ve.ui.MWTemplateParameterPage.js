/*!
 * VisualEditor user interface MWTemplateParameterPage class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki transclusion dialog template page.
 *
 * @class
 * @extends OO.ui.PageLayout
 *
 * @constructor
 * @param {ve.dm.MWTemplateParameterModel} parameter Template parameter
 * @param {string} name Unique symbolic name of page
 * @param {Object} [config] Configuration options
 */
ve.ui.MWTemplateParameterPage = function VeUiMWTemplateParameter( parameter, name, config ) {
	// Configuration initialization
	config = ve.extendObject( config, { 'icon': 'parameter', 'moveable': false, 'level': 1 } );

	// Parent constructor
	OO.ui.PageLayout.call( this, name, config );

	// Properties
	this.parameter = parameter;
	this.spec = parameter.getTemplate().getSpec();
	this.label = this.spec.getParameterLabel( this.parameter.getName() );
	this.textInput = new OO.ui.TextInputWidget( {
			'$': this.$,
			'multiline': true,
			'classes': [ 've-ui-mwTransclusionDialog-input' ]
		} )
		.setValue( this.parameter.getValue() )
		.connect( this, { 'change': 'onTextInputChange' } );
	this.inputLabel = new OO.ui.InputLabelWidget( {
		'$': this.$,
		'input': this.textInput,
		'label': this.spec.getParameterDescription( this.parameter.getName() ) || ''
	} );
	this.removeButton = new OO.ui.PushButtonWidget( {
			'$': this.$,
			'label': ve.msg( 'visualeditor-dialog-transclusion-remove-param' ),
			'flags': ['destructive'],
			'classes': [ 've-ui-mwTransclusionDialog-removeButton' ]
		} )
		.connect( this, { 'click': 'onRemoveButtonClick' } );
	this.valueFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': this.spec.getParameterLabel( this.parameter.getName() ),
		'icon': 'parameter',
		'$content': this.inputLabel.$element.add( this.textInput.$element )
	} );

	// TODO: Use spec.required
	// TODO: Use spec.deprecation
	// TODO: Use spec.default
	// TODO: Use spec.type

	// Initialization
	this.$element.append( this.valueFieldset.$element, this.removeButton.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWTemplateParameterPage, OO.ui.PageLayout );

/* Methods */

ve.ui.MWTemplateParameterPage.prototype.onTextInputChange = function () {
	this.parameter.setValue( this.textInput.getValue() );
};

ve.ui.MWTemplateParameterPage.prototype.onRemoveButtonClick = function () {
	this.parameter.remove();
};
