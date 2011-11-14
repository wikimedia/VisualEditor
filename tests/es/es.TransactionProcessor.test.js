module( 'es' );

test( 'es.TransactionProcessor', 18, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( esTest.obj );

	// FIXME: These tests shouldn't use prepareFoo() because those functions
	// normalize the transactions they create and are tested separately.
	// We should be creating transactions directly and feeding those into
	// commit()/rollback() --Roan
	var elementAttributeChange = documentModel.prepareElementAttributeChange(
		0, 'set', 'test', 1
	);

	// Test 1
	es.TransactionProcessor.commit( documentModel, elementAttributeChange );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph', 'attributes': { 'test': 1 } },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'commit applies an element attribute change transaction to the content'
	);

	// Test 2
	es.TransactionProcessor.rollback( documentModel, elementAttributeChange );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of an element attribute change transaction on the content'
	);

	var contentAnnotation = documentModel.prepareContentAnnotation(
		new es.Range( 1, 4 ), 'set', { 'type': 'textStyle/bold' }
	);

	// Test 3
	es.TransactionProcessor.commit( documentModel, contentAnnotation );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			['a', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			[
				'c',
				{ 'type': 'textStyle/italic', 'hash': '#textStyle/italic' },
				{ 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }
			],
			{ 'type': '/paragraph' }
		],
		'commit applies a content annotation transaction to the content'
	);

	// Test 4
	es.TransactionProcessor.rollback( documentModel, contentAnnotation );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of a content annotation transaction on the content'
	);

	var insertion = documentModel.prepareInsertion( 3, ['d'] );

	// Test 5
	es.TransactionProcessor.commit( documentModel, insertion );
	deepEqual(
		documentModel.getData( new es.Range( 0, 6 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			'd',
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'commit applies an insertion transaction to the content'
	);

	// Test 6
	deepEqual(
		documentModel.getChildren()[0].getContent(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			'd',
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
		],
		'commit keeps model tree up to date with insertions'
	);

	// Test 7
	es.TransactionProcessor.rollback( documentModel, insertion );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of an insertion transaction on the content'
	);

	// Test 8
	deepEqual(
		documentModel.getChildren()[0].getContent(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
		],
		'rollback keeps model tree up to date with insertions'
	);

	var removal = documentModel.prepareRemoval( new es.Range( 2, 4 ) );

	// Test 9
	es.TransactionProcessor.commit( documentModel, removal );
	deepEqual(
		documentModel.getData( new es.Range( 0, 3 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			{ 'type': '/paragraph' }
		],
		'commit applies a removal transaction to the content'
	);

	// Test 10
	deepEqual(
		documentModel.getChildren()[0].getContent(),
		['a'],
		'commit keeps model tree up to date with removals'
	);

	// Test 11
	es.TransactionProcessor.rollback( documentModel, removal );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of a removal transaction on the content'
	);

	// Test 12
	deepEqual(
		documentModel.getChildren()[0].getContent(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
		],
		'rollback keeps model tree up to date with removals'
	);
	
	var paragraphBreak = documentModel.prepareInsertion( 2, [ { 'type': '/paragraph' }, { 'type': 'paragraph' } ] );
	
	// Test 13
	es.TransactionProcessor.commit( documentModel, paragraphBreak );
	deepEqual(
		documentModel.getData( new es.Range( 0, 7 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'commit applies an insertion transaction that splits the paragraph'
	);

	// Test 14
	deepEqual(
		documentModel.getChildren()[0].getContent(),
		['a'],
		'commit keeps model tree up to date with paragraph split (paragraph 1)'
	);
	
	// Test 15
	deepEqual(
		documentModel.getChildren()[1].getContent(),
		[
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
		],
		'commit keeps model tree up to date with paragraph split (paragraph 2)'
	);

	// Test 16
	es.TransactionProcessor.rollback( documentModel, paragraphBreak );
	deepEqual(
		documentModel.getData( new es.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of a paragraph split on the content'
	);

	// Test 17
	deepEqual(
		documentModel.getChildren()[0].getContent(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
		],
		'rollback keeps model tree up to date with paragraph split (paragraphs are merged back)'
	);
	
	// Test 18
	deepEqual(
		documentModel.getChildren()[1].getElementType(),
		'table',
		'rollback keeps model tree up to date with paragraph split (table follows the paragraph)'
	);
} );
