/*!
 * VisualEditor UserInterface Linear Context class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * UserInterface context.
 *
 * @class
 * @abstract
 * @extends ve.ui.Context
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 */
ve.ui.LinearContext = function VeUiLinearContext() {
	// Parent constructor
	ve.ui.LinearContext.super.apply( this, arguments );

	// Properties
	this.inspector = null;
	this.inspectors = this.createInspectorWindowManager();
	this.isOpening = false;
	this.lastSelectedNode = null;
	this.afterContextChangeTimeout = null;
	this.afterContextChangeHandler = this.afterContextChange.bind( this );
	this.updateDimensionsDebounced = ve.debounce( this.updateDimensions.bind( this ) );
	this.persistentSources = [];

	// Events
	this.surface.getModel().connect( this, {
		contextChange: 'onContextChange',
		documentUpdate: 'onDocumentUpdate'
	} );
	this.inspectors.connect( this, { opening: 'onInspectorOpening' } );
};

/* Inheritance */

OO.inheritClass( ve.ui.LinearContext, ve.ui.Context );

/* Static Properties */

/**
 * Handle context change event.
 *
 * While an inspector is opening or closing, all changes are ignored so as to prevent inspectors
 * that change the selection from within their setup or teardown processes changing context state.
 *
 * The response to selection changes is deferred to prevent teardown processes handlers that change
 * the selection from causing this function to recurse. These responses are also debounced for
 * efficiency, so that if there are three selection changes in the same tick, #afterContextChange only
 * runs once.
 *
 * @see #afterContextChange
 */
ve.ui.LinearContext.prototype.onContextChange = function () {
	if ( this.inspector && ( this.inspector.isOpening() || this.inspector.isClosing() ) ) {
		// Cancel debounced change handler
		clearTimeout( this.afterContextChangeTimeout );
		this.afterContextChangeTimeout = null;
		this.lastSelectedNode = this.surface.getModel().getSelectedNode();
	} else {
		if ( this.afterContextChangeTimeout === null ) {
			// Ensure change is handled on next cycle
			this.afterContextChangeTimeout = setTimeout( this.afterContextChangeHandler );
		}
	}
	// Purge related items cache
	this.relatedSources = null;
};

/**
 * Handle document update event.
 */
ve.ui.LinearContext.prototype.onDocumentUpdate = function () {
	// Only mind this event if the menu is visible
	if ( this.isVisible() && !this.isEmpty() ) {
		// Reuse the debounced context change handler
		this.onContextChange();
	}
};

/**
 * Handle debounced context change events.
 */
ve.ui.LinearContext.prototype.afterContextChange = function () {
	const selectedNode = this.surface.getModel().getSelectedNode();

	// Reset debouncing state
	this.afterContextChangeTimeout = null;

	if ( this.isVisible() ) {
		if ( !this.isEmpty() ) {
			if ( this.isInspectable() ) {
				// Change state: menu -> menu
				// Make a copy of items so setupMenuItems can compare it
				const previousItems = this.items.slice();
				this.teardownMenuItems();
				this.setupMenuItems( previousItems );
				this.updateDimensionsDebounced();
			} else {
				// Change state: menu -> closed
				this.toggleMenu( false );
				this.toggle( false );
			}
		} else if (
			this.inspector &&
			( !selectedNode || ( selectedNode !== this.lastSelectedNode ) )
		) {
			// Change state: inspector -> (closed|menu)
			// Unless there is a selectedNode that hasn't changed (e.g. your inspector is editing a node)
			this.inspector.close();
		}
	} else {
		if ( this.isInspectable() ) {
			// Change state: closed -> menu
			this.toggleMenu( true );
			this.toggle( true );
		}
	}

	this.lastSelectedNode = selectedNode;
};

/**
 * Handle an inspector opening event.
 *
 * @param {OO.ui.Window} win Window that's being opened
 * @param {jQuery.Promise} opening Promise resolved when window is opened; when the promise is
 *   resolved the first argument will be a promise which will be resolved when the window begins
 *   closing, the second argument will be the opening data
 * @param {Object} data Window opening data
 */
