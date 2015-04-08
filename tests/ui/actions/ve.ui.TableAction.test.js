/*!
 * VisualEditor UserInterface Actions TableAction tests.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.TableAction' );

/* Tests */

function runTableActionTest( assert, html, method, args, selection, expectedData, expectedSelection, msg ) {
	var surface = ve.test.utils.createSurfaceFromHtml( html || ve.dm.example.html ),
		tableAction = new ve.ui.TableAction( surface ),
		data = ve.copy( surface.getModel().getDocument().getFullData() );

	expectedData( data );
	surface.getModel().setSelection( ve.dm.Selection.static.newFromJSON( surface.getModel().getDocument(), selection ) );
	tableAction[method].apply( tableAction, args );

	assert.equalLinearData( surface.getModel().getDocument().getFullData(), data, msg + ': data models match' );
	if ( expectedSelection ) {
		assert.deepEqual( surface.getModel().getSelection().toJSON(), expectedSelection, msg + ': selections match' );
	}

	surface.destroy();
}

QUnit.test( 'create', function ( assert ) {
	var i,
		expected = 0,
		tableCellTail = [
			{ type: 'paragraph', internal: { generated: 'wrapper' } },
			{ type: '/paragraph' },
			{ type: '/tableCell' }
		],
		tableHeader = [
			{
				type: 'tableCell',
				attributes: {
					colspan: 1,
					rowspan: 1,
					style: 'header'
				}
			}
		].concat( tableCellTail ),
		tableData = [
			{
				type: 'tableCell',
				attributes: {
					colspan: 1,
					rowspan: 1,
					style: 'data'
				}
			}
		].concat( tableCellTail ),
		cases = [
			{
				selection: {
					type: 'linear',
					range: new ve.Range( 0 )
				},
				method: 'create',
				args: [ {
					cols: 1,
					rows: 1,
					attributes: { sortable: true }
				} ],
				expectedData: function ( data ) {
					data.splice.apply( data, [ 0, 0 ].concat(
						[
							{ type: 'table', attributes: { sortable: true } },
							{ type: 'tableSection', attributes: { style: 'body' } },
							{ type: 'tableRow' }
						]
						.concat( tableData )
						.concat( [
							{ type: '/tableRow' },
							{ type: '/tableSection' },
							{ type: '/table' }
						] )
					) );
				},
				expectedSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 10 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				msg: 'create single cell table with attributes'
			},
			{
				selection: {
					type: 'linear',
					range: new ve.Range( 0 )
				},
				method: 'create',
				args: [ {
					cols: 3,
					rows: 2,
					header: true
				} ],
				expectedData: function ( data ) {
					data.splice.apply( data, [ 0, 0 ].concat(
						[
							{ type: 'table' },
							{ type: 'tableSection', attributes: { style: 'body' } },
							{ type: 'tableRow' }
						]
						.concat( tableHeader )
						.concat( tableHeader )
						.concat( tableHeader )
						.concat( [
							{ type: '/tableRow' },
							{ type: 'tableRow' }
						] )
						.concat( tableData )
						.concat( tableData )
						.concat( tableData )
						.concat( [
							{ type: '/tableRow' },
							{ type: 'tableRow' }
						] )
						.concat( tableData )
						.concat( tableData )
						.concat( tableData )
						.concat( [
							{ type: '/tableRow' },
							{ type: '/tableSection' },
							{ type: '/table' }
						] )
					) );
				},
				msg: 'create small table with header'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		expected++;
		if ( cases[i].expectedSelection ) {
			expected++;
		}
	}
	QUnit.expect( expected );
	for ( i = 0; i < cases.length; i++ ) {
		runTableActionTest(
			assert, cases[i].html, cases[i].method, cases[i].args, cases[i].selection,
			cases[i].expectedData, cases[i].expectedSelection, cases[i].msg
		);
	}
} );
