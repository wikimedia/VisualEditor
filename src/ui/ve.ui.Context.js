/*!
 * VisualEditor UserInterface Context class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * UserInterface context.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixes OO.EventEmitter
 * @mixes OO.ui.mixin.GroupElement
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 */
ve.ui.Context = function VeUiContext( surface, config ) {
	// Parent constructor
	ve.ui.Context.super.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );
	OO.ui.mixin.GroupElement.call( this, config );

	// Properties
	this.surface = surface;
	this.visible = false;
	this.choosing = false;

	this.$focusTrapBefore = $( '<div>' ).prop( 'tabIndex', 0 );
	this.$focusTrapAfter = $( '<div>' ).prop( 'tabIndex', 0 );
	this.$focusTrapBefore.add( this.$focusTrapAfter ).on( 'focus', () => {
		surface.getView().activate();
	} );

	// Initialization
	// Hide element using a class, not this.toggle, as child implementations
	// of toggle may require the instance to be fully constructed before running.
	this.$group.addClass( 've-ui-context-menu' );
	this.$element
		.addClass( 've-ui-context ve-ui-context-hidden' )
		.append( this.$focusTrapBefore, this.$group, this.$focusTrapAfter );
};

/* Inheritance */

OO.inheritClass( ve.ui.Context, OO.ui.Element );

OO.mixinClass( ve.ui.Context, OO.EventEmitter );

OO.mixinClass( ve.ui.Context, OO.ui.mixin.GroupElement );

/* Events */

/**
 * @event ve.ui.Context#resize
 */

/* Static Properties */

/**
 * Context is for mobile devices.
 *
 * @static
 * @inheritable
 * @property {boolean}
 */
ve.ui.Context.static.isMobile = false;

/* Methods */

/**
 * Check if context is for mobile devices
 *
 * @return {boolean} Context is for mobile devices
 */
ve.ui.Context.prototype.isMobile = function () {
	return this.constructor.static.isMobile;
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
 * Get related item sources.
 *
 * Result is cached, and cleared when the model or selection changes.
 *
 * @abstract
 * @return {Object[]} List of objects containing `type`, `name`, and `model` or `data` properties,
 *   `type` is either `item`, `tool` or `persistent`
 *   `name` is the symbolic name of the item or tool
 *   `model` is the model the item or tool is compatible with (for `item` or `tool`)
 *   `data` is additional data, for `persistent` context items
 */
ve.ui.Context.prototype.getRelatedSources = null;

/**
 * Get the surface the context is being used with.
 *
 * @return {ve.ui.Surface}
 */
ve.ui.Context.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Hide the context while it has valid items in the menu
 *
 * This could be triggered by clicking the close button on
 * mobile or by pressing escape.
 */
ve.ui.Context.prototype.hide = function () {
	const surfaceModel = this.surface.getModel();
	this.toggleMenu( false );
	this.toggle( false );
	// Desktop: Ensure the next cursor movement re-evaluates the context,
	// e.g. if moving within a link, the context is re-shown.
	surfaceModel.once( 'select', () => {
		surfaceModel.emitContextChange();
	} );
	// Mobile: Clear last-known contexedAnnotations so that clicking the annotation
	// again just brings up this context item. (T232172)
	this.getSurface().getView().contexedAnnotations = [];
};

/**
 * Toggle the menu.
 *
 * @param {boolean} [show] Show the menu, omit to toggle
 * @return {ve.ui.Context}
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
 * @param {ve.ui.ContextItem[]} [previousItems] if a context is being refreshed, this will
 *  be the previously-open items for comparison
 * @return {ve.ui.Context}
 * @chainable
 */
ve.ui.Context.prototype.setupMenuItems = function ( previousItems ) {
	const sources = this.getRelatedSources(),
		items = [];

	let i, len;
	for ( i = 0, len = sources.length; i < len; i++ ) {
		const source = sources[ i ];
		if ( source.type === 'item' ) {
			items.push( ve.ui.contextItemFactory.create(
				sources[ i ].name, this, sources[ i ].model
			) );
		} else if ( source.type === 'tool' ) {
			items.push( new ve.ui.ToolContextItem(
				this, sources[ i ].model, ve.ui.toolFactory.lookup( sources[ i ].name )
			) );
		} else if ( source.type === 'persistent' ) {
			items.push( ve.ui.contextItemFactory.create(
				sources[ i ].name, this, sources[ i ].data
			) );
		}
	}

	items.sort( ( a, b ) => a.constructor.static.sortOrder - b.constructor.static.sortOrder );

	this.addItems( items );
	for ( i = 0, len = items.length; i < len; i++ ) {
		const item = items[ i ];
		const isRefreshing = previousItems && previousItems.some(
			// We treat it as refreshing if they're exactly equal, or if either is null.
			// Null here probably means we're dealing with a persistent fragment that's
			// between text-selections currently.
			( oldItem ) => oldItem.equals( item ) ||
				oldItem.getFragment().isNull() ||
				item.getFragment().isNull()
		);
		item.connect( this, { command: 'onContextItemCommand' } );
		item.setup( isRefreshing );
	}

	return this;
};

/**
 * Teardown menu items.
 *
 * @protected
 * @return {ve.ui.Context}
 * @chainable
 */
ve.ui.Context.prototype.teardownMenuItems = function () {
	for ( let i = 0, len = this.items.length; i < len; i++ ) {
		this.items[ i ].teardown();
	}
	this.clearItems();

	return this;
};

/**
 * Handle command events from context items
 */
ve.ui.Context.prototype.onContextItemCommand = function () {};

/**
 * Toggle the visibility of the context.
 *
 * @param {boolean} [show] Show the context, omit to toggle
 * @return {jQuery.Promise} Promise resolved when context is finished showing/hiding
 * @fires ve.ui.Context#resize
 */
ve.ui.Context.prototype.toggle = function ( show ) {
	show = show === undefined ? !this.visible : !!show;
	if ( show !== this.visible ) {
		this.visible = show;
		this.$element.toggleClass( 've-ui-context-hidden', !this.visible );
	}
	this.emit( 'resize' );
	return ve.createDeferred().resolve().promise();
};

/**
 * Update the size and position of the context.
 *
 * @return {ve.ui.Context}
 * @chainable
 * @fires ve.ui.Context#resize
 */
ve.ui.Context.prototype.updateDimensions = function () {
	// Override in subclass if context is positioned relative to content
	this.emit( 'resize' );
	return this;
};

/**
 * Destroy the context, removing all DOM elements.
 *
 * @return {ve.ui.Context}
 * @chainable
 */
ve.ui.Context.prototype.destroy = function () {
	// Disconnect events
	this.surface.getModel().disconnect( this );

	this.$element.remove();
	return this;
};

/**
 * Get an object describing the amount of padding the context adds to the surface.
 *
 * For example the mobile context, which is fixed to the bottom of the viewport,
 * will add bottom padding, whereas the floating desktop context will add none.
 *
 * @return {ve.ui.Surface.Padding|null} Padding object, or null
 */
ve.ui.Context.prototype.getSurfacePadding = function () {
	return null;
};
