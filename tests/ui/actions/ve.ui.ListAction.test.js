/*!
 * VisualEditor UserInterface Actions ListAction tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.ListAction' );

/* Tests */

QUnit.test( '(un)wrap', ( assert ) => {
	const cases = [
		{
			rangeOrSelection: new ve.Range( 56, 60 ),
			method: 'wrap',
			style: 'bullet',
			expectedRangeOrSelection: new ve.Range( 58, 64 ),
			expectedData: ( data ) => {
				data.splice( 55, 1,
					{ type: 'list', attributes: { style: 'bullet' } },
					{ type: 'listItem' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } }
				);
				data.splice( 60, 1,
					{ type: '/listItem' },
					{ type: 'listItem' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } }
				);
				data.splice( 65, 0,
					{ type: '/listItem' },
					{ type: '/list' }
				);
			},
			undo: true,
			msg: 'wrapping two paragraphs in a list'
		},
		{
			html: ve.dm.example.isolationHtml,
			rangeOrSelection: new ve.Range( 191, 211 ),
			method: 'unwrap',
			expectedRangeOrSelection: new ve.Range( 187, 205 ),
			expectedData: ( data ) => {
				delete data[ 190 ].internal;
				delete data[ 202 ].internal;
				data.splice( 186, 4 );
				data.splice( 196, 2 );
				data.splice( 206, 2,
					{ type: 'list', attributes: { style: 'bullet' } },
					{ type: 'listItem' },
					{ type: 'list', attributes: { style: 'number' } },
					{ type: 'listItem' }
				);
			},
			undo: true,
			msg: 'unwrapping two double listed paragraphs'
		}
	];

	cases.forEach( ( caseItem ) => {
		ve.test.utils.runActionTest(
			assert,
			{
				actionName: 'list',
				args: [ caseItem.style ],
				createView: true,
				...caseItem
			}
		);
	} );
} );

QUnit.test( 'toggle', ( assert ) => {
	const cases = [
		{
			html: '<ul><li>One<ul><li>Two</li></ul></li></ul>',
			rangeOrSelection: new ve.Range( 11 ),
			method: 'toggle',
			style: 'number',
			expectedRangeOrSelection: new ve.Range( 11 ),
			expectedData: ( data ) => {
				data[ 7 ].attributes.style = 'number';
			},
			undo: true,
			msg: 'Convert a nested bullet list to a numbered list'
		},
		{
			html: '<ul><li>One<ol><li>Two</li></ol></li></ul>',
			rangeOrSelection: new ve.Range( 11 ),
			method: 'toggle',
			style: 'bullet',
			expectedRangeOrSelection: new ve.Range( 11 ),
			expectedData: ( data ) => {
				data[ 7 ].attributes.style = 'bullet';
			},
			undo: true,
			msg: 'Convert a numbered list (within a bullet list) back to a bullet list'
		}
	];

	cases.forEach( ( caseItem ) => {
		ve.test.utils.runActionTest(
			assert,
			{
				actionName: 'list',
				args: [ caseItem.style ],
				createView: true,
				...caseItem
			}
		);
	} );
} );
