/*!
 * VisualEditor DataModel Change tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.Change' );

QUnit.test( 'rebaseTransactions', ( assert ) => {
	const doc = ve.dm.example.createExampleDocument(),
		bold = ve.dm.example.createAnnotation( ve.dm.example.bold ),
		replace12 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 1, 2 ), [ ...'Foo' ] ),
		replace23 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 2, 3 ), [ ...'Bar' ] ),
		replace13 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 1, 3 ), [ ...'Baz' ] ),
		replace24 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 2, 4 ), [ ...'qux' ] ),
		insert1X = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ 'x' ] ),
		insert1Y = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ 'y' ] ),
		annotate12 = ve.dm.TransactionBuilder.static.newFromAnnotation( doc, new ve.Range( 1, 2 ), 'set', bold ),
		rebasedOnto = ( tx1, tx2 ) => ve.dm.Change.static.rebaseTransactions( tx1, tx2 )[ 0 ];
	assert.deepEqual( rebasedOnto( replace23, replace12 ).operations, [
		{
			type: 'retain',
			length: 4
		},
		{
			type: 'replace',
			remove: [ [ 'b', [ ve.dm.example.boldHash ] ] ],
			insert: [ ...'Bar' ]
		},
		{
			type: 'retain',
			length: 60
		}
	], 'Rebase onto upwind replace' );

	assert.deepEqual( rebasedOnto( replace12, replace23 ).operations, [
		{
			type: 'retain',
			length: 1
		},
		{
			type: 'replace',
			remove: [ 'a' ],
			insert: [ ...'Foo' ]
		},
		{
			type: 'retain',
			length: 63
		}
	], 'Rebase onto downwind replace' );

	assert.deepEqual( rebasedOnto( replace12, replace23 ).operations, [
		{
			type: 'retain',
			length: 1
		},
		{
			type: 'replace',
			remove: [ 'a' ],
			insert: [ ...'Foo' ]
		},
		{
			type: 'retain',
			length: 63
		}
	], 'Rebase onto downwind replace' );

	assert.deepEqual( rebasedOnto( replace24, annotate12 ).operations, replace24.operations, 'Rebase onto upwind annotate' );

	assert.strictEqual( rebasedOnto( replace12, annotate12 ), null, 'Rebase conflict with overlapping annotate' );
	assert.strictEqual( rebasedOnto( replace12, replace13 ), null, 'Rebase conflict with surrounding replace' );
	assert.strictEqual( rebasedOnto( replace13, replace12 ), null, 'Rebase conflict with surrounded replace' );
	assert.strictEqual( rebasedOnto( replace13, replace24 ), null, 'Rebase conflict with overlapping downwind replace' );
	assert.strictEqual( rebasedOnto( replace24, replace13 ), null, 'Rebase conflict with overlapping upwind replace' );

	assert.deepEqual(
		rebasedOnto( rebasedOnto( replace12, replace23 ), replace23.reversed() ).operations,
		replace12.operations,
		'Inverse rebase'
	);

	const rebased = ve.dm.Change.static.rebaseTransactions( insert1X, insert1Y );
	assert.deepEqual( rebased[ 0 ].operations, [
		{
			type: 'retain',
			length: 1
		},
		{
			type: 'replace',
			remove: [],
			insert: [ 'x' ]
		},
		{
			type: 'retain',
			length: 63
		}
	], 'Rebase-startmost insert onto parallel insert at the same offset' );

	assert.deepEqual( rebased[ 1 ].operations, [
		{
			type: 'retain',
			length: 2
		},
		{
			type: 'replace',
			remove: [],
			insert: [ 'y' ]
		},
		{
			type: 'retain',
			length: 62
		}
	], 'Rebase-endmost insert onto parallel insert at the same offset' );
} );

QUnit.test( 'Change operations', ( assert ) => {
	const origData = [ { type: 'paragraph' }, ...'three', { type: '/paragraph' } ],
		newSurface = () => new ve.dm.Surface(
			ve.dm.example.createExampleDocumentFromData( origData )
		);
	let surface = newSurface();
	const emptyStore = new ve.dm.HashValueStore(),
		doc = surface.documentModel,
		b = ve.dm.example.bold,
		i = ve.dm.example.italic,
		u = ve.dm.example.underline,
		bHash = [ ve.dm.example.boldHash ],
		iHash = [ ve.dm.example.italicHash ],
		uHash = [ ve.dm.example.underlineHash ],
		TxInsert = ve.dm.TransactionBuilder.static.newFromInsertion,
		TxReplace = ve.dm.TransactionBuilder.static.newFromReplacement,
		TxRemove = ve.dm.TransactionBuilder.static.newFromRemoval,
		TxAnnotate = ve.dm.TransactionBuilder.static.newFromAnnotation,
		insert1 = new ve.dm.Change( 0, [
			TxInsert( doc, 1, [ [ 'o', bHash ] ] ),
			TxInsert( doc, 2, [ [ 'n', bHash ] ] ),
			TxInsert( doc, 3, [ [ 'e', bHash ] ] ),
			TxInsert( doc, 4, [ ' ' ] )
		], [ new ve.dm.HashValueStore( [ b ] ), emptyStore, emptyStore, emptyStore ], {
			1: new ve.dm.LinearSelection( new ve.Range( 7, 7 ) )
		} ),
		insert2 = new ve.dm.Change( 0, [
			TxInsert( doc, 1, [ [ 't', iHash ] ] ),
			TxInsert( doc, 2, [ [ 'w', iHash ] ] ),
			TxInsert( doc, 3, [ [ 'o', iHash ] ] ),
			TxInsert( doc, 4, [ ' ' ] )
		], [ new ve.dm.HashValueStore( [ i ] ), emptyStore, emptyStore, emptyStore ], {
			2: new ve.dm.LinearSelection( new ve.Range( 1, 1 ) )
		} ),
		underline3 = new ve.dm.Change( 0, [
			TxAnnotate( doc, new ve.Range( 1, 6 ), 'set', u )
		], [ new ve.dm.HashValueStore( [ u ] ) ], {} );

	insert2.applyTo( surface );
	assert.deepEqual(
		doc.data.data.slice( 1, -1 ),
		[ ...ve.dm.example.annotateText( 'two', iHash ), ...' three' ],
		'Apply insert2'
	);

	const replace2 = new ve.dm.Change( 4, [
		TxReplace( doc, new ve.Range( 1, 4 ), [ ...'TWO' ] )
	], [ emptyStore ], {} );

	const remove2 = new ve.dm.Change( 4, [
		TxRemove( doc, new ve.Range( 1, 4 ) )
	], [ emptyStore ], {} );

	let change = insert2.reversed();
	assert.strictEqual( change.start, 4, 'start for insert2.reversed()' );
	change.applyTo( surface );
	assert.deepEqual( doc.data.data, origData, 'Apply insert2.reversed()' );

	surface = newSurface();
	change = insert1.concatRebased( insert2 );
	change.applyTo( surface );
	assert.deepEqual(
		surface.documentModel.data.data.slice( 1, -1 ),
		[
			...ve.dm.example.annotateText( 'one', bHash ),
			' ',
			...ve.dm.example.annotateText( 'two', iHash ),
			...' three'
		],
		'Apply insert1 then insert2'
	);
	change.reversed().applyTo( surface );
	assert.deepEqual(
		surface.documentModel.data.data,
		origData,
		'Apply (insert1 then insert2) reversed'
	);

	surface = newSurface();
	change = insert1.concatRebased( insert2.concat( replace2 ) ).concatRebased( underline3 );
	change.applyTo( surface );
	assert.deepEqual(
		surface.documentModel.data.data.slice( 1, -1 ),
		[
			...ve.dm.example.annotateText( 'one', bHash ),
			...' TWO ',
			...ve.dm.example.annotateText( 'three', uHash )
		],
		'Apply insert1 then insert2*replace2 then underline3'
	);
	change.reversed().applyTo( surface );
	assert.deepEqual(
		doc.data.data,
		origData,
		'Apply (insert1 then insert2*replace2 then underline3) reversed'
	);

	assert.deepEqual(
		ve.dm.Change.static.rebaseUncommittedChange( remove2, replace2 ).rebased.transactions,
		[],
		'Conflict rebasing replace2 onto remove2'
	);

	assert.equalRange(
		ve.dm.Change.static.rebaseUncommittedChange( insert1, insert2 ).rebased.selections[ 2 ].range,
		new ve.Range( 1 ),
		'Selection before insertion is not adjusted when rebasing (1)'
	);

	assert.equalRange(
		ve.dm.Change.static.rebaseUncommittedChange( insert2, insert1 ).transposedHistory.selections[ 2 ].range,
		new ve.Range( 1 ),
		'Selection before insertion is not adjusted when rebasing (2)'
	);

	assert.equalRange(
		ve.dm.Change.static.rebaseUncommittedChange( insert1, insert2 ).transposedHistory.selections[ 1 ].range,
		new ve.Range( 11 ),
		'Selection after insertion is adjusted when rebasing (1)'
	);

	assert.equalRange(
		ve.dm.Change.static.rebaseUncommittedChange( insert2, insert1 ).rebased.selections[ 1 ].range,
		new ve.Range( 11 ),
		'Selection after insertion is adjusted when rebasing (2)'
	);
} );

QUnit.test( 'Rebase with conflicting annotations', ( assert ) => {
	const origData = [ { type: 'paragraph' }, 'A', { type: '/paragraph' } ],
		newSurface = () => new ve.dm.Surface(
			ve.dm.example.createExampleDocumentFromData( origData )
		),
		surface = newSurface(),
		doc = surface.documentModel,
		TxRemove = ve.dm.TransactionBuilder.static.newFromRemoval,
		TxAnnotate = ve.dm.TransactionBuilder.static.newFromAnnotation,
		b = ve.dm.example.bold,
		emptyStore = new ve.dm.HashValueStore(),
		bStore = new ve.dm.HashValueStore( [ b ] );

	// Canonical history: text gets removed
	const remove = new ve.dm.Change( 1, [ TxRemove( doc, new ve.Range( 1, 2 ) ) ], [ emptyStore ], {} );
	// Doomed conflicting history: text gets bolded
	const setBold = new ve.dm.Change( 1, [ TxAnnotate( doc, new ve.Range( 1, 2 ), 'set', b ) ], [ bStore ], {} );
	const result = ve.dm.Change.static.rebaseUncommittedChange( remove, setBold );
	assert.deepEqual(
		result.rebased.toJSON(),
		new ve.dm.Change( 2, [], [], {} ).toJSON(),
		'Nothing got rebased'
	);
	assert.deepEqual(
		result.rejected.toJSON(),
		setBold.toJSON(),
		'setBold got rejected'
	);
	assert.deepEqual(
		result.transposedHistory.toJSON(),
		remove.toJSON(),
		'remove got transposed'
	);
} );

QUnit.test( 'toJSON/deserialize/unsafeDeserialize', ( assert ) => {
	const origData = [ { type: 'paragraph' }, ...'Bar', { type: '/paragraph' } ],
		newSurface = () => new ve.dm.Surface(
			ve.dm.example.createExampleDocumentFromData( origData )
		),
		surface = newSurface(),
		emptyStore = new ve.dm.HashValueStore(),
		doc = surface.documentModel,
		b = ve.dm.example.bold,
		bHash = [ ve.dm.example.boldHash ],
		TxInsert = ve.dm.TransactionBuilder.static.newFromInsertion,
		change = new ve.dm.Change( 0, [
			TxInsert( doc, 1, [ [ 'f', bHash ] ] ),
			// Second insert is too short, as first insert wasn't applied to the doc
			TxInsert( doc, 2, [ [ 'u', bHash ] ] )
		], [ new ve.dm.HashValueStore( [ b ] ), emptyStore ], {} ),
		simpleChange = new ve.dm.Change( 0, [ TxInsert( doc, 1, [ 'a' ] ) ], [ emptyStore ], {} ),
		serialized = {
			start: 0,
			transactions: [
				[ 1, [ '', [ [ 'f', bHash ] ] ], 4 ],
				'u'
			],
			stores: [
				{
					hashStore: {
						[ ve.dm.example.boldHash ]: {
							type: 'plain',
							value: {
								type: 'textStyle/bold',
								attributes: { nodeName: 'b' }
							}
						}
					},
					hashes: bHash
				},
				null
			]
		},
		simpleSerialized = {
			start: 0,
			transactions: [ [ 1, [ '', 'a' ], 4 ] ]
		},
		unsanitized = {
			start: 0,
			transactions: [ { a: 'fred', o: [ 2 ] } ],
			stores: [ { hashes: [ 'xx' ], hashStore: { xx: {
				type: 'domNodes',
				value: '<script></script><p onclick="alert(\'gotcha!\')"></p>'
			} } } ]
		},
		sanitized = {
			start: 0,
			transactions: [ { a: 'fred', o: [ 2 ] } ],
			stores: [ { hashes: [ 'xx' ], hashStore: { xx: {
				type: 'domNodes',
				value: '<p></p>'
			} } } ]
		};

	// Fixup second insert
	change.transactions[ 1 ].operations[ 2 ].length += 1;

	assert.deepEqual( change.toJSON(), serialized, 'Serialize' );
	assert.deepEqual(
		JSON.parse( JSON.stringify( { change: change } ) ),
		{ change: serialized },
		'Serialize with JSON.stringify while nested (ensure arguments are no passed to serialize)'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( serialized ).toJSON(),
		serialized,
		'Deserialize and reserialize'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( serialized, true ).getStores().map( ( store ) => store.hashStore ),
		serialized.stores.map( ( store ) => store ? store.hashStore : {} ),
		'Deserialize, preserving store values'
	);

	assert.notDeepEqual(
		ve.dm.Change.static.deserialize( serialized ).getStores().map( ( store ) => store.hashStore ),
		serialized.stores.map( ( store ) => store ? store.hashStore : {} ),
		'Deserialize, not preserving store values'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( serialized, true ).serialize( true ),
		serialized,
		'Deserialize and reserialize, preserving store values'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( unsanitized ).toJSON(),
		sanitized,
		'Unsanitized round trips into sanitized'
	);

	assert.deepEqual(
		ve.dm.Change.static.unsafeDeserialize( unsanitized ).toJSON(),
		unsanitized,
		'Unsanitized round trips into unsanitized in unsafe mode'
	);

	assert.deepEqual( simpleChange.toJSON(), simpleSerialized, 'Serialize (simple)' );

	assert.deepEqual(
		ve.dm.Change.static.deserialize( simpleSerialized ).toJSON(),
		simpleSerialized,
		'Deserialize and reserialize (simple)'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( simpleSerialized, true ).getStores().map( ( store ) => store.hashStore ),
		[ {} ],
		'Deserialize, preserving store values (simple)'
	);

} );

QUnit.test( 'Minified serialization', ( assert ) => {
	const serialized = {
		start: 0,
		transactions: [
			// Type some individual code units
			[ 1, [ '', 'T' ], 3 ],
			'h', 'e', ' ', 'r', 'e',
			// Type in whole words like some IMEs
			'd panda jumps over', 'the ', 'automaton',
			// Italicize some text
			[
				5,
				{
					type: 'annotate',
					method: 'set',
					bias: 'start',
					index: ve.dm.example.italicHash
				},
				9,
				{
					type: 'annotate',
					method: 'set',
					bias: 'stop',
					index: ve.dm.example.italicHash
				},
				28
			],
			// Type over the italicized text
			[
				5,
				[
					[
						...ve.dm.example.annotateText( 'red panda', ve.dm.example.italicHash )
					],
					[
						[ 'q', [ ve.dm.example.italicHash ] ]
					]
				],
				28
			],
			'u', 'i', 'c', 'k', ' ', 'bro', 'wn ', 'fox',
			// Bold some text
			[
				36,
				{
					type: 'annotate',
					method: 'set',
					bias: 'start',
					index: ve.dm.example.boldHash
				},
				9,
				{
					type: 'annotate',
					method: 'set',
					bias: 'stop',
					index: ve.dm.example.boldHash
				},
				3
			],
			// Type over the bolded text
			[
				36,
				[
					[
						...ve.dm.example.annotateText( 'automaton', ve.dm.example.boldHash )
					],
					[
						[ 'l', [ ve.dm.example.boldHash ] ]
					]
				],
				3
			],
			'a', 'z', 'y', ' ', 'd', 'o', 'g', '.'
		],
		stores: [
			null, null, null, null, null, null, null, null, null,
			{
				hashes: [ ve.dm.example.italicHash ],
				hashStore: {
					[ ve.dm.example.italicHash ]: {
						type: 'annotation',
						value: ve.dm.example.italic
					}
				}
			},
			null, null, null, null, null, null, null, null, null,
			{
				hashes: [ ve.dm.example.boldHash ],
				hashStore: {
					[ ve.dm.example.boldHash ]: {
						type: 'annotation',
						value: ve.dm.example.bold
					}
				}
			},
			null, null, null, null, null, null, null, null, null
		]
	};

	const deserialized = ve.dm.Change.static.deserialize( serialized );
	assert.deepEqual(
		deserialized.toJSON(),
		serialized,
		'Deserialize-serialize round trip'
	);
} );

QUnit.test( 'Same-offset typing', ( assert ) => {
	const surface = new ve.dm.Surface( ve.dm.example.createExampleDocumentFromData( [
			{ type: 'paragraph' },
			{ type: '/paragraph' },
			{ type: 'internalList' }, { type: '/internalList' }
		] ) ),
		emptyStore = new ve.dm.HashValueStore(),
		doc = surface.documentModel,
		saved = doc.completeHistory.toJSON(),
		clear = () => {
			doc.getChangeSince( 0 ).reversed().applyTo( surface );
			doc.completeHistory = ve.dm.Change.static.deserialize( saved );
			doc.store = doc.completeHistory.store;
		},
		TxInsert = ve.dm.TransactionBuilder.static.newFromInsertion;

	// 'ab' and 'cd' typed at the same offset
	const a = new ve.dm.Change( 0, [ TxInsert( doc, 1, [ 'a' ] ) ], [ emptyStore ], {} );
	a.transactions[ 0 ].authorId = 1;
	a.applyTo( surface );
	const b = new ve.dm.Change( 1, [ TxInsert( doc, 2, [ 'b' ] ) ], [ emptyStore ], {} );
	b.transactions[ 0 ].authorId = 1;
	clear();
	const c = new ve.dm.Change( 0, [ TxInsert( doc, 1, [ 'c' ] ) ], [ emptyStore ], {} );
	c.transactions[ 0 ].authorId = 2;
	c.applyTo( surface );
	const d = new ve.dm.Change( 1, [ TxInsert( doc, 2, [ 'd' ] ) ], [ emptyStore ], {} );
	d.transactions[ 0 ].authorId = 2;
	c.reversed().applyTo( surface );

	const cases = [
		{
			message: 'a on c',
			change: a.rebasedOnto( c ),
			expected: { before: 1, insert: 'a', after: 4 }
		},
		{
			message: 'c on a',
			change: c.rebasedOnto( a ),
			expected: { before: 2, insert: 'c', after: 3 }
		},
		{
			message: 'b on ( c on a )',
			change: b.rebasedOnto( c.rebasedOnto( a ) ),
			expected: { before: 2, insert: 'b', after: 4 }
		},
		{
			message: 'd on ( a on c )',
			change: d.rebasedOnto( a.rebasedOnto( c ) ),
			expected: { before: 3, insert: 'd', after: 3 }
		},
		{
			message: 'b on ( c+d on a )',
			change: b.rebasedOnto( c.concat( d ).rebasedOnto( a ) ),
			expected: { before: 2, insert: 'b', after: 5 }
		},
		{
			message: 'd on ( a+b on c )',
			change: d.rebasedOnto( a.concat( b ).rebasedOnto( c ) ),
			expected: { before: 4, insert: 'd', after: 3 }
		}
	];

	cases.forEach( ( caseItem ) => {
		const operations = caseItem.change.transactions[ 0 ].operations;
		assert.deepEqual( {
			before: operations[ 0 ].length,
			insert: operations[ 1 ].insert[ 0 ],
			after: operations[ 2 ].length
		}, caseItem.expected, caseItem.message );
	} );

	// Check that the order of application doesn't matter
	const expected = [ { type: 'paragraph' }, ...'abcd', { type: '/paragraph' }, { type: 'internalList' }, { type: '/internalList' } ];

	clear();
	surface.setLinearSelection( new ve.Range( 1 ) );
	a.applyTo( surface );
	b.applyTo( surface );
	c.rebasedOnto( a.concat( b ) ).applyTo( surface );
	d.rebasedOnto( a.concat( b ).rebasedOnto( c ) ).applyTo( surface );
	assert.deepEqual( doc.data.data, expected, 'a,b,c,d' );
	assert.equalRange(
		surface.getSelection().getRange(),
		new ve.Range( 1 ),
		'a,b,c,d range'
	);

	clear();
	a.applyTo( surface );
	c.rebasedOnto( a ).applyTo( surface );
	b.rebasedOnto( c.rebasedOnto( a ) ).applyTo( surface );
	d.rebasedOnto( a.concat( b ).rebasedOnto( c ) ).applyTo( surface );
	assert.deepEqual( doc.data.data, expected, 'a,c,b,d' );

	clear();
	a.applyTo( surface );
	c.rebasedOnto( a ).applyTo( surface );
	d.rebasedOnto( a.rebasedOnto( c ) ).applyTo( surface );
	b.rebasedOnto( c.concat( d ).rebasedOnto( a ) ).applyTo( surface );
	assert.deepEqual( doc.data.data, expected, 'a,c,d,b' );

	clear();
	c.applyTo( surface );
	a.rebasedOnto( c ).applyTo( surface );
	d.rebasedOnto( a.rebasedOnto( c ) ).applyTo( surface );
	b.rebasedOnto( c.concat( d ).rebasedOnto( a ) ).applyTo( surface );
	assert.deepEqual( doc.data.data, expected, 'c,a,d,b' );

	clear();
	c.applyTo( surface );
	d.applyTo( surface );
	a.rebasedOnto( c.concat( d ) ).applyTo( surface );
	b.rebasedOnto( c.concat( d ).rebasedOnto( a ) ).applyTo( surface );
	assert.deepEqual( doc.data.data, expected, 'c,d,a,b' );

} );
