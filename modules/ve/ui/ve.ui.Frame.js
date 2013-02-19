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
 * @constructor
 */
ve.ui.Frame = function VeUiFrame( config, $container ) {
	var i, len;

	// Properties
	this.$frame = $( '<iframe frameborder="0" scrolling="no"></iframe>' );
	this.frameDocument = this.attachFrame( this.$frame, $container );
	this.$ = this.$$( '.ve-ui-frame-container' );
	this.$$ = ve.bind( this.$$, this );

	// Initialization
	if ( 'stylesheets' in config ) {
		for ( i = 0, len = config.stylesheets.length; i < len; i++ ) {
			this.loadStylesheet( config.stylesheets[i] );
		}
	}
};

/* Methods */

/**
 * Sets the size of the frame.
 *
 * @method
 * @param {number} width Frame width in pixels
 * @param {number} height Frame height in pixels
 */
ve.ui.Frame.prototype.setSize = function ( width, height ) {
	this.$frame.css( { 'width': width, 'height': height } );
};

/**
 * Execute jQuery function within the context of the frame.
 *
 * @method
 * @param {string} selector jQuery selector
 * @returns {jQuery} jQuery selection
 */
ve.ui.Frame.prototype.$$ = function ( selector ) {
	return $( selector, this.frameDocument );
};

/**
 * Attaches and initializes a frame within a given container.
 *
 * @method
 * @private
 * @param {jQuery} $frame Frame to attach and initialize
 * @param {jQuery} $container Container to append frame to
 * @returns {HTMLElement} Frame document
 */
ve.ui.Frame.prototype.attachFrame = function ( $frame, $container ) {
	var doc;
	// Attach to a document to initialze for real
	$container.append( $frame );
	// Get the frame document
	doc = $frame.prop( 'contentWindow' ).document;
	// Create an inner frame container
	doc.write( '<div class="ve-ui-frame-container"></div>' );
	// Finish the frame to make all browsers happy
	doc.close();
	// Basic styles
	$( 'body', doc ).css( {
		'padding': 0,
		'margin': 0
	} );
	return doc;
};

/**
 * Adds a stylesheet to the frame.
 *
 * @method
 * @param {string} path Full path to stylesheet
 */
ve.ui.Frame.prototype.loadStylesheet = function ( path ) {
	// Append style elements to head.
	this.$$( 'head' ).append(
		this.$$( '<link rel="stylesheet">' ).attr( 'href', path )
	);
};
