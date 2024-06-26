/*!
 * VisualEditor ContentEditable table enter key down handler tests.
 *
 * @copyright See AUTHORS.txt
 */

// TODO: Move this to a ve.ui.Trigger test

QUnit.module( 've.ce.TableEnterKeyDownHandler', {
	// See https://github.com/platinumazure/eslint-plugin-qunit/issues/68
	// eslint-disable-next-line qunit/resolve-async
	beforeEach: function ( assert ) {
		const done = assert.async();
		return ve.init.platform.getInitializedPromise().then( done );
	}
} );

QUnit.test( 'special key down: table enter', ( assert ) => {
	const done = assert.async(),
		mergedCellsDoc = ve.dm.example.createExampleDocument( 'mergedCells' ),
		cases = [
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				keys: [ 'ENTER' ],
				expectedRangeOrSelection: new ve.Range( 11 ),
				msg: 'Enter to edit a table cell'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				keys: ve.getSystemPlatform() === 'mac' ? [ 'CMD+ENTER' ] : [ 'CTRL+ENTER' ],
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				msg: 'Ctrl + Enter does nothing (emits submit)'
			}
		];

	let promise = Promise.resolve();
	cases.forEach( ( caseItem ) => {
		promise = promise.then( () => ve.test.utils.runSurfaceHandleSpecialKeyTest( assert, caseItem ) );
	} );

	promise.finally( () => done() );
} );
