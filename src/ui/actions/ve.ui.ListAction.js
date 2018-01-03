/*!
 * VisualEditor UserInterface ListAction class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * List action.
 *
 * @class
 * @extends ve.ui.Action
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.ListAction = function VeUiListAction() {
	// Parent constructor
	ve.ui.ListAction.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.ListAction, ve.ui.Action );

/* Static Properties */

ve.ui.ListAction.static.name = 'list';

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.ui.ListAction.static.methods = [ 'wrap', 'unwrap', 'toggle', 'wrapOnce' ];

/* Methods */

/**
 * Check if the current selection is wrapped in a list of a given style
 *
 * @method
 * @param {string|null} style List style, e.g. 'number' or 'bullet', or null for any style
 * @return {boolean} Current selection is all wrapped in a list
 */
ve.ui.ListAction.prototype.allWrapped = function ( style ) {
	var i, len,
		attributes = style ? { style: style } : undefined,
		nodes = this.surface.getModel().getFragment().getLeafNodes(),
		all = !!nodes.length;

	for ( i = 0, len = nodes.length; i < len; i++ ) {
		if (
			( len === 1 || !nodes[ i ].range || nodes[ i ].range.getLength() ) &&
			!nodes[ i ].node.hasMatchingAncestor( 'list', attributes )
		) {
			all = false;
			break;
		}
	}
	return all;
};

/**
 * Toggle a list around content.
 *
 * @method
 * @param {string} style List style, e.g. 'number' or 'bullet'
 * @param {boolean} noBreakpoints Don't create breakpoints
 * @return {boolean} Action was executed
 */
ve.ui.ListAction.prototype.toggle = function ( style, noBreakpoints ) {
	return this[ this.allWrapped( style ) ? 'unwrap' : 'wrap' ]( style, noBreakpoints );
};

/**
 * Add a list around content only if it has no list already.
 *
 * @method
 * @param {string} style List style, e.g. 'number' or 'bullet'
 * @param {boolean} noBreakpoints Don't create breakpoints
 * @return {boolean} Action was executed
 */
ve.ui.ListAction.prototype.wrapOnce = function ( style, noBreakpoints ) {
	// Check for a list of any style
	if ( !this.allWrapped() ) {
		return this.wrap( style, noBreakpoints );
	}
	return false;
};

/**
 * Add a list around content.
 *
 * TODO: Refactor functionality into {ve.dm.SurfaceFragment}.
 *
 * @method
 * @param {string} style List style, e.g. 'number' or 'bullet'
 * @param {boolean} noBreakpoints Don't create breakpoints
 * @return {boolean} Action was executed
 */
ve.ui.ListAction.prototype.wrap = function ( style, noBreakpoints ) {
	var i, previousList, groupRange, group, range,
		surfaceModel = this.surface.getModel(),
		fragment = surfaceModel.getFragment( null, true ),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		groups;

	if ( !( selection instanceof ve.dm.LinearSelection ) ) {
		return false;
	}

	range = selection.getRange();

	if ( !noBreakpoints ) {
		surfaceModel.breakpoint();
	}

	// TODO: Would be good to refactor at some point and avoid/abstract path split for block slug
	// and not block slug.

	if (
		range.isCollapsed() &&
		!documentModel.data.isContentOffset( range.to ) &&
		documentModel.hasSlugAtOffset( range.to )
	) {
		// Inside block level slug
		fragment = fragment
			.insertContent( [
				{ type: 'paragraph' },
				{ type: '/paragraph' }
			] )
			.collapseToStart()
			.adjustLinearSelection( 1, 1 )
			.select();
		range = fragment.getSelection().getRange();
	}

	groups = documentModel.getCoveredSiblingGroups( range );
	for ( i = 0; i < groups.length; i++ ) {
		group = groups[ i ];
		if ( group.grandparent && group.grandparent.getType() === 'list' ) {
			if ( group.grandparent !== previousList ) {
				surfaceModel.getLinearFragment( group.grandparent.getOuterRange(), true )
					// Change the list style
					.changeAttributes( { style: style } );
				previousList = group.grandparent;
			}
		} else {
			// Get a range that covers the whole group
			groupRange = new ve.Range(
				group.nodes[ 0 ].getOuterRange().start,
				group.nodes[ group.nodes.length - 1 ].getOuterRange().end
			);
			surfaceModel.getLinearFragment( groupRange, true )
				// Convert everything to paragraphs first
				.convertNodes( 'paragraph' )
				// Wrap everything in a list and each content branch in a listItem
				.wrapAllNodes( { type: 'list', attributes: { style: style } }, { type: 'listItem' } );
		}
	}

	if ( !noBreakpoints ) {
		surfaceModel.breakpoint();
	}
	return true;
};

/**
 * Remove list around content.
 *
 * TODO: Refactor functionality into {ve.dm.SurfaceFragment}.
 *
 * @method
 * @param {boolean} noBreakpoints Don't create breakpoints
 * @return {boolean} Action was executed
 */
ve.ui.ListAction.prototype.unwrap = function ( noBreakpoints ) {
	var node,
		indentationAction = ve.ui.actionFactory.create( 'indentation', this.surface ),
		surfaceModel = this.surface.getModel(),
		documentModel = surfaceModel.getDocument();

	if ( !( surfaceModel.getSelection() instanceof ve.dm.LinearSelection ) ) {
		return false;
	}

	if ( !noBreakpoints ) {
		surfaceModel.breakpoint();
	}

	do {
		node = documentModel.getBranchNodeFromOffset( surfaceModel.getSelection().getRange().start );
	} while ( node.hasMatchingAncestor( 'list' ) && indentationAction.decrease() );

	if ( !noBreakpoints ) {
		surfaceModel.breakpoint();
	}

	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.ListAction );
