module( 've.dm.Node' );

/* Stubs */

ve.dm.NodeStub = function( length, attributes ) {
	// Inheritance
	ve.dm.Node.call( this, 'stub', length, attributes );
};

ve.extendClass( ve.dm.NodeStub, ve.dm.Node );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	raises(
		function() {
			var node = new ve.dm.NodeStub();
			// Abstract method, must be overridden, throws exception when called
			node.canHaveChildren();
		},
		/^ve.Node.canHaveChildren not implemented in this subclass: /,
		'throws exception when called'
	);
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	raises(
		function() {
			var node = new ve.dm.NodeStub();
			// Abstract method, must be overridden, throws exception when called
			node.canHaveGrandchildren();
		},
		/^ve.Node.canHaveGrandchildren not implemented in this subclass: /,
		'throws exception when called'
	);
} );

test( 'prototype.createView', 1, function() {
	raises(
		function() {
			var node = new ve.dm.NodeStub();
			// Abstract method, must be overridden, throws exception when called
			node.createView();
		},
		/^ve.dm.Node.createView not implemented in this subclass: /,
		'throws exception when called'
	);
} );

test( 'prototype.getLength', 2, function() {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub( 1234 );
	strictEqual( node1.getLength(), 0 );
	strictEqual( node2.getLength(), 1234 );
} );

test( 'prototype.getOuterLength', 2, function() {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub( 1234 );
	strictEqual( node1.getOuterLength(), 0 );
	strictEqual( node2.getOuterLength(), 1234 );
} );

test( 'prototype.setLength', 2, function() {
	var node = new ve.dm.NodeStub();
	node.setLength( 1234 );
	strictEqual( node.getLength(), 1234 );
	raises(
		function() {
			// Length can not be negative
			node.setLength( -1 );
		},
		/^Length cannot be negative$/,
		'throws exception if length is negative'
	);
} );

test( 'prototype.adjustLength', 1, function() {
	var node = new ve.dm.NodeStub( 1234 );
	node.adjustLength( 5678 );
	strictEqual( node.getLength(), 6912 );
} );

test( 'prototype.getAttribute', 2, function() {
	var node = new ve.dm.NodeStub( 0, { 'a': 1, 'b': 2 } );
	strictEqual( node.getAttribute( 'a' ), 1 );
	strictEqual( node.getAttribute( 'b' ), 2 );
} );

test( 'prototype.setRoot', 1, function() {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub();
	node1.setRoot( node2 );
	strictEqual( node1.getRoot(), node2 );
} );

test( 'prototype.attach', 2, function() {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub();
	node1.attach( node2 );
	strictEqual( node1.getParent(), node2 );
	strictEqual( node1.getRoot(), node2 );
} );

test( 'prototype.detach', 2, function() {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub();
	node1.attach( node2 );
	node1.detach();
	strictEqual( node1.getParent(), null );
	strictEqual( node1.getRoot(), node1 );
} );

