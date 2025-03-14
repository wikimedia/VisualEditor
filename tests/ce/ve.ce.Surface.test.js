/*!
 * VisualEditor ContentEditable Surface tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.Surface', {
	// See https://github.com/platinumazure/eslint-plugin-qunit/issues/68
	// eslint-disable-next-line qunit/resolve-async
	beforeEach: function ( assert ) {
		const done = assert.async();
		ve.ui.dataTransferHandlerFactory.register( ve.test.utils.ImageTransferHandler );
		return ve.init.platform.getInitializedPromise().then( done );
	},
	afterEach: function () {
		ve.ui.dataTransferHandlerFactory.unregister( ve.test.utils.ImageTransferHandler );
	}
} );

/* Tests */

{
	const keys = {},
		keyMap = ve.ui.Trigger.static.primaryKeyMap;
	for ( const keyCode in keyMap ) {
		keys[ keyMap[ keyCode ].toUpperCase() ] = keyCode;
	}
	ve.test.utils.triggerKeys = keys;
}

ve.test.utils.runSurfaceHandleSpecialKeyTest = function ( assert, caseItem ) {
	let promise = Promise.resolve();
	const then = ( f ) => {
			promise = promise.then( f );
		},
		htmlOrDoc = caseItem.htmlOrDoc,
		rangeOrSelection = caseItem.rangeOrSelection,
		keys = caseItem.keys,
		expectedData = caseItem.expectedData,
		expectedRangeOrSelection = caseItem.expectedRangeOrSelection,
		expectedDefaultPrevented = caseItem.expectedDefaultPrevented,
		msg = caseItem.msg,
		forceSelection = caseItem.forceSelection,
		view = typeof htmlOrDoc === 'string' ?
			ve.test.utils.createSurfaceViewFromHtml( htmlOrDoc, caseItem.surfaceConfig ) :
			( htmlOrDoc instanceof ve.ce.Surface ? htmlOrDoc : ve.test.utils.createSurfaceViewFromDocument( htmlOrDoc || ve.dm.example.createExampleDocument(), caseItem.surfaceConfig ) ),
		model = view.getModel(),
		data = ve.copy( model.getDocument().getFullData() ),
		wereDefaultsPrevented = [],
		execCommands = {
			BACKSPACE: 'delete',
			'SHIFT+BACKSPACE': 'delete',
			DELETE: 'forwardDelete',
			'SHIFT+DELETE': 'cut',
			// There are no execCommands for CTRL+BACKSPACE/DELETE (delete word)
			// These enter commands should always be prevented
			ENTER: 'insertParagraph',
			'SHIFT+ENTER': 'insertParagraph'
		};

	// Platform-variant
	execCommands[ ( ve.getSystemPlatform() === 'mac' ? 'CMD' : 'CTRL' ) + '+ENTER' ] = 'insertParagraph';

	if ( caseItem.setup ) {
		caseItem.setup();
	}

	// Below this point, any code that might throw an exception should run deferred,
	// so the asynchronous cleanup at the lexical end of this function will always run
	then( () => {
		ve.test.utils.hijackEventSequencerTimeouts( view.eventSequencer );
		model.setSelection(
			ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection )
		);
	} );

	function doKey( keyString ) {
		const keyParts = keyString.split( '+' ),
			key = keyParts.pop(),
			keyCode = OO.ui.Keys[ key ] || ve.test.utils.triggerKeys[ key ];
		const keyData = {
			keyCode: keyCode,
			which: keyCode,
			shiftKey: keyParts.includes( 'SHIFT' ),
			ctrlKey: keyParts.includes( 'CTRL' ),
			metaKey: keyParts.includes( 'CMD' )
		};
		const keyDownEvent = ve.test.utils.createTestEvent( { type: 'keydown' }, keyData );
		view.eventSequencer.onEvent( 'keydown', keyDownEvent );
		wereDefaultsPrevented.push( keyDownEvent.isDefaultPrevented() );
		if ( !keyDownEvent.isDefaultPrevented() ) {
			if ( execCommands[ keyString ] ) {
				document.execCommand( execCommands[ keyString ] );
			}
			view.eventSequencer.onEvent( 'keypress', ve.test.utils.createTestEvent( { type: 'keypress' }, keyData ) );
		}
		if ( forceSelection instanceof ve.Range ) {
			view.showSelectionState( view.getSelectionState( forceSelection ) );
		} else if ( forceSelection && forceSelection.focusNode ) {
			view.showSelectionState( new ve.SelectionState( {
				anchorNode: view.$element.find( forceSelection.anchorNode )[ 0 ],
				anchorOffset: forceSelection.anchorOffset,
				focusNode: view.$element.find( forceSelection.focusNode )[ 0 ],
				focusOffset: forceSelection.focusOffset
			} ) );
		}
		view.eventSequencer.onEvent( 'keyup', ve.test.utils.createTestEvent( { type: 'keyup' }, keyData ) );
		view.eventSequencer.endLoop();
	}
	keys.forEach( function ( keyString ) {
		// TODO: It seems likely this would break without the deferral below, because some
		// event handlers use setTimeout for delayed execution of parts of their code.
		// Ideally the timing of that execution would be made less obscure and fragile, e.g.
		// by using promises instead.
		then( doKey.bind( this, keyString ) );
	} );

	then( () => {
		if ( expectedData ) {
			expectedData( data );
			assert.equalLinearData( model.getDocument().getFullData(), data, msg + ': data' );
		}
		assert.deepEqual( wereDefaultsPrevented, expectedDefaultPrevented || Array( keys.length ).fill( true ), msg + ': defaultsPrevented' );

		const expectedSelection = ve.dm.Selection.static.newFromJSON( expectedRangeOrSelection instanceof ve.Range ?
			{ type: 'linear', range: expectedRangeOrSelection } :
			expectedRangeOrSelection
		);
		assert.equalHash( model.getSelection(), expectedSelection, msg + ': selection' );
		if ( typeof caseItem.expectedHasFocus === 'boolean' ) {
			assert.strictEqual( document.activeElement === view.getDocument().getDocumentNode().$element[ 0 ], caseItem.expectedHasFocus, msg + ': has focus' );
		}
		if ( view.surface && view.surface.destroy ) {
			// If view was created as part of a UI surface, destroy that too
			// TODO: This should probably be done by the creator of the UI surface,
			// but view surfaces don't emit events.
			view.surface.destroy();
		} else {
			view.destroy();
		}
	} );
	return promise.catch( ( error ) => {
		assert.true( false, caseItem.msg + ': throws ' + error );
	} ).finally( () => {
		if ( caseItem.teardown ) {
			try {
				caseItem.teardown();
			} catch ( error ) {
				assert.true( false, caseItem.msg + ': teardown throws ' + error );
			}
		}
	} );
};

