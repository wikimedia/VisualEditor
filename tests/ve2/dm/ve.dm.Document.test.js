module( 've.dm.Document' );

/* Tests */

test( 'constructor', 2, function() {
	var doc = new ve.dm.Document( ve.dm.example.data );
	deepEqual(
		ve.example.getNodeTreeSummary( doc.getDocumentNode() ),
		ve.example.getNodeTreeSummary( ve.dm.example.tree ),
		'node tree matches example data'
	);
	raises(
		function() {
			doc = new ve.dm.Document( [
				{ 'type': '/paragraph' },
				{ 'type': 'paragraph' }
			] );
		},
		/^Unbalanced input passed to document$/,
		'unbalanced input causes exception'
	);
} );

test( 'getData', 1, function() {
	var doc = new ve.dm.Document( ve.dm.example.data );
	deepEqual( doc.getData(), ve.dm.example.data );
} );

test( 'getOffsetMap', 61, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		actual = doc.getOffsetMap(),
		expected = ve.dm.example.getOffsetMap( doc.getDocumentNode() );
	ok( actual.length === expected.length, 'offset map lengths match' );
	for ( var i = 0; i < actual.length; i++ ) {
		ok( actual[i] === expected[i], 'reference at offset ' + i );
	}
} );

test( 'getNodeFromOffset', 60, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		root = doc.getDocumentNode().getRoot(),
		node,
		expected = [
		[], // 0 - document
		[0], // 1 - heading
		[0], // 2 - heading
		[0], // 3 - heading
		[0], // 4 - heading
		[], // 5 - document
		[1], // 6 - table
		[1, 0], // 7 - tableRow
		[1, 0, 0], // 8 - tableCell
		[1, 0, 0, 0], // 9 - paragraph
		[1, 0, 0, 0], // 10 - paragraph
		[1, 0, 0], // 11 - tableCell
		[1, 0, 0, 1], // 12 - list
		[1, 0, 0, 1, 0], // 13 - listItem
		[1, 0, 0, 1, 0, 0], // 14 - paragraph
		[1, 0, 0, 1, 0, 0], // 15 - paragraph
		[1, 0, 0, 1, 0], // 16 - listItem
		[1, 0, 0, 1, 0, 1], // 17 - list
		[1, 0, 0, 1, 0, 1, 0], // 18 - listItem
		[1, 0, 0, 1, 0, 1, 0, 0], // 19 - paragraph
		[1, 0, 0, 1, 0, 1, 0, 0], // 20 - paragraph
		[1, 0, 0, 1, 0, 1, 0], // 21 - listItem
		[1, 0, 0, 1, 0, 1], // 22 - list
		[1, 0, 0, 1, 0], // 23 - listItem
		[1, 0, 0, 1], // 24 - list
		[1, 0, 0], // 25 - tableCell
		[1, 0, 0, 2], // 26 - list
		[1, 0, 0, 2, 0], // 27 - listItem
		[1, 0, 0, 2, 0, 0], // 28 - paragraph
		[1, 0, 0, 2, 0, 0], // 29 - paragraph
		[1, 0, 0, 2, 0], // 30 - listItem
		[1, 0, 0, 2], // 31 - list
		[1, 0, 0], // 32 - tableCell
		[1, 0], // 33 - tableRow
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
	for ( var i = 0; i < expected.length; i++ ) {
		node = root;
		for ( var j = 0; j < expected[i].length; j++ ) {
			node = node.children[expected[i][j]];
		}
		ok( node === doc.getNodeFromOffset( i ), 'reference at offset ' + i );
	}
} );

