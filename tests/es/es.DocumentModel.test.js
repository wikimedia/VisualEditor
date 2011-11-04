module( 'es/models' );

/*
 * Sample plain object (WikiDom).
 * 
 * There are two kinds of nodes in WikiDom:
 * 
 *     {Object} ElementNode
 *         type: {String} Symbolic node type name
 *         [attributes]: {Object} List of symbolic attribute name and literal value pairs
 *         [content]: {Object} Content node (not defined if node has children)
 *         [children]: {Object[]} Child nodes (not defined if node has content)
 * 
 *     {Object} ContentNode
 *         text: {String} Plain text data of content
 *         [annotations]: {Object[]} List of annotation objects that can be used to render text
 *             type: {String} Symbolic name of annotation type
 *             start: {Integer} Offset within text to begin annotation
 *             end: {Integer} Offset within text to end annotation
 *             [data]: {Object} Additional information, only used by more complex annotations
 */
var obj = {
	'type': 'document',
	'children': [
		{
			'type': 'paragraph',
			'content': {
				'text': 'abc',
				'annotations': [
					{
						'type': 'textStyle/bold',
						'range': {
							'start': 1,
							'end': 2
						}
					},
					{
						'type': 'textStyle/italic',
						'range': {
							'start': 2,
							'end': 3
						}
					}
				]
			}
		},
		{
			'type': 'table',
			'children': [
				{
					'type': 'tableRow',
					'children': [
						{
							'type': 'tableCell',
							'children': [
								{
									'type': 'paragraph',
									'content': {
										'text': 'd'
									}
								},
								{
									'type': 'list',
									'children': [
										{
											'type': 'listItem',
											'attributes': {
												'styles': ['bullet']
											},
											'content': {
												'text': 'e'
											}
										},
										{
											'type': 'listItem',
											'attributes': {
												'styles': ['bullet', 'bullet']
											},
											'content': {
												'text': 'f'
											}
										},
										{
											'type': 'listItem',
											'attributes': {
												'styles': ['number']
											},
											'content': {
												'text': 'g'
											}
										}
									]
								}
							]
						}
					]
				}
			]
		},
		{
			'type': 'paragraph',
			'content': {
				'text': 'h'
			}
		}
	]
};

/*
 * Sample content data.
 * 
 * There are three types of components in content data:
 * 
 *     {String} Plain text character
 *     
 *     {Array} Annotated character
 *         {String} Character
 *         {String} Hash
 *         {Object}... List of annotation object references
 *     
 *     {Object} Opening or closing structural element
 *         type: {String} Symbolic node type name, if closing element first character will be "/"
 *         node: {Object} Reference to model tree node
 *         [attributes]: {Object} List of symbolic attribute name and literal value pairs
 */
