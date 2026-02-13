/*!
 * VisualEditor UserInterface PositionedTargetToolbar class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * UserInterface positioned target toolbar.
 *
 * @class
 * @extends ve.ui.TargetToolbar
 *
 * @constructor
 * @param {ve.init.Target} target
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.floatable] Toolbar can float when scrolled off the page
 * @param {boolean} [config.attachToolbarDialogs=true]
 */
ve.ui.PositionedTargetToolbar = function VeUiPositionedTargetToolbar( target, config = {} ) {
	// Parent constructor
	ve.ui.PositionedTargetToolbar.super.apply( this, arguments );

	// Change default overlay to be this.$bar, instead of this.$element (T209192)
	// TODO: Upstream to OOUI
	if ( !config.$overlay ) {
		this.$overlay = this.$bar.append( this.$popups );
	}

	// Properties
	this.floating = false;
	this.floatable = !!config.floatable;
	this.attachToolbarDialogs = config.attachToolbarDialogs !== false;
	this.height = 0;
	this.elementOffset = null;
	this.onWindowScrollThrottled = ve.throttle( this.onWindowScroll.bind( this ), 250 );

	// Events
	this.$element.on( 'focusin focusout', ve.debounce( this.onFocusChange.bind( this ) ) );

	// Initialization
	this.$element.addClass( 've-ui-positionedTargetToolbar' );
	if ( this.floatable ) {
		this.$element.addClass( 've-ui-positionedTargetToolbar-floatable' );
	}
};

/* Inheritance */

OO.inheritClass( ve.ui.PositionedTargetToolbar, ve.ui.TargetToolbar );

/* Methods */

/**
 * Handle focus change events on the toolbar.
 *
 * @param {jQuery.Event} event Focus change event
 */
ve.ui.PositionedTargetToolbar.prototype.onFocusChange = function () {
	if ( this.getSurface() ) {
		this.getSurface().suppressScrollPadding(
			this.$element[ 0 ].contains( document.activeElement )
		);
	}
};

/**
 * @inheritdoc
 */
ve.ui.PositionedTargetToolbar.prototype.setup = function ( groups, surface ) {
	// Parent method
	ve.ui.PositionedTargetToolbar.super.prototype.setup.apply( this, arguments );

	if ( this.attachToolbarDialogs ) {
		ve.ui.ToolbarDialogWindowManager.static.positions.forEach( ( dialogPosition ) => {
			const toolbarDialogs = surface.getToolbarDialogs( dialogPosition );
			if ( this.position === 'bottom' ) {
				this.$bar.prepend( toolbarDialogs.$element );
			} else {
				this.$bar.append( toolbarDialogs.$element );
			}
			toolbarDialogs.connect( this, {
				opening: 'onToolbarDialogsOpeningOrClosing',
				closing: 'onToolbarDialogsOpeningOrClosing'
			} );
		} );
	}
	if ( this.isFloatable() ) {
		this.target.$scrollListener[ 0 ].addEventListener( 'scroll', this.onWindowScrollThrottled, { passive: true } );
	}
};

/**
 * @inheritdoc
 */
ve.ui.PositionedTargetToolbar.prototype.detach = function () {
	// Events
	if ( this.getSurface() ) {
		ve.ui.ToolbarDialogWindowManager.static.positions.forEach( ( dialogPosition ) => {
			this.getSurface().getToolbarDialogs( dialogPosition ).disconnect( this );
			this.getSurface().getToolbarDialogs( dialogPosition ).clearWindows();
		} );
	}
	this.target.$scrollListener[ 0 ].removeEventListener( 'scroll', this.onWindowScrollThrottled );

	// Parent method
	ve.ui.PositionedTargetToolbar.super.prototype.detach.apply( this, arguments );
};

/**
 * While toolbar floating is enabled,
 * the toolbar will stick to the top of the screen unless it would be over or under the last visible
 * branch node in the root of the document being edited, at which point it will stop just above it.
 *
 * @inheritdoc
 */
ve.ui.PositionedTargetToolbar.prototype.onWindowResize = function () {
	// Parent method
	ve.ui.PositionedTargetToolbar.super.prototype.onWindowResize.call( this );

	// Update offsets after resize (see #float)
	this.calculateOffset();
	this.onViewportResize();
	// Re-calculate height as toolbar might start wrapping at different widths
	this.calculateHeight();
};

/**
 * Calculate the left and right offsets of the toolbar
 */
ve.ui.PositionedTargetToolbar.prototype.calculateOffset = function () {
	const $container = this.$element.parent();
	this.elementOffset = $container.offset();
};

/**
 * Get height of the toolbar while floating
 *
 * @return {number} Height of the toolbar
 */
ve.ui.PositionedTargetToolbar.prototype.getHeight = function () {
	return this.height;
};

/**
 * Get toolbar element's offsets
 *
 * @return {Object} Toolbar element's offsets
 */
