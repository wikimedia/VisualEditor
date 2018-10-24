/*!
 * VisualEditor ContentEditable table F2 key down handler
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * F2 key down handler for table selections.
 *
 * @class
 * @extends ve.ce.KeyDownHandler
 *
 * @constructor
 */
ve.ce.TableF2KeyDownHandler = function VeCeTableF2KeyDownHandler() {
	// Parent constructor - never called because class is fully static
	// ve.ui.TableF2KeyDownHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.TableF2KeyDownHandler, ve.ce.KeyDownHandler );

/* Static properties */

ve.ce.TableF2KeyDownHandler.static.name = 'tableF2';

ve.ce.TableF2KeyDownHandler.static.keys = [ OO.ui.Keys.F2 ];

ve.ce.TableF2KeyDownHandler.static.supportedSelections = [ 'table' ];

/* Static methods */

/**
 * @inheritdoc
 */
ve.ce.TableF2KeyDownHandler.static.execute = function ( surface, e ) {
	var selection = surface.getModel().getSelection(),
		tableNode = surface.documentView.getBranchNodeFromOffset( selection.tableRange.start + 1 );

	e.preventDefault();

	tableNode.setEditing( true );
	return true;
};

/* Registration */

ve.ce.keyDownHandlerFactory.register( ve.ce.TableF2KeyDownHandler );
