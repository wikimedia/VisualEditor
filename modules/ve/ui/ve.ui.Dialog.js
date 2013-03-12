/*!
 * VisualEditor UserInterface Dialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface dialog.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.Dialog = function VeUiDialog( surface ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	var dialog = this;
	// Properties
	this.surface = surface;
	this.visible = false;
	this.$ = $( '<div class="ve-ui-dialog"></div>' );

	// Initialization
	this.cancelButton = new ve.ui.ButtonWidget( { 'label': ve.msg( 'cancel' ) } );

	//this.cancelButton.on( 'click', ve.bind( this.surface.target.closeDialog, this ) );
	this.cancelButton.on( 'click', function() { dialog.surface.target.closeDialog(); } );

	this.applyButton = new ve.ui.ButtonWidget( {
		'label': ve.msg( 'visualeditor-dialog-label-apply' ),
		'flags': ['constructive'],
		'disabled': false
	} );

	// Base elements
	this.$title = $( '<div class="ve-ui-dialog-title"></div>' ).text(
		ve.msg( this.constructor.static.dialogTitleMessage )
	);
	this.$actions = $( '<div class="ve-ui-dialog-actions"><div>' ).append(
		this.cancelButton.$, this.applyButton.$
	);
	this.$.append( this.$title, this.$actions, $( '<div class="ve-ui-dialog-container"></div>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ui.Dialog, ve.EventEmitter );

/* Methods */

ve.ui.Dialog.prototype.isVisible = function () {
	return this.visible;
};

ve.ui.Dialog.prototype.open = function () {
	this.emit( 'open' );
	this.$.show();
	this.visible = true;
};

ve.ui.Dialog.prototype.close = function () {
	this.emit( 'close' );
	this.$.hide();
	this.visible = false;
};
