module( 've.Node' );

/* Stubs */

ve.NodeStub = function() {
	// Inheritance
	ve.Node.call( this, 'stub' );
};

ve.extendClass( ve.NodeStub, ve.Node );

/* Tests */

test( 'prototype.canHaveChildren', 1, function() {
	raises( function() {
		var node = new ve.NodeStub();
		// Abstract method, must be overridden, throws exception when called
		node.canHaveChildren();
	}, 'throws exception when called' );
} );

test( 'prototype.canHaveGrandchildren', 1, function() {
	raises( function() {
		var node = new ve.NodeStub();
		// Abstract method, must be overridden, throws exception when called
		node.canHaveGrandchildren();
	}, 'throws exception when called' );
} );

test( 'prototype.getType', 1, function() {
	var node = new ve.NodeStub();
	strictEqual( node.getType(), 'stub' );
} );
