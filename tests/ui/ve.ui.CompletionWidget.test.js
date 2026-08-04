/*!
 * VisualEditor UserInterface CompletionWidget tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.CompletionWidget' );

/**
 * Build a minimal fake completion action.
 *
 * getSuggestions() defaults to a promise that never resolves, so update()'s
 * async branch stays dormant and tests observe only synchronous state.
 *
 * @param {Object} [overrides] Members to override
 * @return {Object} Fake action
 */
function createAction( overrides ) {
	return Object.assign( {
		getSequenceLength: () => 0,
		getSuggestions: () => ve.createDeferred().promise(),
		getMenuItemForSuggestion: ( suggestion ) => new OO.ui.MenuOptionWidget( { data: suggestion, label: suggestion } ),
		updateMenuItems: ( items ) => items,
		getHeaderLabel: () => undefined,
		chooseItem: () => {},
		shouldAbandon: () => false,
		// onModelSelect reads action.constructor.static.alwaysIncludeInput
		constructor: { static: { alwaysIncludeInput: false } }
	}, overrides || {} );
}

/* Tests */

QUnit.test( 'setup clears suggestions from a previous invocation', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );

	// A valid collapsed selection for setup()/getCompletionRange().
	surface.getModel().setLinearSelection( new ve.Range( 4 ) );

	// Simulate suggestions left in the menu by a previous invocation.
	completionWidget.menu.addItems( [
		new OO.ui.MenuOptionWidget( { data: 'stale', label: 'stale' } )
	] );
	assert.strictEqual(
		completionWidget.menu.getItems().length, 1,
		'menu contains a stale item before setup'
	);

	completionWidget.setup( createAction() );

	// Without the fix, update()'s clearItems() only runs when the async
	// suggestions arrive, so the stale item would still be shown (T432402).
	assert.strictEqual(
		completionWidget.menu.getItems().length, 0,
		'stale suggestions are cleared during setup, before new suggestions arrive'
	);

	completionWidget.teardown();
	surface.destroy();
} );

QUnit.test( 'update populates the menu with suggestions from the action', ( assert ) => {
	const done = assert.async();
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );

	const deferred = ve.createDeferred();
	const suggestionsPromise = deferred.promise();
	const action = createAction( { getSuggestions: () => suggestionsPromise } );

	surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	completionWidget.setup( action );

	assert.strictEqual(
		completionWidget.menu.getItems().length, 0,
		'menu is empty until suggestions resolve'
	);
	assert.strictEqual(
		completionWidget.popup.isVisible(), false,
		'popup is hidden while there are no items'
	);

	deferred.resolve( [ 'apple', 'apricot' ] );

	// Same promise as the widget's handler, so this runs after the menu is populated.
	suggestionsPromise.then( () => {
		const items = completionWidget.menu.getItems();
		assert.deepEqual(
			items.map( ( item ) => item.getData() ),
			[ 'apple', 'apricot' ],
			'menu contains one option per suggestion'
		);
		assert.strictEqual(
			completionWidget.menu.findHighlightedItem(), items[ 0 ],
			'the first suggestion is highlighted'
		);
		assert.strictEqual(
			completionWidget.popup.isVisible(), true,
			'popup is shown once there are items'
		);

		completionWidget.teardown();
		surface.destroy();
		done();
	} );
} );

QUnit.test( 'update keeps existing suggestions visible until new ones resolve', ( assert ) => {
	const done = assert.async();
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );

	let deferred = ve.createDeferred();
	const action = createAction( { getSuggestions: () => deferred.promise() } );

	surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	completionWidget.setup( action );

	const firstPromise = deferred.promise();
	deferred.resolve( [ 'apple', 'apricot' ] );

	firstPromise.then( () => {
		assert.strictEqual(
			completionWidget.menu.getItems().length, 2,
			'menu is populated once the first suggestions resolve'
		);

		// Simulate a keystroke whose suggestions are still pending.
		deferred = ve.createDeferred();
		completionWidget.update();

		// Existing results must stay until the new suggestions arrive. This is
		// why the clear belongs in setup(), not update() (T432402).
		assert.strictEqual(
			completionWidget.menu.getItems().length, 2,
			'existing suggestions remain while new ones are pending'
		);

		completionWidget.teardown();
		surface.destroy();
		done();
	} );
} );

