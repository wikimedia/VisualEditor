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

	// Data about currently rendered selections, keyed by selection name
	// Each entry contains $selections, $overlays, fragments and options
	this.currentSelectionData = {};
	// Cache of recently drawn selections
	this.selectionCache = {};

	// Number of rects in a group that can be drawn before viewport clipping applies
	this.viewportClippingLimit = 50;
	// Vertical pixels above and below the viewport to load rects for when viewport clipping applies
	this.viewportClippingPadding = 50;
	// Maximum selections in a group to render (after viewport clipping)
	this.maxRenderedSelections = 100;

	// Deactivated selection
	this.deactivatedSelectionVisible = true;
	this.showDeactivatedAsActivated = false;

	// Other users' selections
	this.userSelectionDeactivate = {};
	const synchronizer = this.getSurface().getModel().synchronizer;
	if ( synchronizer ) {
		synchronizer.connect( this, {
			authorSelect: 'onSynchronizerAuthorUpdate',
			authorChange: 'onSynchronizerAuthorUpdate',
			authorDisconnect: 'onSynchronizerAuthorDisconnect'
		} );
	}

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
ve.ce.SelectionManager.prototype.drawSelections = function ( name, selections, options = {} ) {
	if ( !Object.prototype.hasOwnProperty.call( this.currentSelectionData, name ) ) {
		this.currentSelectionData[ name ] = {};
	}
	const selectionData = this.currentSelectionData[ name ];

	selectionData.$selections = selectionData.$selections ||
		// The following classes are used here:
		// * ve-ce-surface-selections-deactivated
		// * ve-ce-surface-selections-<name>
		$( '<div>' ).addClass( 've-ce-surface-selections ve-ce-surface-selections-' + name ).appendTo( this.$element );
	selectionData.$overlays = selectionData.$overlays ||
		// The following classes are used here:
		// * ve-ce-surface-selections-deactivated
		// * ve-ce-surface-selections-<name>
		$( '<div>' ).addClass( 've-ce-surface-selections ve-ce-surface-selections-' + name ).appendTo( this.$overlay );

	const oldSelections = selectionData.selections || [];
	const oldOptions = selectionData.options || {};

	// Store selections so we can selectively remove anything that hasn't been
	// redrawn at the exact same selection (oldSelections)
	selectionData.selections = selections;
	// Store fragments so we can automatically update selections even after
	// the document has been modified (which eventually fires a position event)
	selectionData.fragments = selections.map( ( selection ) => this.surface.getModel().getFragment( selection.getModel(), true, true ) );
	selectionData.options = options;

	// Always set the 'class' attribute to ensure previously-set classes are cleared.
	selectionData.$selections.add( selectionData.$overlays ).attr(
		'class',
		've-ce-surface-selections ve-ce-surface-selections-' + name + ' ' +
		( options.wrapperClass || '' )
	);

	selectionData.clipped = false;
	if ( selections.length > this.viewportClippingLimit ) {
		const viewportRange = this.getSurface().getViewportRange( true, this.viewportClippingPadding );
		if ( viewportRange ) {
			selections = selections.filter( ( selection ) => viewportRange.containsRange( selection.getModel().getCoveringRange() ) );
			selectionData.clipped = true;
		} else {
			// Surface not attached - nothing to render
			selections = [];
		}
	}

	if ( selections.length > this.maxRenderedSelections ) {
		selections = selections.slice( 0, this.maxRenderedSelections );
	}

	const selectionsJustShown = new Set();
	selections.forEach( ( selection ) => {
		let selectionElements = this.getCachedSelection( name, selection.getModel(), options );
		if ( !selectionElements ) {
			const $selection = $( '<div>' ).addClass( 've-ce-surface-selection' );
			const $overlay = $( '<div>' ).addClass( 've-ce-surface-selection' );
			selectionElements = {
				$selection,
				$overlay
			};

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
					$selection.append( $rects );
				}
			}

			if ( options.showBounding ) {
				const boundingRect = selection.getSelectionBoundingRect();
				if ( boundingRect ) {
					$selection.append(
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
					$selection.append(
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
				const selectionModel = selection.getModel();
				const cursorSelection = ve.ce.Selection.static.newFromModel(
					( selectionModel instanceof ve.dm.LinearSelection && this.getSurface().getFocusedNode( selectionModel.getRange() ) ?
						selectionModel :
						selectionModel.collapseToTo()
					),
					this.getSurface()
				);
				cursorRect = cursorSelection.getSelectionBoundingRect();
				$selection.append(
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

			if ( options.label ) {
				// Position the label at the cursor if shown, otherwise use the start rect.
				const labelRect = cursorRect || ( selection.getSelectionStartAndEndRects() || {} ).start;

				if ( labelRect ) {
					$overlay.append(
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
		if ( options.overlay ) {
			selectionData.$overlays.append( selectionElements.$selection );
		} else {
			selectionData.$selections.append( selectionElements.$selection );
		}
		selectionData.$overlays.append( selectionElements.$overlay );

		const cacheKey = this.cacheSelection( selectionElements, name, selection.getModel(), options );
		selectionsJustShown.add( cacheKey );
	} );

	// Remove any selections that were not in the latest list of selections
	oldSelections.forEach( ( oldSelection ) => {
		const cacheKey = this.getSelectionCacheKey( name, oldSelection.getModel(), oldOptions );
		if ( !selectionsJustShown.has( cacheKey ) ) {
			const cachedSelection = this.getCachedSelection( name, oldSelection.getModel(), oldOptions );
			if ( cachedSelection ) {
				cachedSelection.$selection.detach();
				cachedSelection.$overlay.detach();
			}
		}
	} );
	const hasSelections = Object.keys( this.currentSelectionData ).some(
		( n ) => this.currentSelectionData[ n ].fragments.some(
			( fragment ) => !fragment.getSelection().isCollapsed()
		)
	);
	this.emit( 'update', hasSelections );
};

/**
 * Get a cache key for a recently drawn selection
 *
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selectionModel Selection model
 * @param {Object} [options] Selection options
 * @return {string} Cache key
 */
ve.ce.SelectionManager.prototype.getSelectionCacheKey = function ( name, selectionModel, options = {} ) {
	return name + '-' + JSON.stringify( selectionModel ) + '-' + JSON.stringify( Object.assign( {}, options, {
		// Normalize values for cache key
		color: options.color || '',
		showRects: !!options.showRects,
		showBounding: !!options.showBounding,
		showCursor: !!options.showCursor,
		showGutter: !!options.showGutter,
		overlay: !!options.overlay,
		label: options.label || ''
	} ) );
};

/**
 * Get a recently drawn selection from the cache
 *
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selectionModel Selection model
 * @param {Object} [options] Selection options
 * @return {Object|null} Selection elements containing $selection and $overlay, null if not found
 */
ve.ce.SelectionManager.prototype.getCachedSelection = function ( name, selectionModel, options ) {
	const cacheKey = this.getSelectionCacheKey( name, selectionModel, options );
	return Object.prototype.hasOwnProperty.call( this.selectionCache, cacheKey ) ? this.selectionCache[ cacheKey ] : null;
};

/**
 * Store an recently drawn selection in the cache
 *
 * @param {Object} selectionElements Selection elements containing $selection and $overlay
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selectionModel Selection model
 * @param {Object} [options] Selection options
 * @return {string} Cache key
 */
ve.ce.SelectionManager.prototype.cacheSelection = function ( selectionElements, name, selectionModel, options ) {
	const cacheKey = this.getSelectionCacheKey( name, selectionModel, options );
	this.selectionCache[ cacheKey ] = selectionElements;
	return cacheKey;
};

/**
 * Redraw selections
 *
 * When triggered by a surface 'position' event (which fires when the surface
 * changes size, or when the document is modified), the selectionCache is
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
		this.selectionCache = {};
	}

	Object.keys( this.currentSelectionData ).forEach( ( name ) => {
		const selectionData = this.currentSelectionData[ name ];
		if ( fromScroll && !selectionData.clipped ) {
			return;
		}
		selectionData.$selections.empty();
		const selections = selectionData.fragments.map( ( fragments ) => this.surface.getSelection( fragments.getSelection() ) );
		this.drawSelections( name, selections, selectionData.options );
	} );
};

/**
 * Respond to a position event on this surface
 */
ve.ce.SelectionManager.prototype.onSurfacePosition = function () {
	this.redrawSelections();

	const synchronizer = this.getSurface().getModel().synchronizer;
	if ( synchronizer ) {
		// Defer to allow surface synchronizer to adjust for transactions
		setTimeout( () => {
			const authorSelections = synchronizer.authorSelections;
			for ( const authorId in authorSelections ) {
				this.onSynchronizerAuthorUpdate( +authorId );
			}
		} );
	}
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
 * Paint a remote author's current selection, as stored in the synchronizer
 *
 * @param {number} authorId The author ID
 */
ve.ce.SelectionManager.prototype.paintAuthor = function ( authorId ) {
	const synchronizer = this.getSurface().getModel().synchronizer,
		authorData = synchronizer.getAuthorData( authorId ),
		selection = synchronizer.authorSelections[ authorId ];

	if ( !authorData || !selection || authorId === synchronizer.getAuthorId() ) {
		return;
	}

	const color = '#' + authorData.color;

	if ( !Object.prototype.hasOwnProperty.call( this.userSelectionDeactivate, authorId ) ) {
		this.userSelectionDeactivate[ authorId ] = ve.debounce( () => {
			// TODO: Transition away the user label when inactive, maybe dim selection
			if ( Object.prototype.hasOwnProperty.call( this.currentSelectionData, 'otherUserSelection-' + authorId ) ) {
				this.currentSelectionData[ 'otherUserSelection-' + authorId ].$selections.addClass( 've-ce-surface-selections-otherUserSelection-inactive' );
			}
		}, 5000 );
	}
	this.userSelectionDeactivate[ authorId ]();

	if ( !selection || selection.isNull() ) {
		this.drawSelections( 'otherUserSelection-' + authorId, [] );
		return;
	}

	this.drawSelections(
		'otherUserSelection-' + authorId,
		[ ve.ce.Selection.static.newFromModel( selection, this.getSurface() ) ],
		{
			wrapperClass: 've-ce-surface-selections-otherUserSelection',
			color: color,
			showCursor: true,
			label: authorData.name
		}
	);
};

/**
 * Called when the synchronizer receives a remote author selection or name change
 *
 * @param {number} authorId The author ID
 */
ve.ce.SelectionManager.prototype.onSynchronizerAuthorUpdate = function ( authorId ) {
	this.paintAuthor( authorId );
};

/**
 * Called when the synchronizer receives a remote author disconnect
 *
 * @param {number} authorId The author ID
 */
ve.ce.SelectionManager.prototype.onSynchronizerAuthorDisconnect = function ( authorId ) {
	this.drawSelections( 'otherUserSelection-' + authorId, [] );
};
