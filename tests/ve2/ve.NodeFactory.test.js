module( 've.NodeFactory' );

/* Stubs */

ve.NodeStub1 = function( content, attributes ) {
	this.content = content;
	this.attributes = attributes;
	this.type = 'nodestub1';
};

ve.NodeStub2 = function( content, attributes ) {
	this.content = content;
	this.attributes = attributes;
	this.type = 'nodestub2';
};

/* Tests */

test( 've.NodeFactory', function() {
	var factory = new ve.NodeFactory();
	
	factory.register( 'nodestub1', ve.NodeStub1 );
	var ns1 = factory.createNode( 'nodestub1', 42, { 'foo': 'bar' } );
	deepEqual( ns1, new ve.NodeStub1( 42, { 'foo': 'bar' } ), 'createNode creates a node ' +
		'using the registered constructor and passes through arguments' );
	
	deepEqual( factory.createNode( 'nodestub2', 23, { 'bar': 'baz' } ), null, 'createNode ' +
		'returns null for unregistered node types' );
	factory.register( 'nodestub2', ve.NodeStub2 );
	var ns2 = factory.createNode( 'nodestub2', 16, { 'baz': 'quux' } );
	deepEqual( ns2, new ve.NodeStub2( 16, { 'baz': 'quux' } ), 'createNode creates a node ' +
		'with a previously unregistered type' );
	
	raises( function() {
			factory.register( 'nodestub3', 'nodestub3' );
		},
		/^Constructor must be a function, cannot be a string$/,
		'register throws an exception when trying to register a string as a constructor'
	);
} );
