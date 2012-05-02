module( 've.ce.LeafNode' );

/* Stubs */

ve.ce.LeafNodeStub = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model );
};

ve.extendClass( ve.ce.LeafNodeStub, ve.ce.LeafNode );

ve.ce.factory.register( 'leaf-stub', ve.ce.BranchNodeStub );

/* Tests */

test( 'render', 1, function() {
	var node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	raises(
		function() {
			node.render();
		},
		/^ve.ce.LeafNode.render not implemented in this subclass: /,
		'throws exception if called'
	);
} );
