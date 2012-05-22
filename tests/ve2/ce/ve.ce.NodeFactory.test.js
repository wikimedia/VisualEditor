module( 've.ce.NodeFactory' );

/* Stubs */

ve.ce.NodeFactoryNodeStub = function( a, b ) {
	this.a = a;
	this.b = b;
};

ve.ce.NodeFactoryNodeStub.rules = {
	'canBeSplit': false
};

/* Tests */

test( 'canNodeBeSplit', 2, function() {
	var factory = new ve.ce.NodeFactory();
	raises( function() {
			factory.create( 'node-factory-node-stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: node-factory-node-stub$/,
		'throws an exception when getting allowed child nodes of a node of an unregistered type'
	);
	factory.register( 'node-factory-node-stub', ve.ce.NodeFactoryNodeStub );
	strictEqual(
		factory.canNodeBeSplit( 'node-factory-node-stub' ),
		false,
		'gets split rules for registered nodes'
	);
} );

test( 'initialization', 1, function() {
	ok( ve.ce.factory instanceof ve.ce.NodeFactory, 'factory is initialized at ve.ce.factory' );
} );
