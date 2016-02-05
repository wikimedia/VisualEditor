/*!
 * VisualEditor UserInterface Actions AnnotationAction tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.AnnotationAction' );

/* Tests */

function runAnnotationActionTest( assert, html, method, args, selection, expectedData, msg ) {
	var surface = ve.test.utils.createModelOnlySurfaceFromHtml( html || ve.dm.example.html ),
		AnnotationAction = new ve.ui.AnnotationAction( surface ),
		data = ve.copy( surface.getModel().getDocument().getFullData() );

	expectedData( data );
	surface.getModel().setSelection( ve.dm.Selection.static.newFromJSON( surface.getModel().getDocument(), selection ) );
	AnnotationAction[ method ].apply( AnnotationAction, args );

	assert.equalLinearData( surface.getModel().getDocument().getFullData(), data, msg + ': data models match' );
}

QUnit.test( 'toggle', function ( assert ) {
	var i,
		html = '<p>Foo<b>bar</b><strong>baz</strong><i>quux</i> white\u3000space</p>',
		cases = [
			{
				html: html,
				selection: {
					type: 'linear',
					range: new ve.Range( 1, 4 )
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 1, 3,
						[ 'F', [ 3 ] ],
						[ 'o', [ 3 ] ],
						[ 'o', [ 3 ] ]
					);
				},
				msg: 'toggle bold on plain text'
			},
			{
				html: html,
				selection: {
					type: 'linear',
					range: new ve.Range( 7, 10 )
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 7, 3, 'b', 'a', 'z' );
				},
				msg: 'toggle bold on strong text'
			},
			{
				html: html,
				selection: {
					type: 'linear',
					range: new ve.Range( 4, 10 )
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 4, 6, 'b', 'a', 'r', 'b', 'a', 'z' );
				},
				msg: 'toggle bold on bold then strong text'
			},
			{
				html: html,
				selection: {
					type: 'linear',
					range: new ve.Range( 1, 14 )
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 1, 3,
						[ 'F', [ 3 ] ],
						[ 'o', [ 3 ] ],
						[ 'o', [ 3 ] ]
					);
					data.splice( 10, 4,
						[ 'q', [ 2, 3 ] ],
						[ 'u', [ 2, 3 ] ],
						[ 'u', [ 2, 3 ] ],
						[ 'x', [ 2, 3 ] ]
					);
				},
				msg: 'toggle bold on plain, bold, strong then underlined text'
			},
			{
				html: html,
				selection: {
					type: 'linear',
					range: new ve.Range( 14, 21 )
				},
				method: 'toggle',
				args: [ 'textStyle/bold' ],
				expectedData: function ( data ) {
					data.splice( 15, 5,
						[ 'w', [ 3 ] ],
						[ 'h', [ 3 ] ],
						[ 'i', [ 3 ] ],
						[ 't', [ 3 ] ],
						[ 'e', [ 3 ] ]
					);
				},
				msg: 'trailing whitespace is not annotated'
			},
			{
				html: ve.dm.example.annotatedTableHtml,
				selection: {
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
					data.splice( 5, 3, 'F', 'o', 'o' );
					data.splice( 12, 3, 'B', 'a', 'r' );
				},
				msg: 'toggle bold on comparable bold annotations spanning multiple table cells'
			}
		];

	QUnit.expect( cases.length * 1 );
	for ( i = 0; i < cases.length; i++ ) {
		runAnnotationActionTest( assert, cases[ i ].html, cases[ i ].method, cases[ i ].args, cases[ i ].selection, cases[ i ].expectedData, cases[ i ].msg );
	}
} );
