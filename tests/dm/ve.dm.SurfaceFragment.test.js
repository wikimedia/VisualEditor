/*!
 * VisualEditor DataModel SurfaceFragment tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.SurfaceFragment' );

/* Tests */

QUnit.test( 'constructor', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc );

	surface.setLinearSelection( new ve.Range( 1 ) );
	let fragment = new ve.dm.SurfaceFragment( surface );

	// Default range and autoSelect
	assert.strictEqual( fragment.getSurface(), surface, 'surface reference is stored' );
	assert.strictEqual( fragment.getDocument(), doc, 'document reference is stored' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 1 ), 'range is taken from surface' );
	assert.strictEqual( fragment.willAutoSelect(), true, 'auto select by default' );
	// AutoSelect
	fragment = new ve.dm.SurfaceFragment( surface, null, 'truthy' );
	assert.strictEqual( fragment.willAutoSelect(), false, 'noAutoSelect values are boolean' );
} );

QUnit.test( 'update', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc );
	let fragment1 = surface.getLinearFragment( new ve.Range( 55, 61 ) ),
		fragment2 = surface.getLinearFragment( new ve.Range( 55, 61 ) );
	const fragment3 = surface.getLinearFragment( new ve.Range( 55, 61 ) );

	fragment1.wrapNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	assert.equalRange(
		fragment2.getSelection().getRange(),
		new ve.Range( 55, 69 ),
		'fragment range changes after wrapNodes'
	);
	surface.undo();
	assert.equalRange(
		fragment3.getSelection().getRange(),
		new ve.Range( 55, 61 ),
		'fragment range restored after undo'
	);

	fragment1 = surface.getLinearFragment( new ve.Range( 1 ) );
	surface.breakpoint();

	fragment1.insertContent( '01' );
	surface.breakpoint();

	fragment1 = fragment1.collapseToEnd();
	fragment1.insertContent( '234' );
	fragment2 = fragment1.clone();

	surface.undo();
	fragment1.insertContent( '5678' );
	assert.equalRange(
		fragment2.getSelection().getRange(),
		new ve.Range( 3, 7 ),
		'Range created during truncated undo point still translates correctly'
	);

} );

QUnit.test( 'getSelectedModels', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc );

	assert.deepEqual(
		surface.getLinearFragment( new ve.Range( 1, 3 ) ).getSelectedModels(),
		[],
		'Empty'
	);
	assert.deepEqual(
		surface.getLinearFragment( new ve.Range( 2, 3 ) ).getSelectedModels(),
		[ doc.data.store.value( ve.dm.example.boldHash ) ],
		'Bold annotation'
	);
	assert.deepEqual(
		surface.getLinearFragment( new ve.Range( 1, 3 ) ).getSelectedModels( true ),
		[
			doc.getDocumentNode().children[ 0 ].children[ 0 ],
			doc.data.store.value( ve.dm.example.boldHash )
		],
		'Bold annotation and text node'
	);
	assert.deepEqual(
		surface.getLinearFragment( new ve.Range( 39, 41 ) ).getSelectedModels(),
		[ doc.getDocumentNode().children[ 2 ].children[ 1 ] ],
		'Inline image node'
	);
} );

QUnit.test( 'getAnnotations', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument( 'annotatedTable' ),
		tableRange = new ve.Range( 0, 52 ),
		surface = new ve.dm.Surface( doc );

	let tableSelection = new ve.dm.TableSelection( tableRange, 0, 0, 1, 0 );

	assert.deepEqual( surface.getFragment( tableSelection ).getAnnotations().getHashes(), [ ve.dm.example.boldHash, ve.dm.example.strongHash ], 'Comparable annotations: [B] ∩ [Strong] = [B,Strong] ' );

	tableSelection = new ve.dm.TableSelection( tableRange, 0, 0, 2, 0 );
	assert.deepEqual( surface.getFragment( tableSelection ).getAnnotations().getHashes(), [], 'Non-comparable annotations: [B] ∩ [Strong] ∩ [I] = [] ' );

	tableSelection = new ve.dm.TableSelection( tableRange, 0, 1, 1, 1 );
	assert.deepEqual( surface.getFragment( tableSelection ).getAnnotations().getHashes(), [ ve.dm.example.boldHash, ve.dm.example.strongHash ], 'Non-comparable in first cell: [B,I] ∩ [Strong] = [B,Strong]' );

	tableSelection = new ve.dm.TableSelection( tableRange, 0, 0, 2, 0 );
	assert.deepEqual( surface.getFragment( tableSelection ).getAnnotations( true ).getHashes(), [ ve.dm.example.boldHash, ve.dm.example.strongHash, ve.dm.example.italicHash ], 'Get all annotations' );
} );