QUnit.test( 'choosing a suggestion delegates to the action and tears down', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );

	let chosen = null;
	const action = createAction( {
		getSequenceLength: () => 2,
		chooseItem: ( item, range ) => {
			chosen = { item, range };
		}
	} );

	surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	completionWidget.setup( action );

	const item = new OO.ui.MenuOptionWidget( { data: 'apple', label: 'apple' } );
	completionWidget.onMenuChoose( item );

	assert.strictEqual( chosen.item, item, 'action.chooseItem is called with the chosen item' );
	assert.true( chosen.range instanceof ve.Range, 'action.chooseItem is called with a completion range' );
	assert.strictEqual( chosen.range.start, 2, 'the range includes the triggering sequence' );
	assert.strictEqual( completionWidget.action, undefined, 'the widget is torn down after choosing' );

	surface.destroy();
} );

QUnit.test( 'onModelSelect updates while valid and tears down when the action abandons', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );

	let abandon = false;
	const action = createAction( { shouldAbandon: () => abandon } );

	surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	completionWidget.setup( action );

	let updateCalls = 0;
	completionWidget.update = function () {
		updateCalls++;
	};

	completionWidget.onModelSelect();
	assert.strictEqual( updateCalls, 1, 'a valid selection triggers an update' );
	assert.strictEqual( completionWidget.action, action, 'the widget stays set up while the action does not abandon' );

	abandon = true;
	completionWidget.onModelSelect();
	assert.strictEqual( completionWidget.action, undefined, 'the widget tears down when the action abandons' );

	surface.destroy();
} );

QUnit.test( 'getCompletionRange respects the triggering sequence and requires an action', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );

	// sequenceLength 2, cursor at offset 4 => initialOffset 2.
	const action = createAction( { getSequenceLength: () => 2 } );
	surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	completionWidget.setup( action );

	let range = completionWidget.getCompletionRange();
	assert.deepEqual(
		[ range.start, range.end ], [ 4, 4 ],
		'by default the range excludes the triggering sequence'
	);

	range = completionWidget.getCompletionRange( true );
	assert.deepEqual(
		[ range.start, range.end ], [ 2, 4 ],
		'the range includes the triggering sequence when requested'
	);

	completionWidget.teardown();
	assert.strictEqual(
		completionWidget.getCompletionRange(), null,
		'the range is null once there is no active action'
	);

	surface.destroy();
} );

QUnit.test( 'isolateInput mode deactivates the surface and shows a no-results row', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>foo</p>' );
	const completionWidget = new ve.ui.CompletionWidget( surface );
	const action = createAction();

	surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	surface.getView().activate();
	assert.strictEqual(
		surface.getView().isDeactivated(), false,
		'the surface is active before setup'
	);

	completionWidget.setup( action, true );

	assert.strictEqual(
		surface.getView().isDeactivated(), true,
		'the surface is deactivated while an isolated-input completion is open'
	);
	// The isolated-input branch shows a placeholder row instead of hiding the popup.
	assert.true(
		completionWidget.menu.getItems().includes( completionWidget.noResults ),
		'a no-results row is shown when there are no suggestions'
	);

	completionWidget.teardown();
	assert.strictEqual(
		surface.getView().isDeactivated(), false,
		'the surface is reactivated on teardown'
	);

	surface.destroy();
} );

