module( 've.dm.DocumentFragment' );

/* Tests */

test( 'getData', 1, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	deepEqual( fragment.getData(), ve.dm.example.data );
} );


test( 'getOffsetMap', 43, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data ),
		actual = fragment.getOffsetMap(),
		expected = ve.dm.example.getOffsetMap( fragment.getDocumentNode() );
	ok( actual.length === expected.length, 'offset map lengths match' );
	for ( var i = 0; i < actual.length; i++ ) {
		ok( actual[i] === expected[i], 'reference at offset ' + i );
	}
} );

test( 'getDocumentNode', 2, function() {
	var parentDocument = new ve.dm.Document(),
		fragment = new ve.dm.DocumentFragment( ve.dm.example.data, parentDocument );
	notStrictEqual(
		fragment.getDocumentNode(),
		parentDocument.getDocumentNode(),
		'fragment and parent documents are different'
	);
	strictEqual(
		fragment.getDocumentNode().getRoot(),
		parentDocument.getDocumentNode().getRoot(),
		'fragment and parent documents share the same root node'
	);
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
