/*!
 * VisualEditor DataModel Null Selection tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.NullSelection' );

/* Tests */

QUnit.test( 'Construction and getters (getDocument, getRanges)', ( assert ) => {
	const selection = new ve.dm.NullSelection();

	assert.deepEqual( selection.getRanges(), [], 'getRanges' );
	assert.strictEqual( selection.getName(), 'null', 'getName' );
} );

QUnit.test( 'Basic methods (collapse*, isCollased, equals, isNull)', ( assert ) => {
	const selection = new ve.dm.NullSelection();

	assert.deepEqual( selection.collapseToStart(), selection, 'collapseToStart' );
	assert.deepEqual( selection.collapseToEnd(), selection, 'collapseToEnd' );
	assert.deepEqual( selection.collapseToFrom(), selection, 'collapseToFrom' );
	assert.deepEqual( selection.collapseToTo(), selection, 'collapseToTo' );
	assert.true( selection.isCollapsed(), 'isCollapsed' );
	assert.true( selection.equals( selection ), 'equals' );
	assert.true( selection.isNull(), 'null' );
} );

QUnit.test( 'Factory methods & serialization (newFromJSON, toJSON, getDescription)', ( assert ) => {
	const selection = new ve.dm.NullSelection();

	assert.deepEqual( selection.toJSON(), { type: 'null' }, 'toJSON' );
	assert.deepEqual(
		ve.dm.Selection.static.newFromJSON( JSON.stringify( { type: 'null' } ) ),
		selection,
		'newFromJSON'
	);
	assert.strictEqual( selection.getDescription(), 'Null', 'getDescription' );
} );

// TODO: translateByTransaction