var data = [
	//  0 - Beginning of paragraph
	{ 'type': 'paragraph' },
	//  1 - Plain content
	'a',
	//  2 - Annotated content
	['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
	//  3 - Annotated content
	['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
	//  4 - End of paragraph
	{ 'type': '/paragraph' },
	//  5 - Beginning of table
	{ 'type': 'table' },
	//  6 - Beginning of row
	{ 'type': 'tableRow' },
	//  7 - Beginning of cell
	{ 'type': 'tableCell' },
	//  8 - Beginning of paragraph
	{ 'type': 'paragraph' },
	//  9 - Plain content
	'd',
	// 10 - End of paragraph
	{ 'type': '/paragraph' },
	// 11 - Beginning of list
	{ 'type': 'list' },
	// 12 - Beginning of bullet list item
	{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
	// 13 - Plain content
	'e',
	// 14 - End of item
	{ 'type': '/listItem' },
	// 15 - Beginning of nested bullet list item
	{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
	// 16 - Plain content
	'f',
	// 17 - End of item
	{ 'type': '/listItem' },
	// 18 - Beginning of numbered list item
	{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
	// 19 - Plain content
	'g',
	// 20 - End of item
	{ 'type': '/listItem' },
	// 21 - End of list
	{ 'type': '/list' },
	// 22 - End of cell
	{ 'type': '/tableCell' },
	// 23 - End of row
	{ 'type': '/tableRow' },
	// 24 - End of table
	{ 'type': '/table' },
	// 25 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 26 - Plain content
	'h',
	// 27 - End of paragraph
	{ 'type': '/paragraph' }
];

/**
 * Sample content data index.
 * 
 * This is a node tree that describes each partition within the document's content data. This is
 * what is automatically built by the es.DocumentModel constructor.
 */
var tree = [
	new es.ParagraphModel( data[0], 3 ),
	new es.TableModel( data[5], [
		new es.TableRowModel( data[6], [
			new es.TableCellModel( data[7], [
				new es.ParagraphModel( data[8], 1 ),
				new es.ListModel( data[11], [
					new es.ListItemModel( data[12], 1 ),
					new es.ListItemModel( data[15], 1 ),
					new es.ListItemModel( data[18], 1 )
				] )
			] )
		] )
	] ),
	new es.ParagraphModel( data[25], 1 )
];

test( 'es.DocumentModel.getData', 1, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );
	
	// Test 1
	deepEqual( documentModel.getData(), data, 'Flattening plain objects results in correct data' );
} );

test( 'es.DocumentModel.getChildren', 1, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );

	function equalLengths( a, b ) {
		if ( a.length !== b.length ) {
			return false;
		}
		for ( var i = 0; i < a.length; i++ ) {
			if ( a[i].getContentLength() !== b[i].getContentLength() ) {
				console.log( 'mismatched content lengths', a[i], b[i] );
				return false;
			}
			aIsBranch = typeof a[i].getChildren === 'function';
			bIsBranch = typeof b[i].getChildren === 'function';
			if ( aIsBranch !== bIsBranch ) {
				return false;
			}
			if ( aIsBranch && !equalLengths( a[i].getChildren(), b[i].getChildren() ) ) {
				return false;
			}
		}
		return true;
	}
	
	// Test 1
	ok(
		equalLengths( documentModel.getChildren(), tree ),
		'Nodes in the model tree contain correct lengths'
	);
} );

test( 'es.DocumentModel.getRelativeContentOffset', 7, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );
	
	// Test 1
	equal(
		documentModel.getRelativeContentOffset( 1, 1 ),
		2,
		'getRelativeContentOffset advances forwards through the inside of elements'
	);
	// Test 2
	equal(
		documentModel.getRelativeContentOffset( 2, -1 ),
		1,
		'getRelativeContentOffset advances backwards through the inside of elements'
	);
	// Test 3
	equal(
		documentModel.getRelativeContentOffset( 3, 1 ),
		4,
		'getRelativeContentOffset uses the offset after the last character in an element'
	);
	// Test 3
	equal(
		documentModel.getRelativeContentOffset( 1, -1 ),
		1,
		'getRelativeContentOffset treats the begining a document as a non-content offset'
	);
	// Test 4
	equal(
		documentModel.getRelativeContentOffset( 27, 1 ),
		27,
		'getRelativeContentOffset treats the end a document as a non-content offset'
	);
	// Test 5
	equal(
		documentModel.getRelativeContentOffset( 4, 1 ),
		9,
		'getRelativeContentOffset advances forwards between elements'
	);
	// Test 6
	equal(
		documentModel.getRelativeContentOffset( 26, -1 ),
		20,
		'getRelativeContentOffset advances backwards between elements'
	);
} );

