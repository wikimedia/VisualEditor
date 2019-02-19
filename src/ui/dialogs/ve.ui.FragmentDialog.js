/*!
 * VisualEditor UserInterface FragmentDialog class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Dialog for working with fragments of content.
 *
 * @class
 * @abstract
 * @extends OO.ui.ProcessDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.FragmentDialog = function VeUiFragmentDialog( config ) {
	// Parent constructor
	ve.ui.FragmentDialog.super.call( this, config );

	// Mixin constructor
	ve.ui.FragmentWindow.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.FragmentDialog, OO.ui.ProcessDialog );

OO.mixinClass( ve.ui.FragmentDialog, ve.ui.FragmentWindow );

/* Static Properties */

ve.ui.FragmentDialog.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'edit', 'insert' ]
	},
	{
		action: 'done',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-apply' ),
		flags: [ 'progressive', 'primary' ],
		modes: 'edit'
	},
	{
		action: 'done',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-insert' ),
		flags: [ 'progressive', 'primary' ],
		modes: 'insert'
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.FragmentDialog.prototype.initialize = function ( data ) {
	// Parent method
	ve.ui.FragmentDialog.super.prototype.initialize.call( this, data );

	this.tabIndexScope = new ve.ui.TabIndexScope( {
		root: this.$content
	} );
};

/**
 * @inheritdoc
 */
ve.ui.FragmentDialog.prototype.getSetupProcess = function ( data ) {
	// Parent method
	var process = ve.ui.FragmentDialog.super.prototype.getSetupProcess.call( this, data );
	// Mixin method
	return ve.ui.FragmentWindow.prototype.getSetupProcess.call( this, data, process );
};

/**
 * @inheritdoc
 */
ve.ui.FragmentDialog.prototype.getTeardownProcess = function ( data ) {
	// Parent method
	var process = ve.ui.FragmentDialog.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
			this.fragment.select();
		}, this );
	// Mixin method
	return ve.ui.FragmentWindow.prototype.getTeardownProcess.call( this, data, process );
};
