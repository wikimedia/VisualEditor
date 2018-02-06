/*!
 * VisualEditor ContentEditable table enter key down handler
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Enter key down handler for table selections.
 *
 * @class
 * @extends ve.ce.KeyDownHandler
 *
 * @constructor
 */
ve.ce.TableEnterKeyDownHandler = function VeCeTableEnterKeyDownHandler() {
	// Parent constructor
	ve.ui.TableEnterKeyDownHandler.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.TableEnterKeyDownHandler, ve.ce.KeyDownHandler );

/* Static properties */

ve.ce.TableEnterKeyDownHandler.static.name = 'tableEnter';

ve.ce.TableEnterKeyDownHandler.static.keys = [ OO.ui.Keys.ENTER ];

ve.ce.TableEnterKeyDownHandler.static.supportedSelections = [ 'table' ];

/* Static methods */

/**
 * @inheritdoc
 */
ve.ce.TableEnterKeyDownHandler.static.execute = function ( surface, e ) {
	var selection = surface.getModel().getSelection(),
		tableNode = surface.documentView.getBranchNodeFromOffset( selection.tableRange.start + 1 );

	e.preventDefault();

	if ( e.ctrlKey || e.metaKey ) {
		// CTRL+Enter emits a 'submit' event from the surface
		surface.getSurface().emit( 'submit' );
		return true;
	}

	tableNode.setEditing( true );
	return true;
};

/* Registration */

ve.ce.keyDownHandlerFactory.register( ve.ce.TableEnterKeyDownHandler );
