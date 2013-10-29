/*!
 * ObjectOriented UserInterface Window class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Container for elements in a child frame.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {OO.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 * @fires initialize
 */
OO.ui.Window = function OoUiWindow( windowSet, config ) {
	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.windowSet = windowSet;
	this.visible = false;
	this.opening = false;
	this.closing = false;
	this.frame = null;
	this.$frame = this.$$( '<div>' );

	// Initialization
	this.$
		.addClass( 'oo-ui-window' )
		.append( this.$frame );
	this.frame = new OO.ui.Frame();
	this.$frame
		.addClass( 'oo-ui-window-frame' )
		.append( this.frame.$ );

	// Events
	this.frame.connect( this, { 'initialize': 'onFrameInitialize' } );
};

/* Inheritance */

OO.inheritClass( OO.ui.Window, OO.ui.Element );

OO.mixinClass( OO.ui.Window, OO.EventEmitter );

/* Events */

/**
 * @event initialize
 */

/**
 * @event setup
 * @param {Object} config Configuration options for window setup
 */

/**
 * @event open
 */

/**
 * @event close
 * @param {string} action Action that caused the window to be closed
 */

/* Static Properties */

/**
 * Symbolic name of icon.
 *
 * @static
 * @inheritable
 * @property {string}
 */
OO.ui.Window.static.icon = 'window';

/**
 * Localized message for title.
 *
 * @static
 * @inheritable
 * @property {string}
 */
OO.ui.Window.static.titleMessage = null;

/* Methods */

/**
 * Handle frame initialize event.
 *
 * @method
 */
OO.ui.Window.prototype.onFrameInitialize = function () {
	this.initialize();
	this.emit( 'initialize' );
};

/**
 * Handle the window being initialized.
 *
 * @method
 */
OO.ui.Window.prototype.initialize = function () {
	// Properties
	this.$title = this.$$( '<div class="oo-ui-window-title"></div>' );
	if ( this.getTitle() ) {
		this.setTitle();
	}
	this.$icon = this.$$( '<div class="oo-ui-window-icon"></div>' )
		.addClass( 'oo-ui-icon-' + this.constructor.static.icon );
	this.$head = this.$$( '<div class="oo-ui-window-head"></div>' );
	this.$body = this.$$( '<div class="oo-ui-window-body"></div>' );
	this.$foot = this.$$( '<div class="oo-ui-window-foot"></div>' );
	this.$overlay = this.$$( '<div class="oo-ui-window-overlay"></div>' );

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
 * @param {Object} [config] Configuration options for window setup
 */
OO.ui.Window.prototype.onSetup = function () {
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
OO.ui.Window.prototype.onOpen = function () {
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
OO.ui.Window.prototype.onClose = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Check if window is visible.
 *
 * @method
 * @returns {boolean} Window is visible
 */
OO.ui.Window.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Get the window frame.
 *
 * @method
 * @returns {OO.ui.Frame} Frame of window
 */
OO.ui.Window.prototype.getFrame = function () {
	return this.frame;
};

/**
 * Get the window set.
 *
 * @method
 * @returns {OO.ui.WindowSet} Window set
 */
OO.ui.Window.prototype.getWindowSet = function () {
	return this.windowSet;
};

/**
 * Get the title of the window.
 *
 * Use .static.titleMessage to set this unless you need to do something fancy.
 * @returns {string} Window title
 */
OO.ui.Window.prototype.getTitle = function () {
	return OO.ui.msg( this.constructor.static.titleMessage );
};

/**
 * Set the size of window frame.
 *
 * @param {number} [width=auto] Custom width
 * @param {number} [height=auto] Custom height
 */
OO.ui.Window.prototype.setSize = function ( width, height ) {
	if ( !this.frame.$content ) {
		return;
	}

	this.frame.$.css( {
		'width': width === undefined ? 'auto' : width,
		'height': height === undefined ? 'auto' : height
	} );
};

/**
 * Set the title of the window.
 *
 * @param {string} [customTitle] Custom title, override the static.titleMessage
 */
OO.ui.Window.prototype.setTitle = function ( customTitle ) {
	this.$title.text( customTitle || this.getTitle() );
};

/**
 * Set the height of window to fit with contents.
 *
 * @param {number} [min=0] Min height
 * @param {number} [max] Max height (defaults to content's outer height)
 */
OO.ui.Window.prototype.fitHeightToContents = function ( min, max ) {
	var height = this.frame.$content.outerHeight();

	this.frame.$.css(
		'height', Math.max( min || 0, max === undefined ? height : Math.min( max, height ) )
	);
};

/**
 * Set the width of window to fit with contents.
 *
 * @param {number} [min=0] Min height
 * @param {number} [max] Max height (defaults to content's outer width)
 */
OO.ui.Window.prototype.fitWidthToContents = function ( min, max ) {
	var width = this.frame.$content.outerWidth();

	this.frame.$.css(
		'width', Math.max( min || 0, max === undefined ? width : Math.min( max, width ) )
	);
};

/**
 * Set the position of window to fit with contents..
 *
 * @param {string} left Left offset
 * @param {string} top Top offset
 */
OO.ui.Window.prototype.setPosition = function ( left, top ) {
	this.$.css( { 'left': left, 'top': top } );
};

/**
 * Open window.
 *
 * @method
 * @param {Object} [config] Configuration options for window setup
 * @fires setup
 * @fires open
 */
OO.ui.Window.prototype.open = function ( config ) {
	if ( !this.opening ) {
		this.opening = true;
		this.onSetup( config );
		this.emit( 'setup', config );
		this.$.show();
		this.visible = true;
		this.frame.$.focus();
		this.frame.run( OO.ui.bind( function () {
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
 * @fires close
 */
OO.ui.Window.prototype.close = function ( action ) {
	if ( !this.closing ) {
		this.closing = true;
		this.$.hide();
		this.visible = false;
		this.onClose( action );
		this.frame.$content.find( ':focus' ).blur();
		this.emit( 'close', action );
		// This is at the bottom in case handlers of the close event try to close the window again
		this.closing = false;
	}
};
