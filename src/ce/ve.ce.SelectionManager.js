/*!
 * VisualEditor ContentEditable SelectionManager class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Selection manager
 *
 * Handles rendering of fake selections on the surface:
 * - The deactivated selection stands in the user's native
 *   selection when the native selection is moved elsewhere
 *   (e.g. an inspector, or a dropdown menu).
 * - In a multi-user environment, other users' selections from
 *   the surface synchronizer are rendered here.
 * - Other tools can manually render fake selections, e.g. the
 *   FindAndReplaceDialog can highlight matched text, by calling
 *   #drawSelections directly.
 *
 * @class
 * @extends OO.ui.Element
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {ve.ce.Surface} surface
 */
ve.ce.SelectionManager = function VeCeSelectionManager( surface ) {
	// Parent constructor
	ve.ce.SelectionManager.super.call( this );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.surface = surface;

	this.selectionGroups = new Map();
	this.selectionElementsCache = new Map();

	// Number of rects in a group that can be drawn before viewport clipping applies
	this.viewportClippingLimit = 50;
	// Vertical pixels above and below the viewport to load rects for when viewport clipping applies
	this.viewportClippingPadding = 50;
	// Maximum selections in a group to render (after viewport clipping)
	this.maxRenderedSelections = 50;

	// Deactivated selection
	this.deactivatedSelectionVisible = true;
	this.showDeactivatedAsActivated = false;

	// Events
	// Debounce to prevent trying to draw every cursor position in history.
	this.onSurfacePositionDebounced = ve.debounce( this.onSurfacePosition.bind( this ) );
	this.getSurface().connect( this, { position: this.onSurfacePositionDebounced } );

	this.onWindowScrollDebounced = ve.debounce( this.onWindowScroll.bind( this ), 250 );
	this.getSurface().getSurface().$scrollListener[ 0 ].addEventListener( 'scroll', this.onWindowScrollDebounced, { passive: true } );

	this.$element.addClass( 've-ce-selectionManager' );
	this.$overlay = $( '<div>' ).addClass( 've-ce-selectionManager-overlay' );
};

/* Inheritance */

OO.inheritClass( ve.ce.SelectionManager, OO.ui.Element );

OO.mixinClass( ve.ce.SelectionManager, OO.EventEmitter );

/* Events */

/**
 * @event ve.ce.SelectionManager#update
 * @param {boolean} hasSelections The selection manager has some non-collapsed selections
 */

/* Methods */

/**
 * Destroy the selection manager
 */
ve.ce.SelectionManager.prototype.destroy = function () {
	const synchronizer = this.getSurface().getModel().synchronizer;
	if ( synchronizer ) {
		synchronizer.disconnect( this );
	}
	this.$element.remove();
	this.$overlay.remove();
	this.getSurface().getSurface().$scrollListener[ 0 ].removeEventListener( 'scroll', this.onWindowScrollDebounced );
};

/**
 * Get the surface
 *
 * @return {ve.ce.Surface}
 */
ve.ce.SelectionManager.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Draw selections.
 *
 * @param {string} name Unique name for the selection being drawn
 * @param {ve.ce.Selection[]} selections Selections to draw
 * @param {Object} [options]
 * @param {string} [options.color] CSS color for the selection. Should usually be set in a stylesheet using the generated class name.
 * @param {string} [options.wrapperClass] Additional CSS class string to add to the $selections wrapper.
 * @param {boolean} [options.showRects=true] Show individual selection rectangles (default)
 * @param {boolean} [options.showBounding=false] Show a bounding rectangle around the selection
 * @param {boolean} [options.showCursor=false] Show a separate rectangle at the cursor ('to' position in a non-collapsed selection)
 * @param {boolean} [options.showGutter=false] Show a vertical gutter bar matching the bounding rect
 * @param {boolean} [options.overlay=false] Render all of the selection above the text
 * @param {string} [options.label] Label shown above each selection
 */
