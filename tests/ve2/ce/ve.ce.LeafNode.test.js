module( 've.ce.LeafNode' );

/* Stubs */

ve.ce.LeafNodeStub = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model );
};

ve.extendClass( ve.ce.LeafNodeStub, ve.ce.LeafNode );

ve.ce.factory.register( 'leaf-stub', ve.ce.BranchNodeStub );

/* Tests */

/*
test( '', 1, function() {
	//
} );
*/