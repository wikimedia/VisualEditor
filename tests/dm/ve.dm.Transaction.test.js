/*!
 * VisualEditor DataModel Transaction tests.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.Transaction' );

/* Helper methods */

/* Tests */
// TODO: Change the variable names to reflect the use of TransactionBuilder

QUnit.test( 'translateOffset', function ( assert ) {
	var tx, mapping, offset, expected,
		doc = new ve.dm.Document( '-----defg---h--'.split( '' ) ),
		txBuilder = new ve.dm.TransactionBuilder();

	txBuilder.pushReplacement( doc, 0, 0, [ 'a', 'b', 'c' ] );
	txBuilder.pushRetain( 5 );
	txBuilder.pushReplacement( doc, 5, 4, [] );
	txBuilder.pushRetain( 2 );
	txBuilder.pushStartAnnotating( 'set', { type: 'textStyle/bold' } );
	txBuilder.pushRetain( 1 );
	txBuilder.pushReplacement( doc, 12, 1, [ 'i', 'j', 'k', 'l', 'm' ] );
	txBuilder.pushRetain( 2 );
	txBuilder.pushReplacement( doc, 15, 0, [ 'n', 'o', 'p' ] );
	tx = txBuilder.getTransaction();

	mapping = {
		0: [ 0, 3 ],
		1: 4,
		2: 5,
		3: 6,
		4: 7,
		5: 8,
		6: 8,
		7: 8,
		8: 8,
		9: 8,
		10: 9,
		11: 10,
		12: 11,
		13: [ 12, 16 ],
		14: 17,
		15: [ 18, 21 ],
		16: 22
	};
	QUnit.expect( 2 * Object.keys( mapping ).length );
	for ( offset in mapping ) {
		expected = Array.isArray( mapping[ offset ] ) ? mapping[ offset ] : [ mapping[ offset ], mapping[ offset ] ];
		assert.strictEqual( tx.translateOffset( Number( offset ) ), expected[ 1 ], offset );
		assert.strictEqual( tx.translateOffset( Number( offset ), true ), expected[ 0 ], offset + ' (excludeInsertion)' );
	}
} );

QUnit.test( 'translateRange', function ( assert ) {
	var tx, i, cases,
		doc = ve.dm.example.createExampleDocument(),
		txBuilder = new ve.dm.TransactionBuilder();
	txBuilder.pushRetain( 55 );
	txBuilder.pushReplacement( doc, 55, 0, [ { type: 'list', attributes: { style: 'number' } } ] );
	txBuilder.pushReplacement( doc, 55, 0, [ { type: 'listItem' } ] );
	txBuilder.pushRetain( 3 );
	txBuilder.pushReplacement( doc, 58, 0, [ { type: '/listItem' } ] );
	txBuilder.pushReplacement( doc, 58, 0, [ { type: 'listItem' } ] );
	txBuilder.pushRetain( 3 );
	txBuilder.pushReplacement( doc, 61, 0, [ { type: '/listItem' } ] );
	txBuilder.pushReplacement( doc, 61, 0, [ { type: '/list' } ] );
	tx = txBuilder.getTransaction();

	cases = [
		{
			before: new ve.Range( 55, 61 ),
			after: new ve.Range( 55, 67 ),
			msg: 'Wrapped range is translated to outer range'
		},
		{
			before: new ve.Range( 54, 62 ),
			after: new ve.Range( 54, 68 ),
			msg: 'Wrapped range plus one each side is translated to outer range plus one each side'
		},
		{
			before: new ve.Range( 54, 61 ),
			after: new ve.Range( 54, 67 ),
			msg: 'Wrapped range plus one on the left'
		},
		{
			before: new ve.Range( 55, 62 ),
			after: new ve.Range( 55, 68 ),
			msg: 'wrapped range plus one on the right'
		}
	];
	QUnit.expect( cases.length * 2 );

	for ( i = 0; i < cases.length; i++ ) {
		assert.equalRange( tx.translateRange( cases[ i ].before ), cases[ i ].after, cases[ i ].msg );
		assert.equalRange( tx.translateRange( cases[ i ].before.flip() ), cases[ i ].after.flip(), cases[ i ].msg + ' (reversed)' );
	}
} );

