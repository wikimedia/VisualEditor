module( 've.ce.LeafNode' );

/* Stubs */

ve.ce.LeafNodeStub = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'leaf-stub', model );
};

ve.ce.LeafNodeStub.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'isWrapped': true
};

ve.extendClass( ve.ce.LeafNodeStub, ve.ce.LeafNode );

ve.ce.factory.register( 'leaf-stub', ve.ce.LeafNodeStub );

/* Tests */

test( 'canHaveChildren', 1, function() {
	var node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	equal( node.canHaveChildren(), false );
} );

test( 'canHaveGrandchildren', 1, function() {
	var node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	equal( node.canHaveGrandchildren(), false );
} );