test( 'getDataFromNode', 3, function() {
	var doc = new ve.dm.Document( ve.dm.example.data );
	deepEqual(
		doc.getDataFromNode( doc.getDocumentNode().getChildren()[0] ),
		ve.dm.example.data.slice( 1, 4 ),
		'branch with leaf children'
	);
	deepEqual(
		doc.getDataFromNode( doc.getDocumentNode().getChildren()[1] ),
		ve.dm.example.data.slice( 6, 34 ),
		'branch with branch children'
	);
	deepEqual(
		doc.getDataFromNode( doc.getDocumentNode().getChildren()[2].getChildren()[1] ),
		[],
		'leaf without children'
	);
} );

test( 'getAnnotationsFromOffset', 1, function() {
	var doc,
		range,
		annotations,
		expectCount = 0,
		cases = [
		{
			'msg': ['bold #1', 'bold #2'],
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } }],
				['b', { '{"type:"bold"}': { 'type': 'bold' } }]
			],
			'expected': [
				[{ 'type': 'bold' }],
				[{ 'type': 'bold' }]
			]
		},
		{
			'msg': ['bold #3', 'italic #1'],
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } }],
				['b', { '{"type:"italic"}': { 'type': 'italic' } }]
			],
			'expected': [
				[{ 'type': 'bold' }],
				[{ 'type': 'italic' }]
			]
		},
		{
			'msg': ['bold, italic & underline'],
			'data': [
				['a',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'},
						'{"type":"underline"}': { 'type': 'underline'}
					}]
			],
			'expected': [
				[{ 'type': 'bold' }, { 'type': 'italic' }, { 'type': 'underline' }]
			]
		}

	];

	// Calculate expected assertion count
	for ( var c = 0; c < cases.length; c++ ) {
		expectCount += cases[c].data.length;
	}
	expect ( expectCount );

	// Run tests
	for ( var i = 0; i < cases.length; i++ ) {
		doc = new ve.dm.Document ( cases[i].data );
		for ( var j = 0; j < doc.getData().length; j++ ) {
			annotations = doc.getAnnotationsFromOffset( j );
			deepEqual( annotations, cases[i].expected[j], cases[i].msg[j] );
		}
	}
} );

test( 'getAnnotationsFromRange', 1, function() {
	var doc,
		range,
		annotations,
		cases = [
		{
			'msg': 'all bold',
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } } ],
				['b', { '{"type:"bold"}': { 'type': 'bold' } } ]
			],
			'expected': [ { 'type': 'bold' } ]
		},
		{
			'msg': 'bold and italic',
			'data': [
				['a',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'}
					}
				],
				['b',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'}
					}
				]
			],
			'expected': [ { 'type': 'bold' }, { 'type': 'italic' } ]
		},
		{
			'msg': 'bold and italic',
			'data': [
				['a',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'}
					}
				],
				['b',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'},
						'{"type":"underline"}': { 'type': 'underline'}
					}
				]
			],
			'expected': [ { 'type': 'bold' }, { 'type': 'italic' } ]
		},
		{
			'msg': 'none common, non annotated character at end',
			'data': [
				['a',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'}
					}
				],
				['b',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'},
						'{"type":"underline"}': { 'type': 'underline'}
					}
				],
				['c']
			],
			'expected': []
		},
		{
			'msg': 'none common, reverse of previous',
			'data': [
				['a'],
				['b',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'},
						'{"type":"underline"}': { 'type': 'underline'}
					}
				],
				['c',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic'}
					}
				]
			],
			'expected': []
		},
		{
			'msg': 'all different',
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } } ],
				['b', { '{"type:"italic"}': { 'type': 'italic' } } ]
			],
			'expected': []
		},
		{
			'msg': 'no annotations',
			'data': ['a', 'b'],
			'expected': []
		}
	];

	expect( cases.length );

	for ( var i = 0; i < cases.length; i++ ) {
		doc = new ve.dm.Document ( cases[i].data );
		range = new ve.Range( 0, doc.getData().length );
		annotations = doc.getAnnotationsFromRange( range );
		deepEqual(
			annotations, cases[i].expected, cases[i].msg
		);

	}
});


