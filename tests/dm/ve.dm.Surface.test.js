/*!
 * VisualEditor DataModel Surface tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Surface' );

ve.dm.SurfaceStub = function VeDmSurfaceStub( data, range ) {
	var doc = new ve.dm.Document( data || [{ type: 'paragraph' }, 'h', 'i', { type: '/paragraph' }] );

	// Inheritance
	ve.dm.Surface.call( this, doc );

	// Initialize selection to simulate the surface being focused
	this.setSelection( range || new ve.Range( 1 ) );
};

OO.inheritClass( ve.dm.SurfaceStub, ve.dm.Surface );

// Tests

QUnit.test( 'getDocument', 1, function ( assert ) {
	var surface = new ve.dm.SurfaceStub();
	assert.strictEqual( surface.getDocument(), surface.documentModel );
} );

QUnit.test( 'getSelection', 1, function ( assert ) {
	var surface = new ve.dm.SurfaceStub();
	assert.strictEqual( surface.getSelection(), surface.selection );
} );

QUnit.test( 'documentUpdate/select events', 3, function ( assert ) {
	var surface = new ve.dm.SurfaceStub(),
		doc = surface.getDocument(),
		// docmentUpdate doesn't fire for no-op transactions, so make sure there's something there
		tx = ve.dm.Transaction.newFromInsertion( doc, 3, [ 'i' ] ),
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
	surface.setSelection( new ve.Range( 2 ) );
	assert.deepEqual( events, { documentUpdate: 1, select: 1 }, 'setSelection' );
	surface.change( tx.clone(), new ve.Range( 3 ) );
	assert.deepEqual( events, { documentUpdate: 2, select: 2 }, 'change with transaction and selection' );
} );

QUnit.test( 'breakpoint/undo/redo', 12, function ( assert ) {
	var selection = new ve.Range( 1, 3 ),
		surface = new ve.dm.SurfaceStub( null, selection ),
		fragment = surface.getFragment(),
		doc = surface.getDocument(),
		tx = new ve.dm.Transaction.newFromInsertion( doc, 1, ['x'] );

	assert.equal( surface.breakpoint(), false, 'Returns false if no transactions applied' );

	surface.change( tx );
	assert.deepEqual( surface.undoStack, [], 'Undo stack data matches before breakpoint' );
	assert.deepEqual( surface.newTransactions, [tx], 'New transactions match before breakpoint' );

	assert.equal( surface.breakpoint(), true, 'Returns true after transaction applied' );
	assert.equal( surface.breakpoint(), false, 'Returns false if no transactions applied since last breakpoint' );

	assert.deepEqual(
		surface.undoStack, [ {
			transactions: [tx],
			selection: tx.translateRange( selection ),
			selectionBefore: selection
		} ],
		'Undo stack data matches after breakpoint'
	);
	assert.deepEqual( surface.newTransactions, [], 'New transactions empty after breakpoint' );

	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Selection changed' );
	// Dirty selection to make sure beforeSelection works
	surface.setSelection( new ve.Range( 3 ) );
	surface.undo();
	assert.equalRange( surface.getSelection(), selection, 'Selection restored after undo' );
	assert.equal( fragment.getText(), 'hi', 'Text restored after undo' );

	surface.setSelection( new ve.Range( 3 ) );
	surface.redo();
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Selection changed after redo' );
	assert.equal( fragment.getText(), 'xhi', 'Text changed after redo' );

} );

QUnit.test( 'staging', 37, function ( assert ) {
	var tx1, tx2,
		surface = new ve.dm.SurfaceStub( null, new ve.Range( 1, 3 ) ),
		fragment = surface.getFragment(),
		doc = surface.getDocument();

	assert.equal( surface.isStaging(), false, 'isStaging false when not staging' );
	assert.equal( surface.getStagingTransactions(), undefined, 'getStagingTransactions undefined when not staging' );
	assert.equal( surface.doesStagingAllowUndo(), undefined, 'doesStagingAllowUndo undefined when not staging' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.change( new ve.dm.Transaction.newFromInsertion( doc, 1, ['a'] ) );

	surface.pushStaging();
	assert.equal( surface.isStaging(), true, 'isStaging true after pushStaging' );
	assert.deepEqual( surface.getStagingTransactions(), [], 'getStagingTransactions empty array after pushStaging' );
	assert.equal( surface.doesStagingAllowUndo(), false, 'doesStagingAllowUndo false when staging without undo' );

	tx1 = new ve.dm.Transaction.newFromInsertion( doc, 2, ['b'] );
	surface.change( tx1 );

	assert.equal( fragment.getText(), 'abhi', 'document contents match after first transaction' );
	assert.deepEqual( surface.getStagingTransactions(), [tx1], 'getStagingTransactions contains first transaction after change' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.pushStaging( true );
	assert.equal( surface.isStaging(), true, 'isStaging true after nested pushStaging' );
	assert.deepEqual( surface.getStagingTransactions(), [], 'getStagingTransactions empty array after nested pushStaging' );
	assert.equal( surface.doesStagingAllowUndo(), true, 'doesStagingAllowUndo true when staging with undo' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	tx2 = new ve.dm.Transaction.newFromInsertion( doc, 3, ['c'] );
	surface.change( tx2 );

	assert.equal( fragment.getText(), 'abchi', 'document contents match after second transaction' );
	assert.deepEqual( surface.getStagingTransactions(), [tx2], 'getStagingTransactions contains second transaction after change in nested staging' );

	assert.deepEqual( surface.popStaging(), [tx2], 'popStaging returns second transaction list' );
	assert.equal( surface.isStaging(), true, 'isStaging true after nested popStaging' );
	assert.equal( fragment.getText(), 'abhi', 'document contents match after nested popStaging' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	assert.deepEqual( surface.popStaging(), [tx1], 'popStaging returns first transaction list' );
	assert.equal( surface.isStaging(), false, 'isStaging false after outer popStaging' );
	assert.equal( fragment.getText(), 'ahi', 'document contents match after outer popStaging' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	tx1 = new ve.dm.Transaction.newFromInsertion( doc, 2, ['b'] );
	surface.change( tx1 );

	surface.pushStaging();
	tx2 = new ve.dm.Transaction.newFromInsertion( doc, 3, ['c'] );
	surface.change( tx2 );

	assert.deepEqual( surface.popAllStaging(), [tx1, tx2], 'popAllStaging returns full transaction list' );
	assert.equal( fragment.getText(), 'ahi', 'document contents match after outer clearStaging' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	tx1 = new ve.dm.Transaction.newFromInsertion( doc, 2, ['b'] );
	surface.change( tx1 );

	surface.pushStaging();
	tx2 = new ve.dm.Transaction.newFromInsertion( doc, 3, ['c'] );
	surface.change( tx2 );

	surface.applyStaging();
	assert.deepEqual( surface.getStagingTransactions(), [tx1, tx2], 'applyStaging merges transactions' );

	surface.applyStaging();
	assert.equal( surface.isStaging(), false, 'isStaging false after outer applyStaging' );
	assert.equal( fragment.getText(), 'abchi', 'document contents changed after applyStaging' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	tx1 = new ve.dm.Transaction.newFromInsertion( doc, 4, ['d'] );
	surface.change( tx1 );

	surface.pushStaging();
	tx2 = new ve.dm.Transaction.newFromInsertion( doc, 5, ['e'] );
	surface.change( tx2 );

	surface.applyAllStaging();
	assert.equal( surface.isStaging(), false, 'isStaging false after outer applyAllStaging' );
	assert.equal( fragment.getText(), 'abcdehi', 'document contents changed after applyAllStaging' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.undo();
	assert.equal( fragment.getText(), 'abchi', 'document contents changed after undo' );
	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

	surface.pushStaging();
	surface.pushStaging();
	// Apply transaction at second level, first level is empty and has no selctionBefore
	tx1 = new ve.dm.Transaction.newFromInsertion( doc, 4, ['d'] );
	surface.change( tx1 );
	surface.applyAllStaging();
	// Dirty selection
	surface.setSelection( new ve.Range( 1 ) );
	// Undo should restore the selection from the second level's selectionBefore
	surface.undo();

	assert.equalRange( surface.getSelection(), fragment.getRange(), 'Surface selection matches fragment range' );

} );

// TODO: ve.dm.Surface#getHistory
// TODO: ve.dm.Surface#canRedo
// TODO: ve.dm.Surface#canUndo
// TODO: ve.dm.Surface#hasBeenModified
// TODO: ve.dm.Surface#truncateUndoStack
