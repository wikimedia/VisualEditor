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
 * @extends ve.ui.Window
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.Dialog = function VeUiDialog( surface ) {
	// Parent constructor
	ve.ui.Window.call( this, surface );

	// Properties
	this.visible = false;

	// Initialization
	this.$.addClass( 've-ui-dialog' );
	this.$.on( 'mousedown', ve.bind( this.onMouseDown, this ) );
};

/* Inheritance */

ve.inheritClass( ve.ui.Dialog, ve.ui.Window );

/* Methods */

/**
 * Handle mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.Dialog.prototype.onMouseDown = function () {
	return false;
};

/**
 * Handle cancel button click events.
 *
 * @method
 */
ve.ui.Dialog.prototype.onCancelButtonClick = function () {
	this.close( 'cancel' );
};

/**
 * Handle apply button click events.
 *
 * @method
 */
ve.ui.Dialog.prototype.onApplyButtonClick = function () {
	this.close( 'apply' );
};

/**
 * Initialize frame contents.
 *
 * @method
 */
ve.ui.Dialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Window.prototype.initialize.call( this );

	// Properties
	this.cancelButton = new ve.ui.ButtonWidget( {
		'$$': this.$$, 'label': ve.msg( 'visualeditor-dialog-action-cancel' )
	} );
	this.applyButton = new ve.ui.ButtonWidget( {
		'$$': this.$$, 'label': ve.msg( 'visualeditor-dialog-action-apply' ), 'flags': ['primary']
	} );

	// Events
	this.cancelButton.on( 'click', ve.bind( this.onCancelButtonClick, this ) );
	this.applyButton.on( 'click', ve.bind( this.onApplyButtonClick, this ) );

	// Initialization
	this.$head.append( this.applyButton.$, this.cancelButton.$ );
};

/* Initialization */

ve.ui.Dialog.static.addLocalStylesheets( [ 've.ui.Dialog.css' ] );
