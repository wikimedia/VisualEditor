/*!
 * VisualEditor ContentEditable ClipboardHandler tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.ClipboardHandler', {
	// See https://github.com/platinumazure/eslint-plugin-qunit/issues/68
	// eslint-disable-next-line qunit/resolve-async
	beforeEach: function ( assert ) {
		const done = assert.async();
		ve.ui.dataTransferHandlerFactory.register( ve.test.utils.ImageTransferHandler );
		ve.test.utils.DummyPlatform.prototype.generateUniqueIdOrig = ve.test.utils.DummyPlatform.prototype.generateUniqueId;
		ve.test.utils.DummyPlatform.prototype.generateUniqueId = () => 'testid';
		return ve.init.platform.getInitializedPromise().then( done );
	},
	afterEach: function () {
		ve.test.utils.DummyPlatform.prototype.generateUniqueId = ve.test.utils.DummyPlatform.prototype.generateUniqueIdOrig;
		ve.ui.dataTransferHandlerFactory.unregister( ve.test.utils.ImageTransferHandler );
	}
} );

ve.test.utils.runSurfacePasteTest = function ( assert, item ) {
	const htmlOrView = item.documentHtml || '<p id="foo"></p><p>Foo</p><h2> Baz </h2><table><tbody><tr><td></td></tr></tbody></table><p><b>Quux</b></p>',
		view = typeof htmlOrView === 'string' ?
			ve.test.utils.createSurfaceViewFromHtml( htmlOrView, item.config ) :
			htmlOrView,
		model = view.getModel(),
		target = view.getSurface().getTarget(),
		doc = model.getDocument();

	const pasteData = {};
	if ( item.pasteHtml ) {
		pasteData[ 'text/html' ] = item.pasteHtml;
	}
	if ( item.pasteText ) {
		pasteData[ 'text/plain' ] = item.pasteText;
	}
	const clipboardData = new ve.test.utils.MockDataTransfer( ve.copy( pasteData ) );

	let afterPastePromise = ve.createDeferred().resolve().promise();
	let testEvent;
	// Paste sequence
	if ( item.internalSourceRangeOrSelection ) {
		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( doc, item.internalSourceRangeOrSelection ) );
		testEvent = ve.test.utils.createTestEvent( { type: 'copy', clipboardData: clipboardData } );
		let isClipboardDataFormatsSupported;
		if ( item.noClipboardData ) {
			isClipboardDataFormatsSupported = ve.isClipboardDataFormatsSupported;
			ve.isClipboardDataFormatsSupported = function () {
				return false;
			};
		}
		view.clipboardHandler.onCopy( testEvent );
		if ( item.noClipboardData ) {
			ve.isClipboardDataFormatsSupported = isClipboardDataFormatsSupported;
		}
		testEvent = ve.test.utils.createTestEvent( { type: 'paste', clipboardData: clipboardData } );
	} else {
		if ( item.useClipboardData ) {
			clipboardData.setData( view.clipboardHandler.constructor.static.clipboardKeyMimeType, 'useClipboardData-0' );
		} else if ( item.fromVe ) {
			clipboardData.setData( view.clipboardHandler.constructor.static.clipboardKeyMimeType, '0.123-0' );
		}
		testEvent = ve.test.utils.createTestEvent( { type: 'paste', clipboardData: clipboardData } );
	}
	if ( item.middleClickRangeOrSelection ) {
		view.lastNonCollapsedDocumentSelection = ve.test.utils.selectionFromRangeOrSelection( doc, item.middleClickRangeOrSelection );
		view.onDocumentMouseDown( ve.test.utils.createTestEvent( 'mousedown', { which: OO.ui.MouseButtons.MIDDLE } ) );
	}
	if ( item.setViewSelection ) {
		const nativeRange = view.getElementDocument().createRange();
		// setViewSelection passes in a ve.ce.DocumentNode and a native Range object,
		// and expects the callback to modify the range.
		item.setViewSelection( view.getDocument().getDocumentNode(), nativeRange );
		view.nativeSelection.removeAllRanges();
		view.nativeSelection.addRange( nativeRange );
		view.surfaceObserver.pollOnce();
	} else {
		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( doc, item.rangeOrSelection ) );
	}
	if ( item.pasteSpecial ) {
		view.clipboardHandler.prepareForPasteSpecial();
	}
	let wasAnnotatingImportedData;
	if ( item.annotateImportedData ) {
		wasAnnotatingImportedData = target.constructor.static.annotateImportedData;
		target.constructor.static.annotateImportedData = item.annotateImportedData;
	}

	// Replicate the sequencing of ce.Surface.onPaste, without any setTimeouts:
	view.clipboardHandler.beforePaste( testEvent );
	if ( !testEvent.isDefaultPrevented() ) {
		if ( item.clipboardHandlerHtml ) {
			view.clipboardHandler.$element.html( item.clipboardHandlerHtml );
		} else if ( clipboardData.getData( 'text/html' ) ) {
			document.execCommand( 'insertHTML', false, clipboardData.getData( 'text/html' ) );
		} else if ( clipboardData.getData( 'text/plain' ) ) {
			document.execCommand( 'insertText', false, clipboardData.getData( 'text/plain' ) );
		}
		afterPastePromise = view.clipboardHandler.afterPaste( testEvent );
	}

	return afterPastePromise.then( () => {
		if ( item.expectedOps ) {
			let ops = [];
			if ( model.getHistory().length ) {
				const txs = model.getHistory()[ 0 ].transactions;
				ops = txs.map( ( tx ) => {
					const txops = ve.copy( tx.getOperations() );
					txops.forEach( ( txop ) => {
						if ( txop.remove ) {
							ve.dm.example.postprocessAnnotations( txop.remove, doc.getStore() );
						}
						if ( txop.insert ) {
							ve.dm.example.postprocessAnnotations( txop.insert, doc.getStore() );
						}
					} );
					return txops;
				} );
			}
			if ( item.testOriginalDomElements ) {
				assert.equalLinearDataWithDom( doc.getStore(), ops, item.expectedOps, item.msg + ': data' );
			} else {
				assert.equalLinearData( ops, item.expectedOps, item.msg + ': data' );
			}
		}
		if ( item.expectedRangeOrSelection ) {
			const expectedSelection = ve.test.utils.selectionFromRangeOrSelection( doc, item.expectedRangeOrSelection );
			assert.equalHash( model.getSelection(), expectedSelection, item.msg + ': selection' );
		}
		if ( item.expectedHtml ) {
			assert.equalDomElement(
				ve.dm.converter.getDomFromModel( doc ),
				ve.createDocumentFromHtml( item.expectedHtml, item.ignoreXmlWarnings ),
				item.msg + ': HTML'
			);
		}
		assert.strictEqual( testEvent.isDefaultPrevented(), !!item.expectedDefaultPrevented, item.msg + ': default action ' + ( item.expectedDefaultPrevented ? '' : 'not ' ) + 'prevented' );
		view.destroy();

		if ( item.annotateImportedData ) {
			target.constructor.static.annotateImportedData = wasAnnotatingImportedData;
		}
	} );
};

ve.test.utils.MockDataTransfer = function MockDataTransfer( initialData ) {
	const data = {},
		items = [];

	this.items = items;
	this.types = [];
	this.getData = function ( prop ) {
		return data[ prop ] || '';
	};
	this.setData = function ( prop, val ) {
		if ( data[ prop ] === undefined ) {
			items.push( {
				kind: 'string',
				type: prop
			} );
		}
		data[ prop ] = val;
		this.types.push( prop );
		return true;
	};
	if ( initialData ) {
		for ( const key in initialData ) {
			// Don't directly use the data, so we get items set up
			this.setData( key, initialData[ key ] );
		}
	}
};

QUnit.test( 'getClipboardHash', ( assert ) => {
	assert.strictEqual(
		ve.ce.ClipboardHandler.static.getClipboardHash(
			$( '  <p class="foo"> B<b>a</b>r </p>\n\t<span class="baz"></span> Quux <h1><span></span>Whee</h1>' )
		),
		'BarQuuxWhee',
		'Simple usage'
	);
} );

QUnit.test( 'onCopy', ( assert ) => {
	const cases = [
		{
			rangeOrSelection: new ve.Range( 27, 32 ),
			expectedData: [
				{ type: 'list', attributes: { style: 'number' } },
				{ type: 'listItem' },
				{ type: 'paragraph' },
				'g',
				{ type: '/paragraph' },
				{ type: '/listItem' },
				{ type: '/list' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			expectedOriginalRange: new ve.Range( 1, 6 ),
			expectedBalancedRange: new ve.Range( 1, 6 ),
			expectedHtml: '<ol><li><p>g</p></li></ol>',
			expectedText: 'g',
			msg: 'Copy list item'
		},
		{
			doc: ve.dm.example.RDFaDoc,
			rangeOrSelection: new ve.Range( 0, 5 ),
			expectedData: ve.dm.example.RDFaDoc.data.data.slice(),
			expectedOriginalRange: new ve.Range( 0, 5 ),
			expectedBalancedRange: new ve.Range( 0, 5 ),
			expectedHtml: ve.dm.example.singleLine`
				<p content="b" datatype="c" resource="f" rev="g" class="i"
				 data-ve-attributes='{"rev":"g","resource":"f","datatype":"c","content":"b"}'>
					Foo
				</p>
			`,
			expectedText: 'Foo',
			msg: 'RDFa attributes encoded into data-ve-attributes'
		},
		{
			rangeOrSelection: new ve.Range( 1, 4 ),
			expectedHtml: '<span data-ve-clipboard-key="">&nbsp;</span>a<b>b</b><i>c</i>',
			noClipboardData: true,
			msg: 'Clipboard span'
		},
		{
			rangeOrSelection: new ve.Range( 0, 61 ),
			expectedText: 'abc\n\nd\n\ne\n\nf\n\ng\n\nhi\n\nj\n\nk\n\nl\n\nm',
			msg: 'Plain text of entire document'
		}
	];

	function testRunner( doc, rangeOrSelection, expectedData, expectedOriginalRange, expectedBalancedRange, expectedHtml, expectedText, noClipboardData, msg ) {
		const clipboardData = new ve.test.utils.MockDataTransfer(),
			testEvent = ve.test.utils.createTestEvent( { type: 'copy', clipboardData: clipboardData } ),
			view = ve.test.utils.createSurfaceViewFromDocument( doc || ve.dm.example.createExampleDocument() ),
			model = view.getModel();

		let isClipboardDataFormatsSupported;
		if ( noClipboardData ) {
			isClipboardDataFormatsSupported = ve.isClipboardDataFormatsSupported;
			ve.isClipboardDataFormatsSupported = function () {
				return false;
			};
		}

		// Paste sequence
		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection ) );
		view.clipboardHandler.onCopy( testEvent );

		if ( noClipboardData ) {
			ve.isClipboardDataFormatsSupported = isClipboardDataFormatsSupported;
		}

		const slice = view.clipboardHandler.clipboard.slice;
		const clipboardKey = view.clipboardHandler.clipboardId + '-' + view.clipboardHandler.clipboardIndex;

		assert.equalRange( slice.originalRange, expectedOriginalRange || rangeOrSelection, msg + ': originalRange' );
		assert.equalRange( slice.balancedRange, expectedBalancedRange || rangeOrSelection, msg + ': balancedRange' );
		if ( expectedData ) {
			assert.equalLinearData( slice.data.data, expectedData, msg + ': data' );
		}
		if ( expectedHtml ) {
			const $expected = $( '<div>' ).html( expectedHtml );
			// Clipboard key is random, so update it
			$expected.find( '[data-ve-clipboard-key]' ).attr( 'data-ve-clipboard-key', clipboardKey );
			assert.equalDomElement(
				$( '<div>' ).html( clipboardData.getData( 'text/html' ) )[ 0 ],
				$expected[ 0 ],
				msg + ': html'
			);
		}
		if ( expectedText ) {
			// Different browsers and browser versions will produce different trailing whitespace, so just trim.
			assert.strictEqual( clipboardData.getData( 'text/plain' ).trim(), expectedText, msg + ': text' );
		}
		if ( !noClipboardData ) {
			assert.strictEqual( clipboardData.getData( view.clipboardHandler.constructor.static.clipboardKeyMimeType ), clipboardKey, msg + ': clipboardId set' );
		}

		view.destroy();
	}

	cases.forEach( ( caseItem ) => {
		testRunner(
			caseItem.doc, caseItem.rangeOrSelection, caseItem.expectedData,
			caseItem.expectedOriginalRange, caseItem.expectedBalancedRange,
			caseItem.expectedHtml, caseItem.expectedText, caseItem.noClipboardData, caseItem.msg
		);
	} );

} );

QUnit.test( 'beforePaste/afterPaste', ( assert ) => {
	const docLen = 30,
		bold = ve.dm.example.bold,
		italic = ve.dm.example.italic,
		link = ve.dm.example.link( 'Foo' ),
		// generateUniqueId is deterministic on the DummyPlatform
		imported = ( source ) => ( { type: 'meta/importedData', attributes: { source: source, eventId: ve.init.platform.generateUniqueId() } } ),
		cases = [
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 4 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [ ...'Foo' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'Text into empty paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: 'Bar',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Text into paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 4, 5 ),
				pasteHtml: 'Bar',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [],
							remove: [ 'o' ]
						},
						{ type: 'retain', length: docLen - 5 }
					],
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 5 }
					]
				],
				msg: 'Text into selection'
			},
			{
				rangeOrSelection: new ve.Range( 25 ),
				internalSourceRangeOrSelection: new ve.Range( 3, 6 ),
				expectedRangeOrSelection: new ve.Range( 28 ),
				expectedOps: [
					[
						{ type: 'retain', length: 25 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', bold )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 25 }
					]
				],
				msg: 'Internal text into annotated content'
			},
			{
				rangeOrSelection: new ve.Range( 25 ),
				internalSourceRangeOrSelection: new ve.Range( 3, 6 ),
				noClipboardData: true,
				expectedRangeOrSelection: new ve.Range( 28 ),
				expectedOps: [
					[
						{ type: 'retain', length: 25 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', bold )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 25 }
					]
				],
				msg: 'Internal text into annotated content (noClipboardData)'
			},
			{
				setViewSelection: ( documentNode, nativeRange ) => {
					const boldNode = documentNode.children[ 4 ].$element.find( 'b' )[ 0 ];
					nativeRange.setStart( boldNode.childNodes[ 0 ], 4 );
				},
				internalSourceRangeOrSelection: new ve.Range( 3, 6 ),
				expectedRangeOrSelection: new ve.Range( 30 ),
				expectedOps: [
					[
						{ type: 'retain', length: 27 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', bold )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 27 }
					]
				],
				msg: 'Internal text into annotated content (just inside bold node)'
			},
			{
				setViewSelection: ( documentNode, nativeRange ) => {
					const paragraphNode = documentNode.children[ 4 ].$element[ 0 ];
					nativeRange.setStart( paragraphNode, 1 );
				},
				internalSourceRangeOrSelection: new ve.Range( 3, 6 ),
				expectedRangeOrSelection: new ve.Range( 30 ),
				expectedOps: [
					[
						{ type: 'retain', length: 27 },
						{
							type: 'replace',
							insert: [
								...'Foo'
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 27 }
					]
				],
				msg: 'Internal text next to annotated content (just outside bold node)'
			},
			{
				setViewSelection: ( documentNode, nativeRange ) => {
					const boldNode = documentNode.children[ 4 ].$element.find( 'b' )[ 0 ];
					nativeRange.setStart( boldNode.childNodes[ 0 ], 4 );
				},
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 30 ),
				expectedOps: [
					[
						{ type: 'retain', length: 27 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', bold )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 27 }
					]
				],
				msg: 'External text into annotated content (just inside bold node)'
			},
			{
				setViewSelection: ( documentNode, nativeRange ) => {
					const paragraphNode = documentNode.children[ 4 ].$element[ 0 ];
					nativeRange.setStart( paragraphNode, 1 );
				},
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 30 ),
				expectedOps: [
					[
						{ type: 'retain', length: 27 },
						{
							type: 'replace',
							insert: [
								...'Foo'
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 27 }
					]
				],
				msg: 'External text next to annotated content (just outside bold node)'
			},
			{
				// eslint-disable-next-line no-useless-concat
				documentHtml: '<p><a href="Foo">Foo' + '</a> Bar</p>',
				// cursor goes here -----------------^
				setViewSelection: ( documentNode, nativeRange ) => {
					const preCloseNail = documentNode.children[ 0 ].$element.find( '.ve-ce-nail-pre-close' )[ 0 ];
					const textNode = preCloseNail.previousSibling;
					nativeRange.setStart( textNode, 3 );
				},
				internalSourceRangeOrSelection: new ve.Range( 5, 8 ),
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Bar', link )
							],
							remove: []
						},
						{ type: 'retain', length: 7 }
					]
				],
				msg: 'Internal text into annotated content (just inside link node)'
			},
			{
				// eslint-disable-next-line no-useless-concat
				documentHtml: '<p><a href="Foo">Bar</a>' + ' Bar</p>',
				// cursor goes here ---------------------^
				setViewSelection: ( documentNode, nativeRange ) => {
					const paragraphNode = documentNode.children[ 0 ].$element[ 0 ];
					// offset 3 = pre-nail + link + post-nail
					nativeRange.setStart( paragraphNode, 3 );
				},
				internalSourceRangeOrSelection: new ve.Range( 5, 8 ),
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [
								...'Bar'
							],
							remove: []
						},
						{ type: 'retain', length: 7 }
					]
				],
				msg: 'Internal text next to annotated content (just outside link node)'
			},
			{
				rangeOrSelection: new ve.Range( 25 ),
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 28 ),
				expectedOps: [
					[
						{ type: 'retain', length: 25 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', bold )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 25 }
					]
				],
				msg: 'External text into annotated content'
			},
			{
				rangeOrSelection: new ve.Range( 25 ),
				pasteHtml: '<i>Foo</i>',
				expectedRangeOrSelection: new ve.Range( 28 ),
				expectedOps: [
					[
						{ type: 'retain', length: 25 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', [ bold, italic ] )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 25 }
					]
				],
				msg: 'Formatted text into annotated content'
			},
			{
				rangeOrSelection: new ve.Range( 23, 27 ),
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 26 ),
				expectedOps: [
					[
						{ type: 'retain', length: 23 },
						{
							type: 'replace',
							insert: [],
							remove: [
								...ve.dm.example.annotateText( 'Quux', bold )
							]
						},
						{ type: 'retain', length: docLen - 27 }
					],
					[
						{ type: 'retain', length: 23 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', bold )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 27 }
					]
				],
				msg: 'External text over annotated content'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '<span style="color:red;">Foo</span><font style="color:blue;">bar</font>',
				expectedRangeOrSelection: new ve.Range( 10 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'Foobar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				testOriginalDomElements: true,
				msg: 'Span and font tags stripped'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '<span rel="ve:Alien">Foo</span><b>B</b>a<!-- comment --><b>r</b>',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [
								[ 'B', [ { type: 'textStyle/bold', attributes: { nodeName: 'b' } } ] ],
								'a',
								[ 'r', [ { type: 'textStyle/bold', attributes: { nodeName: 'b' } } ] ]
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				testOriginalDomElements: true,
				msg: 'Formatted text into paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '<span rel="ve:Alien">Foo</span><b>B</b>a<!-- comment --><b>r</b>',
				pasteSpecial: true,
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				testOriginalDomElements: true,
				msg: 'Formatted text into paragraph with pasteSpecial'
			},
			{
				rangeOrSelection: new ve.Range( 11 ),
				pasteHtml: '<i>Bar</i>',
				pasteSpecial: true,
				expectedRangeOrSelection: new ve.Range( 14 ),
				expectedOps: [
					[
						{ type: 'retain', length: 11 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 11 }
					]
				],
				msg: 'Formatted text into heading with pasteSpecial'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '<p>Bar</p>',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Paragraph into paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 6 ),
				pasteHtml: '<p>Bar</p>',
				expectedRangeOrSelection: new ve.Range( 9 ),
				expectedOps: [
					[
						{ type: 'retain', length: 6 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 6 }
					]
				],
				msg: 'Paragraph at end of paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 3 ),
				pasteHtml: '<p>Bar</p>',
				expectedRangeOrSelection: new ve.Range( 6 ),
				expectedOps: [
					[
						{ type: 'retain', length: 3 },
						{
							type: 'replace',
							insert: [ ...'Bar' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 3 }
					]
				],
				msg: 'Paragraph at start of paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 11 ),
				pasteHtml: '<h2>Quux</h2>',
				expectedRangeOrSelection: new ve.Range( 15 ),
				expectedOps: [
					[
						{ type: 'retain', length: 11 },
						{
							type: 'replace',
							insert: [ ...'Quux' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 11 }
					]
				],
				msg: 'Heading into heading with whitespace'
			},
			{
				rangeOrSelection: new ve.Range( 17 ),
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 20 ),
				expectedOps: [
					[
						{ type: 'retain', length: 17 },
						{
							type: 'replace',
							insert: [ ...'Foo' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 17 }
					]
				],
				msg: 'Text into wrapper paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '☀foo☂',
				expectedRangeOrSelection: new ve.Range( 9 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'☀foo☂' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Left/right placeholder characters not accidentally removed'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '☀foo☂',
				expectedRangeOrSelection: new ve.Range( 9 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'☀foo☂' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Pasted left/right placeholder characters kept'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				clipboardHandlerHtml: '☀foo☂',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'foo' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Left/right placeholder characters removed'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: 'foo',
				clipboardHandlerHtml: '☀☂foo',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ ...'foo' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Corrupted paste target ignored'
			},
			{
				documentHtml: '<h1>AB</h1><p>C</p>',
				internalSourceRangeOrSelection: new ve.Range( 2, 6 ),
				rangeOrSelection: new ve.Range( 3 ),
				expectedRangeOrSelection: new ve.Range( 10 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [
								{ type: 'heading', attributes: { level: 1 } },
								'B',
								{ type: '/heading' },
								{ type: 'paragraph' },
								'C',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: 5 }
					]
				],
				msg: 'Unbalanced HTML at end of heading'
			},
			{
				rangeOrSelection: new ve.Range( 6 ),
				pasteHtml: '<ul><li>Foo</li></ul>',
				expectedRangeOrSelection: new ve.Range( 16 ),
				expectedOps: [
					[
						{ type: 'retain', length: 7 },
						{
							type: 'replace',
							insert: [
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								...'Foo',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: '/list' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 7 }
					]
				],
				msg: 'List at end of paragraph (moves insertion point)'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '<table><caption>Foo</caption><tr><td>Bar</td></tr></table>',
				expectedRangeOrSelection: new ve.Range( 26 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [
								{ type: '/paragraph' },
								{ type: 'table' },
								{ type: 'tableCaption' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								...'Foo',
								{ type: '/paragraph' },
								{ type: '/tableCaption' },
								{ type: 'tableSection', attributes: { style: 'body' } },
								{ type: 'tableRow' },
								{ type: 'tableCell', attributes: { style: 'data' } },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								...'Bar',
								{ type: '/paragraph' },
								{ type: '/tableCell' },
								{ type: '/tableRow' },
								{ type: '/tableSection' },
								{ type: '/table' },
								{ type: 'paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Table with caption into paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				pasteHtml: ve.dm.example.singleLine`
					<figure class="notIgnored" rev="ignored"
					 data-ve-attributes='{"rev":"g","resource":"f","datatype":"c","content":"b","about":"a"}'>
						<img>
					</figure>
				`,
				fromVe: true,
				expectedRangeOrSelection: new ve.Range( 4 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{
									type: 'blockImage',
									attributes: {
										alt: null,
										width: null,
										height: null,
										originalClasses: 'notIgnored',
										src: null,
										unrecognizedClasses: [ 'notIgnored' ]
									},
									originalDomElements: $.parseHTML( '<figure class="notIgnored" rev="g" resource="f" datatype="c" content="b" about="a"><img></figure>' )
								},
								{ type: 'imageCaption' },
								{ type: '/imageCaption' },
								{ type: '/blockImage' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				testOriginalDomElements: true,
				msg: 'RDFa attributes restored/overwritten from data-ve-attributes'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				documentHtml: '<p></p>',
				pasteHtml: ve.dm.example.singleLine`
					<span data-ve-attributes='{{invalid'>foo</span>
					<span data-ve-attributes='{"about":"quux"}'>bar</span>
				`,
				fromVe: true,
				expectedHtml: '<p><span>foo</span><span about="quux">bar</span></p>',
				expectedRangeOrSelection: new ve.Range( 7 ),
				testOriginalDomElements: true,
				msg: 'Span cleanups: data-ve-attributes always stripped'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				documentHtml: '<p></p>',
				pasteHtml: ve.dm.example.singleLine`
					<span class="ve-pasteProtect" id="meaningful">F</span>
					<span class="ve-pasteProtect" style="color: red;">o</span>
					<span class="ve-pasteProtect meaningful">o</span>
				`,
				fromVe: true,
				expectedRangeOrSelection: new ve.Range( 4 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								[ 'F', [ { type: 'textStyle/span', attributes: { nodeName: 'span' } } ] ],
								'o',
								[ 'o', [ { type: 'textStyle/span', attributes: { nodeName: 'span' } } ] ]
							],
							remove: []
						},
						{ type: 'retain', length: 3 }
					]
				],
				expectedHtml: ve.dm.example.singleLine`
					<p>
					<span id="meaningful">F</span>
					o
					<span class="meaningful">o</span>
					</p>
				`,
				testOriginalDomElements: true,
				msg: 'Span cleanups: only meaningful attributes kept'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span data-ve-clipboard-key="0.13811087369534492-4">&nbsp;</span><s>Foo</s>',
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } )
							],
							remove: []
						},
						{ type: 'retain', length: 29 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Span cleanups: clipboard key stripped'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span data-ve-clipboard-key="0.13811087369534492-4">&nbsp;</span><s>Foo</s>',
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } )
							],
							remove: []
						},
						{ type: 'retain', length: 29 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Span cleanups: clipboard key stripped (external)'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: ve.dm.example.singleLine`
					<span style="font-weight:700;">A</span>
					<span style="font-weight:900;">2</span>
					<span style="font-weight:bold;">3</span>
					<span style="font-weight:bolder;">4</span>
					<span style="font-style:italic;">B</span>
					<span style="font-style:oblique;">2</span>
					<span style="font-style:oblique 40deg;">3</span>
					<span style="text-decoration:underline">C</span>
					<span style="text-decoration:underline overline">2</span>
					<span style="text-decoration:underline line-through">C&D</span>
					<span style="text-decoration:line-through;">D</span>
					<span style="text-decoration:line-through overline;">2</span>
					<span style="vertical-align:super;">E</span>
					<span style="vertical-align:sub;">F</span>
					<span style="font-weight:700; font-style:italic;">G</span>
					<span style="color:red;">H</span>
				`,
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'A234', { type: 'textStyle/bold', attributes: { nodeName: 'b' } } ),
								...ve.dm.example.annotateText( 'B23', { type: 'textStyle/italic', attributes: { nodeName: 'i' } } ),
								...ve.dm.example.annotateText( 'C2', { type: 'textStyle/underline', attributes: { nodeName: 'u' } } ),
								...ve.dm.example.annotateText( 'C&D', [ { type: 'textStyle/underline', attributes: { nodeName: 'u' } }, { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ),
								...ve.dm.example.annotateText( 'D2', { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ),
								[ 'E', [ { type: 'textStyle/superscript', attributes: { nodeName: 'sup' } } ] ],
								[ 'F', [ { type: 'textStyle/subscript', attributes: { nodeName: 'sub' } } ] ],
								[ 'G', [ { type: 'textStyle/bold', attributes: { nodeName: 'b' } }, { type: 'textStyle/italic', attributes: { nodeName: 'i' } } ] ],
								'H'
							],
							remove: []
						},
						{ type: 'retain', length: 29 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 19 ),
				testOriginalDomElements: true,
				msg: 'Span cleanups: style converted into markup'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<a href="javascript:alert(\'unsafe\');">Foo</a><a href="#safe">Bar</a>',
				expectedRangeOrSelection: new ve.Range( 7 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...'Foo',
								...ve.dm.example.annotateText( 'Bar', { type: 'link', attributes: { href: '#safe' } } )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'Unsafe link removed by ve.sanitize'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				pasteHtml: 'foo\n<!-- StartFragment --><p>Bar</p><!--EndFragment-->baz',
				useClipboardData: true,
				expectedRangeOrSelection: new ve.Range( 5 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								...'Bar',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Start/EndFragment comments trimmed from clipboardData'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				documentHtml: '<p></p>',
				pasteHtml: '<h3><div rel="ve:Alien"><p>Foo</p><div><br></div></div></h3>',
				expectedOps: [],
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Pasting block content that is fully stripped does nothing'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<b>Foo</b>',
				clipboardHandlerHtml: '<p>Foo</p>',
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...'Foo'
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Paste target HTML used if nothing important dropped'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				pasteHtml: ve.dm.example.blockImage.html,
				clipboardHandlerHtml: $( ve.dm.example.blockImage.html ).unwrap().html(),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: ( () => {
								const data = ve.copy( ve.dm.example.blockImage.data );
								// Removed by ClassAttributeNode's sanitization
								delete data[ 0 ].attributes.unrecognizedClasses;
								return data;
							} )(),
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				expectedRangeOrSelection: new ve.Range( 13 ),
				msg: 'Paste API HTML used if important element dropped'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span data-ve-clipboard-key="0.13811087369534492-4">&nbsp;</span><s rel="ve:Alien">Alien</s>',
				clipboardHandlerHtml: '<span data-ve-clipboard-key="0.13811087369534492-4">&nbsp;</span><s>Alien</s>',
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								{ type: 'alienInline', originalDomElements: $.parseHTML( '<s rel="ve:Alien">Alien</s>' ) },
								{ type: '/alienInline' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 3 ),
				testOriginalDomElements: true,
				msg: 'Paste API HTML still cleaned up if used when important attributes dropped'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				pasteHtml: '<p>A</p>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 23 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [],
							remove: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								{ type: '/paragraph' }
							]
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'A',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 18 }
					]
				],
				msg: 'Paste paragraph into table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				pasteHtml: '<table><tbody><tr><td>X</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 23 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [],
							remove: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								{ type: '/paragraph' }
							]
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'X',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 18 }
					]
				],
				msg: 'Paste table cell onto table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 23 ),
					fromCol: 0,
					fromRow: 0
				},
				documentHtml: '<table><tbody><tr><td>A</td></tr><tr><td>B</td><td>C</td></tr></tbody></table>',
				pasteHtml: '<table><tbody><tr><td>X</td><td>Y</td><td>Z</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 37 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 2,
					toRow: 0
				},
				expectedHtml: '<table><tbody><tr><td>X</td><td>Y</td><td>Z</td></tr><tr><td>B</td><td>C</td><td></td></tr></tbody></table>',
				msg: 'Paste table cells onto sparse table'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				pasteHtml: '<table><tbody><tr><th>X</th></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 23 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [],
							remove: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								{ type: '/paragraph' }
							]
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 15 },
						{ type: 'attribute', key: 'style', from: 'data', to: 'header' },
						{ type: 'retain', length: docLen - 17 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'X',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 18 }
					]
				],
				msg: 'Paste table header cell onto table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				pasteHtml: '<table><tbody><tr><td rel="ve:Alien">X</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 20 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 15 },
						{
							type: 'replace',
							insert: [
								{ type: 'alienTableCell' },
								{ type: '/alienTableCell' }
							],
							remove: [
								{ type: 'tableCell', attributes: { style: 'data' } },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								{ type: '/paragraph' },
								{ type: '/tableCell' }
							]
						},
						{ type: 'retain', length: docLen - 19 }
					]
				],
				msg: 'Paste alien cell onto table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 8 ),
					fromCol: 0,
					fromRow: 0
				},
				documentHtml: '<table><tbody><tr><td rel="ve:Alien">X</td></tr></tbody></table>',
				pasteHtml: '<table><tbody><tr><td>Y</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 11 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 3 },
						{
							type: 'replace',
							remove: [
								{ type: 'alienTableCell' },
								{ type: '/alienTableCell' }
							],
							insert: [
								{ type: 'tableCell', attributes: { style: 'data' } },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'Y',
								{ type: '/paragraph' },
								{ type: '/tableCell' }
							]
						},
						{ type: 'retain', length: 5 }
					]
				],
				msg: 'Paste table cell onto alien cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 10 ),
					fromCol: 0,
					fromRow: 0
				},
				documentHtml: '<table><tbody><tr><td></td></tr></tbody></table>',
				// Firefox doesn't like using execCommand for this test for some reason
				clipboardHandlerHtml: '<table><tbody><tr><td>X</td><td>Y</td><td>Z</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 21 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 2,
					toRow: 0
				},
				expectedHtml: '<table><tbody><tr><td>X</td><td>Y</td><td>Z</td></tr></tbody></table>',
				msg: 'Paste row of table cells onto table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 10 ),
					fromCol: 0,
					fromRow: 0
				},
				documentHtml: '<table><tbody><tr><td></td></tr></tbody></table>',
				pasteHtml: '<table><tbody><tr><td>X</td></tr><tr><td>Y</td></tr><tr><td>Z</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 25 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 2
				},
				expectedHtml: '<table><tbody><tr><td>X</td></tr><tr><td>Y</td></tr><tr><td>Z</td></tr></tbody></table>',
				msg: 'Paste column of table cells onto table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				pasteHtml: '<p>Foo</p><table><tbody><tr><td>X</td></tr></tbody></table><p>Bar</p>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 41 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 16 },
						{
							insert: [],
							remove: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph' },
								...'Foo',
								{ type: '/paragraph' },
								{ type: 'table' },
								{
									type: 'tableSection',
									attributes: {
										style: 'body'
									}
								},
								{ type: 'tableRow' },
								{
									type: 'tableCell',
									attributes: {
										style: 'data'
									}
								},
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'X',
								{ type: '/paragraph' },
								{ type: '/tableCell' },
								{ type: '/tableRow' },
								{ type: '/tableSection' },
								{ type: '/table' },
								{ type: 'paragraph' },
								...'Bar',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 18 }
					]
				],
				msg: 'Paste paragraphs and a table into table cell'
			},
			{
				rangeOrSelection: new ve.Range( 2 ),
				documentHtml: '<p>A</p><ul><li>B</li><li>C</li></ul>',
				internalSourceRangeOrSelection: new ve.Range( 6, 12 ),
				expectedRangeOrSelection: new ve.Range( 14 ),
				expectedOps: [
					[
						{ type: 'retain', length: 3 },
						{
							type: 'replace',
							insert: [
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph' },
								'B',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'C',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: '/list' }
							],
							remove: [],
							insertedDataLength: 10,
							insertedDataOffset: 1
						},
						{ type: 'retain', length: 14 }
					]
				],
				msg: 'Unbalanced data can\'t be fixed by fixupInsertion'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				// Firefox doesn't like using execCommand for this test for some reason
				clipboardHandlerHtml: '<ul><li>A</li><ul><li>B</li></ul></ul>',
				expectedRangeOrSelection: new ve.Range( 14 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'A',
								{ type: '/paragraph' },
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'B',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: '/list' },
								{ type: '/listItem' },
								{ type: '/list' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Broken nested lists (Google Docs style)'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				// Write directly to paste target because using execCommand kills one of the <ul>s
				clipboardHandlerHtml: 'A<ul><ul><li>B</li></ul></ul>C',
				expectedRangeOrSelection: new ve.Range( 17 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'A',
								{ type: '/paragraph' },
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'B',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: '/list' },
								{ type: '/listItem' },
								{ type: '/list' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'C',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Double indented lists (Google Docs style)'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				// Nested list copied from macOS Notes has newline before ul element
				clipboardHandlerHtml: '<ul><li>A</li>\n<ul><li>B</li></ul></ul>',
				expectedRangeOrSelection: new ve.Range( 14 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'A',
								{ type: '/paragraph' },
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'B',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: '/list' },
								{ type: '/listItem' },
								{ type: '/list' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Broken nested lists (macOS Notes style)'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				clipboardHandlerHtml: '<li>B</li><li>C</li>',
				expectedRangeOrSelection: new ve.Range( 12 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'list', attributes: { style: 'bullet' } },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'B',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: 'listItem' },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'C',
								{ type: '/paragraph' },
								{ type: '/listItem' },
								{ type: '/list' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Broken list items without a wrapper (caused by `display: inline`)'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				clipboardHandlerHtml: '<p>A</p><p></p><p>B</p>',
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph' },
								'A',
								{ type: '/paragraph' },
								{ type: 'paragraph' },
								'B',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Empty paragraph stripped from external paste'
			},
			{
				rangeOrSelection: new ve.Range( 8 ),
				documentHtml: '<p>A</p><p></p><p>B</p>',
				internalSourceRangeOrSelection: new ve.Range( 0, 8 ),
				expectedOps: [
					[
						{ type: 'retain', length: 8 },
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph' },
								'A',
								{ type: '/paragraph' },
								{ type: 'paragraph' },
								{ type: '/paragraph' },
								{ type: 'paragraph' },
								'B',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: 2 }
					]
				],
				msg: 'Empty paragraph kept in internal paste'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				clipboardHandlerHtml: '<h3>A</h3>',
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'A',
								{ type: '/paragraph' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'Non-paragraph content branch node converted to paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 5 ),
				pasteHtml: '<h3>A</h3>',
				expectedOps: [
					[
						{
							type: 'retain',
							length: 5
						},
						{
							type: 'replace',
							insert: [ 'A' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 5 }
					]
				],
				msg: 'Non-paragraph content branch node converted to paragraph when in paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 6 ),
				pasteHtml: '<h3>A</h3>',
				expectedOps: [
					[
						{
							type: 'retain',
							length: 6
						},
						{
							type: 'replace',
							insert: [ 'A' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 6 }
					]
				],
				msg: 'Non-paragraph content branch node converted to paragraph at end of paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				clipboardHandlerHtml: '<img src="' + ve.ce.minImgDataUri + '" width="10" height="20" />',
				expectedOps: [
					[
						{
							type: 'retain',
							length: 1
						},
						{
							type: 'replace',
							insert: [ ...'image/gif:26' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'Image with data URI handled by dummy image clipboard handler'
			},
			{
				rangeOrSelection: { type: 'null' },
				pasteHtml: 'Foo',
				expectedRangeOrSelection: { type: 'null' },
				expectedOps: [],
				expectedDefaultPrevented: true,
				msg: 'Pasting without a selection does nothing'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteText: 'Foo',
				expectedRangeOrSelection: new ve.Range( 4 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...'Foo'
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedDefaultPrevented: false,
				msg: 'Plain text paste into empty paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteText: '<b>Foo</b>',
				expectedRangeOrSelection: new ve.Range( 11 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [ ...'<b>Foo</b>' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedDefaultPrevented: false,
				msg: 'Plain text paste doesn\'t become HTML'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteText: 'Ignored',
				middleClickRangeOrSelection: new ve.Range( 3, 6 ),
				expectedRangeOrSelection: new ve.Range( 4 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [ ...'Foo' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedDefaultPrevented: false,
				msg: 'Middle click to paste'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '1<b>2</b>3',
				expectedRangeOrSelection: new ve.Range( 4 ),
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [ ...'123' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				config: {
					importRules: {
						external: {
							blacklist: {
								'textStyle/bold': true
							}
						}
					}
				},
				msg: 'Formatting removed by import rules'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 4 ),
				annotateImportedData: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', imported( null ) )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'Text into empty paragraph (annotateImportedData)'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span id="docs-internal-guid-111-111-111">Foo</span>',
				expectedRangeOrSelection: new ve.Range( 4 ),
				annotateImportedData: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', imported( 'googleDocs' ) )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'HTML from Google docs'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: 'Foo',
				expectedRangeOrSelection: new ve.Range( 4 ),
				annotateImportedData: true,
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', imported( 'visualEditor' ) )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'HTML from VisualEditor'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<meta name="generator" content="LibreOffice 7.3.7.2 (Linux)"/>Foo',
				expectedRangeOrSelection: new ve.Range( 4 ),
				annotateImportedData: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', imported( 'libreOffice' ) )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'HTML from LibreOffice'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span data-contrast="auto" class="TextRun SCXW177593693 BCX0><span class="NormalTextRun SCXW177593693 BCX0">Foo</span></span>',
				expectedRangeOrSelection: new ve.Range( 4 ),
				annotateImportedData: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', imported( 'microsoftOffice' ) )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'HTML from MicrosoftOffice'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteText: 'Foo',
				expectedRangeOrSelection: new ve.Range( 4 ),
				annotateImportedData: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								...ve.dm.example.annotateText( 'Foo', imported( 'plainText' ) )
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				msg: 'Plain text paste annotated as plain'
			}
		];

	const done = assert.async();
	( async function () {
		for ( const caseItem of cases ) {
			await ve.test.utils.runSurfacePasteTest( assert, caseItem );
		}
		done();
	}() );
} );