test( 'es.DocumentModel.getContent', 6, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj ),
		childNodes = documentModel.getChildren();

	// Test 1
	deepEqual(
		childNodes[0].getContent( new es.Range( 1, 3 ) ),
		[
			['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
			['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
		],
		'getContent can return an ending portion of the content'
	);

	// Test 2
	deepEqual(
		childNodes[0].getContent( new es.Range( 0, 2 ) ),
		['a', ['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }]],
		'getContent can return a beginning portion of the content'
	);
	
	// Test 3
	deepEqual(
		childNodes[0].getContent( new es.Range( 1, 2 ) ),
		[['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }]],
		'getContent can return a middle portion of the content'
	);
	
	// Test 4
	try {
		childNodes[0].getContent( new es.Range( -1, 3 ) );
	} catch ( negativeIndexError ) {
		ok( true, 'getContent throws exceptions when given a range with start < 0' );
	}
	
	// Test 5
	try {
		childNodes[0].getContent( new es.Range( 0, 4 ) );
	} catch ( outOfRangeError ) {
		ok( true, 'getContent throws exceptions when given a range with end > length' );
	}
	
	// Test 6
	deepEqual( childNodes[2].getContent(), ['h'], 'Content can be extracted from nodes' );
} );

test( 'es.DocumentModel.getIndexOfAnnotation', 3, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );
	
	var bold = { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' },
		italic = { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' },
		nothing = { 'type': 'nothing', 'hash': '#nothing' },
		character = ['a', bold, italic];
	
	// Test 1
	equal(
		es.DocumentModel.getIndexOfAnnotation( character, bold ),
		1,
		'getIndexOfAnnotation get the correct index'
	);
	
	// Test 2
	equal(
		es.DocumentModel.getIndexOfAnnotation( character, italic ),
		2,
		'getIndexOfAnnotation get the correct index'
	);
	
	// Test 3
	equal(
		es.DocumentModel.getIndexOfAnnotation( character, nothing ),
		-1,
		'getIndexOfAnnotation returns -1 if the annotation was not found'
	);
} );

test( 'es.DocumentModel.getWordBoundaries', 2, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );
	deepEqual(
		documentModel.getWordBoundaries( 2 ),
		new es.Range( 1, 4 ),
		'getWordBoundaries returns range around nearest whole word'
	);
	strictEqual(
		documentModel.getWordBoundaries( 5 ),
		null,
		'getWordBoundaries returns null when given non-content offset'
	);
} );

test( 'es.DocumentModel.getAnnotationBoundaries', 2, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );
	deepEqual(
		documentModel.getAnnotationBoundaries( 2, { 'type': 'textStyle/bold' } ),
		new es.Range( 2, 3 ),
		'getWordBoundaries returns range around content covered by annotation'
	);
	strictEqual(
		documentModel.getAnnotationBoundaries( 1, { 'type': 'textStyle/bold' } ),
		null,
		'getWordBoundaries returns null if offset is not covered by annotation'
	);
} );

test( 'es.DocumentModel.getAnnotationsFromOffset', 4, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );
	deepEqual(
		documentModel.getAnnotationsFromOffset( 1 ),
		[],
		'getAnnotationsFromOffset returns empty array for non-annotated content'
	);
	deepEqual(
		documentModel.getAnnotationsFromOffset( 2 ),
		[{ 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
		'getAnnotationsFromOffset returns annotations of annotated content correctly'
	);
	deepEqual(
		documentModel.getAnnotationsFromOffset( 3 ),
		[{ 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }],
		'getAnnotationsFromOffset returns annotations of annotated content correctly'
	);
	deepEqual(
		documentModel.getAnnotationsFromOffset( 0 ),
		[],
		'getAnnotationsFromOffset returns empty array when given a non-content offset'
	);
} );

