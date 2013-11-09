/*!
 * ObjectOriented UserInterface Dialog class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Modal dialog box.
 *
 * @class
 * @abstract
 * @extends OO.ui.Window
 *
 * @constructor
 * @param {OO.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [footless] Hide foot
 * @cfg {boolean} [small] Make the dialog small
 */
OO.ui.Dialog = function OoUiDialog( windowSet, config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Window.call( this, windowSet, config );

	// Properties
	this.visible = false;
	this.footless = !!config.footless;
	this.small = !!config.small;
	this.onWindowMouseWheelHandler = OO.ui.bind( this.onWindowMouseWheel, this );
	this.onDocumentKeyDownHandler = OO.ui.bind( this.onDocumentKeyDown, this );

	// Events
	this.$element.on( 'mousedown', false );

	// Initialization
	this.$element.addClass( 'oo-ui-dialog' );
};

/* Inheritance */

OO.inheritClass( OO.ui.Dialog, OO.ui.Window );

/* Static Properties */

/**
 * Symbolic name of dialog.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Dialog.static.name = '';

/* Methods */

/**
 * Handle close button click events.
 *
 * @method
 */
OO.ui.Dialog.prototype.onCloseButtonClick = function () {
	this.close( { 'action': 'cancel' } );
};

/**
 * Handle window mouse wheel events.
 *
 * @method
 * @param {jQuery.Event} e Mouse wheel event
 */
OO.ui.Dialog.prototype.onWindowMouseWheel = function () {
	return false;
};

/**
 * Handle document key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.Dialog.prototype.onDocumentKeyDown = function ( e ) {
	switch ( e.which ) {
		case OO.ui.Keys.PAGEUP:
		case OO.ui.Keys.PAGEDOWN:
		case OO.ui.Keys.END:
		case OO.ui.Keys.HOME:
		case OO.ui.Keys.LEFT:
		case OO.ui.Keys.UP:
		case OO.ui.Keys.RIGHT:
		case OO.ui.Keys.DOWN:
			// Prevent any key events that might cause scrolling
			return false;
	}
};

/**
 * Handle frame document key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.Dialog.prototype.onFrameDocumentKeyDown = function ( e ) {
	if ( e.which === OO.ui.Keys.ESCAPE ) {
		this.close( { 'action': 'cancel' } );
		return false;
	}
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.initialize = function () {
	// Parent method
	OO.ui.Window.prototype.initialize.call( this );

	// Properties
	this.closeButton = new OO.ui.IconButtonWidget( {
		'$': this.$, 'title': OO.ui.msg( 'ooui-dialog-action-close' ), 'icon': 'close'
	} );

	// Events
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );
	this.frame.$document.on( 'keydown', OO.ui.bind( this.onFrameDocumentKeyDown, this ) );

	// Initialization
	this.frame.$content.addClass( 'oo-ui-dialog-content' );
	if ( this.footless ) {
		this.frame.$content.addClass( 'oo-ui-dialog-content-footless' );
	}
	if ( this.small ) {
		this.$frame.addClass( 'oo-ui-window-frame-small' );
	}
	this.closeButton.$element.addClass( 'oo-ui-window-closeButton' );
	this.$head.append( this.closeButton.$element );
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.setup = function ( data ) {
	// Parent method
	OO.ui.Window.prototype.setup.call( this, data );

	// Prevent scrolling in top-level window
	this.$( window ).on( 'mousewheel', this.onWindowMouseWheelHandler );
	this.$( document ).on( 'keydown', this.onDocumentKeyDownHandler );
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.teardown = function ( data ) {
	// Parent method
	OO.ui.Window.prototype.teardown.call( this, data );

	// Allow scrolling in top-level window
	this.$( window ).off( 'mousewheel', this.onWindowMouseWheelHandler );
	this.$( document ).off( 'keydown', this.onDocumentKeyDownHandler );
};

/**
 * @inheritdoc
 */
OO.ui.Dialog.prototype.close = function ( data ) {
	if ( !this.opening && !this.closing && this.visible ) {
		// Trigger transition
		this.$element.addClass( 'oo-ui-dialog-closing' );
		// Allow transition to complete before actually closing
		setTimeout( OO.ui.bind( function () {
			this.$element.removeClass( 'oo-ui-dialog-closing' );
			// Parent method
			OO.ui.Window.prototype.close.call( this, data );
		}, this ), 250 );
	}
};
