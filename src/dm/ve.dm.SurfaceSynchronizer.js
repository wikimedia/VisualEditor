/*!
 * VisualEditor DataModel SurfaceSynchronizer class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */
/* global io */

/**
 * DataModel surface synchronizer.
 *
 * @class
 * @mixins OO.EventEmitter
 * @mixins ve.dm.RebaseClient
 *
 * @constructor
 * @param {ve.dm.Surface} surface Surface model to synchronize
 */
ve.dm.SurfaceSynchronizer = function VeDmSurfaceSynchronizer( surface ) {
	// Mixin constructors
	OO.EventEmitter.call( this );
	ve.dm.RebaseClient.call( this );

	// Properties
	this.surface = surface;
	this.doc = surface.documentModel;
	this.store = this.doc.getStore();
	this.authorSelections = {};
	this.documentId = ve.docName; // HACK

	// Whether we are currently synchronizing the model
	this.applying = false;

	// HACK: Disable in unit tests
	if ( window.QUnit ) {
		return;
	}

	// HACK
	this.socket = io( '/' + this.documentId );
	this.socket.on( 'registered', this.onRegistered.bind( this ) );
	this.socket.on( 'newChange', this.onNewChange.bind( this ) );

	// Events
	this.doc.connect( this, {
		transact: 'onDocumentTransact'
	} );

	this.surface.connect( this, {
		select: 'onSurfaceSelect'
	} );

	this.submitChangeThrottled = ve.debounce( ve.throttle( this.submitChange.bind( this ), 250 ), 0 );
};

/* Inheritance */

OO.mixinClass( ve.dm.SurfaceSynchronizer, OO.EventEmitter );
OO.mixinClass( ve.dm.SurfaceSynchronizer, ve.dm.RebaseClient );

/* Events */

/**
 * @event authorSelect
 * @param {string} author The author whose selection has changed
 */

/* Methods */

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.getChangeSince = function ( start, toSubmit ) {
	var change = this.doc.getChangeSince( start ),
		selection = this.surface.getSelection();
	if ( !selection.equals( this.lastSubmittedSelection ) ) {
		change.selections[ this.getAuthor() ] = selection;
		if ( toSubmit ) {
			this.lastSubmittedSelection = selection;
		}
	}
	return change;
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.sendChange = function ( backtrack, change ) {
	this.socket.emit( 'submitChange', {
		backtrack: this.backtrack,
		change: change.serialize()
	} );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.applyChange = function ( change ) {
	var author;
	// Author selections are superseded by change.selections, so no need to translate them
	for ( author in change.selections ) {
		author = parseInt( author );
		delete this.authorSelections[ author ];
	}
	change.applyTo( this.surface );
	this.applyNewSelections( change.selections );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.unapplyChange = function ( change ) {
	change.unapplyTo( this.surface );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.addToHistory = function ( change ) {
	change.addToHistory( this.doc );
};

/**
 * @inheritdoc
 */
ve.dm.SurfaceSynchronizer.prototype.removeFromHistory = function ( change ) {
	change.removeFromHistory( this.doc );
};

/**
 * Respond to transactions happening on the document. Ignores transactions applied by
 * SurfaceSynchronizer itself.
 *
 * @param {ve.dm.Transaction} tx Transaction that was applied
 */
ve.dm.SurfaceSynchronizer.prototype.onDocumentTransact = function ( tx ) {
	if ( this.applying ) {
		// Ignore our own synchronization transactions
		return;
	}
	// HACK annotate transaction with authorship information
	// This relies on being able to access the transaction object by reference;
	// we should probably set the author deeper in dm.Surface or dm.Document instead.
	tx.author = this.author;
	// TODO deal with staged transactions somehow
	this.applyNewSelections( this.authorSelections, tx );
	this.submitChangeThrottled();
};

/**
 * Respond to selection changes.
 */
ve.dm.SurfaceSynchronizer.prototype.onSurfaceSelect = function () {
	this.submitChangeThrottled();
};

/**
 * Translate incoming selections by change, then apply them and fire authorSelect
 *
 * @param {Object} newSelections Each author (key) maps to a new incoming ve.dm.Selection
 * @param {ve.dm.Change|ve.dm.Transaction} [changeOrTx] Object to translate over, if any
 * @fires authorSelect
 */
ve.dm.SurfaceSynchronizer.prototype.applyNewSelections = function ( newSelections, changeOrTx ) {
	var author, translatedSelection,
		change = changeOrTx instanceof ve.dm.Change ? changeOrTx : null,
		tx = changeOrTx instanceof ve.dm.Transaction ? changeOrTx : null;
	for ( author in newSelections ) {
		author = parseInt( author );
		if ( author === this.author ) {
			continue;
		}
		if ( change ) {
			translatedSelection = newSelections[ author ].translateByChange( change, author );
		} else if ( tx ) {
			translatedSelection = newSelections[ author ].translateByTransactionWithAuthor( tx, author );
		} else {
			translatedSelection = newSelections[ author ];
		}
		// Test equality before assigning, in case this.authorSelections === newSelections
		// changed = !translatedSelection.equals( this.authorSelections[ author ] );
		this.authorSelections[ author ] = translatedSelection;
		this.emit( 'authorSelect', author );
	}
};

/**
 * Respond to a "registered" event from the server
 *
 * @param {number} author The author ID allocated by the server
 */
ve.dm.SurfaceSynchronizer.prototype.onRegistered = function ( author ) {
	this.setAuthor( author );
	this.surface.setAuthor( this.author );
	// HACK
	if ( !window.QUnit ) {
		$( '.ve-demo-editor' ).prepend( $( '<span style="position: absolute; top: 1.5em;">' ).text( this.author ) );
	}
};

/**
 * Respond to a newChange event from the server, signalling a newly committed change
 *
 * If the commited change is by another author, then:
 * - Rebase uncommitted changes over the committed change
 * - If there is a rebase rejection, then apply its inverse to the document
 * - Apply the rebase-transposed committed change to the document
 * - Rewrite history to have the committed change followed by rebased uncommitted changes
 *
 * If the committed change is by the local author, then it is already applied to the document
 * and at the correct point in the history: just move the commit pointer.
 *
 * @param {Object} serializedChange Serialized ve.dm.Change that the server has applied
 */
ve.dm.SurfaceSynchronizer.prototype.onNewChange = function ( serializedChange ) {
	var change = ve.dm.Change.static.deserialize( serializedChange );
	// Make sure we don't attempt to submit any of the transactions we commit while manipulating
	// the state of the document
	this.applying = true;
	try {
		this.acceptChange( change );
	} finally {
		this.applying = false;
	}
	// Schedule submission of unsent local changes, if any
	this.submitChangeThrottled();
};
