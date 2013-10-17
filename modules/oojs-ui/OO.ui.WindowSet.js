/*!
 * ObjectOriented UserInterface WindowSet class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Set of mutually exclusive windows.
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {OO.Factory} factory Window factory
 * @param {Object} [config] Configuration options
 */
OO.ui.WindowSet = function OoUiWindowSet( factory, config ) {
	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.factory = factory;
	this.windows = {};
	this.currentWindow = null;

	// Initialization
	this.$.addClass( 'oo-ui-windowSet' );
};

/* Inheritance */

OO.inheritClass( OO.ui.WindowSet, OO.ui.Element );

OO.mixinClass( OO.ui.WindowSet, OO.EventEmitter );

/* Events */

/**
 * @event setup
 * @param {OO.ui.Window} win Window that's been setup
 */

/**
 * @event open
 * @param {OO.ui.Window} win Window that's been opened
 */

/**
 * @event close
 * @param {OO.ui.Window} win Window that's been closed
 * @param {string} action Action that caused the window to be closed
 */

/* Methods */

/**
 * Handle a window being setup.
 *
 * @method
 * @param {OO.ui.Window} win Window that's been setup
 * @param {Object} [config] Configuration options for window setup
 * @fires setup
 */
OO.ui.WindowSet.prototype.onWindowSetup = function ( win, config ) {
	this.emit( 'setup', win, config );
};

/**
 * Handle a window being opened.
 *
 * @method
 * @param {OO.ui.Window} win Window that's been opened
 * @fires open
 */
OO.ui.WindowSet.prototype.onWindowOpen = function ( win ) {
	this.currentWindow = win;
	this.emit( 'open', win );
};

/**
 * Handle a window being closed.
 *
 * @method
 * @param {OO.ui.Window} win Window that's been opened
 * @param {boolean} accept Changes have been accepted
 * @fires close
 */
OO.ui.WindowSet.prototype.onWindowClose = function ( win, accept ) {
	this.currentWindow = null;
	this.emit( 'close', win, accept );
};

/**
 * Get the current window.
 *
 * @method
 * @returns {OO.ui.Window} Current window
 */
OO.ui.WindowSet.prototype.getCurrent = function () {
	return this.currentWindow;
};

/**
 * Return a given window.
 *
 * @param {string} name Symbolic name of window
 * @return {OO.ui.Window} Window with specified name
 */
OO.ui.WindowSet.prototype.getWindow = function ( name ) {
	var win;

	if ( !this.factory.lookup( name ) ) {
		throw new Error( 'Unknown window: ' + name );
	}
	if ( this.currentWindow ) {
		throw new Error( 'Cannot open another window while another one is active' );
	}
	if ( !( name in this.windows ) ) {
		win = this.windows[name] = this.factory.create( name, this, { '$$': this.$$ } );
		win.connect( this, {
			'setup': ['onWindowSetup', win],
			'open': ['onWindowOpen', win],
			'close': ['onWindowClose', win]
		} );
		this.$.append( win.$ );
		win.getFrame().load();
	}
	return this.windows[name];
};

/**
 * Opens a given window.
 *
 * Any already open dialog will be closed.
 *
 * @param {string} name Symbolic name of window
 * @param {Object} [config] Configuration options for window setup
 * @chainable
 */
OO.ui.WindowSet.prototype.open = function ( name, config ) {
	this.getWindow( name ).open( config );
	return this;
};