QUnit.test( 'handleObservedChanges (content changes)', ( assert ) => {
	const linkHash = 'hdee7b89d544aa584',
		cases = [
			{
				prevHtml: '<p></p>',
				prevRange: new ve.Range( 1 ),
				nextHtml: '<p>A</p>',
				nextRange: new ve.Range( 2 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [ 'A' ],
							remove: []
						},
						{ type: 'retain', length: 3 }
					]
				],
				msg: 'Simple insertion into empty paragraph'
			},
			{
				prevHtml: '<p>A</p>',
				prevRange: new ve.Range( 1, 2 ),
				nextHtml: '<p>B</p>',
				nextRange: new ve.Range( 2 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [ 'B' ],
							remove: [ 'A' ]
						},
						{ type: 'retain', length: 3 }
					]
				],
				msg: 'Simple replace'
			},
			{
				prevHtml: '<p><a href="Foo">A</a><a href="Bar">FooX?</a></p>',
				prevRange: new ve.Range( 5, 6 ),
				nextHtml: '<p><a href="Foo">A</a><a href="Bar">FooB?</a></p>',
				nextRange: new ve.Range( 6 ),
				expectedOps: [
					[
						{ type: 'retain', length: 5 },
						{
							type: 'replace',
							insert: [ [ 'B', [ linkHash ] ] ],
							remove: [ [ 'X', [ linkHash ] ] ]
						},
						{ type: 'retain', length: 4 }
					]
				],
				msg: 'Replace into non-zero annotation next to word break'
			},
			{
				prevHtml: '<p><b>X</b></p>',
				prevRange: new ve.Range( 2 ),
				nextHtml: '<p><b>XY</b></p>',
				nextRange: new ve.Range( 3 ),
				expectedOps: [
					[
						{ type: 'retain', length: 2 },
						{
							type: 'replace',
							insert: [ [ 'Y', [ 'h96560f31226e3199' ] ] ],
							remove: []
						},
						{ type: 'retain', length: 3 }
					]
				],
				msg: 'Append into bold'
			},
			{
				prevHtml: '<p><b>X</b></p>',
				prevRange: new ve.Range( 2 ),
				prevFocusIsAfterAnnotationBoundary: true,
				nextHtml: '<p><b>X</b>Y</p>',
				nextRange: new ve.Range( 3 ),
				expectedOps: [
					[
						{ type: 'retain', length: 2 },
						{
							type: 'replace',
							insert: [ 'Y' ],
							remove: []
						},
						{ type: 'retain', length: 3 }
					]
				],
				msg: 'Append after bold'
			},
			{
				prevHtml: '<p>Foo</p>',
				prevRange: new ve.Range( 4 ),
				nextHtml: '<p>Foo </p>',
				nextRange: new ve.Range( 5 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ' ' ],
							remove: []
						},
						{ type: 'retain', length: 3 }
					]
				],
				expectsBreakpoint: true, // Adding a word break triggers a breakpoint
				msg: 'Inserting a word break'
			},
			{
				prevHtml: '<p>Foo</p>',
				prevRange: new ve.Range( 4 ),
				nextHtml: '<p>Fo</p>',
				nextRange: new ve.Range( 3 ),
				expectedOps: [
					[
						{ type: 'retain', length: 3 },
						{
							type: 'replace',
							insert: [],
							remove: [ 'o' ]
						},
						{ type: 'retain', length: 3 }
					]
				],
				expectsBreakpoint: true, // Any delete triggers a breakpoint
				msg: 'Deleting text'
			},
			{
				prevHtml: '<p>Foo</p>',
				prevRange: new ve.Range( 4 ),
				nextHtml: '<p>Foo</p>',
				nextRange: new ve.Range( 1 ),
				expectedOps: [],
				expectsBreakpoint: false,
				msg: 'Just moving the selection'
			},
			{
				prevHtml: '<p>Foo</p><p>Bar</p>',
				prevRange: new ve.Range( 4 ),
				nextHtml: '<p>Foo</p><p>Bar</p>',
				nextRange: new ve.Range( 5 ),
				expectedOps: [],
				expectsBreakpoint: false,
				expectedRangeOrSelection: new ve.Range( 6 ),
				msg: 'Moving the selection to a non-cursorable location'
			}
		];

	function testRunner( prevHtml, prevRange, prevFocusIsAfterAnnotationBoundary, nextHtml, nextRange, expectedOps, expectedRangeOrSelection, expectsBreakpoint, msg ) {
		const delayed = [],
			view = ve.test.utils.createSurfaceViewFromHtml( prevHtml ),
			model = view.getModel(),
			node = view.getDocument().getDocumentNode().children[ 0 ],
			prevNode = $( prevHtml )[ 0 ],
			nextNode = $( nextHtml )[ 0 ],
			prev = {
				node: node,
				text: ve.ce.getDomText( prevNode ),
				textState: new ve.ce.TextState( prevNode ),
				veRange: prevRange,
				focusIsAfterAnnotationBoundary: prevFocusIsAfterAnnotationBoundary || false
			},
			next = {
				node: node,
				text: ve.ce.getDomText( nextNode ),
				textState: new ve.ce.TextState( nextNode ),
				veRange: nextRange,
				selectionChanged: !nextRange.equals( prevRange ),
				contentChanged: true
			},
			initialBreakpoints = model.undoStack.length;

		view.afterRenderLock = function ( callback ) {
			delayed.push( callback );
		};

		// Set model linear selection, so that insertion annotations are primed correctly
		model.setLinearSelection( prevRange );
		view.handleObservedChanges( prev, next );
		delayed.forEach( ( callback ) => {
			callback();
		} );
		const txs = ( model.getHistory()[ 0 ] || {} ).transactions || [];
		const ops = txs.map( ( tx ) => tx.getOperations() );
		assert.deepEqual( ops, expectedOps, msg + ': keys' );
		assert.equalRange( model.getSelection().getRange(), expectedRangeOrSelection, msg + ': range' );
		assert.strictEqual( initialBreakpoints !== model.undoStack.length, !!expectsBreakpoint, msg + ': breakpoint' );

		view.destroy();
	}

	cases.forEach( ( caseItem ) => {
		testRunner(
			caseItem.prevHtml, caseItem.prevRange, caseItem.prevFocusIsAfterAnnotationBoundary || false,
			caseItem.nextHtml, caseItem.nextRange,
			caseItem.expectedOps, caseItem.expectedRangeOrSelection || caseItem.nextRange, caseItem.expectsBreakpoint, caseItem.msg
		);
	} );

} );

