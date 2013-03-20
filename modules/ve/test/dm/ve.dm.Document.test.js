/*!
 * VisualEditor DataModel Document tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Document' );

/* Tests */

QUnit.test( 'constructor', 7, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument();
	assert.equalNodeTree( doc.getDocumentNode(), ve.dm.example.tree, 'node tree matches example data' );
	assert.throws(
		function () {
			doc = new ve.dm.Document( [
				{ 'type': '/paragraph' },
				{ 'type': 'paragraph' }
			] );
		},
		Error,
		'unbalanced input causes exception'
	);

	// TODO data provider?
	doc = new ve.dm.Document( [ 'a', 'b', 'c', 'd' ] );
	assert.equalNodeTree(
		doc.getDocumentNode(),
		new ve.dm.DocumentNode( [ new ve.dm.TextNode( 4 ) ] ),
		'plain text input is handled correctly'
	);

	doc = new ve.dm.Document( [ { 'type': 'paragraph' }, { 'type': '/paragraph' } ] );
	assert.equalNodeTree(
		doc.getDocumentNode(),
		new ve.dm.DocumentNode( [ new ve.dm.ParagraphNode( [], { 'type': 'paragraph' } ) ] ),
		'empty paragraph no longer has a text node'
	);

	doc = ve.dm.example.createExampleDocument( 'withMeta' );
	assert.deepEqual( doc.getData(), ve.dm.example.withMetaPlainData,
		'metadata is stripped out of the linear model'
	);
	assert.deepEqual( doc.getMetadata(), ve.dm.example.withMetaMetaData,
		'metadata is put in the meta-linmod'
	);
	assert.equalNodeTree(
		doc.getDocumentNode(),
		new ve.dm.DocumentNode( [ new ve.dm.ParagraphNode(
			[ new ve.dm.TextNode( 9 ) ], ve.dm.example.withMetaPlainData[0] ) ] ),
		'node tree does not contain metadata'
	);
} );

QUnit.test( 'getData', 1, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		expectedData = ve.dm.example.preprocessAnnotations( ve.copyArray( ve.dm.example.data ) );
	assert.deepEqual( doc.getData(), expectedData.getData() );
} );

QUnit.test( 'getFullData', 1, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument( 'withMeta' );
	assert.deepEqual( doc.getFullData(), ve.dm.example.withMeta );
} );

QUnit.test( 'spliceData', 12, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument( 'withMeta' ),
		fullData = ve.copyArray( ve.dm.example.withMeta ),
		plainData = ve.copyArray( ve.dm.example.withMetaPlainData ),
		metaData = ve.copyArray( ve.dm.example.withMetaMetaData ),
		actualResult, expectedResult;

	actualResult = doc.spliceData( 2, 0, [ 'X', 'Y' ] );
	expectedResult = plainData.splice( 2, 0, 'X', 'Y' );
	fullData.splice( 6, 0, 'X', 'Y' );
	metaData.splice( 2, 0, undefined, undefined );
	assert.deepEqual( doc.getData(), plainData, 'adding two elements at offset 2 (plain data)' );
	assert.deepEqual( doc.getMetadata(), metaData, 'adding two elements at offset 2 (metadata)' );
	assert.deepEqual( doc.getFullData(), fullData, 'adding two elements at offset 2 (full data)' );

	actualResult = doc.spliceData( 10, 1 );
	expectedResult = plainData.splice( 10, 1 );
	fullData.splice( 18, 1 );
	metaData.splice( 10, 1 );
	assert.deepEqual( doc.getData(), plainData, 'removing one element at offset 10 (plain data)' );
	assert.deepEqual( doc.getMetadata(), metaData, 'removing one element at offset 10 (metadata)' );
	assert.deepEqual( doc.getFullData(), fullData, 'removing one element at offset 10 (full data)' );

	actualResult = doc.spliceData( 5, 2 );
	expectedResult = plainData.splice( 5, 2 );
	fullData.splice( 9, 1 );
	fullData.splice( 11, 1 );
	metaData.splice( 5, 3, metaData[6] );
	assert.deepEqual( doc.getData(), plainData, 'removing two elements at offset 5 (plain data)' );
	assert.deepEqual( doc.getMetadata(), metaData, 'removing two elements at offset 5 (metadata)' );
	assert.deepEqual( doc.getFullData(), fullData, 'removing two elements at offset 5 (full data)' );

	actualResult = doc.spliceData( 1, 8 );
	expectedResult = plainData.splice( 1, 8 );
	fullData.splice( 5, 4 );
	fullData.splice( 7, 2 );
	fullData.splice( 9, 1 );
	fullData.splice( 11, 1 );
	metaData.splice( 1, 9, metaData[5].concat( metaData[7] ).concat( metaData[8] ) );
	assert.deepEqual( doc.getData(), plainData, 'blanking paragraph, removing 8 elements at offset 1 (plain data)' );
	assert.deepEqual( doc.getMetadata(), metaData, 'blanking paragraph, removing 8 elements at offset 1 (metadata)' );
	assert.deepEqual( doc.getFullData(), fullData, 'blanking paragraph, removing 8 elements at offset 1 (full data)' );
} );

