/*!
 * VisualEditor ContentEditable TableNode class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable table node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.TableNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.TableNode = function VeCeTableNode() {
	// Parent constructor
	ve.ce.TableNode.super.apply( this, arguments );

	// Properties
	this.surface = null;
	this.active = false;
	this.startCell = null;
	// Stores the original table selection as
	// a fragment when entering cell edit mode
	this.editingFragment = null;

	// DOM changes
	this.$element
		.addClass( 've-ce-tableNode' )
		.prop( 'contentEditable', 'false' );
};

/* Inheritance */

OO.inheritClass( ve.ce.TableNode, ve.ce.BranchNode );

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.TableNode.prototype.onSetup = function () {
	// Parent method
	ve.ce.TableNode.super.prototype.onSetup.call( this );

	// Exit if already setup or not attached
	if ( this.isSetup || !this.root ) {
		return;
	}
	this.surface = this.getRoot().getSurface();

	// Overlay
	this.$selectionBox = $( '<div>' ).addClass( 've-ce-tableNodeOverlay-selection-box' );
	this.$selectionBoxAnchor = $( '<div>' ).addClass( 've-ce-tableNodeOverlay-selection-box-anchor' );
	this.colContext = new ve.ui.TableLineContext( this, 'col' );
	this.rowContext = new ve.ui.TableLineContext( this, 'row' );

	this.$overlay = $( '<div>' )
		.addClass( 've-ce-tableNodeOverlay oo-ui-element-hidden' )
		.append( [
			this.$selectionBox,
			this.$selectionBoxAnchor,
			this.colContext.$element,
			this.rowContext.$element,
			this.$rowBracket,
			this.$colBracket
		] );
	this.surface.surface.$blockers.append( this.$overlay );

	// Events
	this.$element.on( {
		'mousedown.ve-ce-tableNode': this.onTableMouseDown.bind( this ),
		'dblclick.ve-ce-tableNode': this.onTableDblClick.bind( this )
	} );
	this.$overlay.on( {
		'mousedown.ve-ce-tableNode': this.onTableMouseDown.bind( this ),
		'dblclick.ve-ce-tableNode': this.onTableDblClick.bind( this )
	} );
	this.onTableMouseUpHandler = this.onTableMouseUp.bind( this );
	this.onTableMouseMoveHandler = this.onTableMouseMove.bind( this );
	// Select and position events both fire updateOverlay, so debounce. Also makes
	// sure that this.selectedRectangle is up to date before redrawing.
	this.updateOverlayDebounced = ve.debounce( this.updateOverlay.bind( this ) );
	this.surface.getModel().connect( this, { select: 'onSurfaceModelSelect' } );
	this.surface.connect( this, { position: this.updateOverlayDebounced } );
};

/**
 * @inheritdoc
 */
ve.ce.TableNode.prototype.onTeardown = function () {
	// Parent method
	ve.ce.TableNode.super.prototype.onTeardown.call( this );
	// Events
	this.$element.off( '.ve-ce-tableNode' );
	this.$overlay.off( '.ve-ce-tableNode' );
	this.surface.getModel().disconnect( this );
	this.surface.disconnect( this );
	this.$overlay.remove();
};

/**
 * Handle table double click events
 *
 * @param {jQuery.Event} e Double click event
 */
ve.ce.TableNode.prototype.onTableDblClick = function ( e ) {
	var offset;
	if ( !this.getCellNodeFromEvent( e ) ) {
		return;
	}
	if ( this.surface.getModel().getSelection() instanceof ve.dm.TableSelection ) {
		// Don't change selection in setEditing to avoid scrolling to bottom of cell
		this.setEditing( true, true );
		// getOffsetFromEventCoords doesn't work in ce=false in Firefox, so ensure
		// this is called after setEditing( true ).
		offset = this.surface.getOffsetFromEventCoords( e.originalEvent );
		if ( offset !== -1 ) {
			// Set selection to where the double click happened
			this.surface.getModel().setLinearSelection( new ve.Range( offset ) );
		} else {
			this.setEditing( true );
		}
	}
};

/**
 * Handle mouse down or touch start events
 *
 * @param {jQuery.Event} e Mouse down or touch start event
 */
