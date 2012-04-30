module( 've.dm.NodeFactory' );

/* Stubs */

ve.dm.NodeFactoryNodeStub = function( a, b ) {
	this.a = a;
	this.b = b;
};

ve.dm.NodeFactoryNodeStub.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'childNodeTypes': ['a', 'b'],
	'parentNodeTypes': ['c', 'd']
};

/* Tests */

test( 'canNodeHaveChildren', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.createNode( 'stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: stub$/,
		'throws an exception when checking if a node of an unregistered type can have children'
	);
	factory.register( 'stub', ve.dm.NodeFactoryNodeStub );
	equal(
		factory.canNodeHaveChildren( 'stub' ),
		false,
		'gets child rules for registered nodes'
	);
} );

test( 'canNodeHaveGrandchildren', 2, function() {
	var factory = new ve.dm.NodeFactory();
	raises( function() {
			factory.createNode( 'stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown node type: stub$/,
		'throws an exception when checking if a node of an unregistered type can have grandchildren'
	);
	factory.register( 'stub', ve.dm.NodeFactoryNodeStub );
	equal(
		factory.canNodeHaveGrandchildren( 'stub' ),
		false,
		'gets grandchild rules for registered nodes'
	);
} );

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
