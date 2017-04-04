/*!
 * VisualEditor DataModel TestRebaseClient class
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Rebase client used for testing
 *
 * @class
 * @extends ve.dm.RebaseClient
 *
 * @constructor
 * @param {ve.dm.TestRebaseServer} server Rebase server
 */
ve.dm.TestRebaseClient = function VeDmTestRebaseClient( server ) {
	ve.dm.RebaseClient.apply( this );

	this.server = server;
	this.incomingPointer = 0;
	this.outgoing = [];
	this.outgoingPointer = 0;
	this.history = new ve.dm.Change( 0, [], [], {} );
	this.trueHistory = [];
};

OO.initClass( ve.dm.TestRebaseClient );
OO.mixinClass( ve.dm.TestRebaseClient, ve.dm.RebaseClient );

ve.dm.TestRebaseClient.static.historySummary = function ( change, commitLength, sentLength ) {
	var committed, sent, unsent,
		text = [];
	if ( commitLength === undefined ) {
		commitLength = change.transactions.length;
	}
	if ( sentLength === undefined ) {
		sentLength = change.transactions.length;
	}
	committed = change.transactions.slice( 0, commitLength ),
	sent = change.transactions.slice( commitLength, sentLength ),
	unsent = change.transactions.slice( sentLength );

	function joinText( transactions ) {
		return transactions.map( function ( transaction ) {
			return transaction.operations.filter( function ( op ) {
				return op.type === 'replace';
			} ).map( function ( op ) {
				var text = [];
				if ( op.remove.length ) {
					text.push( '-(' + op.remove.map( function ( item ) {
						return item[ 0 ];
					} ).join( '' ) + ')' );
				}
				if ( op.insert.length ) {
					text.push( op.insert.map( function ( item ) {
						return item[ 0 ];
					} ).join( '' ) );
				}
				return text.join( '' );
			} ).join( '' );
		} ).join( '' );
	}
	if ( committed.length ) {
		text.push( joinText( committed ) );
	}
	if ( sent.length ) {
		text.push( joinText( sent ) + '?' );
	}
	if ( unsent.length ) {
		text.push( joinText( unsent ) + '!' );
	}
	return text.join( '/' );
};

ve.dm.TestRebaseClient.prototype.getHistorySummary = function () {
	return this.constructor.static.historySummary( this.history, this.commitLength, this.sentLength );
};

ve.dm.TestRebaseClient.prototype.getChangeSince = function ( start ) {
	return this.history.mostRecent( start );
};

ve.dm.TestRebaseClient.prototype.sendChange = function ( backtrack, change ) {
	this.outgoing.push( { backtrack: backtrack, change: change } );
};

ve.dm.TestRebaseClient.prototype.applyChange = function ( change ) {
	var author = this.getAuthor();
	change.transactions.forEach( function ( transaction ) {
		if ( transaction.author === null ) {
			transaction.author = author;
		}
	} );
	this.history.push( change );
	this.trueHistory.push( { change: change, reversed: false } );
};

ve.dm.TestRebaseClient.prototype.unapplyChange = function ( change ) {
	this.history = this.history.truncate( change.start );
	this.trueHistory.push( { change: change, reversed: true } );
};

ve.dm.TestRebaseClient.prototype.addToHistory = function ( change ) {
	this.history.push( change );
};

ve.dm.TestRebaseClient.prototype.removeFromHistory = function ( change ) {
	this.history = this.history.truncate( change.start );
};

ve.dm.TestRebaseClient.prototype.deliverOne = function () {
	var item, rebased;
	item = this.outgoing[ this.outgoingPointer++ ];
	rebased = this.server.applyChange( 'foo', this.getAuthor(), item.backtrack, item.change );
	if ( !rebased.isEmpty() ) {
		this.server.incoming.push( rebased );
	}
};

ve.dm.TestRebaseClient.prototype.receiveOne = function () {
	this.acceptChange( this.server.incoming[ this.incomingPointer++ ] );
};
