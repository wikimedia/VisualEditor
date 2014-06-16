/*!
 * VisualEditor ContentEditable FocusableNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable focusable node.
 *
 * Focusable elements have a special treatment by ve.ce.Surface. When the user selects only a single
 * node, if it is focusable, the surface will set the focusable node's focused state. Other systems,
 * such as the context, may also use a focusable node's $focusable property as a hint of where the
 * primary element in the node is. Typically, and by default, the primary element is the root
 * element, but in some cases it may need to be configured to be a specific child element within the
 * node's DOM rendering.
 *
 * If your focusable node changes size and the highlight must be redrawn, call redrawHighlights().
 * 'resizeEnd' and 'rerender' are already bound to call this.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} [$focusable=this.$element] Primary element user is focusing on
 */
ve.ce.FocusableNode = function VeCeFocusableNode( $focusable ) {
	// Properties
	this.focused = false;
	this.highlighted = false;
	this.shielded = false;
	this.isSetup = false;
	this.$shields = this.$( [] );
	this.$visibleShields = this.$( [] );
	this.$highlights = this.$( '<div>' ).addClass( 've-ce-focusableNode-highlights' );
	this.$focusable = $focusable || this.$element;
	this.surface = null;

	this.$relocatableMarker = this.$( '<img>' )
		.addClass( 've-ce-focusableNode-highlight-relocatable-marker' )
		.attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' );

	// Events
	this.connect( this, {
		'setup': 'onFocusableSetup',
		'teardown': 'onFocusableTeardown',
		'resizeStart': 'onFocusableResizeStart',
		'resizeEnd': 'onFocusableResizeEnd',
		'rerender': 'onFocusableRerender',
		'live': 'onFocusableLive'
	} );
};

/* Events */

/**
 * @event focus
 */

/**
 * @event blur
 */

/* Static Methods */

ve.ce.FocusableNode.static = {};

ve.ce.FocusableNode.static.isFocusable = true;

/* Methods */

/**
 * Create a shield element.
 *
 * Uses data URI to inject a 1x1 transparent GIF image into the DOM.
 *
 * @returns {jQuery} A shield element
 */
ve.ce.FocusableNode.prototype.createShield = function () {
	return this.$( '<img>' )
		.addClass( 've-ce-focusableNode-shield' )
		.attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' );
};

/**
 * Create a highlight element.
 *
 * @returns {jQuery} A highlight element
 */
ve.ce.FocusableNode.prototype.createHighlight = function () {
	return this.$( '<div>' )
		.addClass( 've-ce-focusableNode-highlight' )
		.attr( 'draggable', false );
};

