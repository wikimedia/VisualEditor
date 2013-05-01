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
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {ve.Surface} surface
 * @emits initialize
 */
ve.ui.Window = function VeUiWindow( surface ) {
	// Mixin constructors
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
	this.frame.connect( this, { 'initialize': 'onFrameInitialize' } );

	this.$.load( ve.bind( function () {
		this.frame.initialize();
	}, this ) );
};

/* Inheritance */

ve.mixinClass( ve.ui.Window, ve.EventEmitter );

/* Events */

/**
 * @event initialize
 */

/**
 * @event setup
 * @param {ve.ui.Window} win Window that's been setup
 */

/**
 * @event open
 * @param {ve.ui.Window} win Window that's been opened
 */

/**
 * @event close
 * @param {ve.ui.Window} win Window that's been closed
 * @param {string} action Action that caused the window to be closed
 */

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
ve.ui.Window.static = {};

ve.ui.Window.static.stylesheets = [];

/**
 * Symbolic name of icon.
 *
 * @static
 * @property {string}
 */
ve.ui.Window.static.icon = 'window';

/**
 * Localized message for title.
 *
 * @static
 * @property {string}
 */
ve.ui.Window.static.titleMessage = null;

/* Static Methods */

/**
 * Add a stylesheet to be loaded into the window's frame.
 *
 * @method
 * @param {string[]} paths List of absolute stylesheet paths
 */
ve.ui.Window.static.addStylesheetFiles = function ( paths ) {
	if ( !this.hasOwnProperty( 'stylesheets' ) ) {
		this.stylesheets = this.stylesheets.slice( 0 );
	}
	this.stylesheets.push.apply( this.stylesheets, paths );
};

/**
 * Add a stylesheet from the /ve/ui/styles directory.
 *
 * @method
 * @param {string[]} files Names of stylesheet files
 */
ve.ui.Window.static.addLocalStylesheets = function ( files ) {
	var i, len,
		base = ve.init.platform.getModulesUrl() + '/ve/ui/styles/',
		paths = [];

	// Prepend base path to each file name
	for ( i = 0, len = files.length; i < len; i++ ) {
		paths[i] = base + files[i];
	}

	this.addStylesheetFiles( paths );
};

/* Methods */

/**
 * Handle frame initialize event.
 *
 * @method
 */
ve.ui.Window.prototype.onFrameInitialize = function () {
	this.initialize();
	this.emit( 'initialize' );
};

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
	this.$foot = this.$$( '<div class="ve-ui-window-foot"></div>' );
	this.$overlay = this.$$( '<div class="ve-ui-window-overlay"></div>' );

	// Initialization
	this.frame.$content.append(
		this.$head.append( this.$icon, this.$title ),
		this.$body,
		this.$foot,
		this.$overlay
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
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.Window.prototype.onClose = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Check if window is visible.
 *
 * @method
 * @returns {boolean} Window is visible
 */
ve.ui.Window.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Get the window frame.
 *
 * @method
 * @returns {ve.ui.Frame} Frame of window
 */
ve.ui.Window.prototype.getFrame = function () {
	return this.frame;
};

/**
 *
 * @method
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
 * @method
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
 * @method
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
 * @param {string} action Action that caused the window to be closed
 * @emits close
 */
ve.ui.Window.prototype.close = function ( action ) {
	if ( !this.closing ) {
		this.closing = true;
		this.$.hide();
		this.visible = false;
		this.onClose( action );
		this.closing = false;
		this.frame.$content.find( ':focus' ).blur();
		this.surface.getView().getDocument().getDocumentNode().$.focus();
		this.emit( 'close', action );
	}
};

/* Initialization */

ve.ui.Window.static.addLocalStylesheets( [
	've.ui.Frame.css',
	've.ui.Window.css',
	've.ui.Element.css',
	've.ui.Layout.css',
	've.ui.Widget.css',
	( window.devicePixelRatio > 1 ? 've.ui.Icons-vector.css' : 've.ui.Icons-raster.css' )
] );
