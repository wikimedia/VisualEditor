module( 've/dm' );

test( 've.dm.DocumentNode.getData', 1, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	
	// Test 1
	deepEqual( documentModel.getData(), veTest.data, 'Flattening plain objects results in correct data' );
} );

test( 've.dm.DocumentNode.getChildren', 1, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );

	function equalLengths( a, b ) {
		if ( a.length !== b.length ) {
			return false;
		}
		for ( var i = 0; i < a.length; i++ ) {
			if ( a[i].getContentLength() !== b[i].getContentLength() ) {
				console.log( 'mismatched content lengths', a[i], b[i] );
				return false;
			}
			var aIsBranch = typeof a[i].getChildren === 'function';
			var bIsBranch = typeof b[i].getChildren === 'function';
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
		equalLengths( documentModel.getChildren(), veTest.tree ),
		'Nodes in the model tree contain correct lengths'
	);
} );

test( 've.dm.DocumentNode.getRelativeContentOffset', 7, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	
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
	// Test 4
	equal(
		documentModel.getRelativeContentOffset( 1, -1 ),
		1,
		'getRelativeContentOffset does not allow moving before the content of the first node'
	);
	// Test 5
	equal(
		documentModel.getRelativeContentOffset( 33, 1 ),
		33,
		'getRelativeContentOffset does not allow moving after the content of the last node'
	);
	// Test 6
	equal(
		documentModel.getRelativeContentOffset( 4, 1 ),
		9,
		'getRelativeContentOffset advances forwards between elements'
	);
	// Test 7
	equal(
		documentModel.getRelativeContentOffset( 32, -1 ),
		25,
		'getRelativeContentOffset advances backwards between elements'
	);
} );

