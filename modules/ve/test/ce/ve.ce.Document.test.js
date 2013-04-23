/*!
 * VisualEditor ContentEditable Document tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.Document' );

/* Tests */

QUnit.test( 'selectNodes', 21, function ( assert ) {
	var i, len,
		doc = ve.dm.example.createExampleDocument(),
		cases = ve.example.getSelectNodesCases( doc );
	for ( i = 0, len = cases.length; i < len; i++ ) {
		assert.equalNodeSelection( cases[i].actual, cases[i].expected, cases[i].msg );
	}
} );

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