QUnit.test( 'handleDataTransfer/handleDataTransferItems', ( assert ) => {
	const surface = ve.test.utils.createViewOnlySurfaceFromHtml( '' ),
		view = surface.getView(),
		model = surface.getModel(),
		linkAction = ve.ui.actionFactory.create( 'link', surface ),
		link = linkAction.getLinkAnnotation( 'http://foo.com' ),
		// Don't hard-code link index as it may depend on the LinkAction used
		linkHash = model.getDocument().getStore().hashOfValue( link ),
		fragment = model.getLinearFragment( new ve.Range( 1 ) ),
		image = {
			name: 'image.jpg',
			type: 'image/jpeg',
			size: 30 * 1024
		},
		imageItem = {
			kind: 'file',
			type: 'image/jpeg',
			getAsFile: () => image
		},
		cases = [
			{
				msg: 'URL',
				dataTransfer: {
					items: [
						{
							kind: 'string',
							type: 'text/uri-list'
						}
					],
					getData: ( type ) => type === 'text/uri-list' ? '#comment\nhttp://foo.com\n' : ''
				},
				isPaste: true,
				expectedData: [
					...ve.dm.example.annotateText( 'http://foo.com', linkHash )
				]
			},
			{
				msg: 'Image only',
				dataTransfer: {
					items: [ imageItem ],
					files: [ image ],
					getData: () => ''
				},
				isPaste: true,
				expectedData: [ ...'image.jpg' ]
			},
			{
				msg: 'Image only (no items API)',
				dataTransfer: {
					files: [ image ],
					getData: () => ''
				},
				isPaste: true,
				expectedData: [ ...'image.jpg' ]
			},
			{
				msg: 'Image with HTML fallbacks',
				dataTransfer: {
					items: [ imageItem ],
					files: [ image ],
					getData: ( type ) => type === 'text/html' ? '<img src="image.jpg" alt="fallback"><!-- image fallback metadata -->' : ''
				},
				isPaste: true,
				expectedData: [ ...'image.jpg' ]
			},
			{
				msg: 'Image ignored when HTML contains content',
				dataTransfer: {
					items: [ imageItem ],
					files: [ image ],
					getData: ( type ) => type === 'text/html' ? 'html' : ''
				},
				isPaste: true,
				// HTML is not handled by handleDataTransfer
				expectedData: []
			},
			{
				msg: 'Image ignored when HTML contains extra images',
				dataTransfer: {
					items: [ imageItem ],
					files: [ image ],
					getData: ( type ) => type === 'text/html' ? '<img src="image.jpg"><img src="image2.jpg">' : ''
				},
				isPaste: true,
				// HTML is not handled by handleDataTransfer
				expectedData: []
			}
		];

	cases.forEach( ( caseItem ) => {
		fragment.select();
		view.handleDataTransfer( caseItem.dataTransfer, caseItem.isPaste );
		assert.equalLinearData( model.getDocument().getFullData( fragment.getSelection().getRange() ), caseItem.expectedData, caseItem.msg );
		model.undo();
	} );
} );

