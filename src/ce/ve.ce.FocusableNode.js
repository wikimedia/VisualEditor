/*!
 * VisualEditor ContentEditable FocusableNode class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
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
 * @param {Object} [config] Configuration options
 * @param {jQuery} [$bounding=$focusable] Element to consider for bounding box calculations (e.g.
 *   attaching inspectors)
 * @cfg {string[]} [classes] CSS classes to be added to the highlight container
 */
ve.ce.FocusableNode = function VeCeFocusableNode( $focusable, config ) {
	config = config || {};

	// Properties
	this.focused = false;
	this.highlighted = false;
	this.isFocusableSetup = false;
	this.$highlights = $( '<div>' ).addClass( 've-ce-focusableNode-highlights' );
	this.$focusable = $focusable || this.$element;
	this.$bounding = config.$bounding || this.$focusable;
	this.focusableSurface = null;
	this.rects = null;
	this.boundingRect = null;
	this.startAndEndRects = null;
	this.$icon = null;
	this.touchMoved = false;

	if ( Array.isArray( config.classes ) ) {
		this.$highlights.addClass( config.classes.join( ' ' ) );
	}

	// Use a debounced handler as some actions can trigger redrawHighlights
	// twice in quick succession resizeEnd+rerender
	this.redrawHighlightsDebounced = ve.debounce( this.redrawHighlights.bind( this ), 100 );

	// DOM changes
	this.$element
		.addClass( 've-ce-focusableNode' )
		.prop( 'contentEditable', 'false' );

	// Events
	this.connect( this, {
		setup: 'onFocusableSetup',
		teardown: 'onFocusableTeardown',
		resizeStart: 'onFocusableResizeStart',
		resizeEnd: 'onFocusableResizeEnd',
		rerender: 'onFocusableRerender'
	} );
};

/* Inheritance */

OO.initClass( ve.ce.FocusableNode );

/* Events */

/**
 * @event focus
 */

/**
 * @event blur
 */

/* Static properties */

/**
 * Icon to use when the rendering is considered not visible, as defined in #hasRendering
 *
 * No icon is show if null.
 *
 * @static
 * @property {string|null}
 * @inheritable
 */
ve.ce.FocusableNode.static.iconWhenInvisible = null;

/* Static methods */

/**
 * Get rects for an element
 *
 * @param {jQuery} $element Element to get highlights
 * @param {Object} [relativeRect] Rect with top & left to get position relative to
 * @return {Object} Object containing rects and boundingRect
 */
