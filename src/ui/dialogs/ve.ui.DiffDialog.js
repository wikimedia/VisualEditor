/*!
 * VisualEditor user interface DiffDialog class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Dialog for displaying a diff.
 *
 * @class
 * @extends OO.ui.ProcessDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.DiffDialog = function VeUiDiffDialog( config ) {
	// Parent constructor
	ve.ui.DiffDialog.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.DiffDialog, OO.ui.ProcessDialog );

/* Static properties */

ve.ui.DiffDialog.static.name = 'diff';

ve.ui.DiffDialog.static.size = 'larger';

ve.ui.DiffDialog.static.title = 'Changes';

ve.ui.DiffDialog.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-done' ),
		flags: 'safe'
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DiffDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.DiffDialog.parent.prototype.initialize.apply( this, arguments );

	this.content = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	} );

	this.$body.append( this.content.$element );
};

/**
 * @inheritdoc
 */
ve.ui.DiffDialog.prototype.getSetupProcess = function ( data ) {
	return ve.ui.DiffDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {

			var visualDiff, diffElement;
			visualDiff = new ve.dm.VisualDiff( data.oldDoc, data.newDoc );
			diffElement = new ve.ui.DiffElement( visualDiff );

			this.content.$element.empty().append(
				diffElement.$element
			);
		}, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.DiffDialog );
