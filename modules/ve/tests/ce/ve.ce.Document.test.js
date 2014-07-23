/*!
 * VisualEditor ContentEditable Document tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.Document' );

/* Tests */

QUnit.test( 'getRelativeOffset', function ( assert ) {
	var documentModel = ve.dm.example.createExampleDocument( 'alienData' ),
		surface = ve.test.utils.createSurfaceFromDocument( documentModel ),
		documentView = surface.getView().getDocument(),
		tests = [
			{
				direction: 1,
				unit: 'character',
				cases: [
					{ input: 0, output: 1 },
					{ input: 2, output: 3 },
					{ input: 3, output: 4 },
					{ input: 4, output: 5 },
					{ input: 6, output: 7 },
					{ input: 7, output: 9 },
					{ input: 10, output: 10 }
				]
			},
			{
				direction: 1,
				unit: 'word',
				cases: [
					{ input: 0, output: 1 },
					{ input: 2, output: 3 },
					{ input: 3, output: 4 },
					{ input: 4, output: 5 },
					{ input: 6, output: 7 },
					{ input: 7, output: 9 },
					{ input: 10, output: 10 }
				]
			},
			{
				direction: -1,
				unit: 'character',
				cases: [
					{ input: 10, output: 9 },
					{ input: 8, output: 7 },
					{ input: 7, output: 6 },
					{ input: 6, output: 5 },
					{ input: 4, output: 3 },
					{ input: 3, output: 1 },
					{ input: 0, output: 0 }
				]
			},
			{
				direction: -1,
				unit: 'word',
				cases: [
					{ input: 10, output: 9 },
					{ input: 8, output: 7 },
					{ input: 7, output: 6 },
					{ input: 6, output: 5 },
					{ input: 4, output: 3 },
					{ input: 3, output: 1 },
					{ input: 0, output: 0 }
				]
			}
		], i, j, expectCount = 0;
	for ( i = 0; i < tests.length; i++ ) {
		for ( j = 0; j < tests[i].cases.length; j++ ) {
			assert.equal(
				documentView.getRelativeOffset(
					tests[i].cases[j].input,
					tests[i].direction,
					tests[i].unit
				),
				tests[i].cases[j].output,
				tests[i].cases[j].input + ', ' + tests[i].direction + ', ' + tests[i].unit
			);
		}
		expectCount += tests[i].cases.length;
	}
	QUnit.expect( expectCount );
	surface.destroy();
} );

QUnit.test( 'getRelativeRange', function ( assert ) {
	var documentModel, surface, documentView, i, j, expectCount = 0,
		tests = [
			{
				data: [
					/* 0 */ { type: 'paragraph' },
					/* 1 */ 'a',
					/* 2 */ { type: 'alienInline' },
					/* 3 */ { type: '/alienInline' },
					/* 4 */ 'b',
					/* 5 */ { type: '/paragraph' }
				],
				cases: [
					{
						direction: 1,
						given: new ve.Range( 1 ),
						expected: new ve.Range( 2 )
					},
					{
						direction: 1,
						given: new ve.Range( 2 ),
						expected: new ve.Range( 2, 4 )
					},
					{
						direction: 1,
						given: new ve.Range( 2, 4 ),
						expected: new ve.Range( 4 )
					},

					{
						direction: 1,
						expand: true,
						given: new ve.Range( 1 ),
						expected: new ve.Range( 1, 2 )
					},
					{
						direction: 1,
						expand: true,
						given: new ve.Range( 1, 2 ),
						expected: new ve.Range( 1, 4 )
					},
					{
						direction: 1,
						expand: true,
						given: new ve.Range( 1, 4 ),
						expected: new ve.Range( 1, 5 )
					}
				]
			},
			{
				data: [
					/* 0 */ { type: 'paragraph' },
					/* 1 */ { type: 'alienInline' },
					/* 2 */ { type: '/alienInline' },
					/* 3 */ { type: 'alienInline' },
					/* 4 */ { type: '/alienInline' },
					/* 5 */ { type: '/paragraph' }
				],
				cases: [
					{
						direction: 1,
						given: new ve.Range( 3 ),
						expected: new ve.Range( 3, 5 )
					},
					{
						direction: 1,
						expand: true,
						given: new ve.Range( 1, 3 ),
						expected: new ve.Range( 1, 5 )
					},
					{
						direction: -1,
						expand: true,
						given: new ve.Range( 1, 5 ),
						expected: new ve.Range( 1, 3 )
					},
					{
						direction: 1,
						expand: true,
						given: new ve.Range( 5, 1 ),
						expected: new ve.Range( 5, 3 )
					}
				]
			},
			{
				data: ve.copy( ve.dm.example.alienData ),
				cases: [
					{
						direction: 1,
						given: new ve.Range( 0 ),
						expected: new ve.Range( 0, 2 )
					},
					{
						direction: 1,
						given: new ve.Range( 0, 2 ),
						expected: new ve.Range( 3 )
					},
					{
						direction: 1,
						given: new ve.Range( 3 ),
						expected: new ve.Range( 4 )
					},
					{
						direction: 1,
						given: new ve.Range( 4 ),
						expected: new ve.Range( 4, 6 )
					},
					{
						direction: 1,
						given: new ve.Range( 4, 6),
						expected: new ve.Range( 6 )
					},
					{
						direction: 1,
						given: new ve.Range( 6 ),
						expected: new ve.Range( 7 )
					},
					{
						direction: 1,
						given: new ve.Range( 7 ),
						expected: new ve.Range( 8, 10 )
					},
					{
						direction: 1,
						given: new ve.Range( 10 ),
						expected: new ve.Range( 10 )
					},
					{
						direction: -1,
						given: new ve.Range( 10 ),
						expected: new ve.Range( 10, 8 )
					},
					{
						direction: -1,
						given: new ve.Range( 10, 8 ),
						expected: new ve.Range( 7 )
					},
					{
						direction: -1,
						given: new ve.Range( 7 ),
						expected: new ve.Range( 6 )
					},
					{
						direction: -1,
						given: new ve.Range( 6 ),
						expected: new ve.Range( 6, 4 )
					},
					{
						direction: -1,
						given: new ve.Range( 6, 4 ),
						expected: new ve.Range( 4 )
					},
					{
						direction: -1,
						given: new ve.Range( 4 ),
						expected: new ve.Range( 3 )
					},
					{
						direction: -1,
						given: new ve.Range( 3 ),
						expected: new ve.Range( 2, 0 )
					},
					{
						direction: -1,
						given: new ve.Range( 2, 0 ),
						expected: new ve.Range( 0 )
					}
				]
			}
		];
	for ( i = 0; i < tests.length; i++ ) {
		documentModel = new ve.dm.Document( tests[i].data );
		surface = ve.test.utils.createSurfaceFromDocument( documentModel );
		documentView = surface.getView().getDocument();
		for ( j = 0; j < tests[i].cases.length; j++ ) {
			expectCount++;
			assert.equalRange(
				documentView.getRelativeRange(
					tests[i].cases[j].given,
					tests[i].cases[j].direction,
					'character',
					!!tests[i].cases[j].expand
				),
				tests[i].cases[j].expected,
				'Test document ' + i +
				', range ' + tests[i].cases[j].given.toJSON() +
				', direction ' + tests[i].cases[j].direction
			);
		}
		surface.destroy();
	}
	QUnit.expect( expectCount );
} );
