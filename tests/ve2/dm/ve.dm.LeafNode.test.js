module( 've.dm.LeafNode' );

/* Stubs */

ve.dm.LeafNodeStub = function() {
	// Inheritance
	ve.dm.LeafNode.call( this, 'stub' );
};

ve.extendClass( ve.dm.LeafNodeStub, ve.dm.LeafNode );

/* Tests */

test( 'canHaveChildren', 1, function() {
	var node = new ve.dm.LeafNodeStub();
	equal( node.canHaveChildren(), false );
} );
