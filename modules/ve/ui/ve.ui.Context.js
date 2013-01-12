/*!
 * VisualEditor user interface Context class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Context object.
 *
 * @class
 * @constructor
 * @param surface
 * @param {jQuery} $overlay DOM selection to add nodes to
 */
ve.ui.Context = function VeUiContext( surface, $overlay ) {
	// Properties
	this.surface = surface;
	this.inspectors = {};
	this.inspector = null;
	this.position = null;
	this.visible = false;
	this.selecting = false;
	this.selection = null;
	this.frame = null;
	this.menu = null;
	this.toolbar = null;
	this.$ = $( '<div class="ve-ui-context"></div>' );
	this.$callout = $( '<div class="ve-ui-context-callout"></div>' );
	this.$inner = $( '<div class="ve-ui-context-inner"></div>' );
	this.$overlay = $( '<div class="ve-ui-context-frame-overlay"></div>' );
	this.$menu = $( '<div class="ve-ui-context-menu"></div>' );
	this.$inspectors = $( '<div class="ve-ui-context-inspectors"></div>' );

	// Initialization
	this.$.append( this.$callout, this.$inner, this.$overlay );
	this.$inner.append( this.$menu, this.$inspectors );
	( $overlay || $( 'body' ) ).append( this.$ );
	this.frame = new ve.ui.Frame( this.constructor.static.frameOptions, this.$inspectors );

	// Events
	this.surface.getModel().addListenerMethods( this, { 'change': 'onChange' } );
	this.surface.getView()
		.addListenerMethods( this, {
			'selectionStart': 'onSelectionStart',
			'selectionEnd': 'onSelectionEnd'
		} );

	$( window ).on( {
		'resize': ve.bind( this.update, this ),
		'focus': ve.bind( this.onWindowFocus, this )
	} );
};

/* Static Members */

ve.ui.Context.static = {};

ve.ui.Context.static.frameOptions = {
	'stylesheets': [
		ve.init.platform.getModulesUrl() + '/ve/ui/styles/ve.ui.Inspector.css',
		ve.init.platform.getModulesUrl() + (
			window.devicePixelRatio > 1 ?
				'/ve/ui/styles/ve.ui.Inspector.Icons-vector.css' :
				'/ve/ui/styles/ve.ui.Inspector.Icons-raster.css'
		)
	]
};

/* Methods */

/**
 * Responds to change events on the model.
 *
 * Changes are ignored while the user is selecting text.
 *
 * @method
 * @param {ve.dm.Transaction} tx Change transaction
 * @param {ve.Range} selection Change selection
 */
ve.ui.Context.prototype.onChange = function ( tx, selection ) {
	if ( selection && selection.start === 0 ) {
		return;
	}
	if ( selection && !this.selecting ) {
		this.update();
	}
};

/**
 * Responds to selection start events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onSelectionStart = function () {
	this.selecting = true;
	this.hide();
};

/**
 * Responds to selection end events on the view.
 *
 * @method
 */
ve.ui.Context.prototype.onSelectionEnd = function () {
	this.selecting = false;
	this.update();
};

ve.ui.Context.prototype.onWindowFocus = function () {
	this.hide();
};

/**
 * Responds to an inspector being opened.
 *
 * @method
 * @param {string} name Name of inspector being opened (this is not part of the normal event, it's
 * mixed in when we bound to the event in {initInspector})
 */
ve.ui.Context.prototype.onBeforeInspectorOpen = function ( name ) {
	var inspector = this.inspectors[name];
	// Close menu
	if ( this.menu ) {
		this.obscure( this.$menu );
	}
	// Remember which inspector is open
	this.inspector = name;
	// Resize frame to the size of the inspector.
	this.frame.setSize( inspector.$.outerWidth(), inspector.$.outerHeight() );
	// Cache selection, in the case of manually opened inspector.
	this.selection = this.surface.getModel().getSelection();
	// Show context
	this.show();
};

/**
 * Responds to an inspector being closed.
 *
 * @method
 * @param {string} name Name of inspector being closed
 * @param {boolean} remove Annotation should be removed
 */
ve.ui.Context.prototype.onAfterInspectorClose = function () {
	this.obscure( this.$inspectors );
	this.inspector = null;
	this.hide();
	this.update();
};

/**
 * Gets the surface this context is being used in.
 *
 * @method
 * @returns {ve.Surface} Surface of context
 */
ve.ui.Context.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Gets the frame that inspectors are being rendered in.
 *
 * @method
 * @returns {ve.ui.Frame} Inspector frame
 */
ve.ui.Context.prototype.getFrame = function () {
	return this.frame;
};

/**
 * Destroy the context, removing all DOM elements.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.ui.Context.prototype.destroy = function () {
	this.$.remove();
};

/**
 * Updates the context menu.
 *
 * @method
 */