ve.ce.TableNode.prototype.onTableMouseDown = function ( e ) {
	var cellNode, startCell, endCell, selection, newSelection,
		node = this;

	cellNode = this.getCellNodeFromEvent( e );
	if ( !cellNode ) {
		return;
	}

	// Right-click
	if ( e.which === 3 ) {
		// Select the cell to the browser renders the correct context menu
		ve.selectElement( cellNode.$element[ 0 ] );
		setTimeout( function () {
			// Trigger onModelSelect to restore the selection
			node.surface.onModelSelect();
		} );
		return;
	}

	endCell = this.getModel().getMatrix().lookupCell( cellNode.getModel() );
	if ( !endCell ) {
		e.preventDefault();
		return;
	}
	selection = this.surface.getModel().getSelection();
	startCell = e.shiftKey && this.active ? { col: selection.fromCol, row: selection.fromRow } : endCell;
	newSelection = new ve.dm.TableSelection(
		this.getModel().getDocument(),
		this.getModel().getOuterRange(),
		startCell.col,
		startCell.row,
		endCell.col,
		endCell.row,
		true
	);
	if ( this.editingFragment ) {
		if ( newSelection.equals( this.editingFragment.getSelection() ) ) {
			// Clicking on the editing cell, don't prevent default
			return;
		} else {
			this.setEditing( false, true );
		}
	}
	this.surface.getModel().setSelection( newSelection );
	this.startCell = startCell;
	this.surface.$document.on( {
		'mouseup touchend': this.onTableMouseUpHandler,
		'mousemove touchmove': this.onTableMouseMoveHandler
	} );
	e.preventDefault();
};

/**
 * Get a table cell node from a mouse event
 *
 * Works around various issues with touch events and browser support.
 *
 * @param {jQuery.Event} e Mouse event
 * @return {ve.ce.TableCellNode|null} Table cell node
 */
ve.ce.TableNode.prototype.getCellNodeFromEvent = function ( e ) {
	var touch, cellNode;

	// 'touchmove' doesn't give a correct e.target, so calculate it from coordinates
	if ( e.type === 'touchstart' && e.originalEvent.touches.length > 1 ) {
		// Ignore multi-touch
		return null;
	} else if ( e.type === 'touchmove' ) {
		if ( e.originalEvent.touches.length > 1 ) {
			// Ignore multi-touch
			return null;
		}
		touch = e.originalEvent.touches[ 0 ];
		return this.getCellNodeFromPoint( touch.clientX, touch.clientY );
	} else if ( OO.ui.contains( this.$overlay[ 0 ], e.target, true ) ) {
		// Support: IE<=10
		// Browsers which don't support pointer-events:none will still fire events
		// on the overlay. Hide the overlay and get the target from the event coords.
		this.$overlay.addClass( 'oo-ui-element-hidden' );
		cellNode = this.getCellNodeFromPoint( e.clientX, e.clientY );
		this.$overlay.removeClass( 'oo-ui-element-hidden' );
		return cellNode;
	} else {
		return this.getNearestCellNode( e.target );
	}
};

/**
 * Get the cell node from a point
 *
 * @param {number} x X offset
 * @param {number} y Y offset
 * @return {ve.ce.TableCellNode|null} Table cell node, or null if none found
 */
ve.ce.TableNode.prototype.getCellNodeFromPoint = function ( x, y ) {
	return this.getNearestCellNode(
		this.surface.getElementDocument().elementFromPoint( x, y )
	);
};

/**
 * Get the nearest cell node in this table to an element
 *
 * If the nearest cell node is in another table, return null.
 *
 * @param {HTMLElement} element Element target to find nearest cell node to
 * @return {ve.ce.TableCellNode|null} Table cell node, or null if none found
 */
ve.ce.TableNode.prototype.getNearestCellNode = function ( element ) {
	var $element = $( element ),
		$table = $element.closest( 'table' );

	// Nested table, ignore
	if ( !this.$element.is( $table ) ) {
		return null;
	}

	return $element.closest( 'td, th' ).data( 'view' );
};

/**
 * Handle mouse/touch move events
 *
 * @param {jQuery.Event} e Mouse/touch move event
 */
ve.ce.TableNode.prototype.onTableMouseMove = function ( e ) {
	var cell, selection, cellNode;

	cellNode = this.getCellNodeFromEvent( e );
	if ( !cellNode ) {
		return;
	}

	cell = this.getModel().matrix.lookupCell( cellNode.getModel() );
	if ( !cell ) {
		return;
	}

	selection = new ve.dm.TableSelection(
		this.getModel().getDocument(),
		this.getModel().getOuterRange(),
		this.startCell.col, this.startCell.row, cell.col, cell.row,
		true
	);
	this.surface.getModel().setSelection( selection );
};

/**
 * Handle mouse up or touch end events
 *
 * @param {jQuery.Event} e Mouse up or touch end event
 */
ve.ce.TableNode.prototype.onTableMouseUp = function () {
	this.startCell = null;
	this.surface.$document.off( {
		'mouseup touchend': this.onTableMouseUpHandler,
		'mousemove touchmove': this.onTableMouseMoveHandler
	} );
};

