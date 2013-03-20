/*!
 * VisualEditor UserInterface WindowSet class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface window set.
 *
 * @class
 * @extends ve.EventEmitter
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.WindowSet = function VeUiWindowSet( surface, factory ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.surface = surface;
	this.factory = factory;
	this.$ = $( '<div>' );
	this.windows = {};
	this.currentWindow = null;

	// Initialization
	this.$.addClass( 've-ui-windowSet' );
};

/* Inheritance */

ve.inheritClass( ve.ui.WindowSet, ve.EventEmitter );

/* Events */

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
 * @param {boolean} accept Changes have been accepted
 */

/* Methods */

/**
 * Handle a window being setup.
 *
 * @method
 * @param {ve.ui.Window} win Window that's been setup
 * @emits setup
 */
ve.ui.WindowSet.prototype.onWindowSetup = function ( win ) {
	this.emit( 'setup', win );
};

/**
 * Handle a window being opened.
 *
 * @method
 * @param {ve.ui.Window} win Window that's been opened
 * @emits open
 */
ve.ui.WindowSet.prototype.onWindowOpen = function ( win ) {
	this.currentWindow = win;
	this.emit( 'open', win );
};

/**
 * Handle a window being closed.
 *
 * @method
 * @param {ve.ui.Window} win Window that's been opened
 * @param {boolean} accept Changes have been accepted
 * @emits close
 */
ve.ui.WindowSet.prototype.onWindowClose = function ( win, accept ) {
	this.currentWindow = null;
	this.emit( 'close', win, accept );
};

/**
 * Get the current window.
 *
 * @method
 * @returns {ve.ui.Window} Current window
 */
ve.ui.WindowSet.prototype.getCurrent = function () {
	return this.currentWindow;
};

/**
 * Opens a given window.
 *
 * @method
 * @param {string} name Symbolic name of window
 * @chainable
 */
ve.ui.WindowSet.prototype.open = function ( name ) {
	var win;

	if ( !this.factory.lookup( name ) ) {
		throw new Error( 'Unknown window: ' + name );
	}
	if ( !( name in this.windows ) ) {
		win = this.windows[name] = this.factory.create( name, this.surface );
		win.on( 'setup', ve.bind( this.onWindowSetup, this, win ) );
		win.on( 'open', ve.bind( this.onWindowOpen, this, win ) );
		win.on( 'close', ve.bind( this.onWindowClose, this, win ) );
		this.$.append( win.$ );
	}
	this.close();
	this.windows[name].open();

	return this;
};

/**
 * Closes currently open window.
 *
 * @method
 * @param {boolean} accept Changes have been accepted
 * @chainable
 */
ve.ui.WindowSet.prototype.close = function ( accept ) {
	if ( this.currentWindow ) {
		this.currentWindow.close( accept );
	}
	return this;
};
