/*!
 * VisualEditor UserInterface DesktopContext class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Context menu and inspectors.
 *
 * @class
 * @extends ve.ui.Context
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 */
ve.ui.DesktopContext = function VeUiDesktopContext( surface, config ) {
	// Parent constructor
	ve.ui.DesktopContext.super.call( this, surface, config );

	// Properites
	this.popup = new OO.ui.PopupWidget( { '$': this.$, '$container': this.surface.$element } );
	this.transitioning = null;
	this.suppressed = false;
	this.onWindowResizeHandler = ve.bind( this.onWindowResize, this );
	this.$window = this.$( this.getElementWindow() );

	// Events
	this.surface.getView().connect( this, {
		'selectionStart': 'onSuppress',
		'selectionEnd': 'onUnsuppress',
		'relocationStart': 'onSuppress',
		'relocationEnd': 'onUnsuppress',
		'blur': 'onSuppress',
		'focus': 'onUnsuppress',
		'position': 'onSurfacePosition'
	} );
	this.$window.on( 'resize', this.onWindowResizeHandler );
	this.$element.on( 'mousedown', false );

	// Initialization
	this.$element
		.addClass( 've-ui-desktopContext' )
		.append( this.popup.$element );
	this.menu.$element.addClass( 've-ui-desktopContext-menu' );
	this.inspectors.$element.addClass( 've-ui-desktopContext-inspectors' );
	this.popup.$body.append( this.menu.$element, this.inspectors.$element );

	// HACK: hide the popup with visibility: hidden; rather than display: none;, because
	// the popup contains inspector iframes, and applying display: none; to those causes them to
	// not load in Firefox
	this.popup.$element.css( { 'visibility': 'hidden', 'display': '' } );
};

/* Inheritance */

OO.inheritClass( ve.ui.DesktopContext, ve.ui.Context );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.onContextChange = function () {
	// Bypass while dragging
	if ( this.suppressed ) {
		return;
	}
	// Parent method
	ve.ui.DesktopContext.super.prototype.onContextChange.call( this );
};

/**
 * Handle context supression event.
 */
ve.ui.DesktopContext.prototype.onSuppress = function () {
	this.suppressed = true;

	if ( this.isVisible() ) {
		if ( this.menu.isVisible() ) {
			// Change state: menu -> closed
			this.menu.toggle( false );
			this.toggle( false );
		} else if ( this.inspector ) {
			// Change state: inspector -> closed
			this.inspector.close();
		}
	}
};

/**
 * Handle context unsupression event.
 */
ve.ui.DesktopContext.prototype.onUnsuppress = function () {
	var inspectable = !!this.getAvailableTools().length;

	this.suppressed = false;

	if ( inspectable ) {
		// Change state: closed -> menu
		this.menu.toggle( true );
		this.populateMenu();
		this.toggle( true );
	}
};

/**
 * Handle surface position event.
 */
ve.ui.DesktopContext.prototype.onSurfacePosition = function () {
	this.updateDimensions( true );
};

/**
 * Handle window resize events.
 *
 * @param {jQuery.Event} e Window resize event
 */
ve.ui.DesktopContext.prototype.onWindowResize = function () {
	if ( this.isVisible() ) {
		this.updateDimensions();
	}
};

/**
 * Check if context can be embedded onto the currently focused node.
 *
 * @return {boolean} Context can be embedded
 */
ve.ui.DesktopContext.prototype.isEmbeddable = function () {
	var dim,
		node = this.surface.getView().getFocusedNode();

	if ( node instanceof ve.ce.FocusableNode ) {
		dim = node.getDimensions();
		return (
			// HACK: `5` and `10` are estimates of what `0.25em` and `0.5em` (the margins of the
			// menu when embedded) are in pixels, what needs to actually be done is to take
			// measurements to find the margins and use those value instead
			dim.height > this.menu.$element.outerHeight() + 5 &&
			dim.width > this.menu.$element.outerWidth() + 10
		);
	}
	return false;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.createInspectorWindowManager = function () {
	return new ve.ui.DesktopInspectorManager( {
		'$': this.$,
		'factory': ve.ui.windowFactory,
		'overlay': this.surface.getLocalOverlay(),
		'modal': false
	} );
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.toggle = function ( show ) {
	var promise;

	if ( this.transitioning ) {
		return this.transitioning;
	}
	show = show === undefined ? !this.visible : !!show;
	if ( show === this.visible ) {
		return $.Deferred().resolve().promise();
	}

	this.visible = show;
	this.transitioning = $.Deferred();
	promise = this.transitioning.promise();

	this.popup.toggle( show );
	// HACK: make the context and popup visibility: hidden; instead of display: none; because
	// they contain inspector iframes, and applying display: none; to those causes them to
	// not load in Firefox
	this.$element.add( this.popup.$element ).css( {
		'visibility': show ? '' : 'hidden',
		'display': ''
	} );

	this.transitioning.resolve();
	this.transitioning = null;
	this.visible = show;

	if ( show ) {
		if ( this.inspector ) {
			this.inspectors.updateWindowSize( this.inspector );
		}
		this.updateDimensions();
	} else if ( this.inspector ) {
		this.inspector.close();
	}

	return promise;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.updateDimensions = function ( transition ) {
	var $container, focusedOffset, focusedDimensions, cursorPosition, position,
		surface = this.surface.getView(),
		focusedNode = surface.getFocusedNode(),
		surfaceOffset = surface.$element.offset(),
		rtl = this.surface.getModel().getDocument().getDir() === 'rtl',
		embeddable = this.isEmbeddable();

	$container = this.inspector ? this.inspector.$frame : this.menu.$element;
	if ( focusedNode ) {
		this.popup.toggleAnchor( !embeddable );
		// Get the position relative to the surface it is embedded in
		focusedOffset = focusedNode.getRelativeOffset();
		focusedDimensions = focusedNode.getDimensions();
		if ( embeddable ) {
			position = { 'y': focusedOffset.top };
			// When context is embedded in RTL, it requires adjustments to the relative
			// positioning (pop up on the other side):
			if ( rtl ) {
				position.x = focusedOffset.left;
				this.popup.align = 'left';
			} else {
				position.x = focusedOffset.left + focusedDimensions.width;
				this.popup.align = 'right';
			}
		} else {
			// Get the position of the focusedNode:
			position = {
				'x': focusedOffset.left + focusedDimensions.width / 2,
				'y': focusedOffset.top + focusedDimensions.height
			};
			this.popup.align = 'center';
		}
	} else {
		// We're on top of a selected text
		// Get the position of the cursor
		cursorPosition = surface.getSelectionRect();
		if ( cursorPosition ) {
			// Correct for surface offset:
			position = {
				'x': cursorPosition.end.x - surfaceOffset.left,
				'y': cursorPosition.end.y - surfaceOffset.top
			};
		}
		// If !cursorPosition, the surface apparently isn't selected, so getSelectionRect()
		// returned null. This shouldn't happen because the context is only supposed to be
		// displayed in response to a selection, but for some reason this does happen when opening
		// an inspector without changing the selection.
		// Skip updating the cursor position, but still update the width and height.

		this.popup.align = 'center';
	}

	if ( position ) {
		this.$element.css( { 'left': position.x, 'top': position.y } );
	}

	this.popup.setSize(
		$container.outerWidth( true ),
		$container.outerHeight( true ),
		false && transition
	);

	return this;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.destroy = function () {
	// Disconnect
	this.surface.getView().disconnect( this );
	this.$window.off( 'resize', this.onWindowResizeHandler );

	// Parent method
	return ve.ui.DesktopContext.super.prototype.destroy.call( this );
};
