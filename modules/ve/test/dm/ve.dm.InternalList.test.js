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

QUnit.test( 'queueItemHtml/getItemHtmlQueue', 4, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList();
	assert.equal( internalList.queueItemHtml( 'reference', 'foo', 'Bar' ), 0, 'First queued item returns index 0' );
	assert.equal( internalList.queueItemHtml( 'reference', 'foo', 'Baz' ), 0, 'Duplicate key returns index 0' );
	assert.equal( internalList.queueItemHtml( 'reference', 'bar', 'Baz' ), 1, 'Second queued item returns index 1' );
	assert.deepEqual( internalList.getItemHtmlQueue(), ['Bar', 'Baz'], 'getItemHtmlQueue returns stored HTML items' );
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

	internalList.queueItemHtml( 'reference', 'foo', 'Bar' );
	internalList.queueItemHtml( 'reference', 'bar', 'Baz' );
	assert.deepEqual( internalList.convertToData( ve.dm.converter ), expectedData, 'Data matches' );
	assert.deepEqual( internalList.getItemHtmlQueue(), [], 'Items html is emptied after conversion' );
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

QUnit.test( 'addNode/removeNode', 4, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList(),
		expectedNodes = {
			'ref': {
				'keyNodes': {
					'ref-1': [ doc.documentNode.children[0], doc.documentNode.children[2] ],
					'ref-2': [ doc.documentNode.children[1] ],
					'ref-3': [ doc.documentNode.children[3] ]
				},
				'keyOrder': [ 'ref-1', 'ref-2', 'ref-3' ]
			}
		};

	internalList.addNode( 'ref', 'ref-1', doc.documentNode.children[0] );
	internalList.addNode( 'ref', 'ref-2', doc.documentNode.children[1] );
	internalList.addNode( 'ref', 'ref-1', doc.documentNode.children[2] );
	internalList.addNode( 'ref', 'ref-3', doc.documentNode.children[3] );

	assert.deepEqualWithNodeTree(
		internalList.nodes,
		expectedNodes,
		'Nodes added in order'
	);

	doc = ve.dm.example.createExampleDocument();
	internalList = doc.getInternalList();

	internalList.addNode( 'ref', 'ref-3', doc.documentNode.children[3] );
	internalList.addNode( 'ref', 'ref-1', doc.documentNode.children[2] );
	internalList.addNode( 'ref', 'ref-2', doc.documentNode.children[1] );
	internalList.addNode( 'ref', 'ref-1', doc.documentNode.children[0] );

	assert.deepEqualWithNodeTree(
		internalList.nodes,
		expectedNodes,
		'Nodes added in reverse order'
	);

	internalList.removeNode( 'ref', 'ref-1', doc.documentNode.children[0] );

	assert.deepEqualWithNodeTree(
		internalList.nodes,
		{
			'ref': {
				'keyNodes': {
					'ref-2': [ doc.documentNode.children[1] ],
					'ref-1': [ doc.documentNode.children[2] ],
					'ref-3': [ doc.documentNode.children[3] ]
				},
				'keyOrder': [ 'ref-2', 'ref-1', 'ref-3' ]
			}
		},
		'Keys re-ordered after one item of key removed'
	);

	internalList.removeNode( 'ref', 'ref-3', doc.documentNode.children[3] );
	internalList.removeNode( 'ref', 'ref-1', doc.documentNode.children[2] );
	internalList.removeNode( 'ref', 'ref-2', doc.documentNode.children[1] );

	assert.deepEqualWithNodeTree(
		internalList.nodes,
		{
			'ref': {
				'keyNodes': {},
				'keyOrder': []
			}
		},
		'All nodes removed'
	);
} );