test( 'offsetContainsAnnotation', 1, function(){
	var doc,
		cases = [
		{
			msg: 'contains no annotations',
			data: [
				['a']
			],
			lookFor: {'type': 'bold'},
			expected: false
		},
		{
			msg: 'contains bold',
			data: [
				['a', { '{"type:"bold"}': { 'type': 'bold' } } ]
			],
			lookFor: {'type': 'bold'},
			expected: true
		},
		{
			msg: 'contains bold',
			data: [
				['a', {
					'{"type:"bold"}': { 'type': 'bold' },
					'{"type":"italic"}': { 'type': 'italic'}
					}
				]
			],
			lookFor: {'type': 'bold'},
			expected: true
		}
	];

	expect( cases.length );

	for ( var i = 0;i < cases.length; i++ ) {
		doc = new ve.dm.Document( cases[i].data );
		deepEqual(
			doc.offsetContainsAnnotation( 0, cases[i].lookFor ),
			cases[i].expected,
			cases[i].msg
		);
	}
});

test( 'getAnnotatedRangeFromOffset', 1,  function(){
	var doc,
		cases = [
		{
			'msg': 'a bold word',
			'data': [
				// 0
				['a'],
				// 1
				['b', { '{"type:"bold"}': { 'type': 'bold' } }],
				// 2
				['o', { '{"type:"bold"}': { 'type': 'bold' } }],
				// 3
				['l', { '{"type:"bold"}': { 'type': 'bold' } }],
				// 4
				['d', { '{"type:"bold"}': { 'type': 'bold' } }],
				// 5
				['w'],
				// 6
				['o'],
				// 7
				['r'],
				// 8
				['d']
			],
			'annotation': { 'type': 'bold' },
			'offset': 3,
			'expected': new ve.Range( 1, 5 )
		},
		{
			'msg': 'a linked',
			'data': [
				// 0
				['x'],
				// 1
				['x'],
				// 2
				['x'],
				// 3
				['l', { '{"type:"link/internal"}': { 'type': 'link/internal' } } ],
				// 4
				['i', { '{"type:"link/internal"}': { 'type': 'link/internal' } } ],
				// 5
				['n', { '{"type:"link/internal"}': { 'type': 'link/internal' } } ],
				// 6
				['k', { '{"type:"link/internal"}': { 'type': 'link/internal' } } ],
				// 7
				['x'],
				// 8
				['x'],
				// 9
				['x']
			],
			'annotation': { 'type': 'link/internal' },
			'offset': 3,
			'expected': new ve.Range( 3, 7 )
		}
	];

	expect( cases.length );

	for ( var i = 0; i < cases.length; i++ ) {
		doc = new ve.dm.Document( cases[i].data );
		deepEqual(
			doc.getAnnotatedRangeFromOffset(cases[i].offset, cases[i].annotation),
			cases[i].expected,
			cases[i].msg
		);
	}
});

