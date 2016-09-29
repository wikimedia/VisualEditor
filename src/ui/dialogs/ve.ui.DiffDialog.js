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

ve.ui.DiffDialog.static.title = 'Diff dialog';

ve.ui.DiffDialog.static.actions = [
	{ label: 'Cancel', flags: 'safe' }
];

/* Methods */

ve.ui.DiffDialog.prototype.initialize = function () {
	var visualDiff, diffElement;

	// Parent method
	ve.ui.DiffDialog.parent.prototype.initialize.apply( this, arguments );

	visualDiff = new ve.dm.VisualDiff( ve.init.target.oldDoc, ve.init.target.surface.model.documentModel );
	diffElement = new ve.ui.DiffElement( visualDiff );

	this.content = new OO.ui.PanelLayout( {
		padded: true,
		expanded: true
	} );

	this.$body.append(
		this.content.$element.append(
			diffElement.$element
		)
	);
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.DiffDialog );
