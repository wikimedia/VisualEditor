/*!
 * VisualEditor UserInterface Actions LinkAction tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.LinkAction' );

/* Tests */

QUnit.test( 'autolink', function ( assert ) {
	var i,
		cases = [
			{
				html: '<p>http://example.com xyz</p>',
				rangeOrSelection: new ve.Range( 1, 20 ),
				method: 'autolinkUrl',
				expectedRangeOrSelection: new ve.Range( 20 ),
				expectedOriginalRangeOrSelection: new ve.Range( 20 ),
				expectedData: function ( data, action ) {
					var i,
						a = action.getLinkAnnotation( 'http://example.com' );
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ a.element ] ];
					}
				},
				undo: true,
				msg: 'Autolink after space'
			},
			{
				html: '<p>http://example.com</p><p>xyz</p>',
				rangeOrSelection: new ve.Range( 1, 21 ),
				method: 'autolinkUrl',
				expectedRangeOrSelection: new ve.Range( 21 ),
				expectedOriginalRangeOrSelection: new ve.Range( 21 ),
				expectedData: function ( data, action ) {
					var i,
						a = action.getLinkAnnotation( 'http://example.com' );
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ a.element ] ];
					}
				},
				undo: true,
				msg: 'Autolink after newline'
			},
			{
				html: '<p>Http://Example.COm xyz</p>',
				rangeOrSelection: new ve.Range( 1, 20 ),
				method: 'autolinkUrl',
				expectedRangeOrSelection: new ve.Range( 20 ),
				expectedOriginalRangeOrSelection: new ve.Range( 20 ),
				expectedData: function ( data, action ) {
					var i,
						a = action.getLinkAnnotation( 'Http://Example.COm' );
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ a.element ] ];
					}
				},
				undo: true,
				msg: 'Autolink with mixed case'
			},
			{
				html: '<p>http://example.com.) xyz</p>',
				rangeOrSelection: new ve.Range( 1, 22 ),
				method: 'autolinkUrl',
				expectedRangeOrSelection: new ve.Range( 22 ),
				expectedOriginalRangeOrSelection: new ve.Range( 22 ),
				expectedData: function ( data, action ) {
					var i,
						a = action.getLinkAnnotation( 'http://example.com' );
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ a.element ] ];
					}
				},
				undo: true,
				msg: 'Strip trailing punctuation'
			},
			{
				html: '<p>"http://example.com" xyz</p>',
				rangeOrSelection: new ve.Range( 2, 22 ),
				method: 'autolinkUrl',
				expectedRangeOrSelection: new ve.Range( 22 ),
				expectedOriginalRangeOrSelection: new ve.Range( 22 ),
				expectedData: function ( data, action ) {
					var i,
						a = action.getLinkAnnotation( 'http://example.com' );
					for ( i = 2; i < 20; i++ ) {
						data[ i ] = [ data[ i ], [ a.element ] ];
					}
				},
				undo: true,
				msg: 'Strip trailing quotes'
			},
			{
				html: '<p>http://.) xyz</p>',
				rangeOrSelection: new ve.Range( 1, 11 ),
				method: 'autolinkUrl',
				expectedRangeOrSelection: new ve.Range( 1, 11 ),
				expectedData: function () {
					/* no change, no link */
				},
				msg: 'Don\'t link if stripping leaves bare protocol'
			}
		];

	QUnit.expect( ve.test.utils.countActionTests( cases ) );
	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runActionTest(
			'link', assert, cases[ i ].html, false, cases[ i ].method, [], cases[ i ].rangeOrSelection, cases[ i ].msg,
			{
				expectedData: cases[ i ].expectedData,
				expectedRangeOrSelection: cases[ i ].expectedRangeOrSelection,
				expectedOriginalRangeOrSelection: cases[ i ].expectedOriginalRangeOrSelection,
				undo: cases[ i ].undo
			}
		);
	}
} );