ve.ce.SelectionManager.prototype.drawSelections = function ( name, selections, options ) {
	options = options || {};
	if ( !this.selectionGroups.has( name ) ) {
		this.selectionGroups.set( name, new ve.ce.SelectionManager.SelectionGroup( name, this ) );
	}
	const selectionGroup = this.selectionGroups.get( name );

	const oldVisibleSelections = selectionGroup.visibleSelections;
	const oldOptions = selectionGroup.options;

	selectionGroup.setSelections( selections );
	selectionGroup.setOptions( options );

	selectionGroup.cancelIdleCallbacks();

	if ( selections.length > this.viewportClippingLimit ) {
		const viewportRange = this.getSurface().getViewportRange( true, this.viewportClippingPadding );
		if ( viewportRange ) {
			selections = selections.filter( ( selection ) => viewportRange.containsRange( selection.getModel().getCoveringRange() ) );
			selectionGroup.setVisibleSelections( selections );
		} else {
			// Surface not attached - nothing to render
			selections = [];
		}
	}

	const renderSelections = ( selectionsToRender ) => {
		selectionsToRender.forEach( ( selection ) => {
			let selectionElements = this.getCachedSelectionElements( name, selection.getModel(), options );
			if ( !selectionElements ) {
				selectionElements = new ve.ce.SelectionManager.SelectionElements();

				if ( options.showRects !== false ) {
					let rects = selection.getSelectionRects();
					if ( rects ) {
						rects = ve.minimizeRects( rects );
						const $rects = $( '<div>' ).addClass( 've-ce-surface-selection-rects' );
						rects.forEach( ( rect ) => {
							$rects.append(
								$( '<div>' )
									.addClass( 've-ce-surface-selection-rect' )
									.css( {
										top: rect.top,
										left: rect.left,
										// Collapsed selections can have a width of 0, so expand
										width: Math.max( rect.width, 1 ),
										height: rect.height,
										backgroundColor: options.color || undefined
									} )
							);
						} );
						selectionElements.$selection.append( $rects );
					}
				}

				if ( options.showBounding ) {
					const boundingRect = selection.getSelectionBoundingRect();
					if ( boundingRect ) {
						selectionElements.$selection.append(
							$( '<div>' )
								.addClass( 've-ce-surface-selection-bounding' )
								.css( {
									top: boundingRect.top,
									left: boundingRect.left,
									width: boundingRect.width,
									height: boundingRect.height,
									backgroundColor: options.color || undefined
								} )
						);
					}
				}

				if ( options.showGutter ) {
					const boundingRect = selection.getSelectionBoundingRect();
					if ( boundingRect ) {
						selectionElements.$selection.append(
							$( '<div>' )
								.addClass( 've-ce-surface-selection-gutter' )
								.css( {
									top: boundingRect.top,
									height: boundingRect.height,
									backgroundColor: options.color || undefined
								} )
						);
					}
				}

				let cursorRect;

				if ( options.showCursor ) {
					cursorRect = selection.getSelectionFocusRect();
					if ( cursorRect ) {
						selectionElements.$selection.append(
							$( '<div>' )
								.addClass( 've-ce-surface-selection-cursor' )
								.css( {
									top: cursorRect.top,
									left: cursorRect.left,
									width: cursorRect.width,
									height: cursorRect.height,
									borderColor: options.color || undefined
								} )
						);
					}
				}

				if ( options.label ) {
					// Position the label at the cursor if shown, otherwise use the start rect.
					const labelRect = cursorRect || ( selection.getSelectionStartAndEndRects() || {} ).start;

					if ( labelRect ) {
						selectionElements.$overlay.append(
							$( '<div>' )
								.addClass( 've-ce-surface-selection-label' )
								.text( options.label )
								.css( {
									top: labelRect.top,
									left: labelRect.left,
									backgroundColor: options.color || undefined
								} )
						);
					}
				}
			}
			selectionGroup.append( selectionElements );

			this.cacheSelectionElements( selectionElements, name, selection.getModel(), options );
		} );
	};

	if ( selections.length > this.maxRenderedSelections ) {
		const renderBatch = ( start ) => {
			if ( start < selections.length ) {
				selectionGroup.addIdleCallback( () => {
					renderSelections( selections.slice( start, start + this.maxRenderedSelections ) );
					renderBatch( start + this.maxRenderedSelections );
				} );
			}
		};
		renderBatch( 0 );
	} else {
		renderSelections( selections );
	}

	const selectionsToShow = new Set();
	selections.forEach( ( selection ) => {
		const cacheKey = this.getSelectionElementsCacheKey( name, selection.getModel(), options );
		selectionsToShow.add( cacheKey );
	} );

	// Remove any selections that are no longer visible
	oldVisibleSelections.forEach( ( oldSelection ) => {
		const cacheKey = this.getSelectionElementsCacheKey( name, oldSelection.getModel(), oldOptions );
		if ( !selectionsToShow.has( cacheKey ) ) {
			const selectionElements = this.getCachedSelectionElements( name, oldSelection.getModel(), oldOptions );
			if ( selectionElements ) {
				selectionElements.detach();
			}
		}
	} );

	const hasSelections = Array.from( this.selectionGroups.values() ).some( ( group ) => group.hasSelections() );
	this.emit( 'update', hasSelections );
};

