/*!
 * VisualEditor ContentEditable table arrow key down handler
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
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
	OO.ui.Keys.END, OO.ui.Keys.HOME, OO.ui.Keys.PAGEUP, OO.ui.Keys.PAGEDOWN
];

ve.ce.TableArrowKeyDownHandler.static.supportedSelections = [ 'table' ];

/* Static methods */

/**
 * @inheritdoc
 */
ve.ce.TableArrowKeyDownHandler.static.execute = function ( surface, e ) {
	var tableNode, newSelection,
		checkDir = false,
		selection = surface.getModel().getSelection(),
		colOffset = 0,
		rowOffset = 0;

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
	}

	e.preventDefault();

	if ( colOffset && checkDir ) {
		tableNode = surface.documentView.getBranchNodeFromOffset( selection.tableRange.start + 1 );
		if ( tableNode.$element.css( 'direction' ) !== 'ltr' ) {
			colOffset *= -1;
		}
	}
	if ( !e.shiftKey && !selection.isSingleCell() ) {
		selection = selection.collapseToFrom();
	}
	newSelection = selection.newFromAdjustment(
		e.shiftKey ? 0 : colOffset,
		e.shiftKey ? 0 : rowOffset,
		colOffset,
		rowOffset
	);
	surface.getModel().setSelection( newSelection );

	return true;
};

/* Registration */

ve.ce.keyDownHandlerFactory.register( ve.ce.TableArrowKeyDownHandler );