QUnit.test( 'hasAnnotations', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc );

	assert.strictEqual( surface.getLinearFragment( new ve.Range( 1, 2 ) ).hasAnnotations(), false, 'Plain text has none' );
	assert.strictEqual( surface.getLinearFragment( new ve.Range( 2, 3 ) ).hasAnnotations(), true, 'Bold text has some' );
} );

QUnit.test( 'adjustLinearSelection', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		fragment = surface.getLinearFragment( new ve.Range( 20, 21 ) );

	let adjustedFragment = fragment.adjustLinearSelection( -19, 35 );

	assert.notStrictEqual( fragment, adjustedFragment, 'adjustLinearSelection produces a new fragment' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 20, 21 ), 'old fragment is not changed' );
	assert.equalRange( adjustedFragment.getSelection().getRange(), new ve.Range( 1, 56 ), 'new range is used' );

	adjustedFragment = fragment.adjustLinearSelection();
	assert.deepEqual( adjustedFragment, fragment, 'fragment is clone if no parameters supplied' );
} );

QUnit.test( 'truncateLinearSelection', ( assert ) => {
	const range = new ve.Range( 100, 200 ),
		doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		fragment = surface.getLinearFragment( range );

	assert.equalRange( fragment.truncateLinearSelection( 50 ).getSelection().getRange(), new ve.Range( 100, 150 ), 'truncate 50' );
	assert.equalRange( fragment.truncateLinearSelection( 150 ).getSelection().getRange(), range, 'truncate 150 does nothing' );
	assert.equalRange( fragment.truncateLinearSelection( -50 ).getSelection().getRange(), new ve.Range( 150, 200 ), 'truncate -50' );
	assert.equalRange( fragment.truncateLinearSelection( -150 ).getSelection().getRange(), range, 'truncate -150 does nothing' );
} );

QUnit.test( 'collapseToStart/End', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		fragment = surface.getLinearFragment( new ve.Range( 20, 21 ) );

	let collapsedFragment = fragment.collapseToStart();

	assert.notStrictEqual( fragment, collapsedFragment, 'collapseToStart produces a new fragment' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 20, 21 ), 'old fragment is not changed' );
	assert.equalRange( collapsedFragment.getSelection().getRange(), new ve.Range( 20 ), 'new range is used' );

	collapsedFragment = fragment.collapseToEnd();
	assert.notStrictEqual( fragment, collapsedFragment, 'collapseToEnd produces a new fragment' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 20, 21 ), 'old fragment is not changed' );
	assert.equalRange( collapsedFragment.getSelection().getRange(), new ve.Range( 21 ), 'range is at end when collapseToEnd is set' );
} );

