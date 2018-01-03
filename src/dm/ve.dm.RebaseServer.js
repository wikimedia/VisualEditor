/*!
 * VisualEditor DataModel rebase server class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-env es6 */

/**
 * DataModel rebase server
 *
 * @class
 *
 * @constructor
 * @param {Function} [logCallback]
 */
ve.dm.RebaseServer = function VeDmRebaseServer( logCallback ) {
	this.stateForDoc = new Map();
	this.logEvent = logCallback || function () {};
};

OO.initClass( ve.dm.RebaseServer );

/* Methods */

/**
 * Get the state of a document by name.
 *
 * @param {string} doc Name of a document
 * @return {Promise<ve.dm.RebaseDocState>} Document state
 */
ve.dm.RebaseServer.prototype.getDocState = function ( doc ) {
	if ( !this.stateForDoc.has( doc ) ) {
		this.stateForDoc.set( doc, new ve.dm.RebaseDocState() );
	}
	return Promise.resolve( this.stateForDoc.get( doc ) );
};

/**
 * Update document history
 *
 * @param {string} doc Name of a document
 * @param {number} authorId Author ID
 * @param {ve.dm.Change} [newHistory] New history to append
 * @param {Object} [authorDataChanges] New values for author data (modified keys only)
 * @return {Promise<undefined>}
 */
ve.dm.RebaseServer.prototype.updateDocState = ve.async( function* updateDocState( doc, authorId, newHistory, authorDataChanges ) {
	var key, authorData,
		state = yield this.getDocState( doc );
	if ( newHistory ) {
		state.history.push( newHistory );
	}

	authorData = state.authors.get( authorId );
	if ( !authorData ) {
		authorData = state.constructor.static.newAuthorData();
		state.authors.set( authorId, authorData );
	}
	if ( authorDataChanges ) {
		for ( key in authorData ) {
			if ( authorDataChanges[ key ] !== undefined ) {
				authorData[ key ] = authorDataChanges[ key ];
			}
		}
	}
} );

/**
 * Attempt to rebase and apply a change to a document.
 *
 * The change can be a new change, or a continued change. A continuated change means one that
 * follows on immediately from the author's last submitted change, other than possibly being
 * rebased onto some more recent committed history.
 *
 * @param {string} doc Document name
 * @param {number} authorId Author ID
 * @param {number} backtrack How many transactions are backtracked from the previous submission
 * @param {ve.dm.Change} change Change to apply
 * @return {Promise<ve.dm.Change>} Accepted change (or initial segment thereof), as rebased
 */
ve.dm.RebaseServer.prototype.applyChange = ve.async( function* applyChange( doc, authorId, backtrack, change ) {
	var base, rejections, result, appliedChange,
		state = yield this.getDocState( doc ),
		authorData = state.authors.get( authorId );

	base = authorData.continueBase || change.truncate( 0 );
	rejections = authorData.rejections || 0;
	if ( rejections > backtrack ) {
		// Follow-on does not fully acknowledge outstanding conflicts: reject entirely
		rejections = rejections - backtrack + change.transactions.length;
		yield this.updateDocState( doc, authorId, null, { rejections: rejections } );
		// FIXME argh this publishes an empty change, which is not what we want
		appliedChange = state.history.truncate( 0 );
	} else if ( rejections < backtrack ) {
		throw new Error( 'Backtrack=' + backtrack + ' > ' + rejections + '=rejections' );
	} else {
		if ( change.start > base.start ) {
			// Remote has rebased some committed changes into its history since base was built.
			// They are guaranteed to be equivalent to the start of base. See mathematical
			// docs for proof (Cuius rei demonstrationem mirabilem sane deteximus hanc marginis
			// exiguitas non caperet).
			base = base.mostRecent( change.start );
		}
		base = base.concat( state.history.mostRecent( base.start + base.getLength() ) );

		result = ve.dm.Change.static.rebaseUncommittedChange( base, change );
		rejections = result.rejected ? result.rejected.getLength() : 0;
		yield this.updateDocState( doc, authorId, result.rebased, {
			rejections: rejections,
			continueBase: result.transposedHistory
		} );
		appliedChange = result.rebased;
	}
	this.logEvent( {
		type: 'applyChange',
		doc: doc,
		authorId: authorId,
		incoming: change,
		applied: appliedChange,
		backtrack: backtrack,
		rejections: rejections
	} );
	return appliedChange;
} );
