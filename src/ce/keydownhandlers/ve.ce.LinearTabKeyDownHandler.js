/*!
 * VisualEditor ContentEditable linear escape key down handler
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
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

OO.inheritClass( ve.ce.LinearTabKeyDownHandler, ve.ce.KeyDownHandler );

/* Static properties */

ve.ce.LinearTabKeyDownHandler.static.name = 'linearTab';

ve.ce.LinearTabKeyDownHandler.static.keys = [ OO.ui.Keys.TAB ];

ve.ce.LinearTabKeyDownHandler.static.supportedSelections = [ 'linear' ];

/* Static methods */

/**
 * @inheritdoc
 *
 * Handle tab key down events with a linear selection while table editing.
 */
ve.ce.LinearTabKeyDownHandler.static.execute = function ( surface, e ) {
	var activeTableNode = surface.getActiveNode() && surface.getActiveNode().findParent( ve.ce.TableNode );
	// Check we have an active table node and that we are inside a cell (editingFragment), and not just a caption
	if ( activeTableNode && activeTableNode.editingFragment ) {
		if ( e.ctrlKey || e.altKey || e.metaKey ) {
			// Support: Firefox
			// In Firefox, ctrl-tab to switch browser-tabs still triggers the
			// keydown event.
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		activeTableNode.setEditing( false );
		// If this was a merged cell, we're going to have unexpected behavior when the selection moves,
		// so preemptively collapse to the top-left point of the merged cell.
		surface.getModel().setSelection( surface.getModel().getSelection().collapseToStart() );
		ve.ce.TableArrowKeyDownHandler.static.moveTableSelection(
			surface,
			0, // Rows
			e.shiftKey ? -1 : 1, // Columns
			false, // Logical direction, not visual
			false, // Don't expand the current selection,
			true // Wrap to next/previous row
		);
		activeTableNode.setEditing( true );
		return true;
	}
	return false;
};

/* Registration */

ve.ce.keyDownHandlerFactory.register( ve.ce.LinearTabKeyDownHandler );