/**
 * Change the rendering options for a selection group, if it exists
 *
 * @param {string} name Name of selection group
 * @param {Object} options
 */
ve.ce.SelectionManager.prototype.setOptions = function ( name, options ) {
	const selectionGroup = this.selectionGroups.get( name );

	if ( selectionGroup ) {
		selectionGroup.setOptions( options );
	}
};

/**
 * Get a cache key for a recently drawn selection
 *
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selectionModel Selection model
 * @param {Object} [options] Selection options
 * @return {string} Cache key
 */
ve.ce.SelectionManager.prototype.getSelectionElementsCacheKey = function ( name, selectionModel, options = {} ) {
	return name + '-' + JSON.stringify( selectionModel ) + '-' + JSON.stringify( {
		// Normalize values for cache key
		color: options.color || '',
		showRects: !!options.showRects,
		showBounding: !!options.showBounding,
		showCursor: !!options.showCursor,
		showGutter: !!options.showGutter,
		overlay: !!options.overlay,
		label: options.label || ''
		// Excluded: wrapperClass - this can be modified dynamically without re-rendering
	} );
};

/**
 * Get a recently drawn selection from the cache
 *
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selectionModel Selection model
 * @param {Object} [options] Selection options
 * @return {ve.ce.SelectionElements|null} Selection elements containing $selection and $overlay, null if not found
 */
ve.ce.SelectionManager.prototype.getCachedSelectionElements = function ( name, selectionModel, options ) {
	const cacheKey = this.getSelectionElementsCacheKey( name, selectionModel, options );
	return this.selectionElementsCache.get( cacheKey ) || null;
};

/**
 * Store an recently drawn selection in the cache
 *
 * @param {ve.ce.SelectionElements} selectionElements Selection elements containing $selection and $overlay
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selectionModel Selection model
 * @param {Object} [options] Selection options
 * @return {string} Cache key
 */
ve.ce.SelectionManager.prototype.cacheSelectionElements = function ( selectionElements, name, selectionModel, options ) {
	const cacheKey = this.getSelectionElementsCacheKey( name, selectionModel, options );
	this.selectionElementsCache.set( cacheKey, selectionElements );
	return cacheKey;
};

/**
 * Redraw selections
 *
 * When triggered by a surface 'position' event (which fires when the surface
 * changes size, or when the document is modified), the selectionElementsCache is
 * cleared as these two things will cause any previously calculated rectangles
 * to be incorrect.
 *
 * When triggered by a scroll event, the cache is not cleared, and only
 * selection groups that are clipped to the viewport are redrawn.
 *
 * @param {boolean} [fromScroll=false] The redraw was triggered by a scroll event
 */
ve.ce.SelectionManager.prototype.redrawSelections = function ( fromScroll = false ) {
	if ( !fromScroll ) {
		this.selectionElementsCache.clear();
		for ( const selectionGroup of this.selectionGroups.values() ) {
			selectionGroup.empty();
		}
	}

	for ( const selectionGroup of this.selectionGroups.values() ) {
		if ( !fromScroll ) {
			selectionGroup.empty();
		}
		if ( fromScroll && !selectionGroup.isClipped() ) {
			continue;
		}
		const selections = selectionGroup.fragments.map( ( fragments ) => this.surface.getSelection( fragments.getSelection() ) );
		this.drawSelections( selectionGroup.name, selections, selectionGroup.options );
	}
};

