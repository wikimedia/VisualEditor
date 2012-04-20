module( 've.Node' );

/* Stubs */

ve.NodeStub = function() {
	// Inheritance
	ve.Node.call( this, 'stub' );
};

ve.extendClass( ve.NodeStub, ve.Node );

/* Tests */

test( 'prototype.getType', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getType(), 'stub' );
} );

test( 'prototype.getParent', 1, function() {
	var node = new ve.dm.NodeStub();
	strictEqual( node.getParent(), null );
} );

test( 'prototype.getRoot', 1, function() {
	var node = new ve.dm.NodeStub();
	strictEqual( node.getRoot(), node );
} );