test( 've.dm.DocumentNode.getContentData', 6, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj ),
		childNodes = documentModel.getChildren();

	// Test 1
	deepEqual(
		childNodes[0].getContentData( new ve.Range( 1, 3 ) ),
		[
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'getContentData can return an ending portion of the content'
	);

	// Test 2
	deepEqual(
		childNodes[0].getContentData( new ve.Range( 0, 2 ) ),
		['a', ['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }]],
		'getContentData can return a beginning portion of the content'
	);
	
	// Test 3
	deepEqual(
		childNodes[0].getContentData( new ve.Range( 1, 2 ) ),
		[['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }]],
		'getContentData can return a middle portion of the content'
	);
	
	// Test 4
	try {
		childNodes[0].getContentData( new ve.Range( -1, 3 ) );
	} catch ( negativeIndexError ) {
		ok( true, 'getContentData throws exceptions when given a range with start < 0' );
	}
	
	// Test 5
	try {
		childNodes[0].getContentData( new ve.Range( 0, 4 ) );
	} catch ( outOfRangeError ) {
		ok( true, 'getContentData throws exceptions when given a range with end > length' );
	}
	
	// Test 6
	deepEqual( childNodes[2].getContentData(), ['h'], 'Content can be extracted from nodes' );
} );

test( 've.dm.DocumentNode.getIndexOfAnnotation', 3, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	
	var bold = { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' },
		italic = { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' },
		nothing = { 'type': 'nothing', 'hash': '{"type":"nothing"}' },
		character = ['a', bold, italic];
	
	// Test 1
	equal(
		ve.dm.DocumentNode.getIndexOfAnnotation( character, bold ),
		1,
		'getIndexOfAnnotation get the correct index'
	);
	
	// Test 2
	equal(
		ve.dm.DocumentNode.getIndexOfAnnotation( character, italic ),
		2,
		'getIndexOfAnnotation get the correct index'
	);
	
	// Test 3
	equal(
		ve.dm.DocumentNode.getIndexOfAnnotation( character, nothing ),
		-1,
		'getIndexOfAnnotation returns -1 if the annotation was not found'
	);
} );

test( 've.dm.DocumentNode.getWordBoundaries', 2, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	deepEqual(
		documentModel.getWordBoundaries( 2 ),
		new ve.Range( 1, 4 ),
		'getWordBoundaries returns range around nearest whole word'
	);
	strictEqual(
		documentModel.getWordBoundaries( 5 ),
		null,
		'getWordBoundaries returns null when given non-content offset'
	);
} );

test( 've.dm.DocumentNode.getAnnotationBoundaries', 2, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	deepEqual(
		documentModel.getAnnotationBoundaries( 2, { 'type': 'textStyle/bold' } ),
		new ve.Range( 2, 3 ),
		'getWordBoundaries returns range around content covered by annotation'
	);
	strictEqual(
		documentModel.getAnnotationBoundaries( 1, { 'type': 'textStyle/bold' } ),
		null,
		'getWordBoundaries returns null if offset is not covered by annotation'
	);
} );

test( 've.dm.DocumentNode.getAnnotationsFromOffset', 4, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	deepEqual(
		documentModel.getAnnotationsFromOffset( 1 ),
		[],
		'getAnnotationsFromOffset returns empty array for non-annotated content'
	);
	deepEqual(
		documentModel.getAnnotationsFromOffset( 2 ),
		[{ 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
		'getAnnotationsFromOffset returns annotations of annotated content correctly'
	);
	deepEqual(
		documentModel.getAnnotationsFromOffset( 3 ),
		[{ 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
		'getAnnotationsFromOffset returns annotations of annotated content correctly'
	);
	deepEqual(
		documentModel.getAnnotationsFromOffset( 0 ),
		[],
		'getAnnotationsFromOffset returns empty array when given a non-content offset'
	);
} );

function compareOffsets( documentModel, expectedOffsets, descPrefix, start, end ) {
	start = start || 0;
	end = end || expectedOffsets.length;
	equal( documentModel.offsetMap.length, expectedOffsets.length, descPrefix + ' (offset map has the correct length)' );
	
	// We use a loop instead of equal( documentModel.offsetMap, expectedOffsets ); because
	// the latter will descend into the elements and their children
	for ( var i = start; i < end; i++ ) {
		ok( documentModel.offsetMap[i] == expectedOffsets[i], descPrefix + ' (offset map elements point to the correct nodes (element ' + i + '))' );
	}
}

function repeatArray( element, n ) {
	var a = [];
	for ( var i = 0; i < n; i++ ) {
		a[i] = element;
	}
	return a;
}

test( 've.dm.DocumentNode.offsetMap', function() {
	var documentModel = new ve.dm.DocumentNode( veTest.data );
	var expectedOffsets = veTest.getOffsets( documentModel );
	compareOffsets( documentModel, expectedOffsets, 'Constructor creates offset map correctly' );	
} );

test( 've.dm.DocumentNode.rebuildNodes', function() {
	var documentModel = new ve.dm.DocumentNode( veTest.data.slice( 0 ) );
	var originalLength = veTest.data.length;
	var expectedOffsets = veTest.getOffsets( documentModel );
	
	// Make the first paragraph longer
	documentModel.data.splice( 3, 0, 'F', 'O', 'O' );
	documentModel.rebuildNodes( documentModel, 0, 1, 0, documentModel.data.slice( 0, 8 ) );
	ve.batchedSplice( expectedOffsets, 1, 4, repeatArray( documentModel.children[0], 7 ) );
	equal( documentModel.children[0].getElementType(), 'paragraph', 'rebuildNodes() makes a paragraph longer (first child is a paragraph)' );
	equal( documentModel.children[0].getContentLength(), 6, 'rebuildNodes() rmakes a paragraph longer (content length is updated)' );
	equal( documentModel.children.length, 3, 'rebuildNodes() makes a paragraph longer (document still has 3 children)' );
	equal( documentModel.getContentLength(), originalLength + 3, 'rebuildNodes() makes a paragraph longer (document content length is updated)' );
	compareOffsets( documentModel, expectedOffsets, 'rebuildNodes() makes a paragraph longer', 0, 9 );
	
	// Now make it shorter
	documentModel.data.splice( 2, 4 );
	documentModel.rebuildNodes( documentModel, 0, 1, 0, documentModel.data.slice( 0, 4 ) );
	ve.batchedSplice( expectedOffsets, 1, 7, repeatArray( documentModel.children[0], 3 ) );
	equal( documentModel.children[0].getElementType(), 'paragraph', 'rebuildNodes() makes a paragraph shorter (first child is a paragraph)' );
	equal( documentModel.children[0].getContentLength(), 2, 'rebuildNodes() makes a paragraph shorter (content length is updated)' );
	equal( documentModel.children.length, 3, 'rebuildNodes() makes a paragraph shorter (document still has 3 children)' );
	equal( documentModel.getContentLength(), originalLength - 1, 'rebuildNodes() makes a paragraph shorter (document content length is updated)' );
	compareOffsets( documentModel, expectedOffsets, 'rebuildNodes() makes a paragraph shorter', 0, 5 );
	
	// Split the first paragraph up
	documentModel.data.splice( 2, 0, { 'type': '/paragraph' }, { 'type': 'paragraph' } );
	documentModel.rebuildNodes( documentModel, 0, 1, 0, documentModel.data.slice( 0, 6 ) );
	expectedOffsets.splice( 1, 3, documentModel.children[0], documentModel.children[0], documentModel, documentModel.children[1], documentModel.children[1] );
	equal( documentModel.children[0].getElementType(), 'paragraph', 'rebuildNodes() splits a paragraph (first child is a paragraph)' );
	equal( documentModel.children[1].getElementType(), 'paragraph', 'rebuildNodes() splits a paragraph (second child is a paragraph)' );
	equal( documentModel.children[0].getContentLength(), 1, 'rebuildNodes() splits a paragraph (content length of first paragraph is updated)' );
	equal( documentModel.children[1].getContentLength(), 1, 'rebuildNodes() splits a paragraph (content length of second paragraph is updated)' );
	equal( documentModel.children.length, 4, 'rebuildNodes() splits a paragraph (document now has 4 children)' );
	equal( documentModel.getContentLength(), originalLength + 1, 'rebuildNodes() splits a paragraph (document content length is updated)' );
	compareOffsets( documentModel, expectedOffsets, 'rebuildNodes() splits a paragraph', 0, 7 );
	
	// Join it back together
	documentModel.data.splice( 2, 2 );
	documentModel.rebuildNodes( documentModel, 0, 2, 0, documentModel.data.slice( 0, 4 ) );
	ve.batchedSplice( expectedOffsets, 1, 5, repeatArray( documentModel.children[0], 3 ) );
	equal( documentModel.children[0].getElementType(), 'paragraph', 'rebuildNodes() joins two paragraphs (first child is a paragraph)' );
	equal( documentModel.children[0].getContentLength(), 2, 'rebuildNodes() joins two paragraphs (content length is updated)' );
	equal( documentModel.children.length, 3, 'rebuildNodes() joins two paragraphsr (document still has 3 children)' );
	equal( documentModel.getContentLength(), originalLength - 1, 'rebuildNodes() joins two paragraphs (document content length is updated)' );
	compareOffsets( documentModel, expectedOffsets, 'rebuildNodes() joins two paragraphs', 0, 5 );
	
	// Add a paragraph to the first listItem by rebuilding the listItem
	documentModel.data.splice( 12, 0, { 'type': 'paragraph' }, 'B', 'A', 'R', { 'type': '/paragraph' } );
	var list = documentModel.children[1].children[0].children[0].children[1];
	documentModel.rebuildNodes( list, 0, 1, 11, documentModel.data.slice( 11, 21 ) );
	var newListItem = documentModel.children[1].children[0].children[0].children[1].children[0];
	ve.batchedSplice( expectedOffsets, 11, 5,
		[ list, newListItem ].concat(
		repeatArray( newListItem.children[0], 4 ) ).concat(
		[ newListItem, newListItem.children[1], newListItem.children[1], newListItem ] )
	);
	equal( newListItem.getElementType(), 'listItem', 'rebuildNodes() adds a paragraph to a listItem (listItem is still a listItem)' );
	equal( newListItem.children.length, 2, 'rebuildNodes() adds a paragraph to a listItem (listItem now has 2 children)' );
	equal( newListItem.children[0].getElementType(), 'paragraph', 'rebuildNodes() adds a paragraph to a listItem (first child is a paragraph)' );
	equal( newListItem.children[1].getElementType(), 'paragraph', 'rebuildNodes() adds a paragraph to a listItem (second child is a paragraph)' );
	equal( newListItem.children[0].getContentLength(), 3, 'rebuildNodes() adds a paragraph to a listItem (first paragraph has correct content length)' );
	equal( newListItem.children[1].getContentLength(), 1, 'rebuildNodes() adds a paragraph to a listItem (second paragraph has correct content length)' );
	equal( newListItem.getContentLength(), 8, 'rebuildNodes() adds a paragraph to a listItem (content length of listItem is updated)' );
	equal( documentModel.getContentLength(), originalLength + 4, 'rebuildNodes() adds a paragraph to a listItem (document content length is updated)' );
	compareOffsets( documentModel, expectedOffsets, 'rebuildNodes() adds a paragraph to a listItem', 10, 22 );
	
	// Add another paragraph to the first listItem using a zero rebuild
	documentModel.data.splice( 20, 0, { 'type': 'paragraph' }, 'B', 'A', 'Z', { 'type': '/paragraph' } );
	documentModel.rebuildNodes( newListItem, 2, 0, 20, documentModel.data.slice( 20, 25 ) );
	ve.batchedSplice( expectedOffsets, 20, 0,
		[ newListItem ].concat( repeatArray( newListItem.children[2], 4 ) )
	);
	equal( newListItem.getElementType(), 'listItem', 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (listItem is still a listItem) ');
	equal( newListItem.children.length, 3, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (listItem now has 3 children)' );
	equal( newListItem.children[0].getElementType(), 'paragraph', 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (first child is a paragraph)' );
	equal( newListItem.children[1].getElementType(), 'paragraph', 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (second child is a paragraph)' );
	equal( newListItem.children[2].getElementType(), 'paragraph', 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (third child is a paragraph)' );
	equal( newListItem.children[0].getContentLength(), 3, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (first paragraph has correct content length)' );
	equal( newListItem.children[1].getContentLength(), 1, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (second paragraph has correct content length)' );
	equal( newListItem.children[2].getContentLength(), 3, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (third paragraph has correct content length)' );
	equal( newListItem.getContentLength(), 13, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (content length of listItem is updated)' );
	equal( documentModel.getContentLength(), originalLength + 9, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild (document content length is updated)' );
	compareOffsets( documentModel, expectedOffsets, 'rebuildNodes() adds a paragraph to a listItem with zero rebuild', 10, 28 );
} );

test( 've.dm.DocumentNode.prepareElementAttributeChange', 4, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );

	// Test 1
	deepEqual(
		documentModel.prepareElementAttributeChange( 0, 'test', 1234 ).getOperations(),
		[
			{ 'type': 'attribute', 'key': 'test', 'from': undefined, 'to': 1234  },
			{ 'type': 'retain', 'length': 34 }
		],
		'prepareElementAttributeChange retains data after attribute change for first element'
	);
	
	// Test 2
	deepEqual(
		documentModel.prepareElementAttributeChange( 5, 'test', 1234 ).getOperations(),
		[
			{ 'type': 'retain', 'length': 5 },
			{ 'type': 'attribute', 'key': 'test', 'from': undefined, 'to': 1234 },
			{ 'type': 'retain', 'length': 29 }
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

test( 've.dm.DocumentNode.prepareContentAnnotation', 3, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );

	// Test 1
	deepEqual(
		documentModel.prepareContentAnnotation(
			new ve.Range( 1, 4 ), 'set', { 'type': 'textStyle/bold' }
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 30 }
		],
		'prepareContentAnnotation skips over content that is already set or cleared'
	);

	// Test 2
	deepEqual(
		documentModel.prepareContentAnnotation(
			new ve.Range( 3, 10 ), 'set', { 'type': 'textStyle/bold' }
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 3 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 5 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 24 }
		],
		'prepareContentAnnotation works across element boundaries'
	);
	
	// Test 3
	deepEqual(
		documentModel.prepareContentAnnotation(
			new ve.Range( 4, 11 ), 'set', { 'type': 'textStyle/bold' }
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 9 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'start',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'annotate',
				'method': 'set',
				'bias': 'stop',
				'annotation': { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			},
			{ 'type': 'retain', 'length': 24 }
		],
		'prepareContentAnnotation works when given structural offsets'
	);
} );

test( 've.dm.DocumentNode.prepareRemoval', 11, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );

	// Test 1
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 1, 4 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'remove',
				'data': [
					'a',
					['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
					['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
				]
			},
			{ 'type': 'retain', 'length': 30 }
		],
		'prepareRemoval includes the content being removed'
	);
	
	// Test 2
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 17, 22 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 17 },
			{
				'type': 'remove',
				'data': [
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
					{ 'type': 'paragraph' },
					'f',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' }
				]
			},
			{ 'type': 'retain', 'length': 12 }
		],
		'prepareRemoval removes entire elements'
	);

	// Test 3
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 3, 9 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 3 },
			{
				'type': 'remove',
				'data': [
					['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
				]
			},
			{ 'type': 'retain', 'length': 30 }
		],
		'prepareRemoval works across structural nodes'
	);

	// Test 4
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 3, 24 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 3 },
			{
				'type': 'remove',
				'data': [['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]]
			},
			{ 'type': 'retain', 'length': 4 },
			{
				'type': 'remove',
				'data': [{ 'type': 'paragraph' }, 'd', { 'type': '/paragraph' }]
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'remove',
				'data': [
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
					{ 'type': 'paragraph' },
					'e',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
					{ 'type': 'paragraph' },
					'f',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' }
				]
			},
			{ 'type': 'retain', 'length': 12 }
		],
		'prepareRemoval strips and drops correctly when working across structural nodes'
	);
	
	// Test 5
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 3, 25 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 3 },
			{
				'type': 'remove',
				'data': [['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]]
			},
			{ 'type': 'retain', 'length': 4 },
			{
				'type': 'remove',
				'data': [{ 'type': 'paragraph' }, 'd', { 'type': '/paragraph' }]
			},
			{ 'type': 'retain', 'length': 1 },
			{
				'type': 'remove',
				'data': [
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
					{ 'type': 'paragraph' },
					'e',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
					{ 'type': 'paragraph' },
					'f',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' }
				]
			},
			{ 'type': 'retain', 'length': 2 },
			{
				'type': 'remove',
				'data': [ 'g' ]
			},
			{ 'type': 'retain', 'length': 9 }
		],
		'prepareRemoval strips and drops correctly when working across structural nodes (2)'
	);
	
	// Test 6
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 9, 17 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 9 },
			{
				'type': 'remove',
				'data': [ 'd' ]
			},
			{ 'type': 'retain', 'length': 2 },
			{
				'type': 'remove',
				'data': [
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
					{ 'type': 'paragraph' },
					'e',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' }
				]
			},
			{ 'type': 'retain', 'length': 17 }
		],
		'prepareRemoval will not merge items of unequal types'
	);
	
	// Test 7
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 9, 27 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 9 },
			{
				'type': 'remove',
				'data': [ 'd' ]
			},
			{ 'type': 'retain', 'length': 2 },
			{
				'type': 'remove',
				'data': [
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
					{ 'type': 'paragraph' },
					'e',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
					{ 'type': 'paragraph' },
					'f',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
					{ 'type': 'paragraph' },
					'g',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' }
				]
			},
			{ 'type': 'retain', 'length': 7 }
		],
		'prepareRemoval blanks a paragraph and a list'
	);
	
	// Test 8
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 21, 23 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 21 },
			{
				'type': 'remove',
				'data': [
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } }
				]
			},
			{ 'type': 'retain', 'length': 11 }
		],
		'prepareRemoval merges two list items'
	);
	
	// Test 9
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 20, 24 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 20 },
			{
				'type': 'remove',
				'data': [
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
					{ 'type': 'paragraph' }
				]
			},
			{ 'type': 'retain', 'length': 10 }
		],
		'prepareRemoval merges two list items and the paragraphs inside them'
	);
	
	// Test 10
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 20, 23 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 34 }
		],
		'prepareRemoval returns a null transaction when attempting an unbalanced merge'
	);
	
	// Test 11
	deepEqual(
		documentModel.prepareRemoval( new ve.Range( 15, 24 ) ).getOperations(),
		[
			{ 'type': 'retain', 'length': 15 },
			{
				'type': 'remove',
				'data': [
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
					{ 'type': 'paragraph' },
					'f',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
					{ 'type': 'paragraph' }
				]
			},
			{ 'type': 'retain', 'length': 10 }
		],
		'prepareRemoval merges two list items and the paragraphs inside them'
	);
	
} );