test( 'es.DocumentModel.prepareElementAttributeChange', 4, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );

	// Test 1
	deepEqual(
		documentModel.prepareElementAttributeChange( 0, 'set', 'test', 1234 ).getOperations(),
		[
			{ 'type': 'attribute', 'method': 'set', 'key': 'test', 'value': 1234  },
			{ 'type': 'retain', 'length': 28 }
		],
		'prepareElementAttributeChange retains data after attribute change for first element'
	);
	
	// Test 2
	deepEqual(
		documentModel.prepareElementAttributeChange( 5, 'set', 'test', 1234 ).getOperations(),
		[
			{ 'type': 'retain', 'length': 5 },
			{ 'type': 'attribute', 'method': 'set', 'key': 'test', 'value': 1234 },
			{ 'type': 'retain', 'length': 23 }
		],
		'prepareElementAttributeChange retains data before and after attribute change'
	);
	
	// Test 3
	try {
		documentModel.prepareElementAttributeChange( 1, 'set', 'test', 1234 );
	} catch ( invalidOffsetError ) {
		ok(
			true,
			'prepareElementAttributeChange throws an exception when offset is not an element'
		);
	}
	
	// Test 4
	try {
		documentModel.prepareElementAttributeChange( 4, 'set', 'test', 1234 );
	} catch ( closingElementError ) {
		ok(
			true,
			'prepareElementAttributeChange throws an exception when offset is a closing element'
		);
	}
} );

test( 'es.DocumentModel.prepareContentAnnotation', 1, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );

	// Test 1
	deepEqual(
		documentModel.prepareContentAnnotation(
			new es.Range( 1, 4 ), 'set', { 'type': 'textStyle/bold' }
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }
			},
			{ 'type': 'retain', 'length': 24 }
		],
		'prepareContentAnnotation skips over content that is already set or cleared'
	);
} );

test( 'es.DocumentModel.prepareRemoval', 1, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );

	// Test 1
	deepEqual(
		documentModel.prepareRemoval( new es.Range( 1, 4 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'remove',
				'data': [
					'a',
					['b', { 'type': 'textStyle/bold', 'hash': '#textStyle/bold' }],
					['c', { 'type': 'textStyle/italic', 'hash': '#textStyle/italic' }]
				]
			},
			{ 'type': 'retain', 'length': 24 }
		],
		'prepareRemoval includes the content being removed'
	);
	
	/*
	// Test 2
	deepEqual(
		documentModel.prepareRemoval( new es.Range( 15, 18 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 15 },
			{
				'type': 'remove',
				'data': [
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
					'b',
					{ 'type': '/listItem' }
				]
			},
			{ 'type': 'retain', 'length': 10 }
		],
		'prepareRemoval removes entire elements'
	);
	
	// Test 3
	deepEqual(
		documentModel.prepareRemoval( new es.Range( 17, 19 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 17 },
			{
				'type': 'remove',
				'data': [
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } }
				]
			},
			{ 'type': 'retain', 'length': 9 }
		],
		'prepareRemoval merges two list items'
	);
	*/
} );

