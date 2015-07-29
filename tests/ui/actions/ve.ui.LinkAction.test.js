/*!
 * VisualEditor UserInterface Actions LinkAction tests.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.LinkAction' );

/* Tests */

function runAutolinkTest( assert, html, method, range, expectedRange, expectedData, expectedOriginalData, msg ) {
	var status,
		expectFail = /^Don't/.test( msg ),
		surface = ve.test.utils.createModelOnlySurfaceFromHtml( html || ve.dm.example.html ),
		linkAction = new ve.ui.LinkAction( surface ),
		data = ve.copy( surface.getModel().getDocument().getFullData() ),
		originalData = ve.copy( data );

	expectedData( data );
	if ( expectedOriginalData ) {
		expectedOriginalData( originalData );
	}
	surface.getModel().setLinearSelection( range );
	status = linkAction[ method ]();
	assert.equal( status, !expectFail, msg + ': action return value' );

	assert.equalLinearData( surface.getModel().getDocument().getFullData(), data, msg + ': data models match' );
	assert.equalRange( surface.getModel().getSelection().getRange(), expectedRange, msg + ': ranges match' );

	if ( status ) {
		surface.getModel().undo();
	}

	assert.equalLinearData( surface.getModel().getDocument().getFullData(), originalData, msg + ' (undo): data models match' );
	assert.equalRange( surface.getModel().getSelection().getRange(), expectedRange, msg + ' (undo): ranges match' );
}

QUnit.test( 'autolink', function ( assert ) {
	var i,
		cases = [
			{
				html: '<p>http://example.com xyz</p>',
				range: new ve.Range( 1, 20 ),
				method: 'autolinkUrl',
				expectedRange: new ve.Range( 20, 20 ),
				expectedData: function ( data ) {
					var i;
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ 0 ] ];
					}
				},
				msg: 'Autolink after space'
			},
			{
				html: '<p>http://example.com</p><p>xyz</p>',
				range: new ve.Range( 1, 21 ),
				method: 'autolinkUrl',
				expectedRange: new ve.Range( 21, 21 ),
				expectedData: function ( data ) {
					var i;
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ 0 ] ];
					}
				},
				msg: 'Autolink after newline'
			},
			{
				html: '<p>Http://Example.COm xyz</p>',
				range: new ve.Range( 1, 20 ),
				method: 'autolinkUrl',
				expectedRange: new ve.Range( 20, 20 ),
				expectedData: function ( data ) {
					var i;
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ 0 ] ];
					}
				},
				msg: 'Autolink with mixed case'
			},
			{
				html: '<p>http://example.com.) xyz</p>',
				range: new ve.Range( 1, 22 ),
				method: 'autolinkUrl',
				expectedRange: new ve.Range( 22, 22 ),
				expectedData: function ( data ) {
					var i;
					for ( i = 1; i < 19; i++ ) {
						data[ i ] = [ data[ i ], [ 0 ] ];
					}
				},
				msg: 'Strip trailing punctuation'
			},
			{
				html: '<p>http://.) xyz</p>',
				range: new ve.Range( 1, 11 ),
				method: 'autolinkUrl',
				expectedRange: new ve.Range( 1, 11 ),
				expectedData: function ( /*data*/ ) {
					/* no change, no link */
				},
				msg: 'Don\'t link if stripping leaves bare protocol'
			}
		];

	QUnit.expect( cases.length * 5 );
	for ( i = 0; i < cases.length; i++ ) {
		runAutolinkTest( assert, cases[ i ].html, cases[ i ].method, cases[ i ].range, cases[ i ].expectedRange, cases[ i ].expectedData, cases[ i ].expectedOriginalData, cases[ i ].msg );
	}
} );
