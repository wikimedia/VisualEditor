/*!
 * VisualEditor UserInterface Context class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * UserInterface context.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixins OO.ui.GroupElement
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 */
ve.ui.Context = function VeUiContext( surface, config ) {
	// Parent constructor
	ve.ui.Context.super.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, config );

	// Properties
	this.surface = surface;
	this.visible = false;
	this.choosing = false;
	this.inspector = null;
	this.inspectors = this.createInspectorWindowManager();
	this.lastSelectedNode = null;
	this.afterContextChangeTimeout = null;
	this.afterContextChangeHandler = this.afterContextChange.bind( this );
	this.updateDimensionsDebounced = ve.debounce( this.updateDimensions.bind( this ) );

	// Events
	this.surface.getModel().connect( this, {
		contextChange: 'onContextChange',
		documentUpdate: 'onDocumentUpdate'
	} );
	this.inspectors.connect( this, { opening: 'onInspectorOpening' } );

	// Initialization
	// Hide element using a class, not this.toggle, as child implementations
	// of toggle may require the instance to be fully constructed before running.
	this.$group.addClass( 've-ui-context-menu' );
	this.$element
		.addClass( 've-ui-context oo-ui-element-hidden' )
		.append( this.$group );
	this.inspectors.$element.addClass( 've-ui-context-inspectors' );
};

/* Inheritance */

OO.inheritClass( ve.ui.Context, OO.ui.Element );
OO.mixinClass( ve.ui.Context, OO.ui.GroupElement );

/* Static Property */

/**
 * Instruct items to provide only a basic rendering.
 *
 * @static
 * @inheritable
 * @property {boolean}
 */
ve.ui.Context.static.basicRendering = false;

/* Methods */