QUnit.test( 'expandLinearSelection (annotation)', ( assert ) => {
	const doc = ve.dm.example.createExampleDocumentFromData( [
			{ type: 'paragraph' },
			...'Foo',
			[ 'b', [ ve.dm.example.bold ] ],
			[ 'a', [ ve.dm.example.bold ] ],
			[ 'r', [ ve.dm.example.bold ] ],
			[ 'b', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'a', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'z', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			{ type: '/paragraph' },
			{ type: 'internalList' },
			{ type: '/internalList' }
		] ),
		surface = new ve.dm.Surface( doc ),
		cases = [
			{
				msg: 'expands to bold annotation',
				annotation: ve.dm.example.bold,
				range: new ve.Range( 5, 6 ),
				expected: new ve.Range( 4, 10 )
			},
			{
				msg: 'direction preserved',
				annotation: ve.dm.example.bold,
				range: new ve.Range( 6, 5 ),
				expected: new ve.Range( 10, 4 )
			},
			{
				msg: 'overlaps existing selection',
				annotation: ve.dm.example.bold,
				range: new ve.Range( 2, 7 ),
				expected: new ve.Range( 2, 10 )
			},
			{
				msg: 'no change when annotation not present',
				annotation: ve.dm.example.italic,
				range: new ve.Range( 5, 6 ),
				expected: new ve.Range( 5, 6 )
			},
			{
				msg: 'no change when no annotations present',
				annotation: ve.dm.example.bold,
				range: new ve.Range( 1, 2 ),
				expected: new ve.Range( 1, 2 )
			},
			{
				msg: 'matches nested annotation',
				annotation: ve.dm.example.italic,
				range: new ve.Range( 9, 10 ),
				expected: new ve.Range( 7, 10 )
			}
		];

	cases.forEach( ( caseItem ) => {
		const fragment = surface.getLinearFragment( caseItem.range ).expandLinearSelection(
			'annotation',
			ve.dm.example.createAnnotation( caseItem.annotation )
		);
		assert.equalHash( fragment.getSelection().getRange(), caseItem.expected, caseItem.msg );
	} );
} );

QUnit.test( 'expandLinearSelection (closest)', ( assert ) => {
	const cases = [
		{
			msg: 've.dm.BranchNode selects surrounding paragraph',
			range: new ve.Range( 1 ),
			type: ve.dm.BranchNode,
			expected: new ve.dm.LinearSelection( new ve.Range( 0, 5 ) )
		},
		{
			msg: 've.dm.BranchNode selects surrounding paragraph in empty paragraph',
			doc: 'alienWithEmptyData',
			range: new ve.Range( 1 ),
			type: ve.dm.BranchNode,
			expected: new ve.dm.LinearSelection( new ve.Range( 0, 2 ) )
		},
		{
			msg: 've.dm.BranchNode selects surrounding paragraph when entire paragrpah selected',
			range: new ve.Range( 1, 4 ),
			type: ve.dm.BranchNode,
			expected: new ve.dm.LinearSelection( new ve.Range( 0, 5 ) )
		},
		{
			msg: 'invalid type results in null fragment',
			range: new ve.Range( 20, 21 ),
			type: function () {},
			expected: new ve.dm.NullSelection()
		}
	];

	cases.forEach( ( caseItem ) => {
		const surface = new ve.dm.Surface( ve.dm.example.createExampleDocument( caseItem.doc ) );
		const fragment = surface.getLinearFragment( caseItem.range ).expandLinearSelection( 'closest', caseItem.type );
		assert.equalHash( fragment.getSelection(), caseItem.expected, caseItem.msg );
	} );
} );

QUnit.test( 'expandLinearSelection (word)', ( assert ) => {
	const cases = [
		{
			phrase: 'the quick brown fox',
			range: new ve.Range( 6, 13 ),
			expected: 'quick brown',
			msg: 'range starting and ending in latin words'
		},
		{
			phrase: 'the quick brown fox',
			range: new ve.Range( 18, 12 ),
			expected: 'brown fox',
			msg: 'backwards range starting and ending in latin words'
		},
		{
			phrase: 'the quick brown fox',
			range: new ve.Range( 7 ),
			expected: 'quick',
			msg: 'zero-length range'
		},
		{
			phrase: 'the quick brown fox',
			range: new ve.Range( 4, 9 ),
			expected: 'quick',
			msg: 'simple word selection'
		},
		{
			phrase: 'the quick brown fox',
			range: new ve.Range( 3, 9 ),
			expected: 'the quick',
			msg: 'word and leading space'
		},
		{
			phrase: 'the quick brown fox',
			range: new ve.Range( 4, 10 ),
			expected: 'quick brown',
			msg: 'word and trailing space'
		},
		{
			phrase: '香港曾經以人煙稀少嘅漁農村為主',
			range: new ve.Range( 2, 4 ),
			expected: '曾經',
			msg: 'Chinese characters are not expanded'
		},
		{
			phrase: '香港曾經以人煙稀少嘅漁農村為主',
			range: new ve.Range( 8, 3 ),
			expected: '經以人煙稀',
			msg: 'backwards Chinese range'
		},
		{
			phrase: '香港曾經以人煙稀少嘅漁農村為主',
			range: new ve.Range( 1 ),
			expected: '',
			msg: 'Zero-length range in Chinese characters not expanded'
		}
	];

	cases.forEach( ( caseItem ) => {
		const doc = new ve.dm.Document( caseItem.phrase.split( '' ) );
		const surface = new ve.dm.Surface( doc );
		const fragment = surface.getLinearFragment( caseItem.range );
		const newFragment = fragment.expandLinearSelection( 'word' );
		const range = newFragment.getSelection().getRange();
		const word = caseItem.phrase.slice( range.start, range.end );
		assert.strictEqual( word, caseItem.expected, caseItem.msg + ': text' );
		assert.strictEqual( caseItem.range.isBackwards(), range.isBackwards(), caseItem.msg + ': range direction' );
	} );
} );

QUnit.test( 'removeContent', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		originalDoc = ve.dm.example.createExampleDocument(),
		expectedDoc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		expectedData = ve.copy( expectedDoc.data.slice( 0, 1 ) )
			.concat( ve.copy( expectedDoc.data.slice( 4, 5 ) ) )
			.concat( ve.copy( expectedDoc.data.slice( 55 ) ) );

	let fragment = surface.getLinearFragment( new ve.Range( 1, 56 ) );
	fragment.removeContent();
	assert.deepEqual(
		doc.getData(),
		expectedData,
		'removing content drops fully covered nodes and strips partially covered ones'
	);
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 1, 3 ),
		'removing content results in a fragment covering just remaining structure'
	);
	surface.undo();
	assert.deepEqual(
		doc.getData(),
		originalDoc.getData(),
		'content restored after undo'
	);
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 1, 56 ),
		'range restored after undo'
	);

	fragment = surface.getLinearFragment( new ve.Range( 1, 4 ) );
	fragment.removeContent();
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 2 ) ),
		[
			{ type: 'heading', attributes: { level: 1 } },
			{ type: '/heading' }
		],
		'removing content empties node'
	);
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 1 ),
		'removing content collapses range'
	);
} );

