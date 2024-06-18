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
 */
ve.ui.PositionedTargetToolbar = function VeUiPositionedTargetToolbar( target, config ) {
	config = config || {};

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
	this.height = 0;
	this.elementOffset = null;
	this.onWindowScrollThrottled = ve.throttle( this.onWindowScroll.bind( this ), 250 );

	// Initialization
	this.$element.addClass( 've-ui-positionedTargetToolbar' );
};

/* Inheritance */

OO.inheritClass( ve.ui.PositionedTargetToolbar, ve.ui.TargetToolbar );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.PositionedTargetToolbar.prototype.setup = function ( groups, surface ) {
	// Parent method
	ve.ui.PositionedTargetToolbar.super.prototype.setup.apply( this, arguments );

	[ 'above', 'below', 'side', 'inline' ].forEach( ( dialogPosition ) => {
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
		[ 'above', 'below', 'side', 'inline' ].forEach( ( dialogPosition ) => {
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
	ve.ui.Toolbar.super.prototype.onWindowResize.call( this );

	// Update offsets after resize (see #float)
	this.calculateOffset();

	if ( this.floating ) {
		this.$bar.css( {
			left: this.elementOffset.left,
			right: this.elementOffset.right
		} );
	}

	this.onViewportResize();
};

/**
 * Calculate the left and right offsets of the toolbar
 */
ve.ui.PositionedTargetToolbar.prototype.calculateOffset = function () {
	this.elementOffset = this.$element.offset();
	this.elementOffset.right = document.documentElement.clientWidth - this.$element[ 0 ].offsetWidth - this.elementOffset.left;
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
		this.height = this.$bar[ 0 ].offsetHeight;
		// When switching into floating mode, set the height of the wrapper and
		// move the bar to the same offset as the in-flow element
		this.$element
			.css( 'height', this.height )
			.addClass( 've-ui-toolbar-floating' );
		this.$bar.css( {
			left: this.elementOffset.left,
			right: this.elementOffset.right
		} );
		this.floating = true;
		this.emit( 'resize' );
		this.onViewportResize();
	}
};

/**
 * Reset the toolbar to it's default non-floating position.
 */
ve.ui.PositionedTargetToolbar.prototype.unfloat = function () {
	if ( this.floating ) {
		this.height = 0;
		this.$element
			.css( 'height', '' )
			.removeClass( 've-ui-toolbar-floating' );
		this.$bar.css( { left: '', right: '' } );
		this.floating = false;
		this.emit( 'resize' );
		this.onViewportResize();
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
			this.getSurface().getView().emit( 'position' );
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
			if ( this.floating ) {
				// Re-calculate height
				this.unfloat();
				this.float();
			}
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
			sideWindow.$frame.css(
				'height', Math.min( surface.getBoundingClientRect().height, viewportDimensions.height )
			);
		}
	}
};

/**
 * Handle window scroll events
 */
ve.ui.PositionedTargetToolbar.prototype.onWindowScroll = function () {
	if ( !this.floating ) {
		this.onViewportResize();
	}
};
