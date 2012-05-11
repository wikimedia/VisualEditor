module( 've.dm.Document' );

/* Tests */

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
	ve.example.nodeTreeEqual( documentNode, ve.dm.example.tree );

	// XXX: Create a new document node tree from the old one
	var tree = new ve.dm.DocumentNode( ve.dm.example.tree.getChildren() );
	// Replace table with paragraph
	doc.data.splice( 5, 30, { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } );
	// Remove table from tree model
	tree.splice( 1, 1, new ve.dm.ParagraphNode( [new ve.dm.TextNode( 3 )] ) );
	// Rebuild with changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 5 );
	ve.example.nodeTreeEqual( documentNode, tree );
} );

/*
test( 'getRelativeContentOffset', 1, function() {
	
} );
*/

test( 'selectNodes', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = ve.example.getSelectNodesCases( doc );
	for ( var i = 0; i < cases.length; i++ ) {
		ve.example.nodeSelectionEqual( cases[i].actual, cases[i].expected );
	}
} );
