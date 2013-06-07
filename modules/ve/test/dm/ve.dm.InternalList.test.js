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

QUnit.test( 'queueItemHtml/getItemHtmlQueue', 5, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList();
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'foo', 'Bar' ),
		{ 'index': 0, 'isNew': true },
		'First queued item returns index 0 and is new'
	);
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'foo', 'Baz' ),
		{ 'index': 0, 'isNew': false },
		'Duplicate key returns index 0 and is not new'
	);
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'bar', 'Baz' ),
		{ 'index': 1, 'isNew': true },
		'Second queued item returns index 1 and is new'
	);

	// Queue up empty data
	internalList.queueItemHtml( 'reference', 'baz', '' ),
	assert.deepEqual(
		internalList.queueItemHtml( 'reference', 'baz', 'Quux' ),
		{ 'index': 2, 'isNew': true },
		'Third queued item is new because existing data in queue was empty'
	);

	assert.deepEqual( internalList.getItemHtmlQueue(), ['Bar', 'Baz', 'Quux'], 'getItemHtmlQueue returns stored HTML items' );
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
			{ 'type': '/internalList' }
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

QUnit.test( 'clone', 2, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		doc2 = ve.dm.example.createExampleDocument(),
		internalList = doc.getInternalList(),
		internalListClone = internalList.clone(),
		internalListClone2 = internalList.clone( doc2 );

	assert.equal( internalListClone.getDocument(), internalList.getDocument(), 'Documents match' );
	assert.equal( internalListClone2.getDocument(), doc2, 'Cloning with document parameter' );
} );

QUnit.test( 'addNode/removeNode', 6, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument( 'references' ),
		newInternalList = new ve.dm.InternalList( doc ),
		referenceNodes = [
			doc.documentNode.children[0].children[0],
			doc.documentNode.children[1].children[1],
			doc.documentNode.children[1].children[3],
			doc.documentNode.children[1].children[5],
			doc.documentNode.children[2].children[0],
			doc.documentNode.children[2].children[1]
		],
		expectedNodes = {
			'mwReference/': {
				'keyedNodes': {
					'bar': [ referenceNodes[1], referenceNodes[3] ],
					'quux': [ referenceNodes[2] ]
				},
				'firstNodes': [
					referenceNodes[0],
					referenceNodes[1],
					referenceNodes[2],
					referenceNodes[4],
					referenceNodes[5]
				],
				'indexOrder': [ 0, 1, 2, 3, 4 ]
			}
		};

	newInternalList.addNode( 'mwReference/', null, 0, referenceNodes[0] );
	newInternalList.addNode( 'mwReference/', 'bar', 1, referenceNodes[1] );
	newInternalList.addNode( 'mwReference/', 'quux', 2, referenceNodes[2] );
	newInternalList.addNode( 'mwReference/', 'bar', 1, referenceNodes[3] );
	newInternalList.addNode( 'mwReference/', null, 3, referenceNodes[4] );
	newInternalList.addNode( 'mwReference/', null, 4, referenceNodes[5] );
	newInternalList.onTransact();

	assert.deepEqualWithNodeTree(
		newInternalList.nodes,
		expectedNodes,
		'Nodes added in order'
	);

	newInternalList = new ve.dm.InternalList( doc );

	newInternalList.addNode( 'mwReference/', null, 4, referenceNodes[5] );
	newInternalList.addNode( 'mwReference/', null, 3, referenceNodes[4] );
	newInternalList.addNode( 'mwReference/', 'bar', 1, referenceNodes[3] );
	newInternalList.addNode( 'mwReference/', 'quux', 2, referenceNodes[2] );
	newInternalList.addNode( 'mwReference/', 'bar', 1, referenceNodes[1] );
	newInternalList.addNode( 'mwReference/', null, 0, referenceNodes[0] );
	newInternalList.onTransact();


	assert.deepEqualWithNodeTree(
		newInternalList.nodes,
		expectedNodes,
		'Nodes added in reverse order'
	);

	newInternalList.removeNode( 'mwReference/', 'bar', 1, referenceNodes[1] );
	newInternalList.onTransact();

	assert.deepEqualWithNodeTree(
		newInternalList.nodes,
		{
			'mwReference/': {
				'keyedNodes': {
					'bar': [ referenceNodes[3] ],
					'quux': [ referenceNodes[2] ]
				},
				'firstNodes': [
					referenceNodes[0],
					referenceNodes[3],
					referenceNodes[2],
					referenceNodes[4],
					referenceNodes[5]
				],
				'indexOrder': [ 0, 2, 1, 3, 4 ]
			}
		},
		'Keys re-ordered after one item of key removed'
	);

	newInternalList.removeNode( 'mwReference/', 'bar', 1, referenceNodes[3] );
	newInternalList.onTransact();

	assert.deepEqualWithNodeTree(
		newInternalList.nodes,
		{
			'mwReference/': {
				'keyedNodes': {
					'quux': [ referenceNodes[2] ]
				},
				'firstNodes': [
					referenceNodes[0],
					undefined,
					referenceNodes[2],
					referenceNodes[4],
					referenceNodes[5]
				],
				'indexOrder': [ 0, 2, 3, 4 ]
			}
		},
		'Keys truncated after last item of key removed'
	);

	newInternalList.removeNode( 'mwReference/', null, 0, referenceNodes[0] );
	newInternalList.onTransact();

	assert.deepEqualWithNodeTree(
		newInternalList.nodes,
		{
			'mwReference/': {
				'keyedNodes': {
					'quux': [ referenceNodes[2] ]
				},
				'firstNodes': [
					undefined,
					undefined,
					referenceNodes[2],
					referenceNodes[4],
					referenceNodes[5]
				],
				'indexOrder': [ 2, 3, 4 ]
			}
		},
		'Removing keyless item'
	);

	newInternalList.removeNode( 'mwReference/', null, 4, referenceNodes[5] );
	newInternalList.removeNode( 'mwReference/', null, 3, referenceNodes[4] );
	newInternalList.removeNode( 'mwReference/', 'quux', 2, referenceNodes[2] );
	newInternalList.onTransact();

	assert.deepEqualWithNodeTree(
		newInternalList.nodes,
		{
			'mwReference/': {
				'keyedNodes': {},
				'firstNodes': new Array( 5 ),
				'indexOrder': []
			}
		},
		'All nodes removed'
	);
} );

QUnit.test( 'getItemInsertion', 4, function ( assert ) {
	var insertion, index,
		doc = ve.dm.example.createExampleDocument( 'references' ),
		internalList = doc.getInternalList();

	insertion = internalList.getItemInsertion( 'mwReference/', 'foo', [] );
	index = internalList.getItemNodeCount();
	assert.equal( insertion.index, index, 'Insertion creates a new reference' );
	assert.deepEqual(
		insertion.transaction.getOperations(),
		[
			{ 'type': 'retain', 'length': 91 },
			{
				'type': 'replace',
				'remove': [],
				'insert': [
					{ 'type': 'internalItem' },
					{ 'type': '/internalItem' }
				]
			},
			{ 'type': 'retain', 'length': 1 }
		],
		'New reference operations match' );

	insertion = internalList.getItemInsertion( 'mwReference/', 'foo', [] );
	assert.equal( insertion.index, index, 'Insertion with duplicate key reuses old index' );
	assert.equal( insertion.transaction, null, 'Insertion with duplicate key has null transaction' );
} );