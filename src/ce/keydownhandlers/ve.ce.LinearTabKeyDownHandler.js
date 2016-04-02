/*!
 * VisualEditor ContentEditable linear escape key down handler
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Tab key down handler for linear selections.
 *
 * @class
 * @extends ve.ce.KeyDownHandler
 *
 * @constructor
 */
ve.ce.LinearTabKeyDownHandler = function VeCeLinearTabKeyDownHandler() {
	// Parent constructor
	ve.ui.LinearTabKeyDownHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.LinearTabKeyDownHandler, ve.ce.TableArrowKeyDownHandler );

/* Static properties */

ve.ce.LinearTabKeyDownHandler.static.name = 'linearTab';

ve.ce.LinearTabKeyDownHandler.static.keys = [ OO.ui.Keys.TAB ];

ve.ce.LinearTabKeyDownHandler.static.supportedSelections = [ 'linear' ];

/* Static methods */

/**
 * @inheritdoc
 *
 * Handle escape key down events with a linear selection while table editing.
 */
ve.ce.LinearTabKeyDownHandler.static.execute = function ( surface, e ) {
	var activeTableNode = surface.getActiveNode() && surface.getActiveNode().findParent( ve.ce.TableNode );
	if ( activeTableNode ) {
		e.preventDefault();
		e.stopPropagation();
		activeTableNode.setEditing( false );
		// if this was a merged cell, we're going to have unexpected behavior when the selection moves,
		// so preemptively collapse to the top-left point of the merged cell.
		surface.getModel().setSelection( surface.getModel().getSelection().collapseToStart() );
		ve.ce.LinearTabKeyDownHandler.static.moveTableSelection(
			surface,
			0, // rows
			e.shiftKey ? -1 : 1, // columns
			false, // logical direction, not visual
			false // don't expand the current selection
		);
		return true;
	}
	return false;
};

/* Registration */

ve.ce.keyDownHandlerFactory.register( ve.ce.LinearTabKeyDownHandler );