QUnit.test( 'getNodeFromOffset', function ( assert ) {
	var i, j, node,
		doc = ve.dm.example.createExampleDocument(),
		root = doc.getDocumentNode().getRoot(),
		expected = [
		[], // 0 - document
		[0], // 1 - heading
		[0], // 2 - heading
		[0], // 3 - heading
		[0], // 4 - heading
		[], // 5 - document
		[1], // 6 - table
		[1, 0], // 7 - tableSection
		[1, 0, 0], // 7 - tableRow
		[1, 0, 0, 0], // 8 - tableCell
		[1, 0, 0, 0, 0], // 9 - paragraph
		[1, 0, 0, 0, 0], // 10 - paragraph
		[1, 0, 0, 0], // 11 - tableCell
		[1, 0, 0, 0, 1], // 12 - list
		[1, 0, 0, 0, 1, 0], // 13 - listItem
		[1, 0, 0, 0, 1, 0, 0], // 14 - paragraph
		[1, 0, 0, 0, 1, 0, 0], // 15 - paragraph
		[1, 0, 0, 0, 1, 0], // 16 - listItem
		[1, 0, 0, 0, 1, 0, 1], // 17 - list
		[1, 0, 0, 0, 1, 0, 1, 0], // 18 - listItem
		[1, 0, 0, 0, 1, 0, 1, 0, 0], // 19 - paragraph
		[1, 0, 0, 0, 1, 0, 1, 0, 0], // 20 - paragraph
		[1, 0, 0, 0, 1, 0, 1, 0], // 21 - listItem
		[1, 0, 0, 0, 1, 0, 1], // 22 - list
		[1, 0, 0, 0, 1, 0], // 23 - listItem
		[1, 0, 0, 0, 1], // 24 - list
		[1, 0, 0, 0], // 25 - tableCell
		[1, 0, 0, 0, 2], // 26 - list
		[1, 0, 0, 0, 2, 0], // 27 - listItem
		[1, 0, 0, 0, 2, 0, 0], // 28 - paragraph
		[1, 0, 0, 0, 2, 0, 0], // 29 - paragraph
		[1, 0, 0, 0, 2, 0], // 30 - listItem
		[1, 0, 0, 0, 2], // 31 - list
		[1, 0, 0, 0], // 32 - tableCell
		[1, 0, 0], // 33 - tableRow
		[1, 0], // 33 - tableSection
		[1], // 34 - table
		[], // 35- document
		[2], // 36 - preformatted
		[2], // 37 - preformatted
		[2], // 38 - preformatted
		[2], // 39 - preformatted
		[2], // 40 - preformatted
		[], // 41 - document
		[3], // 42 - definitionList
		[3, 0], // 43 - definitionListItem
		[3, 0, 0], // 44 - paragraph
		[3, 0, 0], // 45 - paragraph
		[3, 0], // 46 - definitionListItem
		[3], // 47 - definitionList
		[3, 1], // 48 - definitionListItem
		[3, 1, 0], // 49 - paragraph
		[3, 1, 0], // 50 - paragraph
		[3, 1], // 51 - definitionListItem
		[3], // 52 - definitionList
		[], // 53 - document
		[4], // 54 - paragraph
		[4], // 55 - paragraph
		[], // 56 - document
		[5], // 57 - paragraph
		[5], // 58 - paragraph
		[] // 59 - document
	];
	QUnit.expect( expected.length );
	for ( i = 0; i < expected.length; i++ ) {
		node = root;
		for ( j = 0; j < expected[i].length; j++ ) {
			node = node.children[expected[i][j]];
		}
		assert.ok( node === doc.getNodeFromOffset( i ), 'reference at offset ' + i );
	}
} );

QUnit.test( 'getDataFromNode', 3, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument(),
		expectedData = ve.dm.example.preprocessAnnotations( ve.copyArray( ve.dm.example.data ) );
	assert.deepEqual(
		doc.getDataFromNode( doc.getDocumentNode().getChildren()[0] ),
		expectedData.slice( 1, 4 ),
		'branch with leaf children'
	);
	assert.deepEqual(
		doc.getDataFromNode( doc.getDocumentNode().getChildren()[1] ),
		expectedData.slice( 6, 36 ),
		'branch with branch children'
	);
	assert.deepEqual(
		doc.getDataFromNode( doc.getDocumentNode().getChildren()[2].getChildren()[1] ),
		[],
		'leaf without children'
	);
} );

QUnit.test( 'getOuterLength', 1, function ( assert ) {
	var doc = ve.dm.example.createExampleDocument();
	assert.strictEqual(
		doc.getDocumentNode().getOuterLength(),
		ve.dm.example.data.length,
		'document does not have elements around it'
	);
} );