ve.test.utils.runSurfaceFragmentDeleteTest = function ( assert, html, range, directionAfterRemove, expectedData, expectedRange, msg ) {
	let doc;
	if ( html ) {
		doc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( html ) );
	} else {
		doc = ve.dm.example.createExampleDocument();
	}
	const surface = new ve.dm.Surface( doc );
	const fragment = surface.getLinearFragment( range );

	const data = ve.copy( fragment.getDocument().getFullData() );
	expectedData( data );

	fragment.delete( directionAfterRemove );

	assert.deepEqualWithDomElements( fragment.getDocument().getFullData(), data, msg + ': data' );
	assert.equalRange( fragment.getSelection().getRange(), expectedRange, msg + ': range' );
};

QUnit.test( 'delete', ( assert ) => {
	const cases = [
		{
			range: new ve.Range( 1, 4 ),
			directionAfterRemove: -1,
			expectedData: ( data ) => {
				data.splice( 1, 3 );
			},
			expectedRange: new ve.Range( 1 ),
			msg: 'Selection deleted by backspace'
		},
		{
			range: new ve.Range( 1, 4 ),
			directionAfterRemove: 1,
			expectedData: ( data ) => {
				data.splice( 1, 3 );
			},
			expectedRange: new ve.Range( 1 ),
			msg: 'Selection deleted by delete'
		},
		{
			range: new ve.Range( 39, 41 ),
			directionAfterRemove: 1,
			expectedData: ( data ) => {
				data.splice( 39, 2 );
			},
			expectedRange: new ve.Range( 39 ),
			msg: 'Focusable node deleted if selected first'
		},
		{
			range: new ve.Range( 39, 41 ),
			expectedData: ( data ) => {
				data.splice( 39, 2 );
			},
			expectedRange: new ve.Range( 39 ),
			msg: 'Focusable node deleted by cut'
		},
		{
			range: new ve.Range( 0, 63 ),
			directionAfterRemove: -1,
			expectedData: ( data ) => {
				data.splice(
					0,
					61,
					{ type: 'paragraph' },
					{ type: '/paragraph' }
				);
			},
			expectedRange: new ve.Range( 1 ),
			msg: 'Backspace after select all spanning entire document creates empty paragraph'
		},
		{
			html: '<div rel="ve:Alien">Foo</div><p>Bar</p>',
			range: new ve.Range( 0, 6 ),
			directionAfterRemove: -1,
			expectedData: ( data ) => {
				data.splice(
					0,
					7,
					{ type: 'paragraph' },
					{ type: '/paragraph' }
				);
			},
			expectedRange: new ve.Range( 1 ),
			msg: 'Delete all when document starts with a focusable node'
		},
		{
			html: '<div rel="ve:Alien">Foo</div><p>Bar</p><div rel="ve:Alien">Baz</div>',
			range: new ve.Range( 0, 9 ),
			directionAfterRemove: -1,
			expectedData: ( data ) => {
				data.splice(
					0,
					9,
					{ type: 'paragraph' },
					{ type: '/paragraph' }
				);
			},
			expectedRange: new ve.Range( 1 ),
			msg: 'Delete all when document starts and ends with a focusable node'
		},
		{
			html: '<p>foo</p><meta><p>bar</p>',
			range: new ve.Range( 3, 9 ),
			directionAfterRemove: -1,
			expectedData: ( data ) => {
				const meta = data.slice( 5, 7 );
				data.splice( 3, 6 );
				data.splice( 0, 0, ...meta );
			},
			expectedRange: new ve.Range( 5 ),
			msg: 'Partial removal across meta (p -> p)'
		},
		{
			html: '<h2>foo</h2><meta><p>bar</p>',
			range: new ve.Range( 3, 9 ),
			directionAfterRemove: -1,
			expectedData: ( data ) => {
				const meta = data.slice( 5, 7 );
				const ar = data.slice( 9, 11 );
				data.splice( 5, 7 );
				data.splice( 3, 1, ...ar );
				data.splice( 6, 0, ...meta );
			},
			expectedRange: new ve.Range( 3 ),
			msg: 'Partial removal across meta (h2 -> p)'
		}
	];

	cases.forEach( ( caseItem ) => {
		ve.test.utils.runSurfaceFragmentDeleteTest(
			assert, caseItem.html, caseItem.range, caseItem.directionAfterRemove,
			caseItem.expectedData, caseItem.expectedRange, caseItem.msg
		);
	} );
} );