QUnit.test( 'getSelectionState', ( assert ) => {
	const cases = [
		{
			msg: 'Grouped aliens',
			html: ve.dm.example.singleLine`
				<p>
					Foo
					<span rel="ve:Alien" about="g1">Bar</span>
					<span rel="ve:Alien" about="g1">Baz</span>
					<span rel="ve:Alien" about="g1">Quux</span>
					Whee
				</p>
				<p>
					2<b>n</b>d
				</p>
			`,
			// The offset path of the result of getNodeAndOffset for
			// each offset
			expected: [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 1 ],
				[ 0, 0, 2 ],
				[ 0, 0, 3 ],
				null,
				[ 0, 4, 0 ],
				[ 0, 4, 1 ],
				[ 0, 4, 2 ],
				[ 0, 4, 3 ],
				[ 0, 4, 4 ],
				[ 0, 4, 4 ],
				[ 1, 0, 0 ],
				[ 1, 0, 1 ],
				[ 1, 1, 0, 1 ],
				[ 1, 2, 1 ]
			]
		},
		{
			msg: 'No cursorable offset (no native selection)',
			html: '<article><section rel="ve:SectionPlaceholder"></section></article>',
			expected: [
				false,
				false,
				false,
				false
			]
		},
		{
			msg: 'Simple example doc',
			html: ve.dm.example.html,
			expected: ve.dm.example.offsetPaths
		}
	];

	function TestDmSectionPlaceholderNode() {
		TestDmSectionPlaceholderNode.super.apply( this, arguments );
	}
	OO.inheritClass( TestDmSectionPlaceholderNode, ve.dm.LeafNode );
	TestDmSectionPlaceholderNode.static.name = 'sectionPlaceholder';
	TestDmSectionPlaceholderNode.static.matchTagNames = [ 'section' ];
	TestDmSectionPlaceholderNode.static.matchRdfaTypes = [ 've:SectionPlaceholder' ];
	TestDmSectionPlaceholderNode.prototype.canHaveSlugBefore = function () {
		return false;
	};
	TestDmSectionPlaceholderNode.prototype.canHaveSlugAfter = function () {
		return false;
	};
	ve.dm.modelRegistry.register( TestDmSectionPlaceholderNode );

	function TestCeSectionPlaceholderNode() {
		TestCeSectionPlaceholderNode.super.apply( this, arguments );
		this.$element
			.addClass( 'test-ce-sectionPlaceholderNode' )
			.append( $( '<hr>' ) );
	}
	OO.inheritClass( TestCeSectionPlaceholderNode, ve.ce.LeafNode );
	TestCeSectionPlaceholderNode.static.tagName = 'section';
	TestCeSectionPlaceholderNode.static.name = 'sectionPlaceholder';
	ve.ce.nodeFactory.register( TestCeSectionPlaceholderNode );

	cases.forEach( ( caseItem ) => {
		const view = ve.test.utils.createSurfaceViewFromHtml( caseItem.html );
		const internalListNode = view.getModel().getDocument().getInternalList().getListNode();
		const rootElement = view.getDocument().getDocumentNode().$element[ 0 ];
		for ( let i = 0, l = internalListNode.getOuterRange().start; i < l; i++ ) {
			const node = view.getDocument().getDocumentNode().getNodeFromOffset( i );
			if ( caseItem.expected[ i ] === null ) {
				assert.strictEqual( node.isFocusable(), true, 'Focusable node at ' + i );
			} else {
				const selection = view.getSelectionState( new ve.Range( i ) );
				if ( caseItem.expected[ i ] === false ) {
					assert.strictEqual( selection.anchorNode, null, 'No selection at ' + i );
				} else {
					assert.deepEqual(
						ve.getOffsetPath( rootElement, selection.anchorNode, selection.anchorOffset ),
						caseItem.expected[ i ],
						`Path at ${ i } in ${ caseItem.msg }`
					);
				}
				// Check that this doesn't throw exceptions
				view.showSelectionState( selection );
			}
		}
		view.destroy();
	} );

	ve.dm.modelRegistry.unregister( TestDmSectionPlaceholderNode );
	ve.ce.nodeFactory.unregister( TestCeSectionPlaceholderNode );
} );