test( 've.dm.DocumentNode.prepareInsertion', 11, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );

	// Test 1
	deepEqual(
		documentModel.prepareInsertion( 1, ['d', 'e', 'f'] ).getOperations(),
		[
			{ 'type': 'retain', 'length': 1 },
			{ 'type': 'insert', 'data': ['d', 'e', 'f'] },
			{ 'type': 'retain', 'length': 33 }
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
			{ 'type': 'retain', 'length': 29 }
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
			{ 'type': 'retain', 'length': 29 }
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
			{ 'type': 'retain', 'length': 29 }
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
			{ 'type': 'retain', 'length': 32 }
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
			{ 'type': 'retain', 'length': 32 }
		],
		'prepareInsertion splits paragraph when inserting a paragraph closing and opening inside it'
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
			{ 'type': 'retain', 'length': 34 }
		],
		'prepareInsertion inserts at the beginning, then retains up to the end'
	);
	
	// Test 8
	deepEqual(
		documentModel.prepareInsertion(
			34, [ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
		).getOperations(),
		[
			{ 'type': 'retain', 'length': 34 },
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
				35,
				[ { 'type': 'paragraph' }, 'f', 'o', 'o', { 'type': '/paragraph' } ]
			);
		},
		/^Offset 35 out of bounds/,
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

test( 've.dm.DocumentNode.prepareWrap', 6, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	
	// Test 1
	deepEqual(
		documentModel.prepareWrap( new ve.Range( 1, 4 ), [ { 'type': 'paragraph' } ], [ { 'type': 'heading', 'level': 2 } ], [], [] ).getOperations(),
		[
			{ 'type': 'replace', 'remove': [ { 'type': 'paragraph' } ], 'replacement': [ { 'type': 'heading', 'level': 2 } ] },
			{ 'type': 'retain', 'length': 3 },
			{ 'type': 'replace', 'remove': [ { 'type': '/paragraph' } ], 'replacement': [ { 'type': '/heading' } ] },
			{ 'type': 'retain', 'length': 29 }
		],
		'prepareWrap changes a paragraph to a heading'
	);
	
	// Test 2
	deepEqual(
		documentModel.prepareWrap( new ve.Range( 12, 27 ), [ { 'type': 'list' } ], [], [ { 'type': 'listItem' } ], [] ).getOperations(),
		[
			{ 'type': 'retain', 'length': 11 },
			{ 'type': 'replace', 'remove': [ { 'type': 'list' } ], 'replacement': [] },
			{ 'type': 'replace', 'remove': [ { 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } } ], 'replacement': [] },
			{ 'type': 'retain', 'length': 3 },
			{ 'type': 'replace', 'remove': [ { 'type': '/listItem' } ], 'replacement': [] },
			{ 'type': 'replace', 'remove': [ { 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } } ], 'replacement': [] },
			{ 'type': 'retain', 'length': 3 },
			{ 'type': 'replace', 'remove': [ { 'type': '/listItem' } ], 'replacement': [] },
			{ 'type': 'replace', 'remove': [ { 'type': 'listItem', 'attributes': { 'styles': ['number'] } } ], 'replacement': [] },
			{ 'type': 'retain', 'length': 3 },
			{ 'type': 'replace', 'remove': [ { 'type': '/listItem' } ], 'replacement': [] },
			{ 'type': 'replace', 'remove': [ { 'type': '/list' } ], 'replacement': [] },
			{ 'type': 'retain', 'length': 6 }
		],
		'prepareWrap unwraps a list'
	);
	
	// Test 3
	deepEqual(
		documentModel.prepareWrap( new ve.Range( 8, 28 ), [ { 'type': 'table' }, { 'type': 'tableRow' }, { 'type': 'tableCell' } ], [ { 'type': 'list' }, { 'type': 'listItem' } ], [], [] ).getOperations(),
		[
			{ 'type': 'retain', 'length': 5 },
			{ 'type': 'replace', 'remove': [ { 'type': 'table' }, { 'type': 'tableRow' }, { 'type': 'tableCell' } ], 'replacement': [ { 'type': 'list' }, { 'type': 'listItem' } ] },
			{ 'type': 'retain', 'length': 20 },
			{ 'type': 'replace', 'remove': [ { 'type': '/tableCell' }, { 'type': '/tableRow' }, { 'type': '/table' } ], 'replacement': [ { 'type': '/listItem' }, { 'type': '/list' } ] },
			{ 'type': 'retain', 'length': 3 }
		],
		'prepareWrap replaces a table with a list'
	);
	
	// Test 4
	raises(
		function() {
			documentModel.prepareWrap( new ve.Range( 12, 27 ), [ { 'type': 'table' } ], [], [], [] );
		},
		/^Element in unwrapOuter does not match: expected table but found list$/,
		'prepareWrap checks integrity of unwrapOuter parameter'
	);
	
	// Test 5
	raises(
		function() {
			documentModel.prepareWrap( new ve.Range( 12, 27 ), [ { 'type': 'list' } ], [], [ { 'type': 'paragraph' } ], [] );
		},
		/^Element in unwrapEach does not match: expected paragraph but found listItem$/,
		'prepareWrap checks integrity of unwrapEach parameter'
	);
	
	// Test 6
	raises(
		function() {
			documentModel.prepareWrap( new ve.Range( 1, 4 ), [ { 'type': 'listItem' }, { 'type': 'paragraph' } ], [], [], [] );
		},
		/^unwrapOuter is longer than the data preceding the range$/,
		'prepareWrap checks that unwrapOuter fits before the range'
	);
} );