QUnit.test( 'insertContent/insertDocument', ( assert ) => {
	let doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		fragment = surface.getLinearFragment( new ve.Range( 3, 4 ) );

	fragment.insertContent( [ 'a' ], true );
	assert.deepEqual(
		doc.getData( new ve.Range( 3, 4 ) ),
		[ [ 'a', [ ve.dm.example.italicHash ] ] ],
		'inserting content (annotate=true) replaces selection with new annotated content'
	);

	fragment = surface.getLinearFragment( new ve.Range( 3, 4 ) );
	fragment.insertContent( [ 'b' ] );
	assert.deepEqual(
		doc.getData( new ve.Range( 3, 4 ) ),
		[ 'b' ],
		'inserting content (annotate=false) replaces selection with new plain content'
	);

	fragment = surface.getLinearFragment( new ve.Range( 1, 4 ) );
	fragment.insertContent( [ ...'123' ] );
	assert.deepEqual(
		doc.getData( new ve.Range( 1, 4 ) ),
		[ ...'123' ],
		'inserting content replaces selection with new content'
	);
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 1, 4 ),
		'inserting content results in range around content'
	);

	surface.breakpoint();
	fragment = surface.getLinearFragment( new ve.Range( 4 ) );
	fragment.insertContent( '321' );
	assert.deepEqual(
		doc.getData( new ve.Range( 4, 7 ) ),
		[ '3', '2', '1' ],
		'strings get converted into data when inserting content'
	);

	surface.undo();
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 4 ),
		'range restored after undo'
	);

	fragment = surface.getLinearFragment( new ve.Range( 0 ) );
	fragment.insertContent( 'foo\nbar' );
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 10 ) ),
		[
			{ type: 'paragraph' },
			...'foo',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			...'bar',
			{ type: '/paragraph' }
		],
		'newlines converted to paragraphs'
	);

	fragment = surface.getLinearFragment( new ve.Range( 1 ) );
	fragment.insertContent( [ { type: 'table' }, { type: '/table' } ] );
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 2 ) ),
		[ { type: 'table' }, { type: '/table' } ],
		'table insertion at start of heading is moved outside of heading'
	);
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 0, 2 ),
		'range covers inserted content in moved position (left)'
	);

	// Set up document and surface from scratch
	doc = ve.dm.example.createExampleDocument();
	surface = new ve.dm.Surface( doc );

	fragment = surface.getLinearFragment( new ve.Range( 4 ) );
	fragment.insertContent( [ { type: 'list' }, { type: '/list' } ] );
	assert.deepEqual(
		doc.getData( new ve.Range( 5, 7 ) ),
		[ { type: 'list' }, { type: '/list' } ],
		'list insertion at end of heading is moved outside of heading'
	);
	assert.equalRange(
		fragment.getSelection().getRange(),
		new ve.Range( 5, 7 ),
		'range covers inserted content in moved position (right)'
	);

	// Set up document and surface from scratch
	doc = ve.dm.example.createExampleDocument();
	surface = new ve.dm.Surface( doc );

	fragment = surface.getLinearFragment( new ve.Range( 2, 3 ) );
	fragment.insertDocument( new ve.dm.Document( [
		{ type: 'paragraph' }, { type: 'exampleUnboldable' }, { type: '/exampleUnboldable' }, 'x', { type: '/paragraph' },
		{ type: 'internalList' }, { type: '/internalList' }
	] ), new ve.Range( 1, 4 ), true );
	assert.deepEqual(
		doc.getData( new ve.Range( 2, 5 ) ),
		[
			{ type: 'exampleUnboldable' },
			{ type: '/exampleUnboldable' },
			[ 'x', [ ve.dm.example.boldHash ] ]
		],
		'Unboldable node pasted into bold doesn\'t get bolded'
	);
	surface.undo();

	fragment = surface.getLinearFragment( new ve.Range( 3, 4 ) );
	fragment.insertDocument( new ve.dm.Document( [
		{ type: 'paragraph' }, { type: 'alienInline' }, { type: '/alienInline' }, { type: '/paragraph' },
		{ type: 'internalList' }, { type: '/internalList' }
	] ), new ve.Range( 1, 3 ), true );
	assert.deepEqual(
		doc.getData( new ve.Range( 3, 5 ) ),
		[
			{ type: 'alienInline', annotations: [ ve.dm.example.italicHash ] },
			{ type: '/alienInline' }
		],
		'Inline node inserted in annotation gets annotated'
	);

	doc = ve.dm.example.createExampleDocumentFromData( [
		{ type: 'paragraph' },
		[ 'F', [ ve.dm.example.bold ] ],
		[ 'o', [ ve.dm.example.bold ] ],
		[ 'o', [ ve.dm.example.bold ] ],
		{ type: '/paragraph' },
		{ type: 'internalList' },
		{ type: '/internalList' }
	] );
	surface = new ve.dm.Surface( doc );
	fragment = surface.getLinearFragment( new ve.Range( 2 ) );
	fragment.insertContent(
		ve.dm.example.preprocessAnnotations( [
			// Annotated with a differently-hashing bold attribute
			[ 'x', [ { type: 'textStyle/bold', attributes: { nodeName: 'b', irrelevant: true } } ] ]
		], doc.store ).data,
		true
	);
	assert.deepEqual(
		doc.getData( new ve.Range( 2, 3 ) ),
		[
			[ 'x', [ ve.dm.example.boldHash ] ]
		],
		'inserting content (annotate=true) reuses comparable annotations on existing content'
	);

	doc = ve.dm.example.createExampleDocumentFromData( [
		{ type: 'paragraph' },
		[ 'F', [ ve.dm.example.bold ] ],
		[ 'o', [ ve.dm.example.bold ] ],
		[ 'o', [ ve.dm.example.bold ] ],
		{ type: '/paragraph' },
		{ type: 'internalList' },
		{ type: '/internalList' }
	] );
	surface = new ve.dm.Surface( doc );
	fragment = surface.getLinearFragment( new ve.Range( 2 ) );
	fragment.insertDocument( ve.dm.example.createExampleDocumentFromData( [
		{ type: 'paragraph' }, [ 'x', [ { type: 'textStyle/bold', attributes: { nodeName: 'b', irrelevant: true } } ] ], { type: '/paragraph' },
		{ type: 'internalList' }, { type: '/internalList' }
	] ), new ve.Range( 1, 3 ), true );
	assert.deepEqual(
		doc.getData( new ve.Range( 2, 3 ) ),
		[
			[ 'x', [ ve.dm.example.boldHash ] ]
		],
		'inserting document (annotate=true) reuses comparable annotations on existing content'
	);
} );

