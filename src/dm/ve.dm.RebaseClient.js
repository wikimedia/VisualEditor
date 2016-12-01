/*!
 * VisualEditor DataModel rebase client class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DataModel rebase client
 *
 * @class
 */
ve.dm.RebaseClient = function VeDmRebaseClient() {
	/**
	 * @property {number} author Author ID
	 */
	this.author = null;

	/**
	 * @property {number} commitLength Offset up to which we know we have no differences with the server
	 */
	this.commitLength = 0;

	/**
	 * @property {number} sentLength Offset up to which we have no unsent changes
	 */
	this.sentLength = 0;

	/**
	 * @property {number} backtrack Number of transactions backtracked (i.e. rejected) since the last send
	 */
	this.backtrack = 0;

};

/* Inheritance */

OO.initClass( ve.dm.RebaseClient );

/* Abstract methods */

/**
 * @abstract
 * @param {number} start Start point for the change
 * @param {boolean} toSubmit If true, mark current selection as sent
 * @return {ve.dm.Change} The change since start in the client's local history
 */
ve.dm.RebaseClient.prototype.getChangeSince = null;

/**
 * @abstract
 * @param {number} backtrack Number of rejected changes backtracked immediately before this change
 * @param {ve.dm.Change} change The change to send
 */
ve.dm.RebaseClient.prototype.sendChange = null;

/**
 * Apply a change to the surface, and add it to the history
 *
 * @abstract
 * @param {ve.dm.Change} change The change to apply
 */
ve.dm.RebaseClient.prototype.applyChange = null;

/**
 * Unapply a change from the surface, and remove it from the history
 *
 * @abstract
 * @param {ve.dm.Change} change The change to unapply
 */
ve.dm.RebaseClient.prototype.unapplyChange = null;

/**
 * Add a change to history, without applying it to the surface
 *
 * @abstract
 * @param {ve.dm.Change} change The change to add
 */
ve.dm.RebaseClient.prototype.addToHistory = null;

/**
 * Remove a change from history, without unapplying it to the surface
 *
 * @abstract
 * @param {ve.dm.Change} change The change to remove
 */
ve.dm.RebaseClient.prototype.removeFromHistory = null;

/* Methods */

/**
 * @return {number} Author ID
 */
ve.dm.RebaseClient.prototype.getAuthor = function () {
	return this.author;
};

/**
 * @param {number} author Author ID
 */
ve.dm.RebaseClient.prototype.setAuthor = function ( author ) {
	this.author = author;
};

/**
 * Submit all outstanding changes
 *
 * This will submit all transactions that exist in local history but have not been broadcast
 * by the server.
 */
ve.dm.RebaseClient.prototype.submitChange = function () {
	var change = this.getChangeSince( this.sentLength, true );
	if ( change.isEmpty() ) {
		return;
	}
	this.sendChange( this.backtrack, change );
	this.backtrack = 0;
	this.sentLength += change.getLength();
};

/**
 * Accept a committed change from the server
 *
 * If the committed change is by the local author, then it is already applied to the document
 * and at the correct point in history: just move the commitLength pointer.
 *
 * If the commited change is by a different author, then:
 * - Rebase local uncommitted changes over the committed change
 * - If there is a rejected tail, then apply its inverse to the document
 * - Apply the rebase-transposed committed change to the document
 * - Rewrite history to have the committed change followed by rebased uncommitted changes
 *
 * @param {ve.dm.Change} change The committed change from the server
 */
ve.dm.RebaseClient.prototype.acceptChange = function ( change ) {
	var uncommitted, result,
		author = change.firstAuthor();
	if ( !author ) {
		return;
	}

	if ( author !== this.getAuthor() ) {
		uncommitted = this.getChangeSince( this.commitLength, false );
		result = ve.dm.Change.static.rebaseUncommittedChange( change, uncommitted );
		if ( result.rejected ) {
			// Undo rejected tail, and mark unsent and backtracked if necessary
			this.unapplyChange( result.rejected );
			uncommitted = uncommitted.truncate( result.rejected.start - uncommitted.start );
			if ( this.sentLength > result.rejected.start ) {
				this.backtrack += this.sentLength - result.rejected.start;
			}
			this.sentLength = result.rejected.start;
		}
		// We are already right by definition about our own selection
		delete result.transposedHistory.selections[ this.getAuthor() ];
		this.applyChange( result.transposedHistory );
		// Rewrite history
		this.removeFromHistory( result.transposedHistory );
		this.removeFromHistory( uncommitted );
		this.addToHistory( change );
		this.addToHistory( result.rebased );

		this.sentLength += change.getLength();
	}
	this.commitLength += change.getLength();
};
