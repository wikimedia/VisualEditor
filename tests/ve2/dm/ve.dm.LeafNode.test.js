module( 've.dm.LeafNode' );

/* Stubs */

ve.dm.LeafNodeStub = function() {
	// Inheritance
	ve.dm.LeafNode.call( this, 'leaf-stub' );
};

ve.dm.LeafNodeStub.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false
};

ve.extendClass( ve.dm.LeafNodeStub, ve.dm.LeafNode );

ve.dm.factory.register( 'leaf-stub', ve.dm.LeafNodeStub );

/* Tests */
