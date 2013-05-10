/*!
 * VisualEditor Initialization Target class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic Initialization target.
 *
 * @class
 * @abstract
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {jQuery} $container Conainter to render target into
 */
ve.init.Target = function VeInitTarget( $container ) {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.$ = $container;
	this.surface = null;
};

/* Inheritance */

ve.mixinClass( ve.init.Target, ve.EventEmitter );

/* Methods */

/**
 * Handle window resize events while toolbar floating is enabled.
 *
 * @param {jQuery.Event} e Window resize event
 */
ve.init.Target.prototype.onToolbarFloatingWindowResize = function () {
	if ( !this.surface ) {
		return;
	}

	var $toolbarWrapper = this.surface.$toolbarWrapper,
		$toolbar = this.surface.$toolbar,
		toolbarOffset = $toolbarWrapper.offset();

	if ( $toolbarWrapper.hasClass( 've-ui-toolbar-wrapper-floating' ) ) {
		$toolbar.css( {
			'left': toolbarOffset.left,
			'right': $( window ).width() - $toolbarWrapper.outerWidth() - toolbarOffset.left
		} );
	}
};

/**
 * Handle window scroll events while toolbar floating is enabled.
 *
 * Toolbar will stick to the top of the screen unless it would be over or under the last visible
 * branch node in the root of the document being edited, at which point it will stop just above it.
 *
 * @param {jQuery.Event} e Window scroll event
 */
ve.init.Target.prototype.onToolbarFloatingWindowScroll = function () {
	if ( !this.surface ) {
		return;
	}

	var $window = $( window ),
		scrollTop = $window.scrollTop(),
		$toolbarWrapper = this.surface.$toolbarWrapper,
		$toolbar = this.surface.$toolbar,
		toolbarOffset = $toolbarWrapper.offset(),
		$lastBranch = this.surface.$.find( '.ve-ce-documentNode > .ve-ce-branchNode:visible:last' ),
		lastBranchOffset = $lastBranch.offset(),
		belowLastBranch = $lastBranch.length &&
			scrollTop + $toolbar.height() >= lastBranchOffset.top;

	if ( scrollTop > toolbarOffset.top ) {
		this.floatToolbar(
			belowLastBranch ? lastBranchOffset.top - $toolbarWrapper.outerHeight() : 0,
			toolbarOffset.left,
			$window.width() - $toolbarWrapper.outerWidth() - toolbarOffset.left
		);
	} else {
		this.resetToolbarPosition();
	}
};

/**
 * Float the toolbar.
 *
 * @method
 * @param {number} top Top position, in pixels
 * @param {number} left Left position, in pixels
 * @param {number} right Right position, in pixels
 */
ve.init.Target.prototype.floatToolbar = function ( top, left, right ) {
	if ( !this.surface ) {
		return;
	}

	var $toolbarWrapper = this.surface.$toolbarWrapper,
		$toolbar = this.surface.$toolbar;

	// When switching from default position, manually set the height of the wrapper
	if ( !$toolbarWrapper.hasClass( 've-ui-toolbar-wrapper-floating' ) ) {
		$toolbarWrapper
			.css( 'height', $toolbarWrapper.height() )
			.addClass( 've-ui-toolbar-wrapper-floating' );
	}
	$toolbar.css( { 'top': top, 'left': left, 'right': right } );
	if ( top > 0 ) {
		$toolbarWrapper.addClass( 've-ui-toolbar-wrapper-bottom' );
	} else {
		$toolbarWrapper.removeClass( 've-ui-toolbar-wrapper-bottom' );
	}
};

/**
 * Reset the toolbar to its default position.
 *
 * @method
 */
ve.init.Target.prototype.resetToolbarPosition = function () {
	if ( !this.surface ) {
		return;
	}

	this.surface.$toolbarWrapper
		.css( 'height', 'auto' )
		.removeClass( 've-ui-toolbar-wrapper-floating ve-ui-toolbar-wrapper-bottom' );
	this.surface.$toolbar.css( { 'top': 0, 'left': 0, 'right': 0 } );
};

/**
 * Add automatic floating behavior to the toolbar.
 *
 * Toolbar floating is not enabled by default, call this on setup to enable it.
 *
 * @method
 */
ve.init.Target.prototype.setupToolbarFloating = function () {
	$( window ).on( {
		'resize.ve-init-target': ve.bind( this.onToolbarFloatingWindowResize, this ),
		'scroll.ve-init-target': ve.bind( this.onToolbarFloatingWindowScroll, this )
	} );
};

/**
 * Remove automatic floating behavior to the toolbar.
 *
 * If toolbar floating was enabled, make sure to disable it on tear down.
 *
 * @method
 */
ve.init.Target.prototype.teardownToolbarFloating = function () {
	$( window ).off( '.ve-init-target' );
	this.resetToolbarPosition();
};
