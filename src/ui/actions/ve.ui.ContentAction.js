/*!
 * VisualEditor UserInterface ContentAction class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Content action.
 *
 * @class
 * @extends ve.ui.Action
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.ContentAction = function VeUiContentAction() {
	// Parent constructor
	ve.ui.ContentAction.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.ContentAction, ve.ui.Action );

/* Static Properties */

ve.ui.ContentAction.static.name = 'content';

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.ui.ContentAction.static.methods = [ 'insert', 'remove', 'select', 'pasteSpecial', 'selectAll', 'changeDirectionality' ];

/* Methods */

/**
 * Insert content.
 *
 * @method
 * @param {string|Array} content Content to insert, can be either a string or array of data
 * @param {boolean} [annotate] Content should be automatically annotated to match surrounding content
 * @param {boolean} [collapseToEnd] Collapse selection to end after inserting
 * @return {boolean} Action was executed
 */
ve.ui.ContentAction.prototype.insert = function ( content, annotate, collapseToEnd ) {
	var fragment = this.surface.getModel().getFragment();
	fragment.insertContent( content, annotate );
	if ( collapseToEnd ) {
		fragment.collapseToEnd().select();
	}
	return true;
};

/**
 * Remove content.
 *
 * @method
 * @param {string} [key] Trigger remove as if a key were pressed, either 'backspace' or 'delete'
 * @return {boolean} Action was executed
 */
ve.ui.ContentAction.prototype.remove = function ( key ) {
	var e, defaultPrevented = false;
	if ( key ) {
		e = {
			keyCode: key === 'delete' ? OO.ui.Keys.DELETE : OO.ui.Keys.BACKSPACE,
			preventDefault: function () {
				defaultPrevented = true;
			}
		};
		ve.ce.keyDownHandlerFactory.executeHandlersForKey(
			e.keyCode,
			this.surface.getModel().getSelection().getName(),
			this.surface.getView(),
			e
		);
		return defaultPrevented;
	} else {
		this.surface.getModel().getFragment().removeContent();
		return true;
	}
};

/**
 * Select content.
 *
 * @method
 * @param {ve.dm.Selection} selection Selection
 * @return {boolean} Action was executed
 */
ve.ui.ContentAction.prototype.select = function ( selection ) {
	this.surface.getModel().setSelection( selection );
	return true;
};

/**
 * Select all content.
 *
 * @method
 * @return {boolean} Action was executed
 */
ve.ui.ContentAction.prototype.selectAll = function () {
	this.surface.getView().selectAll();
	return true;
};

/**
 * Paste special.
 *
 * @method
 * @return {boolean} Action was executed
 */
ve.ui.ContentAction.prototype.pasteSpecial = function () {
	this.surface.getView().pasteSpecial = true;
	// Return false to allow the paste event to occur
	return false;
};

/**
 * Change directionality
 *
 * @method
 * @return {boolean} Action was executed
 */
ve.ui.ContentAction.prototype.changeDirectionality = function () {
	var documentView = this.surface.getView().getDocument();
	documentView.setDir( documentView.getDir() === 'ltr' ? 'rtl' : 'ltr' );
	this.surface.getModel().emit( 'contextChange' );
	this.surface.getView().emit( 'position' );
	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.ContentAction );