QUnit.test( 'getModifiedRange', function ( assert ) {
	var i, j, len, txBuilder,
		doc = ve.dm.example.createExampleDocument(),
		cases = [
			{
				calls: [
					[ 'pushRetain', 5 ]
				],
				range: null,
				msg: 'no-op transaction returns null'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplacement', doc, 5, 0, [ 'a', 'b', 'c' ] ],
					[ 'pushRetain', 42 ]
				],
				range: new ve.Range( 5, 8 ),
				msg: 'simple insertion returns range covering new content'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplacement', doc, 5, 13, [] ],
					[ 'pushRetain', 42 ]
				],
				range: new ve.Range( 5 ),
				msg: 'simple removal returns zero-length range at removal'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplacement', doc, 5, 3, [ 'a', 'b', 'c', 'd' ] ],
					[ 'pushRetain', 42 ]
				],
				range: new ve.Range( 5, 9 ),
				msg: 'simple replacement returns range covering new content (1)'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplacement', doc, 5, 13, [ 'a', 'b', 'c', 'd' ] ],
					[ 'pushRetain', 42 ]
				],
				range: new ve.Range( 5, 9 ),
				msg: 'simple replacement returns range covering new content (2)'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplacement', doc, 5, 3, [] ],
					[ 'pushRetain', 42 ],
					[ 'pushReplacement', doc, 50, 0, [ 'h', 'e', 'l', 'l', 'o' ] ],
					[ 'pushRetain', 108 ]
				],
				range: new ve.Range( 5, 52 ),
				msg: 'range covers two operations with retain in between'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplacement', doc, 5, 3, [ 'a', 'b', 'c', 'd' ] ],
					[ 'pushRetain', 54 ],
					[ 'pushReplacement', doc, 62, 0, [ 'h', 'e', 'l', 'l', 'o' ] ],
					[ 'pushRetain', 1 ]
				],
				range: new ve.Range( 5, 9 ),
				msg: 'range ignores internalList changes'
			},
			{
				calls: [
					[ 'pushReplacement', doc, 0, 3, [] ]
				],
				range: new ve.Range( 0 ),
				msg: 'removal without retains'
			},
			{
				calls: [
					[ 'pushReplacement', doc, 0, 0, [ 'a', 'b', 'c' ] ]
				],
				range: new ve.Range( 0, 3 ),
				msg: 'insertion without retains'
			},
			{
				calls: [
					[ 'pushRetain', 5 ],
					[ 'pushReplaceElementAttribute', 'style', 'bullet', 'number' ]
				],
				range: new ve.Range( 5, 6 ),
				msg: 'single attribute change'
			},
			{
				calls: [
					[ 'pushReplaceElementAttribute', 'style', 'bullet', 'number' ],
					[ 'pushRetain', 42 ],
					[ 'pushReplaceElementAttribute', 'style', 'bullet', 'number' ]
				],
				range: new ve.Range( 0, 43 ),
				msg: 'two attribute changes'
			}
		];

	QUnit.expect( cases.length );
	for ( i = 0, len = cases.length; i < len; i++ ) {
		txBuilder = new ve.dm.TransactionBuilder();
		for ( j = 0; j < cases[ i ].calls.length; j++ ) {
			txBuilder[ cases[ i ].calls[ j ][ 0 ] ].apply( txBuilder, cases[ i ].calls[ j ].slice( 1 ) );
		}
		assert.equalRange( txBuilder.getTransaction().getModifiedRange( doc ), cases[ i ].range, cases[ i ].msg );
	}
} );
