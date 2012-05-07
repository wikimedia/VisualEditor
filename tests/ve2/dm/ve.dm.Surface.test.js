module( 've.dm.Surface' );

ve.dm.SurfaceStub = function() {
	// Inheritance
	this.dm = new ve.dm.Document ( [{ 'type': 'paragraph' }, 'hi', { 'type': '/paragraph' }] );
	ve.dm.Surface.call( this, this.dm );
};

// Inheritance

ve.extendClass( ve.dm.SurfaceStub, ve.dm.Surface );

// Tests

test( 'getDocument', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	strictEqual( surface.getDocument(), surface.documentModel );
} );

test( 'getSelection', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	strictEqual( surface.getSelection(), surface.selection );
} );

test( 'setSelection', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	surface.on( 'select', function() {
		ok( true, 'select was emitted' );
	} );
	surface.setSelection( new ve.Range( 1, 1 ) );
} );

test( 'transact', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	var tx = new ve.dm.Transaction();
	surface.on( 'transact', function() {
		ok( true, 'transact was emitted' );
	} );
	surface.transact( tx );
} );