/*!
 * VisualEditor UserInterface Actions AnnotationAction tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.AnnotationAction' );

/* Tests */

QUnit.test( 'toggle', ( assert ) => {
	const newBold = { type: 'textStyle/bold' },
		html = '<p>Foo<b>bar</b><strong>baz</strong><i>quux</i> white\u3000space</p>',
		cases = [
			{
				html: html,
				rangeOrSelection: new ve.Range( 1, 4 ),
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 1, 3,
						[ 'F', [ newBold ] ],
						[ 'o', [ newBold ] ],
						[ 'o', [ newBold ] ]
					);
				},
				msg: 'toggle bold on plain text'
			},
			{
				html: html,
				rangeOrSelection: new ve.Range( 7, 10 ),
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 7, 3, ...'baz' );
				},
				msg: 'toggle bold on strong text'
			},
			{
				html: html,
				rangeOrSelection: new ve.Range( 4, 10 ),
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 4, 6, ...'barbaz' );
				},
				msg: 'toggle bold on bold then strong text'
			},
			{
				html: html,
				rangeOrSelection: new ve.Range( 1, 14 ),
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 1, 3,
						[ 'F', [ newBold ] ],
						[ 'o', [ newBold ] ],
						[ 'o', [ newBold ] ]
					);
					data.splice( 10, 4,
						[ 'q', [ ve.dm.example.italic, newBold ] ],
						[ 'u', [ ve.dm.example.italic, newBold ] ],
						[ 'u', [ ve.dm.example.italic, newBold ] ],
						[ 'x', [ ve.dm.example.italic, newBold ] ]
					);
				},
				msg: 'toggle bold on plain, bold, strong then underlined text'
			},
			{
				html: html,
				rangeOrSelection: new ve.Range( 14, 21 ),
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 15, 5,
						[ 'w', [ newBold ] ],
						[ 'h', [ newBold ] ],
						[ 'i', [ newBold ] ],
						[ 't', [ newBold ] ],
						[ 'e', [ newBold ] ]
					);
				},
				msg: 'trailing whitespace is not annotated'
			},
			{
				html: ve.dm.example.annotatedTableHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 5, 3, ...'Foo' );
					data.splice( 12, 3, ...'Bar' );
				},
				msg: 'toggle bold on comparable bold annotations spanning multiple table cells'
			},
			{
				html: '<table><tr><td><b>A</b></td><td></td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 15 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 5, 1, 'A' );
				},
				msg: 'toggle bold off when selection includes an content-less cell'
			},
			{
				html: '<table><tr><td></td><td><b>A</b></td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 15 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 9, 1, 'A' );
				},
				msg: 'toggle bold off when first cell is content-less cell'
			}
		];

	cases.forEach( ( caseItem ) => {
		ve.test.utils.runActionTest(
			assert,
			{
				actionName: 'annotation',
				...caseItem
			}
		);
	} );
} );