/**
 * Handle position events from the surface
 */
ve.ce.SelectionManager.prototype.onSurfacePosition = function () {
	this.redrawSelections();
};

/**
 * Handle window scroll events
 */
ve.ce.SelectionManager.prototype.onWindowScroll = function () {
	this.redrawSelections( true );
};

/**
 * Start showing the deactivated selection
 *
 * @param {boolean} [showAsActivated=true] Selection should still show as activated
 */
ve.ce.SelectionManager.prototype.showDeactivatedSelection = function ( showAsActivated = true ) {
	this.deactivatedSelectionVisible = true;
	this.showDeactivatedAsActivated = !!showAsActivated;

	this.updateDeactivatedSelection();
};

/**
 * Hide the deactivated selection
 */
ve.ce.SelectionManager.prototype.hideDeactivatedSelection = function () {
	this.deactivatedSelectionVisible = false;

	// Generates ve-ce-surface-selections-deactivated CSS class
	this.drawSelections( 'deactivated', [] );
};

/**
 * Update the deactivated selection
 */
ve.ce.SelectionManager.prototype.updateDeactivatedSelection = function () {
	if ( !this.deactivatedSelectionVisible ) {
		return;
	}
	const surface = this.getSurface();
	const selection = surface.getSelection();

	// Check we have a deactivated surface and a native selection
	if ( selection.isNativeCursor() ) {
		let textColor;
		// For collapsed selections, work out the text color to use for the cursor
		const isCollapsed = selection.getModel().isCollapsed();
		if ( isCollapsed ) {
			const currentNode = surface.getDocument().getBranchNodeFromOffset(
				selection.getModel().getCoveringRange().start
			);
			if ( currentNode ) {
				// This isn't perfect as it doesn't take into account annotations.
				textColor = currentNode.$element.css( 'color' );
			}
		}
		const classes = [];
		if ( !this.showDeactivatedAsActivated ) {
			classes.push( 've-ce-surface-selections-deactivated-showAsDeactivated' );
		}
		if ( isCollapsed ) {
			classes.push( 've-ce-surface-selections-deactivated-collapsed' );
		}
		// Generates ve-ce-surface-selections-deactivated CSS class
		this.drawSelections( 'deactivated', [ selection ], {
			color: textColor,
			wrapperClass: classes.join( ' ' )
		} );
	} else {
		// Generates ve-ce-surface-selections-deactivated CSS class
		this.drawSelections( 'deactivated', [] );
	}
};

/**
 * SelectionGroup: Holds all data for a rendered selection group.
 *
 * @class
 * @constructor
 * @param {string} name Name of the selection group
 * @param {ve.ce.SelectionManager} selectionManager Selection manager
 */
ve.ce.SelectionManager.SelectionGroup = function VeCeSelectionManagerSelectionGroup( name, selectionManager ) {
	this.name = name;
	this.selectionManager = selectionManager;

	// The following classes are used here:
	// * ve-ce-surface-selections-deactivated
	// * ve-ce-surface-selections-<name>
	this.$selections = $( '<div>' ).addClass( 've-ce-surface-selections ve-ce-surface-selections-' + name ).appendTo( this.selectionManager.$element );
	// The following classes are used here:
	// * ve-ce-surface-selections-deactivated
	// * ve-ce-surface-selections-<name>
	this.$overlays = $( '<div>' ).addClass( 've-ce-surface-selections ve-ce-surface-selections-' + name ).appendTo( this.selectionManager.$overlay );

	/** @type {Array<ve.ce.Selection>} */
	this.selections = [];
	/** @type {Array<ve.ce.Selection>} */
	this.visibleSelections = [];
	/** @type {Array<ve.dm.SurfaceFragment>} */
	this.fragments = [];
	/** @type {Object} */
	this.options = {};
	/** @type {number[]} */
	this.idleCallbacks = [];
};

/**
 * Set the rendering options for this selection group
 *
 * @param {Object} options
 */
