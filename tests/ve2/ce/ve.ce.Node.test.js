module( 've.ce.Node' );

/* Stubs */

ve.ce.NodeStub = function( model ) {
	// Inheritance
	ve.ce.Node.call( this, model );
};

ve.extendClass( ve.ce.NodeStub, ve.ce.Node );

/* Tests */

test( 'getModel', 1, function() {
	var model = new ve.dm.NodeStub( 'stub', 0 ),
		view = new ve.ce.NodeStub( model );
	strictEqual( view.getModel(), model, 'returns reference to model given to constructor' );
} );

test( 'getParent', 1, function() {
	var a = new ve.ce.NodeStub( new ve.dm.NodeStub( 'stub', 0 ) );
	strictEqual( a.getParent(), null, 'returns null if not attached' );
} );

test( 'attach', 2, function() {
	var a = new ve.ce.NodeStub( new ve.dm.NodeStub( 'stub', 0 ) ),
		b = new ve.ce.NodeStub( new ve.dm.NodeStub( 'stub', 0 ) );
	a.on( 'attach', function( parent ) {
		strictEqual( parent, b, 'attach event is called with parent as first argument' );
	} );
	a.attach( b );
	strictEqual( a.getParent(), b, 'parent is set to given object after attach' );
} );

test( 'detach', 2, function() {
	var a = new ve.ce.NodeStub( new ve.dm.NodeStub( 'stub', 0 ) ),
		b = new ve.ce.NodeStub( new ve.dm.NodeStub( 'stub', 0 ) );
	a.attach( b );
	a.on( 'detach', function( parent ) {
		strictEqual( parent, b, 'detach event is called with parent as first argument' );
	} );
	a.detach();
	strictEqual( a.getParent(), null, 'parent is set null after detach' );
} );