test( 'es.DocumentModel.prepareInsertion', 11, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );

	// Test 1
	deepEqual(
		documentModel.prepareInsertion( 1, ['d', 'e', 'f'] ).getOperations(),
		[
			{ 'type': 'retain', 'length': 1 },
			{ 'type': 'insert', 'data': ['d', 'e', 'f'] },
			{ 'type': 'retain', 'length': 27 }
		],
		'prepareInsertion retains data up to the offset and includes the content being inserted'
	);
	
	// Test 2
	deepEqual(
		documentModel.prepareInsertion(
			5, [{ 'type': 'paragraph' }, 'd', 'e', 'f', { 'type': '/paragraph' }]
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 5 },
			{
				'type': 'insert',
				'data': [{ 'type': 'paragraph' }, 'd', 'e', 'f', { 'type': '/paragraph' }]
			},
			{ 'type': 'retain', 'length': 23 }
		],
		'prepareInsertion inserts a paragraph between two structural elements'
	);
	
	// Test 3
	deepEqual(
		documentModel.prepareInsertion( 5, ['d', 'e', 'f'] ).getOperations(),
		[
			{ 'type': 'retain', 'length': 5 },
			{
				'type': 'insert',
				'data': [{ 'type': 'paragraph' }, 'd', 'e', 'f', { 'type': '/paragraph' }]
			},
			{ 'type': 'retain', 'length': 23 }
		],
		'prepareInsertion wraps unstructured content inserted between elements in a paragraph'
	);
	
	// Test 4
	deepEqual(
		documentModel.prepareInsertion(
			5, [{ 'type': 'paragraph' }, 'd', 'e', 'f']
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 5 },
			{
				'type': 'insert',
				'data': [{ 'type': 'paragraph' }, 'd', 'e', 'f', { 'type': '/paragraph' }]
			},
			{ 'type': 'retain', 'length': 23 }
		],
		'prepareInsertion completes opening elements in inserted content'
	);
	
	// Test 5
	deepEqual(
		documentModel.prepareInsertion(
			2, [ { 'type': 'table' }, { 'type': '/table' } ]
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 2 },
			{
				'type': 'insert',
				'data': [
					{ 'type': '/paragraph' },
					{ 'type': 'table' },
					{ 'type': '/table' },
					{ 'type': 'paragraph' }
				]
			},
			{ 'type': 'retain', 'length': 26 }
		],
		'prepareInsertion splits up paragraph when inserting a table in the middle'
	);
	
	// Test 6
	deepEqual(
		documentModel.prepareInsertion(
			2, [ 'f', 'o', 'o', { 'type': '/paragraph' }, { 'type': 'paragraph' }, 'b', 'a', 'r' ]
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 2 },
			{
				'type': 'insert',
				'data': [
					'f',
					'o',
					'o',
					{ 'type': '/paragraph' },
					{ 'type': 'paragraph' },
					'b',
					'a',
					'r'
				]
			},
			{ 'type': 'retain', 'length': 26 }
		],
		'prepareInsertion splits up paragraph when inserting a paragraph closing and opening into' +
			'a paragraph'
	);
	
	// Test 7
	deepEqual(
		documentModel.prepareInsertion(
			0, [ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
		).getOperations(),
		[
			{
				'type': 'insert',
				'data': [ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
			},
			{ 'type': 'retain', 'length': 28 }
		],
		'prepareInsertion inserts at the beginning, then retains up to the end'
	);
	
	// Test 8
	deepEqual(
		documentModel.prepareInsertion(
			28, [ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 28 },
			{
				'type': 'insert',
				'data': [ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
			}
		],
		'prepareInsertion inserts at the end'
	);
	
	// Test 9
	raises(
		function() {
			documentModel.prepareInsertion(
				-1,
				[ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
			);
		},
		/^Offset -1 out of bounds/,
		'prepareInsertion throws exception for negative offset'
	);
	
	// Test 10
	raises(
		function() {
			documentModel.prepareInsertion(
				29,
				[ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
			);
		},
		/^Offset 29 out of bounds/,
		'prepareInsertion throws exception for offset past the end'
	);
	
	// Test 11
	raises(
		function() {
			documentModel.prepareInsertion(
				5,
				[{ 'type': 'paragraph' }, 'a', { 'type': 'listItem' }, { 'type': '/paragraph' }]
			);
		},
		/^Input is malformed: expected \/listItem but got \/paragraph at index 3$/,
		'prepareInsertion throws exception for malformed input'
	);
} );

test( 'es.DocumentModel.commit, es.DocumentModel.rollback', 10, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( obj );

	var elementAttributeChange = documentModel.prepareElementAttributeChange(
		0, 'set', 'test', 1
	);

	// Test 1
	documentModel.commit( elementAttributeChange );
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
	documentModel.rollback( elementAttributeChange );
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
	documentModel.commit( contentAnnotation );
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
	documentModel.rollback( contentAnnotation );
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
	documentModel.commit( insertion );
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
		'commit keeps model tree up to date'
	);

	// Test 7
	documentModel.rollback( insertion );
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
		'rollback keeps model tree up to date'
	);

	var removal = documentModel.prepareRemoval( new es.Range( 2, 4 ) );

	// Test 9
	documentModel.commit( removal );
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
	documentModel.rollback( removal );
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

} );

