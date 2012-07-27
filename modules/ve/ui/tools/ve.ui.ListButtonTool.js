/**
 * VisualEditor user interface ListButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ListButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
 ve.ui.ListButtonTool = function ( toolbar, name, title, data ) {
	// Inheritance
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.data = data;
	this.nodes = [];
};

/* Methods */

ve.ui.ListButtonTool.prototype.list = function ( nodes, style ) {
	var surfaceModel = this.toolbar.getSurfaceView().getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		groups = documentModel.getCoveredSiblingGroups( selection ),
		previousList,
		groupRange,
		group,
		tx, i;

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
};

ve.ui.ListButtonTool.prototype.unlist = function ( node ) {
	/**
	 * Recursively prepare to unwrap all lists in a given range.
	 *
	 * This function will find all lists covered wholly or partially by the given range, as well
	 * as all lists inside these lists, and return their inner ranges. This means that all sublists
	 * will be found even if range doesn't cover them.
	 *
	 * To actually unwrap the list, feed the returned ranges to ve.dm.Transaction.newFromWrap(),
	 * in order.
	 *
	 * @param {ve.dm.Document} documentModel
	 * @param {ve.Range} range
	 * @returns {ve.Range[]} Array of inner ranges of lists
	 */
	function getUnlistRanges( documentModel, range ) {
		var groups = documentModel.getCoveredSiblingGroups( range ),
			// Collect ranges in an object for deduplication
			unlistRanges = {},
			i, j, k, group, previousList, list, listItem,
			subList, endOffset = 0;

		for ( i = 0; i < groups.length; i++ ) {
			group = groups[i];
			list = group.grandparent;
			if ( list && list.getType() === 'list' && list !== previousList ) {
				// Unwrap the parent list
				range = list.getRange();
				if ( range.end > endOffset ) {
					unlistRanges[range.start + '-' + range.end] = range;
					endOffset = range.end;
				}
				// Skip this list next time
				previousList = list;
				// Recursively unwrap any sublists of the list
				for ( j = 0; j < list.children.length; j++ ) {
					listItem = list.children[j];
					if ( listItem.getType() === 'listItem' ) {
						for ( k = 0; k < listItem.children.length; k++ ) {
							subList = listItem.children[k];
							if ( subList.getType() === 'list' ) {
								// Recurse
								unlistRanges = ve.extendObject( unlistRanges, getUnlistRanges(
									documentModel, subList.getRange()
								) );
							}
						}
					}
				}
			}
		}
		return unlistRanges;
	}

	var surfaceModel = this.toolbar.getSurfaceView().getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		unlistRangesObj = getUnlistRanges( documentModel, selection ),
		unlistRangesArr = [],
		i, j, tx;

	for ( i in unlistRangesObj ) {
		unlistRangesArr.push( unlistRangesObj[i] );
	}

	for ( i = 0; i < unlistRangesArr.length; i++ ) {
		// Unwrap the range given by unlistRanges[i]
		tx = ve.dm.Transaction.newFromWrap(
			documentModel,
			unlistRangesArr[i],
			[ { 'type': 'list' } ],
			[],
			[ { 'type': 'listItem' } ],
			[]
		);
		selection = tx.translateRange( selection );
		surfaceModel.change( tx );
		// Translate all the remaining ranges for this transaction
		// TODO ideally we'd have a way to merge all these transactions into one and execute that instead
		for ( j = i + 1; j < unlistRangesArr.length; j++ ) {
			unlistRangesArr[j] = tx.translateRange( unlistRangesArr[j] );
		}
	}
	// Update the selection
	surfaceModel.change( null, selection );
};

ve.ui.ListButtonTool.prototype.onClick = function () {
	this.toolbar.surfaceView.model.breakpoint();
	if ( !this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {
		this.list( this.nodes, this.name );
	} else {
		this.unlist( this.nodes );
	}
	this.toolbar.surfaceView.model.breakpoint();
};

ve.ui.ListButtonTool.prototype.updateState = function ( annotations, nodes ) {
	var surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		doc = surfaceView.getDocument(),
		selection = surfaceModel.getSelection(),
		leaves = doc.selectNodes( selection, 'leaves' );

	function areListItemsOfStyle( leaves, style ){
		var i, listNode;

		for ( i = 0; i < leaves.length; i++ ) {
			listNode = leaves[i].node;
			// Get the list node
			while ( listNode && listNode.getType() !== 'list' ) {
				listNode = listNode.getParent();
				if ( listNode === null ) {
					return false;
				}
			}
			if ( listNode.getModel().getAttribute('style') !== style ) {
				return false;
			}
		}
		return true;
	}

	if ( areListItemsOfStyle( leaves, this.name ) ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-down' );
	}
};

/* Registration */

ve.ui.Tool.tools.number = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'number',
	'title': ve.msg( 'visualeditor-listbutton-number-tooltip' )
};

ve.ui.Tool.tools.bullet = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'bullet',
	'title': ve.msg( 'visualeditor-listbutton-bullet-tooltip' )
};

/* Inheritance */

ve.extendClass( ve.ui.ListButtonTool, ve.ui.ButtonTool );
