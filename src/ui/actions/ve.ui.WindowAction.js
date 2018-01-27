/*!
 * VisualEditor UserInterface WindowAction class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Window action.
 *
 * @class
 * @extends ve.ui.Action
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.WindowAction = function VeUiWindowAction() {
	// Parent constructor
	ve.ui.WindowAction.super.apply( this, arguments );
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
ve.ui.WindowAction.static.methods = [ 'open', 'close', 'toggle' ];

/* Methods */

/**
 * Open a window.
 *
 * @method
 * @param {string} name Symbolic name of window to open
 * @param {Object} [data] Window opening data
 * @param {string} [action] Action to execute after opening, or immediately if the window is already open
 * @return {boolean} Action was executed
 */
ve.ui.WindowAction.prototype.open = function ( name, data, action ) {
	var currentInspector, inspectorWindowManager, fragmentPromise,
		originalFragment, text,
		windowAction = this,
		windowType = this.getWindowType( name ),
		windowManager = windowType && this.getWindowManager( windowType ),
		currentWindow = windowManager.getCurrentWindow(),
		autoClosePromises = [],
		surface = this.surface,
		fragment = surface.getModel().getFragment( undefined, true ),
		dir = surface.getView().getSelection().getDirection(),
		windowClass = ve.ui.windowFactory.lookup( name ),
		mayContainFragment = windowClass.prototype instanceof ve.ui.FragmentDialog ||
			windowClass.prototype instanceof ve.ui.FragmentInspector ||
			windowType === 'toolbar' || windowType === 'inspector',
		// TODO: Add 'doesHandleSource' method to factory
		sourceMode = surface.getMode() === 'source' && !windowClass.static.handlesSource;

	if ( !windowManager ) {
		return false;
	}

	if ( !mayContainFragment ) {
		fragmentPromise = $.Deferred().resolve().promise();
	} else if ( sourceMode ) {
		text = fragment.getText( true );
		originalFragment = fragment;

		fragmentPromise = fragment.convertFromSource( text ).then( function ( selectionDocument ) {
			var tempSurfaceModel = new ve.dm.Surface( selectionDocument ),
				tempFragment = tempSurfaceModel.getLinearFragment(
					// TODO: Select all content using content offset methods
					new ve.Range(
						1,
						Math.max( 1, selectionDocument.getDocumentRange().end - 1 )
					)
				);

			return tempFragment;
		} );
	} else {
		fragmentPromise = $.Deferred().resolve( fragment ).promise();
	}

	data = ve.extendObject( { dir: dir }, data, { $returnFocusTo: null } );

	if ( windowType === 'toolbar' || windowType === 'inspector' ) {
		data = ve.extendObject( data, { surface: surface } );
		// Auto-close the current window if it is different to the one we are
		// trying to open.
		// TODO: Make auto-close a window manager setting
		if ( currentWindow && currentWindow.constructor.static.name !== name ) {
			autoClosePromises.push( windowManager.closeWindow( currentWindow ).closed );
		}
	}

	// If we're opening a dialog, close all inspectors first
	if ( windowType === 'dialog' ) {
		inspectorWindowManager = windowAction.getWindowManager( 'inspector' );
		currentInspector = inspectorWindowManager.getCurrentWindow();
		if ( currentInspector ) {
			autoClosePromises.push( inspectorWindowManager.closeWindow( currentInspector ).closed );
		}
	}

	fragmentPromise.then( function ( fragment ) {
		ve.extendObject( data, { fragment: fragment } );

		$.when.apply( $, autoClosePromises ).always( function () {
			windowManager.getWindow( name ).then( function ( win ) {
				var instance = windowManager.openWindow( win, data );

				if ( sourceMode ) {
					win.sourceMode = sourceMode;
				}

				if ( !win.constructor.static.activeSurface ) {
					surface.getView().deactivate();
				}

				instance.opened.then( function () {
					if ( sourceMode ) {
						// HACK: previousSelection is assumed to be in the visible surface
						win.previousSelection = null;
					}
				} );
				instance.opened.always( function () {
					// This uses .always() so that the action is executed even if the window is already open
					// (in which case opening it again fails). Hopefully we'll never have a situation where
					// it's closed, the opening fails for some reason, and then weird things happen.
					if ( action ) {
						win.executeAction( action );
					}
				} );

				instance.closing.then( function () {
					if ( !win.constructor.static.activeSurface ) {
						surface.getView().activate();
					}
				} );

				instance.closed.then( function ( closedData ) {
					// Sequence-triggered window closed without action, undo
					if ( data.strippedSequence && !( closedData && closedData.action ) ) {
						surface.getModel().undo();
					}
					if ( sourceMode && fragment && fragment.getSurface().hasBeenModified() ) {
						// Action may be async, so we use auto select to ensure the content is selected
						originalFragment.setAutoSelect( true );
						originalFragment.insertDocument( fragment.getDocument() );
					}
					surface.getView().emit( 'position' );
				} );
			} );
		} );
	} );

	return true;
};

/**
 * Close a window
 *
 * @method
 * @param {string} name Symbolic name of window to open
 * @param {Object} [data] Window closing data
 * @return {boolean} Action was executed
 */
ve.ui.WindowAction.prototype.close = function ( name, data ) {
	var windowType = this.getWindowType( name ),
		windowManager = windowType && this.getWindowManager( windowType );

	if ( !windowManager ) {
		return false;
	}

	windowManager.closeWindow( name, data );
	return true;
};

/**
 * Toggle a window between open and close
 *
 * @method
 * @param {string} name Symbolic name of window to open or close
 * @param {Object} [data] Window opening or closing data
 * @return {boolean} Action was executed
 */
ve.ui.WindowAction.prototype.toggle = function ( name, data ) {
	var win,
		windowType = this.getWindowType( name ),
		windowManager = windowType && this.getWindowManager( windowType );

	if ( !windowManager ) {
		return false;
	}

	win = windowManager.getCurrentWindow();
	if ( !win || win.constructor.static.name !== name ) {
		this.open( name, data );
	} else {
		this.close( name, data );
	}
	return true;
};

/**
 * Get the specified window type
 *
 * @param {string} name Window name
 * @return {string|null} Window type: 'inspector', 'toolbar' or 'dialog'
 */
ve.ui.WindowAction.prototype.getWindowType = function ( name ) {
	var windowClass = ve.ui.windowFactory.lookup( name );
	if ( windowClass.prototype instanceof ve.ui.FragmentInspector ) {
		return 'inspector';
	} else if ( windowClass.prototype instanceof ve.ui.ToolbarDialog ) {
		return 'toolbar';
	} else if ( windowClass.prototype instanceof OO.ui.Dialog ) {
		return 'dialog';
	}
	return null;
};

/**
 * Get the window manager for a specified window type
 *
 * @param {Function} windowType Window type: 'inspector', 'toolbar', or 'dialog'
 * @return {ve.ui.WindowManager|null} Window manager
 */
ve.ui.WindowAction.prototype.getWindowManager = function ( windowType ) {
	switch ( windowType ) {
		case 'inspector':
			return this.surface.getContext().getInspectors();
		case 'toolbar':
			return this.surface.getToolbarDialogs();
		case 'dialog':
			return this.surface.getDialogs();
	}
	return null;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.WindowAction );
