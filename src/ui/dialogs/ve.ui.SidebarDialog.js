/*!
 * VisualEditor UserInterface SidebarDialog class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Sidebar dialog.
 *
 * @class
 * @abstract
 * @extends OO.ui.Dialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.SidebarDialog = function VeUiSidebarDialog( config ) {
	// Parent constructor
	ve.ui.SidebarDialog.super.call( this, config );

	// Pre-initialization
	// This class needs to exist before setup to constrain the height
	// of the dialog when it first loads.
	this.$element.addClass( 've-ui-sidebarDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.SidebarDialog, OO.ui.Dialog );

/* Static Properties */

ve.ui.SidebarDialog.static.size = 'medium';

/**
 * The dialog has a frame border
 *
 * @static
 * @type {boolean}
 */
ve.ui.SidebarDialog.static.framed = true;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SidebarDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.SidebarDialog.super.prototype.initialize.call( this );

	this.$content.addClass( 've-ui-sidebarDialog-content' );
	if ( this.constructor.static.framed ) {
		this.$element.addClass( 've-ui-sidebarDialog-framed' );
	}
	// Invisible title for accessibility
	this.title.setInvisibleLabel( true );
	this.$element.prepend( this.title.$element );
};

/**
 * @inheritdoc
 */
ve.ui.SidebarDialog.prototype.getTeardownProcess = function ( data ) {
	ve.track( 'activity.' + this.constructor.static.name, { action: 'dialog-' + ( data && data.action || 'abort' ) } );
	return ve.ui.SidebarDialog.super.prototype.getTeardownProcess.apply( this, arguments );
};
