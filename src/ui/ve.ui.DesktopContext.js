/*!
 * VisualEditor UserInterface DesktopContext class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
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
	this.popup = new OO.ui.PopupWidget( { $: this.$, $container: this.surface.$element } );
	this.transitioning = null;
	this.suppressed = false;
	this.onWindowResizeHandler = ve.bind( this.onWindowResize, this );
	this.$window = this.$( this.getElementWindow() );

	// Events
	this.surface.getView().connect( this, {
		selectionStart: 'onSuppress',
		selectionEnd: 'onUnsuppress',
		relocationStart: 'onSuppress',
		relocationEnd: 'onUnsuppress',
		blur: 'onSuppress',
		focus: 'onUnsuppress',
		position: 'onSurfacePosition'
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
	this.popup.$element.css( { visibility: 'hidden', display: '' } );
};

/* Inheritance */

OO.inheritClass( ve.ui.DesktopContext, ve.ui.Context );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.afterContextChange = function () {
	// Parent method
	ve.ui.DesktopContext.super.prototype.afterContextChange.call( this );

	// Bypass while dragging
	if ( this.suppressed ) {
		return;
	}
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
	if ( this.isVisible() ) {
		this.updateDimensions( true );
	}
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
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.createInspectorWindowManager = function () {
	return new ve.ui.DesktopInspectorManager( {
		$: this.$,
		factory: ve.ui.windowFactory,
		overlay: this.surface.getLocalOverlay(),
		modal: false,
		isolate: true
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
		visibility: show ? '' : 'hidden',
		display: ''
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
	var $container, inlineRects, position, embeddable, middle,
		rtl = this.surface.getModel().getDocument().getDir() === 'rtl',
		surface = this.surface.getView(),
		focusedNode = surface.getFocusedNode(),
		boundingRect = surface.getSelectionBoundingRelativeRect();

	$container = this.inspector ? this.inspector.$frame : this.menu.$element;

	if ( focusedNode && !focusedNode.isContent() ) {
		embeddable = !this.hasInspector() &&
			boundingRect.height > this.menu.$element.outerHeight() + 5 &&
			boundingRect.width > this.menu.$element.outerWidth() + 10;
		this.popup.toggleAnchor( !embeddable );
		if ( embeddable ) {
			// Embedded context position depends on directionality
			position = {
				x: rtl ? boundingRect.left : boundingRect.right,
				y: boundingRect.top
			};
			this.popup.align = rtl ? 'left' : 'right';
		} else {
			// Position the context underneath the center of the node
			middle = ( boundingRect.left + boundingRect.right ) / 2;
			position = {
				x: middle,
				y: boundingRect.bottom
			};
			this.popup.align = 'center';
		}
	} else {
		// The selection is text or an inline focused node
		inlineRects = surface.getSelectionInlineRelativeRects();
		if ( inlineRects && boundingRect ) {
			middle = ( boundingRect.left + boundingRect.right ) / 2;
			if (
				( !rtl && inlineRects.end.right > middle ) ||
				( rtl && inlineRects.end.left < middle )
			) {
				// If the middle position is within the end rect, use it
				position = {
					x: middle,
					y: boundingRect.bottom
				};
			} else {
				// ..otherwise use the side of the end rect
				position = {
					x: rtl ? inlineRects.end.left : inlineRects.end.right,
					y: inlineRects.end.bottom
				};
			}
		}
		// If !inlineRects, the surface apparently isn't selected, so getSelectionBoundingRelativeRect()
		// returned null. This shouldn't happen because the context is only supposed to be
		// displayed in response to a selection, but for some reason this does happen when opening
		// an inspector without changing the selection.
		// Skip updating the cursor position, but still update the width and height.

		this.popup.toggleAnchor( true );
		this.popup.align = 'center';
	}

	if ( position ) {
		this.$element.css( { left: position.x, top: position.y } );
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
