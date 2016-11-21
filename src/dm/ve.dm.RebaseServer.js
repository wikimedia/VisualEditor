/*!
 * VisualEditor DataModel rebase server class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */
/* eslint-env node, es6 */

/**
 * DataModel rebase server
 *
 * @class
 */
ve.dm.RebaseServer = function VeDmRebaseServer() {
	this.stateForDoc = new Map();
};

OO.initClass( ve.dm.RebaseServer );

/* Methods */

/**
 * Get the state of a document by name.
 *
 * @param {string} name Name of a document
 * @return {Object} Document state (history and selections)
 * @return {ve.dm.Change} return.history History as one big Change
 * @return {Map.<number,ve.dm.Change>} return.continueBases Per-author transposed history for rebasing
 * @return {Map.<number,number>} return.rejections Per-author count of unacknowledged rejections
 */
ve.dm.RebaseServer.prototype.getStateForDoc = function ( name ) {
	if ( !this.stateForDoc.has( name ) ) {
		this.stateForDoc.set( name, {
			history: new ve.dm.Change( 0, [], [], {} ),
			continueBases: new Map(),
			rejections: new Map()
		} );
	}
	return this.stateForDoc.get( name );
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
ve.dm.RebaseServer.prototype.applyChange = function ( doc, author, backtrack, change ) {
	var base, rejections, result,
		state = this.getStateForDoc( doc );

	base = state.continueBases.get( author ) || change.truncate( 0 );
	rejections = state.rejections.get( author ) || 0;
	if ( rejections > backtrack ) {
		// Follow-on does not fully acknowledge outstanding conflicts: reject entirely
		state.rejections.set( author, rejections - backtrack + change.transactions.length );
		return change.truncate( 0 );
	}
	if ( rejections < backtrack ) {
		throw new Error( 'Backtrack=' + backtrack + ' > ' + rejections + '=rejections' );
	}

	if ( change.start > base.start ) {
		// Remote has rebased some committed changes into its history since base was built.
		// They are guaranteed to be equivalent to the start of base. See mathematical
		// docs for proof (Cuius rei demonstrationem mirabilem sane deteximus hanc marginis
		// exiguitas non caperet).
		base = base.mostRecent( change.start );
	}
	base = base.concat( state.history.mostRecent( base.start + base.getLength() ) );

	result = ve.dm.Change.static.rebaseUncommittedChange( base, change );
	state.rejections.set( author, result.rejected ? result.rejected.getLength() : 0 );
	state.continueBases.set( author, result.transposedHistory );

	if ( result.rebased.getLength() ) {
		state.history.push( result.rebased );
	}
	return result.rebased;
};