QUnit.test( 'findBlockSlug', ( assert ) => {
	const view = ve.test.utils.createSurfaceViewFromHtml( '<div><div><p>Foo</p></div></div><div><p>Bar</p></div>' ),
		dmDoc = view.getModel().getDocument(),
		len = dmDoc.getLength(),
		slugOffsets = { 0: true, 1: true, 8: true, 9: true, 16: true };

	for ( let i = 0; i <= len; i++ ) {
		const slug = view.findBlockSlug( new ve.Range( i ) );
		if ( slugOffsets[ i ] ) {
			assert.true( slug instanceof HTMLElement, 'Block slug found at offset ' + i );
		} else {
			assert.strictEqual( slug, null, 'No block slug found at offset ' + i );
		}
	}
} );

QUnit.test( 'selectFirstSelectableContentOffset/selectLastSelectableContentOffset', ( assert ) => {
	const cases = [
		{
			msg: 'Block images around paragraph',
			htmlOrDoc: ve.dm.example.createExampleDocumentFromData( [
				...ve.dm.example.blockImage.data,
				{ type: 'paragraph' }, ...'Foo', { type: '/paragraph' },
				...ve.dm.example.blockImage.data,
				{ type: 'internalList' },
				{ type: '/internalList' }
			], null, ve.dm.example.baseUri ),
			firstRange: new ve.Range( 14 ),
			lastRange: new ve.Range( 17 )
		},
		{
			msg: 'Tables around paragraph',
			htmlOrDoc: ve.dm.example.createExampleDocumentFromData( [
				...ve.dm.example.complexTable.slice( 0, -2 ),
				{ type: 'paragraph' }, ...'Foo', { type: '/paragraph' },
				...ve.dm.example.complexTable.slice( 0, -2 ),
				{ type: 'internalList' },
				{ type: '/internalList' }
			], null, ve.dm.example.baseUri ),
			firstRange: new ve.Range( 52 ),
			lastRange: new ve.Range( 55 )
		},
		{
			msg: 'Only block images (no suitable position)',
			htmlOrDoc: ve.dm.example.createExampleDocumentFromData( [
				...ve.dm.example.blockImage.data,
				...ve.dm.example.blockImage.data,
				{ type: 'internalList' },
				{ type: '/internalList' }
			], null, ve.dm.example.baseUri ),
			firstRange: null,
			lastRange: null
		},
		{
			msg: 'Sections (ve.ce.ActiveNode) can take focus',
			htmlOrDoc: ve.dm.example.createExampleDocumentFromData(
				ve.dm.example.domToDataCases[ 'article and sections' ].data,
				null, ve.dm.example.baseUri
			),
			firstRange: new ve.Range( 3 ),
			lastRange: new ve.Range( 20 )
		}
	];
	cases.forEach( ( caseItem ) => {
		const htmlOrDoc = caseItem.htmlOrDoc;
		const view = typeof htmlOrDoc === 'string' ?
			ve.test.utils.createSurfaceViewFromHtml( htmlOrDoc ) :
			( htmlOrDoc instanceof ve.ce.Surface ? htmlOrDoc : ve.test.utils.createSurfaceViewFromDocument( htmlOrDoc || ve.dm.example.createExampleDocument() ) );
		const firstRange = caseItem.firstRange;
		const lastRange = caseItem.lastRange;

		view.selectFirstSelectableContentOffset();
		assert.equalRange(
			view.getModel().getSelection().getCoveringRange(),
			firstRange,
			caseItem.msg + ': first'
		);

		view.selectLastSelectableContentOffset();
		assert.equalRange(
			view.getModel().getSelection().getCoveringRange(),
			lastRange,
			caseItem.msg + ': last'
		);
	} );
} );

