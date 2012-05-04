module( 've.Node' );

/* Stubs */

ve.NodeStub = function() {
	// Inheritance
	ve.Node.call( this, 'stub' );
};

ve.extendClass( ve.NodeStub, ve.Node );
 
/* Tests */

test( 'getType', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getType(), 'stub' );
} );

test( 'getParent', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getParent(), null );
} );

test( 'getRoot', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getRoot(), node );
} );
