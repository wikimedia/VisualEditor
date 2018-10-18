/*!
 * VisualEditor ContentEditable linear arrow key down handler tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.LinearArrowKeyDownHandler', {
	// See https://github.com/platinumazure/eslint-plugin-qunit/issues/68
	// eslint-disable-next-line qunit/resolve-async
	beforeEach: function ( assert ) {
		var done = assert.async();
		return ve.init.platform.getInitializedPromise().then( done );
	}
} );

QUnit.test( 'special key down: linear arrow keys', function ( assert ) {
	var i,
		supportsSelectionExtend = ve.supportsSelectionExtend,
		complexTableDoc = ve.dm.example.createExampleDocument( 'complexTable' ),
		slugDoc = ve.dm.example.createExampleDocumentFromData(
			[
				{ type: 'alienBlock' }, { type: '/alienBlock' },
				{ type: 'internalList' }, { type: '/internalList' }
			]
		),
		inlineFocusableDoc = ve.dm.example.createExampleDocumentFromData(
			[
				{ type: 'paragraph' }, 'F', 'o', 'o', ' ', { type: 'alienInline' }, { type: '/alienInline' }, ' ', 'b', 'a', 'r', { type: '/paragraph' },
				{ type: 'internalList' }, { type: '/internalList' }
			]
		),
		blockImageDoc = ve.dm.example.createExampleDocumentFromData(
			[ { type: 'paragraph' }, 'F', 'o', 'o', { type: '/paragraph' } ].concat(
				ve.dm.example.blockImage.data.slice()
			).concat(
				[
					{ type: 'paragraph' }, 'B', 'a', 'r', { type: '/paragraph' },
					{ type: 'internalList' }, { type: '/internalList' }
				]
			)
		),
		cases = [
			// Within normal text. NOTE: these tests manually force the cursor to
			// move, because we rely on native browser actions for that.
			// As such, these are mostly testing to make sure that other
			// behavior doesn't trigger when it shouldn't.
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'LEFT' ],
				forceSelection: new ve.Range( 1 ),
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Cursor left in text'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'RIGHT' ],
				forceSelection: new ve.Range( 3 ),
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'Cursor right in text'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'UP' ],
				forceSelection: new ve.Range( 1 ),
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Cursor up in text'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 20 ),
				keys: [ 'DOWN' ],
				forceSelection: new ve.Range( 22 ),
				expectedRangeOrSelection: new ve.Range( 22 ),
				msg: 'Cursor down in text'
			},
			// Cursor with shift held to adjust selection
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'SHIFT+LEFT' ],
				forceSelection: new ve.Range( 1 ),
				expectedRangeOrSelection: new ve.Range( 2, 1 ),
				msg: 'Cursor left in text with shift'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 3, 2 ),
				keys: [ 'SHIFT+LEFT' ],
				// No forceSelection, so just check the selection is preserved
				expectedRangeOrSelection: new ve.Range( 3, 2 ),
				msg: 'Cursor left in text with shift on a backwards selection'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 3, 2 ),
				setup: function () {
					ve.supportsSelectionExtend = false;
				},
				teardown: function () {
					ve.supportsSelectionExtend = supportsSelectionExtend;
				},
				keys: [ 'SHIFT+LEFT' ],
				// No forceSelection, so just check the selection is preserved
				expectedRangeOrSelection: new ve.Range( 3, 2 ),
				msg: 'Cursor left in text with shift on a backwards selection with no extend'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'SHIFT+RIGHT' ],
				forceSelection: new ve.Range( 3 ),
				expectedRangeOrSelection: new ve.Range( 2, 3 ),
				msg: 'Cursor right in text with shift'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'SHIFT+UP' ],
				forceSelection: new ve.Range( 1 ),
				expectedRangeOrSelection: new ve.Range( 4, 1 ),
				msg: 'Cursor up in text with shift'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 20 ),
				keys: [ 'SHIFT+DOWN' ],
				forceSelection: new ve.Range( 22 ),
				expectedRangeOrSelection: new ve.Range( 20, 22 ),
				msg: 'Cursor down in text with shift'
			},
			// While focusing a block node
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'LEFT' ],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Cursor left off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'HOME' ],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Cursor home off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'UP' ],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Cursor up off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'PAGEUP' ],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Cursor page up off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'RIGHT' ],
				expectedRangeOrSelection: new ve.Range( 19 ),
				msg: 'Cursor right off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'END' ],
				expectedRangeOrSelection: new ve.Range( 19 ),
				msg: 'Cursor end off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'DOWN' ],
				expectedRangeOrSelection: new ve.Range( 19 ),
				msg: 'Cursor down off a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 5, 18 ),
				keys: [ 'PAGEDOWN' ],
				expectedRangeOrSelection: new ve.Range( 19 ),
				msg: 'Cursor page down off a block node'
			},
			// Cursoring onto a block node, which should focus it
			// Again, these are forcibly moving the cursor, so it's not a perfect
			// test; it's more checking how we fix up the selection afterwards.
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'RIGHT' ],
				// Force cursor into the cursor holder before the block image
				forceSelection: {
					anchorNode: '.ve-ce-cursorHolder-before',
					// Emulating Chromium 50, right arrow lands at offset 0
					anchorOffset: 0,
					focusNode: '.ve-ce-cursorHolder-before',
					focusOffset: 0
				},
				expectedRangeOrSelection: new ve.Range( 5, 18 ),
				msg: 'Cursor right onto a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 19 ),
				keys: [ 'LEFT' ],
				// Force cursor into the cursor holder after the block image
				forceSelection: {
					anchorNode: '.ve-ce-cursorHolder-after',
					// Emulating Chromium 50, left arrow lands at offset 1
					anchorOffset: 1,
					focusNode: '.ve-ce-cursorHolder-after',
					focusOffset: 1
				},
				expectedRangeOrSelection: new ve.Range( 18, 5 ),
				msg: 'Cursor left onto a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'DOWN' ],
				// Force cursor into the cursor holder before the block image
				forceSelection: {
					anchorNode: '.ve-ce-cursorHolder-before',
					// Emulating Chromium 50, down arrow lands at offset 0
					anchorOffset: 0,
					focusNode: '.ve-ce-cursorHolder-before',
					focusOffset: 0
				},
				expectedRangeOrSelection: new ve.Range( 5, 18 ),
				msg: 'Cursor down onto a block node'
			},
			{
				htmlOrDoc: blockImageDoc,
				rangeOrSelection: new ve.Range( 20 ),
				keys: [ 'UP' ],
				// Force cursor into the cursor holder after the block image
				forceSelection: {
					anchorNode: '.ve-ce-cursorHolder-after',
					// Emulating Chromium 50, up arrow lands at offset 0
					anchorOffset: 0,
					focusNode: '.ve-ce-cursorHolder-after',
					focusOffset: 0
				},
				expectedRangeOrSelection: new ve.Range( 18, 5 ),
				msg: 'Cursor up onto a block node'
			},
			{
				htmlOrDoc: complexTableDoc,
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'TAB' ],
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 51 ),
					fromCol: 0,
					fromRow: 0
				},
				msg: 'Tab inside a table caption moves to first row of table'
			},
			{
				htmlOrDoc: complexTableDoc,
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'SHIFT+TAB' ],
				expectedRangeOrSelection: new ve.Range( 0 ),
				msg: 'Shift+tab inside a table caption moves out of table'
			},
			{
				htmlOrDoc: slugDoc,
				rangeOrSelection: new ve.Range( 0 ),
				keys: [ 'DOWN' ],
				expectedRangeOrSelection: new ve.Range( 0, 2 ),
				msg: 'Down from a block slug'
			},
			{
				htmlOrDoc: slugDoc,
				rangeOrSelection: new ve.Range( 0 ),
				keys: [ 'RIGHT' ],
				expectedRangeOrSelection: new ve.Range( 0, 2 ),
				msg: 'Right from a block slug'
			},
			{
				htmlOrDoc: slugDoc,
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'UP' ],
				expectedRangeOrSelection: new ve.Range( 2, 0 ),
				msg: 'Up from a block slug'
			},
			{
				htmlOrDoc: slugDoc,
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'LEFT' ],
				expectedRangeOrSelection: new ve.Range( 2, 0 ),
				msg: 'Left from a block slug'
			},
			{
				htmlOrDoc: inlineFocusableDoc,
				rangeOrSelection: new ve.Range( 5, 7 ),
				keys: [ 'LEFT' ],
				expectedRangeOrSelection: new ve.Range( 5 ),
				msg: 'Left off an inline focusable'
			},
			{
				htmlOrDoc: inlineFocusableDoc,
				rangeOrSelection: new ve.Range( 5, 7 ),
				keys: [ 'RIGHT' ],
				expectedRangeOrSelection: new ve.Range( 7 ),
				msg: 'Right off an inline focusable'
			},
			{
				htmlOrDoc: inlineFocusableDoc,
				rangeOrSelection: new ve.Range( 5, 7 ),
				keys: [ 'SHIFT+RIGHT' ],
				forceSelection: new ve.Range( 8 ),
				expectedRangeOrSelection: new ve.Range( 5, 8 ),
				msg: 'Shift+right off an inline focusable'
			},
			{
				htmlOrDoc: inlineFocusableDoc,
				rangeOrSelection: new ve.Range( 5, 7 ),
				keys: [ 'SHIFT+RIGHT' ],
				forceSelection: new ve.Range( 4 ),
				expectedRangeOrSelection: new ve.Range( 5, 4 ),
				msg: 'Shift+left off an inline focusable'
			},
			{
				htmlOrDoc: inlineFocusableDoc,
				rangeOrSelection: new ve.Range( 7, 5 ),
				keys: [ 'SHIFT+RIGHT' ],
				forceSelection: new ve.Range( 4 ),
				expectedRangeOrSelection: new ve.Range( 5, 4 ),
				msg: 'Shift+left off an inline focusable (backwards selection)'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		if ( cases[ i ].setup ) {
			cases[ i ].setup();
		}
		ve.test.utils.runSurfaceHandleSpecialKeyTest( assert, cases[ i ], true );
		if ( cases[ i ].teardown ) {
			cases[ i ].teardown();
		}
	}
} );
