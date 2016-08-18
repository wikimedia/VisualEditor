/*!
 * VisualEditor ContentEditable table arrow key down handler
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Arrow key down handler for table selections.
 *
 * @class
 * @extends ve.ce.KeyDownHandler
 *
 * @constructor
 */
ve.ce.TableArrowKeyDownHandler = function VeCeTableArrowKeyDownHandler() {
	// Parent constructor
	ve.ui.TableArrowKeyDownHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.TableArrowKeyDownHandler, ve.ce.KeyDownHandler );

/* Static properties */

ve.ce.TableArrowKeyDownHandler.static.name = 'tableArrow';

ve.ce.TableArrowKeyDownHandler.static.keys = [
	OO.ui.Keys.UP, OO.ui.Keys.DOWN, OO.ui.Keys.LEFT, OO.ui.Keys.RIGHT,
	OO.ui.Keys.END, OO.ui.Keys.HOME, OO.ui.Keys.PAGEUP, OO.ui.Keys.PAGEDOWN,
	OO.ui.Keys.TAB
];

ve.ce.TableArrowKeyDownHandler.static.supportedSelections = [ 'table' ];

/* Static methods */

/**
 * @inheritdoc
 */
ve.ce.TableArrowKeyDownHandler.static.execute = function ( surface, e ) {
	var wrap = false,
		checkDir = false,
		colOffset = 0,
		rowOffset = 0,
		expand = e.shiftKey;

	switch ( e.keyCode ) {
		case OO.ui.Keys.LEFT:
			colOffset = -1;
			checkDir = true;
			break;
		case OO.ui.Keys.RIGHT:
			colOffset = 1;
			checkDir = true;
			break;
		case OO.ui.Keys.UP:
			rowOffset = -1;
			break;
		case OO.ui.Keys.DOWN:
			rowOffset = 1;
			break;
		case OO.ui.Keys.HOME:
			colOffset = -Infinity;
			break;
		case OO.ui.Keys.END:
			colOffset = Infinity;
			break;
		case OO.ui.Keys.PAGEUP:
			rowOffset = -Infinity;
			break;
		case OO.ui.Keys.PAGEDOWN:
			rowOffset = Infinity;
			break;
		case OO.ui.Keys.TAB:
			colOffset = e.shiftKey ? -1 : 1;
			expand = false; // shift-tab is a movement, not an expansion
			wrap = true;
			break;
	}

	e.preventDefault();

	this.moveTableSelection( surface, rowOffset, colOffset, checkDir, expand, wrap );
};

/**
 * @param {ve.ce.Surface} surface Surface
 * @param {number} rowOffset how many rows to move
 * @param {number} colOffset how many columns to move
 * @param {boolean} checkDir whether to translate offsets according to ltr settings
 * @param {boolean} expand whether to expand the selection or replace it
 * @param {boolean} wrap Wrap to the next/previous row at edges, insert new row at end
 */
ve.ce.TableArrowKeyDownHandler.static.moveTableSelection = function ( surface, rowOffset, colOffset, checkDir, expand, wrap ) {
	var tableNode, newSelection,
		selection = surface.getModel().getSelection();
	if ( colOffset && checkDir ) {
		tableNode = surface.documentView.getBranchNodeFromOffset( selection.tableRange.start + 1 );
		if ( tableNode.$element.css( 'direction' ) !== 'ltr' ) {
			colOffset *= -1;
		}
	}
	if ( !expand && !selection.isSingleCell() ) {
		selection = selection.collapseToFrom();
	}

	function adjust() {
		newSelection = selection.newFromAdjustment(
			expand ? 0 : colOffset,
			expand ? 0 : rowOffset,
			colOffset,
			rowOffset,
			wrap
		);
	}

	adjust();

	// If wrapping forwards didn't move, we must be at the end of the table,
	// so insert a new row and try again
	if ( wrap && colOffset > 0 && selection.equals( newSelection ) ) {
		surface.getSurface().execute( 'table', 'insert', 'row', 'after' );
		selection = surface.getModel().getSelection();
		adjust();
	}

	surface.getModel().setSelection( newSelection );

	return true;
};

/* Registration */

ve.ce.keyDownHandlerFactory.register( ve.ce.TableArrowKeyDownHandler );
