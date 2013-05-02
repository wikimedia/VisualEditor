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
 * Handle close button click events.
 *
 * @method
 */
ve.ui.Dialog.prototype.onCloseButtonClick = function () {
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
 * Close dialog.
 *
 * This method overrides the parent close method to allow animation, but still provides the same
 * recursion blocking and eventually calls the parent method.
 *
 * @method
 * @param {boolean} action Action that caused the window to be closed
 * @emits close
 */
ve.ui.Dialog.prototype.close = function ( action ) {
	if ( !this.closing ) {
		this.$.addClass( 've-ui-dialog-closing' );
		setTimeout( ve.bind( function () {
			ve.ui.Window.prototype.close.call( this, action );
			this.$.removeClass( 've-ui-dialog-closing' );
		}, this ), 250 );
	}
};

/**
 * Initialize frame contents.
 *
 * @method
 */
ve.ui.Dialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Window.prototype.initialize.call( this );

	this.applyButton = new ve.ui.ButtonWidget( {
		'$$': this.$$, 'label': ve.msg( 'visualeditor-dialog-action-apply' ), 'flags': ['primary']
	} );
	// Properties
	this.closeButton = new ve.ui.IconButtonWidget( {
		'$$': this.$$, 'title': ve.msg( 'visualeditor-dialog-action-close' ), 'icon': 'close'
	} );

	// Events
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );
	this.applyButton.connect( this, { 'click': 'onApplyButtonClick' } );

	// Initialization
	this.closeButton.$.addClass( 've-ui-window-closeButton' );
	this.applyButton.$.addClass( 've-ui-window-applyButton' );
	this.$head.append( this.closeButton.$ );
	this.$foot.append( this.applyButton.$ );
};

/* Initialization */

ve.ui.Dialog.static.addLocalStylesheets( [ 've.ui.Dialog.css' ] );
