/*!
 * VisualEditor UserInterface Context class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface context.
 *
 * @class
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.Context = function VeUiContext( surface ) {
	// Properties
	this.surface = surface;
	this.inspectors = {};
	this.visible = false;
	this.showing = false;
	this.selecting = false;
	this.relocating = false;
	this.selection = null;
	this.toolbar = null;
	this.$ = $( '<div>' );
	this.popup = new ve.ui.PopupWidget();
	this.$menu = $( '<div>' );
	this.inspectors = new ve.ui.WindowSet( surface, ve.ui.inspectorFactory );

	// Initialization
	this.$.addClass( 've-ui-context' ).append( this.popup.$ );
	this.inspectors.$.addClass( 've-ui-context-inspectors' );
	this.popup.$body.append(
		this.$menu.addClass( 've-ui-context-menu' ),
		this.inspectors.$.addClass( 've-ui-context-inspectors' )
	);

	// Events
	this.surface.getModel().connect( this, { 'change': 'onChange' } );
	this.surface.getView().connect( this, {
		'selectionStart': 'onSelectionStart',
		'selectionEnd': 'onSelectionEnd',
		'relocationStart': 'onRelocationStart',
		'relocationEnd': 'onRelocationEnd'
	} );
	this.inspectors.connect( this, {
		'setup': 'onInspectorSetup',
		'open': 'onInspectorOpen',
		'close': 'onInspectorClose'
	} );
	$( window ).on( {
		'resize': ve.bind( this.update, this ),
		'focus': ve.bind( this.onWindowFocus, this )
	} );
};

/* Methods */

/**
 * Handle change events on the model.
 *
 * Changes are ignored while the user is selecting text.
 *
 * @method
 * @param {ve.dm.Transaction[]} transactions Change transactions
 * @param {ve.Range} selection Change selection
 */
ve.ui.Context.prototype.onChange = function ( transactions, selection ) {
	if ( selection && selection.start === 0 ) {
		return;
	}
	if ( selection && !this.selecting && !this.draggingAndDropping ) {
		this.update();
	}
};

/**
 * Handle selection start events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onSelectionStart = function () {
	this.selecting = true;
	this.hide();
};

/**
 * Handle selection end events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onSelectionEnd = function () {
	this.selecting = false;
	if ( !this.relocating ) {
		this.update();
	}
};

/**
 * Handle selection start events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onRelocationStart = function () {
	this.relocating = true;
	this.hide();
};

/**
 * Handle selection end events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onRelocationEnd = function () {
	this.relocating = false;
	this.update();
};

/**
 * Handle window focus events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onWindowFocus = function () {
	this.hide();
};

/**
 * Handle an inspector being setup.
 *
 * @method
 * @param {ve.ui.Inspector} inspector Inspector that's been setup
 */
ve.ui.Context.prototype.onInspectorSetup = function () {
	this.selection = this.surface.getModel().getSelection();
};

/**
 * Handle an inspector being opened.
 *
 * @method
 * @param {ve.ui.Inspector} inspector Inspector that's been opened
 */
ve.ui.Context.prototype.onInspectorOpen = function () {
	// Transition between menu and inspector
	this.show( true );
};

/**
 * Handle an inspector being closed.
 *
 * @method
 * @param {ve.ui.Inspector} inspector Inspector that's been opened
 * @param {boolean} accept Changes have been accepted
 */
ve.ui.Context.prototype.onInspectorClose = function () {
	this.update();
};

/**
 * Gets the surface the context is being used in.
 *
 * @method
 * @returns {ve.Surface} Surface of context
 */
ve.ui.Context.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Destroy the context, removing all DOM elements.
 *
 * @method
 * @returns {ve.ui.Context} Context UserInterface
 * @chainable
 */
ve.ui.Context.prototype.destroy = function () {
	this.$.remove();
	return this;
};

/**
 * Updates the context menu.
 *
 * @method
 * @chainable
 */
