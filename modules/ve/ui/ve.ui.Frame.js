/**
 * VisualEditor user interface Frame class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * I-Frame abstraction.
 *
 * @class
 * @constructor
 */
ve.ui.Frame = function VeUiFrame( config, $container ) {
	var i, len;

	// Properties
	this.$frame = $( '<iframe frameborder="0" scrolling="no"></iframe>' );
	this.frameDocument = this.createFrame( this.$frame, $container );
	this.$ = this.$$( '.ve-ui-frame-container' );

	// Initialization
	if ( 'stylesheets' in config ) {
		for ( i = 0, len = config.stylesheets.length; i < len; i++ ) {
			this.loadStylesheet( config.stylesheets[i] );
		}
	}
};

/* Methods */

ve.ui.Frame.prototype.setSize = function ( width, height ) {
	this.$frame.css( { 'width': width, 'height': height } );
};

ve.ui.Frame.prototype.$$ = function ( selector ) {
	return $( selector, this.frameDocument );
};

ve.ui.Frame.prototype.createFrame = function ( $frame, $container ) {
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

ve.ui.Frame.prototype.loadStylesheet = function ( path ) {
	// Append style elements to head.
	this.$$( 'head' ).append(
		this.$$( '<link rel="stylesheet">' ).attr( 'href', path )
	);
};