ve.ce.SelectionManager.SelectionGroup.prototype.setOptions = function ( options ) {
	this.options = options;

	// Always set the 'class' attribute to ensure previously-set classes are cleared.
	this.$selections.add( this.$overlays ).attr(
		'class',
		've-ce-surface-selections ve-ce-surface-selections-' + this.name + ' ' +
		( this.options.wrapperClass || '' )
	);
};

/**
 * Clear all rendered selections
 */
ve.ce.SelectionManager.SelectionGroup.prototype.empty = function () {
	this.$selections.empty();
	this.$overlays.empty();
	this.setVisibleSelections( [] );
};

/**
 * Set the selections for this selection group
 *
 * @param {ve.ce.Selection[]} selections
 */
ve.ce.SelectionManager.SelectionGroup.prototype.setSelections = function ( selections ) {
	// Store selections so we can selectively remove anything that hasn't been
	// redrawn at the exact same selection (oldSelections)
	this.selections = selections;
	// Assume all selections will be visible, unless clipped later
	this.visibleSelections = selections;

	const surfacemodel = this.selectionManager.getSurface().getModel();
	// Store fragments so we can automatically update selections even after
	// the document has been modified (which eventually fires a position event)
	this.fragments = selections.map( ( selection ) => surfacemodel.getFragment( selection.getModel(), true, true ) );
};

/**
 * Set the visible selections for this selection group
 *
 * Must be a subset of the selections set by setSelections.
 *
 * @param {ve.ce.Selection[]} visibleSelections
 */
ve.ce.SelectionManager.SelectionGroup.prototype.setVisibleSelections = function ( visibleSelections ) {
	this.visibleSelections = visibleSelections;
};

/**
 * Check if the selection group is clipped
 *
 * @return {boolean}
 */
ve.ce.SelectionManager.SelectionGroup.prototype.isClipped = function () {
	return this.selections.length !== this.visibleSelections.length;
};

/**
 * Append selection elements to the DOM
 *
 * @param {ve.ce.SelectionManager.SelectionElements} selectionElements
 */
ve.ce.SelectionManager.SelectionGroup.prototype.append = function ( selectionElements ) {
	if ( this.options.overlay ) {
		this.$overlays.append( selectionElements.$selection );
	} else {
		this.$selections.append( selectionElements.$selection );
	}
	this.$overlays.append( selectionElements.$overlay );
};

/**
 * Check if the selection group has some non-collapsed selections
 *
 * @return {boolean}
 */
ve.ce.SelectionManager.SelectionGroup.prototype.hasSelections = function () {
	return this.visibleSelections.some(
		( selection ) => !selection.getModel().isCollapsed()
	);
};

/**
 * Add an idle callback to be executed later
 *
 * @param {Function} callback Callback function
 */
ve.ce.SelectionManager.SelectionGroup.prototype.addIdleCallback = function ( callback ) {
	// Support: Safari
	// eslint-disable-next-line compat/compat
	const request = window.requestIdleCallback || setTimeout;
	// eslint-disable-next-line compat/compat
	const timeout = window.requestIdleCallback ? undefined : 100;
	this.idleCallbacks.push( request( callback, timeout ) );
};

/**
 * Cancel any pending idle callbacks
 */
ve.ce.SelectionManager.SelectionGroup.prototype.cancelIdleCallbacks = function () {
	// Support: Safari
	const cancel = window.cancelIdleCallback || clearTimeout;
	while ( this.idleCallbacks.length ) {
		cancel( this.idleCallbacks.pop() );
	}
};

/**
 * SelectionElements: Holds cached selection/overlay jQuery elements.
 *
 * @class
 * @constructor
 */
ve.ce.SelectionManager.SelectionElements = function VeCeSelectionManagerSelectionElements() {
	this.$selection = $( '<div>' ).addClass( 've-ce-surface-selection' );
	this.$overlay = $( '<div>' ).addClass( 've-ce-surface-selection' );
};

/**
 * Detach the selection elements from the DOM
 */
ve.ce.SelectionManager.SelectionElements.prototype.detach = function () {
	this.$selection.detach();
	this.$overlay.detach();
};
