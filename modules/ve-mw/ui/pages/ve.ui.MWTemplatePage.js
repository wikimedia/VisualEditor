/*!
 * VisualEditor user interface MWTemplatePage class.
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
 * @param {ve.dm.MWTemplateModel} parameter Template
 * @param {string} name Unique symbolic name of page
 * @param {Object} [config] Configuration options
 */
ve.ui.MWTemplatePage = function VeUiMWTemplatePage( template, name, config ) {
	// Configuration initialization
	config = ve.extendObject( config, { 'icon': 'template', 'moveable': true, 'level': 0 } );

	// Parent constructor
	OO.ui.PageLayout.call( this, name, config );

	// Properties
	this.template = template;
	this.spec = this.template.getSpec();
	this.label = this.spec.getLabel();
	this.addParameterSearch = new ve.ui.MWParameterSearchWidget( this.template, { '$': this.$ } )
		.connect( this, { 'select': 'onParameterSelect' } );
	this.removeButton = new OO.ui.PushButtonWidget( {
			'$': this.$,
			'label': ve.msg( 'visualeditor-dialog-transclusion-remove-template' ),
			'flags': ['destructive'],
			'classes': [ 've-ui-mwTransclusionDialog-removeButton' ]
		} )
		.connect( this, { 'click': 'onRemoveButtonClick' } );
	this.infoFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': this.spec.getLabel(),
		'icon': 'template',
		'$content': this.$( '<div>' ).text( this.template.getSpec().getDescription() || '' )
	} );
	this.addParameterFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-add-param' ),
		'icon': 'parameter',
		'classes': [ 've-ui-mwTransclusionDialog-addParameterFieldset' ],
		'$content': this.addParameterSearch.$element
	} );

	// Initialization
	this.$element.append(
		this.infoFieldset.$element,
		this.addParameterFieldset.$element,
		this.removeButton.$element
	);
};

/* Inheritance */

OO.inheritClass( ve.ui.MWTemplatePage, OO.ui.PageLayout );

/* Methods */

ve.ui.MWTemplatePage.prototype.onParameterSelect = function ( name ) {
	var param;

	if ( name ) {
		param = new ve.dm.MWTemplateParameterModel( this.template, name );
		this.template.addParameter( param );
		this.addParameterSearch.query.setValue();
	}
};

ve.ui.MWTemplatePage.prototype.onRemoveButtonClick = function () {
	this.template.remove();
};
