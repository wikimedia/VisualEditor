module( 've.Node' );

/* Stubs */

ve.NodeStub = function() {
	// Inheritance
	ve.Node.call( this, 'stub' );
};

ve.extendClass( ve.NodeStub, ve.Node );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	raises( function() {
		var node = new ve.NodeStub();
		// Abstract method, must be overridden, throws exception when called
		node.canHaveChildren();
	}, 'throws exception when called' );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	raises( function() {
		var node = new ve.NodeStub();
		// Abstract method, must be overridden, throws exception when called
		node.canHaveGrandchildren();
	}, 'throws exception when called' );
} );

test( 'prototype.getType', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getType(), 'stub' );
} );

test( 'prototype.getParent', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getParent(), null );
} );

test( 'prototype.getRoot', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getRoot(), node );
} );

test( 'prototype.setRoot', 1, function() {
	var node1 = new ve.NodeStub(),
		node2 = new ve.NodeStub();
	node1.setRoot( node2 );
	strictEqual( node1.getRoot(), node2 );
} );

test( 'prototype.attach', 2, function() {
	var node1 = new ve.NodeStub(),
		node2 = new ve.NodeStub();
	node1.attach( node2 );
	strictEqual( node1.getParent(), node2 );
	strictEqual( node1.getRoot(), node2 );
} );

test( 'prototype.detach', 2, function() {
	var node1 = new ve.NodeStub(),
		node2 = new ve.NodeStub();
	node1.attach( node2 );
	node1.detach();
	strictEqual( node1.getParent(), null );
	strictEqual( node1.getRoot(), node1 );
} );

