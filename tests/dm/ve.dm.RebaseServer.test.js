/*!
 * VisualEditor DataModel Rebase client/server logic tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.RebaseServer' );

ve.dm.testHistorySummary = function ( change, commitLength, sentLength ) {
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

ve.dm.TestRebaseServer = function VeDmRebaseServer() {
	ve.dm.RebaseServer.apply( this );
};

OO.inheritClass( ve.dm.TestRebaseServer, ve.dm.RebaseServer );

ve.dm.TestRebaseServer.prototype.historySummary = function () {
	return ve.dm.testHistorySummary( this.stateForDoc.get( 'foo' ).history );
};

ve.dm.TestRebaseClient = function VeDmTestRebaseClient( server, sharedIncoming ) {
	ve.dm.RebaseClient.apply( this );
	this.server = server;
	this.sharedIncoming = sharedIncoming;
	this.incomingPointer = 0;
	this.outgoing = [];
	this.outgoingPointer = 0;
	this.history = new ve.dm.Change( 0, [], [], {} );
	this.trueHistory = [];
};

OO.initClass( ve.dm.TestRebaseClient );
OO.mixinClass( ve.dm.TestRebaseClient, ve.dm.RebaseClient );

ve.dm.TestRebaseClient.prototype.historySummary = function () {
	return ve.dm.testHistorySummary( this.history, this.commitLength, this.sentLength );
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
		this.sharedIncoming.push( rebased );
	}
};

ve.dm.TestRebaseClient.prototype.receiveOne = function () {
	this.acceptChange( this.sharedIncoming[ this.incomingPointer++ ] );
};

QUnit.test( 'Rebase', 43, function ( assert ) {
	var origData = [ { type: 'paragraph' }, { type: '/paragraph' } ],
		newSurface = function () {
			return new ve.dm.Surface(
				ve.dm.example.createExampleDocumentFromData( origData )
			);
		},
		txReplace = function ( before, remove, insert, after ) {
			return new ve.dm.Transaction( [
				{ type: 'retain', length: before },
				{
					type: 'replace',
					remove: remove,
					insert: insert,
					insertedDataOffset: 0,
					insertedDataLength: insert.length
				},
				{ type: 'retain', length: after }
			] );
		},
		txInsert = function ( before, insert, after ) {
			return txReplace( before, [], insert, after );
		},
		txRemove = function ( before, remove, after ) {
			return txReplace( before, remove, [], after );
		},
		noVals = new ve.dm.IndexValueStore(),
		surface = newSurface(),
		doc = surface.documentModel,
		newSel = function ( offset ) {
			return new ve.dm.LinearSelection( doc, new ve.Range( offset ) );
		},
		b = ve.dm.example.bold,
		i = ve.dm.example.italic,
		u = ve.dm.example.underline,
		bIndex = [ ve.dm.example.boldIndex ],
		iIndex = [ ve.dm.example.italicIndex ],
		uIndex = [ ve.dm.example.underlineIndex ],
		bStore = new ve.dm.IndexValueStore( [ b ] ),
		iStore = new ve.dm.IndexValueStore( [ i ] ),
		uStore = new ve.dm.IndexValueStore( [ u ] ),
		server = new ve.dm.TestRebaseServer(),
		sharedIncoming = [],
		client1 = new ve.dm.TestRebaseClient( server, sharedIncoming ),
		client2 = new ve.dm.TestRebaseClient( server, sharedIncoming );

	client1.setAuthor( 1 );
	client2.setAuthor( 2 );

	// Client historySummary() output looks like: confirmed/sent?/unsent!
	// Obviously, the server only has confirmed items

	// First, concurrent insertions
	client1.applyChange( new ve.dm.Change( 0, [
		txInsert( 1, [ 'a' ], 3 ),
		txInsert( 2, [ 'b' ], 3 ),
		txInsert( 3, [ 'c' ], 3 )
	], [ noVals, noVals, noVals ], { 1: newSel( 4 ) } ) );
	assert.equal( client1.historySummary(), 'abc!', '1apply0' );
	client1.submitChange();
	assert.equal( client1.historySummary(), 'abc?', '1submit0' );
	client1.deliverOne();
	assert.equal( server.historySummary(), 'abc', '1deliver0' );

	client2.applyChange( new ve.dm.Change( 0, [
		txInsert( 1, [ 'A' ], 3 ),
		txInsert( 2, [ 'B' ], 3 )
	], [ noVals, noVals ], { 2: newSel( 3 ) } ) );
	assert.equal( client2.historySummary(), 'AB!', '2apply0' );
	client2.submitChange();
	client2.deliverOne();
	assert.equal( server.historySummary(), 'abcAB', '2deliver0' );

	client1.applyChange( new ve.dm.Change( 3, [
		txInsert( 4, [ [ 'd', bIndex ] ], 3 ),
		txInsert( 5, [ [ 'e', bIndex ] ], 3 ),
		txInsert( 6, [ [ 'f', bIndex ] ], 3 )
	], [ bStore, noVals, noVals ], { 1: newSel( 7 ) } ) );
	assert.equal( client1.historySummary(), 'abc?/def!', '1apply1' );
	client1.receiveOne();
	assert.equal( client1.historySummary(), 'abc/def!', '1receive0' );
	client1.submitChange();
	assert.equal( client1.historySummary(), 'abc/def?', '1receive1' );
	client1.deliverOne();
	assert.equal( server.historySummary(), 'abcABdef', '1deliver1' );

	client2.applyChange( new ve.dm.Change( 2, [
		txInsert( 3, [ [ 'C', uIndex ] ], 3 ),
		txInsert( 4, [ [ 'D', uIndex ] ], 3 )
	], [ uStore, noVals ], { 2: newSel( 5 ) } ) );
	assert.equal( client2.historySummary(), 'AB?/CD!', '2apply1' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abc/AB?/CD!', '2receive0' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcAB/CD!', '2receive1' );

	client2.submitChange();
	assert.equal( client2.historySummary(), 'abcAB/CD?', '2submit1' );
	client2.deliverOne();
	assert.equal( server.historySummary(), 'abcABdefCD', '2deliver1' );

	client1.receiveOne();
	assert.equal( client1.historySummary(), 'abcAB/def?', '1receive1' );
	client1.receiveOne();
	assert.equal( client1.historySummary(), 'abcABdef', '1receive2' );

	client1.applyChange( new ve.dm.Change( 8, [
		txInsert( 9, [ [ 'g', iIndex ] ], 3 ),
		txInsert( 10, [ [ 'h', iIndex ] ], 3 ),
		txInsert( 11, [ [ 'i', iIndex ] ], 3 )
	], [ iStore, noVals, noVals ], { 1: newSel( 12 ) } ) );
	assert.equal( client1.historySummary(), 'abcABdef/ghi!', '1apply3' );
	client1.submitChange();
	assert.equal( client1.historySummary(), 'abcABdef/ghi?', '1submit3' );
	client1.deliverOne();
	assert.equal( server.historySummary(), 'abcABdefCDghi', '1deliver3' );
	client1.receiveOne();
	assert.equal( client1.historySummary(), 'abcABdefCD/ghi?', '1receive3' );
	client1.receiveOne();
	assert.equal( client1.historySummary(), 'abcABdefCDghi', '1receive4' );

	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdef/CD?', '2receive2' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdefCD', '2receive3' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdefCDghi', '2receive4' );

	// Then, deliver one deletion and leave another in the pipeline
	client1.applyChange( new ve.dm.Change( 13, [
		txRemove( 5, [ 'B', 'd' ], 10 )
	], [ noVals ], { 1: newSel( 5 ) } ) );
	assert.equal( client1.historySummary(), 'abcABdefCDghi/-(Bd)!', '1apply5' );
	client1.submitChange();
	assert.equal( client1.historySummary(), 'abcABdefCDghi/-(Bd)?', '1submit5' );
	client1.applyChange( new ve.dm.Change( 14, [
		txRemove( 3, [ 'c', 'A' ], 10 )
	], [ noVals ], { 1: newSel( 3 ) } ) );
	assert.equal( client1.historySummary(), 'abcABdefCDghi/-(Bd)?/-(cA)!', '1apply6' );
	client1.submitChange();
	assert.equal( client1.historySummary(), 'abcABdefCDghi/-(Bd)-(cA)?', '1submit6' );
	client1.deliverOne();
	assert.equal( server.historySummary(), 'abcABdefCDghi-(Bd)', '1deliver5' );
	client1.receiveOne();
	assert.equal( client1.historySummary(), 'abcABdefCDghi-(Bd)/-(cA)?', '1receive5' );

	// Apply a partially-conflicting change
	client2.applyChange( new ve.dm.Change( 13, [
		txInsert( 1, [ 'W' ], 16 ),
		// Conflicts with undelivered deletion of 'cA'
		txInsert( 5, [ 'X' ], 13 ),
		// Conflicts with delivered deletion of 'Bd'
		txInsert( 8, [ 'Y' ], 11 ),
		txInsert( 12, [ 'Z' ], 8 )
	], [ noVals, noVals, noVals, noVals ], { 2: newSel( 12 ) } ) );
	assert.equal( client2.historySummary(), 'abcABdefCDghi/WXYZ!', '2apply5' );
	client2.submitChange();
	assert.equal( client2.historySummary(), 'abcABdefCDghi/WXYZ?', '2submit5' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)/WX?', '2receive5' );

	// Apply a "doomed change" built on top of a change that will conflict
	client2.applyChange( new ve.dm.Change( 16, [
		txInsert( 1, [ 'V' ], 18 )
	], [ noVals ], { 2: newSel( 2 ) } ) );
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)/WX?/V!', '2apply7' );
	client2.submitChange();
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)/WXV?', '2submit7' );

	client1.deliverOne();
	assert.equal( server.historySummary(), 'abcABdefCDghi-(Bd)-(cA)', '1deliver6' );

	client2.deliverOne();
	client2.deliverOne();
	assert.equal( server.historySummary(), 'abcABdefCDghi-(Bd)-(cA)W', '2deliver5' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)-(cA)/W?', '2receive6' );

	client2.applyChange( new ve.dm.Change( 16, [
		txInsert( 1, [ 'P' ], 16 )
	], [ noVals ], { 2: newSel( 2 ) } ) );
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)-(cA)/W?/P!', '2apply8' );
	client2.submitChange();
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)-(cA)/WP?', '2submit8' );
	client2.deliverOne();
	assert.equal( server.historySummary(), 'abcABdefCDghi-(Bd)-(cA)WP', '2deliver8' );

	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)-(cA)W/P?', '2receive7' );
	client2.receiveOne();
	assert.equal( client2.historySummary(), 'abcABdefCDghi-(Bd)-(cA)WP', '2receive8' );
} );
