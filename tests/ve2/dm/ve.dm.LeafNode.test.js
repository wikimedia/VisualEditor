module( 've.dm.LeafNode' );

/* Stubs */

ve.dm.LeafNodeStub = function() {
	// Inheritance
	ve.dm.LeafNode.call( this, 'leaf-stub' );
};

ve.dm.LeafNodeStub.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'isWrapped': true
};

ve.extendClass( ve.dm.LeafNodeStub, ve.dm.LeafNode );

ve.dm.factory.register( 'leaf-stub', ve.dm.LeafNodeStub );

/* Tests */

test( 'canHaveChildren', 1, function() {
	var node = new ve.dm.LeafNodeStub();
	equal( node.canHaveChildren(), false );
} );

test( 'canHaveGrandchildren', 1, function() {
	var node = new ve.dm.LeafNodeStub();
	equal( node.canHaveGrandchildren(), false );
} );
