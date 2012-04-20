module( 've.dm.LeafNode' );

/* Stubs */

ve.dm.LeafNodeStub = function() {
	// Inheritance
	ve.dm.LeafNode.call( this, 'stub' );
};

ve.extendClass( ve.dm.LeafNodeStub, ve.dm.LeafNode );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	var node = new ve.dm.LeafNodeStub();
	strictEqual( node.canHaveChildren(), false );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	var node = new ve.dm.LeafNodeStub();
	strictEqual( node.canHaveGrandchildren(), false );
} );
