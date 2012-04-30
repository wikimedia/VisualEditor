module( 've.NodeFactory' );

/* Stubs */

ve.NodeFactoryNodeStub = function( a, b ) {
	this.a = a;
	this.b = b;
};

/* Tests */

test( 'register', 1, function() {
	var factory = new ve.NodeFactory();
	raises( function() {
			factory.register( 'stub', 'not-a-function' );
		},
		/^Constructor must be a function, cannot be a string$/,
		'throws an exception when trying to register a non-function value as a constructor'
	);
} );

test( 'create', 2, function() {
	var factory = new ve.NodeFactory();
	raises( function() {
			factory.createNode( 'stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: stub$/,
		'throws an exception when trying to create a node of an unregistered type'
	);
	factory.register( 'stub', ve.NodeFactoryNodeStub );
	deepEqual(
		factory.createNode( 'stub', 16, { 'baz': 'quux' } ),
		new ve.NodeFactoryNodeStub( 16, { 'baz': 'quux' } ),
		'creates nodes of a registered type and passes through arguments'
	);
} );