ve.ui.Context.prototype.shouldUseBasicRendering = function () {
	return this.constructor.static.basicRendering;
};

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
ve.ui.Context.prototype.onContextChange = function () {
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
ve.ui.Context.prototype.onDocumentUpdate = function () {
	// Only mind this event if the menu is visible
	if ( this.isVisible() && !this.isEmpty() ) {
		// Reuse the debounced context change hanlder
		this.onContextChange();
	}
};

/**
 * Handle debounced context change events.
 */
ve.ui.Context.prototype.afterContextChange = function () {
	var selectedNode = this.surface.getModel().getSelectedNode();

	// Reset debouncing state
	this.afterContextChangeTimeout = null;

	if ( this.isVisible() ) {
		if ( !this.isEmpty() ) {
			if ( this.isInspectable() ) {
				// Change state: menu -> menu
				this.teardownMenuItems();
				this.setupMenuItems();
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
ve.ui.Context.prototype.onInspectorOpening = function ( win, opening ) {
	var context = this,
		observer = this.surface.getView().surfaceObserver;
	this.inspector = win;

	// Shut down the SurfaceObserver as soon as possible, so it doesn't get confused
	// by the selection moving around in IE. Will be reenabled when inspector closes.
	// FIXME this should be done in a nicer way, managed by the Surface classes
	observer.pollOnce();
	observer.stopTimerLoop();

	opening
		.progress( function ( data ) {
			if ( data.state === 'setup' ) {
				if ( !context.isEmpty() ) {
					// Change state: menu -> inspector
					context.toggleMenu( false );
				} else if ( !context.isVisible() ) {
					// Change state: closed -> inspector
					context.toggle( true );
				}
			}
			context.updateDimensionsDebounced();
		} )
		.always( function ( opened ) {
			opened.always( function ( closed ) {
				closed.always( function () {
					var inspectable = context.isInspectable();

					context.inspector = null;

					// Reenable observer
					observer.startTimerLoop();

					if ( inspectable ) {
						// Change state: inspector -> menu
						context.toggleMenu( true );
						context.updateDimensionsDebounced();
					} else {
						// Change state: inspector -> closed
						context.toggle( false );
					}

					// Restore selection
					if ( context.getSurface().getModel().getSelection() ) {
						context.getSurface().getView().focus();
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
ve.ui.Context.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Check if current content is inspectable.
 *
 * @return {boolean} Content is inspectable
 */
ve.ui.Context.prototype.isInspectable = function () {
	return !!this.getRelatedSources().length;
};

/**
 * Check if the context menu for current content is embeddable.
 *
 * @return {boolean} Context menu is embeddable
 */
ve.ui.Context.prototype.isEmbeddable = function () {
	var i, len,
		sources = this.getRelatedSources();

	for ( i = 0, len = sources.length; i < len; i++ ) {
		if ( !sources[i].embeddable ) {
			return false;
		}
	}

	return true;
};

/**
 * Get related item sources.
 *
 * Result is cached, and cleared when the model or selection changes.
 *
 * @returns {Object[]} List of objects containing `type`, `name` and `model` properties,
 *   representing each compatible type (either `item` or `tool`), symbolic name of the item or tool
 *   and the model the item or tool is compatible with
 */
ve.ui.Context.prototype.getRelatedSources = function () {
	var i, len, toolClass, items, tools, models, selectedModels;

	if ( !this.relatedSources ) {
		this.relatedSources = [];
		if ( this.surface.getModel().getSelection() instanceof ve.dm.LinearSelection ) {
			selectedModels = this.surface.getModel().getFragment().getSelectedModels();
			models = [];
			items = ve.ui.contextItemFactory.getRelatedItems( selectedModels );
			for ( i = 0, len = items.length; i < len; i++ ) {
				if ( ve.ui.contextItemFactory.isExclusive( items[i].name ) ) {
					models.push( items[i].model );
				}
				this.relatedSources.push( {
					type: 'item',
					embeddable: ve.ui.contextItemFactory.isEmbeddable( items[i].name ),
					name: items[i].name,
					model: items[i].model
				} );
			}
			tools = ve.ui.toolFactory.getRelatedItems( selectedModels );
			for ( i = 0, len = tools.length; i < len; i++ ) {
				if ( models.indexOf( tools[i].model ) === -1 ) {
					toolClass = ve.ui.toolFactory.lookup( tools[i].name );
					this.relatedSources.push( {
						type: 'tool',
						embeddable: !toolClass ||
							!( toolClass.prototype instanceof ve.ui.InspectorTool ),
						name: tools[i].name,
						model: tools[i].model
					} );
				}
			}
		}
	}

	return this.relatedSources;
};

/**
 * Get the surface the context is being used with.
 *
 * @return {ve.ui.Surface}
 */
ve.ui.Context.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Get inspector window set.
 *
 * @return {ve.ui.WindowManager}
 */
ve.ui.Context.prototype.getInspectors = function () {
	return this.inspectors;
};

/**
 * Create a inspector window manager.
 *
 * @method
 * @abstract
 * @return {ve.ui.WindowManager} Inspector window manager
 * @throws {Error} If this method is not overridden in a concrete subclass
 */
ve.ui.Context.prototype.createInspectorWindowManager = function () {
	throw new Error( 've.ui.Context.createInspectorWindowManager must be overridden in subclass' );
};

/**
 * Toggle the menu.
 *
 * @param {boolean} [show] Show the menu, omit to toggle
 * @chainable
 */
ve.ui.Context.prototype.toggleMenu = function ( show ) {
	show = show === undefined ? !this.choosing : !!show;

	if ( show !== this.choosing ) {
		this.choosing = show;
		this.$element.toggleClass( 've-ui-context-choosing', show );
		if ( show ) {
			this.setupMenuItems();
		} else {
			this.teardownMenuItems();
		}
	}

	return this;
};

/**
 * Setup menu items.
 *
 * @protected
 * @chainable
 */
ve.ui.Context.prototype.setupMenuItems = function () {
	var i, len, source,
		sources = this.getRelatedSources(),
		items = [];

	for ( i = 0, len = sources.length; i < len; i++ ) {
		source = sources[i];
		if ( source.type === 'item' ) {
			items.push( ve.ui.contextItemFactory.create(
				sources[i].name, this, sources[i].model, { $: this.$ }
			) );
		} else if ( source.type === 'tool' ) {
			items.push( new ve.ui.ToolContextItem(
				this, sources[i].model, ve.ui.toolFactory.lookup( sources[i].name ), { $: this.$ }
			) );
		}
	}

	this.addItems( items );
	for ( i = 0, len = items.length; i < len; i++ ) {
		items[i].setup();
	}

	return this;
};

/**
 * Teardown menu items.
 *
 * @protected
 * @chainable
 */
ve.ui.Context.prototype.teardownMenuItems = function () {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[i].teardown();
	}
	this.clearItems();

	return this;
};

/**
 * Toggle the visibility of the context.
 *
 * @param {boolean} [show] Show the context, omit to toggle
 * @return {jQuery.Promise} Promise resolved when context is finished showing/hiding
 */
ve.ui.Context.prototype.toggle = function ( show ) {
	show = show === undefined ? !this.visible : !!show;
	if ( show !== this.visible ) {
		this.visible = show;
		this.$element.toggleClass( 'oo-ui-element-hidden', !this.visible );
	}
	return $.Deferred().resolve().promise();
};

/**
 * Update the size and position of the context.
 *
 * @chainable
 */
ve.ui.Context.prototype.updateDimensions = function () {
	// Override in subclass if context is positioned relative to content
	return this;
};

/**
 * Destroy the context, removing all DOM elements.
 */
ve.ui.Context.prototype.destroy = function () {
	// Disconnect events
	this.surface.getModel().disconnect( this );
	this.inspectors.disconnect( this );

	// Destroy inspectors WindowManager
	this.inspectors.destroy();

	// Stop timers
	clearTimeout( this.afterContextChangeTimeout );

	this.$element.remove();
	return this;
};