ve.ui.LinearContext.prototype.onInspectorOpening = function ( win, opening ) {
	const observer = this.surface.getView().surfaceObserver;

	this.isOpening = true;
	this.inspector = win;

	// Shut down the SurfaceObserver as soon as possible, so it doesn't get confused
	// by the selection moving around in IE. Will be reenabled when inspector closes.
	// FIXME this should be done in a nicer way, managed by the Surface classes
	observer.pollOnce();
	observer.stopTimerLoop();

	opening
		.progress( ( data ) => {
			this.isOpening = false;
			if ( data.state === 'setup' ) {
				if ( !this.isVisible() ) {
					// Change state: closed -> inspector
					this.toggle( true );
				}
				if ( !this.isEmpty() ) {
					// Change state: menu -> inspector
					this.toggleMenu( false );
				}
			}
			this.updateDimensionsDebounced();
		} )
		.then( ( opened ) => {
			opened.then( ( closed ) => {
				closed.always( () => {
					// Don't try to close the inspector if a second
					// opening has already been triggered
					if ( this.isOpening ) {
						return;
					}

					this.inspector = null;

					// Reenable observer
					observer.startTimerLoop();

					if ( this.isInspectable() ) {
						// Change state: inspector -> menu
						this.toggleMenu( true );
						this.updateDimensionsDebounced();
					} else {
						// Change state: inspector -> closed
						this.toggle( false );
					}
				} );
			} );
		} );
};

/**
 * Check if context is visible.
 *
 * @return {boolean} Context is visible
 */
ve.ui.LinearContext.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Check if current content is inspectable.
 *
 * @return {boolean} Content is inspectable
 */
ve.ui.LinearContext.prototype.isInspectable = function () {
	return !!this.getRelatedSources().length;
};

/**
 * Add a persistent source that will stay visible until manually removed.
 *
 * @param {Object} source Object containing `name`, `model` and `config` properties.
 *   See #getRelatedSources.
 */
ve.ui.LinearContext.prototype.addPersistentSource = function ( source ) {
	this.persistentSources.push(
		ve.extendObject( { type: 'persistent' }, source )
	);

	this.onContextChange();
};

/**
 * Remove a persistent source by name
 *
 * @param {string} name Source name
 */
ve.ui.LinearContext.prototype.removePersistentSource = function ( name ) {
	this.persistentSources = this.persistentSources.filter( ( source ) => source.name !== name );

	this.onContextChange();
};

/**
 * @inheritdoc Also adds the `embeddable` property to each object.
 */
ve.ui.LinearContext.prototype.getRelatedSources = function () {
	const surfaceModel = this.surface.getModel(),
		selection = surfaceModel.getSelection();
	let selectedModels = [];

	if ( !this.relatedSources ) {
		this.relatedSources = [];
		if ( selection instanceof ve.dm.LinearSelection ) {
			selectedModels = this.surface.getView().getSelectedModels();
		} else if ( selection instanceof ve.dm.TableSelection ) {
			selectedModels = [ surfaceModel.getSelectedNode() ];
		}
		if ( selectedModels.length ) {
			this.relatedSources = this.getRelatedSourcesFromModels( selectedModels );
		}
		this.relatedSources.push( ...this.persistentSources );
	}

	return this.relatedSources;
};

/**
 * Get related for selected models
 *
 * @param {ve.dm.Model[]} selectedModels Models
 * @return {Object[]} See #getRelatedSources
 */
ve.ui.LinearContext.prototype.getRelatedSourcesFromModels = function ( selectedModels ) {
	const models = [],
		relatedSources = [],
		items = ve.ui.contextItemFactory.getRelatedItems( selectedModels );

	items.forEach( ( item ) => {
		if ( !item.model.isInspectable() ) {
			return;
		}
		if ( ve.ui.contextItemFactory.isExclusive( item.name ) ) {
			models.push( item.model );
		}
		relatedSources.push( {
			type: 'item',
			embeddable: ve.ui.contextItemFactory.isEmbeddable( item.name ),
			name: item.name,
			model: item.model
		} );
	} );

	const tools = ve.ui.toolFactory.getRelatedItems( selectedModels );
	tools.forEach( ( tool ) => {
		if ( !tool.model.isInspectable() ) {
			return;
		}
		if ( !models.includes( tool.model ) ) {
			const toolClass = ve.ui.toolFactory.lookup( tool.name );
			relatedSources.push( {
				type: 'tool',
				embeddable: !toolClass || toolClass.static.makesEmbeddableContextItem,
				name: tool.name,
				model: tool.model
			} );
		}
	} );
	return relatedSources;
};

/**
 * Get inspector window set.
 *
 * @return {ve.ui.WindowManager}
 */
ve.ui.LinearContext.prototype.getInspectors = function () {
	return this.inspectors;
};

/**
 * Create a inspector window manager.
 *
 * @abstract
 * @return {ve.ui.WindowManager} Inspector window manager
 */
ve.ui.LinearContext.prototype.createInspectorWindowManager = null;

/**
 * @inheritdoc
 */
ve.ui.LinearContext.prototype.destroy = function () {
	// Disconnect events
	this.surface.getModel().disconnect( this );
	this.inspectors.disconnect( this );

	// Destroy inspectors WindowManager
	this.inspectors.destroy();

	// Stop timers
	clearTimeout( this.afterContextChangeTimeout );

	// Parent method
	return ve.ui.LinearContext.super.prototype.destroy.call( this );
};
