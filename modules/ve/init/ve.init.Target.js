/*!
 * VisualEditor Initialization Target class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic Initialization target.
 *
 * @class
 * @abstract
 * @extends ve.EventEmitter
 *
 * @constructor
 * @param {jQuery} $container Conainter to render target into
 */
ve.init.Target = function VeInitTarget( $container ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.$ = $container;
	this.dialogs = {};
	this.currentDialogName = null;
};

/* Inheritance */

ve.inheritClass( ve.init.Target, ve.EventEmitter );

/* Events */

/**
 * @event addDialog
 * @param {string} name Name of dialog
 */

/**
 * @event openDialog
 * @param {string} name Name of dialog
 */

/**
 * @event closeDialog
 * @param {string} name Name of dialog
 */

/* Methods */

/**
 * Add a dialog to the target.
 *
 * @method
 * @param {string} name Name of dialog
 * @param {ve.ui.Dialog} dialog Dialog to add
 * @throws {Error} If dialog is already registered using `name`
 * @emits addDialog
 */
ve.init.Target.prototype.addDialog = function ( name, dialog ) {
	// Prevent duplicate names being used
	if ( name in this.dialogs ) {
		throw new Error( 'Dialog already registered: ' + name );
	}

	this.dialogs[name] = dialog;
	this.emit( 'addDialog', name );
};

/**
 * Open a dialog.
 *
 * @method
 * @param {string} name Name of dialog
 * @throws {Error} If no dialog exists for `name`
 * @emits openDialog
 */
ve.init.Target.prototype.openDialog = function ( name ) {
	var dialog = this.dialogs[name];

	// Validate dialog
	if ( !dialog ) {
		throw new Error( 'Dialog not found: ' +  name );
	}

	// Bypass when not changing anything
	if ( name === this.currentDialogName ) {
		return;
	}

	// Close current dialog
	if ( this.currentDialogName && this.dialogs[this.currentDialogName].isVisible() ) {
		this.closeDialog();
	}

	this.currentDialogName = name;
	dialog.show();
	this.emit( 'openDialog', name );
};

/**
 * Close any open dialog.
 *
 * @method
 * @param {string} name Name of dialog
 * @emits closeDialog
 */
ve.init.Target.prototype.closeDialog = function () {
	var name = this.currentDialogName;

	this.currentDialogName = null;
	this.dialogs[name].hide();
	this.emit( 'closeDialog', name );
};

/**
 * Get a dialog by name.
 *
 * @method
 * @param {string} name Name of dialog
 * @returns {ve.ui.Dialog} Dialog associated with `name`
 * @throws {Error} If no dialog exists for `name`
 */
ve.init.Target.prototype.getDialog = function ( name ) {
	var dialog = this.dialogs[name];

	// Validate dialog
	if ( !dialog ) {
		throw new Error( 'Dialog not found: ' +  name );
	}

	return dialog;
};
