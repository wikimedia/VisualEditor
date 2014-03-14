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
	// TODO: do something more fancy, PanelLayout or a new drawer OOUI widget
	this.$element
		.addClass( 've-ui-mobileContext' )
		.append( this.inspectors.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.MobileContext, ve.ui.Context );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.hide = function () {
	return this;
};
