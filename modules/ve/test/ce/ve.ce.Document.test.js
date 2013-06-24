/*!
 * VisualEditor ContentEditable Document tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.Document' );

/* Tests */

QUnit.test( 'getRelativeOffset', function ( assert ) {
	var documentModel = ve.dm.example.createExampleDocument( 'alienData' ),
		documentView = new ve.ce.Document( documentModel ),
		tests = [
			{
				direction: 1,
				unit: 'character',
				cases: [
					{ input: 0, output: 3 },
					{ input: 3, output: 4 },
					{ input: 4, output: 6 },
					{ input: 6, output: 7 },
					{ input: 7, output: 10 }
				]
			},
			{
				direction: 1,
				unit: 'word',
				cases: [
					{ input: 0, output: 3 },
					{ input: 3, output: 4 },
					{ input: 4, output: 6 },
					{ input: 6, output: 7 },
					{ input: 7, output: 10 }
				]
			},
			{
				direction: -1,
				unit: 'character',
				cases: [
					{ input: 10, output: 7 },
					{ input: 7, output: 6 },
					{ input: 6, output: 4 },
					{ input: 4, output: 3 },
					{ input: 3, output: 0 }
				]
			},
			{
				direction: -1,
				unit: 'word',
				cases: [
					{ input: 10, output: 7 },
					{ input: 7, output: 6 },
					{ input: 6, output: 4 },
					{ input: 4, output: 3 },
					{ input: 3, output: 0 }
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
				tests[i].cases[j].output
			);
		}
		expectCount += tests[i].cases.length;
	}
	QUnit.expect( expectCount );
} );

QUnit.test( 'getRelativeRange', function ( assert ) {
	var documentModel, documentView, i, j, expectCount = 0,
		tests = [
		{
			data: [
				/* 0 */ { type: 'mwBlockImage' },
				/* 1 */ { type: '/mwBlockImage' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 0 ),
					expected: new ve.Range( 0, 2 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 2 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 0 ),
					expected: new ve.Range( 0, 2 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 0, 2 )
				},
				{
					direction: -1,
					expand: false,
					given: new ve.Range( 2 ),
					expected: new ve.Range( 2, 0 )
				},
				{
					direction: -1,
					expand: false,
					given: new ve.Range( 2, 0 ),
					expected: new ve.Range( 0 )
				},
				{
					direction: -1,
					expand: false,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 0 )
				},
				{
					direction: -1,
					expand: true,
					given: new ve.Range( 2 ),
					expected: new ve.Range( 2, 0 )
				},
				{
					direction: -1,
					expand: true,
					given: new ve.Range( 2, 0 ),
					expected: new ve.Range( 2, 0 )
				},
				{
					direction: -1,
					expand: true,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 0 )
				}
			]
		},
		{
			data: [
				/* 0 */ { type: 'mwBlockImage' },
				/* 1 */ { type: '/mwBlockImage' },
				/* 2 */ { type: 'mwBlockImage' },
				/* 3 */ { type: '/mwBlockImage' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 2 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 2, 4 ),
					expected: new ve.Range( 4 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 0, 4 )
				},
				{
					direction: -1,
					expand: true,
					given: new ve.Range( 4, 2 ),
					expected: new ve.Range( 4, 0 )
				},
				{
					direction: -1,
					expand: true,
					given: new ve.Range( 2, 4 ),
					expected: new ve.Range( 2 )
				}
			]
		},
		{
			data: [
				/* 0 */ { type: 'alienBlock' },
				/* 1 */ { type: '/alienBlock' },
				/* 2 */ { type: 'mwBlockImage' },
				/* 3 */ { type: '/mwBlockImage' },
				/* 4 */ { type: 'alienBlock' },
				/* 5 */ { type: '/alienBlock' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 0 ),
					expected: new ve.Range( 2 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 2 ),
					expected: new ve.Range( 2, 4 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 2, 4 ),
					expected: new ve.Range( 4 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 4 ),
					expected: new ve.Range( 6 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 0 ),
					expected: new ve.Range( 0, 2 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 0, 2 ),
					expected: new ve.Range( 0, 4 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 0, 4 ),
					expected: new ve.Range( 0, 6 )
				}
			]
		},
		{
			data: [
				/* 0 */ { type: 'paragraph' },
				/* 1 */ 'a',
				/* 2 */ { type: '/paragraph' },
				/* 3 */ { type: 'mwBlockImage' },
				/* 4 */ { type: '/mwBlockImage' },
				/* 5 */ { type: 'paragraph' },
				/* 6 */ 'b',
				/* 7 */ { type: '/paragraph' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 1 ),
					expected: new ve.Range( 2 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 2 ),
					expected: new ve.Range( 3, 5 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 3, 5 ),
					expected: new ve.Range( 6 )
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
					expected: new ve.Range( 1, 6 )
				}
			]
		},
		{
			data: [
				/* 0 */ { type: 'paragraph' },
				/* 1 */ 'a',
				/* 2 */ { type: 'mwInlineImage' },
				/* 3 */ { type: '/mwInlineImage' },
				/* 4 */ 'b',
				/* 5 */ { type: '/paragraph' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 1 ),
					expected: new ve.Range( 2 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 2 ),
					expected: new ve.Range( 2, 4 )
				},
				{
					direction: 1,
					expand: false,
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
				/* 1 */ { type: 'mwInlineImage' },
				/* 2 */ { type: '/mwInlineImage' },
				/* 3 */ { type: 'mwInlineImage' },
				/* 4 */ { type: '/mwInlineImage' },
				/* 5 */ { type: '/paragraph' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 3 ),
					expected: new ve.Range( 3, 5 )
				},
				{
					direction: 1,
					expand: true,
					given: new ve.Range( 1, 3 ),
					expected: new ve.Range( 1, 5 )
				}
			]
		},
		{
			data: [
				/* 0 */ { type: 'paragraph' },
				/* 1 */ { type: 'alienInline' },
				/* 2 */ { type: '/alienInline' },
				/* 3 */ { type: 'mwInlineImage' },
				/* 4 */ { type: '/mwInlineImage' },
				/* 5 */ { type: 'alienInline' },
				/* 6 */ { type: '/alienInline' },
				/* 7 */ { type: '/paragraph' }
			],
			cases: [
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 1 ),
					expected: new ve.Range( 3 )
				},
				{
					direction: 1,
					expand: false,
					given: new ve.Range( 5 ),
					expected: new ve.Range( 7 )
				}
			]
		}
	];
	for ( i = 0; i < tests.length; i++ ) {
		documentModel = new ve.dm.Document( tests[i].data );
		documentView = new ve.ce.Document( documentModel );
		for ( j = 0; j < tests[i].cases.length; j++ ) {
			expectCount++;
			assert.equalRange(
				documentView.getRelativeRange(
					tests[i].cases[j].given,
					tests[i].cases[j].direction,
					'character',
					tests[i].cases[j].expand
				),
				tests[i].cases[j].expected,
				'i: ' + i + ', j: ' + j
			);
		}
	}
	QUnit.expect( expectCount );
} );
