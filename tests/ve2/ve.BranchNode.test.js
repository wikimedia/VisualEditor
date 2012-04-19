module( 've.BranchNode' );

/* Stubs */

ve.BranchNodeStub = function() {
	// Inheritance
	ve.BranchNode.call( this, 'stub' );
};

ve.extendClass( ve.BranchNodeStub, ve.BranchNode );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	var node = new ve.BranchNodeStub();
	strictEqual( node.canHaveChildren(), true );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	var node = new ve.BranchNodeStub();
	strictEqual( node.canHaveGrandchildren(), true );
} );
