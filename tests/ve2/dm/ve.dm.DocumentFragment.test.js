module( 've.dm.DocumentFragment' );

/* Tests */

test( 'constructor', 115, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	// Test count: ( ( 4 tests x 21 branch nodes ) + ( 3 tests x 10 leaf nodes ) ) = 114
	ve.example.nodeTreeEqual( fragment.getDocumentNode(), ve.dm.example.tree );

	raises(
		function() {
			fragment = new ve.dm.DocumentFragment( [
				{ 'type': '/paragraph' },
				{ 'type': 'paragraph' }
			] );
		},
		/^Unbalanced input passed to DocumentFragment$/,
		'unbalanced input causes exception'
	);
} );

test( 'getData', 1, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	deepEqual( fragment.getData(), ve.dm.example.data );
} );

test( 'getOffsetMap', 55, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data ),
		actual = fragment.getOffsetMap(),
		expected = ve.dm.example.getOffsetMap( fragment.getDocumentNode() );
	ok( actual.length === expected.length, 'offset map lengths match' );
	for ( var i = 0; i < actual.length; i++ ) {
		ok( actual[i] === expected[i], 'reference at offset ' + i );
	}
} );

test( 'getNodeFromOffset', 42, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data ),
		root = fragment.getDocumentNode().getRoot(),
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
		[] // 41 - document
	];
	for ( var i = 0; i < expected.length; i++ ) {
		node = root;
		for ( var j = 0; j < expected[i].length; j++ ) {
			node = node.children[expected[i][j]];
		}
		ok( node === fragment.getNodeFromOffset( i ), 'reference at offset ' + i );
	}
} );

test( 'getDataFromNode', 3, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	deepEqual(
		fragment.getDataFromNode( fragment.getDocumentNode().getChildren()[0] ),
		ve.dm.example.data.slice( 1, 4 ),
		'branch with leaf children'
	);
	deepEqual(
		fragment.getDataFromNode( fragment.getDocumentNode().getChildren()[1] ),
		ve.dm.example.data.slice( 6, 34 ),
		'branch with branch children'
	);
	deepEqual(
		fragment.getDataFromNode( fragment.getDocumentNode().getChildren()[2].getChildren()[1] ),
		[],
		'leaf without children'
	);
} );

test( 'getAnnotationsFromOffset', 1, function() {
	var fragment,
		range,
		cases = [
		{
			'msg': ['bold #1', 'bold #2'],
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } }],
				['b', { '{"type:"bold"}': { 'type': 'bold' } }]
			],
			'expected': [
				[{ '{"type:"bold"}': { 'type': 'bold' } }],
				[{ '{"type:"bold"}': { 'type': 'bold' } }]
			]
		},
		{
			'msg': ['bold #3', 'italic #1'],
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } }],
				['b', { '{"type:"italic"}': { 'type': 'italic' } }]
			],
			'expected': [
				[{ '{"type:"bold"}': { 'type': 'bold' } }],
				[{ '{"type:"italic"}': { 'type': 'italic' } }]
			]
		}
	];
	var expectCount = 0;

	for (var c = 0; c < cases.length; c++) {
		expectCount += cases[c].data.length;
	}

	expect ( expectCount );

	for (var i=0; i<cases.length; i++) {
		fragment = new ve.dm.DocumentFragment ( cases[i].data );
		for (var j=0; j<fragment.getData().length;j++) {
			annotations = fragment.getAnnotationsFromOffset( j );
			deepEqual(
				annotations, cases[i].expected[j], cases[i].msg[j]
			);
		}

	}
} );

test( 'getAnnotationsFromRange', 1, function() {
	var fragment,
		range,
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
			'msg': 'all different',
			'data': [
				['a', { '{"type:"bold"}': { 'type': 'bold' } } ],
				['b', { '{"type:"italic"}': { 'type': 'italic' } } ]
			],
			'expected': []
		},
		{
			'msg': 'none',
			'data': ['a', 'b'],
			'expected': []
		}
	];

	expect( cases.length );

	for ( var i=0; i<cases.length; i++ ) {
		fragment = new ve.dm.DocumentFragment ( cases[i].data );
		range = new ve.Range( 0, fragment.getData().length );
		annotations = fragment.getAnnotationsFromRange( range );
		deepEqual(
			annotations, cases[i].expected, cases[i].msg
		);

	}
});


