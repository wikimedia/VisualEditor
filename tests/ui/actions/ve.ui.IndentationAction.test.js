/*!
 * VisualEditor UserInterface Actions IndentationAction tests.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.IndentationAction' );

/* Tests */

QUnit.test( 'increase/decrease', function ( assert ) {
	var cases = [
		{
			rangeOrSelection: new ve.Range( 14, 16 ),
			method: 'decrease',
			expectedRangeOrSelection: new ve.Range( 14, 16 ),
			expectedData: function ( data ) {
				data.splice( 11, 2, { type: '/list' }, { type: 'paragraph' } );
				data.splice( 19, 2, { type: '/paragraph' }, { type: 'list', attributes: { style: 'bullet' } } );
			},
			expectedOriginalData: function ( data ) {
				// generated: 'wrapper' is removed by the action and not restored by undo
				delete data[ 12 ].internal;
			},
			undo: true,
			msg: 'decrease indentation on partial selection of list item "Item 2"'
		},
		{
			rangeOrSelection: new ve.Range( 3, 19 ),
			method: 'decrease',
			expectedRangeOrSelection: new ve.Range( 1, 15 ),
			expectedData: function ( data ) {
				data.splice( 0, 2 );
				data.splice( 8, 2 );
				data.splice( 16, 1, { type: 'list', attributes: { style: 'bullet' } } );
				delete data[ 0 ].internal;
				delete data[ 8 ].internal;
			},
			expectedOriginalData: function ( data ) {
				// generated: 'wrapper' is removed by the action and not restored by undo
				delete data[ 2 ].internal;
				delete data[ 12 ].internal;
			},
			undo: true,
			msg: 'decrease indentation on Items 1 & 2'
		},
		{
			rangeOrSelection: new ve.Range( 3, 19 ),
			method: 'increase',
			expectedRangeOrSelection: new ve.Range( 5, 21 ),
			expectedData: function ( data ) {
				data.splice( 0, 0, { type: 'list', attributes: { style: 'bullet' } }, { type: 'listItem' } );
				data.splice( 23, 0, { type: '/list' }, { type: '/listItem' } );
			},
			undo: true,
			msg: 'increase indentation on Items 1 & 2'
		},
		{
			html: '<ul><li><table><tr><td>A</td><tr></table></li></ul>',
			rangeOrSelection: new ve.Range( 2 ),
			method: 'decrease',
			expectedRangeOrSelection: new ve.Range( 0 ),
			expectedData: function ( data ) {
				data.splice( 15, 2 );
				data.splice( 0, 2 );
			},
			undo: true,
			msg: 'decrease indentation in slug'
		}
	];

	cases.forEach( function ( caseItem ) {
		ve.test.utils.runActionTest(
			'indentation', assert, caseItem.html || ve.dm.example.isolationHtml, false, caseItem.method, [], caseItem.rangeOrSelection, caseItem.msg,
			{
				expectedData: caseItem.expectedData,
				expectedOriginalData: caseItem.expectedOriginalData,
				expectedRangeOrSelection: caseItem.expectedRangeOrSelection,
				undo: caseItem.undo
			}
		);
	} );
} );
