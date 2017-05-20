/*!
 * VisualEditor DataModel rebase server class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */
/* eslint-env node, es6 */

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
 * @return {ve.dm.RebaseDocState} Document state
 */
ve.dm.RebaseServer.prototype.getDocState = function ( doc ) {
	if ( !this.stateForDoc.has( doc ) ) {
		this.stateForDoc.set( doc, new ve.dm.RebaseDocState() );
	}
	return this.stateForDoc.get( doc );
};

ve.dm.RebaseServer.prototype.getAuthorData = function ( doc, author ) {
	var state = this.getDocState( doc );
	if ( !state.authors.has( author ) ) {
		state.authors.set( author, {
			displayName: '',
			rejections: 0,
			continueBase: null,
			// TODO use cryptographic randomness here and convert to hex
			token: Math.random(),
			active: true
		} );
	}
	return state.authors.get( author );
};

/**
 * Update document history
 *
 * @param {string} doc Name of a document
 * @param {number} author Author ID
 * @param {ve.dm.Change} [newHistory] New history to append
 * @param {number} [rejections] Unacknowledged rejections for author
 * @param {ve.dm.Change} [continueBase] Continue base for author
 */
ve.dm.RebaseServer.prototype.updateDocState = function ( doc, author, newHistory, rejections, continueBase ) {
	var state = this.getDocState( doc ),
		authorData = state.authors.get( author );
	if ( newHistory ) {
		state.history.push( newHistory );
	}
	if ( rejections !== undefined ) {
		authorData.rejections = rejections;
	}
	if ( continueBase ) {
		authorData.continueBase = continueBase;
	}
};

ve.dm.RebaseServer.prototype.setAuthorName = function ( doc, authorId, authorName ) {
	var authorData = this.getAuthorData( doc, authorId );
	authorData.displayName = authorName;
};

ve.dm.RebaseServer.prototype.getAllNames = function ( doc ) {
	var result = {},
		state = this.getDocState( doc );
	state.authors.forEach( function ( authorData, authorId ) {
		if ( authorData.active ) {
			result[ authorId ] = authorData.displayName;
		}
	} );
	return result;
};

/**
 * Attempt to rebase and apply a change to a document.
 *
 * The change can be a new change, or a continued change. A continuated change means one that
 * follows on immediately from the author's last submitted change, other than possibly being
 * rebased onto some more recent committed history.
 *
 * @param {string} doc Document name
 * @param {number} author Author ID
 * @param {number} backtrack How many transactions are backtracked from the previous submission
 * @param {ve.dm.Change} change Change to apply
 * @return {ve.dm.Change} Accepted change (or initial segment thereof), as rebased
 */
ve.dm.RebaseServer.prototype.applyChange = function applyChange( doc, author, backtrack, change ) {
	var base, rejections, result, appliedChange,
		state = this.getDocState( doc ),
		authorData = this.getAuthorData( doc, author );

	base = authorData.continueBase || change.truncate( 0 );
	rejections = authorData.rejections || 0;
	if ( rejections > backtrack ) {
		// Follow-on does not fully acknowledge outstanding conflicts: reject entirely
		rejections = rejections - backtrack + change.transactions.length;
		this.updateDocState( doc, author, null, rejections, null );
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
		this.updateDocState( doc, author, result.rebased, rejections, result.transposedHistory );
		appliedChange = result.rebased;
	}
	this.logEvent( {
		type: 'applyChange',
		doc: doc,
		author: author,
		incoming: change,
		applied: appliedChange,
		backtrack: backtrack,
		rejections: rejections
	} );
	return appliedChange;
};

ve.dm.RebaseServer.prototype.removeAuthor = function ( doc, author ) {
	var state = this.getDocState( doc );
	state.authors.delete( author );
};