QUnit.test( 'changeAttributes', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		fragment = surface.getLinearFragment( new ve.Range( 0, 5 ) );
	fragment.changeAttributes( { level: 3 } );
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 1 ) ),
		[ { type: 'heading', attributes: { level: 3 } } ],
		'changing attributes affects covered nodes'
	);
} );

QUnit.test( 'wrapNodes/unwrapNodes', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		originalDoc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc );

	let fragment = surface.getLinearFragment( new ve.Range( 55, 61 ) );
	// Make 2 paragraphs into 2 lists of 1 item each
	fragment.wrapNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	assert.deepEqual(
		doc.getData( new ve.Range( 55, 69 ) ),
		[
			{
				type: 'list',
				attributes: { style: 'bullet' }
			},
			{ type: 'listItem' },
			{ type: 'paragraph' },
			'l',
			{ type: '/paragraph' },
			{ type: '/listItem' },
			{ type: '/list' },
			{
				type: 'list',
				attributes: { style: 'bullet' }
			},
			{ type: 'listItem' },
			{ type: 'paragraph' },
			'm',
			{ type: '/paragraph' },
			{ type: '/listItem' },
			{ type: '/list' }
		],
		'wrapping nodes can add multiple levels of wrapping to multiple elements'
	);
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 55, 69 ), 'new range contains wrapping elements' );

	fragment.unwrapNodes( 0, 2 );
	assert.deepEqual( doc.getData(), originalDoc.getData(), 'unwrapping 2 levels restores document to original state' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 55, 61 ), 'range after unwrapping is same as original range' );

	// Make a 1 paragraph into 1 list with 1 item
	fragment = surface.getLinearFragment( new ve.Range( 9, 12 ) );
	fragment.wrapNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	assert.deepEqual(
		doc.getData( new ve.Range( 9, 16 ) ),
		[
			{
				type: 'list',
				attributes: { style: 'bullet' }
			},
			{ type: 'listItem' },
			{ type: 'paragraph' },
			'd',
			{ type: '/paragraph' },
			{ type: '/listItem' },
			{ type: '/list' }
		],
		'wrapping nodes can add multiple levels of wrapping to a single element'
	);
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 9, 16 ), 'new range contains wrapping elements' );

	fragment.unwrapNodes( 0, 2 );
	assert.deepEqual( doc.getData(), originalDoc.getData(), 'unwrapping 2 levels restores document to original state' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 9, 12 ), 'range after unwrapping is same as original range' );

	fragment = surface.getLinearFragment( new ve.Range( 8, 34 ) );
	fragment.unwrapNodes( 3, 1 );
	assert.deepEqual( fragment.getData(), doc.getData( new ve.Range( 5, 29 ) ), 'unwrapping multiple outer nodes and an inner node' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 5, 29 ), 'new range contains inner elements' );
} );

