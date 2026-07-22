/*!
 * VisualEditor ContentEditable SelectionManager tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.SelectionManager' );

QUnit.test( 'drawSelections', ( assert ) => {
	const view = ve.test.utils.createSurfaceViewFromHtml( '<p>Foo bar baz</p>' ),
		selectionManager = view.getSelectionManager(),
		ceSelection = ( range ) => view.getSelection( new ve.dm.LinearSelection( range ) );

	let updateCount = 0,
		lastHasSelections = null;
	selectionManager.on( 'update', ( hasSelections ) => {
		updateCount++;
		lastHasSelections = hasSelections;
	} );

	selectionManager.drawSelections( 'test', [ ceSelection( new ve.Range( 1, 4 ) ) ] );
	assert.true( selectionManager.selectionGroups.has( 'test' ), 'Group created' );
	assert.true( updateCount > 0, 'update event emitted' );
	assert.true( lastHasSelections, 'hasSelections is true for a non-collapsed selection' );

	const group = selectionManager.selectionGroups.get( 'test' );
	assert.strictEqual( group.selections.length, 1, 'Group has one selection' );
	assert.true(
		group.$selections[ 0 ].querySelectorAll( '.ve-ce-surface-selection-rect' ).length > 0,
		'Rectangles rendered by default'
	);

	assert.true(
		!!selectionManager.getCachedSelectionElements( 'test', new ve.dm.LinearSelection( new ve.Range( 1, 4 ) ), {} ),
		'Drawn selection is cached'
	);

	selectionManager.drawSelections( 'bounding', [ ceSelection( new ve.Range( 1, 4 ) ) ], { showRects: false, showBounding: true } );
	assert.true(
		selectionManager.selectionGroups.get( 'bounding' ).$selections[ 0 ].querySelectorAll( '.ve-ce-surface-selection-bounding' ).length > 0,
		'Bounding rectangle rendered'
	);

	selectionManager.drawSelections( 'gutter', [ ceSelection( new ve.Range( 1, 4 ) ) ], { showRects: false, showGutter: true } );
	assert.true(
		selectionManager.selectionGroups.get( 'gutter' ).$selections[ 0 ].querySelectorAll( '.ve-ce-surface-selection-gutter' ).length > 0,
		'Gutter rendered'
	);

	selectionManager.drawSelections( 'labelled', [ ceSelection( new ve.Range( 1, 4 ) ) ], { showRects: false, showCursor: true, label: 'Alice' } );
	assert.true(
		selectionManager.selectionGroups.get( 'labelled' ).$overlays[ 0 ].querySelectorAll( '.ve-ce-surface-selection-label' ).length > 0,
		'Label rendered'
	);

	view.destroy();
} );

QUnit.test( 'redrawSelections, deactivated selection and options', ( assert ) => {
	const view = ve.test.utils.createSurfaceViewFromHtml( '<p>Foo bar baz</p>' ),
		selectionManager = view.getSelectionManager(),
		model = view.getModel();

	selectionManager.drawSelections( 'test', [ view.getSelection( new ve.dm.LinearSelection( new ve.Range( 1, 4 ) ) ) ] );

	// Position events clear the cache and redraw from the stored fragments
	selectionManager.onSurfacePosition();
	assert.true( selectionManager.selectionGroups.has( 'test' ), 'Group survives a position redraw' );
	// Scroll events redraw only clipped groups, without clearing the cache
	selectionManager.redrawSelections( true );
	assert.true( selectionManager.selectionGroups.has( 'test' ), 'Group survives a scroll redraw' );

	// setOptions updates an existing group's wrapper class
	selectionManager.setOptions( 'test', { wrapperClass: 'test-wrapper' } );
	assert.true(
		selectionManager.selectionGroups.get( 'test' ).$selections.hasClass( 'test-wrapper' ),
		'setOptions applies the wrapper class'
	);
	// setOptions on an unknown group is a no-op
	selectionManager.setOptions( 'unknown', { wrapperClass: 'x' } );
	assert.false( selectionManager.selectionGroups.has( 'unknown' ), 'setOptions does not create an unknown group' );

	// Deactivated selection
	model.setSelection( new ve.dm.LinearSelection( new ve.Range( 3 ) ) );
	selectionManager.showDeactivatedSelection();
	assert.strictEqual( selectionManager.deactivatedSelectionVisible, true, 'Deactivated selection shown' );
	selectionManager.hideDeactivatedSelection();
	assert.strictEqual( selectionManager.deactivatedSelectionVisible, false, 'Deactivated selection hidden' );

	view.destroy();
} );