QUnit.test( 'rebuildNodes', 2, function ( assert ) {
	var tree,
		doc = ve.dm.example.createExampleDocument(),
		documentNode = doc.getDocumentNode();
	// Rebuild table without changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 32 );
	assert.equalNodeTree(
		documentNode,
		ve.dm.example.tree,
		'rebuild without changes'
	);

	// XXX: Create a new document node tree from the old one
	tree = new ve.dm.DocumentNode( ve.dm.example.tree.getChildren() );
	// Replace table with paragraph
	doc.spliceData( 5, 32, [ { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } ] );
	tree.splice( 1, 1, new ve.dm.ParagraphNode(
		[new ve.dm.TextNode( 3 )], doc.data.getData( 5 )
	) );
	// Rebuild with changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 5 );
	assert.equalNodeTree(
		documentNode,
		tree,
		'replace table with paragraph'
	);
} );

QUnit.test( 'selectNodes', 21, function ( assert ) {
	var i,
		doc = ve.dm.example.createExampleDocument(),
		cases = ve.example.getSelectNodesCases( doc );

	for ( i = 0; i < cases.length; i++ ) {
		assert.equalNodeSelection( cases[i].actual, cases[i].expected, cases[i].msg );
	}
} );

QUnit.test( 'getSlice', function ( assert ) {
	var i, data, doc = ve.dm.example.createExampleDocument(),
		cases = [
		{
			'msg': 'empty range',
			'range': new ve.Range( 2, 2 ),
			'expected': []
		},
		{
			'msg': 'range with one character',
			'range': new ve.Range( 2, 3 ),
			'expected': [
				['b', [ ve.dm.example.bold ]]
			]
		},
		{
			'msg': 'range with two characters',
			'range': new ve.Range( 2, 4 ),
			'expected': [
				['b', [ ve.dm.example.bold ]],
				['c', [ ve.dm.example.italic ]]
			]
		},
		{
			'msg': 'range with two characters and a header closing',
			'range': new ve.Range( 2, 5 ),
			'expected': [
				{ 'type': 'heading', 'attributes': { 'level': 1 } },
				['b', [ ve.dm.example.bold ]],
				['c', [ ve.dm.example.italic ]],
				{ 'type': '/heading' }
			]
		},
		{
			'msg': 'range with one character, a header closing and a table opening',
			'range': new ve.Range( 3, 6 ),
			'expected': [
				{ 'type': 'heading', 'attributes': { 'level': 1 } },
				['c', [ ve.dm.example.italic ]],
				{ 'type': '/heading' },
				{ 'type': 'table' },
				{ 'type': '/table' }
			]
		},
		{
			'msg': 'range from a paragraph into a list',
			'range': new ve.Range( 15, 21 ),
			'expected': [
				{ 'type': 'paragraph' },
				'e',
				{ 'type': '/paragraph' },
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'paragraph' },
				'f',
				{ 'type': '/paragraph' },
				{ 'type': '/listItem' },
				{ 'type': '/list' }
			]
		},
		{
			'msg': 'range from a paragraph inside a nested list into the next list',
			'range': new ve.Range( 20, 27 ),
			'expected': [
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'paragraph' },
				'f',
				{ 'type': '/paragraph' },
				{ 'type': '/listItem' },
				{ 'type': '/list' },
				{ 'type': '/listItem' },
				{ 'type': '/list' },
				{ 'type': 'list', 'attributes': { 'style': 'number' } },
				{ 'type': '/list' }
			]
		},
		{
			'msg': 'range from a paragraph inside a nested list out of both lists',
			'range': new ve.Range( 20, 26 ),
			'expected': [
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'paragraph' },
				'f',
				{ 'type': '/paragraph' },
				{ 'type': '/listItem' },
				{ 'type': '/list' },
				{ 'type': '/listItem' },
				{ 'type': '/list' }
			]
		},
		{
			'msg': 'range from a paragraph inside a nested list out of the outer listItem',
			'range': new ve.Range( 20, 25 ),
			'expected': [
				{ 'type': 'listItem' },
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'paragraph' },
				'f',
				{ 'type': '/paragraph' },
				{ 'type': '/listItem' },
				{ 'type': '/list' },
				{ 'type': '/listItem' }
			]
		}
	];
	QUnit.expect( cases.length );
	for ( i = 0; i < cases.length; i++ ) {
		data = ve.dm.example.preprocessAnnotations( cases[i].expected.slice(), doc.getStore() );
		assert.deepEqual(
			doc.getSlice( cases[i].range ).getBalancedData(),
			data.getData(),
			cases[i].msg
		);
	}
} );

QUnit.test( 'protection against double application of transactions', 3, function ( assert ) {
	var tx = new ve.dm.Transaction(),
		testDocument = new ve.dm.Document( ve.dm.example.data );
	tx.pushRetain( 1 );
	tx.pushReplace( [], ['H', 'e', 'l', 'l', 'o' ] );
	assert.throws(
		function () {
			testDocument.rollback( tx );
		},
		Error,
		'exception thrown when trying to rollback an uncommitted transaction'
	);
	testDocument.commit( tx );
	assert.throws(
		function () {
			testDocument.commit( tx );
		},
		Error,
		'exception thrown when trying to commit an already-committed transaction'
	);
	testDocument.rollback( tx );
	assert.throws(
		function () {
			testDocument.rollback( tx );
		},
		Error,
		'exception thrown when trying to roll back a transaction that has already been rolled back'
	);
} );