QUnit.test( 'rewrapNodes', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		expectedDoc = ve.dm.example.createExampleDocument(),
		expectedSurface = new ve.dm.Surface( expectedDoc ),
		expectedFragment = expectedSurface.getLinearFragment( new ve.Range( 43, 55 ) );

	let fragment = surface.getLinearFragment( new ve.Range( 43, 55 ) );
	// Set up wrapped nodes in example document
	fragment.wrapNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	expectedFragment.wrapNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	// Range is now 43, 59

	// Compare a rewrap operation with its equivalent unwrap + wrap
	// This type of test can only exist if the intermediate state is valid
	fragment.rewrapNodes(
		2,
		[ { type: 'definitionList' }, { type: 'definitionListItem', attributes: { style: 'term' } } ]
	);
	expectedFragment.unwrapNodes( 0, 2 );
	expectedFragment.wrapNodes(
		[ { type: 'definitionList' }, { type: 'definitionListItem', attributes: { style: 'term' } } ]
	);

	assert.deepEqual(
		doc.getData(),
		expectedDoc.getData(),
		'rewrapping multiple nodes via a valid intermediate state produces the same document as unwrapping then wrapping'
	);
	assert.equalHash( fragment.getSelection(), expectedFragment.getSelection(), 'new range contains rewrapping elements' );

	// Rewrap paragrphs as headings
	// The intermediate stage (plain text attached to the document) would be invalid
	// if performed as an unwrap and a wrap
	const expectedData = ve.copy( doc.getData() );

	fragment = surface.getLinearFragment( new ve.Range( 59, 65 ) );
	fragment.rewrapNodes( 1, [ { type: 'heading', attributes: { level: 1 } } ] );

	expectedData.splice( 59, 1, { type: 'heading', attributes: { level: 1 } } );
	expectedData.splice( 61, 1, { type: '/heading' } );
	expectedData.splice( 62, 1, { type: 'heading', attributes: { level: 1 } } );
	expectedData.splice( 64, 1, { type: '/heading' } );

	assert.deepEqual( doc.getData(), expectedData, 'rewrapping paragraphs as headings' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 59, 65 ), 'new range contains rewrapping elements' );
} );