QUnit.test( 'getViewportRange', ( assert ) => {
	const doc = ve.dm.example.createExampleDocumentFromData( [
		{ type: 'paragraph' },
		// 1
		...'Foo',
		// 4
		{ type: '/paragraph' },
		{ type: 'alienBlock', originalDomElements: $.parseHTML( '<div style="width: 100px; height: 1000px;">' ) },
		// Vertiical offset: Approx. 34 - 1034
		{ type: '/alienBlock' },
		{ type: 'paragraph' },
		// 8
		...'Bar',
		// 11
		{ type: '/paragraph' },
		{ type: 'alienBlock', originalDomElements: $.parseHTML( '<div style="width: 100px; height: 1000px;">' ) },
		// Vertiical offset: Approx. 1084 - 2084
		{ type: '/alienBlock' },
		{ type: 'paragraph' },
		// 15
		...'Baz',
		// 18
		{ type: '/paragraph' },
		{ type: 'paragraph', originalDomElements: $.parseHTML( '<p style="display: none;">' ) },
		// 20
		...'Qux',
		// 23
		{ type: '/paragraph' },
		{ type: 'internalList' },
		{ type: '/internalList' }
	] );
	const cases = [
		{
			msg: 'Document with only an alien returns whole range',
			htmlOrDoc: ve.dm.example.createExampleDocumentFromData( [
				{ type: 'alienBlock' },
				{ type: '/alienBlock' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			] ),
			expectedContains: new ve.Range( 0, 2 ),
			expectedCovering: new ve.Range( 0, 2 )
		},
		{
			msg: 'Viewport from top of page to first alien',
			htmlOrDoc: doc,
			viewportDimensions: { top: 0, bottom: 500 },
			expectedContains: new ve.Range( 1, 4 ),
			expectedCovering: new ve.Range( 0, 8 )
		},
		{
			msg: 'Viewport from to first alien to second alien',
			htmlOrDoc: doc,
			viewportDimensions: { top: 500, bottom: 1600 },
			expectedContains: new ve.Range( 8, 11 ),
			expectedCovering: new ve.Range( 4, 15 )
		},
		{
			msg: 'Viewport from to second alien to end of document',
			htmlOrDoc: doc,
			viewportDimensions: { top: 1600, bottom: 3000 },
			expectedContains: new ve.Range( 15, 18 ),
			expectedCovering: new ve.Range( 11, 24 )
		}
	];

	cases.forEach( ( caseItem ) => {
		const htmlOrDoc = caseItem.htmlOrDoc;
		const view = typeof htmlOrDoc === 'string' ?
			ve.test.utils.createSurfaceViewFromHtml( htmlOrDoc ) :
			( htmlOrDoc instanceof ve.ce.Surface ? htmlOrDoc : ve.test.utils.createSurfaceViewFromDocument( htmlOrDoc || ve.dm.example.createExampleDocument() ) );

		view.surface.getViewportDimensions = function () {
			return ve.extendObject( { top: 0, bottom: 1000, left: 0, right: 1000 }, caseItem.viewportDimensions );
		};

		assert.equalRange(
			view.getViewportRange( false ),
			caseItem.expectedContains,
			caseItem.msg + ': contains'
		);

		assert.equalRange(
			view.getViewportRange( true ),
			caseItem.expectedCovering,
			caseItem.msg + ': covering'
		);
	} );
} );

/* eslint-disable qunit/resolve-async */
QUnit.test( 'afterMutations', ( assert ) => {
	let cases = null, done = null;
	function getDescendant( node, path ) {
		for ( let i = 0, len = path.length; i < len; i++ ) {
			node = node.children[ path[ i ] ];
		}
		return node;
	}
	function simplify( data ) {
		return data.map( ( item ) => typeof item === 'object' ? { type: item.type } : item );
	}
	function runCase( i ) {
		const caseItem = cases[ i ];
		const view = ve.test.utils.createSurfaceViewFromHtml( caseItem.html );
		const dmDoc = view.getModel().getDocument();
		caseItem.domRemovalPaths.forEach( ( path ) => {
			const node = getDescendant( view.documentView.documentNode, path );
			node.$element[ 0 ].remove();
		} );
		// The mutation observer runs on the microtask queue, so definitely before setTimeout
		setTimeout( () => {
			const data = dmDoc.getData(
				new ve.Range( caseItem.testRange[ 0 ], caseItem.testRange[ 1 ] )
			);
			assert.deepEqual( simplify( data ), caseItem.expectedData, caseItem.msg );
			done();
			if ( i + 1 < cases.length ) {
				runCase( i + 1 );
			}
		} );
	}
	cases = [
		{
			html: '<p>Foo</p><p>Bar</p><p>Baz</p>',
			domRemovalPaths: [ [ 0 ] ],
			testRange: [ 0, 5 ],
			expectedData: [ { type: 'paragraph' }, ...'Bar', { type: '/paragraph' } ],
			msg: 'DOM paragraph removal'
		},
		{
			html: '<p>Foo</p><ul><li><p>one</p></li><li><p>two</p></li><li><p>three</p></li></ul><p>Bar</p>',
			domRemovalPaths: [ [ 1, 0 ], [ 1, 2 ] ],
			testRange: [ 5, 14 ],
			expectedData: [
				{ type: 'list' },
				{ type: 'listItem' },
				{ type: 'paragraph' },
				...'two',
				{ type: '/paragraph' },
				{ type: '/listItem' },
				{ type: '/list' }
			],
			msg: 'DOM li removals'
		},
		{
			html: '<p>Foo</p><div><p>abcde</p></div><p>Bar</p>',
			domRemovalPaths: [ [ 1 ] ],
			testRange: [ 0, 10 ],
			expectedData: [
				{ type: 'paragraph' },
				...'Foo',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'Bar',
				{ type: '/paragraph' }
			],
			msg: 'DOM div removal'
		}
	];
	done = assert.async( cases.length );
	runCase( 0 );
} );
/* eslint-enable qunit/resolve-async */

/* Methods with return values */
// TODO: ve.ce.Surface#getSelection
// TODO: ve.ce.Surface#getSurface
// TODO: ve.ce.Surface#getModel
// TODO: ve.ce.Surface#getDocument
// TODO: ve.ce.Surface#getFocusedNode
// TODO: ve.ce.Surface#isRenderingLocked

/* Methods without return values */
// TODO: ve.ce.Surface#initialize
// TODO: ve.ce.Surface#enable
// TODO: ve.ce.Surface#disable
// TODO: ve.ce.Surface#destroy
// TODO: ve.ce.Surface#focus
// TODO: ve.ce.Surface#onDocumentFocus
// TODO: ve.ce.Surface#onDocumentBlur
// TODO: ve.ce.Surface#onDocumentMouseDown
// TODO: ve.ce.Surface#onDocumentMouseUp
// TODO: ve.ce.Surface#onDocumentMouseMove
// TODO: ve.ce.Surface#onDocumentDragOver
// TODO: ve.ce.Surface#onDocumentDrop
// TODO: ve.ce.Surface#onDocumentKeyDown
// TODO: ve.ce.Surface#onDocumentKeyPress
// TODO: ve.ce.Surface#afterDocumentKeyDown
// TODO: ve.ce.Surface#afterDocumentMouseDown
// TODO: ve.ce.Surface#afterDocumentMouseUp
// TODO: ve.ce.Surface#afterDocumentKeyPress
// TODO: ve.ce.Surface#onDocumentKeyUp
// TODO: ve.ce.Surface#onDocumentCompositionEnd
// TODO: ve.ce.Surface#onChange
// TODO: ve.ce.Surface#onSurfaceObserverSelectionChange
// TODO: ve.ce.Surface#onLock
// TODO: ve.ce.Surface#onUnlock
// TODO: ve.ce.Surface#handleInsertion
// TODO: ve.ce.Surface#showModelSelection
// TODO: ve.ce.Surface#appendHighlights
// TODO: ve.ce.Surface#incRenderLock
// TODO: ve.ce.Surface#decRenderLock
