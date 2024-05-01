/*!
 * VisualEditor UserInterface WindowAction class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Window action.
 *
 * @class
 * @extends ve.ui.Action
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 * @param {string} [source]
 */
ve.ui.WindowAction = function VeUiWindowAction() {
	// Parent constructor
	ve.ui.WindowAction.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.WindowAction, ve.ui.Action );

/* Static Properties */

ve.ui.WindowAction.static.name = 'window';

ve.ui.WindowAction.static.methods = [ 'open', 'close', 'toggle' ];

/* Methods */

/**
 * Open a window.
 *
 * @param {string} name Symbolic name of window to open
 * @param {Object} [data] Window opening data
 * @param {string} [action] Action to execute after opening, or immediately if the window is already open
 * @return {boolean|jQuery.Promise} Action was executed; if a Promise, it'll resolve once the action is finished executing
 */
ve.ui.WindowAction.prototype.open = function ( name, data, action ) {
	data = data || {};
	const windowType = this.getWindowType( name ),
		windowManager = this.getWindowManager( windowType ),
		currentWindow = windowManager.getCurrentWindow(),
		autoClosePromises = [],
		surface = this.surface,
		surfaceFragment = data.fragment || surface.getModel().getFragment( undefined, true ),
		dir = surface.getView().getSelectionDirectionality(),
		windowClass = ve.ui.windowFactory.lookup( name ),
		isFragmentWindow = !!windowClass.prototype.getFragment,
		mayRequireFragment = isFragmentWindow ||
			// HACK: Pass fragment to toolbar dialogs as well
			windowType.name === 'toolbar',
		// TODO: Add 'doesHandleSource' method to factory
		sourceMode = surface.getMode() === 'source' && !windowClass.static.handlesSource,
		openDeferred = ve.createDeferred(),
		openPromise = openDeferred.promise();

	ve.track(
		'activity.' + name,
		{ action: 'window-open-from-' + ( this.source || 'command' ) }
	);

	if ( !windowManager ) {
		return false;
	}

	let fragmentPromise;
	let originalFragment;
	if ( !mayRequireFragment ) {
		fragmentPromise = ve.createDeferred().resolve().promise();
	} else if ( sourceMode ) {
		const text = surfaceFragment.getText( true );
		originalFragment = surfaceFragment;

		fragmentPromise = surfaceFragment.convertFromSource( text ).then( ( selectionDocument ) => {
			const tempSurfaceModel = new ve.dm.Surface( selectionDocument ),
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
		fragmentPromise = ve.createDeferred().resolve( surfaceFragment ).promise();
	}

	data = ve.extendObject( { dir: dir }, data, { surface: surface, $returnFocusTo: null } );

	if ( windowType.name === 'toolbar' || windowType.name === 'inspector' ) {
		// Auto-close the current window if it is different to the one we are
		// trying to open.
		// TODO: Make auto-close a window manager setting
		if ( currentWindow && currentWindow.constructor.static.name !== name ) {
			autoClosePromises.push( windowManager.closeWindow( currentWindow ).closed );
		}
	}

	// If we're opening a dialog, close all inspectors first
	if ( windowType.name === 'dialog' ) {
		const inspectorWindowManager = this.getWindowManager( { name: 'inspector' } );
		const currentInspector = inspectorWindowManager.getCurrentWindow();
		if ( currentInspector ) {
			autoClosePromises.push( inspectorWindowManager.closeWindow( currentInspector ).closed );
		}
	}

	fragmentPromise.then( ( fragment ) => {
		ve.extendObject( data, { fragment: fragment } );

		ve.promiseAll( autoClosePromises ).always( () => {
			windowManager.getWindow( name ).then( ( win ) => {
				const instance = windowManager.openWindow( win, data );

				if ( sourceMode ) {
					win.sourceMode = sourceMode;
				}

				if ( !win.constructor.static.activeSurface ) {
					surface.getView().deactivate( false );
				}

				instance.opened.then( () => {
					if ( sourceMode ) {
						// HACK: initialFragment/previousSelection is assumed to be in the visible surface
						win.initialFragment = null;
						win.previousSelection = null;
					}
				} );
				instance.opened.always( () => {
					// This uses .always() so that the action is executed even if the window is already open
					// (in which case opening it again fails). Hopefully we'll never have a situation where
					// it's closed, the opening fails for some reason, and then weird things happen.
					if ( action ) {
						win.executeAction( action );
					}
					openDeferred.resolve( instance );
				} );

				if ( !win.constructor.static.activeSurface ) {
					windowManager.once( 'closing', () => {
						// Collapsed mobile selection: We need to re-activate the surface in case an insertion
						// annotation was generated. We also need to do it during the same event cycle otherwise
						// the device may not open the virtual keyboard, so use the 'closing' event. (T203517)
						if ( OO.ui.isMobile() && surface.getModel().getSelection().isCollapsed() ) {
							surface.getView().activate();
						} else {
							// Otherwise use the `closed` promise to wait until the dialog has performed its actions,
							// such as creating new annotations or moving focus, before re-activating.
							instance.closed.then( () => {
								// Don't activate if mobile and expanded
								if ( !( OO.ui.isMobile() && !surface.getModel().getSelection().isCollapsed() ) ) {
									surface.getView().activate();
								}
							} );
						}
					} );
				}

				instance.closed.then( ( closedData ) => {
					// Sequence-triggered window closed without action, undo
					if ( data.strippedSequence && !( closedData && closedData.action ) ) {
						surface.getModel().undo();
						// Prevent redoing (which would remove the typed text)
						surface.getModel().truncateUndoStack();
						surface.getModel().emit( 'history' );
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

	return openPromise;
};

/**
 * Close a window
 *
 * @param {string} name Symbolic name of window to open
 * @param {Object} [data] Window closing data
 * @return {boolean} Action was executed
 */
ve.ui.WindowAction.prototype.close = function ( name, data ) {
	const windowType = this.getWindowType( name ),
		windowManager = this.getWindowManager( windowType );

	if ( !windowManager ) {
		return false;
	}

	windowManager.closeWindow( name, data );
	return true;
};

/**
 * Toggle a window between open and close
 *
 * @param {string} name Symbolic name of window to open or close
 * @param {Object} [data] Window opening or closing data
 * @return {boolean} Action was executed
 */
ve.ui.WindowAction.prototype.toggle = function ( name, data ) {
	const windowType = this.getWindowType( name ),
		windowManager = this.getWindowManager( windowType );

	if ( !windowManager ) {
		return false;
	}

	const win = windowManager.getCurrentWindow();
	if ( !win || win.constructor.static.name !== name ) {
		this.open( name, data );
	} else {
		this.close( name, data );
	}
	return true;
};

/**
 * @typedef {Object} WindowType
 * @memberof ve.ui.WindowAction
 * @property {string|null} name Window name ('inspector', 'toolbar', 'dialog' or null)
 * @property {string} [position] Window position (for toolbar dialogs)
 */

/**
 * Get the specified window type
 *
 * @param {string} name Window name
 * @return {ve.ui.WindowAction.WindowType}
 */
ve.ui.WindowAction.prototype.getWindowType = function ( name ) {
	const windowClass = ve.ui.windowFactory.lookup( name );
	if ( !windowClass ) {
		throw new Error( 'No window class registered with the name "' + name + '"' );
	}
	if ( windowClass.prototype instanceof ve.ui.FragmentInspector ) {
		return { name: 'inspector' };
	} else if ( windowClass.prototype instanceof ve.ui.ToolbarDialog ) {
		return {
			name: 'toolbar',
			position: windowClass.static.position
		};
	} else if ( windowClass.prototype instanceof OO.ui.Dialog ) {
		return { name: 'dialog' };
	}
	return { name: null };
};

/**
 * Get the window manager for a specified window type
 *
 * @param {ve.ui.WindowAction.WindowType} windowType Window type object. See #getWindowType
 * @return {ve.ui.WindowManager|null} Window manager
 */
ve.ui.WindowAction.prototype.getWindowManager = function ( windowType ) {
	switch ( windowType.name ) {
		case 'inspector':
			return this.surface.getContext().getInspectors();
		case 'toolbar':
			return this.surface.getToolbarDialogs( windowType.position );
		case 'dialog':
			return this.surface.getDialogs();
	}
	return null;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.WindowAction );
