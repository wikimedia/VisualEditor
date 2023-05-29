/*!
 * VisualEditor UserInterface WindowManager class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Window manager.
 *
 * @class
 * @extends OO.ui.WindowManager
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {ve.ui.Overlay} [overlay] Overlay to use for menus
 */
ve.ui.WindowManager = function VeUiWindowManager( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	ve.ui.WindowManager.super.call( this, config );

	// Properties
	this.overlay = config.overlay || null;

	// The following classes are used here:
	// * ve-ui-dir-block-ltr
	// * ve-ui-dir-block-rtl
	this.$element.addClass( 've-ui-dir-block-' + this.getDir() );
};

/* Inheritance */

OO.inheritClass( ve.ui.WindowManager, OO.ui.WindowManager );

/* Methods */

/**
 * Get directionality.
 *
 * @return {string} UI directionality
 */
ve.ui.WindowManager.prototype.getDir = function () {
	return $( document.body ).css( 'direction' );
};

/**
 * Get overlay for menus.
 *
 * @return {ve.ui.Overlay|null} Menu overlay, null if none was configured
 */
ve.ui.WindowManager.prototype.getOverlay = function () {
	return this.overlay;
};

ve.ui.WindowManager.prototype.toggleIsolation = function () {
	// Parent method
	ve.ui.WindowManager.super.prototype.toggleIsolation.apply( this, arguments );

	// Patch apply https://gerrit.wikimedia.org/r/c/oojs/ui/+/923654
	if ( this.isolated ) {
		var $el = this.$element;
		while ( !$el.is( 'body' ) && $el.length ) {
			$el
				.removeAttr( 'aria-hidden' )
				.removeAttr( 'inert' );
			$el = $el.parent();
		}
	}
};
