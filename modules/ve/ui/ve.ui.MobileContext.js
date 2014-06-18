/*!
 * VisualEditor UserInterface MobileContext class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
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
	ve.ui.Context.call( this, surface, config );

	// Initialization
	this.$element
		.addClass( 've-ui-mobileContext' )
		.append( this.context.$element );

	this.surface.$globalOverlay
		.append( this.inspectors.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.MobileContext, ve.ui.Context );

/* Methods */

/**
 * Deferred response to one or more select events.
 * Update the context toolbar for the new selection.
 *
 * @method
 */
ve.ui.MobileContext.prototype.afterModelChange = function () {
	var win = this.inspectors.getCurrentWindow(),
		selectionChange = !!this.afterModelChangeRange,
		moving = selectionChange && !( win && ( win.isOpening() || win.isClosing() ) );

	this.afterModelChangeTimeout = null;
	this.afterModelChangeRange = null;

	// TODO this is the only big difference between MobileContext and DesktopContext
	// merge this code somehow?
	this.hide();

	this.update( !moving  );
};

/**
 * @inheritdoc
 */
ve.ui.MobileContext.prototype.onInspectorSetup = function () {
	this.surface.showGlobalOverlay();
};

/**
 * @inheritdoc
 */
ve.ui.MobileContext.prototype.onInspectorTeardown = function () {
	this.surface.hideGlobalOverlay();
};

/**
 * Shows the context.
 *
 * @method
 * @chainable
 */
ve.ui.MobileContext.prototype.show = function () {
	this.$element.addClass( 've-ui-mobileContext-visible' );
	return this;
};

/**
 * @inheritdoc
 */
ve.ui.MobileContext.prototype.hide = function () {
	this.$element.removeClass( 've-ui-mobileContext-visible' );
	return this;
};
