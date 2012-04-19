module( 've.dm.BranchNode' );

/* Stubs */

ve.dm.BranchNodeStub = function( children ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'stub', children );
};

ve.extendClass( ve.dm.BranchNodeStub, ve.dm.BranchNode );

/* Tests */

test( 'prototype.setRoot', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub( [node1] ),
		node3 = new ve.dm.BranchNodeStub( [node2] ),
		node4 = new ve.dm.BranchNodeStub();
	node3.setRoot( node4 );
	strictEqual( node3.getRoot(), node4 );
	strictEqual( node2.getRoot(), node4 );
	strictEqual( node1.getRoot(), node4 );
} );

test( 'prototype.push', 2, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1] );
	strictEqual( node3.push( node2 ), 2 );
	deepEqual( node3.getChildren(), [node1, node2] );
} );

test( 'prototype.pop', 2, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] );
	strictEqual( node3.pop(), node2 );
	deepEqual( node3.getChildren(), [node1] );
} );

test( 'prototype.unshift', 2, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1] );
	strictEqual( node3.unshift( node2 ), 2 );
	deepEqual( node3.getChildren(), [node2, node1] );
} );

test( 'prototype.shift', 2, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] );
	strictEqual( node3.shift(), node1 );
	deepEqual( node3.getChildren(), [node2] );
} );

test( 'prototype.splice', 6, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub(),
		node4 = new ve.dm.BranchNodeStub( [node1, node2] );
	// Insert
	deepEqual( node4.splice( 1, 0, node3 ), [] );
	deepEqual( node4.getChildren(), [node1, node3, node2] );
	// Remove
	deepEqual( node4.splice( 1, 1 ), [node3] );
	deepEqual( node4.getChildren(), [node1, node2] );
	// Remove and insert
	deepEqual( node4.splice( 1, 1, node3 ), [node2] );
	deepEqual( node4.getChildren(), [node1, node3] );
} );
