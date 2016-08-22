/*!
 * VisualEditor UserInterface FormatAction class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Format action.
 *
 * @class
 * @extends ve.ui.Action
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.FormatAction = function VeUiFormatAction() {
	// Parent constructor
	ve.ui.FormatAction.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.FormatAction, ve.ui.Action );

/* Static Properties */

ve.ui.FormatAction.static.name = 'format';

/**
 * List of allowed methods for this action.
 *
 * @static
 * @property
 */
ve.ui.FormatAction.static.methods = [ 'convert' ];

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
 * @return {boolean} Action was executed
 */
ve.ui.FormatAction.prototype.convert = function ( type, attributes ) {
	var selected, i, length, contentBranch,
		surfaceModel = this.surface.getModel(),
		fragment = surfaceModel.getFragment(),
		fragments = [];

	if ( !( fragment.getSelection() instanceof ve.dm.LinearSelection ) ) {
		return;
	}

	// We can't have headings or pre's in a list, so if we're trying to convert
	// things that are in lists to a heading or a pre, split the list
	selected = fragment.getLeafNodes();
	for ( i = 0, length = selected.length; i < length; i++ ) {
		contentBranch = selected[ i ].node.isContent() ?
			selected[ i ].node.getParent() :
			selected[ i ].node;

		fragments.push( surfaceModel.getLinearFragment( contentBranch.getOuterRange(), true ) );
	}

	for ( i = 0, length = fragments.length; i < length; i++ ) {
		fragments[ i ].isolateAndUnwrap( type );
	}

	fragment.convertNodes( type, attributes );
	this.surface.getView().focus();
	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.FormatAction );
