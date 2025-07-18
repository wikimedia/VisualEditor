/*!
 * VisualEditor DataModel LinearData tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.LinearData' );

/* Tests */

QUnit.test( 'basic usage', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) );

	assert.strictEqual( data.getData(), data.data, 'getData: with no arguments returns data by reference' );
	assert.deepEqual( data.getData(), ve.dm.example.data, 'getData: full array matches source data' );
	assert.strictEqual( data.getData( 10 ), data.data[ 10 ], 'getData: data at offset 10 is same as array[10]' );
	assert.strictEqual( data.getData( -1 ), data.data[ -1 ], 'getData: data at -1 is undefined' );

	data.setData( 1, 'x' );
	assert.strictEqual( data.data[ 1 ], 'x', 'setData: data set at offset 1 changed' );
	assert.strictEqual( data.getLength(), data.data.length, 'getLength: equal to array length' );
	assert.strictEqual( data.getStore(), store, 'getStore: equal to original store by reference' );
} );

QUnit.test( 'slice(Object)/splice(Object)/batchSplice(Object)', ( assert ) => {
	const store = new ve.dm.HashValueStore();

	let data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) ),
		expectedData = ve.copy( ve.dm.example.data );

	assert.deepEqual( data.slice( 7, 22 ), expectedData.slice( 7, 22 ),
		'slice: result matches slice'
	);
	assert.deepEqual( data.getData(), expectedData,
		'slice: arrays match after slice'
	);
	const dataSlice = data.sliceObject( 10, 12 );
	const expectedDataSlice = new ve.dm.LinearData( store,
		expectedData.slice( 10, 12 )
	);
	assert.deepEqual( dataSlice.getData(), expectedDataSlice.getData(),
		'slice: matches data built with Array.slice'
	);
	assert.strictEqual( dataSlice.getStore(), data.getStore(),
		'slice: store equal by reference to original object'
	);

	// Reset data
	data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) );
	expectedData = ve.copy( ve.dm.example.data );

	assert.deepEqual( data.splice( 1, 3, ...'xyz' ), expectedData.splice( 1, 3, ...'xyz' ),
		'splice: result matches splice'
	);
	assert.deepEqual( data.getData(), expectedData,
		'splice: arrays match after splice'
	);
	let dataSplice = data.spliceObject( 7, 3, 'x' );
	let expectedDataSplice = new ve.dm.LinearData( store,
		expectedData.splice( 7, 3, 'x' )
	);
	assert.deepEqual( dataSplice.getData(), expectedDataSplice.getData(),
		'splice: matches data built with Array.splice'
	);
	assert.strictEqual( dataSplice.getStore(), data.getStore(),
		'splice: store equal by reference to original object'
	);

	// Reset data
	data = new ve.dm.LinearData( store, ve.copy( ve.dm.example.data ) );
	expectedData = ve.copy( ve.dm.example.data );

	assert.deepEqual(
		data.batchSplice( 1, 3, [ ...'xyz' ] ),
		ve.batchSplice( expectedData, 1, 3, [ ...'xyz' ] ),
		'batchSplice: result matches ve.batchSplice'
	);
	assert.deepEqual( data.getData(), expectedData, 'batchSplice: array matches after batch splice' );

	dataSplice = data.batchSpliceObject( 7, 3, 'x' );
	expectedDataSplice = new ve.dm.LinearData( store,
		ve.batchSplice( expectedData, 7, 3, 'x' )
	);
	assert.deepEqual( dataSplice.getData(), expectedDataSplice.getData(),
		'batchSplice: matches data built with ve.batchSplice'
	);
	assert.strictEqual( dataSplice.getStore(), data.getStore(),
		'batchSplice: store equal by reference to original object'
	);

} );

QUnit.test( 'static methods: getType, isElementData, isOpenElementData, isCloseElementData', ( assert ) => {
	const openElement = { type: 'paragraph' },
		closeElement = { type: '/paragraph' };

	assert.strictEqual( ve.dm.LinearData.static.getType( openElement ), 'paragraph', 'getType of open element' );
	assert.strictEqual( ve.dm.LinearData.static.getType( closeElement ), 'paragraph', 'getType of close element' );

	assert.true( ve.dm.LinearData.static.isElementData( openElement ), 'openElement isElementData' );
	assert.true( ve.dm.LinearData.static.isElementData( closeElement ), 'closeElement isElementData' );
	assert.false( ve.dm.LinearData.static.isElementData( 'x' ), 'text not isElementData' );
	assert.false( ve.dm.LinearData.static.isElementData( [ 'x', 'hash' ] ), 'annotated text not isElementData' );

	assert.true( ve.dm.LinearData.static.isOpenElementData( openElement ), 'openElement isOpenElementData' );
	assert.false( ve.dm.LinearData.static.isOpenElementData( closeElement ), 'closeElement not isOpenElementData' );

	assert.false( ve.dm.LinearData.static.isCloseElementData( openElement ), 'openElement not isCloseElementData' );
	assert.true( ve.dm.LinearData.static.isCloseElementData( closeElement ), 'closeElement isCloseElementData' );
} );

QUnit.test( 'push', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, [ 'a', 'b' ] );

	data.push( 'c', 'd' );
	assert.deepEqual( data.getData(), [ 'a', 'b', 'c', 'd' ], 'push: elements added' );
} );

QUnit.test( 'getDataSlice', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, [ 'a', 'b', 'c', 'd', 'e' ] );

	assert.deepEqual( data.getDataSlice( new ve.Range( 1, 4 ) ), [ 'b', 'c', 'd' ], 'getDataSlice: data' );
	assert.notStrictEqual( data.getDataSlice( new ve.Range( 1, 4 ) ), data.getData().slice( 1, 4 ), 'getDataSlice: returns a copy, not reference' );
} );

QUnit.test( 'clone', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		data = new ve.dm.LinearData( store, [ 'x', 'y', 'z' ] ),
		clone = data.clone();

	assert.deepEqual( clone.getData(), data.getData(), 'clone: data matches original' );
	assert.notStrictEqual( clone.getData(), data.getData(), 'clone: deep copy created' );
	assert.strictEqual( clone.getStore(), data.getStore(), 'clone: store reference is the same' );
} );

QUnit.test( 'getType/isOpenElementData/isCloseElementData', ( assert ) => {
	const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), [
			{ type: 'paragraph' },
			'a', [ 'b', [ 0 ] ],
			{ type: '/paragraph' }
		] ),
		types = [ 'paragraph', undefined, undefined, 'paragraph' ],
		isOpen = [ 0 ],
		isClose = [ 3 ];

	for ( let i = 0; i < data.getLength(); i++ ) {
		assert.strictEqual( data.getType( i ), types[ i ], 'Type at offset ' + i );
		assert.strictEqual( data.isOpenElementData( i ), isOpen.includes( i ), 'isOpen ' + i );
		assert.strictEqual( data.isCloseElementData( i ), isClose.includes( i ), 'isClose ' + i );
	}
} );

QUnit.test( 'isElementData', ( assert ) => {
	const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), [
			{ type: 'heading' },
			'a',
			{ type: 'inlineImage' },
			{ type: '/inlineImage' },
			'b',
			'c',
			{ type: '/heading' },
			{ type: 'paragraph' },
			{ type: '/paragraph' },
			{ type: 'preformatted' },
			{ type: 'inlineImage' },
			{ type: '/inlineImage' },
			{ type: '/preformatted' },
			{ type: 'list' },
			{ type: 'listItem' },
			{ type: '/listItem' },
			{ type: '/list' },
			{ type: 'alienBlock' },
			{ type: '/alienBlock' }
		] ),
		cases = [
			{ msg: 'left of document', expected: true },
			{ msg: 'beginning of content branch', expected: false },
			{ msg: 'left of non-text inline leaf', expected: true },
			{ msg: 'inside non-text inline leaf', expected: true },
			{ msg: 'right of non-text inline leaf', expected: false },
			{ msg: 'between characters', expected: false },
			{ msg: 'end of content branch', expected: true },
			{ msg: 'between content branches', expected: true },
			{ msg: 'inside empty content branch', expected: true },
			{ msg: 'between content branches', expected: true },
			{ msg: 'beginning of content branch, left of inline leaf', expected: true },
			{ msg: 'inside content branch with non-text leaf', expected: true },
			{ msg: 'end of content branch, right of inline leaf', expected: true },
			{ msg: 'between content, non-content branches', expected: true },
			{ msg: 'between parent, child branches, descending', expected: true },
			{ msg: 'inside empty non-content branch', expected: true },
			{ msg: 'between parent, child branches, ascending', expected: true },
			{ msg: 'between non-content branch, non-content leaf', expected: true },
			{ msg: 'inside non-content leaf', expected: true },
			{ msg: 'right of document', expected: false }
		];

	cases.forEach( ( caseItem, i ) => {
		assert.strictEqual( data.isElementData( i ), caseItem.expected, caseItem.msg );
	} );
} );

