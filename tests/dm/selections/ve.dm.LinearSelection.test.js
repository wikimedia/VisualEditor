/*!
 * VisualEditor DataModel Linear Selection tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.LinearSelection' );

/* Tests */

QUnit.test( 'Construction and getters (getRange(s))', ( assert ) => {
	const range = new ve.Range( 200, 100 ),
		selection = new ve.dm.LinearSelection( range );

	assert.equalRange( selection.getRange(), range, 'getRange' );
	assert.deepEqual( selection.getRanges(), [ range ], 'getRanges' );
	assert.strictEqual( selection.getName(), 'linear', 'getName' );
} );

QUnit.test( 'Basic methods (collapse*, isCollased, equals, isNull)', ( assert ) => {
	const range = new ve.Range( 200, 100 ),
		selection = new ve.dm.LinearSelection( range ),
		startSelection = new ve.dm.LinearSelection( new ve.Range( 100 ) ),
		endSelection = new ve.dm.LinearSelection( new ve.Range( 200 ) );

	assert.deepEqual( selection.collapseToStart(), startSelection, 'collapseToStart' );
	assert.deepEqual( selection.collapseToEnd(), endSelection, 'collapseToEnd' );
	assert.deepEqual( selection.collapseToFrom(), endSelection, 'collapseToFrom' );
	assert.deepEqual( selection.collapseToTo(), startSelection, 'collapseToTo' );
	assert.false( selection.isCollapsed(), '200-100 is not collapsed' );
	assert.true( startSelection.isCollapsed(), '100-100 is collapsed' );
	assert.true( selection.equals( selection ), 'equals' );
	assert.false( selection.isNull(), 'not null' );
} );

QUnit.test( 'Factory methods & serialization (newFromJSON, toJSON, getDescription)', ( assert ) => {
	const range = new ve.Range( 200, 100 ),
		selection = new ve.dm.LinearSelection( range );

	assert.deepEqual( selection.toJSON(), { type: 'linear', range: range }, 'toJSON' );
	assert.deepEqual(
		ve.dm.Selection.static.newFromJSON( JSON.stringify( { type: 'linear', range: range } ) ),
		selection,
		'newFromJSON'
	);
	assert.strictEqual( selection.getDescription(), 'Linear: 200 - 100', 'getDescription' );
} );

// TODO: translateByTransaction
