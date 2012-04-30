module( 've.LeafNode' );

/* Stubs */

ve.LeafNodeStub = function() {
	// Inheritance
	ve.LeafNode.call( this );
};

ve.extendClass( ve.LeafNodeStub, ve.LeafNode );

/* Tests */

test( 'canHaveChildren', 1, function() {
	var node = new ve.LeafNodeStub();
	equal( node.canHaveChildren(), false );
} );
