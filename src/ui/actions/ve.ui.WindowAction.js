/*!
 * VisualEditor UserInterface WindowAction class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Window action.
 *
 * @class
 * @extends ve.ui.Action
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.WindowAction = function VeUiWindowAction( surface ) {
	// Parent constructor
	ve.ui.Action.call( this, surface );
};

/* Inheritance */

OO.inheritClass( ve.ui.WindowAction, ve.ui.Action );

/* Static Properties */

ve.ui.WindowAction.static.name = 'window';

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.ui.WindowAction.static.methods = [ 'open' ];

/* Methods */

/**
 * Open a window.
 *
 * @method
 * @param {string} name Symbolic name of window to open
 * @param {Object} [data] Window opening data
 */
ve.ui.WindowAction.prototype.open = function ( name, data ) {
	var windowManager,
		windowClass = ve.ui.windowFactory.lookup( name ),
		surface = this.surface,
		fragment = surface.getModel().getFragment( undefined, true ),
		dir = surface.getView().getDocument().getDirectionFromSelection( fragment.getSelection() ) ||
			surface.getModel().getDocument().getDir();

	data = ve.extendObject( { dir: dir }, data, { fragment: fragment } );

	if ( windowClass ) {
		if ( windowClass.prototype instanceof ve.ui.FragmentInspector ) {
			windowManager = surface.getContext().getInspectors();
			windowManager.openWindow( name, data );
		} else if ( windowClass.prototype instanceof OO.ui.Dialog ) {
			// For non-isolated dialogs, remove the selection and re-apply on close
			surface.getView().nativeSelection.removeAllRanges();
			windowManager = surface.getDialogs();
			windowManager.openWindow( name, data ).then( function ( opened ) {
				opened.then( function ( closing ) {
					closing.then( function () {
						// Check the dialog didn't modify the selection before restoring from fragment
						if ( surface.getModel().getSelection().isNull() ) {
							fragment.select();
						}
					} );
				} );
			} );
		}
	}
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.WindowAction );