ve.ce.FocusableNode.static.getRectsForElement = function ( $element, relativeRect ) {
	var i, l, $set, columnCount, columnWidth,
		boundingRect = null,
		rects = [],
		filteredRects = [],
		webkitColumns = 'webkitColumnCount' in document.createElement( 'div' ).style;

	function contains( rect1, rect2 ) {
		return rect2.left >= rect1.left &&
			rect2.top >= rect1.top &&
			rect2.right <= rect1.right &&
			rect2.bottom <= rect1.bottom;
	}

	function process( el ) {
		var i, j, il, jl, contained, clientRects, overflow, $el;

		if ( el.classList.contains( 've-ce-noHighlight' ) ) {
			return;
		}

		$el = $( el );

		if ( webkitColumns ) {
			columnCount = $el.css( '-webkit-column-count' );
			columnWidth = $el.css( '-webkit-column-width' );
			if ( ( columnCount && columnCount !== 'auto' ) || ( columnWidth && columnWidth !== 'auto' ) ) {
				// Support: Chrome
				// Chrome incorrectly measures children of nodes with columns [1], let's
				// just ignore them rather than render a possibly bizarre highlight. They
				// will usually not be positioned, because Chrome also doesn't position
				// them correctly [2] and so people avoid doing it.
				//
				// Of course there are other ways to render a node outside the bounding
				// box of its parent, like negative margin. We do not handle these cases,
				// and the highlight may not correctly cover the entire node if that
				// happens. This can't be worked around without implementing CSS
				// layouting logic ourselves, which is not worth it.
				//
				// [1] https://code.google.com/p/chromium/issues/detail?id=391271
				// [2] https://code.google.com/p/chromium/issues/detail?id=291616

				// jQuery keeps nodes in its collections in document order, so the
				// children have not been processed yet and can be safely removed.
				$set = $set.not( $el.find( '*' ) );
			}
		}

		// Don't descend if overflow is anything but visible as this prevents child
		// elements appearing beyond the bounding box of the parent, *unless* display
		// is inline, in which case the overflow setting will be ignored
		overflow = $el.css( 'overflow' );
		if ( overflow && overflow !== 'visible' && $el.css( 'display' ) !== 'inline' ) {
			$set = $set.not( $el.find( '*' ) );
		}

		clientRects = el.getClientRects();

		for ( i = 0, il = clientRects.length; i < il; i++ ) {
			contained = false;
			for ( j = 0, jl = rects.length; j < jl; j++ ) {
				// This rect is contained by an existing rect, discard
				if ( contains( rects[ j ], clientRects[ i ] ) ) {
					contained = true;
					break;
				}
				// An existing rect is contained by this rect, discard the existing rect
				if ( contains( clientRects[ i ], rects[ j ] ) ) {
					rects.splice( j, 1 );
					j--;
					jl--;
				}
			}
			if ( !contained ) {
				rects.push( clientRects[ i ] );
			}
		}
	}

	$set = $element.find( '*' ).addBack();
	// Calling process() may change $set.length
	for ( i = 0; i < $set.length; i++ ) {
		process( $set[ i ] );
	}

	// Elements with a width/height of 0 return a clientRect with a width/height of 1
	// As elements with an actual width/height of 1 aren't that useful anyway, just
	// throw away anything that is <=1
	filteredRects = rects.filter( function ( rect ) {
		return rect.width > 1 && rect.height > 1;
	} );
	// But if this filtering doesn't leave any rects at all, then we do want to use the 1px rects
	if ( filteredRects.length > 0 ) {
		rects = filteredRects;
	}

	boundingRect = null;

	for ( i = 0, l = rects.length; i < l; i++ ) {
		// Translate to relative
		if ( relativeRect ) {
			rects[ i ] = ve.translateRect( rects[ i ], -relativeRect.left, -relativeRect.top );
		}
		if ( !boundingRect ) {
			boundingRect = ve.copy( rects[ i ] );
		} else {
			boundingRect.top = Math.min( boundingRect.top, rects[ i ].top );
			boundingRect.left = Math.min( boundingRect.left, rects[ i ].left );
			boundingRect.bottom = Math.max( boundingRect.bottom, rects[ i ].bottom );
			boundingRect.right = Math.max( boundingRect.right, rects[ i ].right );
		}
	}
	if ( boundingRect ) {
		boundingRect.width = boundingRect.right - boundingRect.left;
		boundingRect.height = boundingRect.bottom - boundingRect.top;
	}

	return {
		rects: rects,
		boundingRect: boundingRect
	};
};

/* Methods */

/**
 * Create a highlight element.
 *
 * @return {jQuery} A highlight element
 */
ve.ce.FocusableNode.prototype.createHighlight = function () {
	var extraClasses = this.generatedContentsInvalid ? ' ve-ce-focusableNode-highlight-error' : '';
	return $( '<div>' )
		.addClass( 've-ce-focusableNode-highlight' + extraClasses )
		.prop( {
			title: this.constructor.static.getDescription( this.model ),
			draggable: false
		} )
		.append( $( '<img>' )
			.addClass( 've-ce-focusableNode-highlight-relocatable-marker' )
			.attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' )
			.on( {
				mousedown: this.onFocusableMouseDown.bind( this ),
				dragstart: this.onFocusableDragStart.bind( this ),
				dragend: this.onFocusableDragEnd.bind( this )
			} )
		);
};