QUnit.test( 'getAnnotationsFromOffset', ( assert ) => {
	const cases = [
		{
			msg: [ 'bold #1', 'bold #2' ],
			data: [
				...ve.dm.example.annotateText( 'ab', ve.dm.example.bold )
			],
			expected: [
				[ ve.dm.example.bold ],
				[ ve.dm.example.bold ]
			]
		},
		{
			msg: [ 'bold #3', 'italic #1' ],
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				[ 'b', [ ve.dm.example.italic ] ]
			],
			expected: [
				[ ve.dm.example.bold ],
				[ ve.dm.example.italic ]
			]
		},
		{
			msg: [ 'bold, italic & underline' ],
			data: [
				[
					'a',
					[
						ve.dm.example.bold,
						ve.dm.example.italic,
						ve.dm.example.underline
					]
				]
			],
			expected: [
				[
					ve.dm.example.bold,
					ve.dm.example.italic,
					ve.dm.example.underline
				]
			]
		},
		{
			msg: [ 'unannotated element', 'annotated element', 'annotated close element', 'unannotated element' ],
			data: [
				{ type: 'paragraph' },
				{ type: 'break', annotations: [ ve.dm.example.bold ] },
				{ type: '/break' },
				{ type: '/paragraph' }
			],
			expected: [
				[],
				[
					ve.dm.example.bold
				],
				[
					ve.dm.example.bold
				],
				[]
			]
		},
		{
			msg: [ 'unannotated element', 'annotated element', 'annotated close element (ignored)', 'unannotated element' ],
			ignoreClose: true,
			data: [
				{ type: 'paragraph' },
				{ type: 'break', annotations: [ ve.dm.example.bold ] },
				{ type: '/break' },
				{ type: '/paragraph' }
			],
			expected: [
				[],
				[
					ve.dm.example.bold
				],
				[],
				[]
			]
		}
	];

	// Run tests
	cases.forEach( ( caseItem, i ) => {
		const data = ve.dm.example.preprocessAnnotations( caseItem.data );
		const doc = new ve.dm.Document( data );
		if ( i === 0 ) {
			assert.notStrictEqual(
				doc.data.getAnnotationsFromOffset( 0, caseItem.ignoreClose ).getHashes(),
				doc.data.getAnnotationsFromOffset( 0, caseItem.ignoreClose ).getHashes(),
				'annotation set hashes are not equal by reference'
			);
		}
		for ( let j = 0; j < doc.getData().length; j++ ) {
			const annotations = doc.data.getAnnotationsFromOffset( j, caseItem.ignoreClose );
			assert.deepEqual( annotations,
				ve.dm.example.createAnnotationSet( doc.getStore(), caseItem.expected[ j ] ),
				caseItem.msg[ j ]
			);
		}
	} );
} );

QUnit.test( 'getAnnotationsFromRange', ( assert ) => {
	const cases = [
		{
			msg: 'single annotations',
			data: [
				...ve.dm.example.annotateText( 'ab', ve.dm.example.bold )
			],
			expected: [ ve.dm.example.bold ]
		},
		{
			msg: 'single annotation with non-content data',
			data: [
				{ type: 'paragraph' },
				...ve.dm.example.annotateText( 'ab', ve.dm.example.bold ),
				{ type: '/paragraph' }
			],
			expected: [ ve.dm.example.bold ]
		},
		{
			msg: 'multiple annotations',
			data: [
				...ve.dm.example.annotateText( 'abc', [ ve.dm.example.bold, ve.dm.example.italic ] )
			],
			expected: [
				ve.dm.example.bold,
				ve.dm.example.italic
			]
		},
		{
			msg: 'lowest common coverage',
			data: [
				[
					'a',
					[
						ve.dm.example.bold,
						ve.dm.example.italic
					]
				],
				[
					'b',
					[
						ve.dm.example.bold,
						ve.dm.example.italic,
						ve.dm.example.underline
					]
				]
			],
			expected: [
				ve.dm.example.bold,
				ve.dm.example.italic
			]
		},
		{
			msg: 'no common coverage due to plain character at the start',
			data: [
				'a',
				[
					'b',
					[
						ve.dm.example.bold,
						ve.dm.example.italic,
						ve.dm.example.underline
					]
				],
				[
					'c',
					[
						ve.dm.example.bold,
						ve.dm.example.italic
					]
				]
			],
			expected: []
		},
		{
			msg: 'no common coverage due to plain character in the middle',
			data: [
				[
					'a',
					[
						ve.dm.example.bold,
						ve.dm.example.italic,
						ve.dm.example.underline
					]
				],
				[ 'b' ],
				[
					'c',
					[
						ve.dm.example.bold,
						ve.dm.example.italic
					]
				]
			],
			expected: []
		},
		{
			msg: 'no common coverage due to plain character at the end',
			data: [
				[
					'a',
					[
						ve.dm.example.bold,
						ve.dm.example.italic
					]
				],
				[
					'b',
					[
						ve.dm.example.bold,
						ve.dm.example.italic,
						ve.dm.example.underline
					]
				],
				[ 'c' ]
			],
			expected: []
		},
		{
			msg: 'no common coverage due to mismatched annotations',
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				[ 'b', [ ve.dm.example.italic ] ]
			],
			expected: []
		},
		{
			msg: 'no common coverage due to un-annotated content node',
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				{ type: 'inlineImage' },
				{ type: '/inlineImage' }
			],
			expected: []
		},
		{
			msg: 'branch node is ignored',
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				{ type: 'paragraph' },
				{ type: '/paragraph' }
			],
			expected: [ ve.dm.example.bold ]
		},
		{
			msg: 'annotations are collected using all with mismatched annotations',
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				[ 'b', [ ve.dm.example.italic ] ]
			],
			all: true,
			expected: [
				ve.dm.example.bold,
				ve.dm.example.italic
			]
		},
		{
			msg: 'annotations are collected using all, even with a plain character at the start',
			data: [
				'a',
				[ 'b', [ ve.dm.example.bold ] ],
				[ 'c', [ ve.dm.example.italic ] ]
			],
			all: true,
			expected: [
				ve.dm.example.bold,
				ve.dm.example.italic
			]
		},
		{
			msg: 'annotations are collected using all, even with a plain character in the middle',
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				'b',
				[ 'c', [ ve.dm.example.italic ] ]
			],
			all: true,
			expected: [
				ve.dm.example.bold,
				ve.dm.example.italic
			]
		},
		{
			msg: 'annotations are collected using all, even with a plain character at the end',
			data: [
				[ 'a', [ ve.dm.example.bold ] ],
				[ 'b', [ ve.dm.example.italic ] ],
				'c'
			],
			all: true,
			expected: [
				ve.dm.example.bold,
				ve.dm.example.italic
			]
		},
		{
			msg: 'no common coverage from all plain characters',
			data: [ ...'ab' ],
			expected: []
		},
		{
			msg: 'no common coverage using all from all plain characters',
			data: [ ...'ab' ],
			all: true,
			expected: []
		},
		{
			msg: 'contents of ignoreChildren nodes are skipped',
			data: [
				{ type: 'exampleIgnoreChildren' },
				...ve.dm.example.annotateText( 'ab', ve.dm.example.bold ),
				{ type: '/exampleIgnoreChildren' }
			],
			expected: []
		},
		{
			msg: 'contents of ignoreChildren nodes are skipped in all mode too',
			data: [
				{ type: 'exampleIgnoreChildren' },
				[ 'a', [ ve.dm.example.bold ] ],
				[ 'b', [ ve.dm.example.italic ] ],
				{ type: '/exampleIgnoreChildren' }
			],
			all: true,
			expected: []
		}
	];

	cases.forEach( ( caseItem ) => {
		const data = ve.dm.example.preprocessAnnotations( caseItem.data );
		const doc = new ve.dm.Document( data );
		assert.deepEqual(
			doc.data.getAnnotationsFromRange( new ve.Range( 0, caseItem.data.length ), caseItem.all ).getHashes(),
			ve.dm.example.createAnnotationSet( doc.getStore(), caseItem.expected ).getHashes(),
			caseItem.msg
		);
	} );
} );

