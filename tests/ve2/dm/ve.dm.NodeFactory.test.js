module( 've.dm.NodeFactory' );

/* Stubs */

ve.dm.NodeFactoryNodeStub = function( a, b ) {
	this.a = a;
	this.b = b;
};

ve.dm.NodeFactoryNodeStub.rules = {
	'childNodeTypes': ['a', 'b'],
	'parentNodeTypes': ['c', 'd']
};

/* Tests */

test( 'getChildNodeTypes', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.createNode( 'stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: stub$/,
		'throws an exception when getting allowed child nodes of a node of an unregistered type'
	);
	factory.register( 'stub', ve.dm.NodeFactoryNodeStub );
	deepEqual(
		factory.getChildNodeTypes( 'stub' ),
		['a', 'b'],
		'gets child type rules for registered nodes'
	);
} );

test( 'getParentNodeTypes', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.createNode( 'stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: stub$/,
		'throws an exception when getting allowed parent nodes of a node of an unregistered type'
	);
	factory.register( 'stub', ve.dm.NodeFactoryNodeStub );
	deepEqual(
		factory.getParentNodeTypes( 'stub' ),
		['c', 'd'],
		'gets parent type rules for registered nodes'
	);
} );

test( 'initialization', 1, function() {
	ok( ve.dm.factory instanceof ve.dm.NodeFactory, 'factory is initialized at ve.dm.factory' );
} );