/**
 * Set the editing state of the table
 *
 * @param {boolean} isEditing The table is being edited
 * @param {boolean} noSelect Don't change the selection
 */
ve.ce.TableNode.prototype.setEditing = function ( isEditing, noSelect ) {
	var cell, offset, cellRange, profile, activeCellNode,
		surfaceModel = this.surface.getModel(),
		selection = surfaceModel.getSelection();

	if ( isEditing ) {
		if ( !selection.isSingleCell() ) {
			selection = selection.collapseToFrom();
			this.surface.getModel().setSelection( selection );
		}
		cell = this.getCellNodesFromSelection( selection )[ 0 ];
		if ( !cell.isCellEditable() ) {
			return;
		}
		this.editingFragment = this.surface.getModel().getFragment( selection );
		cell.setEditing( true );
		if ( !noSelect ) {
			cellRange = cell.getModel().getRange();
			offset = surfaceModel.getDocument().data.getNearestContentOffset( cellRange.end, -1 );
			if ( offset > cellRange.start ) {
				surfaceModel.setLinearSelection( new ve.Range( offset ) );
			}
		}
	} else if ( ( activeCellNode = this.getActiveCellNode() ) ) {
		activeCellNode.setEditing( false );
		if ( !noSelect ) {
			surfaceModel.setSelection( this.editingFragment.getSelection() );
		}
		this.editingFragment = null;
	}

	this.$element.toggleClass( 've-ce-tableNode-editing', isEditing );
	// Support: Firefox 39
	// HACK T103035: Firefox 39 has a regression in which clicking on a ce=false table
	// always selects the entire table, even if you click in a ce=true child.
	// Making the table ce=true does allow the user to make selections across cells
	// and corrupt the table in some circumstance, so restrict this hack as much
	// as possible.
	profile = $.client.profile();
	if ( profile.layout === 'gecko' && profile.versionBase === '39' ) {
		this.$element.prop( 'contentEditable', isEditing.toString() );
	}
	this.$overlay.toggleClass( 've-ce-tableNodeOverlay-editing', isEditing );
	// Support: IE<=10
	// If the browser doesn't support pointer-events:none, hide the selection boxes.
	if ( !this.surface.supportsPointerEvents() ) {
		this.$selectionBox.toggleClass( 'oo-ui-element-hidden', isEditing );
		this.$selectionBoxAnchor.toggleClass( 'oo-ui-element-hidden', isEditing );
	}
};

/**
 * Handle select events from the surface model.
 *
 * @param {ve.dm.Selection} selection Selection
 */
ve.ce.TableNode.prototype.onSurfaceModelSelect = function ( selection ) {
	// The table is active if there is a linear selection inside a cell being edited
	// or a table selection matching this table.
	var active = (
			this.editingFragment !== null &&
			selection instanceof ve.dm.LinearSelection &&
			this.editingFragment.getSelection().getRanges()[ 0 ].containsRange( selection.getRange() )
		) ||
		(
			selection instanceof ve.dm.TableSelection &&
			selection.tableRange.equalsSelection( this.getModel().getOuterRange() )
		);

	if ( active ) {
		if ( !this.active ) {
			this.$overlay.removeClass( 'oo-ui-element-hidden' );
			// Only register touchstart event after table has become active to prevent
			// accidental focusing of the table while scrolling
			this.$element.on( 'touchstart.ve-ce-tableNode', this.onTableMouseDown.bind( this ) );
		}
		// Ignore update the overlay if the table selection changed, i.e. not an in-cell selection change
		if ( selection instanceof ve.dm.TableSelection ) {
			this.updateOverlayDebounced( true  );
		}
	} else if ( !active && this.active ) {
		this.$overlay.addClass( 'oo-ui-element-hidden' );
		if ( this.editingFragment ) {
			this.setEditing( false, true );
		}
		// When the table of the active node is deactivated, clear the active node
		if ( this.getActiveCellNode() ) {
			this.surface.setActiveNode( null );
		}
		this.$element.off( 'touchstart.ve-ce-tableNode' );
	}
	this.$element.toggleClass( 've-ce-tableNode-active', active );
	this.active = active;
};

/**
 * Get the active node in this table, if it has one
 *
 * @return {ve.ce.TableNode|null} The active cell node in this table
 */
ve.ce.TableNode.prototype.getActiveCellNode = function () {
	var activeNode = this.surface.getActiveNode(),
		tableNodeOfActiveCellNode = activeNode && activeNode instanceof ve.ce.TableCellNode && activeNode.findParent( ve.ce.TableNode );

	return tableNodeOfActiveCellNode === this ? activeNode : null;
};