/**
 * Handle setup event.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableSetup = function () {
	// Exit if already setup or not attached
	if ( this.isSetup || !this.root ) {
		return;
	}

	this.surface = this.getRoot().getSurface();

	// DOM changes
	this.$element
		.addClass( 've-ce-focusableNode ve-ce-focusableNode-requiresShield' )
		.prop( 'contentEditable', 'false' );

	// Events
	this.$element.on( {
		'mouseenter.ve-ce-focusableNode': ve.bind( this.onFocusableMouseEnter, this ),
		'mousedown.ve-ce-focusableNode': ve.bind( this.onFocusableMouseDown, this )
	} );

	this.isSetup = true;
};

/**
 * Handle node live.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableLive = function () {
	// We don't set this.surface here because there are cases where teardown+setup are emitted
	// but live isn't :(
	var surface = this.getRoot().getSurface(),
		surfaceModel = surface.getModel();

	if ( this.live ) {
		surfaceModel.connect( this, { 'history': 'onFocusableHistory' } );
	} else {
		surfaceModel.disconnect( this, { 'history': 'onFocusableHistory' } );
	}
};

/**
 * Attach shields to the node.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.attachShields = function () {
	if ( this.shielded ) {
		return;
	}

	var shields = [], node = this,
		unshieldableFilter = function () {
			return this.nodeType === Node.TEXT_NODE || ve.isVoidElement( this.nodeName );
		};

	// Events
	this.surface.connect( this, { 'position': 'positionHighlights' } );

	// Shields
	this.$element.find( '*' ).addBack().each( function () {
		if ( this.nodeType === Node.ELEMENT_NODE ) {
			var cssFloat, $this = node.$( this );
			// If a generated content wrapper contains only shieldable nodes there's no need to shield it.
			// Doing so may make the shield larger than it needs to be.
			if (
				$this.hasClass( 've-ce-generatedContentNode' ) &&
				!$this.contents().filter( unshieldableFilter ).length
			) {
				// Mark children as requiring shields instead
				$this.children().addClass( 've-ce-focusableNode-requiresShield' );
				return;
			}
			if (
				// Always shield the root
				!$this.hasClass( 've-ce-focusableNode-requiresShield' ) &&
				// Highlights are built off shields, so make sure $focusable has a shield
				!$this.is( node.$focusable )
			) {
				// .css( 'float' ) is *very* expensive so compute at
				// last possible opportunity
				cssFloat = $this.css( 'float' );
				if ( cssFloat === 'none' || cssFloat === '' ) {
					return;
				}
			}
			// Use a plain array to preserve order
			shields.push( node.createShield().appendTo( $this )[0] );
			$this.addClass( 've-ce-focusableNode-shielded' );
		}
	} );

	this.$shields = this.$( shields );
	this.shielded = true;
};

/**
 * Handle history event.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableHistory = function () {
	if ( this.focused ) {
		this.redrawHighlights();
	}
};

/**
 * Handle teardown events.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableTeardown = function () {
	// Exit if not setup or not attached
	if ( !this.isSetup || !this.root ) {
		return;
	}

	// Events
	this.$element.off( '.ve-ce-focusableNode' );
	this.surface.disconnect( this, { 'position': 'positionHighlights' } );

	// Shields
	this.$shields.remove();
	this.$shields = this.$( [] );
	this.$element.find( '.ve-ce-focusableNode-shielded' ).addBack()
		.removeClass( 've-ce-focusableNode-shielded' );
	this.shielded = false;

	// Highlights
	this.clearHighlights();

	// DOM changes
	this.$element
		.removeClass( 've-ce-focusableNode' )
		.removeProp( 'contentEditable' );

	this.isSetup = false;
	this.surface = null;
};

/**
 * Handle highlight mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
ve.ce.FocusableNode.prototype.onFocusableMouseDown = function ( e ) {
	var surfaceModel = this.surface.getModel(),
		selectionRange = surfaceModel.getSelection(),
		nodeRange = this.model.getOuterRange();

	surfaceModel.getFragment(
		e.shiftKey ?
			ve.Range.newCoveringRange(
				[ selectionRange, nodeRange ], selectionRange.from > nodeRange.from
			) :
			nodeRange
	).select();

	if ( !$( e.target ).hasClass( 've-ce-focusableNode-highlight-relocatable-marker' ) ) {
		e.preventDefault();
		// Abort mousedown events otherwise the surface will go into
		// dragging mode on touch devices
		e.stopPropagation();
	}
};

/**
 * Handle element drag start.
 *
 * @method
 * @param {jQuery.Event} e Drag start event
 */
ve.ce.FocusableNode.prototype.onFocusableDragStart = function () {
	if ( this.surface ) {
		// Allow dragging this node in the surface
		this.surface.startRelocation( this );
	}
	this.$relocatableMarker.addClass( 've-ce-focusableNode-highlight-relocating' );
};

/**
 * Handle element drag end.
 *
 * If a relocation actually takes place the node is destroyed before this events fires.
 *
 * @method
 * @param {jQuery.Event} e Drag end event
 */
ve.ce.FocusableNode.prototype.onFocusableDragEnd = function () {
	// endRelocation is usually triggered by onDocumentDrop in the surface, but if it isn't
	// trigger it here instead
	if ( this.surface ) {
		this.surface.endRelocation();
	}
	this.$relocatableMarker.removeClass( 've-ce-focusableNode-highlight-relocating' );
};

/**
 * Handle mouse enter events.
 *
 * @method
 * @param {jQuery.Event} e Mouse enter event
 */
ve.ce.FocusableNode.prototype.onFocusableMouseEnter = function () {
	this.attachShields();
	if ( !this.root.getSurface().dragging && !this.root.getSurface().resizing ) {
		this.createHighlights();
	}
};

/**
 * Handle surface mouse move events.
 *
 * @method
 * @param {jQuery.Event} e Mouse move event
 */
ve.ce.FocusableNode.prototype.onSurfaceMouseMove = function ( e ) {
	var $target = this.$( e.target );
	if (
		!$target.hasClass( 've-ce-focusableNode-highlight' ) &&
		$target.closest( '.ve-ce-focusableNode' ).length === 0
	) {
		this.clearHighlights();
	}
};

/**
 * Handle surface mouse out events.
 *
 * @method
 * @param {jQuery.Event} e Mouse out event
 */
ve.ce.FocusableNode.prototype.onSurfaceMouseOut = function ( e ) {
	if ( e.relatedTarget === null ) {
		this.clearHighlights();
	}
};

/**
 * Handle resize start events.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableResizeStart = function () {
	this.clearHighlights();
};

/**
 * Handle resize end event.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableResizeEnd = function () {
	this.redrawHighlights();
};

/**
 * Handle rerender event.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableRerender = function () {
	if ( this.focused ) {
		this.redrawHighlights();
		// reposition menu
		this.surface.getSurface().getContext().update( true, true );
	}
};

/**
 * Check if node is focused.
 *
 * @method
 * @returns {boolean} Node is focused
 */
