/**
 * VisualEditor Factory tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.Factory' );

/* Stubs */

ve.FactoryObjectStub = function( a, b ) {
	this.a = a;
	this.b = b;
};

/* Tests */

test( 'register', 1, function() {
	var factory = new ve.Factory();
	raises(
		function() {
			factory.register( 'factory-object-stub', 'not-a-function' );
		},
		/^Constructor must be a function, cannot be a string$/,
		'throws an exception when trying to register a non-function value as a constructor'
	);
} );

test( 'create', 2, function() {
	var factory = new ve.Factory();
	raises(
		function() {
			factory.create( 'factory-object-stub', 23, { 'bar': 'baz' } );
		},
		/^Unknown object type: factory-object-stub$/,
		'throws an exception when trying to create a object of an unregistered type'
	);
	factory.register( 'factory-object-stub', ve.FactoryObjectStub );
	deepEqual(
		factory.create( 'factory-object-stub', 16, { 'baz': 'quux' } ),
		new ve.FactoryObjectStub( 16, { 'baz': 'quux' } ),
		'creates objects of a registered type and passes through arguments'
	);
} );

test( 'lookup', 1, function() {
	var factory = new ve.Factory();
	factory.register( 'factory-object-stub', ve.FactoryObjectStub );
	strictEqual( factory.lookup( 'factory-object-stub' ), ve.FactoryObjectStub );
} );
