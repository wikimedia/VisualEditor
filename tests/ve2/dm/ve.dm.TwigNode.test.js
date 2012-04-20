module( 've.dm.TwigNode' );

/* Stubs */

ve.dm.TwigNodeStub = function( children ) {
	// Inheritance
	ve.dm.TwigNode.call( this, 'stub', children );
};

ve.extendClass( ve.dm.TwigNodeStub, ve.dm.TwigNode );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	var node = new ve.dm.TwigNodeStub();
	strictEqual( node.canHaveChildren(), true );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	var node = new ve.dm.TwigNodeStub();
	strictEqual( node.canHaveGrandchildren(), false );
} );

test( 'prototype.splice', 8, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.TwigNodeStub(),
		node3 = new ve.dm.LeafNodeStub(),
		node4 = new ve.dm.TwigNodeStub();
	node4.on( 'beforeSplice', function() {
		// Will be called 3 times
		ok( true, 'beforeSplice was emitted' );
	} );
	node4.on( 'afterSplice', function() {
		// Will be called 1 time
		ok( true, 'afterSplice was emitted' );
	} );
	raises( function() {
		node4.splice( 0, 0, node1 );
	}, 'inserting a branch into twig throws an exception' );
	raises( function() {
		node4.splice( 0, 0, node2 );
	}, 'inserting a twig into another twig throws an exception' );
	// Insert leaf
	deepEqual( node4.splice( 0, 0, node3 ), [] );
	deepEqual( node4.getChildren(), [node3] );
} );
