module( 've.TwigNode' );

/* Stubs */

ve.TwigNodeStub = function() {
	// Inheritance
	ve.TwigNode.call( this, 'stub' );
};

ve.extendClass( ve.TwigNodeStub, ve.TwigNode );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	var node = new ve.TwigNodeStub();
	strictEqual( node.canHaveChildren(), true );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	var node = new ve.TwigNodeStub();
	strictEqual( node.canHaveGrandchildren(), false );
} );
