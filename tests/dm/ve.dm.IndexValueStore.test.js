/*!
 * VisualEditor DataModel IndexValueStore tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.IndexValueStore' );

/* Tests */

QUnit.test( 'index(es)', 10, function ( assert ) {
	var index, indexes,
		object1 = { a: 1, b: 2 },
		object1Hash = 'h608de49a4600dbb5',
		object2 = { c: 3, d: 4 },
		object2Hash = 'hdf3d2cbd332be4da',
		customHash = 'hb05df789ce115b75',
		store = new ve.dm.IndexValueStore();

	index = store.index( object1 );
	assert.strictEqual( index, object1Hash, 'First object stores in hash' );
	index = store.index( object1 );
	assert.strictEqual( index, object1Hash, 'First object re-stores in hash' );
	index = store.index( object2 );
	assert.strictEqual( index, object2Hash, 'Second object stores in 1' );
	assert.deepEqual( store.value( object1Hash ), object1, 'first object has finds first object' );

	index = store.index( object2, 'custom hash string' );
	assert.strictEqual( index, customHash, 'Second object with custom hash stores in custom hash' );
	index = store.index( object1, 'custom hash string' );
	assert.strictEqual( index, customHash, 'Using the same custom hash with a different object returns custom hash again' );
	assert.deepEqual( store.value( customHash ), object2, 'Second object was not overwritten' );

	store = new ve.dm.IndexValueStore();

	indexes = store.indexes( [ object1, object2 ] );
	assert.deepEqual( indexes, [ object1Hash, object2Hash ], 'Store two objects in 0,1' );

	store = new ve.dm.IndexValueStore();

	index = store.index( 'String to store' );
	assert.strictEqual( store.value( index ), 'String to store', 'Strings are stored as strings, not objects' );

	index = store.index( [ 'array', 1, 2, 3 ] );
	assert.deepEqual( store.value( index ), [ 'array', 1, 2, 3 ], 'Arrays are stored as arrays, not objects' );

} );

QUnit.test( 'value(s)', 5, function ( assert ) {
	var object1 = { a: 1, b: 2 },
		object1Hash = 'h608de49a4600dbb5',
		object2 = { c: 3, d: 4 },
		object2Hash = 'hdf3d2cbd332be4da',
		store = new ve.dm.IndexValueStore();

	store.index( object1 );
	store.index( object2 );
	assert.deepEqual( store.value( object1Hash ), object1, 'First hash gets first stored object' );
	assert.deepEqual( store.value( object2Hash ), object2, 'Second hash gets second stored object' );
	assert.strictEqual( store.value( 'h0missing' ), undefined, 'Value of missing hash is undefined' );
	assert.deepEqual( store.values( [ object2Hash, object1Hash ] ), [ object2, object1 ], 'Values [secondHash, firstHash] are second and first object' );
	object1.a = 3;
	assert.deepEqual( store.value( object1Hash ), { a: 1, b: 2 }, 'Value 0 is still first stored object after original has been modified' );
} );

QUnit.test( 'slice', 3, function ( assert ) {
	var sliced,
		values = [ 'foo', 'bar', 'baz', 'qux', 'quux' ],
		store = new ve.dm.IndexValueStore();

	store.indexes( values );
	sliced = store.slice( 2, 4 );
	assert.deepEqual( sliced.values( sliced.hashes ), values.slice( 2, 4 ), 'Slice' );
	sliced = store.slice( 3 );
	assert.deepEqual( sliced.values( sliced.hashes ), values.slice( 3 ), 'Slice to end' );
	sliced = store.slice();
	assert.deepEqual( sliced.values( sliced.hashes ), values, 'Slice all' );
} );
