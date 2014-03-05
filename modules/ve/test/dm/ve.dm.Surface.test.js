/*!
 * VisualEditor DataModel Surface tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Surface' );

ve.dm.SurfaceStub = function VeDmSurfaceStub( data ) {
	if ( data !== undefined ) {
		this.dm = new ve.dm.Document( data );
	} else {
		this.dm = new ve.dm.Document( [{ 'type': 'paragraph' }, 'h', 'i', { 'type': '/paragraph' }] );
	}

	// Inheritance
	ve.dm.Surface.call( this, this.dm );
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

QUnit.test( 'change/setSelection events', 3, function ( assert ) {
	var tx, surface = new ve.dm.SurfaceStub(),
		events = {
			'documentUpdate': 0,
			'select': 0
		};

	// docmentUpdate doesn't fire for no-op transactions, so make sure there's something there
	tx = ve.dm.Transaction.newFromInsertion( surface.getDocument(), 3, [ 'i' ] );

	surface.on( 'documentUpdate', function () {
		events.documentUpdate++;
	} );
	surface.on( 'select', function () {
		events.select++;
	} );
	surface.change( tx.clone() );
	assert.deepEqual( events, { 'documentUpdate': 1, 'select': 0 }, 'change with transaction only' );
	surface.setSelection( new ve.Range( 2, 2 ) );
	assert.deepEqual( events, { 'documentUpdate': 1, 'select': 1 }, 'setSelection' );
	surface.change( tx.clone(), new ve.Range( 3, 3 ) );
	assert.deepEqual( events, { 'documentUpdate': 2, 'select': 2 }, 'change with transaction and selection' );
} );

QUnit.test( 'breakpoint', 7, function ( assert ) {
	var surface = new ve.dm.SurfaceStub(),
		tx = new ve.dm.Transaction.newFromInsertion( surface.dm, 1, ['x'] ),
		selection = new ve.Range( 1, 1 );

	assert.equal( surface.breakpoint(), false, 'Returns false if no transactions applied' );

	surface.change( tx );
	assert.deepEqual( surface.undoStack, [], 'Undo stack data matches before breakpoint' );
	assert.deepEqual( surface.newTransactions, [tx], 'New transactions match before breakpoint' );

	assert.equal( surface.breakpoint(), true, 'Returns true after transaction applied' );
	assert.equal( surface.breakpoint(), false, 'Returns false if no transactions applied since last breakpoint' );

	assert.deepEqual( surface.undoStack, [ {
			'transactions': [tx],
			'selection': tx.translateRange( selection ),
			'selectionBefore': selection
		} ],
		'Undo stack data matches after breakpoint'
	);
	assert.deepEqual( surface.newTransactions, [], 'New transactions match after breakpoint' );
} );

// TODO: ve.dm.Surface#getHistory
// TODO: ve.dm.Surface#purgeHistory
// TODO: ve.dm.Surface#hasFutureState
// TODO: ve.dm.Surface#hasPastState
// TODO: ve.dm.Surface#truncateUndoStack
// TODO: ve.dm.Surface#undo
// TODO: ve.dm.Surface#redo