ve.ui.Context.prototype.update = function () {
	var i, nodes, views, view,
		fragment = this.surface.getModel().getFragment( null, false ),
		selection = fragment.getRange(),
		inspector = this.inspectors.getCurrent();

	if ( inspector && selection.equals( this.selection ) ) {
		// There's an inspector, and the selection hasn't changed, update the position
		this.show();
	} else {
		// No inspector is open, or the selection has changed, show a menu of available inspectors
		views = ve.ui.viewRegistry.getViewsForAnnotations( fragment.getAnnotations() );
		nodes = fragment.getLeafNodes();
		for ( i = 0; i < nodes.length; i++ ) {
			if ( nodes[i].range && nodes[i].range.isCollapsed() ) {
				nodes.splice( i, 1 );
				i--;
			}
		}
		if ( nodes.length === 1 ) {
			view = ve.ui.viewRegistry.getViewForNode( nodes[0].node );
			if ( view ) {
				views.push( view );
			}
		}
		for ( i = 0; i < views.length; i++ ) {
			if ( !ve.ui.toolFactory.lookup( views[i] ) ) {
				views.splice( i, 1 );
				i--;
			}
		}
		if ( views.length ) {
			// There's at least one inspectable annotation, build a menu and show it
			this.$menu.empty();
			if ( this.toolbar ) {
				this.toolbar.destroy();
			}
			this.toolbar = new ve.ui.Toolbar(
				$( '<div class="ve-ui-context-toolbar"></div>' ),
				this.surface,
				[{ 'name': 'inspectors', 'items' : views }]
			);
			this.$menu.append( this.toolbar.$ );
			this.show();
		} else if ( this.visible ) {
			// Nothing to inspect
			this.hide();
		}
	}

	// Remember selection for next time
	this.selection = selection.clone();

	return this;
};

/**
 * Updates the position and size.
 *
 * @method
 * @chainable
 */
ve.ui.Context.prototype.updateDimensions = function ( transition ) {
	var position, $container,
		inspector = this.inspectors.getCurrent();

	// Get cursor position
	position = ve.ce.Surface.getSelectionRect();
	position = position && position.end;
	if ( position ) {
		$container = inspector ? this.inspectors.$ : this.$menu;
		this.$.css( { 'left': position.x, 'top': position.y } );
		this.popup.display(
			position.x,
			position.y,
			$container.outerWidth( true ),
			$container.outerHeight( true ),
			transition
		);
	}

	return this;
};

/**
 * Shows the context menu.
 *
 * @method
 * @chainable
 */
ve.ui.Context.prototype.show = function ( transition ) {
	var inspector = this.inspectors.getCurrent();

	if ( !this.showing ) {
		this.showing = true;

		this.$.show();

		// Show either inspector or menu
		if ( inspector ) {
			this.$menu.hide();
			this.inspectors.$.show();
			inspector.$.css( 'opacity', 0 );
			// Update size and fade the inspector in after animation is complete
			setTimeout( ve.bind( function () {
				inspector.fitHeightToContents();
				this.updateDimensions( transition );
				inspector.$.css( 'opacity', 1 );
			}, this ), 200 );
		} else {
			this.inspectors.$.hide();
			this.$menu.show();
		}

		this.updateDimensions( transition );

		this.visible = true;
		this.showing = false;
	}

	return this;
};

/**
 * Hides the context menu.
 *
 * @method
 * @chainable
 */
ve.ui.Context.prototype.hide = function () {
	var inspector = this.inspectors.getCurrent();

	if ( inspector ) {
		// This will recurse, but inspector will be undefined next time
		inspector.close( 'hide' );
		return this;
	}

	this.inspectors.$.hide();
	this.$menu.hide();
	this.$.hide();
	this.visible = false;

	return this;
};

/**
 * Opens a given inspector.
 *
 * @method
 * @param {string} name Symbolic name of inspector
 * @chainable
 */
ve.ui.Context.prototype.openInspector = function ( name ) {
	this.inspectors.open( name );
	return this;
};