test('getMatchingAnnotations', 1, function(){
	var doc,
		expectCount = 0,
		cases = [
		{
			'msg': 'link part: ',
			'data': [
				// 0
				['l', {
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic' },
						'{"type":"underline"}': { 'type': 'underline' },
						'{"type:"link/internal"}': { 'type': 'link/internal' }
					}
				],
				// 1
				[
					'i',
					{
						'{"type":"underline"}': { 'type': 'underline' },
						'{"type:"link/internal"}': { 'type': 'link/internal' },
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic' }
					}
				],
				// 2
				[
					'n',
					{
						'{"type:"link/internal"}': { 'type': 'link/internal' },
						'{"type":"underline"}': { 'type': 'underline' },
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic' }
					}
				],
				// 3
				[
					'k',
					{
						'{"type":"bold"}': { 'type': 'bold' },
						'{"type":"italic"}': { 'type': 'italic' },
						'{"type:"link/internal"}': { 'type': 'link/internal' },
						'{"type":"underline"}': { 'type': 'underline' }
					}
				]
			],
			'match': /link\/.*/,
			'expected': [
				{ '{"type:"link/internal"}': { 'type': 'link/internal' } },
				{ '{"type:"link/internal"}': { 'type': 'link/internal' } },
				{ '{"type:"link/internal"}': { 'type': 'link/internal' } },
				{ '{"type:"link/internal"}': { 'type': 'link/internal' } }
			]
		},
		{
			'msg': 'bold test: ',
			'data': [
				// 0
				['b', { '{"type":"bold"}': { 'type': 'bold' } }],
				// 1
				['o', { '{"type":"bold"}': { 'type': 'bold' } }],
				// 2
				['l', { '{"type":"bold"}': { 'type': 'bold' } }],
				// 3
				['d', { '{"type":"italic"}': { 'type': 'italic'} }]
			],
			'match': /bold/,
			'expected': [
				{ '{"type":"bold"}': { 'type': 'bold' } },
				{ '{"type":"bold"}': { 'type': 'bold' } },
				{ '{"type":"bold"}': { 'type': 'bold' } },
				{}
			]
		}
	];

	// Calculate expected assertion count
	for ( var c = 0; c < cases.length; c++ ) {
		expectCount += cases[c].data.length;
	}
	expect( expectCount );

	for ( var i = 0;i < cases.length; i++ ) {
		doc = new ve.dm.Document( cases[i].data );
		for ( var d = 0; cases[i].data[d]; d++ ) {
			deepEqual(
				doc.getMatchingAnnotations( cases[i].data[d], cases[i].match ),
				cases[i].expected[d],
				cases[i].msg + d
			);
		}
	}
} );

test( 'getOuterLength', 1, function() {
	var doc = new ve.dm.Document( ve.dm.example.data );
	strictEqual(
		doc.getDocumentNode().getOuterLength(),
		ve.dm.example.data.length,
		'document does not have elements around it'
	);
} );

