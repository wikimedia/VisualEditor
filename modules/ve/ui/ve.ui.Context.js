/*!
 * VisualEditor UserInterface Context class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface context.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 * @cfg {jQuery} [$contextOverlay=this.$element] Overlay to use for menus in inspectors
 */
ve.ui.Context = function VeUiContext( surface, config ) {
	config = $.extend( { '$contextOverlay': this.$element }, config );

	// Parent constructor
	OO.ui.Element.call( this, config );

	// Properties
	this.surface = surface;
	this.inspectors = new ve.ui.WindowSet(
		ve.ui.windowFactory, { '$': this.$, '$contextOverlay': config.$contextOverlay }
	);
	this.context = new ve.ui.ContextWidget( { '$': this.$ } );
	this.afterModelChangeTimeout = null;
	this.afterModelChangeRange = null;

	// Events
	this.surface.getModel().connect( this, {
		'documentUpdate': 'onModelChange',
		'select': 'onModelChange'
	} );
	this.inspectors.connect( this, {
		'setup': 'onInspectorSetup',
		'teardown': 'onInspectorTeardown'
	} );
	this.context.connect( this, { 'choose': 'onContextItemChoose' } );
};

/* Inheritance */

OO.inheritClass( ve.ui.Context, OO.ui.Element );

/* Methods */

/**
 * Handle context item choose events.
 *
 * @param {ve.ui.ContextItemWidget} item Chosen item
 */
ve.ui.Context.prototype.onContextItemChoose = function ( item ) {
	if ( item ) {
		item.getCommand().execute( this.surface );
	}
};

/**
 * Handle selection changes in the model.
 *
 * Changes are ignored while the user is selecting text or relocating content, apart from closing
 * the popup if it's open. While an inspector is opening or closing, all changes are ignored so as
 * to prevent inspectors that change the selection from within their open/close handlers from
 * causing issues.
 *
 * The response to selection changes is deferred to prevent close handlers that process
 * changes from causing this function to recurse. These responses are also batched for efficiency,
 * so that if there are three selection changes in the same tick, afterModelChange() only runs once.
 *
 * @method
 * @param {ve.Range} range Range if triggered by selection change, null otherwise
 * @see #afterModelChange
 */
ve.ui.Context.prototype.onModelChange = function ( range ) {
	var win = this.inspectors.getCurrentWindow();

	if ( this.showing || this.hiding || ( win && ( win.isOpening() || win.isClosing() ) ) ) {
		clearTimeout( this.afterModelChangeTimeout );
		this.afterModelChangeTimeout = null;
		this.afterModelChangeRange = null;
	} else {
		if ( this.afterModelChangeTimeout === null ) {
			this.afterModelChangeTimeout = setTimeout( ve.bind( this.afterModelChange, this ) );
		}
		if ( range instanceof ve.Range ) {
			this.afterModelChangeRange = range;
		}
	}
};

/**
 * Deferred response to one or more select events.
 *
 * @abstract
 * @method
 */
ve.ui.Context.prototype.afterModelChange = function () {
	throw new Error( 've.ui.Context.afterModelChange must be overridden in subclass' );
};

/**
 * Updates the context menu.
 *
 * @method
 * @param {boolean} [transition=false] Use a smooth transition
 * @chainable
 */
ve.ui.Context.prototype.update = function ( transition ) {
	var i, len, match, matches,
		items = [],
		fragment = this.surface.getModel().getFragment( null, false ),
		selection = fragment.getRange(),
		inspector = this.inspectors.getCurrentWindow();

	if ( inspector && selection && selection.equals( this.selection ) ) {
		// There's an inspector, and the selection hasn't changed, update the position
		this.show( transition );
	} else {
		// No inspector is open, or the selection has changed, show a menu of available inspectors
		matches = ve.ui.toolFactory.getToolsForFragment( fragment ).filter( function ( match ) {
			return match.model.isInspectable();
		} );
		if ( matches.length ) {
			// There's at least one inspectable annotation, build a menu and show it
			this.context.clearItems();
			this.containsInspector = false;
			for ( i = 0, len = matches.length; i < len; i++ ) {
				match = matches[i];
				items.push( new ve.ui.ContextItemWidget(
					match.tool.static.name, match.tool, match.model, { '$': this.$ }
				) );
				if ( match.tool.prototype instanceof ve.ui.InspectorTool ) {
					this.containsInspector = true;
				}
			}
			this.context.addItems( items );
			this.show( transition );
		} else if ( this.visible ) {
			// Nothing to inspect
			this.hide();
		}
	}

	// Remember selection for next time
	this.selection = selection && selection.clone();

	return this;
};

/**
 * Get the surface the context is being used in.
 *
 * @method
 * @returns {ve.ui.Surface} Surface of context
 */
ve.ui.Context.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Get an inspector.
 *
 * @method
 * @param {string} Symbolic name of inspector
 * @returns {ve.ui.Inspector|undefined} Inspector or undefined if none exists by that name
 */
ve.ui.Context.prototype.getInspector = function ( name ) {
	return this.inspectors.getWindow( name );
};

/**
 * Close the current inspector if there is one.
 *
 * @method
 */
ve.ui.Context.prototype.closeCurrentInspector = function () {
	if ( this.inspectors.getCurrentWindow() ) {
		this.inspectors.getCurrentWindow().close( { 'action': 'back' } );
	}
};

/**
 * Destroy the context, removing all DOM elements.
 *
 * @method
 * @returns {ve.ui.Context} Context UserInterface
 * @chainable
 */
ve.ui.Context.prototype.destroy = function () {
	// Disconnect events
	this.surface.getModel().disconnect( this );
	this.surface.getView().disconnect( this );
	this.inspectors.disconnect( this );

	// Stop timers
	clearTimeout( this.afterModelChangeTimeout );

	this.$element.remove();
	return this;
};

/**
* Handle an inspector setup event.
*
* @abstract
* @method
*/
ve.ui.Context.prototype.onInspectorSetup = function () {
	throw new Error( 've.ui.Context.onInspectorSetup must be overridden in subclass' );
};

/**
* Handle an inspector teardown event.
*
* @abstract
* @method
*/
ve.ui.Context.prototype.onInspectorTeardown = function () {
	throw new Error( 've.ui.Context.onInspectorTeardown must be overridden in subclass' );
};

/**
 * Hide the context.
 *
 * @method
 * @abstract
 * @chainable
 * @throws {Error} If this method is not overridden in a concrete subclass
 */
ve.ui.Context.prototype.hide = function () {
	throw new Error( 've.ui.Context.hide must be overridden in subclass' );
};
