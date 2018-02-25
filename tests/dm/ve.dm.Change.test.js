/*!
 * VisualEditor DataModel Change tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.Change' );

QUnit.test( 'rebaseTransactions', function ( assert ) {
	var rebased,
		doc = ve.dm.example.createExampleDocument(),
		bold = ve.dm.example.createAnnotation( ve.dm.example.bold ),
		replace12 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 1, 2 ), [ 'f', 'o', 'o' ] ),
		replace23 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 2, 3 ), [ 'b', 'a', 'r' ] ),
		replace13 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 1, 3 ), [ 'b', 'a', 'z' ] ),
		replace24 = ve.dm.TransactionBuilder.static.newFromReplacement( doc, new ve.Range( 2, 4 ), [ 'q', 'u', 'x' ] ),
		insert1X = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ 'x' ] ),
		insert1Y = ve.dm.TransactionBuilder.static.newFromInsertion( doc, 1, [ 'y' ] ),
		annotate12 = ve.dm.TransactionBuilder.static.newFromAnnotation( doc, new ve.Range( 1, 2 ), 'set', bold ),
		rebasedOnto = function ( tx1, tx2 ) {
			return ve.dm.Change.static.rebaseTransactions( tx1, tx2 )[ 0 ];
		};
	assert.deepEqual( rebasedOnto( replace23, replace12 ).operations, [
		{
			type: 'retain',
			length: 4
		},
		{
			type: 'replace',
			remove: [ [ 'b', [ ve.dm.example.boldIndex ] ] ],
			insert: [ 'b', 'a', 'r' ]
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
			insert: [ 'f', 'o', 'o' ]
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
			insert: [ 'f', 'o', 'o' ]
		},
		{
			type: 'retain',
			length: 63
		}
	], 'Rebase onto downwind replace' );

	assert.deepEqual( rebasedOnto( replace24, annotate12 ).operations, replace24.operations, 'Rebase onto upwind annotate' );

	assert.deepEqual( rebasedOnto( replace12, annotate12 ), null, 'Rebase conflict with overlapping annotate' );
	assert.deepEqual( rebasedOnto( replace12, replace13 ), null, 'Rebase conflict with surrounding replace' );
	assert.deepEqual( rebasedOnto( replace13, replace12 ), null, 'Rebase conflict with surrounded replace' );
	assert.deepEqual( rebasedOnto( replace13, replace24 ), null, 'Rebase conflict with overlapping downwind replace' );
	assert.deepEqual( rebasedOnto( replace24, replace13 ), null, 'Rebase conflict with overlapping upwind replace' );

	assert.deepEqual(
		rebasedOnto( rebasedOnto( replace12, replace23 ), replace23.reversed() ).operations,
		replace12.operations,
		'Inverse rebase'
	);

	rebased = ve.dm.Change.static.rebaseTransactions( insert1X, insert1Y );
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

QUnit.test( 'Change operations', function ( assert ) {
	var change, replace2, remove2,
		origData = [ { type: 'paragraph' }, 't', 'h', 'r', 'e', 'e', { type: '/paragraph' } ],
		newSurface = function () {
			return new ve.dm.Surface(
				ve.dm.example.createExampleDocumentFromData( origData )
			);
		},
		noVals = new ve.dm.IndexValueStore(),
		surface = newSurface(),
		doc = surface.documentModel,
		b = ve.dm.example.bold,
		i = ve.dm.example.italic,
		u = ve.dm.example.underline,
		bIndex = [ ve.dm.example.boldIndex ],
		iIndex = [ ve.dm.example.italicIndex ],
		uIndex = [ ve.dm.example.underlineIndex ],
		TxInsert = ve.dm.TransactionBuilder.static.newFromInsertion,
		TxReplace = ve.dm.TransactionBuilder.static.newFromReplacement,
		TxRemove = ve.dm.TransactionBuilder.static.newFromRemoval,
		TxAnnotate = ve.dm.TransactionBuilder.static.newFromAnnotation,
		insert1 = new ve.dm.Change( 0, [
			TxInsert( doc, 1, [ [ 'o', bIndex ] ] ),
			TxInsert( doc, 2, [ [ 'n', bIndex ] ] ),
			TxInsert( doc, 3, [ [ 'e', bIndex ] ] ),
			TxInsert( doc, 4, [ ' ' ] )
		], [ new ve.dm.IndexValueStore( [ b ] ), noVals, noVals, noVals ], {
			1: new ve.dm.LinearSelection( doc, new ve.Range( 7, 7 ) )
		} ),
		insert2 = new ve.dm.Change( 0, [
			TxInsert( doc, 1, [ [ 't', iIndex ] ] ),
			TxInsert( doc, 2, [ [ 'w', iIndex ] ] ),
			TxInsert( doc, 3, [ [ 'o', iIndex ] ] ),
			TxInsert( doc, 4, [ ' ' ] )
		], [ new ve.dm.IndexValueStore( [ i ] ), noVals, noVals, noVals ], {
			2: new ve.dm.LinearSelection( doc, new ve.Range( 1, 1 ) )
		} ),
		underline3 = new ve.dm.Change( 0, [
			TxAnnotate( doc, new ve.Range( 1, 6 ), 'set', u )
		], [ new ve.dm.IndexValueStore( [ u ] ) ], {} );

	insert2.applyTo( surface );
	assert.deepEqual(
		doc.data.data.slice( 1, -1 ),
		[ [ 't', iIndex ], [ 'w', iIndex ], [ 'o', iIndex ], ' ', 't', 'h', 'r', 'e', 'e' ],
		'Apply insert2'
	);

	replace2 = new ve.dm.Change( 4, [
		TxReplace( doc, new ve.Range( 1, 4 ), [ 'T', 'W', 'O' ] )
	], [ noVals ], {} );

	remove2 = new ve.dm.Change( 4, [
		TxRemove( doc, new ve.Range( 1, 4 ) )
	], [ noVals ], {} );

	change = insert2.reversed();
	assert.deepEqual( change.start, 4, 'start for insert2.reversed()' );
	change.applyTo( surface );
	assert.deepEqual( doc.data.data, origData, 'Apply insert2.reversed()' );

	surface = newSurface();
	change = insert1.concatRebased( insert2 );
	change.applyTo( surface );
	assert.deepEqual(
		surface.documentModel.data.data.slice( 1, -1 ),
		[
			[ 'o', bIndex ],
			[ 'n', bIndex ],
			[ 'e', bIndex ],
			' ',
			[ 't', iIndex ],
			[ 'w', iIndex ],
			[ 'o', iIndex ],
			' ',
			't',
			'h',
			'r',
			'e',
			'e'
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
			[ 'o', bIndex ],
			[ 'n', bIndex ],
			[ 'e', bIndex ],
			' ',
			'T',
			'W',
			'O',
			' ',
			[ 't', uIndex ],
			[ 'h', uIndex ],
			[ 'r', uIndex ],
			[ 'e', uIndex ],
			[ 'e', uIndex ]
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

	assert.deepEqual(
		{ type: 'range', from: 1, to: 1 },
		ve.dm.Change.static.rebaseUncommittedChange( insert1, insert2 ).rebased.selections[ 2 ].range.toJSON(),
		'Selection before insertion is not adjusted when rebasing (1)'
	);

	assert.deepEqual(
		{ type: 'range', from: 1, to: 1 },
		ve.dm.Change.static.rebaseUncommittedChange( insert2, insert1 ).transposedHistory.selections[ 2 ].range.toJSON(),
		'Selection before insertion is not adjusted when rebasing (2)'
	);

	assert.deepEqual(
		ve.dm.Change.static.rebaseUncommittedChange( insert1, insert2 ).transposedHistory.selections[ 1 ].range.toJSON(),
		{ type: 'range', from: 11, to: 11 },
		'Selection after insertion is adjusted when rebasing (1)'
	);

	assert.deepEqual(
		ve.dm.Change.static.rebaseUncommittedChange( insert2, insert1 ).rebased.selections[ 1 ].range.toJSON(),
		{ type: 'range', from: 11, to: 11 },
		'Selection after insertion is adjusted when rebasing (2)'
	);
} );

QUnit.test( 'Rebase with conflicting annotations', function ( assert ) {
	var setBold, remove, result,
		origData = [ { type: 'paragraph' }, 'A', { type: '/paragraph' } ],
		newSurface = function () {
			return new ve.dm.Surface(
				ve.dm.example.createExampleDocumentFromData( origData )
			);
		},
		surface = newSurface(),
		doc = surface.documentModel,
		TxRemove = ve.dm.TransactionBuilder.static.newFromRemoval,
		TxAnnotate = ve.dm.TransactionBuilder.static.newFromAnnotation,
		b = ve.dm.example.bold,
		emptyStore = new ve.dm.IndexValueStore(),
		bStore = new ve.dm.IndexValueStore( [ b ] );

	assert.expect( 3 );

	// Canonical history: text gets removed
	remove = new ve.dm.Change( 1, [ TxRemove( doc, new ve.Range( 1, 2 ) ) ], [ emptyStore ], {} );
	// Doomed conflicting history: text gets bolded
	setBold = new ve.dm.Change( 1, [ TxAnnotate( doc, new ve.Range( 1, 2 ), 'set', b ) ], [ bStore ], {} );
	result = ve.dm.Change.static.rebaseUncommittedChange( remove, setBold );
	assert.deepEqual(
		result.rebased.serialize(),
		new ve.dm.Change( 2, [], [], {} ).serialize(),
		'Nothing got rebased'
	);
	assert.deepEqual(
		result.rejected.serialize(),
		setBold.serialize(),
		'setBold got rejected'
	);
	assert.deepEqual(
		result.transposedHistory.serialize(),
		remove.serialize(),
		'remove got transposed'
	);
} );

QUnit.test( 'Serialize/deserialize', function ( assert ) {
	var origData = [ { type: 'paragraph' }, 'b', 'a', 'r', { type: '/paragraph' } ],
		newSurface = function () {
			return new ve.dm.Surface(
				ve.dm.example.createExampleDocumentFromData( origData )
			);
		},
		surface = newSurface(),
		noVals = new ve.dm.IndexValueStore(),
		doc = surface.documentModel,
		b = ve.dm.example.bold,
		bIndex = [ ve.dm.example.boldIndex ],
		TxInsert = ve.dm.TransactionBuilder.static.newFromInsertion,
		change = new ve.dm.Change( 0, [
			TxInsert( doc, 1, [ [ 'f', bIndex ] ] ),
			// Second insert is too short, as first insert wasn't applied to the doc
			TxInsert( doc, 2, [ [ 'u', bIndex ] ] )
		], [ new ve.dm.IndexValueStore( [ b ] ), noVals ], {} ),
		serialized = {
			start: 0,
			transactions: [
				{
					authorId: null,
					operations: [ 1, [ '', [ [ 'f', bIndex ] ] ], 4 ]
				},
				{
					authorId: null,
					operations: [ 2, [ '', [ [ 'u', bIndex ] ] ], 4 ]
				}
			],
			stores: [
				{
					hashStore: {
						h49981eab0f8056ff: {
							type: 'plain',
							value: {
								type: 'textStyle/bold',
								attributes: { nodeName: 'b' }
							}
						}
					},
					hashes: bIndex
				},
				null
			],
			selections: {}
		},
		unsanitized = {
			start: 0,
			transactions: [ { authorId: 'fred', operations: [ 2 ] } ],
			stores: [ { hashes: [ 'xx' ], hashStore: { xx: {
				type: 'domNodeArray',
				value: [
					'<script></script>',
					'<p onclick="alert(\'gotcha!\')"></p>'
				]
			} } } ],
			selections: {}
		},
		sanitized = {
			start: 0,
			transactions: [ { authorId: 'fred', operations: [ 2 ] } ],
			stores: [ { hashes: [ 'xx' ], hashStore: { xx: {
				type: 'domNodeArray',
				value: [
					'<p></p>'
				]
			} } } ],
			selections: {}
		};

	// Fixup second insert
	change.transactions[ 1 ].operations[ 2 ].length += 1;

	assert.deepEqual( change.serialize(), serialized, 'Serialize' );

	assert.deepEqual(
		ve.dm.Change.static.deserialize( serialized, doc ).serialize(),
		serialized,
		'Deserialize and reserialize'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( serialized, doc, true ).stores.map( function ( store ) {
			return store.hashStore;
		} ),
		serialized.stores.map( function ( store ) {
			return store ? store.hashStore : {};
		} ),
		'Deserialize, preserving store values'
	);

	assert.notDeepEqual(
		ve.dm.Change.static.deserialize( serialized, doc ).stores.map( function ( store ) {
			return store.hashStore;
		} ),
		serialized.stores.map( function ( store ) {
			return store ? store.hashStore : {};
		} ),
		'Deserialize, not preserving store values'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( serialized, doc, true ).serialize( true ),
		serialized,
		'Deserialize and reserialize, preserving store values'
	);

	assert.deepEqual(
		ve.dm.Change.static.deserialize( unsanitized ).serialize(),
		sanitized,
		'Unsanitized round trips into sanitized'
	);
} );

QUnit.test( 'Same-offset typing', function ( assert ) {
	var a, b, c, d, tests, i, len, test, operations, expected,
		surface = new ve.dm.Surface( ve.dm.example.createExampleDocumentFromData( [
			{ type: 'paragraph' },
			{ type: '/paragraph' }
		] ) ),
		noVals = new ve.dm.IndexValueStore(),
		doc = surface.documentModel,
		clear = function () {
			surface.change( doc.completeHistory.map( function ( tx ) {
				return tx.reversed();
			} ).reverse() );
			doc.completeHistory.length = 0;
		},
		TxInsert = ve.dm.TransactionBuilder.static.newFromInsertion;

	// 'ab' and 'cd' typed at the same offset
	a = new ve.dm.Change( 0, [ TxInsert( doc, 1, [ 'a' ] ) ], [ noVals ], {} );
	a.transactions[ 0 ].authorId = 1;
	a.applyTo( surface );
	b = new ve.dm.Change( 1, [ TxInsert( doc, 2, [ 'b' ] ) ], [ noVals ], {} );
	b.transactions[ 0 ].authorId = 1;
	clear();
	c = new ve.dm.Change( 0, [ TxInsert( doc, 1, [ 'c' ] ) ], [ noVals ], {} );
	c.transactions[ 0 ].authorId = 2;
	c.applyTo( surface );
	d = new ve.dm.Change( 1, [ TxInsert( doc, 2, [ 'd' ] ) ], [ noVals ], {} );
	d.transactions[ 0 ].authorId = 2;
	c.reversed().applyTo( surface );

	tests = [
		{
			message: 'a on c',
			change: a.rebasedOnto( c ),
			expected: { before: 1, insert: 'a', after: 2 }
		},
		{
			message: 'c on a',
			change: c.rebasedOnto( a ),
			expected: { before: 2, insert: 'c', after: 1 }
		},
		{
			message: 'b on ( c on a )',
			change: b.rebasedOnto( c.rebasedOnto( a ) ),
			expected: { before: 2, insert: 'b', after: 2 }
		},
		{
			message: 'd on ( a on c )',
			change: d.rebasedOnto( a.rebasedOnto( c ) ),
			expected: { before: 3, insert: 'd', after: 1 }
		},
		{
			message: 'b on ( c+d on a )',
			change: b.rebasedOnto( c.concat( d ).rebasedOnto( a ) ),
			expected: { before: 2, insert: 'b', after: 3 }
		},
		{
			message: 'd on ( a+b on c )',
			change: d.rebasedOnto( a.concat( b ).rebasedOnto( c ) ),
			expected: { before: 4, insert: 'd', after: 1 }
		}
	];

	for ( i = 0, len = tests.length; i < len; i++ ) {
		test = tests[ i ];
		operations = test.change.transactions[ 0 ].operations;
		assert.deepEqual( {
			before: operations[ 0 ].length,
			insert: operations[ 1 ].insert[ 0 ],
			after: operations[ 2 ].length
		}, test.expected, test.message );
	}

	// Check that the order of application doesn't matter
	expected = [ { type: 'paragraph' }, 'a', 'b', 'c', 'd', { type: '/paragraph' } ];

	clear();
	surface.setSelection( new ve.dm.LinearSelection( doc, new ve.Range( 1 ) ) );
	a.applyTo( surface );
	b.applyTo( surface );
	c.rebasedOnto( a.concat( b ) ).applyTo( surface );
	d.rebasedOnto( a.concat( b ).rebasedOnto( c ) ).applyTo( surface );
	assert.deepEqual( doc.data.data, expected, 'a,b,c,d' );
	assert.deepEqual(
		[ surface.getSelection().getRange().from, surface.getSelection().getRange().to ],
		[ 1, 1 ],
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
