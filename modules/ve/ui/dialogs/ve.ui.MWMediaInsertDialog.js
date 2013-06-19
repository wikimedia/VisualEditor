/*!
 * VisualEditor user interface MediaInsertDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Document dialog.
 *
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWMediaInsertDialog = function VeUiMWMediaInsertDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );

	// Properties
	this.item = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMediaInsertDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWMediaInsertDialog.static.titleMessage = 'visualeditor-dialog-media-insert-title';

ve.ui.MWMediaInsertDialog.static.icon = 'picture';

/* Methods */

ve.ui.MWMediaInsertDialog.prototype.onSelect = function ( item ) {
	this.item = item;
	this.applyButton.setDisabled( item === null );
};

ve.ui.MWMediaInsertDialog.prototype.onClose = function ( action ) {
	var info;

	// Parent method
	ve.ui.Dialog.prototype.onClose.call( this );

	if ( action === 'apply' ) {
		info = this.item.imageinfo[0];
		this.surface.getModel().getFragment().insertContent( [
			{
				'type': 'mwBlockImage',
				'attributes': {
					'align': 'right',
					'href': info.descriptionurl,
					'src': info.thumburl,
					'width': info.thumbwidth,
					'height': info.thumbheight
				}
			},
			{ 'type': '/mwBlockImage' }
		] );
	}
};

ve.ui.MWMediaInsertDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.media = new ve.ui.MWMediaSelectWidget( { '$$': this.frame.$$ } );

	// Events
	this.media.connect( this, { 'select': 'onSelect' } );

	// Initialization
	this.applyButton.setDisabled( true ).setLabel(
		mw.msg( 'visualeditor-dialog-media-insert-button' )
	);
	this.media.$.addClass( 've-ui-mwMediaInsertDialog-select' );
	this.$body.append( this.media.$ );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwMediaInsert', ve.ui.MWMediaInsertDialog );
