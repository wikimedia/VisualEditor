/*!
 * VisualEditor DataModel Surface tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.Surface' );

ve.dm.SurfaceStub = function VeDmSurfaceStub( data, range ) {
	var doc = new ve.dm.Document( data || [ { type: 'paragraph' }, 'h', 'i', { type: '/paragraph' } ] );

	// Inheritance
	ve.dm.SurfaceStub.super.call( this, doc );

	// Initialize selection to simulate the surface being focused
	this.setLinearSelection( range || new ve.Range( 1 ) );
};

OO.inheritClass( ve.dm.SurfaceStub, ve.dm.Surface );

// Tests

QUnit.test( 'getDocument', function ( assert ) {
	var surface = new ve.dm.SurfaceStub();
	assert.strictEqual( surface.getDocument(), surface.documentModel );
} );

QUnit.test( 'getSelection', function ( assert ) {
	var surface = new ve.dm.SurfaceStub();
	assert.strictEqual( surface.getSelection(), surface.selection );
} );

QUnit.test( 'contextChange events', function ( assert ) {
	var surface = new ve.dm.SurfaceStub( ve.dm.example.preprocessAnnotations( [
			{ type: 'paragraph' },
			'F', 'o', 'o',
			// Bold "bar"
			[ 'b', [ ve.dm.example.bold ] ],
			[ 'a', [ ve.dm.example.bold ] ],
			[ 'r', [ ve.dm.example.bold ] ],
			// Italic "baz"
			[ 'b', [ ve.dm.example.italic ] ],
			[ 'a', [ ve.dm.example.italic ] ],
			[ 'z', [ ve.dm.example.italic ] ],
			'F', 'o', 'o',
			{ type: '/paragraph' }
		] ) ),
		contextChanges = 0,
		tests, i, iLen;

	surface.on( 'contextChange', function () {
		contextChanges++;
	} );

	tests = [
		{
			title: 'setSelection, to equivalent selection',
			initialSelection: new ve.Range( 1 ),
			selection: new ve.Range( 1 ),
			expected: 0
		},
		{
			title: 'setSelection, to equivalent expanded selection',
			initialSelection: new ve.Range( 1, 2 ),
			selection: new ve.Range( 1, 2 ),
			expected: 0
		},
		{
			title: 'setSelection, move within plain text',
			initialSelection: new ve.Range( 1 ),
			selection: new ve.Range( 2 ),
			expected: 0
		},
		{
			// Going from collapsed to not is a context change
			title: 'setSelection, expands over plain text',
			initialSelection: new ve.Range( 1 ),
			selection: new ve.Range( 1, 2 ),
			expected: 1
		},
		{
			title: 'setSelection, collapses',
			initialSelection: new ve.Range( 1, 2 ),
			selection: new ve.Range( 1 ),
			expected: 1
		},
		{
			title: 'setSelection, non-collapsed selection expands over plain text',
			initialSelection: new ve.Range( 1, 2 ),
			selection: new ve.Range( 1, 3 ),
			expected: 0
		},
		{
			title: 'setSelection, non-collapsed selection expands into annotated text',
			initialSelection: new ve.Range( 1, 2 ),
			selection: new ve.Range( 1, 5 ),
			expected: 1
		},
		{
			title: 'setSelection, non-collapsed selection expands into annotated text, other direction',
			initialSelection: new ve.Range( 12, 11 ),
			selection: new ve.Range( 12, 8 ),
			expected: 2 // Move + insertion annotations change
		},
		{
			title: 'setSelection, move collapsed selection to edge of annotated text',
			initialSelection: new ve.Range( 2 ),
			selection: new ve.Range( 4 ),
			expected: 1 // Move + no insertion annotations change
		},
		{
			title: 'setSelection, move collapsed selection to within annotated text',
			initialSelection: new ve.Range( 2 ),
			selection: new ve.Range( 5 ),
			expected: 2 // Move + insertion annotations change
		}
	];
	for ( i = 0, iLen = tests.length; i < iLen; i++ ) {
		surface.setLinearSelection( tests[ i ].initialSelection || new ve.Range( 1 ) );
		contextChanges = 0;
		surface.setLinearSelection( tests[ i ].selection );
		assert.equal( contextChanges, tests[ i ].expected, tests[ i ].title );
	}
} );

QUnit.test( 'documentUpdate/select events', function ( assert ) {
	var surface = new ve.dm.SurfaceStub(),
		doc = surface.getDocument(),
		// docmentUpdate doesn't fire for no-op transactions, so make sure there's something there
		tx = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 3, [ 'i' ] ),
		events = {
			documentUpdate: 0,
			select: 0
		};

	surface.on( 'documentUpdate', function () {
		events.documentUpdate++;
	} );
	surface.on( 'select', function () {
		events.select++;
	} );
	surface.change( tx.clone() );
	assert.deepEqual( events, { documentUpdate: 1, select: 0 }, 'change with transaction only' );
	surface.setLinearSelection( new ve.Range( 2 ) );
	assert.deepEqual( events, { documentUpdate: 1, select: 1 }, 'setSelection' );
	surface.change( tx.clone(), new ve.dm.LinearSelection( doc, new ve.Range( 3 ) ) );
	assert.deepEqual( events, { documentUpdate: 2, select: 2 }, 'change with transaction and selection' );
} );

QUnit.test( 'breakpoint/undo/redo', function ( assert ) {
	var range = new ve.Range( 1, 3 ),
		surface = new ve.dm.SurfaceStub( null, range ),
		fragment = surface.getFragment(),
		doc = surface.getDocument(),
		selection = new ve.dm.LinearSelection( doc, range ),
		tx = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ 'x' ] );

	assert.strictEqual( surface.breakpoint(), false, 'Returns false if no transactions applied' );

	surface.change( tx );
	assert.deepEqual( surface.undoStack, [], 'Undo stack data matches before breakpoint' );
	assert.deepEqual( surface.newTransactions, [ tx ], 'New transactions match before breakpoint' );

	assert.strictEqual( surface.breakpoint(), true, 'Returns true after transaction applied' );
	assert.strictEqual( surface.breakpoint(), false, 'Returns false if no transactions applied since last breakpoint' );

	assert.deepEqual(
		surface.undoStack, [ {
			transactions: [ tx ],
			selection: new ve.dm.LinearSelection( doc, tx.translateRange( selection.getRange() ) ),
			selectionBefore: selection
		} ],
		'Undo stack data matches after breakpoint'
	);
	assert.deepEqual( surface.newTransactions, [], 'New transactions empty after breakpoint' );

	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Range changed' );
	// Dirty selection to make sure beforeSelection works
	surface.setLinearSelection( new ve.Range( 3 ) );
	surface.undo();
	assert.equalHash( surface.getSelection().getRange(), range, 'Range restored after undo' );
	assert.strictEqual( fragment.getText(), 'hi', 'Text restored after undo' );

	surface.setLinearSelection( new ve.Range( 3 ) );
	surface.redo();
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Range changed after redo' );
	assert.strictEqual( fragment.getText(), 'xhi', 'Text changed after redo' );

} );

QUnit.test( 'change rollback', function ( assert ) {
	var tx,
		range = new ve.Range( 1, 3 ),
		surface = new ve.dm.SurfaceStub( null, range ),
		doc = surface.getDocument();

	tx = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ { type: '/heading' } ] );
	assert.throws(
		function () { surface.change( tx ); },
		new Error( 'Expected closing for paragraph but got closing for heading' ),
		'Transaction throws an exception'
	);

	assert.deepEqual( surface.canUndo(), false, 'No history to undo after failed change' );
} );

QUnit.test( 'range translation', function ( assert ) {
	var sel, range,
		surface = new ve.dm.SurfaceStub( null, new ve.Range( 3 ) ),
		doc = surface.getDocument(),
		tx = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 3, [ 'x' ] );
	surface.change( tx );
	sel = surface.getSelection();
	assert.ok( sel instanceof ve.dm.LinearSelection, 'Selection is linear' );
	range = sel.getRange();
	assert.deepEqual( { from: range.from, to: range.to }, { from: 3, to: 3 }, 'Cursor is unmoved' );
} );

QUnit.test( 'staging', function ( assert ) {
	var tx1, tx2,
		surface = new ve.dm.SurfaceStub( null, new ve.Range( 1, 3 ) ),
		fragment = surface.getFragment(),
		doc = surface.getDocument();

	assert.strictEqual( surface.isStaging(), false, 'isStaging false when not staging' );
	assert.strictEqual( surface.getStagingTransactions(), undefined, 'getStagingTransactions undefined when not staging' );
	assert.strictEqual( surface.doesStagingAllowUndo(), undefined, 'doesStagingAllowUndo undefined when not staging' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface range matches fragment range' );

	surface.change( ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ 'a' ] ) );

	surface.pushStaging();
	assert.strictEqual( surface.isStaging(), true, 'isStaging true after pushStaging' );
	assert.deepEqual( surface.getStagingTransactions(), [], 'getStagingTransactions empty array after pushStaging' );
	assert.strictEqual( surface.doesStagingAllowUndo(), false, 'doesStagingAllowUndo false when staging without undo' );

	tx1 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 2, [ 'b' ] );
	surface.change( tx1 );

	assert.strictEqual( fragment.getText(), 'abhi', 'document contents match after first transaction' );
	assert.deepEqual( surface.getStagingTransactions(), [ tx1 ], 'getStagingTransactions contains first transaction after change' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	surface.pushStaging( true );
	assert.strictEqual( surface.isStaging(), true, 'isStaging true after nested pushStaging' );
	assert.deepEqual( surface.getStagingTransactions(), [], 'getStagingTransactions empty array after nested pushStaging' );
	assert.strictEqual( surface.doesStagingAllowUndo(), true, 'doesStagingAllowUndo true when staging with undo' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	tx2 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 3, [ 'c' ] );
	surface.change( tx2 );

	assert.strictEqual( fragment.getText(), 'abchi', 'document contents match after second transaction' );
	assert.deepEqual( surface.getStagingTransactions(), [ tx2 ], 'getStagingTransactions contains second transaction after change in nested staging' );

	assert.deepEqual( surface.popStaging(), [ tx2 ], 'popStaging returns second transaction list' );
	assert.strictEqual( surface.isStaging(), true, 'isStaging true after nested popStaging' );
	assert.strictEqual( fragment.getText(), 'abhi', 'document contents match after nested popStaging' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	assert.deepEqual( surface.popStaging(), [ tx1 ], 'popStaging returns first transaction list' );
	assert.strictEqual( surface.isStaging(), false, 'isStaging false after outer popStaging' );
	assert.strictEqual( fragment.getText(), 'ahi', 'document contents match after outer popStaging' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	tx1 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 2, [ 'b' ] );
	surface.change( tx1 );

	surface.pushStaging();
	tx2 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 3, [ 'c' ] );
	surface.change( tx2 );

	assert.deepEqual( surface.popAllStaging(), [ tx1, tx2 ], 'popAllStaging returns full transaction list' );
	assert.strictEqual( fragment.getText(), 'ahi', 'document contents match after outer clearStaging' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	tx1 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 2, [ 'b' ] );
	surface.change( tx1 );

	surface.pushStaging();
	tx2 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 3, [ 'c' ] );
	surface.change( tx2 );

	surface.applyStaging();
	assert.deepEqual( surface.getStagingTransactions(), [ tx1, tx2 ], 'applyStaging merges transactions' );

	surface.applyStaging();
	assert.strictEqual( surface.isStaging(), false, 'isStaging false after outer applyStaging' );
	assert.strictEqual( fragment.getText(), 'abchi', 'document contents changed after applyStaging' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	tx1 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 4, [ 'd' ] );
	surface.change( tx1 );

	surface.pushStaging();
	tx2 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 5, [ 'e' ] );
	surface.change( tx2 );

	surface.applyAllStaging();
	assert.strictEqual( surface.isStaging(), false, 'isStaging false after outer applyAllStaging' );
	assert.strictEqual( fragment.getText(), 'abcdehi', 'document contents changed after applyAllStaging' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	surface.undo();
	assert.strictEqual( fragment.getText(), 'abchi', 'document contents changed after undo' );
	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	surface.pushStaging();
	// Apply transaction at second level, first level is empty and has no selctionBefore
	tx1 = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 4, [ 'd' ] );
	surface.change( tx1 );
	surface.applyAllStaging();
	// Dirty selection
	surface.setLinearSelection( new ve.Range( 1 ) );
	// Undo should restore the selection from the second level's selectionBefore
	surface.undo();

	assert.equalHash( surface.getSelection(), fragment.getSelection(), 'Surface selection matches fragment range' );

} );

QUnit.test( 'getOffsetFromSourceOffset / getSourceOffsetFromOffset / getRangeFromSourceOffsets', function ( assert ) {
	var i,
		surface = new ve.dm.SurfaceStub( [
			{ type: 'paragraph' }, 'f', 'o', 'o', { type: '/paragraph' },
			{ type: 'paragraph' }, 'b', 'a', { type: '/paragraph' },
			{ type: 'paragraph' }, 'q', 'u', 'u', 'x', { type: '/paragraph' },
			{ type: 'internalList' }, { type: '/internalList' }
		] ),
		expectedOffsets = [
			1, 2, 3, 4,
			6, 7, 8,
			10, 11, 12, 13, 14
		],
		expectedSourceOffsets = [
			0, 0, 1, 2, 3,
			4, 4, 5, 6,
			7, 7, 8, 9, 10, 11,
			12
		];

	for ( i = 0; i < expectedOffsets.length; i++ ) {
		assert.strictEqual( surface.getOffsetFromSourceOffset( i ), expectedOffsets[ i ], 'Correct offset at ' + i );
	}
	assert.throws(
		function () { surface.getOffsetFromSourceOffset( -1 ); },
		Error, 'Offset -1 is out of bounds' );
	assert.throws(
		function () { surface.getOffsetFromSourceOffset( expectedOffsets.length ); },
		Error, 'Offset ' + expectedOffsets.length + ' is out of bounds'
	);
	for ( i = 0; i < expectedSourceOffsets.length; i++ ) {
		assert.strictEqual( surface.getSourceOffsetFromOffset( i ), expectedSourceOffsets[ i ], 'Correct source offset at ' + i );
	}
	assert.throws(
		function () { surface.getSourceOffsetFromOffset( -1 ); },
		Error, 'Offset -1 is out of bounds' );
	assert.throws(
		function () { surface.getSourceOffsetFromOffset( expectedSourceOffsets.length ); },
		Error, 'Offset ' + expectedSourceOffsets.length + ' is out of bounds'
	);

	assert.equalRange( surface.getRangeFromSourceOffsets( 1, 5 ), new ve.Range( 2, 7 ), 'Simple forwards range' );
	assert.equalRange( surface.getRangeFromSourceOffsets( 6, 2 ), new ve.Range( 8, 3 ), 'Simple backwards range' );
	assert.equalRange( surface.getRangeFromSourceOffsets( 7, 7 ), new ve.Range( 10 ), 'Collapsed range (2 args)' );
	assert.equalRange( surface.getRangeFromSourceOffsets( 8 ), new ve.Range( 11 ), 'Collapsed range (1 arg)' );
} );

QUnit.test( 'autosave', function ( assert ) {
	var autosaveFailed = 0,
		done = assert.async(),
		surface = new ve.dm.SurfaceStub(),
		fragment = surface.getLinearFragment( new ve.Range( 3 ) ),
		state = {
			name: 'name',
			id: 1
		};

	assert.deepEqual( surface.restoreChanges(), false, 'restoreChanges returns false when nothing to restore' );
	assert.deepEqual( surface.storeDocState( state, '<p>foo</p>' ), true, 'storeDocState returns true' );
	assert.deepEqual( ve.init.platform.getSession( 've-docstate' ), JSON.stringify( state ), 'storeDocState writes doc state to session storage' );
	assert.deepEqual( ve.init.platform.getSession( 've-dochtml' ), '<p>foo</p>', 'storeDocState writes custom HTML to session storage' );
	surface.storeDocState( state, '' );
	assert.deepEqual( ve.init.platform.getSession( 've-dochtml' ), '', 'storeDocState can set HTML to empty string' );
	surface.storeDocState();
	assert.deepEqual( ve.init.platform.getSession( 've-dochtml' ), '<p>hi</p>', 'storeDocState writes current HTML to session storage' );
	assert.deepEqual( ve.init.platform.getSession( 've-docstate' ), null, 'docstate is empty if not provided' );

	fragment.insertContent( ' bar' );
	surface.breakpoint();
	assert.deepEqual( ve.init.platform.getSessionList( 've-changes' ), [], 'Changes aren\'t stored before startStoringChanges' );

	surface = new ve.dm.SurfaceStub();
	fragment = surface.getLinearFragment( new ve.Range( 3 ) );
	surface.startStoringChanges();
	surface.storeDocState( state );
	fragment.insertContent( ' bar' );
	surface.breakpoint();
	assert.deepEqual(
		ve.init.platform.getSessionList( 've-changes' ).map( JSON.parse ),
		[ {
			start: 0,
			transactions: [ [ 3, [ '', ' bar' ], 1 ] ]
		} ],
		'First change stored'
	);

	surface.storeChanges();
	assert.deepEqual( ve.init.platform.getSessionList( 've-changes' ).length, 1, 'No extra change stored if no changes since last store' );

	fragment.convertNodes( 'heading', { level: 1 } );
	surface.setLinearSelection( new ve.Range( 5 ) );
	surface.breakpoint();
	assert.deepEqual(
		ve.init.platform.getSessionList( 've-changes' ).map( JSON.parse )[ 1 ],
		{
			start: 1,
			transactions: [ [
				[ [ { type: 'paragraph' } ], [ { type: 'heading', attributes: { level: 1 } } ] ],
				6,
				[ [ { type: '/paragraph' } ], [ { type: '/heading' } ] ]
			] ]
		},
		'Second change stored'
	);
	assert.deepEqual(
		ve.init.platform.getSession( 've-selection' ),
		JSON.stringify( { type: 'linear', range: { type: 'range', from: 5, to: 5 } } ),
		'Selection state stored'
	);

	surface.stopStoringChanges();
	fragment.collapseToEnd().insertContent( ' quux' );
	surface.breakpoint();
	assert.deepEqual(
		ve.init.platform.getSessionList( 've-changes' ).length, 2, 'Change not stored after stopStoringChanges'
	);

	assert.throws(
		function () {
			surface.restoreChanges();
		},
		/Failed to restore/,
		'Calling restoreChanges on the wrong document state throws "Failed to restore..." error'
	);

	surface = new ve.dm.SurfaceStub();
	fragment = null;
	assert.deepEqual( surface.getHtml(), '<p>hi</p>', 'Document HTML before restoreChanges' );
	assert.deepEqual( surface.restoreChanges(), true, 'restoreChanges returns true on success' );
	assert.deepEqual( surface.getHtml(), '<h1>hi bar</h1>', 'Document HTML restored' );
	assert.deepEqual( surface.getDocument().getCompleteHistoryLength(), 2, 'Document history restored' );
	setTimeout( function ( surface ) {
		assert.equalHash( surface.getSelection(), { type: 'linear', range: { type: 'range', from: 5, to: 5 } }, 'Document selection restored (async)' );
		done();
	}.bind( this, surface ) );

	ve.init.platform.sessionDisabled = true;
	assert.deepEqual( surface.restoreChanges(), false, 'restoreChanges returns false if session storage disabled' );
	ve.init.platform.sessionDisabled = false;

	surface.removeDocStateAndChanges();
	assert.deepEqual( ve.init.platform.getSession( 've-html' ), null, 'HTML empty after removeDocStateAndChanges' );
	assert.deepEqual( ve.init.platform.getSession( 've-docstate' ), null, 'Doc state empty after removeDocStateAndChanges' );
	assert.deepEqual( ve.init.platform.getSessionList( 've-changes' ), [], 'Changes empty after removeDocStateAndChanges' );

	surface = new ve.dm.SurfaceStub();
	fragment = surface.getLinearFragment( new ve.Range( 3 ) );
	surface.startStoringChanges();
	// Pass magic string to only fail when writing HTML
	assert.deepEqual( surface.storeDocState( state, '__FAIL__' ), false, 'storeDocState returns false when HTML can\'t be stored' );
	assert.deepEqual( ve.init.platform.getSession( 've-docstate' ), null, 'docstate is wiped if HTML storage failed' );

	ve.init.platform.sessionDisabled = true;
	surface = new ve.dm.SurfaceStub();
	fragment = surface.getLinearFragment( new ve.Range( 3 ) );
	surface.startStoringChanges();
	assert.deepEqual( surface.storeDocState( state ), false, 'storeDocState returns false when sessionStorage disabled' );
	fragment.insertContent( ' bar' );
	surface.breakpoint();
	assert.deepEqual( ve.init.platform.getSessionList( 've-changes' ).length, 0, 'No changes recorded after storeDocState failure' );
	ve.init.platform.sessionDisabled = false;

	surface.on( 'autosaveFailed', function () { autosaveFailed++; } );
	surface.startStoringChanges();
	surface.storeDocState( state );
	ve.init.platform.sessionDisabled = true;
	assert.deepEqual( autosaveFailed, 0, 'Autosave hasn\'t failed before first change' );
	fragment.insertContent( ' bar' );
	surface.breakpoint();
	assert.deepEqual( autosaveFailed, 1, 'Autosave fails after first change' );
	fragment.insertContent( ' baz' );
	surface.breakpoint();
	assert.deepEqual( autosaveFailed, 1, 'Subsequent failures don\'t fire autosaveFailed again' );
	assert.deepEqual( ve.init.platform.getSessionList( 've-changes' ).length, 0, 'No changes recorded after storeChanges failure' );
	ve.init.platform.sessionDisabled = false;

	surface.storeDocState( state, '<p>foo</p>' );
	// This allows callers to call storeDocState after startStoringChanges, e.g. after the first transaction
	assert.deepEqual( surface.lastStoredChange, 1, 'storeDocState with custom HTML doesn\'t advance the lastStoredChange pointer' );
	surface.storeDocState( state );
	assert.deepEqual( surface.lastStoredChange, 5, 'storeDocState without custom HTML advances the lastStoredChange pointer' );

} );

// TODO: ve.dm.Surface#getHistory
// TODO: ve.dm.Surface#canRedo
// TODO: ve.dm.Surface#canUndo
// TODO: ve.dm.Surface#hasBeenModified
// TODO: ve.dm.Surface#truncateUndoStack
