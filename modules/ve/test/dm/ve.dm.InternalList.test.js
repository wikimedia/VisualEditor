/*!
 * VisualEditor DataModel InternalList tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.InternalList' );

/* Tests */

QUnit.test( 'getDocument', 1, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList();
	assert.deepEqual( internalList.getDocument(), doc, 'Returns original document' );
} );

QUnit.test( 'queueItemHtml/getItemsHtml', 4, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList();
	assert.equal( internalList.queueItemHtml( 'foo', 'Bar' ), 0, 'First queued item returns index 0' );
	assert.equal( internalList.queueItemHtml( 'foo', 'Baz' ), 0, 'Duplicate key returns index 0' );
	assert.equal( internalList.queueItemHtml( 'bar', 'Baz' ), 1, 'Second queued item returns index 1' );
	assert.deepEqual( internalList.getItemsHtml(), ['Bar', 'Baz'], 'getItemsHtml returns stored HTML items' );
} );

QUnit.test( 'convertToData', 2, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList(),
		expectedData = [
			{ 'type': 'internalList' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'B', 'a', 'r',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'B', 'a', 'z',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': '/internalList' },
		];

	// Mimic convert state setup (as done in ve.dm.Converter#getDataFromDom)
	// TODO: The test should not (directly) reference the global instance
	ve.dm.converter.doc = doc;
	ve.dm.converter.store = doc.getStore();
	ve.dm.converter.internalList = internalList;
	ve.dm.converter.contextStack = [];

	internalList.queueItemHtml( 'foo', 'Bar' );
	internalList.queueItemHtml( 'bar', 'Baz' );
	assert.deepEqual( internalList.convertToData( ve.dm.converter ), expectedData, 'Data matches' );
	assert.deepEqual( internalList.getItemsHtml(), [], 'Items html is emptied after conversion' );
} );

QUnit.test( 'clone', 3, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		doc2 = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList(),
		internalListClone = internalList.clone(),
		internalListClone2 = internalList.clone( doc2 );

	assert.equal( internalListClone.getDocument(), internalList.getDocument(), 'Documents match' );
	assert.deepEqual( internalListClone.getStore(), internalList.getStore(), 'Stores match' );

	assert.equal( internalListClone2.getDocument(), doc2, 'Cloning with document parameter' );
} );
