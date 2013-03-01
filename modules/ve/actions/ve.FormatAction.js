/*!
 * VisualEditor FormatAction class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Format action.
 *
 * @class
 * @extends ve.Action
 * @constructor
 * @param {ve.Surface} surface Surface to act on
 */
ve.FormatAction = function VeFormatAction( surface ) {
	// Parent constructor
	ve.Action.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.FormatAction, ve.Action );

/* Static Properties */

/**
 * List of allowed methods for this action.
 *
 * @static
 * @property
 */
ve.FormatAction.static.methods = ['convert'];

/* Methods */

/**
 * Convert the format of content.
 *
 * Conversion splits and unwraps all lists and replaces content branch nodes.
 *
 * TODO: Refactor functionality into {ve.dm.SurfaceFragment}.
 *
 * @param {string} type
 * @param {Object} attributes
 */
ve.FormatAction.prototype.convert = function ( type, attributes ) {
	var selected, i, length, contentBranch, txs,
		surfaceView = this.surface.getView(),
		surfaceModel = this.surface.getModel(),
		selection = surfaceModel.getSelection(),
		fragmentForSelection = new ve.dm.SurfaceFragment( surfaceModel, selection, true ),
		doc = surfaceModel.getDocument(),
		fragments = [];

	// We can't have headings or pre's in a list, so if we're trying to convert
	// things that are in lists to a heading or a pre, split the list
	selected = doc.selectNodes( selection, 'leaves' );
	for ( i = 0, length = selected.length; i < length; i++ ) {
		contentBranch = selected[i].node.isContent() ?
			selected[i].node.getParent() :
			selected[i].node;

		fragments.push( new ve.dm.SurfaceFragment( surfaceModel, contentBranch.getOuterRange(), true ) );
	}

	for( i = 0, length = fragments.length; i < length; i++ ) {
		fragments[i].isolateAndUnwrap( type );
	}
	selection = fragmentForSelection.getRange();

	txs = ve.dm.Transaction.newFromContentBranchConversion( doc, selection, type, attributes );
	surfaceModel.change( txs, selection );
	surfaceView.showSelection( selection );
};

/* Registration */

ve.actionFactory.register( 'format', ve.FormatAction );