ve.ui.PositionedTargetToolbar.prototype.getElementOffset = function () {
	if ( !this.elementOffset ) {
		this.calculateOffset();
	}
	return this.elementOffset;
};

/**
 * Float the toolbar.
 */
ve.ui.PositionedTargetToolbar.prototype.float = function () {
	if ( !this.floating ) {
		this.$element.addClass( 've-ui-toolbar-floating' );
		this.floating = true;
		this.calculateHeight();
		this.onViewportResize();
	}
};

/**
 * Reset the toolbar to it's default non-floating state.
 */
ve.ui.PositionedTargetToolbar.prototype.unfloat = function () {
	if ( this.floating ) {
		this.$element.removeClass( 've-ui-toolbar-floating' );
		this.floating = false;
		this.calculateHeight();
		this.onViewportResize();
	}
};

/**
 * Calculate the height of the toolbar and emit a resize event if it has changed.
 *
 * @fires ve.ui.Toolbar#resize
 */
ve.ui.PositionedTargetToolbar.prototype.calculateHeight = function () {
	const oldHeight = this.height;
	this.height = this.floating ? this.$bar[ 0 ].offsetHeight : 0;
	if ( this.height !== oldHeight ) {
		this.emit( 'resize' );
	}
};

/**
 * Check if the toolbar is floating
 *
 * @return {boolean} The toolbar is floating
 */
ve.ui.PositionedTargetToolbar.prototype.isFloating = function () {
	return this.floating;
};

/**
 * Check if the toolbar can float
 *
 * @return {boolean} The toolbar can float
 */
ve.ui.PositionedTargetToolbar.prototype.isFloatable = function () {
	return this.floatable;
};

/**
 * Handle windows opening or closing in the toolbar window manager.
 *
 * @param {OO.ui.Window} win
 * @param {jQuery.Promise} openingOrClosing
 * @param {Object} data
 */
ve.ui.PositionedTargetToolbar.prototype.onToolbarDialogsOpeningOrClosing = function ( win, openingOrClosing ) {
	const $surface = this.getSurface().$element,
		transitionDuration = OO.ui.theme.getDialogTransitionDuration();

	// win.isOpened before promise means we are closing
	if ( win.constructor.static.position === 'side' && win.isOpened() ) {
		// First closing transition
		$surface.css(
			$surface.css( 'direction' ) === 'rtl' ? 'margin-left' : 'margin-right',
			''
		);
		win.$element.css( 'width', '' );
	}

	openingOrClosing.then( () => {
		if ( win.constructor.static.position === 'side' ) {
			// win.isOpened after promise means we are opening
			if ( win.isOpened() ) {
				const margin = $surface.css( 'direction' ) === 'rtl' ? 'margin-left' : 'margin-right';
				const originalMargin = parseFloat( $surface.css( margin ) );
				const width = win.getSizeProperties().width;
				this.getSurface().$element
					.addClass( 've-ui-surface-toolbarDialog-side' )
					.css( margin, width + originalMargin );
				win.$element.css( 'width', width );
			} else {
				// Second closing transition
				this.getSurface().$element.removeClass( 've-ui-surface-toolbarDialog-side' );
			}

			this.onViewportResize();
			setTimeout( () => {
				this.onViewportResize();
				this.getSurface().getView().emit( 'position' );
			}, transitionDuration );
		} else if (
			win.constructor.static.position === 'above' ||
			win.constructor.static.position === 'below'
		) {
			setTimeout( () => {
				this.onViewportResize();
				this.getSurface().getView().emit( 'position' );
			}, transitionDuration );
		}
		// Wait for window transition
		setTimeout( () => {
			this.calculateHeight();
		}, transitionDuration );
	} );
};

/**
 * Handle the visible part of the surface viewport change dimensions
 */
ve.ui.PositionedTargetToolbar.prototype.onViewportResize = function () {
	const surface = this.getSurface();

	if ( !surface ) {
		return;
	}

	const sideWindow = surface.getToolbarDialogs( 'side' ).getCurrentWindow();

	if ( sideWindow ) {
		const viewportDimensions = surface.getViewportDimensions();
		if ( viewportDimensions ) {
			// TODO: Add on the gap between the surface and the bottom of the toolbar
			// (e.g. as used by #siteSub) as the sidebar moves up into this space.
			// It is only usually about 20px, so not a big issue for now.
			const surfaceRect = surface.getBoundingClientRect();
			const sideWindowRect = sideWindow.$frame[ 0 ].getBoundingClientRect();
			sideWindow.$frame.css( 'height', Math.min( surfaceRect.bottom - sideWindowRect.top, viewportDimensions.height ) );
		}
	}
};

/**
 * Handle window scroll events
 */
ve.ui.PositionedTargetToolbar.prototype.onWindowScroll = function () {
	this.onViewportResize();
};