ve.ui.Context.prototype.update = function () {
	var inspectors,
		fragment = this.surface.getModel().getFragment(),
		selection = fragment.getRange(),
		annotations = fragment.getAnnotations();

	// Update the inspector if the change didn't affect the selection
	if ( this.inspector && selection.equals( this.selection ) ) {
		this.show();
	} else {
		this.hide();
	}

	if ( !this.inspector ) {
		inspectors = ve.ui.inspectorFactory.getInspectorsForAnnotations( annotations );
		if ( inspectors.length ) {
			// The selection is inspectable but not being inspected
			this.$menu.empty();
			// Create inspector toolbar
			this.toolbar = new ve.ui.Toolbar(
				$( '<div class="ve-ui-context-toolbar"></div>' ),
				this.surface,
				[{ 'name': 'inspectors', 'items' : inspectors }]
			);
			// Note: Menu attaches the provided $tool element to the container.
			this.menu = new ve.ui.Menu(
				[ { 'name': 'tools', '$': this.toolbar.$ } ], // Tools
				null, // Callback
				this.$menu, // Container
				this.$inner // Parent
			);
			if ( !this.visible ) {
				this.show();
			}
		}
	}

	// Remember selection for next time
	this.selection = selection.clone();
};

ve.ui.Context.prototype.show = function () {
	var selectionRect = this.surface.getView().getSelectionRect();

	this.position = { 'left': selectionRect.end.x, 'top': selectionRect.end.y };
	this.$.css( this.position );

	// Show context
	this.$.css( 'visibility', 'visible' );

	if ( this.inspector ) {
		// Reveal inspector
		this.reveal( this.$inspectors );
		this.$overlay.show();
	} else {
		if ( !this.visible ) {
			// Fade in the context.
			this.$.fadeIn( 'fast' );
			this.visible = true;
		}
		// Reveal menu
		this.reveal( this.$menu );
	}
	// Position inner context.
	this.positionInner();
};

ve.ui.Context.prototype.hide = function () {
	if ( this.inspector ) {
		this.closeInspector();
		this.$overlay.hide();
	}
	if ( this.menu ) {
		this.obscure( this.$menu );
		this.menu = null;
	}
	this.$.css( 'visibility', 'hidden' );
	this.visible = false;
};

/**
 * Positions the context
 *
 * @param {jQuery} $overlay
 * @param {jQuery} $element
 */
ve.ui.Context.prototype.positionInner = function () {
	var $container = this.inspector ? this.$inspectors : this.$menu,
		width = $container.outerWidth( true ),
		height = $container.outerHeight( true ),
		left = -( width / 2 );

	// Clamp on left boundary
	if ( this.position.left < width / 2 ) {
		left = -( this.$.children().outerWidth( true ) / 2 ) - ( this.position.left / 2 );
	// Clamp on right boundary
	} else if ( $( 'body' ).width() - this.position.left < width ) {
		left = -( width - ( ( $( 'body' ).width() - this.position.left ) / 2) );
	}
	// Apply dimensions to inner
	this.$inner.css( { 'left': left, 'height': height, 'width': width } );
};

/**
 * Positions an overlay element below another element.
 *
 * TODO: Does this really need to be here? Why are we halving the width of $inner?
 *
 * @param {jQuery} $overlay
 * @param {jQuery} $element
 */
ve.ui.Context.prototype.positionOverlayBelow = function ( $overlay, $element ) {
	// Set iframe overlay below element.
	$overlay.css( {
		'left': $element.offset().left - ( this.$inner.width() / 2 ),
		'top': $element.offset().top + $element.outerHeight( true ),
		// RTL position fix.
		'width': $overlay.children().outerWidth( true )
	} );
};

ve.ui.Context.prototype.initInspector = function ( name ) {
	var inspector;
	// Add inspector on demand.
	if ( ve.ui.inspectorFactory.lookup( name ) ) {
		if ( !( name in this.inspectors ) ) {
			inspector = this.inspectors[name] = ve.ui.inspectorFactory.create( name, this );
			inspector.on( 'beforeOpen', ve.bind( this.onBeforeInspectorOpen, this, name ) );
			inspector.on( 'afterClose', ve.bind( this.onAfterInspectorClose, this ) );
			inspector.$.hide();
			this.frame.$.append( inspector.$ );
			this.obscure( this.$inspectors );
		}
		return true;
	}
	return false;
};

ve.ui.Context.prototype.openInspector = function ( name ) {
	// Auto-initialize the inspector
	if ( !this.initInspector( name ) ) {
		throw new Error( 'Missing inspector. Cannot open nonexistent inspector: ' + name );
	}
	// Only allow one inspector open at a time
	if ( this.inspector ) {
		this.closeInspector();
	}
	// Open the inspector
	this.inspectors[name].open();
};

ve.ui.Context.prototype.closeInspector = function ( remove ) {
	// Quietly ignore if nothing is open
	if ( this.inspector ) {
		// Close the current inspector
		this.inspectors[this.inspector].close( remove );
	}
};

ve.ui.Context.prototype.reveal = function ( $element ) {
	$element.css( 'top', 0 );
};

ve.ui.Context.prototype.obscure = function ( $element ) {
	$element.css( 'top', -5000 );
};