QUnit.test( 'the completion covers the text entered, not the text before the cursor', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '<p>ab</p>' );
	const surfaceModel = surface.getModel();
	const completionWidget = new ve.ui.CompletionWidget( surface );
	const action = createAction( { getSequenceLength: () => 2 } );

	// "ab" is the triggering sequence, so the completion starts after it
	surfaceModel.setLinearSelection( new ve.Range( 3 ) );
	completionWidget.setup( action );
	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 1, to: 3 },
		'the completion is the sequence alone before anything is entered'
	);

	// Enter "cde", one character at a time, as typing does
	'cde'.split( '' ).forEach( ( character ) => {
		surfaceModel.getFragment().insertContent( character ).collapseToEnd().select();
	} );
	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 1, to: 6 },
		'entered text extends the completion'
	);

	// Move the cursor back into the entered text, as an arrow key does
	surfaceModel.setLinearSelection( new ve.Range( 4 ) );
	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 1, to: 6 },
		'moving the cursor back leaves the completion as it is'
	);
	assert.strictEqual(
		surfaceModel.getDocument().data.getText( false, completionWidget.getCompletionRange() ),
		'cde',
		'so a suggestion replaces all of the entered text, not only "c"'
	);

	// Enter a character where the cursor now is
	surfaceModel.getFragment().insertContent( 'x' ).collapseToEnd().select();
	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 1, to: 7 },
		'text entered inside the completion extends it too'
	);

	// Delete that character again
	surfaceModel.getFragment( new ve.dm.LinearSelection( new ve.Range( 4, 5 ) ) ).removeContent();
	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 1, to: 6 },
		'deleted text shortens the completion'
	);

	completionWidget.teardown();
	surface.destroy();
} );

QUnit.test( 'onModelSelect tears down when the cursor leaves the entered text', ( assert ) => {
	const action = createAction( { getSequenceLength: () => 2 } );

	/**
	 * Open a completion after "ab", with "gh" entered into it
	 *
	 * @return {Object} The surface and its completion widget
	 */
	function openCompletion() {
		const surface = ve.test.utils.createSurfaceFromHtml( '<p>abcdef</p>' );
		const completionWidget = new ve.ui.CompletionWidget( surface );
		surface.getModel().setLinearSelection( new ve.Range( 3 ) );
		completionWidget.setup( action );
		surface.getModel().getFragment().insertContent( 'gh' ).collapseToEnd().select();
		// The suggestions are of no interest here, and update() would request them
		completionWidget.update = () => {};
		return { surface, completionWidget };
	}

	const inside = openCompletion();
	inside.surface.getModel().setLinearSelection( new ve.Range( 4 ) );
	assert.strictEqual(
		inside.completionWidget.action, action,
		'the widget stays open while the cursor is inside the entered text'
	);

	// Past the end is text the user did not enter into the completion
	const past = openCompletion();
	past.surface.getModel().setLinearSelection( new ve.Range( 6 ) );
	assert.strictEqual(
		past.completionWidget.action, undefined,
		'the widget tears down when the cursor moves past the entered text'
	);

	// And the triggering sequence is not part of the completion either
	const before = openCompletion();
	before.surface.getModel().setLinearSelection( new ve.Range( 2 ) );
	assert.strictEqual(
		before.completionWidget.action, undefined,
		'the widget tears down when the cursor moves into the triggering sequence'
	);

	[ inside, past, before ].forEach( ( opened ) => {
		opened.completionWidget.teardown();
		opened.surface.destroy();
	} );
} );

QUnit.test( 'an isolated input is not affected by the selection in the document', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml(
		'<p>foo</p><table><tr><td>a</td><td>b</td></tr></table>'
	);
	const surfaceModel = surface.getModel();
	const completionWidget = new ve.ui.CompletionWidget( surface );
	// A command opens an isolated input, so there is no triggering sequence in the document
	const action = createAction();

	surfaceModel.setLinearSelection( new ve.Range( 4 ) );
	completionWidget.setup( action, true );

	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 4, to: 4 },
		'the completion is empty, because the text is entered outside the document'
	);

	// The text goes into the widget's own input, and leaves the document alone
	completionWidget.input.setValue( 'para' );
	assert.deepEqual(
		completionWidget.getCompletionRange( true ).toJSON(),
		{ type: 'range', from: 4, to: 4 },
		'entering text in the isolated input leaves the completion empty'
	);

	// A table selection covers the whole table, which is not a cursor the user moved
	const tableRange = surface.getModel().getDocument().getDocumentNode()
		.children[ 1 ].getOuterRange();
	completionWidget.update = () => {};
	surfaceModel.setSelection( new ve.dm.TableSelection( tableRange, 0, 0 ) );
	assert.strictEqual(
		completionWidget.action, action,
		'a selection in the document does not tear down an isolated input'
	);

	completionWidget.teardown();
	surface.destroy();
} );