QUnit.test( 'getInsertionAnnotationsFromRange', ( assert ) => {
	const u = ve.dm.example.underline,
		// <h1>:0 a:1 b:2 c:3 d:4 e:5 f:6 </h1>:7 <p>:8 g:9 </p>:10 <div>:11 </div>:12
		html = '<h1>ab<u>cd</u>ef</h1><p><u>g</u></p><div></div>',
		cases = [
			{ range: [ 1, 1 ], expected: [], msg: 'plain start at block start' },
			{ range: [ 2, 2 ], expected: [], msg: 'plain interior' },
			{ range: [ 3, 3 ], expected: [], msg: 'plain end before u' },
			{ range: [ 3, 3 ], startAfterAnnotations: true, expected: [ u ], msg: 'u start' },
			{ range: [ 4, 4 ], expected: [ u ], msg: 'u interior' },
			{ range: [ 5, 5 ], expected: [ u ], msg: 'u end' },
			{ range: [ 5, 5 ], startAfterAnnotations: true, expected: [], msg: 'after u' },
			{ range: [ 6, 6 ], expected: [], msg: 'plain start after u' },
			{ range: [ 7, 7 ], expected: [], msg: 'plain end at block end' },
			{ range: [ 9, 9 ], expected: [], msg: 'block start before u' },
			{ range: [ 9, 9 ], startAfterAnnotations: true, expected: [ u ], msg: 'u start at block start' },
			{ range: [ 10, 10 ], expected: [ u ], msg: 'u end before block end' },
			{ range: [ 10, 10 ], startAfterAnnotations: true, expected: [], msg: 'after u before block end' },
			{ range: [ 12, 12 ], expected: [], msg: 'empty block' },
			{ range: [ 2, 3 ], expected: [], msg: 'forward to u start' },
			{ range: [ 3, 2 ], expected: [], msg: 'backward to u start' },
			{ range: [ 2, 4 ], expected: [], msg: 'forward past u start' },
			{ range: [ 4, 2 ], expected: [], msg: 'backward past u start' },
			{ range: [ 3, 4 ], expected: [ u ], msg: 'forward to u end' },
			{ range: [ 4, 3 ], expected: [ u ], msg: 'backward to u end' },
			{ range: [ 3, 5 ], expected: [ u ], msg: 'forward past u end' },
			{ range: [ 5, 3 ], expected: [ u ], msg: 'backward past u end' }
		];

	const linearData = ve.dm.converter.getModelFromDom(
		ve.createDocumentFromHtml( html )
	).data;
	cases.forEach( ( caseItem ) => {
		const observed = linearData.getInsertionAnnotationsFromRange(
			new ve.Range( caseItem.range[ 0 ], caseItem.range[ 1 ] ),
			caseItem.startAfterAnnotations
		).get().map( ( annotation ) => ( {
			type: annotation.element.type,
			attributes: annotation.element.attributes
		} ) );
		assert.deepEqual( observed, caseItem.expected, caseItem.msg );
	} );
} );

