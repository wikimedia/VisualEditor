/*!
 * VisualEditor UserInterface Actions ContentAction tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.ContentAction' );

/* Tests */

function runContentActionTest( assert, html, createView, method, args, rangeOrSelection, expectedData, expectedRangeOrSelection, msg ) {
	var surface = createView ?
			ve.test.utils.createViewOnlySurfaceFromHtml( html || ve.dm.example.html ) :
			ve.test.utils.createModelOnlySurfaceFromHtml( html || ve.dm.example.html ),
		contentAction = new ve.ui.ContentAction( surface ),
		data = ve.copy( surface.getModel().getDocument().getFullData() ),
		documentModel = surface.getModel().getDocument(),
		selection = ve.test.utils.selectionFromRangeOrSelection( documentModel, rangeOrSelection ),
		expectedSelection = expectedRangeOrSelection && ve.test.utils.selectionFromRangeOrSelection( documentModel, expectedRangeOrSelection );

	if ( expectedData ) {
		expectedData( data );
	}
	surface.getModel().setSelection( selection );
	contentAction[ method ].apply( contentAction, args || [] );

	assert.equalLinearData( surface.getModel().getDocument().getFullData(), data, msg + ': data models match' );
	if ( expectedSelection ) {
		assert.equalHash( surface.getModel().getSelection(), expectedSelection, msg + ': selections match' );
	}
}

QUnit.test( 'insert', function ( assert ) {
	var i,
		expected = 0,
		cases = [
			{
				rangeOrSelection: new ve.Range( 3, 4 ),
				method: 'insert',
				args: [ 'Foo' ],
				expectedData: function ( data ) {
					data.splice( 3, 1,
						'F', 'o', 'o'
					);
				},
				expectedRangeOrSelection: new ve.Range( 3, 6 ),
				msg: 'insert text (annotate=false)'
			},
			{
				rangeOrSelection: new ve.Range( 3, 4 ),
				method: 'insert',
				args: [ 'Foo', true ],
				expectedData: function ( data ) {
					data.splice( 3, 1,
						[ 'F', [ 1 ] ],
						[ 'o', [ 1 ] ],
						[ 'o', [ 1 ] ]
					);
				},
				expectedRangeOrSelection: new ve.Range( 3, 6 ),
				msg: 'insert text (annotate=true)'
			},
			{
				rangeOrSelection: new ve.Range( 3, 4 ),
				method: 'insert',
				args: [ 'Foo', false, true ],
				expectedData: function ( data ) {
					data.splice( 3, 1,
						'F', 'o', 'o'
					);
				},
				expectedRangeOrSelection: new ve.Range( 6 ),
				msg: 'insert text (collapseToEnd=true)'
			},
			{
				rangeOrSelection: new ve.Range( 1, 4 ),
				method: 'remove',
				expectedData: function ( data ) {
					data.splice( 1, 3 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'remove text'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				method: 'select',
				args: [ new ve.dm.LinearSelection( null, new ve.Range( 1, 4 ) ) ],
				expectedRangeOrSelection: new ve.Range( 1, 4 ),
				msg: 'select'
			},
			{
				createView: true,
				rangeOrSelection: new ve.Range( 1 ),
				method: 'selectAll',
				expectedRangeOrSelection: new ve.Range( 1, 60 ),
				msg: 'select all in text selects the whole document'
			},
			{
				createView: true,
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'selectAll',
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 5,
					toRow: 6
				},
				msg: 'select all in a table selects the whole table'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		expected++;
		if ( cases[ i ].expectedRangeOrSelection ) {
			expected++;
		}
	}
	QUnit.expect( expected );	for ( i = 0; i < cases.length; i++ ) {
		runContentActionTest(
			assert, cases[ i ].html, cases[ i ].createView, cases[ i ].method, cases[ i ].args, cases[ i ].rangeOrSelection,
			cases[ i ].expectedData, cases[ i ].expectedRangeOrSelection, cases[ i ].msg
		);
	}
} );
