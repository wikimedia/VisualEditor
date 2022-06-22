/*!
 * VisualEditor tests for ve.init.ListStorage.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-disable camelcase */

QUnit.module( 've.init.ListStorage' );

QUnit.test( 'Basic methods', function ( assert ) {
	var store = {},
		storage = ve.init.platform.createSessionStorage( store );

	// Basic methods still work
	storage.set( 'foo', 'bar' );
	assert.strictEqual( store.foo, 'bar', 'String stored' );
	assert.strictEqual( storage.get( 'foo' ), 'bar', 'String fetched' );
	storage.remove( 'foo' );
	assert.false( 'foo' in store, 'String removed' );

	storage.setObject( 'foo', { x: 1 } );
	assert.strictEqual( store.foo, '{"x":1}', 'Object stored' );
	assert.deepEqual( storage.getObject( 'foo' ), { x: 1 }, 'Object fetched' );
	storage.remove( 'foo' );
	assert.false( 'foo' in store, 'Object removed' );
} );

QUnit.test( 'List methods', function ( assert ) {
	var store = {},
		storage = ve.init.platform.createSessionStorage( store );

	storage.appendToList( 'list', 'hello' );
	assert.strictEqual( storage.getListLength( 'list' ), 1, 'List has length 1' );
	assert.deepEqual(
		store,
		{
			list__0: 'hello',
			list__length: '1'
		},
		'First item appended'
	);
	assert.deepEqual( storage.getList( 'list' ), [ 'hello' ], 'List fetched with one item' );

	storage.appendToList( 'list', 'world' );
	assert.strictEqual( storage.getListLength( 'list' ), 2, 'List has length 2' );
	assert.deepEqual(
		store,
		{
			list__0: 'hello',
			list__1: 'world',
			list__length: '2'
		},
		'Second item appended'
	);
	assert.deepEqual( storage.getList( 'list' ), [ 'hello', 'world' ], 'List fetched with two items' );

	storage.removeList( 'list' );
	assert.deepEqual( store, {}, 'List removed' );
	assert.deepEqual( storage.getList( 'list' ), [], 'Removed list returns empty array' );

} );
