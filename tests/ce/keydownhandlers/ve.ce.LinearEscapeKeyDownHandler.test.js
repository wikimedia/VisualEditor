/*!
 * VisualEditor ContentEditable linear escape down handler tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.LinearEscapeKeyDownHandler', {
	// See https://github.com/platinumazure/eslint-plugin-qunit/issues/68
	// eslint-disable-next-line qunit/resolve-async
	beforeEach: function ( assert ) {
		const done = assert.async();
		return ve.init.platform.getInitializedPromise().then( done );
	}
} );

QUnit.test( 'special key down: linear escape', ( assert ) => {
	const done = assert.async(),
		noChange = function () {},
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
				keys: [ 'ENTER', 'ESCAPE' ],
				expectedData: noChange,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				msg: 'Escape to leave a table cell'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				keys: [ 'ESCAPE' ],
				expectedData: noChange,
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Escape elsewhere make no selection change'
			}
		];

	let promise = Promise.resolve();
	cases.forEach( ( caseItem ) => {
		promise = promise.then( () => ve.test.utils.runSurfaceHandleSpecialKeyTest( assert, caseItem ) );
	} );

	promise.finally( () => done() );
} );
