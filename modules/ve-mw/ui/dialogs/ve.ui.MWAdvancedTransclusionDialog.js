/*
 * VisualEditor user interface MWAdvancedTransclusionDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog for inserting and editing MediaWiki transclusions.
 *
 * @class
 * @extends ve.ui.MWTransclusionDialog
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.MWAdvancedTransclusionDialog = function VeUiMWAdvancedTransclusionDialog( windowSet, config ) {
	// Parent constructor
	ve.ui.MWTransclusionDialog.call( this, windowSet, config );

	// Properties
	this.node = null;
	this.transclusion = null;
	this.loaded = false;
};

/* Inheritance */

OO.inheritClass( ve.ui.MWAdvancedTransclusionDialog, ve.ui.MWTransclusionDialog );

/* Static Properties */

ve.ui.MWAdvancedTransclusionDialog.static.name = 'transclusion';

ve.ui.MWAdvancedTransclusionDialog.static.titleMessage = 'visualeditor-dialog-transclusion-title';

ve.ui.MWAdvancedTransclusionDialog.static.icon = 'template';

/* Methods */

/**
 * Handle outline controls move events.
 *
 * @param {number} places Number of places to move the selected item
 */
ve.ui.MWAdvancedTransclusionDialog.prototype.onOutlineControlsMove = function ( places ) {
	var part, index, name, promise,
		parts = this.transclusion.getParts(),
		item = this.bookletLayout.getOutline().getSelectedItem();

	if ( item ) {
		name = item.getData();
		part = this.transclusion.getPartFromId( name );
		index = ve.indexOf( part, parts );
		// Auto-removes part from old location
		promise = this.transclusion.addPart( part, index + places );
		if ( this.loaded ) {
			promise.done( ve.bind( this.setPageByName, this, part.getId() ) );
		}
	}
};

/**
 * Handle outline controls add events.
 *
 * @param {string} type Type of item to add
 */
ve.ui.MWAdvancedTransclusionDialog.prototype.onOutlineControlsAdd = function ( type ) {
	var part, parts, item, index, promise;

	if ( type === 'content' ) {
		part = new ve.dm.MWTransclusionContentModel( this.transclusion, '', 'user' );
	} else if ( type === 'template' ) {
		part = new ve.dm.MWTemplatePlaceholderModel( this.transclusion, 'user' );
	}
	if ( part ) {
		parts = this.transclusion.getParts();
		item = this.bookletLayout.getOutline().getSelectedItem();
		index = item ?
			ve.indexOf( this.transclusion.getPartFromId( item.getData() ), parts ) + 1 :
			parts.length;
		promise = this.transclusion.addPart( part, index );
		if ( this.loaded ) {
			promise.done( ve.bind( this.setPageByName, this, part.getId() ) );
		}
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWAdvancedTransclusionDialog.prototype.getBookletLayout = function () {
	return new OO.ui.BookletLayout( {
		'$': this.$,
		'continuous': true,
		'autoFocus': true,
		'outlined': true,
		'editable': true,
		'adders': [
			{
				'name': 'template',
				'icon': 'template',
				'title': ve.msg( 'visualeditor-dialog-transclusion-add-template' )
			},
			{
				'name': 'content',
				'icon': 'source',
				'title': ve.msg( 'visualeditor-dialog-transclusion-add-content' )
			}
		]
	} );
};

/**
 * @inheritdoc
 */
ve.ui.MWAdvancedTransclusionDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.MWTransclusionDialog.prototype.initialize.call( this );

	// Events
	this.bookletLayout.getOutlineControls().connect( this, {
		'move': 'onOutlineControlsMove',
		'add': 'onOutlineControlsAdd'
	} );
};

/* Registration */

ve.ui.dialogFactory.register( ve.ui.MWAdvancedTransclusionDialog );
