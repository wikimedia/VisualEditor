/*!
 * VisualEditor Standalone Initialization Target class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Initialization Standalone target.
 *
 *     @example
 *     new ve.init.sa.Target(
 *         $( '<div>' ).appendTo( 'body' ), ve.createDocumentFromHtml( '<p>Hello world.</p>' )
 *     );
 *
 * @class
 * @extends ve.init.Target
 *
 * @constructor
 * @param {jQuery} $container Container to render target into
 * @param {ve.dm.Document} doc Document model
 * @param {string} [surfaceType] Type of surface to use, 'desktop' or 'mobile'
 * @throws {Error} Unknown surfaceType
 */
ve.init.sa.Target = function VeInitSaTarget( $container, doc, surfaceType ) {
	// Parent constructor
	ve.init.Target.call( this, $container );

	surfaceType = surfaceType || this.constructor.static.defaultSurfaceType;

	this.document = doc;
	switch ( surfaceType ) {
		case 'desktop':
			this.surfaceClass = ve.ui.DesktopSurface;
			break;
		case 'mobile':
			this.surfaceClass = ve.ui.MobileSurface;
			break;
		default:
			throw new Error( 'Unknown surfaceType: ' + surfaceType );
	}
	this.setupDone = false;

	ve.init.platform.getInitializedPromise().done( ve.bind( this.setup, this ) );
};

/* Inheritance */

OO.inheritClass( ve.init.sa.Target, ve.init.Target );

/* Static properties */

ve.init.sa.Target.static.defaultSurfaceType = 'desktop';

/* Methods */

/**
 * Setup the target
 *
 * @fires surfaceReady
 */
ve.init.sa.Target.prototype.setup = function () {
	var target = this;

	if ( this.setupDone ) {
		return;
	}

	// Properties
	this.setupDone = true;
	this.surface = this.createSurface( this.document );
	this.$document = this.surface.$element.find( '.ve-ce-documentNode' );
	this.toolbar = new ve.ui.TargetToolbar( this, this.surface, { 'shadow': true } );

	// Initialization
	this.toolbar.$element.addClass( 've-init-sa-target-toolbar' );
	this.toolbar.setup( this.constructor.static.toolbarGroups );
	this.toolbar.enableFloatable();

	this.$element.append( this.toolbar.$element, this.surface.$element );

	this.toolbar.initialize();
	this.surface.addCommands( this.constructor.static.surfaceCommands );
	this.surface.setPasteRules( this.constructor.static.pasteRules );
	this.surface.initialize();

	// This must be emitted asynchronous because ve.init.Platform#initialize
	// is synchronous, and if we emit it right away, then users will be
	// unable to listen to this event as it will have been emitted before the
	// constructor returns.
	setTimeout( function () {
		target.emit( 'surfaceReady' );
	} );
};

/**
 * @inheritdoc
 */
ve.init.sa.Target.prototype.createSurface = function ( dmDoc, config ) {
	return new this.surfaceClass( dmDoc, config );
};
