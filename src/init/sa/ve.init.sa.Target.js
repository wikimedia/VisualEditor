/*!
 * VisualEditor Standalone Initialization Target class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
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
 * @param {ve.dm.Document} dmDoc Document model
 * @param {string} [surfaceType] Type of surface to use, 'desktop' or 'mobile'
 * @throws {Error} Unknown surfaceType
 */
ve.init.sa.Target = function VeInitSaTarget( $container, dmDoc, surfaceType ) {
	// Parent constructor
	ve.init.Target.call( this, $container );

	this.surfaceType = surfaceType || this.constructor.static.defaultSurfaceType;

	switch ( this.surfaceType ) {
		case 'desktop':
			this.surfaceClass = ve.ui.DesktopSurface;
			break;
		case 'mobile':
			this.surfaceClass = ve.ui.MobileSurface;
			break;
		default:
			throw new Error( 'Unknown surfaceType: ' + this.surfaceType );
	}
	this.setupDone = false;

	ve.init.platform.getInitializedPromise().done( this.setup.bind( this, dmDoc ) );
};

/* Inheritance */

OO.inheritClass( ve.init.sa.Target, ve.init.Target );

/* Static properties */

ve.init.sa.Target.static.defaultSurfaceType = 'desktop';

/* Methods */

/**
 * Setup the target
 *
 * @param {ve.dm.Document} dmDoc Document model
 * @fires surfaceReady
 */
ve.init.sa.Target.prototype.setup = function ( dmDoc ) {
	var surface, target = this;

	if ( this.setupDone ) {
		return;
	}

	// Properties
	this.setupDone = true;
	surface = this.addSurface( dmDoc );
	this.$element.append( surface.$element );

	this.setupToolbar( { classes: ['ve-init-sa-target-toolbar'] } );

	// Initialization
	// The following classes can be used here:
	// ve-init-sa-target-mobile
	// ve-init-sa-target-desktop
	this.$element.addClass( 've-init-sa-target ve-init-sa-target-' + this.surfaceType );
	this.getToolbar().enableFloatable();
	this.getToolbar().initialize();
	surface.initialize();

	// HACK: On mobile place the context inside toolbar.$bar which floats
	if ( this.surfaceType === 'mobile' ) {
		this.getToolbar().$bar.append( surface.context.$element );
	}

	// This must be emitted asynchronously because ve.init.Platform#initialize
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
	config = ve.extendObject( {
		excludeCommands: this.constructor.static.excludeCommands,
		importRules: this.constructor.static.importRules
	}, config );
	return new this.surfaceClass( dmDoc, config );
};

/**
 * @inheritdoc
 */
ve.init.sa.Target.prototype.setupToolbar = function ( config ) {
	config = ve.extendObject( { shadow: true, actions: true }, config );

	// Parent method
	ve.init.sa.Target.super.prototype.setupToolbar.call( this, config );

	var actions = new ve.ui.TargetToolbar( this, this.getSurface() );

	actions.setup( [
		{
			type: 'list',
			icon: 'menu',
			title: ve.msg( 'visualeditor-pagemenu-tooltip' ),
			include: [ 'findAndReplace', 'commandHelp' ]
		}
	] );

	this.toolbar.$actions.append( actions.$element );
};