ve.ce.FocusableNode.prototype.isFocused = function () {
	return this.focused;
};

/**
 * Set the selected state of the node.
 *
 * @method
 * @param {boolean} value Node is focused
 * @fires focus
 * @fires blur
 */
ve.ce.FocusableNode.prototype.setFocused = function ( value ) {
	value = !!value;
	if ( this.focused !== value ) {
		this.focused = value;
		if ( this.focused ) {
			this.emit( 'focus' );
			this.$focusable.addClass( 've-ce-node-focused' );
			this.createHighlights();
			this.surface.appendHighlights( this.$highlights, this.focused );
			this.surface.$element.off( '.ve-ce-focusableNode' );
		} else {
			this.emit( 'blur' );
			this.$focusable.removeClass( 've-ce-node-focused' );
			this.clearHighlights();
		}
	}
};

/**
 * Creates highlights.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.createHighlights = function () {
	if ( this.highlighted ) {
		return;
	}

	var i, node = this;

	this.attachShields();

	this.$visibleShields = this.$shields.filter( ':visible' );
	for ( i = this.$visibleShields.length - 1; i >= 0; i-- ) {
		this.$highlights.append( this.createHighlight() );
	}

	this.$highlights.on( {
		'mousedown': ve.bind( this.onFocusableMouseDown, this ),
		'dblclick': function () {
			node.emit( 'dblclick' );
		}
	} );

	this.$relocatableMarker.on( {
		'dragstart': ve.bind( this.onFocusableDragStart, this ),
		'dragend': ve.bind( this.onFocusableDragEnd, this )
	} );

	this.highlighted = true;

	// Highlights are positioned from shields so this can be done before attaching
	this.positionHighlights();

	this.surface.appendHighlights( this.$highlights, this.focused );

	if ( !this.focused ) {
		this.surface.$element.on( {
			'mousemove.ve-ce-focusableNode': ve.bind( this.onSurfaceMouseMove, this ),
			'mouseout.ve-ce-focusableNode': ve.bind( this.onSurfaceMouseOut, this )
		} );
	}
	this.surface.getModel().getDocument().connect( this, { 'transact': 'positionHighlights' } );

};

/**
 * Clears highlight.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.clearHighlights = function () {
	if ( !this.highlighted ) {
		return;
	}
	this.$highlights.remove().empty();
	this.$relocatableMarker.off();
	this.surface.$element.unbind( '.ve-ce-focusableNode' );
	this.surface.getModel().getDocument().disconnect( this, { 'transact': 'positionHighlights' } );
	this.highlighted = false;
};

/**
 * Redraws highlight.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.redrawHighlights = function () {
	this.clearHighlights();
	this.createHighlights();
};

/**
 * Positions highlights, and remove collapsed ones
 *
 * @method
 */
ve.ce.FocusableNode.prototype.positionHighlights = function () {
	if ( !this.highlighted ) {
		return;
	}
	var i, l, $shield, $highlight, offset, width, height;
	for ( i = 0, l = this.$visibleShields.length; i < l; i++ ) {
		$shield = this.$( this.$visibleShields[i] );
		$highlight = this.$highlights.children().eq( i );

		offset = OO.ui.Element.getRelativePosition(
			$shield, this.surface.$element
		);
		width = $shield.width();
		height = $shield.height();

		if ( width && height ) {
			$highlight.show().css( {
				'top': offset.top,
				'left': offset.left,
				'height': height,
				'width': width,
				'background-position': -offset.left + 'px ' + -offset.top + 'px'
			} );
		} else {
			this.$visibleShields.splice( i, 1 );
			i--;
			l--;
			$highlight.remove();
		}
	}
	this.$highlights.children().first().append( this.$relocatableMarker );
};

/**
 * Get the offset of the focusable node relative to the surface
 *
 * @return {Object} Top and left offsets of the focusable node relative to the surface
 */
ve.ce.FocusableNode.prototype.getRelativeOffset = function () {
	var $node = this.$visibleShields.first();
	if ( !$node.length ) {
		$node = this.$element;
	}
	return OO.ui.Element.getRelativePosition(
		$node, this.surface.$element
	);
};

/**
 * Get the dimensions of the focusable node
 *
 * @return {Object} Width and height of the focusable node
 */
ve.ce.FocusableNode.prototype.getDimensions = function () {
	var $node = this.$visibleShields.first();
	if ( !$node.length ) {
		$node = this.$element;
	}
	return {
		'width': $node.outerWidth(),
		'height': $node.outerHeight()
	};
};
