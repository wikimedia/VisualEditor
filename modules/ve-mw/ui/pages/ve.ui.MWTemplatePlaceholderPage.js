/*!
 * VisualEditor user interface MWTemplatePlaceholderPage class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki transclusion dialog placeholder page.
 *
 * @class
 * @extends OO.ui.PageLayout
 *
 * @constructor
 * @param {ve.dm.MWTemplatePlaceholderModel} placeholder Template placeholder
 * @param {string} name Unique symbolic name of page
 * @param {Object} [config] Configuration options
 */
ve.ui.MWTemplatePlaceholderPage = function VeUiMWTemplatePlaceholder( placeholder, name, config ) {
	// Configuration initialization
	config = ve.extendObject( config, { 'icon': 'template', 'moveable': true, 'level': 0 } );

	// Parent constructor
	OO.ui.PageLayout.call( this, name, config );

	// Properties
	this.placeholder = placeholder;
	this.label = this.$( '<span>' )
			.addClass( 've-ui-mwTransclusionDialog-placeholder-label' )
			.text( ve.msg( 'visualeditor-dialog-transclusion-placeholder' ) );
	this.addTemplateInput = new ve.ui.MWTitleInputWidget( {
			'$': this.$, '$overlay': this.$overlay, 'namespace': 10
		} )
		.connect( this, {
			'change': 'onTemplateInputChange',
			'enter': 'onAddTemplate'
		} );
	this.addTemplateButton = new OO.ui.PushButtonWidget( {
			'$': this.$,
			'label': ve.msg( 'visualeditor-dialog-transclusion-add-template' ),
			'flags': ['constructive'],
			'disabled': true
		} )
		.connect( this, { 'click': 'onAddTemplate' } );
	this.removeButton = new OO.ui.PushButtonWidget( {
			'$': this.$,
			'label': ve.msg( 'visualeditor-dialog-transclusion-remove-template' ),
			'flags': ['destructive'],
			'classes': [ 've-ui-mwTransclusionDialog-removeButton' ]
		} )
		.connect( this, { 'click': 'onRemoveButtonClick' } );
	this.addTemplateFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-placeholder' ),
		'icon': 'template',
		'classes': [ 've-ui-mwTransclusionDialog-addTemplateFieldset' ],
		'$content': this.addTemplateInput.$element.add( this.addTemplateButton.$element )
	} );

	// Initialization
	this.$element.append( this.addTemplateFieldset.$element, this.removeButton.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWTemplatePlaceholderPage, OO.ui.PageLayout );

/* Methods */

ve.ui.MWTemplatePlaceholderPage.prototype.onAddTemplate = function () {
	var transclusion = this.placeholder.getTransclusion(),
		parts = this.placeholder.getTransclusion().getParts(),
		part = ve.dm.MWTemplateModel.newFromName( transclusion, this.addTemplateInput.getValue() );

	transclusion.replacePart( this.placeholder, part, ve.indexOf( this.placeholder, parts ) );
	this.addTemplateInput.pushPending();
	this.addTemplateButton.setDisabled( true );
	this.removeButton.setDisabled( true );
};

ve.ui.MWTemplatePlaceholderPage.prototype.onTemplateInputChange = function ( value ) {
	this.addTemplateButton.setDisabled( value === '' );
};

ve.ui.MWTemplatePlaceholderPage.prototype.onRemoveButtonClick = function () {
	this.placeholder.remove();
};
