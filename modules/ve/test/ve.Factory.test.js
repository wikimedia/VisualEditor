/**
 * VisualEditor Factory tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.Factory' );

/* Stubs */

ve.FactoryObjectStub = function VeFactoryObjectStub( a, b, c ) {
	this.a = a;
	this.b = b;
	this.c = c;
};

/* Tests */

QUnit.test( 'register', 1, function ( assert ) {
	var factory = new ve.Factory();
	assert.throws(
		function () {
			factory.register( 'factory-object-stub', 'not-a-function' );
		},
		Error,
		'throws an exception when trying to register a non-function value as a constructor'
	);
} );

QUnit.test( 'create', 2, function ( assert ) {
	var factory = new ve.Factory();
	assert.throws(
		function () {
			factory.create( 'factory-object-stub', 23, 'foo', { 'bar': 'baz' } );
		},
		Error,
		'throws an exception when trying to create a object of an unregistered type'
	);
	factory.register( 'factory-object-stub', ve.FactoryObjectStub );
	assert.deepEqual(
		factory.create( 'factory-object-stub', 16, 'foo', { 'baz': 'quux' } ),
		new ve.FactoryObjectStub( 16, 'foo', { 'baz': 'quux' } ),
		'creates objects of a registered type and passes through arguments'
	);
} );

QUnit.test( 'lookup', 1, function ( assert ) {
	var factory = new ve.Factory();
	factory.register( 'factory-object-stub', ve.FactoryObjectStub );
	assert.strictEqual( factory.lookup( 'factory-object-stub' ), ve.FactoryObjectStub );
} );
