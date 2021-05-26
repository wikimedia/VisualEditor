/*!
 * VisualEditor UserInterface FormatAction class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
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
	var surfaceModel = this.surface.getModel(),
		fragment = surfaceModel.getFragment(),
		fragmentSelection = fragment.getSelection();

	if ( !( fragmentSelection instanceof ve.dm.LinearSelection ) ) {
		return;
	}

	var fragments = [];
	var i, length;
	// We can't have headings or pre's in a list, so if we're trying to convert
	// things that are in lists to a heading or a pre, split the list
	var selected = fragment.getLeafNodes();
	for ( i = 0, length = selected.length; i < length; i++ ) {
		var contentBranch = selected[ i ].node.isContent() ?
			selected[ i ].node.getParent() :
			selected[ i ].node;

		fragments.push( surfaceModel.getLinearFragment( contentBranch.getOuterRange(), true ) );
	}

	for ( i = 0, length = fragments.length; i < length; i++ ) {
		fragments[ i ].isolateAndUnwrap( type );
	}

	fragment.convertNodes( type, attributes );
	if ( fragmentSelection.isCollapsed() ) {
		// Converting an empty node needs a small selection fixup afterwards,
		// otherwise the selection will be displayed outside the new empty
		// node. This causes issues with the display of the current format in
		// the toolbar, and with hitting enter if no content is entered. Don't
		// always reapply the selection, because the automatic behavior is
		// better if isolateAndUnwrap has actually acted. (T151594)
		surfaceModel.setSelection( fragmentSelection );
	}
	this.surface.getView().focus();

	ve.track( 'activity.format', { action: type + ( attributes && attributes.level ? ( '-' + attributes.level ) : '' ) } );

	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.FormatAction );
