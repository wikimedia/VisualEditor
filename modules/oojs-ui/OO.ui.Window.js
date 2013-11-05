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
	this.frame = new OO.ui.Frame( { '$': this.$ } );
	this.$frame = this.$( '<div>' );
	this.$ = function () {
		throw new Error( 'this.$() cannot be used until the frame has been initialized.' );
	};

	// Initialization
	this.$element
		.addClass( 'oo-ui-window' )
		.append( this.$frame );
	this.$frame
		.addClass( 'oo-ui-window-frame' )
		.append( this.frame.$element );

	// Events
	this.frame.connect( this, { 'initialize': 'initialize' } );
};

/* Inheritance */

OO.inheritClass( OO.ui.Window, OO.ui.Element );

OO.mixinClass( OO.ui.Window, OO.EventEmitter );

/* Events */

/**
 * Initialize contents.
 *
 * Fired asynchronously after construction when iframe is ready.
 *
 * @event initialize
 */

/**
 * Open window.
 *
 * Fired after window has been opened.
 *
 * @event open
 * @param {Object} data Window opening data
 */

/**
 * Close window.
 *
 * Fired after window has been closed.
 *
 * @event close
 * @param {Object} data Window closing data
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
 * Check if window is visible.
 *
 * @method
 * @returns {boolean} Window is visible
 */
OO.ui.Window.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Check if window is opening.
 *
 * @method
 * @returns {boolean} Window is opening
 */
OO.ui.Window.prototype.isOpening = function () {
	return this.opening;
};

/**
 * Check if window is closing.
 *
 * @method
 * @returns {boolean} Window is closing
 */
OO.ui.Window.prototype.isClosing = function () {
	return this.closing;
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
 * @chainable
 */
OO.ui.Window.prototype.setSize = function ( width, height ) {
	if ( !this.frame.$content ) {
		return;
	}

	this.frame.$element.css( {
		'width': width === undefined ? 'auto' : width,
		'height': height === undefined ? 'auto' : height
	} );

	return this;
};

/**
 * Set the title of the window.
 *
 * @param {string} [customTitle] Custom title, override the static.titleMessage
 * @chainable
 */
OO.ui.Window.prototype.setTitle = function ( customTitle ) {
	this.$title.text( customTitle || this.getTitle() );
	return this;
};

/**
 * Set the position of window to fit with contents..
 *
 * @param {string} left Left offset
 * @param {string} top Top offset
 * @chainable
 */
OO.ui.Window.prototype.setPosition = function ( left, top ) {
	this.$element.css( { 'left': left, 'top': top } );
	return this;
};

/**
 * Set the height of window to fit with contents.
 *
 * @param {number} [min=0] Min height
 * @param {number} [max] Max height (defaults to content's outer height)
 * @chainable
 */
OO.ui.Window.prototype.fitHeightToContents = function ( min, max ) {
	var height = this.frame.$content.outerHeight();

	this.frame.$element.css(
		'height', Math.max( min || 0, max === undefined ? height : Math.min( max, height ) )
	);

	return this;
};

/**
 * Set the width of window to fit with contents.
 *
 * @param {number} [min=0] Min height
 * @param {number} [max] Max height (defaults to content's outer width)
 * @chainable
 */
OO.ui.Window.prototype.fitWidthToContents = function ( min, max ) {
	var width = this.frame.$content.outerWidth();

	this.frame.$element.css(
		'width', Math.max( min || 0, max === undefined ? width : Math.min( max, width ) )
	);

	return this;
};

/**
 * Initialize window contents.
 *
 * The first time the window is opened, #initialize is called when it's safe to begin populating
 * its contents. See #setup for a way to make changes each time the window opens.
 *
 * Once this method is called, this.$$ can be used to create elements within the frame.
 *
 * @method
 * @fires initialize
 * @chainable
 */
OO.ui.Window.prototype.initialize = function () {
	// Properties
	this.$ = this.frame.$;
	this.$title = this.$( '<div class="oo-ui-window-title"></div>' );
	if ( this.getTitle() ) {
		this.setTitle();
	}
	this.$icon = this.$( '<div class="oo-ui-window-icon"></div>' )
		.addClass( 'oo-ui-icon-' + this.constructor.static.icon );
	this.$head = this.$( '<div class="oo-ui-window-head"></div>' );
	this.$body = this.$( '<div class="oo-ui-window-body"></div>' );
	this.$foot = this.$( '<div class="oo-ui-window-foot"></div>' );
	this.$overlay = this.$( '<div class="oo-ui-window-overlay"></div>' );

	// Initialization
	this.frame.$content.append(
		this.$head.append( this.$icon, this.$title ),
		this.$body,
		this.$foot,
		this.$overlay
	);

	this.emit( 'initialize' );

	return this;
};

/**
 * Setup window for use.
 *
 * Each time the window is opened, once it's ready to be interacted with, this will set it up for
 * use in a particular context, based on the `data` argument.
 *
 * When you override this method, you must call the parent method at the very beginning.
 *
 * @method
 * @abstract
 * @param {Object} [data] Window opening data
 */
OO.ui.Window.prototype.setup = function () {
	// Override to do something
};

/**
 * Tear down window after use.
 *
 * Each time the window is closed, and it's done being interacted with, this will tear it down and
 * do something with the user's interactions within the window, based on the `data` argument.
 *
 * When you override this method, you must call the parent method at the very end.
 *
 * @method
 * @abstract
 * @param {Object} [data] Window closing data
 */
OO.ui.Window.prototype.teardown = function () {
	// Override to do something
};

/**
 * Open window.
 *
 * Do not override this method. See #setup for a way to make changes each time the window opens.
 *
 * @method
 * @param {Object} [data] Window opening data
 * @fires open
 * @chainable
 */
OO.ui.Window.prototype.open = function ( data ) {
	if ( !this.opening && !this.closing && !this.visible ) {
		this.opening = true;
		this.$element.show();
		this.visible = true;
		this.frame.run( OO.ui.bind( function () {
			this.frame.$element.focus();
			this.emit( 'opening', data );
			this.setup( data );
			this.emit( 'open', data );
			this.opening = false;
		}, this ) );
	}

	return this;
};

/**
 * Close window.
 *
 * See #teardown for a way to do something each time the window closes.
 *
 * @method
 * @param {Object} [data] Window closing data
 * @fires close
 * @chainable
 */
OO.ui.Window.prototype.close = function ( data ) {
	if ( !this.opening && !this.closing && this.visible ) {
		this.frame.$content.find( ':focus' ).blur();
		this.closing = true;
		this.$element.hide();
		this.visible = false;
		this.emit( 'closing', data );
		this.teardown( data );
		this.emit( 'close', data );
		this.closing = false;
	}

	return this;
};