/**
 * Handle node setup.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableSetup = function () {
	// Exit if already setup or not attached
	if ( this.isFocusableSetup || !this.root ) {
		return;
	}

	this.focusableSurface = this.root.getSurface();

	// DOM changes (duplicated from constructor in case this.$element is replaced)
	this.$element
		.addClass( 've-ce-focusableNode' )
		.prop( 'contentEditable', 'false' );

	// Events
	this.$focusable.on( {
		'mouseenter.ve-ce-focusableNode': this.onFocusableMouseEnter.bind( this ),
		'touchstart.ve-ce-focusableNode': this.onFocusableTouchStart.bind( this ),
		'touchmove.ve-ce-focusableNode': this.onFocusableTouchMove.bind( this ),
		'mousedown.ve-ce-focusableNode touchend.ve-ce-focusableNode': this.onFocusableMouseDown.bind( this )
	} );
	// $element is ce=false so make sure nothing happens when you click
	// on it, just in case the browser decides to do something.
	// If $element == $focusable then this can be skipped as $focusable already
	// handles mousedown events.
	if ( !this.$element.is( this.$focusable ) ) {
		this.$element.on( {
			'mousedown.ve-ce-focusableNode': function ( e ) {
				if ( !ve.isContentEditable( e.target ) ) {
					e.preventDefault();
				}
			}
		} );
	}

	if ( this.constructor.static.iconWhenInvisible ) {
		// Set up the invisible icon, and watch for its continued necessity if
		// unloaded images which don't specify their width or height are
		// involved.
		this.$element
			.find( 'img:not([width]),img:not([height])' )
			.addBack( 'img:not([width]),img:not([height])' )
			.on( 'load', this.updateInvisibleIcon.bind( this ) );
		this.updateInvisibleIcon();
	}

	this.isFocusableSetup = true;
};

/**
 * Update the state of icon if this node is invisible
 *
 * If the node doesn't have a visible rendering, we insert an icon to represent
 * it. If the icon was already present, and this is called again when rendering
 * has developed, we remove the icon.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.updateInvisibleIcon = function () {
	var showIcon,
		rAF = window.requestAnimationFrame || setTimeout,
		node = this;

	if ( !this.constructor.static.iconWhenInvisible ) {
		return;
	}

	// Make sure any existing icon is detached before measuring
	if ( this.$icon ) {
		this.$icon.detach();
	}
	showIcon = !this.hasRendering();

	// Defer updating the DOM. If we don't do this, the hasRendering() call for the next
	// FocusableNode will force a reflow, which is slow.
	rAF( function () {
		if ( showIcon ) {
			if ( !node.$icon ) {
				node.$icon = node.createInvisibleIcon();
			}
			node.$element.first()
				.addClass( 've-ce-focusableNode-invisible' )
				.prepend( node.$icon );
		} else if ( node.$icon ) {
			node.$element.first().removeClass( 've-ce-focusableNode-invisible' );
			node.$icon.detach();
		}
	} );
};

/**
 * Create a element to show if the node is invisible
 *
 * @return {jQuery} Element to show
 */
ve.ce.FocusableNode.prototype.createInvisibleIcon = function () {
	var icon = new OO.ui.IconWidget( {
		classes: [ 've-ce-focusableNode-invisibleIcon' ],
		icon: this.constructor.static.iconWhenInvisible
	} );
	// Add em space for selection highlighting
	icon.$element.text( '\u2003' );
	return icon.$element;
};

/**
 * Handle node teardown.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableTeardown = function () {
	// Exit if not setup or not attached
	if ( !this.isFocusableSetup || !this.root ) {
		return;
	}

	// Events
	this.$focusable.off( '.ve-ce-focusableNode' );
	this.$element.off( '.ve-ce-focusableNode' );

	// Highlights
	this.clearHighlights();

	// DOM changes
	this.$element
		.removeClass( 've-ce-focusableNode' )
		.removeProp( 'contentEditable' );

	this.focusableSurface = null;
	this.isFocusableSetup = false;
};

/**
 * Handle highlight mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
ve.ce.FocusableNode.prototype.onFocusableMouseDown = function ( e ) {
	var range,
		node = this,
		surfaceModel = this.focusableSurface.getModel(),
		selection = surfaceModel.getSelection(),
		nodeRange = this.model.getOuterRange();

	if ( e.type === 'touchend' && this.touchMoved ) {
		return;
	}

	if ( !this.isInContentEditable() ) {
		return;
	}

	if ( e.which === OO.ui.MouseButtons.RIGHT ) {
		// Hide images, and select spans so context menu shows 'copy', but not 'copy image'
		this.$highlights.addClass( 've-ce-focusableNode-highlights-contextOpen' );
		// Make ce=true so we get cut/paste options in context menu
		this.$highlights.prop( 'contentEditable', 'true' );
		ve.selectElement( this.$highlights[ 0 ] );
		setTimeout( function () {
			// Undo everything as soon as the context menu is show
			node.$highlights.removeClass( 've-ce-focusableNode-highlights-contextOpen' );
			node.$highlights.prop( 'contentEditable', 'true' );
			node.focusableSurface.preparePasteTargetForCopy();
		} );
	}

	// Wait for native selection to change before correcting
	setTimeout( function () {
		range = selection instanceof ve.dm.LinearSelection && selection.getRange();
		surfaceModel.getLinearFragment(
			e.shiftKey && range ?
				ve.Range.static.newCoveringRange(
					[ range, nodeRange ], range.from > nodeRange.from
				) :
				nodeRange
		).select();
		node.focusableSurface.updateActiveLink();
	} );
};

/**
 * Handle highlight double click events.
 *
 * @method
 * @param {jQuery.Event} e Double click event
 */