/**
 * Update the overlay positions
 *
 * @param {boolean} selectionChanged The update was triggered by a selection change
 */
ve.ce.TableNode.prototype.updateOverlay = function ( selectionChanged ) {
	var i, l, anchorNode, anchorOffset, selectionOffset, selection, selectionRect, tableOffset, surfaceOffset, cells,
		editable = true;

	if ( !this.active || !this.root ) {
		return;
	}

	selection = this.editingFragment ?
		this.editingFragment.getSelection() :
		this.surface.getModel().getSelection();
	// getBoundingClientRect is more accurate but must be used consistently
	// due to the iOS7 bug where it is relative to the document.
	tableOffset = this.getFirstSectionNode().$element[ 0 ].getBoundingClientRect();
	surfaceOffset = this.surface.getSurface().$element[ 0 ].getBoundingClientRect();

	if ( !tableOffset ) {
		return;
	}

	selectionRect = this.surface.getSelection( selection ).getSelectionBoundingRect();

	if ( !selectionRect ) {
		return;
	}

	cells = selection.getMatrixCells();
	anchorNode = this.getCellNodesFromSelection( selection.collapseToFrom() )[ 0 ];
	anchorOffset = ve.translateRect( anchorNode.$element[ 0 ].getBoundingClientRect(), -tableOffset.left, -tableOffset.top );

	// Compute a bounding box for the given cell elements
	for ( i = 0, l = cells.length; i < l; i++ ) {
		if ( editable && !cells[ i ].node.isCellEditable() ) {
			editable = false;
		}
	}

	selectionOffset = ve.translateRect(
		selectionRect,
		surfaceOffset.left - tableOffset.left, surfaceOffset.top - tableOffset.top
	);

	// Resize controls
	this.$selectionBox.css( {
		top: selectionOffset.top,
		left: selectionOffset.left,
		width: selectionOffset.width,
		height: selectionOffset.height
	} );
	this.$selectionBoxAnchor.css( {
		top: anchorOffset.top,
		left: anchorOffset.left,
		width: anchorOffset.width,
		height: anchorOffset.height
	} );

	// Position controls
	this.$overlay.css( {
		top: tableOffset.top - surfaceOffset.top,
		left: tableOffset.left - surfaceOffset.left,
		width: tableOffset.width
	} );
	this.colContext.$element.css( {
		left: selectionOffset.left
	} );
	this.colContext.indicator.$element.css( {
		width: selectionOffset.width
	} );
	this.colContext.popup.$element.css( {
		'margin-left': selectionOffset.width / 2
	} );
	this.rowContext.$element.css( {
		top: selectionOffset.top
	} );
	this.rowContext.indicator.$element.css( {
		height: selectionOffset.height
	} );
	this.rowContext.popup.$element.css( {
		'margin-top': selectionOffset.height / 2
	} );

	// Classes
	this.$selectionBox
		.toggleClass( 've-ce-tableNodeOverlay-selection-box-fullRow', selection.isFullRow() )
		.toggleClass( 've-ce-tableNodeOverlay-selection-box-fullCol', selection.isFullCol() )
		.toggleClass( 've-ce-tableNodeOverlay-selection-box-notEditable', !editable );

	if ( selectionChanged ) {
		ve.scrollIntoView( this.$selectionBox.get( 0 ) );
	}
};

/**
 * Get the first section node of the table, skipping over any caption nodes
 *
 * @return {ve.ce.TableSectionNode} First table section node
 */
ve.ce.TableNode.prototype.getFirstSectionNode = function () {
	var i = 0;
	while ( !( this.children[ i ] instanceof ve.ce.TableSectionNode ) ) {
		i++;
	}
	return this.children[ i ];
};

/**
 * Get a cell node from a single cell selection
 *
 * @param {ve.dm.TableSelection} selection Single cell table selection
 * @return {ve.ce.TableCellNode[]} Cell nodes
 */
ve.ce.TableNode.prototype.getCellNodesFromSelection = function ( selection ) {
	var i, l, cellModel, cellView,
		cells = selection.getMatrixCells(),
		nodes = [];

	for ( i = 0, l = cells.length; i < l; i++ ) {
		cellModel = cells[ i ].node;
		cellView = this.getNodeFromOffset( cellModel.getOffset() - this.model.getOffset() );
		nodes.push( cellView );
	}
	return nodes;
};

/* Static Properties */

ve.ce.TableNode.static.name = 'table';

ve.ce.TableNode.static.tagName = 'table';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableNode );
