/*!
 * VisualEditor ListAction class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * List action.
 *
 * @class
 * @extends ve.Action
 * @constructor
 * @param {ve.Surface} surface Surface to act on
 */
ve.ListAction = function VeListAction( surface ) {
	// Parent constructor
	ve.Action.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.ListAction, ve.Action );

/* Static Properties */

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.ListAction.static.methods = ['wrap', 'unwrap'];

/* Methods */

/**
 * Add a list around content.
 *
 * TODO: Refactor functionality into {ve.dm.SurfaceFragment}.
 *
 * @method
 * @param {string} style List style, e.g. 'number' or 'bullet'
 */
ve.ListAction.prototype.wrap = function ( style ) {
	var tx, i, previousList, groupRange, group,
		surfaceModel = this.surface.getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		groups = documentModel.getCoveredSiblingGroups( selection );

	surfaceModel.breakpoint();
	for ( i = 0; i < groups.length; i++ ) {
		group = groups[i];
		if ( group.grandparent && group.grandparent.getType() === 'list' ) {
			if ( group.grandparent !== previousList ) {
				// Change the list style
				surfaceModel.change(
					ve.dm.Transaction.newFromAttributeChange(
						documentModel, group.grandparent.getOffset(), 'style', style
					),
					selection
				);
				// Skip this one next time
				previousList = group.grandparent;
			}
		} else {
			// Get a range that covers the whole group
			groupRange = new ve.Range(
				group.nodes[0].getOuterRange().start,
				group.nodes[group.nodes.length - 1].getOuterRange().end
			);
			// Convert everything to paragraphs first
			surfaceModel.change(
				ve.dm.Transaction.newFromContentBranchConversion(
					documentModel, groupRange, 'paragraph'
				),
				selection
			);
			// Wrap everything in a list and each content branch in a listItem
			tx = ve.dm.Transaction.newFromWrap(
				documentModel,
				groupRange,
				[],
				[{ 'type': 'list', 'attributes': { 'style': style } }],
				[],
				[{ 'type': 'listItem' }]
			);
			surfaceModel.change( tx, tx.translateRange( selection ) );
		}
	}
	surfaceModel.breakpoint();
};

/**
 * Remove list around content.
 *
 * TODO: Refactor functionality into {ve.dm.SurfaceFragment}.
 *
 * @method
 */
ve.ListAction.prototype.unwrap = function () {
	var node,
		surfaceModel = this.surface.getModel(),
		documentModel = surfaceModel.getDocument();

	surfaceModel.breakpoint();

	node = documentModel.getNodeFromOffset( surfaceModel.getSelection().start );
	while ( node.hasMatchingAncestor( 'list' ) ) {
		this.surface.execute( 'indentation', 'decrease' );
		node = documentModel.getNodeFromOffset( surfaceModel.getSelection().start );
	}

	surfaceModel.breakpoint();
};

/* Registration */

ve.actionFactory.register( 'list', ve.ListAction );
