module( 've.dm.NodeFactory' );

/* Stubs */

ve.dm.NodeFactoryNodeStub = function( a, b ) {
	this.a = a;
	this.b = b;
};

ve.dm.NodeFactoryNodeStub.rules = {
	'isContent': true,
	'canContainContent': false,
	'isWrapped': true,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

/* Tests */

test( 'getChildNodeTypes', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.create( 'node-factory-node-stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: node-factory-node-stub$/,
		'throws an exception when getting allowed child nodes of a node of an unregistered type'
	);
	factory.register( 'node-factory-node-stub', ve.dm.NodeFactoryNodeStub );
	deepEqual(
		factory.getChildNodeTypes( 'node-factory-node-stub' ),
		[],
		'gets child type rules for registered nodes'
	);
} );

test( 'getParentNodeTypes', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.create( 'node-factory-node-stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: node-factory-node-stub$/,
		'throws an exception when getting allowed parent nodes of a node of an unregistered type'
	);
	factory.register( 'node-factory-node-stub', ve.dm.NodeFactoryNodeStub );
	deepEqual(
		factory.getParentNodeTypes( 'node-factory-node-stub' ),
		null,
		'gets parent type rules for registered nodes'
	);
} );

test( 'canNodeHaveChildren', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.create( 'node-factory-node-stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: node-factory-node-stub$/,
		'throws an exception when checking if a node of an unregistered type can have children'
	);
	factory.register( 'node-factory-node-stub', ve.dm.NodeFactoryNodeStub );
	strictEqual(
		factory.canNodeHaveChildren( 'node-factory-node-stub' ),
		false,
		'gets child rules for registered nodes'
	);
} );

test( 'canNodeHaveGrandchildren', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.create( 'node-factory-node-stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: node-factory-node-stub$/,
		'throws an exception when checking if a node of an unregistered type can have grandchildren'
	);
	factory.register( 'node-factory-node-stub', ve.dm.NodeFactoryNodeStub );
	strictEqual(
		factory.canNodeHaveGrandchildren( 'node-factory-node-stub' ),
		false,
		'gets grandchild rules for registered nodes'
	);
} );

test( 'initialization', 1, function() {
	ok( ve.dm.nodeFactory instanceof ve.dm.NodeFactory, 'factory is initialized at ve.dm.nodeFactory' );
} );
