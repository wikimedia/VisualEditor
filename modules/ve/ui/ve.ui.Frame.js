/*!
 * VisualEditor UserInterface Frame class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface iframe abstraction.
 *
 * @class
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {string[]} [stylesheets] List of stylesheet file names, each relative to ve/ui/styles
 */
ve.ui.Frame = function VeUiFrame( config ) {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.initialized = false;
	this.config = config;
	this.$ = $( '<iframe>' );

	// Events
	this.$.load( ve.bind( this.onLoad, this ) );

	// Initialize
	this.$
		.addClass( 've-ui-frame' )
		.attr( { 'frameborder': 0, 'scrolling': 'no' } );
};

/* Inheritance */

ve.mixinClass( ve.ui.Frame, ve.EventEmitter );

/* Events */

/**
 * @event initialize
 */

/* Methods */

/**
 * Handle frame load events.
 *
 * Once the iframe's stylesheets are loaded, the `initialize` event will be emitted.
 *
 * Sounds simple right? Read on...
 *
 * When you create a dynamic iframe using open/write/close, the window.load event for the
 * iframe is triggered when you call close, and there's no further load event to indicate that
 * everything is actually loaded.
 *
 * By dynamically adding stylesheet links, we can detect when each link is loaded by testing if we
 * have access to each of their `sheet.cssRules` properties. Every 10ms we poll to see if we have
 * access to the style's `sheet.cssRules` property yet.
 *
 * However, because of security issues, we never have such access if the stylesheet came from a
 * different site. Thus, we are left with linking to the stylesheets through a style element with
 * multiple `@import` statements - which ends up being simpler anyway. Since we created that style,
 * we always have access, and its contents are only available when everything is done loading.
 *
 * @emits initialize
 */
ve.ui.Frame.prototype.onLoad = function () {
	var interval, rules,
		win = this.$.prop( 'contentWindow' ),
		doc = win.document,
		style = doc.createElement( 'style' ),
		initialize = ve.bind( function () {
			this.initialized = true;
			this.emit( 'initialize' );
		}, this );

	// Initialize contents
	doc.open();
	doc.write(
		'<!doctype html>' +
		'<html>' +
			'<body style="padding:0;margin:0;">' +
				'<div class="ve-ui-frame-content"></div>' +
			'</body>' +
		'</html>'
	);
	doc.close();

	// Import all stylesheets
	style.textContent = '@import "' + this.config.stylesheets.join( '";\n@import "' ) + '";';
	doc.body.appendChild( style );

	// Poll for access to stylesheet content
	interval = setInterval( ve.bind( function () {
		try {
			// MAGIC: only accessible when the stylesheet is loaded
			rules = style.sheet.cssRules;
		} catch ( e ) {
			// Try again in 10ms
			return;
		}
		// If that didn't throw an exception, we're done loading
		clearInterval( interval );
		// Protect against IE running interval one extra time after clearing
		if ( !this.initialized ) {
			initialize();
		}
	}, this ), 10 );

	// Properties
	this.$$ = ve.ui.get$$( doc, this );
	this.$content = this.$$( '.ve-ui-frame-content' );
};

/**
 * @param {Function} callback
 */
ve.ui.Frame.prototype.run = function ( callback ) {
	if ( this.initialized ) {
		callback();
	} else {
		this.once( 'initialize', callback );
	}
};

/**
 * Sets the size of the frame.
 *
 * @method
 * @param {number} width Frame width in pixels
 * @param {number} height Frame height in pixels
 * @chainable
 */
ve.ui.Frame.prototype.setSize = function ( width, height ) {
	this.$.css( { 'width': width, 'height': height } );
	return this;
};