ve.ce.FocusableNode.prototype.onFocusableDblClick = function () {
	if ( !this.isInContentEditable() ) {
		return;
	}
	if ( this.getModel().isEditable() ) {
		this.executeCommand();
	}
};

/**
 * Execute the command associated with this node.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.executeCommand = function () {
	var command, surface;
	if ( !this.model.isInspectable() ) {
		return;
	}
	surface = this.focusableSurface.getSurface();
	command = surface.commandRegistry.getCommandForNode( this );
	if ( command ) {
		command.execute( surface );
	}
};

/**
 * Handle element drag start.
 *
 * @method
 * @param {jQuery.Event} e Drag start event
 */
ve.ce.FocusableNode.prototype.onFocusableDragStart = function () {
	if ( this.focusableSurface ) {
		// Allow dragging this node in the surface
		this.focusableSurface.startRelocation( this );
	}
	this.$highlights.addClass( 've-ce-focusableNode-highlights-relocating' );
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
	if ( this.focusableSurface ) {
		this.focusableSurface.endRelocation();
	}
	this.$highlights.removeClass( 've-ce-focusableNode-highlights-relocating' );
};

/**
 * Handle mouse enter events.
 *
 * @method
 * @param {jQuery.Event} e Mouse enter event
 */
ve.ce.FocusableNode.prototype.onFocusableMouseEnter = function () {
	if ( !this.root.getSurface().dragging && !this.root.getSurface().resizing && this.isInContentEditable() ) {
		this.createHighlights();
	}
};

/**
 * Handle touch start events.
 *
 * @method
 * @param {jQuery.Event} e Touch start event
 */
ve.ce.FocusableNode.prototype.onFocusableTouchStart = function () {
	this.touchMoved = false;
};

/**
 * Handle touch move events.
 *
 * @method
 * @param {jQuery.Event} e Touch move event
 */
ve.ce.FocusableNode.prototype.onFocusableTouchMove = function () {
	this.touchMoved = true;
};

/**
 * Handle surface mouse move events.
 *
 * @method
 * @param {jQuery.Event} e Mouse move event
 */
ve.ce.FocusableNode.prototype.onSurfaceMouseMove = function ( e ) {
	var $target = $( e.target );
	if (
		!$target.hasClass( 've-ce-focusableNode-highlight' ) &&
		!OO.ui.contains( this.$focusable.toArray(), $target[ 0 ], true )
	) {
		this.clearHighlights();
	}
};

/**
 * Handle surface mouse leave events.
 *
 * @method
 * @param {jQuery.Event} e Mouse leave event
 */
ve.ce.FocusableNode.prototype.onSurfaceMouseLeave = function ( e ) {
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
	this.redrawHighlightsDebounced();
};

/**
 * Handle rerender event.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.onFocusableRerender = function () {
	if ( this.focused && this.focusableSurface ) {
		this.redrawHighlightsDebounced();
		// Reposition menu
		this.focusableSurface.getSurface().getContext().updateDimensions( true );
	}
};

/**
 * Check if node is focused.
 *
 * @method
 * @return {boolean} Node is focused
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
			this.$element.addClass( 've-ce-focusableNode-focused' );
			this.createHighlights();
			this.focusableSurface.appendHighlights( this.$highlights, this.focused );
			this.focusableSurface.$element.off( '.ve-ce-focusableNode' );
			this.focusableSurface.connect( this, { position: 'positionHighlights' } );
		} else {
			this.emit( 'blur' );
			this.$element.removeClass( 've-ce-focusableNode-focused' );
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

	this.$highlights.on( {
		mousedown: this.onFocusableMouseDown.bind( this ),
		dblclick: this.onFocusableDblClick.bind( this )
	} );

	this.highlighted = true;

	this.positionHighlights();

	this.focusableSurface.appendHighlights( this.$highlights, this.focused );

	// Events
	if ( !this.focused ) {
		this.focusableSurface.$element.on( {
			'mousemove.ve-ce-focusableNode': this.onSurfaceMouseMove.bind( this ),
			'mouseleave.ve-ce-focusableNode': this.onSurfaceMouseLeave.bind( this )
		} );
	}
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
	this.focusableSurface.$element.off( '.ve-ce-focusableNode' );
	this.focusableSurface.disconnect( this, { position: 'positionHighlights' } );
	this.highlighted = false;
	this.boundingRect = null;
};

/**
 * Redraws highlight.
 *
 * @method
 */
