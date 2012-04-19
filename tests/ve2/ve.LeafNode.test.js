module( 've.LeafNode' );

/* Stubs */

ve.LeafNodeStub = function() {
	// Inheritance
	ve.LeafNode.call( this );
};

ve.extendClass( ve.LeafNodeStub, ve.LeafNode );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	var node = new ve.LeafNodeStub();
	strictEqual( node.canHaveChildren(), false );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	var node = new ve.LeafNodeStub();
	strictEqual( node.canHaveGrandchildren(), false );
} );