QUnit.test( 'getAnnotatedRangeFromOffset/getAnnotatedRangeFromRange', ( assert ) => {
	const cases = [
		{
			msg: 'a bold word (offset)',
			data: [
				// 0
				'a',
				// 1-4
				...ve.dm.example.annotateText( 'bold', ve.dm.example.bold ),
				// 5-8
				...'word'
			],
			annotation: ve.dm.example.bold,
			offset: 3,
			expected: new ve.Range( 1, 5 )
		},
		{
			msg: 'a bold word (range)',
			data: [
				// 0
				'a',
				// 1-4
				...ve.dm.example.annotateText( 'bold', ve.dm.example.bold ),
				// 5-8
				...'word'
			],
			annotation: ve.dm.example.bold,
			range: new ve.Range( 2, 4 ),
			expected: new ve.Range( 1, 5 )
		},
		{
			msg: 'a linked',
			data: [
				// 0-2
				...'xxx',
				// 3-6
				...ve.dm.example.annotateText( 'link', { type: 'link' } ),
				// 7-9
				...'xxx'
			],
			annotation: { type: 'link' },
			offset: 3,
			expected: new ve.Range( 3, 7 )
		},
		{
			msg: 'bold over an annotated leaf node',
			data: [
				// 0
				'h',
				// 1-2
				...ve.dm.example.annotateText( 'bo', ve.dm.example.bold ),
				// 3
				{
					type: 'inlineImage',
					attributes: { src: ve.dm.example.imgSrc },
					annotations: [ ve.dm.example.bold ]
				},
				// 4
				{ type: '/inlineImage' },
				// 5-6
				...ve.dm.example.annotateText( 'ld', ve.dm.example.bold ),
				// 7
				'i'
			],
			annotation: ve.dm.example.bold,
			offset: 3,
			expected: new ve.Range( 1, 7 )
		}
	];

	cases.forEach( ( caseItem ) => {
		const data = ve.dm.example.preprocessAnnotations( caseItem.data );
		const doc = new ve.dm.Document( data );
		let range;
		if ( caseItem.range ) {
			range = doc.data.getAnnotatedRangeFromRange( caseItem.range, ve.dm.example.createAnnotation( caseItem.annotation ) );
		} else {
			range = doc.data.getAnnotatedRangeFromOffset( caseItem.offset, ve.dm.example.createAnnotation( caseItem.annotation ) );
		}
		assert.equalRange(
			range,
			caseItem.expected,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'trimOuterSpaceFromRange', ( assert ) => {
	const data = [
			// 0
			{ type: 'paragraph' },
			// 1-6
			...' Foo  ',
			// 7
			[ ' ', ve.dm.example.bold ],
			// 8
			[ ' ', ve.dm.example.italic ],
			// 9
			[ 'B', ve.dm.example.italic ],
			// 10-12
			...'ar ',
			// 13
			{ type: '/paragraph' }
			// 14
		],
		cases = [
			{
				msg: 'Word without spaces is untouched',
				range: new ve.Range( 2, 5 ),
				trimmed: new ve.Range( 2, 5 )
			},
			{
				msg: 'Consecutive words with spaces in between but not at the edges are untouched',
				range: new ve.Range( 2, 12 ),
				trimmed: new ve.Range( 2, 12 )
			},
			{
				msg: 'Single space is trimmed from the start',
				range: new ve.Range( 1, 4 ),
				trimmed: new ve.Range( 2, 4 )
			},
			{
				msg: 'Single space is trimmed from the end',
				range: new ve.Range( 3, 6 ),
				trimmed: new ve.Range( 3, 5 )
			},
			{
				msg: 'Single space is trimmed from both sides',
				range: new ve.Range( 1, 6 ),
				trimmed: new ve.Range( 2, 5 )
			},
			{
				msg: 'Different number of spaces trimmed on each side',
				range: new ve.Range( 1, 7 ),
				trimmed: new ve.Range( 2, 5 )
			},
			{
				msg: 'Annotated spaces are trimmed correctly from the end',
				range: new ve.Range( 3, 9 ),
				trimmed: new ve.Range( 3, 5 )
			},
			{
				msg: 'Annotated spaces are trimmed correctly from the start',
				range: new ve.Range( 7, 10 ),
				trimmed: new ve.Range( 9, 10 )
			},
			{
				msg: 'Trimming annotated spaces at the end and plain spaces at the start',
				range: new ve.Range( 1, 9 ),
				trimmed: new ve.Range( 2, 5 )
			},
			{
				msg: 'Spaces are trimmed from the ends but not in the middle',
				range: new ve.Range( 1, 13 ),
				trimmed: new ve.Range( 2, 12 )
			},
			{
				msg: 'All-whitespace range is trimmed to empty range',
				range: new ve.Range( 5, 9 ),
				trimmed: new ve.Range( 5 )
			}
		];

	const linearData = ve.dm.example.preprocessAnnotations( data );
	const elementData = new ve.dm.LinearData( linearData.getStore(), linearData.getData() );
	cases.forEach( ( caseItem ) => {
		assert.equalRange(
			elementData.trimOuterSpaceFromRange( caseItem.range ),
			caseItem.trimmed,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'isContentOffset', ( assert ) => {
	const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), [
			{ type: 'heading' },
			'a',
			{ type: 'inlineImage' },
			{ type: '/inlineImage' },
			...'bc',
			{ type: '/heading' },
			{ type: 'paragraph' },
			{ type: '/paragraph' },
			{ type: 'preformatted' },
			{ type: 'inlineImage' },
			{ type: '/inlineImage' },
			{ type: '/preformatted' },
			{ type: 'list' },
			{ type: 'listItem' },
			{ type: '/listItem' },
			{ type: '/list' },
			{ type: 'alienBlock' },
			{ type: '/alienBlock' },
			{ type: 'table' },
			{ type: 'tableRow' },
			{ type: 'tableCell' },
			{ type: 'alienBlock' },
			{ type: '/alienBlock' },
			{ type: '/tableCell' },
			{ type: '/tableRow' },
			{ type: '/table' }
		] ),
		cases = [
			{ msg: 'left of document', expected: false },
			{ msg: 'beginning of content branch', expected: true },
			{ msg: 'left of non-text inline leaf', expected: true },
			{ msg: 'inside non-text inline leaf', expected: false },
			{ msg: 'right of non-text inline leaf', expected: true },
			{ msg: 'between characters', expected: true },
			{ msg: 'end of content branch', expected: true },
			{ msg: 'between content branches', expected: false },
			{ msg: 'inside empty content branch', expected: true },
			{ msg: 'between content branches', expected: false },
			{ msg: 'beginning of content branch, left of inline leaf', expected: true },
			{ msg: 'inside content branch with non-text inline leaf', expected: false },
			{ msg: 'end of content branch, right of non-content leaf', expected: true },
			{ msg: 'between content, non-content branches', expected: false },
			{ msg: 'between parent, child branches, descending', expected: false },
			{ msg: 'inside empty non-content branch', expected: false },
			{ msg: 'between parent, child branches, ascending', expected: false },
			{ msg: 'between non-content branch, non-content leaf', expected: false },
			{ msg: 'inside non-content leaf', expected: false },
			{ msg: 'between non-content branches', expected: false },
			{ msg: 'between non-content branches', expected: false },
			{ msg: 'between non-content branches', expected: false },
			{ msg: 'inside non-content branch before non-content leaf', expected: false },
			{ msg: 'inside non-content leaf', expected: false },
			{ msg: 'inside non-content branch after non-content leaf', expected: false },
			{ msg: 'between non-content branches', expected: false },
			{ msg: 'between non-content branches', expected: false },
			{ msg: 'right of document', expected: false }
		];

	cases.forEach( ( caseItem, i ) => {
		const left = data.getData( i - 1 ) ? ( data.getData( i - 1 ).type || data.getCharacterData( i - 1 ) ) : '[start]';
		const right = data.getData( i ) ? ( data.getData( i ).type || data.getCharacterData( i ) ) : '[end]';
		assert.strictEqual(
			data.isContentOffset( i ),
			caseItem.expected,
			caseItem.msg + ' (' + left + '|' + right + ' @ ' + i + ')'
		);
	} );
} );

QUnit.test( 'isStructuralOffset', ( assert ) => {
	const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), [
			{ type: 'heading' },
			'a',
			{ type: 'inlineImage' },
			{ type: '/inlineImage' },
			...'bc',
			{ type: '/heading' },
			{ type: 'paragraph' },
			{ type: '/paragraph' },
			{ type: 'preformatted' },
			{ type: 'inlineImage' },
			{ type: '/inlineImage' },
			{ type: '/preformatted' },
			{ type: 'list' },
			{ type: 'listItem' },
			{ type: '/listItem' },
			{ type: '/list' },
			{ type: 'alienBlock' },
			{ type: '/alienBlock' },
			{ type: 'table' },
			{ type: 'tableRow' },
			{ type: 'tableCell' },
			{ type: 'alienBlock' },
			{ type: '/alienBlock' },
			{ type: '/tableCell' },
			{ type: '/tableRow' },
			{ type: '/table' }
		] ),
		cases = [
			{ msg: 'left of document', expected: [ true, true ] },
			{ msg: 'beginning of content branch', expected: [ false, false ] },
			{ msg: 'left of non-text inline leaf', expected: [ false, false ] },
			{ msg: 'inside non-text inline leaf', expected: [ false, false ] },
			{ msg: 'right of non-text inline leaf', expected: [ false, false ] },
			{ msg: 'between characters', expected: [ false, false ] },
			{ msg: 'end of content branch', expected: [ false, false ] },
			{ msg: 'between content branches', expected: [ true, true ] },
			{ msg: 'inside empty content branch', expected: [ false, false ] },
			{ msg: 'between content branches', expected: [ true, true ] },
			{ msg: 'beginning of content branch, left of inline leaf', expected: [ false, false ] },
			{ msg: 'inside content branch with non-text inline leaf', expected: [ false, false ] },
			{ msg: 'end of content branch, right of inline leaf', expected: [ false, false ] },
			{ msg: 'between content, non-content branches', expected: [ true, true ] },
			{ msg: 'between parent, child branches, descending', expected: [ true, false ] },
			{ msg: 'inside empty non-content branch', expected: [ true, true ] },
			{ msg: 'between parent, child branches, ascending', expected: [ true, false ] },
			{ msg: 'between non-content branch, non-content leaf', expected: [ true, true ] },
			{ msg: 'inside non-content leaf', expected: [ false, false ] },
			{ msg: 'between non-content branches', expected: [ true, true ] },
			{ msg: 'between non-content branches', expected: [ true, false ] },
			{ msg: 'between non-content branches', expected: [ true, false ] },
			{ msg: 'inside non-content branch before non-content leaf', expected: [ true, true ] },
			{ msg: 'inside non-content leaf', expected: [ false, false ] },
			{ msg: 'inside non-content branch after non-content leaf', expected: [ true, true ] },
			{ msg: 'between non-content branches', expected: [ true, false ] },
			{ msg: 'between non-content branches', expected: [ true, false ] },
			{ msg: 'right of document', expected: [ true, true ] }
		];

	cases.forEach( ( caseItem, i ) => {
		const left = data.getData( i - 1 ) ? ( data.getData( i - 1 ).type || data.getCharacterData( i - 1 ) ) : '[start]';
		const right = data.getData( i ) ? ( data.getData( i ).type || data.getCharacterData( i ) ) : '[end]';
		assert.strictEqual(
			data.isStructuralOffset( i ),
			caseItem.expected[ 0 ],
			caseItem.msg + ' (' + left + '|' + right + ' @ ' + i + ')'
		);
		assert.strictEqual(
			data.isStructuralOffset( i, true ),
			caseItem.expected[ 1 ],
			caseItem.msg + ', unrestricted (' + left + '|' + right + ' @ ' + i + ')'
		);
	} );
} );

QUnit.test( 'getCharacterData', ( assert ) => {
	const data = [ { type: 'paragraph' }, 'a', [ 'b', [ 0 ] ], { type: '/paragraph' } ],
		expected = [ '', 'a', 'b', '' ],
		linearData = new ve.dm.LinearData( new ve.dm.HashValueStore(), data );

	for ( let i = 0; i < data.length; i++ ) {
		assert.strictEqual(
			linearData.getCharacterData( i ), expected[ i ]
		);
	}
} );

QUnit.test( 'isPlainText', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument();

	assert.true( doc.data.isPlainText( new ve.Range( 1, 2 ), false ), 'Plain text' );
	assert.false( doc.data.isPlainText( new ve.Range( 1, 3 ), true ), 'Annotated text' );
	assert.true( doc.data.isPlainText( new ve.Range( 2, 3 ), true, undefined, true ), 'Annotated text, ignoring covering annotations' );
	assert.false( doc.data.isPlainText( new ve.Range( 9, 11 ), false ), 'Paragraph and text (no content nodes)' );
	assert.true( doc.data.isPlainText( new ve.Range( 9, 11 ), true ), 'Paragraph and text (content nodes allowed)' );
	assert.false( doc.data.isPlainText( new ve.Range( 12, 26 ), false ), 'List (no content nodes)' );
	assert.true( doc.data.isPlainText( new ve.Range( 12, 26 ), true ), 'List (content nodes allowed)' );
} );

QUnit.test( 'getText', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument();

	assert.strictEqual( doc.data.getText( false, new ve.Range( 2, 11 ) ), 'bcd' );
	assert.strictEqual( doc.data.getText( true, new ve.Range( 2, 11 ) ), 'bc      d'.replace( / /g, '\n' ) );
	assert.strictEqual( doc.data.getText( false ), 'abcdefghijklm' );
	assert.strictEqual(
		doc.data.getText( true ),
		' abc      d    e    f        g        h  i    j    k    l  m   '.replace( / /g, '\n' )
	);
} );

QUnit.test( 'getSourceText', ( assert ) => {
	const data = new ve.dm.LinearData(
			new ve.dm.HashValueStore(),
			[
				{ type: 'paragraph' }, ...'foo', { type: '/paragraph' },
				{ type: 'paragraph' }, ...'bar', { type: '/paragraph' },
				{ type: 'internalList' }, { type: '/internalList' }
			]
		),
		cases = [
			{
				msg: 'Whole document',
				range: undefined,
				expected: 'foo\nbar'
			},
			{
				msg: 'Simple text range',
				range: new ve.Range( 1, 4 ),
				expected: 'foo'
			},
			{
				msg: 'Newline spanning',
				range: new ve.Range( 3, 7 ),
				expected: 'o\nb'
			},
			{
				msg: 'Whole line',
				range: new ve.Range( 0, 5 ),
				expected: 'foo\n'
			}
		];

	cases.forEach( ( caseItem ) => {
		assert.strictEqual(
			data.getSourceText( caseItem.range ),
			caseItem.expected,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'isContentData', ( assert ) => {
	const cases = [
		{
			msg: 'simple paragraph',
			data: [ { type: 'paragraph' }, 'a', { type: '/paragraph' } ],
			expected: false
		},
		{
			msg: 'plain text',
			data: [ ...'abc' ],
			expected: true
		},
		{
			msg: 'annotated text',
			data: [ [ 'a', { '{"type:"bold"}': { type: 'bold' } } ] ],
			expected: true
		},
		{
			msg: 'non-text leaf',
			data: [ 'a', { type: 'inlineImage' }, { type: '/inlineImage' }, 'c' ],
			expected: true
		}
	];

	cases.forEach( ( caseItem ) => {
		const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), caseItem.data );
		assert.strictEqual(
			data.isContentData(), caseItem.expected, caseItem.msg
		);
	} );
} );

QUnit.test( 'getRelativeOffset', ( assert ) => {
	const cases = [
		{
			msg: 'document without any valid offsets returns -1',
			offset: 0,
			distance: 1,
			data: [],
			callback: () => false,
			expected: -1
		},
		{
			msg: 'document with all valid offsets returns offset + distance',
			offset: 0,
			distance: 2,
			data: [ ...'ab' ],
			callback: () => true,
			expected: 2
		},
		{
			msg: 'document with offset inside an ignoreChildren doesn\'t leave it and returns -1',
			offset: 7,
			distance: 1,
			data: [
				'a',
				{ type: 'internalList' },
				{ type: 'internalItem' },
				{ type: 'paragraph', internal: { generated: 'wrapper' } },
				...'abc',
				{ type: '/paragraph' },
				{ type: '/internalItem' },
				{ type: '/internalList' }
			],
			callback: ve.dm.LinearData.prototype.isContentOffset,
			// The results here look incorrect. It should "turn around" and return 7.
			// It should only return -1 if the internalItem has no valid offsets inside (it is empty).
			expected: -1
		}
	];

	cases.forEach( ( caseItem ) => {
		const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), caseItem.data );
		if ( 'expected' in caseItem ) {
			assert.strictEqual(
				data.getRelativeOffset(
					caseItem.offset,
					caseItem.distance,
					caseItem.callback
				),
				caseItem.expected,
				caseItem.msg
			);
		} else if ( 'exception' in caseItem ) {
			assert.throws(
				() => {
					data.getRelativeOffset(
						caseItem.offset,
						caseItem.distance,
						caseItem.callback
					);
				},
				caseItem.exception,
				caseItem.msg
			);
		}
	} );
} );

QUnit.test( 'getRelativeContentOffset', ( assert ) => {
	const simpleDoc = ve.dm.example.createExampleDocument(),
		annDoc = ve.dm.example.createExampleDocument( 'annotationData' ),
		cases = [
			{
				msg: 'invalid starting offset with zero distance gets corrected',
				offset: 0,
				distance: 0,
				expected: 1
			},
			{
				msg: 'invalid starting offset with zero distance gets corrected',
				offset: 61,
				distance: 0,
				expected: 60
			},
			{
				msg: 'valid offset with zero distance returns same offset',
				offset: 2,
				distance: 0,
				expected: 2
			},
			{
				msg: 'invalid starting offset gets corrected',
				offset: 0,
				distance: -1,
				expected: 1
			},
			{
				msg: 'invalid starting offset gets corrected',
				offset: 61,
				distance: 1,
				expected: 60
			},
			{
				msg: 'stop at left edge if already valid',
				offset: 1,
				distance: -1,
				expected: 1
			},
			{
				msg: 'stop at right edge if already valid',
				offset: 60,
				distance: 1,
				expected: 60
			},
			{
				msg: 'first content offset is farthest left',
				offset: 2,
				distance: -2,
				expected: 1
			},
			{
				msg: 'last content offset is farthest right',
				offset: 59,
				distance: 2,
				expected: 60
			},
			{
				msg: '1 right within text',
				offset: 1,
				distance: 1,
				expected: 2
			},
			{
				msg: '2 right within text',
				offset: 1,
				distance: 2,
				expected: 3
			},
			{
				msg: '1 left within text',
				offset: 2,
				distance: -1,
				expected: 1
			},
			{
				msg: '2 left within text',
				offset: 3,
				distance: -2,
				expected: 1
			},
			{
				msg: '1 right over elements',
				offset: 4,
				distance: 1,
				expected: 10
			},
			{
				msg: '2 right over elements',
				offset: 4,
				distance: 2,
				expected: 11
			},
			{
				msg: '1 left over elements',
				offset: 10,
				distance: -1,
				expected: 4
			},
			{
				msg: '2 left over elements',
				offset: 10,
				distance: -2,
				expected: 3
			},
			{
				msg: 'Skips over nested ignoreChildren nodes',
				doc: annDoc,
				offset: 10,
				distance: 1,
				expected: 24
			},
			{
				msg: 'Skips over nested ignoreChildren nodes (reverse)',
				doc: annDoc,
				offset: 23,
				distance: -1,
				expected: 9
			}
		];

	cases.forEach( ( caseItem ) => {
		const doc = caseItem.doc || simpleDoc;
		assert.strictEqual(
			doc.data.getRelativeContentOffset( caseItem.offset, caseItem.distance ),
			caseItem.expected,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'getNearestContentOffset', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		cases = [
			{
				msg: 'unspecified direction results in shortest distance',
				offset: 0,
				direction: 0,
				expected: 1
			},
			{
				msg: 'unspecified direction results in shortest distance',
				offset: 5,
				direction: 0,
				expected: 4
			},
			{
				msg: 'positive direction results in next valid offset to the right',
				offset: 5,
				direction: 1,
				expected: 10
			},
			{
				msg: 'negative direction results in next valid offset to the left',
				offset: 5,
				direction: -1,
				expected: 4
			},
			{
				msg: 'valid offset without direction returns same offset',
				offset: 1,
				expected: 1
			},
			{
				msg: 'valid offset with positive direction returns same offset',
				offset: 1,
				direction: 1,
				expected: 1
			},
			{
				msg: 'valid offset with negative direction returns same offset',
				offset: 1,
				direction: -1,
				expected: 1
			}
		];

	cases.forEach( ( caseItem ) => {
		assert.strictEqual(
			doc.data.getNearestContentOffset( caseItem.offset, caseItem.direction ),
			caseItem.expected,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'getRelativeStructuralOffset', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		cases = [
			{
				msg: 'invalid starting offset with zero distance gets corrected',
				offset: 1,
				distance: 0,
				expected: 5
			},
			{
				msg: 'invalid starting offset with zero distance gets corrected',
				offset: 60,
				distance: 0,
				expected: 61
			},
			{
				msg: 'valid offset with zero distance returns same offset',
				offset: 0,
				distance: 0,
				expected: 0
			},
			{
				msg: 'invalid starting offset gets corrected',
				offset: 2,
				distance: -1,
				expected: 0
			},
			{
				msg: 'invalid starting offset gets corrected',
				offset: 59,
				distance: 1,
				expected: 61
			},
			{
				msg: 'first structural offset is farthest left',
				offset: 5,
				distance: -2,
				expected: 0
			},
			{
				msg: 'last structural offset is farthest right',
				offset: 62,
				distance: 2,
				expected: 63
			},
			{
				msg: '1 right',
				offset: 0,
				distance: 1,
				expected: 5
			},
			{
				msg: '1 right, unrestricted',
				offset: 5,
				distance: 1,
				unrestricted: true,
				expected: 9
			},
			{
				msg: '2 right',
				offset: 0,
				distance: 2,
				expected: 6
			},
			{
				msg: '2 right, unrestricted',
				offset: 0,
				distance: 2,
				unrestricted: true,
				expected: 9
			},
			{
				msg: '1 left',
				offset: 61,
				distance: -1,
				expected: 58
			},
			{
				msg: '1 left, unrestricted',
				offset: 9,
				distance: -1,
				unrestricted: true,
				expected: 5
			},
			{
				msg: '2 left',
				offset: 61,
				distance: -2,
				expected: 55
			},
			{
				msg: '2 left, unrestricted',
				offset: 9,
				distance: -2,
				unrestricted: true,
				expected: 0
			}
		];

	cases.forEach( ( caseItem ) => {
		assert.strictEqual(
			doc.data.getRelativeStructuralOffset(
				caseItem.offset, caseItem.distance, caseItem.unrestricted
			),
			caseItem.expected,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'getNearestStructuralOffset', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		cases = [
			{
				msg: 'unspecified direction results in shortest distance',
				offset: 1,
				direction: 0,
				expected: 0
			},
			{
				msg: 'unspecified direction results in shortest distance',
				offset: 4,
				direction: 0,
				expected: 5
			},
			{
				msg: 'unspecified direction results in shortest distance, unrestricted',
				offset: 8,
				direction: 0,
				unrestricted: true,
				expected: 9
			},
			{
				msg: 'unspecified direction results in shortest distance, unrestricted',
				offset: 6,
				direction: 0,
				unrestricted: true,
				expected: 5
			},
			{
				msg: 'positive direction results in next valid offset to the right',
				offset: 1,
				direction: 1,
				expected: 5
			},
			{
				msg: 'positive direction results in next valid offset to the right',
				offset: 4,
				direction: 1,
				expected: 5
			},
			{
				msg: 'positive direction results in next valid offset to the right, unrestricted',
				offset: 7,
				direction: 1,
				unrestricted: true,
				expected: 9
			},
			{
				msg: 'negative direction results in next valid offset to the left',
				offset: 1,
				direction: -1,
				expected: 0
			},
			{
				msg: 'negative direction results in next valid offset to the left',
				offset: 4,
				direction: -1,
				expected: 0
			},
			{
				msg: 'negative direction results in next valid offset to the left, unrestricted',
				offset: 6,
				direction: -1,
				unrestricted: true,
				expected: 5
			},
			{
				msg: 'valid offset without direction returns same offset',
				offset: 0,
				expected: 0
			},
			{
				msg: 'valid offset with positive direction returns same offset',
				offset: 0,
				direction: 1,
				expected: 0
			},
			{
				msg: 'valid offset with negative direction returns same offset',
				offset: 0,
				direction: -1,
				expected: 0
			},
			{
				msg: 'valid offset without direction returns same offset, unrestricted',
				offset: 0,
				unrestricted: true,
				expected: 0
			},
			{
				msg: 'valid offset with positive direction returns same offset, unrestricted',
				offset: 0,
				direction: 1,
				unrestricted: true,
				expected: 0
			},
			{
				msg: 'valid offset with negative direction returns same offset, unrestricted',
				offset: 0,
				direction: -1,
				unrestricted: true,
				expected: 0
			}
		];

	cases.forEach( ( caseItem ) => {
		assert.strictEqual(
			doc.data.getNearestStructuralOffset(
				caseItem.offset, caseItem.direction, caseItem.unrestricted
			),
			caseItem.expected,
			caseItem.msg
		);
	} );
} );

QUnit.test( 'getWordRange', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		cases = [
			{
				phrase: 'visual editor test',
				msg: 'simple Latin word',
				offset: 10,
				expected: 'editor'
			},
			{
				phrase: 'visual editor test',
				msg: 'cursor at start of word',
				offset: 7,
				expected: 'editor'
			},
			{
				phrase: 'visual editor test',
				msg: 'cursor at end of word',
				offset: 13,
				expected: 'editor'
			},
			{
				phrase: 'visual editor test',
				msg: 'cursor at start of text',
				offset: 0,
				expected: 'visual'
			},
			{
				phrase: 'visual editor test',
				msg: 'cursor at end of text',
				offset: 18,
				expected: 'test'
			},
			{
				phrase: 'Computer-aided design',
				msg: 'hyphenated Latin word',
				offset: 12,
				expected: 'aided'
			},
			{
				phrase: 'Double  space',
				msg: 'middle of double space',
				offset: 7,
				expected: ''
			},
			{
				phrase: 'Water (l\'eau) is',
				msg: 'apostrophe and parentheses (Latin)',
				offset: 8,
				expected: 'l\'eau'
			},
			{
				phrase: 'Water (H2O) is',
				msg: 'number in word (Latin)',
				offset: 9,
				expected: 'H2O'
			},
			{
				phrase: 'The \'word\' is',
				msg: 'apostrophes as single quotes',
				offset: 7,
				expected: 'word'
			},
			{
				phrase: 'Some "double" quotes',
				msg: 'double quotes',
				offset: 8,
				expected: 'double'
			},
			{
				phrase: 'Wikipédia l\'encyclopédie libre',
				msg: 'extended Latin word',
				offset: 15,
				expected: 'l\'encyclopédie'
			},
			{
				phrase: 'Wikipédia l\'encyclopédie libre',
				msg: 'Extend characters (i.e. letter + accent)',
				offset: 15,
				expected: 'l\'encyclopédie'
			},
			{
				phrase: 'Википедия свободная энциклопедия',
				msg: 'Cyrillic word',
				offset: 14,
				expected: 'свободная'
			},
			{
				phrase: 'την ελεύθερη εγκυκλοπαίδεια',
				msg: 'Greek word',
				offset: 7,
				expected: 'ελεύθερη'
			},
			{
				phrase: '우리 모두의 백과사전',
				msg: 'Hangul word',
				offset: 4,
				expected: '모두의'
			},
			{
				phrase: 'This: ٠١٢٣٤٥٦٧٨٩ means 0123456789',
				msg: 'Eastern Arabic numerals',
				offset: 13,
				expected: '٠١٢٣٤٥٦٧٨٩'
			},
			{
				phrase: 'Latinカタカナwrapped',
				msg: 'Latin-wrapped Katakana word',
				offset: 7,
				expected: 'カタカナ'
			},
			{
				phrase: '维基百科',
				msg: 'Hanzi characters (cursor in middle, so can\'t choose)',
				offset: 2,
				expected: ''
			},
			{
				phrase: '维基百科',
				msg: 'Hanzi characters (cursor at end)',
				offset: 4,
				expected: '科'
			},
			{
				phrase: '维基百科',
				msg: 'Hanzi characters (cursor at start)',
				offset: 0,
				expected: '维'
			},
			{
				phrase: '维 基 百科',
				msg: 'Hanzi character isolated (cursor at start)',
				offset: 2,
				expected: '基'
			},
			{
				phrase: '维 基 百科',
				msg: 'Hanzi character isolated (cursor at end)',
				offset: 3,
				expected: '基'
			},
			{
				phrase: 'a b',
				msg: 'Single-char word before cursor',
				offset: 1,
				expected: 'a'
			},
			{
				phrase: 'a b',
				msg: 'Single-char word after cursor',
				offset: 2,
				expected: 'b'
			},
			{
				phrase: '"𨋢"=lip1',
				msg: 'Surrogate-pair word character before cursor',
				offset: 2,
				expected: '𨋢'
			},
			{
				phrase: '"𨋢"=lip1',
				msg: 'Surrogate-pair word character after cursor',
				offset: 1,
				expected: '𨋢'
			},
			{
				phrase: '"\uD83D\uDE00"=GRINNING_FACE',
				msg: 'Surrogate-pair non-word character before cursor',
				offset: 3,
				expected: ''
			},
			{
				phrase: '"\uD83D\uDE00"=GRINNING_FACE',
				msg: 'Surrogate-pair non-word character after cursor',
				offset: 1,
				expected: ''
			},
			{
				phrase: 'Costs £1,234.00 each',
				msg: 'formatted number sequence',
				offset: 11,
				expected: '1,234.00'
			},
			{
				phrase: 'Reset index_of variable',
				msg: 'underscore-joined word',
				offset: 8,
				expected: 'index_of'
			}
		];

	cases.forEach( ( caseItem ) => {
		// Construct the text (inside a paragraph, because getNearestContentOffset assumes
		// text cannot be at the very start or end of the data).
		const data = caseItem.phrase.split( '' );
		data.unshift( { type: 'paragraph' } );
		data.push( { type: '/paragraph' } );
		const linearData = new ve.dm.LinearData( store, data );
		// Adjust offsets to account for the paragraph tag
		const range = linearData.getWordRange( caseItem.offset + 1 );
		const word = caseItem.phrase.slice( range.start - 1, range.end - 1 );
		assert.strictEqual( word, caseItem.expected,
			caseItem.msg + ': ' +
			caseItem.phrase.slice( 0, caseItem.offset ) + '│' +
			caseItem.phrase.slice( caseItem.offset, caseItem.phrase.length ) +
			' → ' + caseItem.expected
		);
	} );
} );

QUnit.test( 'sanitize', ( assert ) => {
	const bold = { type: 'textStyle/bold', attributes: { nodeName: 'b' } },
		cases = [
			{
				html: '<p style="text-shadow: 0 0 1px #000;">F<b style="color:blue;">o</b>o</p>',
				data: [
					{ type: 'paragraph' },
					'F', [ 'o', [ ve.dm.example.boldHash ] ], 'o',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				store: { [ ve.dm.example.boldHash ]: bold },
				rules: { removeOriginalDomElements: true },
				msg: 'Original DOM elements removed'
			},
			{
				html: '<p>B<span rel="ve:Alien">a</span>r<img src="//upload.wikimedia.org/wikipedia/commons/b/b3/Wikipedia-logo-v2-en.svg"/></p>',
				data: [
					{ type: 'paragraph' },
					...'Br',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: {
					blacklist: {
						alienInline: true,
						inlineImage: true
					}
				},
				msg: 'Blacklisted nodes removed'
			},
			{
				html: '<p>B<i><b>a</b>z</i></p>',
				data: [
					{ type: 'paragraph' },
					...'Baz',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { plainText: true },
				msg: 'Annotations removed in plainText mode'
			},
			{
				html: '<p><b>a<span rel="ve:Alien">b</span>c</b></p>',
				data: [
					{ type: 'paragraph' },
					[ 'a', [ ve.dm.example.boldHash ] ],
					{
						type: 'alienInline',
						annotations: [ ve.dm.example.boldHash ]
					},
					{ type: '/alienInline' },
					[ 'c', [ ve.dm.example.boldHash ] ],
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: {
					removeOriginalDomElements: true,
					blacklist: {}
				},
				msg: 'Remapping annotations on content nodes'
			},
			{
				html: '<p><b>a<i></i>c</b></p>',
				data: [
					{ type: 'paragraph' },
					...ve.dm.example.annotateText( 'ac', ve.dm.example.boldHash ),
					{ type: '/paragraph' },
					{
						type: 'removableAlienMeta',
						internal: {
							loadMetaParentHash: 'hd25d21d36fa98e7a',
							loadMetaParentOffset: 1,
							preservedAnnotations: [ 'h96560f31226e3199' ]
						}
					},
					{ type: '/removableAlienMeta' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: {
					removeOriginalDomElements: true,
					allowMetadata: true
				},
				msg: 'Remapping annotations on moved meta nodes'
			},
			{
				html: '<p><b>a<i></i>c</b></p>',
				data: [
					{ type: 'paragraph' },
					...ve.dm.example.annotateText( 'ac', ve.dm.example.boldHash ),
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: {
					removeOriginalDomElements: true,
					allowMetadata: false
				},
				msg: 'Removing moved meta nodes too when removing other metadata'
			},
			{
				html: '<h1>Bar</h1><h2>Baz</h2><p>Quux</p>',
				data: [
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					...'Baz',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					...'Quux',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { plainText: true },
				msg: 'Headings converted to paragraph in plainText mode'
			},
			{
				html: '<p>Bar</p><p>Baz</p><p>Quux</p>',
				data: [
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { singleLine: true },
				msg: 'Extra lines truncated in singleline mode'
			},
			{
				html: '<h1>Bar</h1>',
				data: [
					// TODO: non-relevant attributes should be discarded, T130377
					{ type: 'paragraph', attributes: { level: 1 } },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { conversions: { heading: 'paragraph' } },
				msg: 'Explicit conversion: heading->paragraph'
			},
			{
				html: '<p>Foo</p><p></p><h1></h1><p>Bar</p>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				msg: 'Empty content nodes are stripped'
			},
			{
				html: '<ul><li></li></ul>',
				data: [
					{ type: 'list', attributes: { style: 'bullet' } },
					{ type: 'listItem' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } },
					{ type: '/paragraph' },
					{ type: '/listItem' },
					{ type: '/list' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				msg: 'Empty, but generated, content nodes are preserved'
			},
			{
				html: '<ul><li><br></li></ul>',
				data: [
					{ type: 'list', attributes: { style: 'bullet' } },
					{ type: 'listItem' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } },
					{ type: '/paragraph' },
					{ type: '/listItem' },
					{ type: '/list' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				msg: 'Line breaks in wrapper paragraphs are discarded'
			},
			{
				html: '<div>Foo</div>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { blacklist: { div: true } },
				msg: 'Wrapper paragraph becomes real paragraph when unwrapped due to blacklist'
			},
			{
				html: '<p><span style="color:red;" class="red">Foo</span></p>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { removeOriginalDomElements: true },
				msg: 'Span stripped when removing original DOM elements'
			},
			{
				html: '<p><span style="color:red;"><span style="color:red;">Foo</span></span></p>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { removeOriginalDomElements: true },
				msg: 'Double annotation sanitized'
			},
			{
				html: '<p><b>1<b>2</b>3</b></p>',
				data: [
					{ type: 'paragraph' },
					...ve.dm.example.annotateText( '123', ve.dm.example.boldHash ),
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { removeOriginalDomElements: true },
				msg: 'Double annotation appears just once'
			},
			{
				html: '<p>F<br>o</p><h1>B<br>a</h1><p>B<br></p>',
				data: [
					{ type: 'paragraph' },
					'F',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					'o',
					{ type: '/paragraph' },
					{ type: 'heading', attributes: { level: 1 } },
					'B',
					{ type: '/heading' },
					{ type: 'heading', attributes: { level: 1 } },
					'a',
					{ type: '/heading' },
					{ type: 'paragraph' },
					'B',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { removeOriginalDomElements: true },
				msg: 'Breaks split content branch nodes'
			},
			{
				html: '<p>Foo\nBar\n <b>Baz \nQ&nbsp;uu\nx</b></p>',
				data: [
					{ type: 'paragraph' },
					...'Foo Bar ',
					...ve.dm.example.annotateText( 'Baz Q uu x', ve.dm.example.annHash( 'b' ) ),
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				msg: 'Newline characters and NBSPs are replaced with spaces and/or stripped where necessary'
			},
			{
				html: '<p>Foo\nBar\n </p><pre>Baz \nQu&nbsp;ux<!--comment-->\nWhee</pre><p>A&nbsp;&nbsp;B&nbsp;&nbsp;&nbsp;C</p>',
				data: [
					{ type: 'paragraph' },
					...'Foo Bar',
					{ type: '/paragraph' },
					{ type: 'preformatted' },
					...'Baz \nQu\u00a0ux',
					{ type: 'comment', attributes: { text: 'comment' } },
					{ type: '/comment' },
					'\n', ...'Whee',
					{ type: '/preformatted' },
					{ type: 'paragraph' },
					...'A \u00a0B \u00a0 C',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				msg: 'Newline characters and NBSPs are not stripped when they are meaningful'
			},
			{
				html: '<p>Foo</p> \n\t <p>Bar</p>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				msg: 'HTML whitespace is stripped'
			},
			{
				html: '<p>Foo</p> \n\t <p>Bar</p>',
				data: [
					{ type: 'paragraph', internal: { whitespace: [ undefined, undefined, undefined, ' \n\t ' ] } },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'paragraph', internal: { whitespace: [ ' \n\t ' ] } },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { preserveHtmlWhitespace: true },
				msg: 'HTML whitespace is preserved when preserveHtmlWhitespace is used'
			},
			{
				html: '<p>Foo</p><p><br /></p><p>Bar</p>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { keepEmptyContentBranches: true },
				msg: 'Blank line (Chrome style) preserved with keepEmptyContentBranches'
			},
			{
				html: '<p>Foo<br /><br />Bar</p>',
				data: [
					{ type: 'paragraph' },
					...'Foo',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { keepEmptyContentBranches: true },
				msg: 'Blank line (Firefox style) preserved with keepEmptyContentBranches'
			},
			{
				html: '<p>A<meta foo="bar" />B</p>',
				data: [
					{ type: 'paragraph' },
					...'AB',
					{ type: '/paragraph' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: {},
				msg: 'Metadata is sanitized if allowMetadata is false'
			},
			{
				html: '<p>A<meta foo="bar" />B</p>',
				data: [
					{ type: 'paragraph' },
					...'AB',
					{ type: '/paragraph' },
					{
						type: 'alienMeta',
						internal: {
							loadMetaParentHash: 'h069d094b1fb89d8a',
							loadMetaParentOffset: 1
						}
					},
					{ type: '/alienMeta' },
					{ type: 'internalList' },
					{ type: '/internalList' }
				],
				rules: { allowMetadata: true },
				msg: 'Metadata is not sanitized if allowMetadata is true'
			}
		];

	cases.forEach( ( caseItem ) => {
		const model = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( caseItem.html ) );
		const data = model.data;
		data.sanitize( caseItem.rules || {} );
		assert.equalLinearData( data.data, caseItem.data, caseItem.msg + ': data' );
		if ( caseItem.store ) {
			const actualStore = {};
			for ( const key in caseItem.store ) {
				actualStore[ key ] = data.getStore().value( key ).element;
			}
			assert.deepEqualWithDomElements( actualStore, caseItem.store, caseItem.msg + ': store' );
		}
	} );
} );

QUnit.test( 'countNonInternalElements', ( assert ) => {
	const cases = [
		{
			data: [
				{ type: 'paragraph' },
				'F', [ 'o', [ 0 ] ], 'o',
				{ type: '/paragraph' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			expected: 5,
			msg: 'Counting non-internal elements - no internal data'
		},
		{
			data: [
				{ type: 'paragraph' },
				...'Fo',
				{ type: '/paragraph' },
				{ type: 'internalList' },
				{ type: 'internalItem' },
				{ type: 'paragraph' },
				'a',
				{ type: '/paragraph' },
				{ type: '/internalItem' },
				{ type: '/internalList' }
			],
			expected: 4,
			msg: 'Counting non-internal elements'
		}
	];

	cases.forEach( ( caseItem ) => {
		const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), caseItem.data );
		assert.strictEqual( data.countNonInternalElements(), caseItem.expected, caseItem.msg );
	} );
} );

QUnit.test( 'hasContent', ( assert ) => {
	const cases = [
		{
			data: [],
			expected: false,
			msg: 'Completely empty document has no content'
		},
		{
			data: [
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			expected: false,
			msg: 'Internal list only document has no content'
		},
		{
			data: [
				{ type: 'paragraph' },
				{ type: '/paragraph' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			expected: false,
			msg: 'Real world empty document has no content'
		},
		{
			data: [
				{ type: 'paragraph' },
				'F', [ 'o', [ 0 ] ], 'o',
				{ type: '/paragraph' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			expected: true,
			msg: 'Document with text has content'
		},
		{
			data: [
				{ type: 'alienBlock' },
				{ type: '/alienBlock' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			expected: true,
			msg: 'Document with non-ContentBranchNode (alienBlock) node has content'
		},
		{
			data: [
				{ type: 'paragraph' },
				{ type: '/paragraph' },
				{ type: 'internalList' },
				{ type: 'internalItem' },
				{ type: 'paragraph' },
				'a',
				{ type: '/paragraph' },
				{ type: '/internalItem' },
				{ type: '/internalList' }
			],
			expected: false,
			msg: 'Empty document with internal data has no content'
		}
	];

	cases.forEach( ( caseItem ) => {
		const data = new ve.dm.LinearData( new ve.dm.HashValueStore(), caseItem.data );
		assert.strictEqual( data.hasContent(), caseItem.expected, caseItem.msg );
	} );
} );

QUnit.test( 'getAnnotationHashesFromOffset', ( assert ) => {
	const linearData = ve.dm.example.preprocessAnnotations( ve.copy( ve.dm.example.data ) ),
		elementData = new ve.dm.LinearData( linearData.getStore(), linearData.getData() ),
		cases = [
			{
				msg: '0 has no annotations',
				offset: 0,
				ignoreClose: true,
				expected: []
			},
			{
				msg: '2 has a BoldAnnotation',
				offset: 2,
				ignoreClose: true,
				expected: [ ve.dm.example.boldHash ]
			},
			{
				msg: '3 contains an ItalicAnnotation',
				offset: 3,
				ignoreClose: true,
				expected: [ ve.dm.example.italicHash ]
			}
		],
		errorCases = [
			{
				msg: '-1 throws as out of bounds',
				offset: -1,
				ignoreClose: true,
				exception: ''
			},
			{
				msg: '64 throws as out of bounds',
				offset: 64,
				ignoreClose: true,
				exception: ''
			}
		];

	cases.forEach( ( caseItem ) => {
		assert.deepEqual(
			elementData.getAnnotationHashesFromOffset( caseItem.offset, caseItem.ignoreClose ),
			caseItem.expected,
			caseItem.msg
		);
	} );

	errorCases.forEach( ( errorCaseItem ) => {
		assert.throws(
			() => {
				elementData.getAnnotationHashesFromOffset( errorCaseItem.offset, errorCaseItem.ignoreClose );
			}, new Error( 'offset ' + errorCaseItem.offset + ' out of bounds' ),
			errorCaseItem.msg
		);
	} );
} );

QUnit.test( 'compareElements and compareElementsUnannotated', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		cases = [
			{
				a: '母',
				b: '母',
				comparison: true,
				msg: 'Identical unannotated characters'
			},
			{
				a: '다',
				b: '가',
				comparison: false,
				msg: 'Non-identical unannotated characters'
			},
			{
				a: [ 'F', [ ve.dm.example.boldHash ] ],
				b: [ 'F', [ ve.dm.example.boldHash ] ],
				comparison: true,
				msg: 'Identically-annotated identical characters'
			},
			{
				a: [ 'F', [ ve.dm.example.boldHash ] ],
				b: [ 'F', [ ve.dm.example.italicHash ] ],
				comparison: false,
				comparisonUnannotated: true,
				msg: 'Identical characters, differently-annotated'
			},
			{
				a: [ 'F', [ ve.dm.example.boldHash ] ],
				b: [ 'F', [ ve.dm.example.strongHash ] ],
				comparison: true,
				msg: 'Identical characters, comparably-annotated'
			},
			{
				a: [ 'F', [ ve.dm.example.boldHash ] ],
				b: [ 'G', [ ve.dm.example.boldHash ] ],
				comparison: false,
				msg: 'Different characters, identically-annotated'
			},
			{
				a: [ 'F', [ ve.dm.example.boldHash ] ],
				b: [ 'G', [ ve.dm.example.strongHash ] ],
				comparison: false,
				msg: 'Different characters, comparably-annotated'
			},
			{
				a: 'F',
				b: [ 'G', [ ve.dm.example.boldHash ] ],
				comparison: false,
				msg: 'Different characters, one annotated, one not'
			},
			{
				a: 'F',
				b: [ 'F', [ ve.dm.example.boldHash ] ],
				comparison: false,
				comparisonUnannotated: true,
				msg: 'Identical characters, one annotated, one not'
			},
			{
				a: { type: 'paragraph' },
				b: 'F',
				comparison: false,
				msg: 'Element with character'
			},
			{
				a: { type: 'paragraph' },
				b: [ 'F', [ ve.dm.example.boldHash ] ],
				comparison: false,
				msg: 'Element with annotated character'
			},
			{
				a: { type: 'paragraph' },
				b: { type: 'paragraph' },
				comparison: true,
				msg: 'Identical opening paragraphs'
			},
			{
				a: { type: 'inlineImage', annotations: [ ve.dm.example.boldHash ] },
				b: { type: 'inlineImage', annotations: [ ve.dm.example.boldHash ] },
				comparison: true,
				msg: 'Identical elements, identically-annotated'
			},
			{
				a: { type: 'inlineImage', annotations: [ ve.dm.example.boldHash ] },
				b: { type: 'inlineImage', annotations: [ ve.dm.example.strongHash ] },
				comparison: true,
				msg: 'Identical elements, comparably-annotated'
			},
			{
				a: { type: 'inlineImage', annotations: [ ve.dm.example.boldHash ] },
				b: { type: 'inlineImage', annotations: [ ve.dm.example.italicHash ] },
				comparison: false,
				comparisonUnannotated: true,
				msg: 'Identical elements, differently-annotated'
			},
			{
				a: { type: 'inlineImage', annotations: [ ve.dm.example.boldHash ] },
				b: { type: 'inlineImage' },
				comparison: false,
				comparisonUnannotated: true,
				msg: 'Identical elements, one annotated, one not'
			},
			{
				a: { type: 'heading' },
				b: { type: 'heading' },
				comparison: true,
				msg: 'Identical opening elements'
			},
			{
				a: { type: 'heading' },
				b: { type: '/heading' },
				comparison: false,
				msg: 'Matching opening and closing elements'
			},
			{
				a: { type: 'heading', attributes: { level: 3 } },
				b: { type: 'heading', attributes: { level: 3 } },
				comparison: true,
				msg: 'Identical elements with identical attributes'
			},
			{
				a: { type: 'heading', attributes: { level: 3 } },
				b: { type: 'heading', attributes: { level: 2 } },
				comparison: false,
				comparisonForTranslate: true,
				msg: 'Identical elements with non-identical attributes'
			},
			{
				a: { type: 'heading', attributes: { level: 3 } },
				b: { type: 'heading' },
				comparison: false,
				comparisonForTranslate: true,
				msg: 'Identical elements, one without an attribute'
			}
		];

	store.hash( new ve.dm.BoldAnnotation( ve.dm.example.bold ) );
	store.hash( new ve.dm.BoldAnnotation( ve.dm.example.strong ) );
	store.hash( new ve.dm.ItalicAnnotation( ve.dm.example.italic ) );

	cases.forEach( ( caseItem ) => {
		assert.strictEqual(
			ve.dm.LinearData.static.compareElements( caseItem.a, caseItem.b, store ),
			caseItem.comparison,
			caseItem.msg
		);
		assert.strictEqual(
			ve.dm.LinearData.static.compareElementsUnannotated( caseItem.a, caseItem.b ),
			caseItem.comparisonUnannotated || caseItem.comparison,
			caseItem.msg + ' (unannotated)'
		);
		assert.strictEqual(
			ve.dm.Transaction.static.compareElementsForTranslate( caseItem.a, caseItem.b ),
			caseItem.comparisonForTranslate || caseItem.comparisonUnannotated || caseItem.comparison,
			caseItem.msg + ' (compareElementsForTranslate)'
		);
	} );
} );

QUnit.test( 'setAnnotationsAtOffset', ( assert ) => {
	const store = new ve.dm.HashValueStore();
	const elementData = new ve.dm.LinearData( store, [ { type: 'paragraph' }, ...'abc', { type: '/paragraph' } ] );

	elementData.setAnnotationsAtOffset( 2, ve.dm.example.createAnnotationSet( store, [ ve.dm.example.bold ] ) );
	elementData.setAnnotationsAtOffset( 3, ve.dm.example.createAnnotationSet( store, [ ve.dm.example.italic ] ) );

	assert.deepEqual(
		elementData.getAnnotationHashesFromOffset( 2, true ),
		[ ve.dm.example.boldHash ],
		'Offset 2 is bold'
	);
	assert.deepEqual(
		elementData.getAnnotationHashesFromOffset( 3, true ),
		[ ve.dm.example.italicHash ],
		'Offset 3 is italic'
	);
} );

// TODO: ve.dm.LinearData#remapInternalListIndexes
// TODO: ve.dm.LinearData#remapInternalListKeys
// TODO: ve.dm.LinearData#cloneElements
