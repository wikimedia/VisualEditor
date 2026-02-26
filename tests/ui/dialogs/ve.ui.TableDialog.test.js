/*!
 * VisualEditor UserInterface TableDialog tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.TableDialog' );

/* Tests */

QUnit.test( 'Toggle caption', ( assert ) => {
	const cases = [
		{
			msg: 'Toggle on caption',
			html: '<table><tbody><tr><td>Foo</td></tr></tbody></table>',
			rangeOrSelection: {
				type: 'table',
				tableRange: new ve.Range( 0, 13 ),
				fromCol: 0,
				fromRow: 0,
				toCol: 0,
				toRow: 0
			},
			expectedData: ( data ) => {
				data.splice( 1, 0,
					{ type: 'tableCaption' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } },
					{ type: '/paragraph' },
					{ type: '/tableCaption' }
				);
			},
			initialToggleValue: false
		},
		{
			msg: 'Toggle off caption',
			html: '<table><caption>Bar</caption><tbody><tr><td>Foo</td></tr></tbody></table>',
			rangeOrSelection: {
				type: 'table',
				tableRange: new ve.Range( 0, 20 ),
				fromCol: 0,
				fromRow: 0,
				toCol: 0,
				toRow: 0
			},
			expectedData: ( data ) => {
				data.splice( 1, 7 );
			},
			initialToggleValue: true
		}
	];

	function runTableTest( caseItem ) {
		const surface = ve.test.utils.createSurfaceFromHtml( caseItem.html, { nullSelectionOnBlur: false } );
		const surfaceModel = surface.getModel();
		surfaceModel.setSelection( ve.test.utils.selectionFromRangeOrSelection( surfaceModel.getDocument(), caseItem.rangeOrSelection ) );
		const data = ve.copy( surfaceModel.getDocument().getFullData() );
		caseItem.expectedData( data );

		return surface.getDialogs().getWindow( 'table' ).then(
			( dialog ) => dialog.open( {
				surface,
				fragment: surface.getModel().getFragment()
			} ).opened.then( () => {
				assert.strictEqual( dialog.captionToggle.getValue(), caseItem.initialToggleValue, 'Caption toggle initial value' );

				dialog.captionToggle.setValue( !caseItem.initialToggleValue );
				return dialog.getActionProcess( 'done' ).execute().then( () => {
					assert.equalLinearData(
						surfaceModel.getDocument().getFullData(),
						data,
						caseItem.msg + ': data after closing'
					);
					surface.destroy();
				} );
			} )
		);
	}

	const done = assert.async();
	( async function () {
		for ( const caseItem of cases ) {
			await runTableTest( caseItem );
		}
		done();
	}() );
} );
