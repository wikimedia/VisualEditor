/*!
 * VisualEditor DataModel LinearData tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.LinearData' );

/* Tests */

QUnit.test( 'basic usage', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) );

	assert.strictEqual( data.getData(), data.data, 'getData: with no arguments returns data by reference' );
	assert.deepEqual( data.getData(), ve.dm.example.data, 'getData: full array matches source data' );
	assert.strictEqual( data.getData( 10 ), data.data[ 10 ], 'getData: data at offset 10 is same as array[10]' );
	assert.strictEqual( data.getData( -1 ), data.data[ -1 ], 'getData: data at -1 is undefined' );

	data.setData( 1, 'x' );
	assert.strictEqual( data.data[ 1 ], 'x', 'setData: data set at offset 1 changed' );
	assert.strictEqual( data.getLength(), data.data.length, 'getLength: equal to array length' );
	assert.strictEqual( data.getStore(), store, 'getStore: equal to original store by reference' );
} );

QUnit.test( 'slice(Object)/splice(Object)/batchSplice(Object)', ( assert ) => {
	const store = new ve.dm.HashValueStore();

	let data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) ),
		expectedData = ve.copy( ve.dm.example.data );

	assert.deepEqual( data.slice( 7, 22 ), expectedData.slice( 7, 22 ),
		'slice: result matches slice'
	);
	assert.deepEqual( data.getData(), expectedData,
		'slice: arrays match after slice'
	);
	const dataSlice = data.sliceObject( 10, 12 );
	const expectedDataSlice = new ve.dm.LinearData( store,
		expectedData.slice( 10, 12 )
	);
	assert.deepEqual( dataSlice.getData(), expectedDataSlice.getData(),
		'slice: matches data built with Array.slice'
	);
	assert.strictEqual( dataSlice.getStore(), data.getStore(),
		'slice: store equal by reference to original object'
	);

	// Reset data
	data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) );
	expectedData = ve.copy( ve.dm.example.data );

	assert.deepEqual( data.splice( 1, 3, ...'xyz' ), expectedData.splice( 1, 3, ...'xyz' ),
		'splice: result matches splice'
	);
	assert.deepEqual( data.getData(), expectedData,
		'splice: arrays match after splice'
	);
	let dataSplice = data.spliceObject( 7, 3, 'x' );
	let expectedDataSplice = new ve.dm.LinearData( store,
		expectedData.splice( 7, 3, 'x' )
	);
	assert.deepEqual( dataSplice.getData(), expectedDataSplice.getData(),
		'splice: matches data built with Array.splice'
	);
	assert.strictEqual( dataSplice.getStore(), data.getStore(),
		'splice: store equal by reference to original object'
	);

	// Reset data
	data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) );
	expectedData = ve.copy( ve.dm.example.data );

	assert.deepEqual(
		data.batchSplice( 1, 3, [ ...'xyz' ] ),
		ve.batchSplice( expectedData, 1, 3, [ ...'xyz' ] ),
		'batchSplice: result matches ve.batchSplice'
	);
	assert.deepEqual( data.getData(), expectedData, 'batchSplice: array matches after batch splice' );

	dataSplice = data.batchSpliceObject( 7, 3, 'x' );
	expectedDataSplice = new ve.dm.LinearData( store,
		ve.batchSplice( expectedData, 7, 3, 'x' )
	);
	assert.deepEqual( dataSplice.getData(), expectedDataSplice.getData(),
		'batchSplice: matches data built with ve.batchSplice'
	);
	assert.strictEqual( dataSplice.getStore(), data.getStore(),
		'batchSplice: store equal by reference to original object'
	);

} );

QUnit.test( 'static methods: getType, isElementData, isOpenElementData, isCloseElementData', ( assert ) => {
	const openElement = { type: 'paragraph' },
		closeElement = { type: '/paragraph' };

	assert.strictEqual( ve.dm.LinearData.static.getType( openElement ), 'paragraph', 'getType of open element' );
	assert.strictEqual( ve.dm.LinearData.static.getType( closeElement ), 'paragraph', 'getType of close element' );

	assert.true( ve.dm.LinearData.static.isElementData( openElement ), 'openElement isElementData' );
	assert.true( ve.dm.LinearData.static.isElementData( closeElement ), 'closeElement isElementData' );
	assert.false( ve.dm.LinearData.static.isElementData( 'x' ), 'text not isElementData' );
	assert.false( ve.dm.LinearData.static.isElementData( [ 'x', 'hash' ] ), 'annotated text not isElementData' );

	assert.true( ve.dm.LinearData.static.isOpenElementData( openElement ), 'openElement isOpenElementData' );
	assert.false( ve.dm.LinearData.static.isOpenElementData( closeElement ), 'closeElement not isOpenElementData' );

	assert.false( ve.dm.LinearData.static.isCloseElementData( openElement ), 'openElement not isCloseElementData' );
	assert.true( ve.dm.LinearData.static.isCloseElementData( closeElement ), 'closeElement isCloseElementData' );
} );

QUnit.test( 'push', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, [ 'a', 'b' ] );

	data.push( 'c', 'd' );
	assert.deepEqual( data.getData(), [ 'a', 'b', 'c', 'd' ], 'push: elements added' );
} );

QUnit.test( 'getDataSlice', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, [ 'a', 'b', 'c', 'd', 'e' ] );

	assert.deepEqual( data.getDataSlice( new ve.Range( 1, 4 ) ), [ 'b', 'c', 'd' ], 'getDataSlice: data' );
	assert.notStrictEqual( data.getDataSlice( new ve.Range( 1, 4 ) ), data.getData().slice( 1, 4 ), 'getDataSlice: returns a copy, not reference' );
} );

QUnit.test( 'clone', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, [ 'x', 'y', 'z' ] ),
		clone = data.clone();

	assert.deepEqual( clone.getData(), data.getData(), 'clone: data matches original' );
	assert.notStrictEqual( clone.getData(), data.getData(), 'clone: deep copy created' );
	assert.strictEqual( clone.getStore(), data.getStore(), 'clone: store reference is the same' );
} );