test( 'es.DocumentDocumentModelNode child operations', 20, function() {
	// Example data (integers) is used for simplicity of testing
	var node1 = new es.DocumentModelBranchNode( '1' ),
		node2 = new es.DocumentModelBranchNode( '2' ),
		node3 = new es.DocumentModelBranchNode(
			'3',
			null,
			[new es.DocumentModelBranchNode( '3a' )]
		),
		node4 = new es.DocumentModelBranchNode(
			'4',
			null,
			[new es.DocumentModelBranchNode( '4a' ), new es.DocumentModelBranchNode( '4b' )]
		);
	
	// Event triggering is detected using a callback that increments a counter
	var updates = 0;
	node1.on( 'update', function() {
		updates++;
	} );
	var attaches = 0;
	node2.on( 'afterAttach', function() {
		attaches++;
	} );
	node3.on( 'afterAttach', function() {
		attaches++;
	} );
	node4.on( 'afterAttach', function() {
		attaches++;
	} );
	var detaches = 0;
	node2.on( 'afterDetach', function() {
		detaches++;
	} );
	node3.on( 'afterDetach', function() {
		detaches++;
	} );
	node4.on( 'afterDetach', function() {
		detaches++;
	} );
	function strictArrayValueEqual( a, b, msg ) {
		if ( a.length !== b.length ) {
			ok( false, msg );
			return;
		}
		for ( var i = 0; i < a.length; i++ ) {
			if ( a[i] !== b[i] ) {
				ok( false, msg );
				return;
			}
		}
		ok( true, msg );
	}
	
	// Test 1
	node1.push( node2 );
	equal( updates, 1, 'push emits update events' );
	strictArrayValueEqual( node1.getChildren(), [node2], 'push appends a node' );

	// Test 2
	equal( attaches, 1, 'push attaches added node' );
	
	// Test 3, 4
	node1.unshift( node3 );
	equal( updates, 2, 'unshift emits update events' );
	strictArrayValueEqual( node1.getChildren(), [node3, node2], 'unshift prepends a node' );
	
	// Test 5
	equal( attaches, 2, 'unshift attaches added node' );
	
	// Test 6, 7
	node1.splice( 1, 0, node4 );
	equal( updates, 3, 'splice emits update events' );
	strictArrayValueEqual( node1.getChildren(), [node3, node4, node2], 'splice inserts nodes' );
	
	// Test 8
	equal( attaches, 3, 'splice attaches added nodes' );
	
	// Test 9
	node1.reverse();
	equal( updates, 4, 'reverse emits update events' );
	
	// Test 10, 11
	node1.sort( function( a, b ) {
		return a.getChildren().length < b.getChildren().length ? -1 : 1;
	} );
	equal( updates, 5, 'sort emits update events' );
	strictArrayValueEqual(
		node1.getChildren(),
		[node2, node3, node4],
		'sort reorderes nodes correctly'
	);
	
	// Test 12, 13
	node1.pop();
	equal( updates, 6, 'pop emits update events' );
	strictArrayValueEqual(
		node1.getChildren(),
		[node2, node3],
		'pop removes the last child node'
	);

	// Test 14
	equal( detaches, 1, 'pop detaches a node' );
	
	// Test 15, 16
	node1.shift();
	equal( updates, 7, 'es.ModelNode emits update events on shift' );
	strictArrayValueEqual(
		node1.getChildren(),
		[node3],
		'es.ModelNode removes first Node on shift'
	);
	
	// Test 17
	equal( detaches, 2, 'shift detaches a node' );
	
	// Test 18
	strictEqual( node3.getParent(), node1, 'getParent returns the correct reference' );
	
	// Test 19
	try {
		var view = node3.createView();
	} catch ( err ){
		ok( true, 'createView throws an exception when not overridden' );
	}
} );