test( 'isContentOffset', function() {
	var data = [
			{ 'type': 'heading' },
			'a',
			{ 'type': 'image' },
			{ 'type': '/image' },
			'b',
			'c',
			{ 'type': '/heading' },
			{ 'type': 'paragraph' },
			{ 'type': '/paragraph' },
			{ 'type': 'preformatted' },
			{ 'type': 'image' },
			{ 'type': '/image' },
			{ 'type': '/preformatted' },
			{ 'type': 'list' },
			{ 'type': 'listItem' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		],
		cases = [
			{ 'msg': 'left of document', 'expected': false },
			{ 'msg': 'begining of content branch', 'expected': true },
			{ 'msg': 'left of non-text leaf', 'expected': true },
			{ 'msg': 'inside non-text leaf', 'expected': false },
			{ 'msg': 'right of non-text leaf', 'expected': true },
			{ 'msg': 'between characters', 'expected': true },
			{ 'msg': 'end of content branch', 'expected': true },
			{ 'msg': 'between content branches', 'expected': false },
			{ 'msg': 'inside emtpy content branch', 'expected': true },
			{ 'msg': 'between content branches', 'expected': false },
			{ 'msg': 'begining of content branch and left of a leaf', 'expected': true },
			{ 'msg': 'inside content branch with only one non-text leaf', 'expected': false },
			{ 'msg': 'end of content branch and right of a leaf', 'expected': true },
			{ 'msg': 'between content and non-content branches', 'expected': false },
			{ 'msg': 'between parent and child branches, descending', 'expected': false },
			{ 'msg': 'inside empty non-content branch', 'expected': false },
			{ 'msg': 'between parent and child branches, ascending', 'expected': false },
			{ 'msg': 'right of document', 'expected': false }
		];
	expect( data.length + 1 );
	for ( var i = 0; i < cases.length; i++ ) {
		strictEqual( ve.dm.Document.isContentOffset( data, i ), cases[i].expected, cases[i].msg );
	}
} );

test( 'isStructuralOffset', function() {
	var data = [
		{ 'type': 'heading' },
		'a',
		{ 'type': 'image' },
		{ 'type': '/image' },
		'b',
		'c',
		{ 'type': '/heading' },
		{ 'type': 'paragraph' },
		{ 'type': '/paragraph' },
		{ 'type': 'preformatted' },
		{ 'type': 'image' },
		{ 'type': '/image' },
		{ 'type': '/preformatted' },
		{ 'type': 'list' },
		{ 'type': 'listItem' },
		{ 'type': '/listItem' },
		{ 'type': '/list' }
	],
	cases = [
		{ 'msg': 'left of document', 'expected': true },
		{ 'msg': 'begining of content branch', 'expected': false },
		{ 'msg': 'left of non-text leaf', 'expected': false },
		{ 'msg': 'inside non-text leaf', 'expected': false },
		{ 'msg': 'right of non-text leaf', 'expected': false },
		{ 'msg': 'between characters', 'expected': false },
		{ 'msg': 'end of content branch', 'expected': false },
		{ 'msg': 'between content branches', 'expected': true },
		{ 'msg': 'inside emtpy content branch', 'expected': false },
		{ 'msg': 'between content branches', 'expected': true },
		{ 'msg': 'begining of content branch and left of a leaf', 'expected': false },
		{ 'msg': 'inside content branch with only one non-text leaf', 'expected': false },
		{ 'msg': 'end of content branch and right of a leaf', 'expected': false },
		{ 'msg': 'between content and non-content branches', 'expected': true },
		{ 'msg': 'between parent and child branches, descending', 'expected': true },
		{ 'msg': 'inside empty non-content branch', 'expected': true },
		{ 'msg': 'between parent and child branches, ascending', 'expected': true },
		{ 'msg': 'right of document', 'expected': true }
	];
	expect( data.length + 1 );
	for ( var i = 0; i < cases.length; i++ ) {
		strictEqual( ve.dm.Document.isStructuralOffset( data, i ), cases[i].expected, cases[i].msg );
	}
} );

test( 'isElementData', 1, function() {
	var data = [
		{ 'type': 'heading' },
		'a',
		{ 'type': 'image' },
		{ 'type': '/image' },
		'b',
		'c',
		{ 'type': '/heading' },
		{ 'type': 'paragraph' },
		{ 'type': '/paragraph' },
		{ 'type': 'preformatted' },
		{ 'type': 'image' },
		{ 'type': '/image' },
		{ 'type': '/preformatted' },
		{ 'type': 'list' },
		{ 'type': 'listItem' },
		{ 'type': '/listItem' },
		{ 'type': '/list' }
	],
	cases = [
		{ 'msg': 'left of document', 'expected': true },
		{ 'msg': 'begining of content branch', 'expected': false },
		{ 'msg': 'left of non-text leaf', 'expected': true },
		{ 'msg': 'inside non-text leaf', 'expected': true },
		{ 'msg': 'right of non-text leaf', 'expected': false },
		{ 'msg': 'between characters', 'expected': false },
		{ 'msg': 'end of content branch', 'expected': true },
		{ 'msg': 'between content branches', 'expected': true },
		{ 'msg': 'inside emtpy content branch', 'expected': true },
		{ 'msg': 'between content branches', 'expected': true },
		{ 'msg': 'begining of content branch and left of a leaf', 'expected': true },
		{ 'msg': 'inside content branch with only one non-text leaf', 'expected': true },
		{ 'msg': 'end of content branch and right of a leaf', 'expected': true },
		{ 'msg': 'between content and non-content branches', 'expected': true },
		{ 'msg': 'between parent and child branches, descending', 'expected': true },
		{ 'msg': 'inside empty non-content branch', 'expected': true },
		{ 'msg': 'between parent and child branches, ascending', 'expected': true },
		{ 'msg': 'right of document', 'expected': false }
	];
	expect( data.length + 1 );
	for ( var i = 0; i < cases.length; i++ ) {
		strictEqual( ve.dm.Document.isElementData( data, i ), cases[i].expected, cases[i].msg );
	}
} );

test( 'containsElementData', 1, function() {
	var cases = [
		{
			'msg': 'simple paragraph',
			'data': [{ 'type': 'paragraph' }, 'a', { 'type': '/paragraph' }],
			'expected': true
		},
		{
			'msg': 'plain text',
			'data': ['a', 'b', 'c'],
			'expected': false
		},
		{
			'msg': 'annotated text',
			'data': [['a', { '{"type:"bold"}': { 'type': 'bold' } } ]],
			'expected': false
		},
		{
			'msg': 'non-text leaf',
			'data': ['a', { 'type': 'image' }, { 'type': '/image' }, 'c'],
			'expected': true
		}
	];
	expect( cases.length );
	for ( var i = 0; i < cases.length; i++ ) {
		strictEqual(
			ve.dm.Document.containsElementData( cases[i].data ), cases[i].expected, cases[i].msg
		);
	}
} );

test( 'rebuildNodes', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) ),
		documentNode = doc.getDocumentNode();
	// Rebuild without changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 30 );
	deepEqual(
		ve.example.getNodeTreeSummary( documentNode ),
		ve.example.getNodeTreeSummary( ve.dm.example.tree ),
		'rebuild without changes'
	);

	// XXX: Create a new document node tree from the old one
	var tree = new ve.dm.DocumentNode( ve.dm.example.tree.getChildren() );
	// Replace table with paragraph
	doc.data.splice( 5, 30, { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } );
	// Remove table from tree model
	tree.splice( 1, 1, new ve.dm.ParagraphNode( [new ve.dm.TextNode( 3 )] ) );
	// Rebuild with changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 5 );
	deepEqual(
		ve.example.getNodeTreeSummary( documentNode ),
		ve.example.getNodeTreeSummary( tree ),
		'replace table with paragraph'
	);
} );

