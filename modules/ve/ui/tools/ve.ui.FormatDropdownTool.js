/**
 * VisualEditor user interface FormatDropdownTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.FormatDropdownTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.DropdownTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param {Object[]} items
 */
ve.FormatDropdownTool = function ( toolbar, name, title ) {
	// Inheritance
	ve.ui.DropdownTool.call( this, toolbar, name, title, [
		{
			'name': 'paragraph',
			'label': ve.msg( 'visualeditor-formatdropdown-format-paragraph' ),
			'type' : 'paragraph'
		},
		{
			'name': 'heading-1',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading1' ),
			'type' : 'heading',
			'attributes': { 'level': 1 }
		},
		{
			'name': 'heading-2',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading2' ),
			'type' : 'heading',
			'attributes': { 'level': 2 }
		},
		{
			'name': 'heading-3',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading3' ),
			'type' : 'heading',
			'attributes': { 'level': 3 }
		},
		{
			'name': 'heading-4',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading4' ),
			'type' : 'heading',
			'attributes': { 'level': 4 }
		},
		{
			'name': 'heading-5',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading5' ),
			'type' : 'heading',
			'attributes': { 'level': 5 }
		},
		{
			'name': 'heading-6',
			'label': ve.msg( 'visualeditor-formatdropdown-format-heading6' ),
			'type' : 'heading',
			'attributes': { 'level': 6 }
		},
		{
			'name': 'preformatted',
			'label': ve.msg( 'visualeditor-formatdropdown-format-preformatted' ),
			'type' : 'preformatted'
		}
	] );
};

/* Methods */

ve.FormatDropdownTool.splitAndUnwrap = function ( model, list, firstItem, lastItem, selection ) {
	var doc = model.getDocument(),
		start = firstItem.getOuterRange().start,
		end = lastItem.getOuterRange().end,
		tx;
	// First split the list before, if needed
	if ( list.indexOf( firstItem ) > 0 ) {
		tx = ve.dm.Transaction.newFromInsertion(
			doc, start, [{ 'type': '/list' }, list.getClonedElement()]
		);
		start += 2;
		end += 2;
		selection = tx.translateRange( selection );
		model.change( tx, selection );
	}
	// Split the list after, if needed
	if ( list.indexOf( lastItem ) < list.getChildren().length - 1 ) {
		tx = ve.dm.Transaction.newFromInsertion(
			doc, end, [{ 'type': '/list' }, list.getClonedElement()]
		);
		selection = tx.translateRange( selection );
		model.change( tx, selection );
	}
	// Unwrap the list
	tx = ve.dm.Transaction.newFromWrap( doc, new ve.Range( start, end ),
		[{ 'type': 'list' }], [], [{ 'type': 'listItem' }], []
	);
	selection = tx.translateRange( selection );
	model.change( tx, selection );
	return selection;
};

ve.FormatDropdownTool.prototype.onSelect = function ( item ) {
	var selected, prevList, firstInList, lastInList, i, contentBranch, listItem, txs,
		surfaceView = this.toolbar.getSurfaceView(),
		model = surfaceView.getModel(),
		selection = model.getSelection(),
		doc = model.getDocument();
	if ( item.type !== 'paragraph' ) {
		// We can't have headings or pre's in a list, so if we're trying to convert
		// things that are in lists to a heading or a pre, split the list
		selected = doc.selectNodes( selection, 'leaves' );
		for ( i = 0; i < selected.length; i++ ) {
			contentBranch = selected[i].node.isContent() ?
				selected[i].node.getParent() :
				selected[i].node;
			// Check if it's in a list
			listItem = contentBranch;
			while ( listItem && listItem.getType() !== 'listItem' ) {
				listItem = listItem.getParent();
			}
			if ( !listItem || listItem.getParent() !== prevList ) {
				// Not in a list or in a different list
				if ( prevList ) {
					// Split and unwrap prevList
					selection = ve.FormatDropdownTool.splitAndUnwrap(
						model, prevList, firstInList, lastInList, selection
					);
				}
				if ( listItem ) {
					prevList = listItem.getParent();
					firstInList = listItem;
					lastInList = firstInList;
				}
			} else {
				// This node is in the current list
				lastInList = listItem;
			}
		}
		if ( prevList ) {
			// Split and unwrap prevList
			selection = ve.FormatDropdownTool.splitAndUnwrap(
				model, prevList, firstInList, lastInList, selection
			);
		}
	}
	txs = ve.dm.Transaction.newFromContentBranchConversion(
		doc,
		selection,
		item.type,
		item.attributes
	);
	model.change( txs, selection );
	surfaceView.showSelection( selection );
};

ve.FormatDropdownTool.prototype.getMatchingMenuItems = function ( nodes ) {
	var i, j, nodeType, nodeAttributes, item, key,
		matches = [],
		items = this.menuView.getItems();
	for ( i = 0; i < nodes.length; i++ ) {
		nodeType = nodes[i].getType();
		nodeAttributes = nodes[i].getAttributes();
		// Outer loop continue point
		itemLoop:
		for ( j = 0; j < items.length; j++ ) {
			item = items[j];
			if ( item.type === nodeType ) {
				if ( item.attributes && nodeAttributes ) {
					// Compare attributes
					for ( key in item.attributes ) {
						if (
							// Node must have all the required attributes
							!( key in nodeAttributes ) ||
							// Use weak comparison because numbers sometimes come through as strings
							item.attributes[key] !== nodeAttributes[key]
						) {
							// Skip to the next menu item
							continue itemLoop;
						}
					}
				} else if ( item.attributes && !nodeAttributes ) {
					// Node is required to have certain attributes but doesn't
					// have any, so it doesn't match
					continue itemLoop;
				}
				matches.push( item );
			}
		}
	}
	return matches;
};

ve.FormatDropdownTool.prototype.updateState = function ( annotations, nodes ) {
	if ( nodes.length ) {
		var items = this.getMatchingMenuItems( nodes );
		if ( items.length === 1 ) {
			this.$label.text( items[0].label );
		} else {
			this.$label.html( '&nbsp;' );
		}
	}
};

/* Registration */

ve.ui.Tool.tools.format = {
	'constructor': ve.FormatDropdownTool,
	'name': 'format',
	'title': ve.msg( 'visualeditor-formatdropdown-title' )
};

/* Inheritance */

ve.extendClass( ve.FormatDropdownTool, ve.ui.DropdownTool );
