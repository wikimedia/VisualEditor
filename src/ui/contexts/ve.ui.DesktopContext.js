/*!
 * VisualEditor UserInterface DesktopContext class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Context menu and inspectors.
 *
 * @class
 * @extends ve.ui.LinearContext
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$popupContainer] Clipping container for context popup
 * @param {number} [config.popupPadding=10] Padding between popup and $popupContainer, can be negative
 */
ve.ui.DesktopContext = function VeUiDesktopContext( surface, config ) {
	config = config || {};

	// Parent constructor
	ve.ui.DesktopContext.super.apply( this, arguments );

	// Properties
	this.popup = new OO.ui.PopupWidget( {
		hideWhenOutOfView: false,
		autoFlip: false,
		$container: config.$popupContainer || this.surface.getView().$element,
		containerPadding: config.popupPadding
	} );
	this.position = null;
	this.embeddable = null;
	this.boundingRect = null;
	this.transitioning = null;
	this.dimensions = null;
	this.suppressed = false;
	this.onWindowScrollDebounced = ve.debounce( this.onWindowScroll.bind( this ) );
	this.onWindowResizeHandler = this.onPosition.bind( this );
	this.$window = $( this.getElementWindow() );

	// Events
	this.surface.getView().connect( this, {
		relocationStart: 'onSuppress',
		relocationEnd: 'onUnsuppress',
		position: 'onPosition'
	} );
	this.inspectors.connect( this, {
		resize: 'onInspectorResize'
	} );
	this.$window.on( {
		resize: this.onWindowResizeHandler
	} );
	this.surface.$scrollListener[ 0 ].addEventListener( 'scroll', this.onWindowScrollDebounced, { passive: true } );

	// Initialization
	this.$element
		.addClass( 've-ui-desktopContext' )
		.append( this.$focusTrapBefore, this.popup.$element, this.$focusTrapAfter );
	this.$group.addClass( 've-ui-desktopContext-menu' );
	this.popup.$body.append( this.$group, this.inspectors.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.DesktopContext, ve.ui.LinearContext );

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
 * Handle context suppression event.
 */
ve.ui.DesktopContext.prototype.onSuppress = function () {
	this.suppressed = true;
	if ( this.isVisible() ) {
		if ( !this.isEmpty() ) {
			// Change state: menu -> closed
			this.toggleMenu( false );
			this.toggle( false );
		} else if ( this.inspector ) {
			// Change state: inspector -> closed
			this.inspector.close();
		}
	}
};

/**
 * Handle context unsuppression event.
 */
ve.ui.DesktopContext.prototype.onUnsuppress = function () {
	this.suppressed = false;

	if ( this.isInspectable() ) {
		// Change state: closed -> menu
		this.toggleMenu( true );
		this.toggle( true );
	}
};

/**
 * Handle cursor position change event.
 */
ve.ui.DesktopContext.prototype.onPosition = function () {
	if ( this.isVisible() ) {
		this.updateDimensionsDebounced();
	}
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.createInspectorWindowManager = function () {
	return new ve.ui.DesktopInspectorWindowManager( this.surface, {
		factory: ve.ui.windowFactory,
		overlay: this.surface.getLocalOverlay()
	} );
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.onInspectorOpening = function () {
	ve.ui.DesktopContext.super.prototype.onInspectorOpening.apply( this, arguments );
	// Resize the popup before opening so the body height of the window is measured correctly
	this.setPopupSizeAndPosition();
};

/**
 * Handle inspector resize events
 */
ve.ui.DesktopContext.prototype.onInspectorResize = function () {
	this.updateDimensionsDebounced();
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.toggle = function ( show ) {
	if ( this.transitioning ) {
		return this.transitioning;
	}
	show = show === undefined ? !this.visible : !!show;
	if ( show === this.visible ) {
		return ve.createDeferred().resolve().promise();
	}

	this.transitioning = ve.createDeferred();
	const promise = this.transitioning.promise();

	// Parent method
	ve.ui.DesktopContext.super.prototype.toggle.call( this, show );
	this.popup.toggle( show );

	this.transitioning.resolve();
	this.transitioning = null;
	this.visible = show;

	if ( show ) {
		if ( this.inspector ) {
			this.inspector.updateSize();
		}
		// updateDimensionsDebounced is not necessary here and causes a movement flicker
		this.updateDimensions();
	} else if ( this.inspector ) {
		this.inspector.close();
	}

	return promise;
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.updateDimensions = function () {
	const $container = this.inspector ? this.inspector.$frame : this.$group;

	// Parent method
	ve.ui.DesktopContext.super.prototype.updateDimensions.call( this );

	if ( !this.isVisible() ) {
		return;
	}

	const rtl = this.surface.getModel().getDocument().getDir() === 'rtl';
	const surface = this.surface.getView();
	const focusedNode = surface.getFocusedNode();
	// Selection when the inspector was opened. Used to stop the context from
	// jumping when an inline selection expands, e.g. to cover a long word
	let startingSelection;
	if (
		!focusedNode && this.inspector && this.inspector.initialFragment &&
		// Don't use initial selection if it comes from another document,
		// e.g. the fake document used in source mode.
		this.inspector.getFragment() &&
		this.inspector.getFragment().getDocument() === surface.getModel().getDocument()
	) {
		startingSelection = this.inspector.initialFragment.getSelection();
	}
	const currentSelection = this.surface.getModel().getSelection();
	const isTableSelection = ( startingSelection || currentSelection ) instanceof ve.dm.TableSelection;

	const boundingRect = isTableSelection ?
		surface.getSelection( startingSelection ).getTableBoundingRect() :
		surface.getSelection( startingSelection ).getSelectionBoundingRect();

	this.$element.removeClass( 've-ui-desktopContext-embedded' );

	let position;
	let middle;
	let embeddable = false;
	if ( !boundingRect ) {
		// If !boundingRect, the surface apparently isn't selected.
		// This shouldn't happen because the context is only supposed to be
		// displayed in response to a selection, but it sometimes does happen due
		// to browser weirdness.
		// Skip updating the cursor position, but still update the width and height.
		this.popup.toggleAnchor( true );
		this.popup.setAlignment( 'center' );
	} else if ( isTableSelection || ( focusedNode && !focusedNode.isContent() ) ) {
		embeddable = this.isEmbeddable() &&
			boundingRect.height > this.$group.outerHeight() + 5 &&
			boundingRect.width > this.$group.outerWidth() + 10;
		this.popup.toggleAnchor( !embeddable );
		this.$element.toggleClass( 've-ui-desktopContext-embedded', !!embeddable );
		if ( embeddable ) {
			// Embedded context position depends on directionality
			position = {
				x: rtl ? boundingRect.left : boundingRect.right,
				y: boundingRect.top
			};
			this.popup.setAlignment( 'backwards' );
		} else {
			// Position the context underneath the center of the node
			middle = ( boundingRect.left + boundingRect.right ) / 2;
			position = {
				x: middle,
				y: boundingRect.bottom
			};
			this.popup.setAlignment( 'center' );
		}
	} else {
		// The selection is text or an inline focused node
		const startAndEndRects = surface.getSelection( startingSelection ).getSelectionStartAndEndRects();
		if ( startAndEndRects ) {
			middle = ( boundingRect.left + boundingRect.right ) / 2;
			if (
				( !rtl && startAndEndRects.end.right > middle ) ||
				( rtl && startAndEndRects.end.left < middle )
			) {
				// If the middle position is within the end rect, use it
				position = {
					x: middle,
					y: boundingRect.bottom
				};
			} else {
				// ..otherwise use the side of the end rect
				position = {
					x: rtl ? startAndEndRects.end.left : startAndEndRects.end.right,
					y: startAndEndRects.end.bottom
				};
			}
		}

		this.popup.toggleAnchor( true );
		this.popup.setAlignment( 'center' );
	}

	if ( position ) {
		this.position = position;
	}
	if ( boundingRect ) {
		this.boundingRect = boundingRect;
	}
	this.embeddable = embeddable;
	this.dimensions = {
		width: $container.outerWidth( true ),
		height: $container.outerHeight( true )
	};

	this.setPopupSizeAndPosition();

	return this;
};

/**
 * Handle window scroll events
 *
 * @param {jQuery.Event} e Scroll event
 */
ve.ui.DesktopContext.prototype.onWindowScroll = function () {
	this.setPopupSizeAndPosition( true );
};

/**
 * Check if the context menu for current content is embeddable.
 *
 * @return {boolean} Context menu is embeddable
 */
ve.ui.DesktopContext.prototype.isEmbeddable = function () {
	return this.getRelatedSources().every( ( source ) => source.embeddable );
};

/**
 * Apply the popup's size and position, within the bounds of the viewport
 *
 * @param {boolean} [repositionOnly] Reposition the popup only
 */
ve.ui.DesktopContext.prototype.setPopupSizeAndPosition = function ( repositionOnly ) {
	if ( !this.isVisible() ) {
		return;
	}

	const surface = this.surface;
	const viewport = surface.getViewportDimensions();

	if ( !viewport || !this.dimensions ) {
		// viewport can be null if the surface is not attached
		return;
	}

	const margin = 10,
		minimumVisibleHeight = 100;

	if ( this.popup.hasAnchor() ) {
		// Reserve space for the anchor and one line of text
		// ('40' is arbitrary and has been picked by experimentation)
		viewport.top += 40;
		viewport.height -= 40;
	}

	if ( this.position ) {
		// Float the content if it's bigger than the viewport. Exactly how /
		// whether it should be floated is situational, so this is a
		// preliminary determination. Checks below might cancel the float.
		let floating =
			( !this.embeddable && this.position.y + this.dimensions.height > viewport.bottom - margin ) ||
			( this.embeddable && this.position.y < viewport.top + margin );

		if ( floating ) {
			if ( this.embeddable ) {
				if ( this.boundingRect.bottom - viewport.top - minimumVisibleHeight < this.dimensions.height + margin ) {
					floating = false;
					this.$element.css( {
						left: this.position.x,
						top: this.position.y + this.boundingRect.height - this.dimensions.height - minimumVisibleHeight,
						bottom: ''
					} );
				} else {
					this.$element.css( {
						left: this.position.x + viewport.left,
						top: this.surface.getPadding().top + margin,
						bottom: ''
					} );
				}
			} else {
				if ( viewport.bottom - this.boundingRect.top - minimumVisibleHeight < this.dimensions.height + margin ) {
					floating = false;
					this.$element.css( {
						left: this.position.x,
						top: this.position.y,
						bottom: ''
					} );
				} else {
					this.$element.css( {
						left: this.position.x + viewport.left,
						top: '',
						bottom: this.dimensions.height + margin
					} );
				}
			}
		} else {
			this.$element.css( {
				left: this.position.x,
				top: this.position.y,
				bottom: ''
			} );
		}

		this.$element.toggleClass( 've-ui-desktopContext-floating', !!floating );
		this.popup.toggleAnchor( !floating && !this.embeddable );
	}

	if ( !repositionOnly ) {
		// PopupWidget normally is clippable, suppress that to be able to resize and scroll it into view.
		// Needs to be repeated before every call, as it resets itself when the popup is shown or hidden.
		this.popup.toggleClipping( false );

		// We want to stop the popup from possibly being bigger than the viewport (T114614),
		// as that can result in situations where it's impossible to reach parts
		// of the popup. Limiting it to the window height would ignore toolbars
		// and the find-replace dialog and suchlike. We can't use getViewportDimensions
		// as that doesn't account for the surface height "growing" when we scroll (T304847).
		const maxSurfaceHeight = this.surface.$scrollContainer.height() -
			this.surface.getPadding().top -
			// Allow room for callout and cursor above the context
			30;
		this.popup.setSize( this.dimensions.width, Math.min( this.dimensions.height, maxSurfaceHeight ) );

		this.popup.scrollElementIntoView( { animate: false } );
	}
};

/**
 * @inheritdoc
 */
ve.ui.DesktopContext.prototype.destroy = function () {
	// Hide, so a debounced updateDimensions does nothing
	this.toggle( false );
	// Disconnect
	this.surface.getView().disconnect( this );
	this.surface.getModel().disconnect( this );
	this.inspectors.disconnect( this );
	this.$window.off( {
		resize: this.onWindowResizeHandler
	} );
	this.surface.$scrollListener[ 0 ].removeEventListener( 'scroll', this.onWindowScrollDebounced );
	// Popups bind scroll events if they're in positioning mode, so make sure that's disabled
	this.popup.togglePositioning( false );

	// Parent method
	return ve.ui.DesktopContext.super.prototype.destroy.call( this );
};