test( 'getRelativeContentOffset', 1, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = [
		{
			'msg': 'first content offset is farthest left',
			'offset': 2,
			'distance': -2,
			'expected': 1
		},
		{
			'msg': 'last content offset is farthest right',
			'offset': 57,
			'distance': 2,
			'expected': 58
		},
		{
			'msg': '1 right within text',
			'offset': 1,
			'distance': 1,
			'expected': 2
		},
		{
			'msg': '2 right within text',
			'offset': 1,
			'distance': 2,
			'expected': 3
		},
		{
			'msg': '1 left within text',
			'offset': 2,
			'distance': -1,
			'expected': 1
		},
		{
			'msg': '2 left within text',
			'offset': 3,
			'distance': -2,
			'expected': 1
		},
		{
			'msg': '1 right over elements',
			'offset': 4,
			'distance': 1,
			'expected': 9
		},
		{
			'msg': '2 right over elements',
			'offset': 4,
			'distance': 2,
			'expected': 10
		},
		{
			'msg': '1 left over elements',
			'offset': 9,
			'distance': -1,
			'expected': 4
		},
		{
			'msg': '2 left over elements',
			'offset': 9,
			'distance': -2,
			'expected': 3
		}
	];
	expect( cases.length );
	for ( var i = 0; i < cases.length; i++ ) {
		strictEqual(
			doc.getRelativeContentOffset( cases[i].offset, cases[i].distance ),
			cases[i].expected,
			cases[i].msg
		);
	}
} );

test( 'selectNodes', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = ve.example.getSelectNodesCases( doc );
	for ( var i = 0; i < cases.length; i++ ) {
		deepEqual(
			ve.example.getNodeSelectionSummary( cases[i].actual ),
			ve.example.getNodeSelectionSummary( cases[i].expected ),
			cases[i].msg
		);
	}
} );
