/*!
 * VisualEditor UserInterface Window class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface window.
 *
 * @class
 * @abstract
 * @extends ve.EventEmitter
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.Window = function VeUiWindow( surface ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.surface = surface;
	this.visible = false;
	this.opening = false;
	this.closing = false;
	this.frame = null;
	this.$ = $( '<div>' );
	this.$frame = $( '<div>' );

	// Initialization
	this.$
		.addClass( 've-ui-window' )
		.append( this.$frame );
	this.frame = new ve.ui.Frame( { 'stylesheets': this.constructor.static.stylesheets } );
	this.$frame
		.addClass( 've-ui-window-frame' )
		.append( this.frame.$ );

	// Events
	this.frame.on( 'initialize', ve.bind( function () {
		this.initialize();
		this.emit( 'initialize' );
	}, this ) );
};

/* Inheritance */

ve.inheritClass( ve.ui.Window, ve.EventEmitter );

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
ve.ui.Window.static = {};

/**
 * Options for frame.
 *
 * @see ve.ui.Frame
 *
 * @static
 * @property
 * @type {Object}
 */
ve.ui.Window.static.stylesheets = [
	've.ui.Frame.css',
	've.ui.Window.css',
	've.ui.Widget.css',
	( window.devicePixelRatio > 1 ? 've.ui.Icons-vector.css' : 've.ui.Icons-raster.css' )
];

/**
 * Symbolic name of icon.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.Window.static.icon = 'window';

/**
 * Localized message for title.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.Window.static.titleMessage = null;

/* Events */

/**
 * @event setup
 */

/**
 * @event open
 */

/**
 * @event close
 * @param {Boolean} accept Changes have been accepted
 */

/* Static Properties */

/**
 * Symbolic name of icon.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.Window.static.icon = 'window';

/**
 * Localized message for title.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.Window.static.titleMessage = null;

/* Methods */

/**
 * Handle the window being initialized.
 *
 * @method
 */
ve.ui.Window.prototype.initialize = function () {
	// Properties
	this.$$ = this.frame.$$;
	this.$title = this.$$( '<div class="ve-ui-window-title"></div>' );
	if ( this.constructor.static.titleMessage ) {
		this.$title.text( ve.msg( this.constructor.static.titleMessage ) );
	}
	this.$icon = this.$$( '<div class="ve-ui-window-icon"></div>' )
		.addClass( 've-ui-icon-' + this.constructor.static.icon );
	this.$head = this.$$( '<div class="ve-ui-window-head"></div>' );
	this.$body = this.$$( '<div class="ve-ui-window-body"></div>' );

	// Initialization
	this.frame.$content.append(
		this.$head.append( this.$icon, this.$title ),
		this.$body
	);
};

/**
 * Handle the window being opened.
 *
 * Any changes to the document in that need to be done prior to opening should be made here.
 *
 * To be notified after this method is called, listen to the `setup` event.
 *
 * @method
 */
ve.ui.Window.prototype.onSetup = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Handle the window being opened.
 *
 * Any changes to the window that need to be done prior to opening should be made here.
 *
 * To be notified after this method is called, listen to the `open` event.
 *
 * @method
 */
ve.ui.Window.prototype.onOpen = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Handle the window being closed.
 *
 * Any changes to the document that need to be done prior to closing should be made here.
 *
 * To be notified after this method is called, listen to the `close` event.
 *
 * @method
 * @param {boolean} accept Changes have been accepted
 */
ve.ui.Window.prototype.onClose = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Check if window is visible.
 *
 * @method
 * @returns {Boolean} Window is visible
 */
ve.ui.Window.prototype.isVisible = function () {
	return this.visible;
};

/**
 *
 */
ve.ui.Window.prototype.setSize = function ( width, height ) {
	if ( !this.frame.$content ) {
		return;
	}

	this.frame.$.css( {
		'width': width === undefined ? 'auto' : width,
		'height': height === undefined ? 'auto' : height
	} );
};

/**
 *
 */
ve.ui.Window.prototype.fitHeightToContents = function ( min, max ) {
	var height = this.frame.$content.outerHeight();

	this.frame.$.css(
		'height', Math.max( min || 0, max === undefined ? height : Math.min( max, height ) )
	);
};

/**
 *
 */
ve.ui.Window.prototype.fitWidthToContents = function ( min, max ) {
	var width = this.frame.$content.outerWidth();

	this.frame.$.css(
		'width', Math.max( min || 0, max === undefined ? width : Math.min( max, width ) )
	);
};

/**
 *
 */
ve.ui.Window.prototype.setPosition = function ( left, top ) {
	this.$.css( { 'left': left, 'top': top } );
};

/**
 * Open window.
 *
 * @method
 * @emits setup
 * @emits open
 */
ve.ui.Window.prototype.open = function () {
	if ( !this.opening ) {
		this.opening = true;
		this.onSetup();
		this.emit( 'setup' );
		this.$.show();
		this.visible = true;
		this.frame.run( ve.bind( function () {
			this.onOpen();
			this.opening = false;
			this.emit( 'open' );
		}, this ) );
	}
};

/**
 * Close window.
 *
 * This method guards against recursive calling internally. This protects against changes made while
 * closing the window which themselves would cause the window to be closed from causing an infinate
 * loop.
 *
 * @method
 * @emits close
 */
ve.ui.Window.prototype.close = function ( remove ) {
	if ( !this.closing ) {
		this.closing = true;
		this.$.hide();
		this.visible = false;
		this.onClose( remove );
		this.closing = false;
		this.surface.getView().getDocument().getDocumentNode().$.focus();
		this.emit( 'close', remove );
	}
};
