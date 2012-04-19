module( 've.BranchNode' );

/* Stubs */

ve.BranchNodeStub = function( children ) {
	// Inheritance
	ve.BranchNode.call( this, children );
};

ve.extendClass( ve.BranchNodeStub, ve.BranchNode );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	var node = new ve.BranchNodeStub();
	strictEqual( node.canHaveChildren(), true );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	var node = new ve.BranchNodeStub();
	strictEqual( node.canHaveGrandchildren(), true );
} );

test( 'prototype.getChildren', 2, function() {
	var node1 = new ve.BranchNodeStub(),
		node2 = new ve.BranchNodeStub( [node1] );
	deepEqual( node1.getChildren(), [] );
	deepEqual( node2.getChildren(), [node1] );
} );

test( 'prototype.indexOf', 4, function() {
	var node1 = new ve.BranchNodeStub(),
		node2 = new ve.BranchNodeStub(),
		node3 = new ve.BranchNodeStub(),
		node4 = new ve.BranchNodeStub( [node1, node2, node3] );
	strictEqual( node4.indexOf( null ), -1 );
	strictEqual( node4.indexOf( node1 ), 0 );
	strictEqual( node4.indexOf( node2 ), 1 );
	strictEqual( node4.indexOf( node3 ), 2 );
} );
