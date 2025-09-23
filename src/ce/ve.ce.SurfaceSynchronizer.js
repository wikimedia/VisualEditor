/*!
 * VisualEditor ContentEditable SurfaceSynchronizer class
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable surface synchronizer
 *
 * Handles displaying remote author selections from the surface synchronizer model.
 *
 * @param {ve.ce.Surface} surface
 * @param {ve.dm.SurfaceSynchronizer} model
 */
ve.ce.SurfaceSynchronizer = function VeCeSurfaceSynchronizer( surface, model ) {
	this.surface = surface;
	this.model = model;

	this.userSelectionDeactivateTimers = new Map();

	// Events
	this.model.connect( this, {
		authorSelect: 'onSynchronizerAuthorUpdate',
		authorChange: 'onSynchronizerAuthorUpdate',
		authorDisconnect: 'onSynchronizerAuthorDisconnect',
		wrongDoc: 'onSynchronizerWrongDoc',
		pause: 'onSynchronizerPause'
	} );
	this.surface.connect( this, { position: 'onSurfacePosition' } );
};

/* Initialization */

OO.initClass( ve.ce.SurfaceSynchronizer );

/* Methods */

/**
 * Get the model synchronizer
 *
 * @return {ve.dm.SurfaceSynchronizer}
 */
ve.ce.SurfaceSynchronizer.prototype.getModel = function () {
	return this.model;
};

/**
 * Get the surface
 *
 * @return {ve.ce.Surface}
 */
ve.ce.SurfaceSynchronizer.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Paint a remote author's current selection, as stored in the synchronizer
 *
 * @param {number} authorId The author ID
 */
ve.ce.SurfaceSynchronizer.prototype.paintAuthor = function ( authorId ) {
	const authorData = this.getModel().getAuthorData( authorId ),
		selection = this.getModel().authorSelections[ authorId ],
		selectionManager = this.getSurface().getSelectionManager();

	if ( !authorData || !selection || authorId === this.getModel().getAuthorId() ) {
		return;
	}

	const color = '#' + authorData.color;

	if ( !this.userSelectionDeactivateTimers.has( authorId ) ) {
		this.userSelectionDeactivateTimers.set( authorId, ve.debounce( () => {
			// TODO: Transition away the user label when inactive, maybe dim selection
			if ( selectionManager.selectionGroups.has( 'otherUserSelection-' + authorId ) ) {
				selectionManager.selectionGroups.get( 'otherUserSelection-' + authorId ).$selections.addClass( 've-ce-surface-selections-otherUserSelection-inactive' );
			}
		}, 5000 ) );
	}
	this.userSelectionDeactivateTimers.get( authorId )();

	if ( !selection || selection.isNull() ) {
		selectionManager.drawSelections( 'otherUserSelection-' + authorId, [] );
		return;
	}

	selectionManager.drawSelections(
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
ve.ce.SurfaceSynchronizer.prototype.onSynchronizerAuthorUpdate = function ( authorId ) {
	this.paintAuthor( authorId );
};

/**
 * Called when the synchronizer receives a remote author disconnect
 *
 * @param {number} authorId The author ID
 */
ve.ce.SurfaceSynchronizer.prototype.onSynchronizerAuthorDisconnect = function ( authorId ) {
	this.getSurface().getSelectionManager().drawSelections( 'otherUserSelection-' + authorId, [] );
};

/**
 * Called when the synchronizer reconnects and their is a server doc ID mismatch
 */
ve.ce.SurfaceSynchronizer.prototype.onSynchronizerWrongDoc = function () {
	OO.ui.alert(
		ve.msg( 'visualeditor-rebase-missing-document-error' ),
		{ title: ve.msg( 'visualeditor-rebase-missing-document-title' ) }
	);
};

/**
 * Handle pause events from the synchronizer
 *
 * Drops the opacity of the surface to indicate that no updates are
 * being received from other users.
 */
ve.ce.SurfaceSynchronizer.prototype.onSynchronizerPause = function () {
	this.getSurface().$element.toggleClass( 've-ce-surface-paused', !!this.getModel().paused );
};

/**
 * Handle position events from the surface
 */
ve.ce.SurfaceSynchronizer.prototype.onSurfacePosition = function () {
	// Defer to allow synchronizer to adjust for transactions
	setTimeout( () => {
		const authorSelections = this.getModel().authorSelections;
		for ( const authorId in authorSelections ) {
			this.onSynchronizerAuthorUpdate( +authorId );
		}
	} );
};
