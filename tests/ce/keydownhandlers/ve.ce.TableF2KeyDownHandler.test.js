/*!
 * VisualEditor ContentEditable table f2 key down handler tests.
 *
 * @copyright See AUTHORS.txt
 */

// TODO: Move this to a ve.ui.Trigger test

QUnit.module( 've.ce.TableF2KeyDownHandler', {
	// See https://github.com/platinumazure/eslint-plugin-qunit/issues/68
	// eslint-disable-next-line qunit/resolve-async
	beforeEach: function ( assert ) {
		const done = assert.async();
		return ve.init.platform.getInitializedPromise().then( done );
	}
} );

QUnit.test( 'special key down: table f2', ( assert ) => {
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
				keys: [ 'F2' ],
				expectedRangeOrSelection: new ve.Range( 11 ),
				msg: 'Press F2 to edit a table cell'
			}
		];

	let promise = Promise.resolve();
	cases.forEach( ( caseItem ) => {
		promise = promise.then( () => ve.test.utils.runSurfaceHandleSpecialKeyTest( assert, caseItem ) );
	} );

	promise.finally( () => done() );
} );
