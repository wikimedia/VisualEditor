/*!
 * VisualEditor UserInterface MobileContext class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * UserInterface context that displays inspector full screen.
 *
 * @class
 * @extends ve.ui.Context
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 */
ve.ui.MobileContext = function VeUiMobileContext( surface, config ) {
	// Parent constructor
	ve.ui.MobileContext.super.call( this, surface, config );

	// Properties
	this.transitioning = null;

	// Events
	this.inspectors.connect( this, {
		setup: [ 'toggle', true ],
		teardown: [ 'toggle', false ]
	} );

	// Initialization
	this.$element.addClass( 've-ui-mobileContext' );
	this.$group.addClass( 've-ui-mobileContext-menu' );
	this.inspectors.$element.addClass( 've-ui-mobileContext-inspectors' );
	this.surface.getGlobalOverlay().$element.append( this.inspectors.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.MobileContext, ve.ui.Context );

/* Static Properties */

ve.ui.MobileContext.static.basicRendering = true;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.MobileContext.prototype.createInspectorWindowManager = function () {
	return new ve.ui.MobileWindowManager( this.surface, {
		factory: ve.ui.windowFactory,
		overlay: this.surface.getGlobalOverlay()
	} );
};