QUnit.test( 'wrapAllNodes', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		originalDoc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		expectedData = ve.copy( doc.getData() );

	let fragment = surface.getLinearFragment( new ve.Range( 55, 61 ) );
	// Make 2 paragraphs into 1 lists of 1 item with 2 paragraphs
	fragment.wrapAllNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	assert.deepEqual(
		doc.getData( new ve.Range( 55, 65 ) ),
		[
			{
				type: 'list',
				attributes: { style: 'bullet' }
			},
			{ type: 'listItem' },
			{ type: 'paragraph' },
			'l',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'm',
			{ type: '/paragraph' },
			{ type: '/listItem' },
			{ type: '/list' }
		],
		'wrapping nodes can add multiple levels of wrapping to multiple elements'
	);
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 55, 65 ), 'new range contains wrapping elements' );

	fragment.unwrapNodes( 0, 2 );
	assert.deepEqual( doc.getData(), originalDoc.getData(), 'unwrapping 2 levels restores document to original state' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 55, 61 ), 'range after unwrapping is same as original range' );

	// Make a 1 paragraph into 1 list with 1 item
	fragment = surface.getLinearFragment( new ve.Range( 9, 12 ) );
	fragment.wrapAllNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	assert.deepEqual(
		doc.getData( new ve.Range( 9, 16 ) ),
		[
			{
				type: 'list',
				attributes: { style: 'bullet' }
			},
			{ type: 'listItem' },
			{ type: 'paragraph' },
			'd',
			{ type: '/paragraph' },
			{ type: '/listItem' },
			{ type: '/list' }
		],
		'wrapping nodes can add multiple levels of wrapping to a single element'
	);
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 9, 16 ), 'new range contains wrapping elements' );

	fragment.unwrapNodes( 0, 2 );
	assert.deepEqual( doc.getData(), originalDoc.getData(), 'unwrapping 2 levels restores document to original state' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 9, 12 ), 'range after unwrapping is same as original range' );

	fragment = surface.getLinearFragment( new ve.Range( 5, 37 ) );

	assert.throws( () => {
		fragment.unwrapNodes( 0, 20 );
	}, /cannot unwrap by greater depth/, 'error thrown trying to unwrap more nodes that it is possible to contain' );

	expectedData.splice( 5, 4 );
	expectedData.splice( 29, 4 );
	fragment.unwrapNodes( 0, 4 );
	assert.deepEqual(
		doc.getData(),
		expectedData,
		'unwrapping 4 levels (table, tableSection, tableRow and tableCell)'
	);
} );

QUnit.test( 'rewrapAllNodes', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		originalDoc = ve.dm.example.createExampleDocument(),
		surface = new ve.dm.Surface( doc ),
		expectedDoc = ve.dm.example.createExampleDocument(),
		expectedSurface = new ve.dm.Surface( expectedDoc ),
		expectedFragment = expectedSurface.getLinearFragment( new ve.Range( 5, 37 ) );

	let fragment = surface.getLinearFragment( new ve.Range( 5, 37 ) );
	// Compare a rewrap operation with its equivalent unwrap + wrap
	// This type of test can only exist if the intermediate state is valid
	fragment.rewrapAllNodes(
		4,
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	expectedFragment.unwrapNodes( 0, 4 );
	expectedFragment.wrapAllNodes(
		[ { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } ]
	);
	assert.deepEqual(
		doc.getData(),
		expectedDoc.getData(),
		'rewrapping multiple nodes via a valid intermediate state produces the same document as unwrapping then wrapping'
	);
	assert.equalHash( fragment.getSelection(), expectedFragment.getSelection(), 'new range contains rewrapping elements' );

	// Reverse of first test
	fragment.rewrapAllNodes(
		2,
		[
			{ type: 'table' },
			{ type: 'tableSection', attributes: { style: 'body' } },
			{ type: 'tableRow' },
			{ type: 'tableCell', attributes: { style: 'data' } }
		]
	);

	const expectedData = originalDoc.getData();
	assert.deepEqual(
		doc.getData(),
		expectedData,
		'rewrapping multiple nodes via a valid intermediate state produces the same document as unwrapping then wrapping'
	);
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 5, 37 ), 'new range contains rewrapping elements' );

	// Rewrap a heading as a paragraph
	// The intermediate stage (plain text attached to the document) would be invalid
	// if performed as an unwrap and a wrap
	fragment = surface.getLinearFragment( new ve.Range( 0, 5 ) );
	fragment.rewrapAllNodes( 1, [ { type: 'paragraph' } ] );

	expectedData.splice( 0, 1, { type: 'paragraph' } );
	expectedData.splice( 4, 1, { type: '/paragraph' } );

	assert.deepEqual( doc.getData(), expectedData, 'rewrapping a heading as a paragraph' );
	assert.equalRange( fragment.getSelection().getRange(), new ve.Range( 0, 5 ), 'new range contains rewrapping elements' );
} );

QUnit.test( 'isolateAndUnwrap', ( assert ) => {
	const cases = [
		{
			type: 'heading',
			range: new ve.Range( 12, 20 ),
			expected: ( data ) => {
				data.splice( 11, 0, { type: 'listItem' } );
				data.splice( 12, 1 );
				data.splice( 20, 1, { type: '/listItem' } );
			},
			base: ve.dm.example.baseUri,
			msg: 'isolating paragraph in list item "Item 2" for heading'
		}
	];
	cases.forEach( ( caseItem ) => ve.test.utils.runIsolateTest( assert, caseItem ) );
} );
