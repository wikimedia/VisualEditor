/*!
 * VisualEditor UserInterface Dialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog with an associated surface fragment.
 *
 * @class
 * @abstract
 * @extends OO.ui.Dialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.Dialog = function VeUiDialog( config ) {
	// Parent constructor
	OO.ui.Dialog.call( this, config );

	// Properties
	this.fragment = null;
};

/* Inheritance */

OO.inheritClass( ve.ui.Dialog, OO.ui.Dialog );

/**
 * @inheritdoc
 */
ve.ui.Dialog.prototype.open = function ( fragment, data ) {
	this.fragment = fragment;

	// Parent method
	return ve.ui.Dialog.super.prototype.open.call( this, data );
};

/**
 * @inheritdoc
 */
ve.ui.Dialog.prototype.close = function ( data ) {
	// Parent method
	var promise = ve.ui.Dialog.super.prototype.close.call( this, data );

	// Reset
	this.fragment = null;

	return promise;
};

/**
 * @inheritdoc
 */
ve.ui.Dialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.Dialog.super.prototype.getTeardownProcess.apply( this, data )
		.next( function () {
			// Restore selection
			// HACK: Integration is a mess, and to prevent teardown being called multiple times we
			// need to rethink a whole lot of it, and spend a fair amount of time rewriting it - but
			// instead of doing all of that, we can just put this band aid (checking if there is a
			// fragment before calling select on it) and closed bug 63954 for now.
			if ( this.fragment ) {
				this.fragment.select();
			}
		}, this );
};

/**
 * Get the surface fragment the dialog is for
 *
 * @returns {ve.dm.SurfaceFragment|null} Surface fragment the dialog is for, null if the dialog is closed
 */
ve.ui.Dialog.prototype.getFragment = function () {
	return this.fragment;
};
