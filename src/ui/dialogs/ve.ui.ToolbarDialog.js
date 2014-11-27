/*!
 * VisualEditor UserInterface ToolbarDialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Toolbar dialog.
 *
 * @class
 * @abstract
 * @extends OO.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 */
ve.ui.ToolbarDialog = function VeUiToolbarDialog( config ) {
	// Parent constructor
	ve.ui.ToolbarDialog.super.call( this, config );

	// Pre-initialization
	// This class needs to exist before setup to constrain the height
	// of the dialog when it first loads.
	this.$element.addClass( 've-ui-toolbarDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.ToolbarDialog, OO.ui.Dialog );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.ToolbarDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.ToolbarDialog.super.prototype.initialize.call( this );

	// Events
	// Hack: required for keystrokes from isolated windows to make it back to the target
	this.$content.on( 'keydown', ve.init.target.onDocumentKeyDown.bind( ve.init.target ) );
	this.$content.on( 'keydown', ve.init.target.onTargetKeyDown.bind( ve.init.target ) );
};

ve.ui.ToolbarDialog.static.size = 'full';
