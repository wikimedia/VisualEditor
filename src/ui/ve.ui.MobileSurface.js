/*!
 * VisualEditor UserInterface MobileSurface class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * A surface is a top-level object which contains both a surface model and a surface view.
 * This is the mobile version of the surface.
 *
 * @class
 * @extends ve.ui.Surface
 *
 * @constructor
 * @param {HTMLDocument|Array|ve.dm.LinearData|ve.dm.Document} dataOrDoc Document data to edit
 * @param {Object} [config] Configuration options
 */
ve.ui.MobileSurface = function VeUiMobileSurface() {
	// Parent constructor
	ve.ui.Surface.apply( this, arguments );

	// Properties
	this.scrollPosition = null;

	// Events
	this.dialogs.connect( this, { opening: 'onWindowOpening' } );
	this.context.getInspectors().connect( this, { opening: 'onWindowOpening' } );

	// Initialization
	this.globalOverlay.$element
		.addClass( 've-ui-mobileSurface-overlay ve-ui-mobileSurface-overlay-global' );
};

/* Inheritance */

OO.inheritClass( ve.ui.MobileSurface, ve.ui.Surface );

/* Methods */

/**
 * Handle an dialog opening event.
 *
 * @param {OO.ui.Window} win Window that's being opened
 * @param {jQuery.Promise} opening Promise resolved when window is opened; when the promise is
 *   resolved the first argument will be a promise which will be resolved when the window begins
 *   closing, the second argument will be the opening data
 * @param {Object} data Window opening data
 */
ve.ui.MobileSurface.prototype.onWindowOpening = function ( win, opening ) {
	var $body = $( 'body' ),
		$globalElements = $( 'html, body' ),
		$globalOverlay = this.globalOverlay.$element;

	opening
		.progress( ve.bind( function ( data ) {
			if ( data.state === 'setup' ) {
				this.scrollPosition = $body.scrollTop();
				$globalElements.addClass( 've-ui-mobileSurface-overlay-global-enabled' );
				$globalOverlay.addClass( 've-ui-mobileSurface-overlay-global-visible' );
			}
		}, this ) )
		.always( ve.bind( function ( opened ) {
			opened.always( ve.bind( function ( closed ) {
				closed.always( ve.bind( function () {
					$body.scrollTop( this.scrollPosition );
					$globalElements.removeClass( 've-ui-mobileSurface-overlay-global-enabled' );
					$globalOverlay.removeClass( 've-ui-mobileSurface-overlay-global-visible' );
				}, this ) );
			}, this ) );
		}, this ) );
};

/**
 * @inheritdoc
 */
ve.ui.MobileSurface.prototype.createContext = function () {
	return new ve.ui.MobileContext( this, { $: this.$ } );
};

/**
 * @inheritdoc
 */
ve.ui.MobileSurface.prototype.createDialogWindowManager = function () {
	return new ve.ui.MobileWindowManager( {
		factory: ve.ui.windowFactory,
		overlay: this.globalOverlay
	} );
};
