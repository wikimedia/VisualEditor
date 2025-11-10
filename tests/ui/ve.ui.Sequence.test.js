/*!
 * VisualEditor UserInterface Sequence tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.Sequence' );

/* Tests */

QUnit.test( 'findAndExecuteSequences', ( assert ) => {
	ve.ui.sequenceRegistry.register( new ve.ui.Sequence( 'TEST-codeBacktick', 'code', /`[^`]+`$/, 1, { startStrip: 1, delayed: false, setSelection: true } ) );
	ve.ui.sequenceRegistry.register( new ve.ui.Sequence( 'TEST-missingCommand', 'MISSING-COMMAND', [ 'a', 'b', 'c' ], 3 ) );

	const emptyDocData = [ { type: 'paragraph' }, { type: '/paragraph' }, { type: 'internalList' }, { type: '/internalList' } ],
		cases = [
			{
				content: '* ',
				expectedData: [
					{ type: 'list', attributes: { style: 'bullet' } },
					{ type: 'listItem' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } },
					{ type: '/paragraph' },
					{ type: '/listItem' },
					{ type: '/list' }
				],
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'Bullet list'
			},
			{
				content: '1. ',
				expectedData: [
					{ type: 'list', attributes: { style: 'number' } },
					{ type: 'listItem' },
					{ type: 'paragraph', internal: { generated: 'wrapper' } },
					{ type: '/paragraph' },
					{ type: '/listItem' },
					{ type: '/list' }
				],
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'Numbered list'
			},
			{
				content: '----',
				expectedData: [
					{ type: 'horizontalRule' },
					{ type: '/horizontalRule' },
					{ type: 'paragraph' },
					{ type: '/paragraph' }
				],
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'Horizontal rule'
			},
			{
				content: '`code`',
				expectedData: [
					{ type: 'paragraph' },
					...ve.dm.example.annotateText( 'code', { type: 'textStyle/code' } ),
					{ type: '/paragraph' }
				],
				expectedRangeOrSelection: new ve.Range( 1, 5 ),
				msg: 'Horizontal rule'
			},
			{
				content: 'abc',
				expectedData: [
					{ type: 'paragraph' },
					...'abc',
					{ type: '/paragraph' }
				],
				expectedRangeOrSelection: new ve.Range( 1, 4 ),
				msg: 'Missing command'
			}
		];

	cases.forEach( ( caseItem ) => {
		const view = ve.test.utils.createSurfaceViewFromDocument( ve.dm.example.createExampleDocumentFromData( emptyDocData ) );
		const model = view.getModel();
		model.getLinearFragment( new ve.Range( 1 ) ).insertContent( caseItem.content ).collapseToEnd();
		view.findAndExecuteSequences();
		assert.deepEqual(
			model.getDocument().getData( model.getDocument().getDocumentRange() ),
			ve.dm.example.preprocessAnnotations( caseItem.expectedData, model.getDocument().getStore() ).data,
			caseItem.msg + ': data'
		);
		const expectedSelection = ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), caseItem.expectedRangeOrSelection );
		assert.equalHash(
			model.getSelection(),
			expectedSelection,
			caseItem.msg + ': selection'
		);
	} );
} );

QUnit.test( 'getMessage', ( assert ) => {
	let seq = new ve.ui.Sequence( 'bulletStar', 'bulletWrapOnce', [ { type: 'paragraph' }, '*', ' ' ], 2 );
	assert.strictEqual( seq.getMessage(), '* ', 'bulletStar: getMessage returns joined string for array data' );
	assert.deepEqual( seq.getMessage( true ), [ '*', ' ' ], 'bulletStar: getMessage(true) returns array for array data' );

	seq = new ve.ui.Sequence( 'autocompleteEmojiCommands', 'openEmojiCompletions', /(^| ):$/, 0 );
	// RegExp data (synthetic, as real-world example)
	assert.strictEqual( seq.getMessage(), '/(^| ):$/', 'RegExp: getMessage returns regexp string for RegExp data' );
} );
