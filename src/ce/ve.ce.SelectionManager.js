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

	this.surface = surface;

	this.userSelectionDeactivate = {};
	this.drawnSelections = {};
	this.drawnSelectionCache = {};

	this.deactivatedSelectionVisible = true;
	this.showDeactivatedAsActivated = false;

	const synchronizer = this.getSurface().getModel().synchronizer;
	if ( synchronizer ) {
		synchronizer.connect( this, {
			authorSelect: 'onSynchronizerAuthorUpdate',
			authorChange: 'onSynchronizerAuthorUpdate',
			authorDisconnect: 'onSynchronizerAuthorDisconnect'
		} );
	}

	// Debounce to prevent trying to draw every cursor position in history.
	this.onSurfacePositionDebounced = ve.debounce( this.onSurfacePosition.bind( this ) );
	this.getSurface().connect( this, { position: this.onSurfacePositionDebounced } );
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
 * Start showing the deactivated selection
 *
 * @param {boolean} [showAsActivated=true] Selection should still show as activated
 */
ve.ce.SelectionManager.prototype.showDeactivatedSelection = function ( showAsActivated ) {
	this.deactivatedSelectionVisible = true;
	this.showDeactivatedAsActivated = showAsActivated === undefined || !!showAsActivated;

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
 * Draw selections.
 *
 * @param {string} name Unique name for the selection being drawn
 * @param {ve.ce.Selection[]} selections Selections to draw
 * @param {Object} [options]
 * @param {string} options.color CSS color for the selection. Should usually
 *  be set in a stylesheet using the generated class name.
 * @param {string} options.wrapperClass Additional CSS class string to add to the $selections wrapper.
 *  mapped to the same index.
 * @param {string} options.label Label shown above each selection
 */
ve.ce.SelectionManager.prototype.drawSelections = function ( name, selections, options ) {
	options = options || {};

	if ( !Object.prototype.hasOwnProperty.call( this.drawnSelections, name ) ) {
		this.drawnSelections[ name ] = {};
	}
	const drawnSelection = this.drawnSelections[ name ];

	drawnSelection.$selections = drawnSelection.$selections ||
		// The following classes are used here:
		// * ve-ce-surface-selections-deactived
		// * ve-ce-surface-selections-<name>
		$( '<div>' ).addClass( 've-ce-surface-selections ve-ce-surface-selections-' + name ).appendTo( this.$element );

	const oldFragments = drawnSelection.fragments || [];
	const oldOptions = drawnSelection.options || {};

	drawnSelection.fragments = selections.map( ( selection ) => this.surface.getModel().getFragment( selection.getModel(), true, true ) );
	drawnSelection.options = options;

	// Always set the 'class' attribute to ensure previously-set classes are cleared.
	drawnSelection.$selections.attr(
		'class',
		've-ce-surface-selections ve-ce-surface-selections-' + name + ' ' +
		( options.wrapperClass || '' )
	);

	const selectionsJustShown = {};
	selections.forEach( ( selection ) => {
		let $selection = this.getDrawnSelection( name, selection.getModel(), options );
		if ( !$selection ) {
			let rects = selection.getSelectionRects();
			if ( !rects ) {
				return;
			}
			rects = ve.minimizeRects( rects );
			$selection = $( '<div>' ).addClass( 've-ce-surface-selection' );
			rects.forEach( ( rect ) => {
				const $rect = $( '<div>' ).css( {
					top: rect.top,
					left: rect.left,
					// Collapsed selections can have a width of 0, so expand
					width: Math.max( rect.width, 1 ),
					height: rect.height
				} );
				$selection.append( $rect );
				if ( options.color ) {
					$rect.css( 'background-color', options.color );
				}
			} );

			if ( options.label ) {
				const boundingRect = selection.getSelectionBoundingRect();
				$selection.append(
					$( '<div>' )
						.addClass( 've-ce-surface-selection-label' )
						.text( options.label )
						.css( {
							top: boundingRect.top,
							left: boundingRect.left,
							'background-color': options.color || ''
						} )
				);
			}
		}
		if ( !$selection.parent().length ) {
			drawnSelection.$selections.append( $selection );
		}
		const cacheKey = this.storeDrawnSelection( $selection, name, selection.getModel(), options );
		selectionsJustShown[ cacheKey ] = true;
	} );

	// Remove any selections that were not in the latest list of selections
	oldFragments.forEach( ( oldFragment ) => {
		const cacheKey = this.getDrawnSelectionCacheKey( name, oldFragment.getSelection(), oldOptions );
		if ( !selectionsJustShown[ cacheKey ] ) {
			const $oldSelection = this.getDrawnSelection( name, oldFragment.getSelection(), oldOptions );
			if ( $oldSelection ) {
				$oldSelection.detach();
			}
		}
	} );
	const hasSelections = Object.keys( this.drawnSelections ).some(
		( n ) => this.drawnSelections[ n ].fragments.some(
			( fragment ) => !fragment.getSelection().isCollapsed()
		)
	);
	this.emit( 'update', hasSelections );
};

/**
 * Get a cache key for a drawn selection
 *
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selection Selection model
 * @param {Object} [options] Selection options
 * @return {string} Cache key
 */
ve.ce.SelectionManager.prototype.getDrawnSelectionCacheKey = function ( name, selection, options ) {
	options = options || {};
	return name + '-' + JSON.stringify( selection ) + '-' + ( options.color || '' ) + '-' + ( options.label || '' );
};

/**
 * Get an already drawn selection from the cache
 *
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selection Selection model
 * @param {Object} [options] Selection options
 * @return {jQuery} Drawn selection
 */
ve.ce.SelectionManager.prototype.getDrawnSelection = function ( name, selection, options ) {
	const cacheKey = this.getDrawnSelectionCacheKey( name, selection, options );
	return Object.prototype.hasOwnProperty.call( this.drawnSelectionCache, cacheKey ) ? this.drawnSelectionCache[ cacheKey ] : null;
};

/**
 * Store an already drawn selection in the cache
 *
 * @param {jQuery} $selection Drawn selection
 * @param {string} name Name of selection group
 * @param {ve.dm.Selection} selection Selection model
 * @param {Object} [options] Selection options
 * @return {string} Cache key
 */
ve.ce.SelectionManager.prototype.storeDrawnSelection = function ( $selection, name, selection, options ) {
	const cacheKey = this.getDrawnSelectionCacheKey( name, selection, options );
	this.drawnSelectionCache[ cacheKey ] = $selection;
	return cacheKey;
};

/**
 * Redraw selections
 *
 * This is triggered by a surface 'position' event, which fires when the surface
 * changes size, or when the document is modified. The drawnSelectionCache is
 * cleared as these two things will cause any previously calculated rectangles
 * to be incorrect.
 */
ve.ce.SelectionManager.prototype.redrawSelections = function () {
	Object.keys( this.drawnSelections ).forEach( ( name ) => {
		const drawnSelection = this.drawnSelections[ name ];
		drawnSelection.$selections.empty();
	} );

	this.drawnSelectionCache = {};
	Object.keys( this.drawnSelections ).forEach( ( name ) => {
		const drawnSelection = this.drawnSelections[ name ];
		const selections = drawnSelection.fragments.map( ( fragments ) => this.surface.getSelection( fragments.getSelection() ) );
		this.drawSelections( name, selections, drawnSelection.options );
	} );
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
			if ( Object.prototype.hasOwnProperty.call( this.drawnSelections, 'otherUserSelection-' + authorId ) ) {
				this.drawnSelections[ 'otherUserSelection-' + authorId ].$selections.addClass( 've-ce-surface-selections-otherUserSelection-inactive' );
			}
			if ( Object.prototype.hasOwnProperty.call( this.drawnSelections, 'otherUserCursor-' + authorId ) ) {
				this.drawnSelections[ 'otherUserCursor-' + authorId ].$selections.addClass( 've-ce-surface-selections-otherUserCursor-inactive' );
			}
		}, 5000 );
	}
	this.userSelectionDeactivate[ authorId ]();

	if ( !selection || selection.isNull() ) {
		this.drawSelections( 'otherUserSelection-' + authorId, [] );
		this.drawSelections( 'otherUserCursor-' + authorId, [] );
		return;
	}

	this.drawSelections(
		'otherUserSelection-' + authorId,
		[ ve.ce.Selection.static.newFromModel( selection, this.getSurface() ) ],
		{
			wrapperClass: 've-ce-surface-selections-otherUserSelection',
			color: color
		}
	);

	const cursorSelection = selection instanceof ve.dm.LinearSelection && this.getSurface().getFocusedNode( selection.getRange() ) ?
		selection : selection.collapseToTo();

	this.drawSelections(
		'otherUserCursor-' + authorId,
		[ ve.ce.Selection.static.newFromModel( cursorSelection, this.getSurface() ) ],
		{
			wrapperClass: 've-ce-surface-selections-otherUserCursor',
			color: color,
			// Label is attached to cursor for 100% opacity, but it should probably be attached
			// to the selection, so the cursor can be selectively rendered just for LinearSelection's.
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
	this.drawSelections( 'otherUserCursor-' + authorId, [] );
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
