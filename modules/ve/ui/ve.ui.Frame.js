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
 * @extends ve.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {string[]} [stylesheets] List of stylesheet file names, each relative to ve/ui/styles
 */
ve.ui.Frame = function VeUiFrame( config ) {
	// Inheritance
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

ve.inheritClass( ve.ui.Frame, ve.EventEmitter );

/* Events */

/**
 * @event initialize
 */

/* Methods */

/**
 * @emits initialize
 */
ve.ui.Frame.prototype.onLoad = function () {
	var i, len, doc,
		css = [],
		promises = [],
		stylesheets = this.config.stylesheets,
		stylesheetPath = ve.init.platform.getModulesUrl() + '/ve/ui/styles/';

	// Initialize contents
	doc = this.$.prop( 'contentWindow' ).document;
	doc.open();
	doc.write(
		'<head><base href="' + stylesheetPath + '"></head>' +
		'<body style="padding:0;margin:0;"><div class="ve-ui-frame-content"></div></body>'
	);
	doc.close();

	// Properties
	this.$$ = ve.ui.get$$( doc, this );
	this.$content = this.$$( '.ve-ui-frame-content' );

	// Add stylesheets
	function setter( index ) {
		return function ( data ) {
			css[index] = data;
		};
	}
	for ( i = 0, len = stylesheets.length; i < len; i++ ) {
		promises.push( $.get( stylesheetPath + stylesheets[i], setter( i ) ) );
	}
	$.when.apply( $, promises )
		.done( ve.bind( function () {
			this.$$( 'head' ).append( '<style>' + css.join( '\n' ) + '</style>' );
			this.initialized = true;
			this.emit( 'initialize' );
		}, this ) );
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