ve.ce.FocusableNode.prototype.redrawHighlights = function () {
	if ( this.focused ) {
		// setFocused will call clearHighlights/createHighlights
		// and also re-bind events.
		this.setFocused( false );
		this.setFocused( true );
	}
};

/**
 * Re-calculate position of highlights
 */
ve.ce.FocusableNode.prototype.calculateHighlights = function () {
	var allRects, surfaceOffset;

	// Protect against calling before/after surface setup/teardown
	if ( !this.focusableSurface ) {
		this.rects = [];
		this.boundingRect = null;
		this.startAndEndRects = null;
		return;
	}

	surfaceOffset = this.focusableSurface.getSurface().getBoundingClientRect();

	allRects = this.constructor.static.getRectsForElement( this.$focusable, surfaceOffset );

	this.rects = allRects.rects;
	this.boundingRect = allRects.boundingRect;
	// startAndEndRects is lazily evaluated in getStartAndEndRects from rects
	this.startAndEndRects = null;
};

/**
 * Positions highlights, and remove collapsed ones
 *
 * @method
 */
ve.ce.FocusableNode.prototype.positionHighlights = function () {
	var i, l;

	if ( !this.highlighted ) {
		return;
	}

	this.calculateHighlights();
	this.$highlights.empty()
		// Append something selectable for right-click copy
		.append( $( '<span>' ).addClass( 've-ce-focusableNode-highlight-selectable' ).html( '&nbsp;' ) );

	for ( i = 0, l = this.rects.length; i < l; i++ ) {
		this.$highlights.append(
			this.createHighlight().css( {
				top: this.rects[ i ].top,
				left: this.rects[ i ].left,
				width: this.rects[ i ].width,
				height: this.rects[ i ].height
			} )
		);
	}
};

/**
 * Get list of rectangles outlining the shape of the node relative to the surface
 *
 * @return {Object[]} List of rectangle objects
 */
ve.ce.FocusableNode.prototype.getRects = function () {
	if ( !this.highlighted ) {
		this.calculateHighlights();
	}
	return this.rects;
};

/**
 * Get the bounding rectangle of the focusable node highlight relative to the surface
 *
 * @return {Object|null} Top, left, bottom & right positions of the focusable node relative to the surface
 */
ve.ce.FocusableNode.prototype.getBoundingRect = function () {
	var surfaceOffset, allRects;
	if ( !this.$bounding.is( this.$focusable ) ) {
		surfaceOffset = this.focusableSurface.getSurface().getBoundingClientRect();
		allRects = this.constructor.static.getRectsForElement( this.$bounding, surfaceOffset );
		return allRects.boundingRect;
	}
	if ( !this.highlighted ) {
		this.calculateHighlights();
	}
	return this.boundingRect;
};

/**
 * Get start and end rectangles of an inline focusable node relative to the surface
 *
 * @return {Object|null} Start and end rectangles
 */
ve.ce.FocusableNode.prototype.getStartAndEndRects = function () {
	if ( !this.highlighted ) {
		this.calculateHighlights();
	}
	if ( !this.startAndEndRects ) {
		this.startAndEndRects = ve.getStartAndEndRects( this.rects );
	}
	return this.startAndEndRects;
};

/**
 * Check if the rendering is visible
 *
 * "Visible", in this case, is defined as any of:
 *  * contains any non-whitespace text
 *  * is greater than 8px x 8px in dimensions
 *
 * @return {boolean} The node has a visible rendering
 */
ve.ce.FocusableNode.prototype.hasRendering = function () {
	var visible = false;
	if ( this.$element.text().trim() !== '' ) {
		return true;
	}
	this.$element.each( function () {
		if (
			( this.offsetWidth >= 8 && this.offsetHeight >= 8 ) ||
			// Check width/height attribute as well. (T125767)
			( this.width >= 8 && this.height >= 8 )
		) {
			visible = true;
			return false;
		}
	} );
	return visible;
};
