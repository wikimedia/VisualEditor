/*!
 * VisualEditor user interface MWTransclusionContentPage class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki transclusion dialog content page.
 *
 * @class
 * @extends OO.ui.PageLayout
 *
 * @constructor
 * @param {ve.dm.MWTransclusionContentModel} content Transclusion content
 * @param {string} name Unique symbolic name of page
 * @param {Object} [config] Configuration options
 */
ve.ui.MWTransclusionContentPage = function VeUiMWTransclusionContent( content, name, config ) {
	// Configuration initialization
	config = ve.extendObject( config, { 'icon': 'source', 'moveable': true, 'level': 0 } );

	// Parent constructor
	OO.ui.PageLayout.call( this, name, config );

	// Properties
	this.content = content;
	this.label = ve.msg( 'visualeditor-dialog-transclusion-content' );
	this.textInput = new OO.ui.TextInputWidget( {
			'$': this.$,
			'multiline': true,
			'classes': [ 've-ui-mwTransclusionDialog-input' ]
		} )
		.setValue( this.content.getValue() )
		.connect( this, { 'change': 'onTextInputChange' } );
	this.removeButton = new OO.ui.PushButtonWidget( {
			'$': this.$,
			'label': ve.msg( 'visualeditor-dialog-transclusion-remove-content' ),
			'flags': [ 'destructive' ],
			'classes': [ 've-ui-mwTransclusionDialog-removeButton' ]
		} )
		.connect( this, { 'click': 'onRemoveButtonClick' } );
	this.valueFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-content' ),
		'icon': 'source',
		'$content': this.textInput.$element
	} );

	// Initialization
	this.$element.append( this.valueFieldset.$element, this.removeButton.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWTransclusionContentPage, OO.ui.PageLayout );

/* Methods */


ve.ui.MWTransclusionContentPage.prototype.onTextInputChange = function () {
	this.content.setValue( this.textInput.getValue() );
};

ve.ui.MWTransclusionContentPage.prototype.onRemoveButtonClick = function () {
	this.content.remove();
};
