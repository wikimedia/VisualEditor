/*!
 * VisualEditor ContentEditable Surface tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.Surface', {
	beforeEach: function () {
		return ve.init.platform.getInitializedPromise();
	}
} );

/* Tests */

ve.test.utils.runSurfaceHandleSpecialKeyTest = function ( assert, htmlOrDoc, rangeOrSelection, keys, expectedData, expectedRangeOrSelection, msg, forceSelection, fullEvents ) {
	var i, e, expectedSelection, key,
		view = typeof htmlOrDoc === 'string' ?
			ve.test.utils.createSurfaceViewFromHtml( htmlOrDoc ) :
			( htmlOrDoc instanceof ve.ce.Surface ? htmlOrDoc : ve.test.utils.createSurfaceViewFromDocument( htmlOrDoc || ve.dm.example.createExampleDocument() ) ),
		model = view.getModel(),
		data = ve.copy( model.getDocument().getFullData() );

	ve.test.utils.hijackEventSequencerTimeouts( view.eventSequencer );

	model.setSelection(
		ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection )
	);
	for ( i = 0; i < keys.length; i++ ) {
		key = keys[ i ].split( '+' );
		e = {
			keyCode: OO.ui.Keys[ key.pop() ],
			shiftKey: key.indexOf( 'SHIFT' ) !== -1,
			ctrlKey: key.indexOf( 'CTRL' ) !== -1,
			preventDefault: function () {},
			stopPropagation: function () {}
		};
		if ( fullEvents ) {
			// Some key handlers do things like schedule after-event handlers,
			// and so we want to fake the full sequence.
			// TODO: Could probably switch to using this for every test, but it
			// would need the faked testing surface to be improved.
			view.eventSequencer.onEvent( 'keydown', $.Event( 'keydown', e ) );
			view.eventSequencer.onEvent( 'keypress', $.Event( 'keypress', e ) );
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
			view.eventSequencer.onEvent( 'keyup', $.Event( 'keyup', e ) );
			view.eventSequencer.endLoop();
		} else {
			if ( forceSelection ) {
				view.showSelectionState( view.getSelectionState( forceSelection ) );
			}
			ve.ce.keyDownHandlerFactory.executeHandlersForKey(
				e.keyCode, model.getSelection().getName(), view, e
			);
		}
	}
	if ( expectedData ) {
		expectedData( data );
		assert.equalLinearData( model.getDocument().getFullData(), data, msg + ': data' );
	}

	expectedSelection = ve.dm.Selection.static.newFromJSON( model.getDocument(), expectedRangeOrSelection instanceof ve.Range ?
		{ type: 'linear', range: expectedRangeOrSelection } :
		expectedRangeOrSelection
	);
	assert.equalHash( model.getSelection(), expectedSelection, msg + ': selection' );
	view.destroy();
};

ve.test.utils.runSurfacePasteTest = function ( assert, htmlOrView, pasteData, internalSourceRangeOrSelection, noClipboardData, fromVe, useClipboardData, pasteTargetHtml, rangeOrSelection, pasteSpecial, expectedOps, expectedRangeOrSelection, expectedHtml, expectedDefaultPrevented, store, msg ) {
	var i, j, txs, ops, txops, htmlDoc, expectedSelection, testEvent, isClipboardDataFormatsSupported,
		afterPastePromise = $.Deferred().resolve().promise(),
		e = ve.extendObject( {}, pasteData ),
		view = typeof htmlOrView === 'string' ?
			ve.test.utils.createSurfaceViewFromHtml( htmlOrView ) :
			htmlOrView,
		model = view.getModel(),
		doc = model.getDocument(),
		done = assert.async();

	function summary( el ) {
		return ve.getDomElementSummary( el, true );
	}

	// Paste sequence
	if ( internalSourceRangeOrSelection ) {
		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), internalSourceRangeOrSelection ) );
		testEvent = new ve.test.utils.TestEvent();
		if ( noClipboardData ) {
			isClipboardDataFormatsSupported = ve.isClipboardDataFormatsSupported;
			ve.isClipboardDataFormatsSupported = function () { return false; };
		}
		view.onCopy( testEvent );
		if ( noClipboardData ) {
			ve.isClipboardDataFormatsSupported = isClipboardDataFormatsSupported;
		}
		// A fresh event with the copied data, because of defaultPrevented:
		testEvent = new ve.test.utils.TestEvent( testEvent.testData );
	} else {
		if ( useClipboardData ) {
			e[ 'text/xcustom' ] = 'useClipboardData-0';
		} else if ( fromVe ) {
			e[ 'text/xcustom' ] = '0.123-0';
		}
		testEvent = new ve.test.utils.TestEvent( e );
	}
	model.setSelection( ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection ) );
	view.pasteSpecial = pasteSpecial;

	// Replicate the sequencing of ce.Surface.onPaste, without any setTimeouts:
	view.beforePaste( testEvent );
	if ( !testEvent.defaultPrevented() ) {
		if ( pasteTargetHtml ) {
			view.$pasteTarget.html( pasteTargetHtml );
		} else if ( e[ 'text/html' ] ) {
			document.execCommand( 'insertHTML', false, e[ 'text/html' ] );
		} else if ( e[ 'text/plain' ] ) {
			document.execCommand( 'insertText', false, e[ 'text/plain' ] );
		}
		afterPastePromise = view.afterPaste( testEvent );
	}

	// Use #done to run immediately after paste promise
	// TODO: Ideally these tests would run in series use 'await' to
	// avoid selection issues with running parallel surface tests.
	afterPastePromise.done( function () {
		if ( expectedOps ) {
			ops = [];
			if ( model.getHistory().length ) {
				txs = model.getHistory()[ 0 ].transactions;
				for ( i = 0; i < txs.length; i++ ) {
					txops = ve.copy( txs[ i ].getOperations() );
					for ( j = 0; j < txops.length; j++ ) {
						if ( txops[ j ].remove ) {
							ve.dm.example.postprocessAnnotations( txops[ j ].remove, doc.getStore() );
							ve.dm.example.removeOriginalDomElements( txops[ j ].remove );
						}
						if ( txops[ j ].insert ) {
							ve.dm.example.postprocessAnnotations( txops[ j ].insert, doc.getStore() );
							ve.dm.example.removeOriginalDomElements( txops[ j ].insert );
						}
					}
					ops.push( txops );
				}
			}
			assert.equalLinearData( ops, expectedOps, msg + ': data' );
			if ( store ) {
				for ( i in store ) {
					assert.deepEqual( doc.getStore().value( i ).map( summary ), store[ i ].map( summary ), ': store value ' + i );
				}
			}
		}
		if ( expectedRangeOrSelection ) {
			expectedSelection = ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), expectedRangeOrSelection );
			assert.equalHash( model.getSelection(), expectedSelection, msg + ': selection' );
		}
		if ( expectedHtml ) {
			htmlDoc = ve.dm.converter.getDomFromModel( doc );
			assert.strictEqual( htmlDoc.body.innerHTML, expectedHtml, msg + ': HTML' );
		}
		assert.strictEqual( testEvent.defaultPrevented(), !!expectedDefaultPrevented, msg + ': default action ' + ( expectedDefaultPrevented ? '' : 'not ' ) + 'prevented' );
		view.destroy();
		done();
	} );
};

ve.test.utils.TestEvent = function TestEvent( data ) {
	var defaultPrevented, key,
		internalData = {};
	this.testData = internalData;
	this.originalEvent = {
		clipboardData: {
			getData: function ( prop ) {
				return internalData[ prop ];
			},
			setData: function ( prop, val ) {
				if ( internalData[ prop ] === undefined ) {
					this.items.push( {
						kind: 'string',
						type: prop
					} );
				}
				internalData[ prop ] = val;
				return true;
			},
			items: []
		}
	};
	this.preventDefault = this.stopPropagation = function () {
		defaultPrevented = true;
	};
	this.defaultPrevented = function () {
		return !!defaultPrevented;
	};
	if ( data ) {
		for ( key in data ) {
			// Don't directly use the data, so we get items set up
			this.originalEvent.clipboardData.setData( key, data[ key ] );
		}
	}
};

QUnit.test( 'special key down: backspace/delete', function ( assert ) {
	var i,
		emptyList = '<ul><li><p></p></li></ul>',
		mergedCellsDoc = ve.dm.example.createExampleDocument( 'mergedCells' ),
		cases = [
			{
				rangeOrSelection: new ve.Range( 1, 4 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 1, 3 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Selection deleted by backspace'
			},
			{
				rangeOrSelection: new ve.Range( 1, 4 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 1, 3 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Selection deleted by delete'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'CTRL+BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 1, 3 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Whole word deleted by modified backspace'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				keys: [ 'CTRL+DELETE' ],
				expectedData: function ( data ) {
					data.splice( 1, 3 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Whole word deleted by modified delete'
			},
			{
				rangeOrSelection: new ve.Range( 56, 57 ),
				keys: [ 'DELETE', 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 55, 3 );
				},
				expectedRangeOrSelection: new ve.Range( 56 ),
				msg: 'Empty node deleted by delete; selection goes to nearest content offset'
			},
			{
				rangeOrSelection: new ve.Range( 41 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function () {},
				expectedRangeOrSelection: new ve.Range( 39, 41 ),
				msg: 'Focusable node selected but not deleted by backspace'
			},
			{
				rangeOrSelection: new ve.Range( 39 ),
				keys: [ 'DELETE' ],
				expectedData: function () {},
				expectedRangeOrSelection: new ve.Range( 39, 41 ),
				msg: 'Focusable node selected but not deleted by delete'
			},
			{
				rangeOrSelection: new ve.Range( 39, 41 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 39, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 39 ),
				msg: 'Focusable node deleted if selected first'
			},
			{
				rangeOrSelection: new ve.Range( 38 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function () {},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 5, 37 ),
					fromCol: 0,
					fromRow: 0
				},
				msg: 'Table cell selected but not deleted by backspace'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'DELETE' ],
				expectedData: function () {},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 5, 37 ),
					fromCol: 0,
					fromRow: 0
				},
				msg: 'Table cell selected but not deleted by delete'
			},
			{
				htmlOrDoc: '<p>a</p>' + emptyList + '<p>b</p>',
				rangeOrSelection: new ve.Range( 6 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 3, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Empty list node deleted by delete from inside'
			},
			{
				htmlOrDoc: '<p>a</p>' + emptyList + '<p>b</p>',
				rangeOrSelection: new ve.Range( 6 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 3, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 2 ),
				msg: 'Empty list node deleted by backspace from inside'
			},
			{
				htmlOrDoc: '<p>a</p>' + emptyList + '<p>b</p>',
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 3, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 2 ),
				msg: 'Empty list node deleted by delete from before'
			},
			{
				htmlOrDoc: '<p>a</p>' + emptyList + '<p>b</p>',
				rangeOrSelection: new ve.Range( 10 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 3, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Empty list node deleted by backspace from after'
			},
			{
				htmlOrDoc: '<ul><li><p></p>' + emptyList + '</li></ul>',
				rangeOrSelection: new ve.Range( 7 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 2, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 5 ),
				msg: 'Selection is not lost inside block slug after backspace'
			},
			{
				rangeOrSelection: new ve.Range( 0, 63 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice(
						0,
						61,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Backspace after select all spanning entire document creates empty paragraph'
			},
			{
				htmlOrDoc: emptyList + '<p>foo</p>',
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 0, 2 );
					data.splice( 2, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'List at start of document unwrapped by backspace'
			},
			{
				htmlOrDoc: '<p>foo</p>' + emptyList,
				rangeOrSelection: new ve.Range( 8 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 5, 2 );
					data.splice( 7, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 6 ),
				msg: 'Empty list at end of document unwrapped by delete'
			},
			{
				htmlOrDoc: '<p>foo</p><ul><li><p>bar</p></li></ul>',
				rangeOrSelection: new ve.Range( 11 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 5, 2 );
					data.splice( 10, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 6 ),
				msg: 'Non-empty list at end of document unwrapped by delete'
			},
			{
				htmlOrDoc: '<p>foo</p><ul><li><p>bar</p></li><li><p>baz</p></li></ul>',
				rangeOrSelection: new ve.Range( 18 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					var paragraph = data.splice( 14, 5 );
					data.splice( 13, 2 ); // Remove the empty listItem
					data.splice.apply( data, [ 14, 0 ].concat( paragraph ) );
				},
				expectedRangeOrSelection: new ve.Range( 15 ),
				msg: 'Non-empty multi-item list at end of document unwrapped by delete'
			},
			{
				htmlOrDoc: '<p>foo</p>',
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'DELETE' ],
				expectedData: function () {
				},
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Delete at end of last paragraph does nothing'
			},
			{
				htmlOrDoc: '<p>foo</p><p>bar</p><p></p>',
				rangeOrSelection: new ve.Range( 11 ),
				keys: [ 'DELETE' ],
				expectedData: function () {
				},
				expectedRangeOrSelection: new ve.Range( 11 ),
				msg: 'Delete at end of last empty paragraph does nothing'
			},
			{
				htmlOrDoc: '<div rel="ve:Alien">foo</div><p>bar</p>',
				rangeOrSelection: new ve.Range( 2 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function () {
				},
				expectedRangeOrSelection: new ve.Range( 0, 2 ),
				msg: 'Backspace after an alien just selects it'
			},
			{
				htmlOrDoc: '<p>bar</p><div rel="ve:Alien">foo</div>',
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'DELETE' ],
				expectedData: function () {
				},
				expectedRangeOrSelection: new ve.Range( 5, 7 ),
				msg: 'Delete before an alien just selects it'
			},
			{
				htmlOrDoc: '<div rel="ve:Alien">foo</div><ul><li><p>foo</p></li></ul>',
				rangeOrSelection: new ve.Range( 5 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 2, 2 );
					data.splice( 7, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'List after an alien unwrapped by backspace'
			},
			{
				htmlOrDoc: '<p></p><div rel="ve:Alien">foo</div>',
				rangeOrSelection: new ve.Range( 2, 4 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 2, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Backspace with an alien selected deletes it'
			},
			{
				htmlOrDoc: '<p></p><div rel="ve:Alien">foo</div>',
				rangeOrSelection: new ve.Range( 2, 4 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 2, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Delete with an alien selected deletes it'
			},
			{
				htmlOrDoc: '<div rel="ve:Alien">foo</div><div rel="ve:Alien">foo</div>',
				rangeOrSelection: new ve.Range( 2, 4 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 2, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 2 ),
				msg: 'Backspace with an alien selected deletes it, with only aliens in the document'
			},
			{
				htmlOrDoc: '<div rel="ve:Alien">foo</div><div rel="ve:Alien">foo</div>',
				rangeOrSelection: new ve.Range( 2, 4 ),
				keys: [ 'DELETE' ],
				expectedData: function ( data ) {
					data.splice( 2, 2 );
				},
				expectedRangeOrSelection: new ve.Range( 2 ),
				msg: 'Delete with an alien selected deletes it, with only aliens in the document'
			},
			{
				htmlOrDoc: '<div rel="ve:Alien">foo</div>',
				rangeOrSelection: new ve.Range( 0, 2 ),
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 0, 2,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Backspace with an alien selected deletes it and replaces it with a paragraph, when the alien is the entire document'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 2,
					toRow: 1
				},
				keys: [ 'BACKSPACE' ],
				expectedData: function ( data ) {
					data.splice( 4, 3,
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' }
					);
					data.splice( 8, 3,
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' }
					);
					data.splice( 12, 3,
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' }
					);
					data.splice( 33, 3,
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' }
					);
					data.splice( 37, 3,
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 166 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 2,
					toRow: 1
				},
				msg: 'Table cells emptied by backspace'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfaceHandleSpecialKeyTest(
			assert, cases[ i ].htmlOrDoc, cases[ i ].rangeOrSelection, cases[ i ].keys,
			cases[ i ].expectedData, cases[ i ].expectedRangeOrSelection, cases[ i ].msg
		);
	}
} );

QUnit.test( 'special key down: table cells', function ( assert ) {
	var i,
		mergedCellsDoc = ve.dm.example.createExampleDocument( 'mergedCells' ),
		complexTableDoc = ve.dm.example.createExampleDocument( 'complexTable' ),
		cases = [
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				keys: [ 'ENTER' ],
				expectedRangeOrSelection: new ve.Range( 11 ),
				msg: 'Enter to edit a table cell'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				keys: [ 'ENTER', 'ESCAPE' ],
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				msg: 'Escape to leave a table cell'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				keys: [ 'ENTER', 'TAB' ],
				expectedRangeOrSelection: {
					type: 'linear',
					range: new ve.Range( 16 )
				},
				msg: 'Tab while in a table cell moves inside the next cell'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0
				},
				keys: [ 'ENTER', 'SHIFT+TAB' ],
				expectedRangeOrSelection: {
					type: 'linear',
					range: new ve.Range( 6 )
				},
				msg: 'Shift+tab while in a table cell moves inside the previous cell'
			},
			{
				// Create a full surface and return the view, as the UI surface is required for the insert action
				htmlOrDoc: ve.test.utils.createSurfaceFromDocument( ve.dm.example.createExampleDocument( 'mergedCells' ) ).view,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 5,
					fromRow: 6
				},
				keys: [ 'TAB' ],
				expectedData: function ( data ) {
					var tableCell = [
						{ type: 'tableCell', attributes: { style: 'data', colspan: 1, rowspan: 1 } },
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' },
						{ type: '/tableCell' }
					];
					data.splice.apply( data, [ 169, 0 ].concat( { type: 'tableRow' }, tableCell, tableCell, tableCell, tableCell, tableCell, tableCell, { type: '/tableRow' } ) );
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 197 ),
					fromCol: 0,
					fromRow: 7
				},
				msg: 'Tab at end of table inserts new row'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 2,
					fromRow: 0
				},
				keys: [ 'UP' ],
				expectedRangeOrSelection: new ve.Range( 0 ),
				msg: 'Up in first row of table moves out of table'
			},
			{
				htmlOrDoc: mergedCellsDoc,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 2,
					fromRow: 6
				},
				keys: [ 'DOWN' ],
				expectedRangeOrSelection: new ve.Range( 171 ),
				msg: 'Down in last row of table moves out of table'
			},
			{
				htmlOrDoc: complexTableDoc,
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'TAB' ],
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'Tab inside a table caption does nothing'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfaceHandleSpecialKeyTest(
			assert, cases[ i ].htmlOrDoc, cases[ i ].rangeOrSelection, cases[ i ].keys,
			cases[ i ].expectedData, cases[ i ].expectedRangeOrSelection, cases[ i ].msg
		);
	}

	// Allow the real surface created with createSurfaceFromDocument for the
	// 'Tab at end of table inserts new row' case to get properly initialized
	// before we end the test and kill it.
	// FIXME Oh no eww gross
	setTimeout( assert.async(), 0 );
} );

QUnit.test( 'special key down: linear arrow keys', function ( assert ) {
	var i,
		blockImageDoc = ve.dm.example.createExampleDocumentFromData(
			[ { type: 'paragraph' }, 'F', 'o', 'o', { type: '/paragraph' } ].concat(
				ve.dm.example.blockImage.data.slice()
			).concat(
				[ { type: 'paragraph' }, 'B', 'a', 'r', { type: '/paragraph' } ]
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
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfaceHandleSpecialKeyTest(
			assert, cases[ i ].htmlOrDoc, cases[ i ].rangeOrSelection, cases[ i ].keys,
			cases[ i ].expectedData, cases[ i ].expectedRangeOrSelection, cases[ i ].msg,
			cases[ i ].forceSelection, true
		);
	}
} );

QUnit.test( 'special key down: linear enter', function ( assert ) {
	var i,
		emptyList = '<ul><li><p></p></li></ul>',
		cases = [
			{
				rangeOrSelection: new ve.Range( 57 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						57, 0,
						{ type: '/paragraph' },
						{ type: 'paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 59 ),
				msg: 'End of paragraph split by enter'
			},
			{
				rangeOrSelection: new ve.Range( 57 ),
				keys: [ 'ENTER' ],
				htmlOrDoc: ( function () {
					var view = ve.test.utils.createSurfaceViewFromDocument( ve.dm.example.createExampleDocument() );
					view.surface.isMultiline = function () { return false; };
					return view;
				}() ),
				expectedData: function () {},
				expectedRangeOrSelection: new ve.Range( 57 ),
				msg: 'Enter does nothing in single line mode'
			},
			{
				rangeOrSelection: new ve.Range( 57 ),
				keys: [ 'SHIFT+ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						57, 0,
						{ type: '/paragraph' },
						{ type: 'paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 59 ),
				msg: 'End of paragraph split by shift+enter'
			},
			{
				rangeOrSelection: new ve.Range( 56 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						56, 0,
						{ type: '/paragraph' },
						{ type: 'paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 58 ),
				msg: 'Start of paragraph split by enter'
			},
			{
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						3, 0,
						{ type: '/heading' },
						{ type: 'heading', attributes: { level: 1 } }
					);
				},
				expectedRangeOrSelection: new ve.Range( 5 ),
				msg: 'Heading split by enter'
			},
			{
				rangeOrSelection: new ve.Range( 2, 3 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						2, 1,
						{ type: '/heading' },
						{ type: 'heading', attributes: { level: 1 } }
					);
				},
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Selection in heading removed, then split by enter'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						0, 0,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 3 ),
				msg: 'Start of heading split into a plain paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						5, 0,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 6 ),
				msg: 'End of heading split into a plain paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 16 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						16, 0,
						{ type: '/paragraph' },
						{ type: '/listItem' },
						{ type: 'listItem' },
						{ type: 'paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 20 ),
				msg: 'List item split by enter'
			},
			{
				rangeOrSelection: new ve.Range( 16 ),
				keys: [ 'SHIFT+ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						16, 0,
						{ type: '/paragraph' },
						{ type: 'paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 18 ),
				msg: 'List item not split by shift+enter'
			},
			{
				rangeOrSelection: new ve.Range( 30 ),
				keys: [ 'ENTER', 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						33, 0,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 34 ),
				msg: 'Two enters breaks out of a list and starts a new paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 21 ),
				keys: [ 'ENTER', 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						24, 0,
						{ type: '/listItem' },
						{ type: 'listItem' },
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 27 ),
				msg: 'Two enters in nested list breaks out of inner list and starts a new list item'
			},
			{
				htmlOrDoc: '<p>foo</p>' + emptyList + '<p>bar</p>',
				rangeOrSelection: new ve.Range( 8 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice( 5, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 6 ),
				msg: 'Enter in an empty list destroys it and moves to next paragraph'
			},
			{
				htmlOrDoc: '<p>foo</p>' + emptyList,
				rangeOrSelection: new ve.Range( 8 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice( 5, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 4 ),
				msg: 'Enter in an empty list at end of document destroys it and moves to previous paragraph'
			},
			{
				htmlOrDoc: emptyList + '<p>bar</p>',
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice( 0, 6 );
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Enter in an empty list at start of document destroys it and moves to next paragraph'
			},
			{
				htmlOrDoc: emptyList,
				rangeOrSelection: new ve.Range( 3 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						0, 6,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Enter in an empty list with no adjacent content destroys it and creates a paragraph'
			},
			{
				htmlOrDoc: '<p>foo</p><ul><li>bar' + emptyList + '</li></ul><p>baz</p>',
				rangeOrSelection: new ve.Range( 15 ),
				keys: [ 'ENTER' ],
				expectedData: function ( data ) {
					data.splice(
						12, 6,
						{ type: '/listItem' }, { type: 'listItem' }, { type: 'paragraph' }, { type: '/paragraph' }
					);
				},
				expectedRangeOrSelection: new ve.Range( 15 ),
				msg: 'Enter in a completely empty nested list destroys it and adds a new list item to the parent'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfaceHandleSpecialKeyTest(
			assert, cases[ i ].htmlOrDoc, cases[ i ].rangeOrSelection, cases[ i ].keys,
			cases[ i ].expectedData, cases[ i ].expectedRangeOrSelection, cases[ i ].msg
		);
	}
} );

QUnit.test( 'handleObservedChanges (content changes)', function ( assert ) {
	var i,
		linkHash = 'hdee7b89d544aa584',
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
		var txs, i, ops,
			delayed = [],
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
		for ( i = 0; i < delayed.length; i++ ) {
			delayed[ i ]();
		}
		txs = ( model.getHistory()[ 0 ] || {} ).transactions || [];
		ops = [];
		for ( i = 0; i < txs.length; i++ ) {
			ops.push( txs[ i ].getOperations() );
		}
		assert.deepEqual( ops, expectedOps, msg + ': keys' );
		assert.equalRange( model.getSelection().getRange(), expectedRangeOrSelection, msg + ': range' );
		assert.equal( initialBreakpoints !== model.undoStack.length, !!expectsBreakpoint, msg + ': breakpoint' );

		view.destroy();
	}

	for ( i = 0; i < cases.length; i++ ) {
		testRunner(
			cases[ i ].prevHtml, cases[ i ].prevRange, cases[ i ].prevFocusIsAfterAnnotationBoundary || false,
			cases[ i ].nextHtml, cases[ i ].nextRange,
			cases[ i ].expectedOps, cases[ i ].expectedRangeOrSelection || cases[ i ].nextRange, cases[ i ].expectsBreakpoint, cases[ i ].msg
		);
	}

} );

QUnit.test( 'handleDataTransfer/handleDataTransferItems', function ( assert ) {
	var i,
		surface = ve.test.utils.createViewOnlySurfaceFromHtml( '' ),
		view = surface.getView(),
		model = surface.getModel(),
		linkAction = ve.ui.actionFactory.create( 'link', surface ),
		link = linkAction.getLinkAnnotation( 'http://foo.com' ),
		// Don't hard-code link index as it may depend on the LinkAction used
		linkHash = model.getDocument().getStore().hashOfValue( link ),
		fragment = model.getLinearFragment( new ve.Range( 1 ) ),
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
					getData: function ( type ) {
						return type === 'text/uri-list' ? '#comment\nhttp://foo.com\n' : '';
					}
				},
				isPaste: true,
				expectedData: [
					[ 'h', [ linkHash ] ],
					[ 't', [ linkHash ] ],
					[ 't', [ linkHash ] ],
					[ 'p', [ linkHash ] ],
					[ ':', [ linkHash ] ],
					[ '/', [ linkHash ] ],
					[ '/', [ linkHash ] ],
					[ 'f', [ linkHash ] ],
					[ 'o', [ linkHash ] ],
					[ 'o', [ linkHash ] ],
					[ '.', [ linkHash ] ],
					[ 'c', [ linkHash ] ],
					[ 'o', [ linkHash ] ],
					[ 'm', [ linkHash ] ]
				]
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		fragment.select();
		view.handleDataTransfer( cases[ i ].dataTransfer, cases[ i ].isPaste );
		assert.equalLinearData( model.getDocument().getFullData( fragment.getSelection().getRange() ), cases[ i ].expectedData, cases[ i ].msg );
		model.undo();
	}
} );

QUnit.test( 'getClipboardHash', function ( assert ) {
	assert.strictEqual(
		ve.ce.Surface.static.getClipboardHash(
			$( '  <p class="foo"> B<b>a</b>r </p>\n\t<span class="baz"></span> Quux <h1><span></span>Whee</h1>' )
		),
		'BarQuuxWhee',
		'Simple usage'
	);
} );

QUnit.test( 'onCopy', function ( assert ) {
	var i,
		cases = [
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
				expectedText: 'g\n\n',
				msg: 'Copy list item'
			},
			{
				doc: ve.dm.example.RDFaDoc,
				rangeOrSelection: new ve.Range( 0, 5 ),
				expectedData: ve.dm.example.RDFaDoc.data.data.slice(),
				expectedOriginalRange: new ve.Range( 0, 5 ),
				expectedBalancedRange: new ve.Range( 0, 5 ),
				expectedHtml:
					'<p content="b" datatype="c" property="d" rel="e" resource="f" rev="g" typeof="h" class="i" ' +
						'data-ve-attributes="{&quot;typeof&quot;:&quot;h&quot;,&quot;rev&quot;:&quot;g&quot;,' +
						'&quot;resource&quot;:&quot;f&quot;,&quot;rel&quot;:&quot;e&quot;,&quot;property&quot;:&quot;d&quot;,' +
						'&quot;datatype&quot;:&quot;c&quot;,&quot;content&quot;:&quot;b&quot;}">' +
						'Foo' +
					'</p>',
				expectedText: 'Foo\n\n',
				msg: 'RDFa attributes encoded into data-ve-attributes'
			},
			{
				rangeOrSelection: new ve.Range( 1, 4 ),
				expectedHtml: '<span data-ve-clipboard-key="">&nbsp;</span>a<b>b</b><i>c</i>',
				noClipboardData: true,
				msg: 'Clipboard span'
			}
			/*
			// Our CI environment uses either Chrome 57 (mediawiki/extensions/VisualEditor)
			// or Chrome 63 (VisualEditor/VisualEditor), but they produce different results,
			// so this test will always fail in at least one of them.
			{
				rangeOrSelection: new ve.Range( 0, 61 ),
				expectedText: 'abc\n\nd\n\ne\n\nf\n\ng\n\nhi\nj\n\nk\n\nl\n\nm\n\n', // Chrome 57
				expectedText: 'abc\nd\n\ne\n\nf\n\ng\n\nhi\nj\n\nk\n\nl\n\nm\n\n',   // Chrome 63
				msg: 'Plain text of entire document'
			}
			*/
		];

	function testRunner( doc, rangeOrSelection, expectedData, expectedOriginalRange, expectedBalancedRange, expectedHtml, expectedText, noClipboardData, msg ) {
		var slice, isClipboardDataFormatsSupported, $expected, clipboardKey,
			testEvent = new ve.test.utils.TestEvent(),
			clipboardData = testEvent.originalEvent.clipboardData,
			view = ve.test.utils.createSurfaceViewFromDocument( doc || ve.dm.example.createExampleDocument() ),
			model = view.getModel();

		if ( noClipboardData ) {
			isClipboardDataFormatsSupported = ve.isClipboardDataFormatsSupported;
			ve.isClipboardDataFormatsSupported = function () { return false; };
		}

		// Paste sequence
		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection ) );
		view.onCopy( testEvent );

		if ( noClipboardData ) {
			ve.isClipboardDataFormatsSupported = isClipboardDataFormatsSupported;
		}

		slice = view.clipboard.slice;
		clipboardKey = view.clipboardId + '-' + view.clipboardIndex;

		assert.equalRange( slice.originalRange, expectedOriginalRange || rangeOrSelection, msg + ': originalRange' );
		assert.equalRange( slice.balancedRange, expectedBalancedRange || rangeOrSelection, msg + ': balancedRange' );
		if ( expectedData ) {
			assert.equalLinearData( slice.data.data, expectedData, msg + ': data' );
		}
		if ( expectedHtml ) {
			$expected = $( '<div>' ).html( expectedHtml );
			// Clipboard key is random, so update it
			$expected.find( '[data-ve-clipboard-key]' ).attr( 'data-ve-clipboard-key', clipboardKey );
			assert.equalDomElement(
				$( '<div>' ).html( clipboardData.getData( 'text/html' ) )[ 0 ],
				$expected[ 0 ],
				msg + ': html'
			);
		}
		if ( expectedText ) {
			if ( $.client.profile().layout === 'gecko' ) {
				expectedText = expectedText.trim();
			}
			assert.strictEqual( clipboardData.getData( 'text/plain' ), expectedText, msg + ': text' );
		}
		if ( !noClipboardData ) {
			assert.strictEqual( clipboardData.getData( 'text/xcustom' ), clipboardKey, msg + ': clipboardId set' );
		}

		view.destroy();
	}

	for ( i = 0; i < cases.length; i++ ) {
		testRunner(
			cases[ i ].doc, cases[ i ].rangeOrSelection, cases[ i ].expectedData,
			cases[ i ].expectedOriginalRange, cases[ i ].expectedBalancedRange,
			cases[ i ].expectedHtml, cases[ i ].expectedText, cases[ i ].noClipboardData, cases[ i ].msg
		);
	}

} );

QUnit.test( 'beforePaste/afterPaste', function ( assert ) {
	var i,
		exampleDoc = '<p id="foo"></p><p>Foo</p><h2> Baz </h2><table><tbody><tr><td></td></tbody></table><p><b>Quux</b></p>',
		docLen = 30,
		bold = ve.dm.example.bold,
		italic = ve.dm.example.italic,
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
							insert: [
								'F', 'o', 'o'
							],
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
							insert: [ 'B', 'a', 'r' ],
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
							insert: [ 'B', 'a', 'r' ],
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
								[ 'F', [ bold ] ],
								[ 'o', [ bold ] ],
								[ 'o', [ bold ] ]
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
								[ 'F', [ bold ] ],
								[ 'o', [ bold ] ],
								[ 'o', [ bold ] ]
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 25 }
					]
				],
				msg: 'Internal text into annotated content (noClipboardData)'
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
								[ 'F', [ bold ] ],
								[ 'o', [ bold ] ],
								[ 'o', [ bold ] ]
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
								[ 'F', [ bold, italic ] ],
								[ 'o', [ bold, italic ] ],
								[ 'o', [ bold, italic ] ]
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
								[ 'Q', [ bold ] ],
								[ 'u', [ bold ] ],
								[ 'u', [ bold ] ],
								[ 'x', [ bold ] ]
							]
						},
						{ type: 'retain', length: docLen - 27 }
					],
					[
						{ type: 'retain', length: 23 },
						{
							type: 'replace',
							insert: [
								[ 'F', [ bold ] ],
								[ 'o', [ bold ] ],
								[ 'o', [ bold ] ]
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
							insert: [ 'F', 'o', 'o', 'b', 'a', 'r' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
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
							insert: [ 'B', 'a', 'r' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
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
							insert: [ 'B', 'a', 'r' ],
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
							insert: [ 'B', 'a', 'r' ],
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
							insert: [ 'B', 'a', 'r' ],
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
							insert: [ 'B', 'a', 'r' ],
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
							insert: [ 'Q', 'u', 'u', 'x' ],
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
							insert: [ 'F', 'o', 'o' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 17 }
					]
				],
				msg: 'Text into wrapper paragraph'
			},
			{
				rangeOrSelection: new ve.Range( 4 ),
				pasteHtml: '☂foo☀',
				expectedRangeOrSelection: new ve.Range( 9 ),
				expectedOps: [
					[
						{ type: 'retain', length: 4 },
						{
							type: 'replace',
							insert: [ '☂', 'f', 'o', 'o', '☀' ],
							remove: []
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
				msg: 'Left/right placeholder characters'
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
								'F', 'o', 'o',
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
								'F', 'o', 'o',
								{ type: '/paragraph' },
								{ type: '/tableCaption' },
								{ type: 'tableSection', attributes: { style: 'body' } },
								{ type: 'tableRow' },
								{ type: 'tableCell', attributes: { style: 'data' } },
								{ type: 'paragraph', internal: { generated: 'wrapper' } },
								'B', 'a', 'r',
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
				pasteHtml:
					'<p about="ignored" class="i" ' +
						'data-ve-attributes="{&quot;typeof&quot;:&quot;h&quot;,&quot;rev&quot;:&quot;g&quot;,' +
						'&quot;resource&quot;:&quot;f&quot;,&quot;rel&quot;:&quot;e&quot;,&quot;property&quot;:&quot;d&quot;,' +
						'&quot;datatype&quot;:&quot;c&quot;,&quot;content&quot;:&quot;b&quot;,&quot;about&quot;:&quot;a&quot;}">' +
						'Foo' +
					'</p>',
				useClipboardData: true,
				expectedRangeOrSelection: new ve.Range( 5 ),
				expectedOps: [
					[
						{
							type: 'replace',
							insert: ve.dm.example.removeOriginalDomElements( ve.dm.example.RDFaDoc.data.data.slice( 0, 5 ) ),
							remove: []
						},
						{ type: 'retain', length: docLen }
					]
				],
				msg: 'RDFa attributes restored/overwritten from data-ve-attributes'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				documentHtml: '<p></p>',
				pasteHtml:
					'<span class="ve-pasteProtect" id="meaningful">F</span>' +
					'<span class="ve-pasteProtect" style="color: red;">o</span>' +
					'<span class="ve-pasteProtect meaningful">o</span>',
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
				expectedHtml:
					'<p>' +
						'<span id="meaningful">F</span>' +
						'o' +
						'<span class="meaningful">o</span>' +
					'</p>',
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
								[ 'F', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ],
								[ 'o', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ],
								[ 'o', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ]
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
								[ 'F', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ],
								[ 'o', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ],
								[ 'o', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ]
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
				pasteHtml: '<span style="font-weight:700;">A</span><span style="font-style:italic;">B</span><span style="text-decoration:underline">C</span><span style="text-decoration:line-through;">D</span><span style="vertical-align:super;">E</span><span style="vertical-align:sub;">F</span><span style="font-weight:700; font-style:italic;">G</span><span style="color:red;">H</span>',
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								[ 'A', [ { type: 'textStyle/bold', attributes: { nodeName: 'b' } } ] ],
								[ 'B', [ { type: 'textStyle/italic', attributes: { nodeName: 'i' } } ] ],
								[ 'C', [ { type: 'textStyle/underline', attributes: { nodeName: 'u' } } ] ],
								[ 'D', [ { type: 'textStyle/strikethrough', attributes: { nodeName: 's' } } ] ],
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
				expectedRangeOrSelection: new ve.Range( 9 ),
				msg: 'Span cleanups: style converted into markup'
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
								{ type: 'paragraph' },
								'B', 'a', 'r',
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
				pasteHtml: '<blockquote><div rel="ve:Alien"><p>Foo</p><div><br></div></div></blockquote>',
				expectedOps: [],
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'Pasting block content that is fully stripped does nothing'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<b>Foo</b>',
				pasteTargetHtml: '<p>Foo</p>',
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								'F', 'o', 'o'
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
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span rel="ve:Alien">Alien</span><span rel="ve:Alien">Alien2</span>',
				pasteTargetHtml: '<p><span>Alien</span><span rel="ve:Alien">Alien2</span></p>',
				fromVe: true,
				expectedOps: [
					[
						{
							type: 'retain',
							length: 1
						},
						{
							type: 'replace',
							insert: [
								{ type: 'alienInline' },
								{ type: '/alienInline' },
								{ type: 'alienInline' },
								{ type: '/alienInline' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 5 ),
				msg: 'Paste API HTML used if important attributes dropped'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				pasteHtml: '<span data-ve-clipboard-key="0.13811087369534492-4">&nbsp;</span><s rel="ve:Alien">Alien</s>',
				fromVe: true,
				expectedOps: [
					[
						{ type: 'retain', length: 1 },
						{
							type: 'replace',
							insert: [
								{ type: 'alienInline' },
								{ type: '/alienInline' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedRangeOrSelection: new ve.Range( 3 ),
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
								{ type: 'paragraph', internal: { generated: 'empty' } },
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
								{ type: 'paragraph' },
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
								{ type: 'paragraph', internal: { generated: 'empty' } },
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
								{ type: 'paragraph', internal: { generated: 'empty' } },
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
								{ type: 'alienTableCell', attributes: { style: 'data' } },
								{ type: '/alienTableCell' }
							],
							remove: [
								{ type: 'tableCell', attributes: { style: 'data' } },
								{ type: 'paragraph', internal: { generated: 'empty' } },
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
								{ type: 'alienTableCell', attributes: { style: 'data' } },
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
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				// Firefox doesn't like using execCommand for this test for some reason
				pasteTargetHtml: '<table><tbody><tr><td>X</td><td>Y</td><td>Z</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 33 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 2,
					toRow: 0
				},
				expectedOps: [
					[
						{ type: 'retain', length: 19 },
						{
							insert: [
								{
									attributes: {
										colspan: 1,
										rowspan: 1,
										style: 'data'
									},
									type: 'tableCell'
								},
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' },
								{
									type: '/tableCell'
								}
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 19 }
					],
					[
						{ type: 'retain', length: 23 },
						{
							type: 'replace',
							insert: [
								{
									attributes: {
										colspan: 1,
										rowspan: 1,
										style: 'data'
									},
									type: 'tableCell'
								},
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' },
								{
									type: '/tableCell'
								}
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 19 }
					],
					[
						{ type: 'retain', length: 24 },
						{
							insert: [],
							remove: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 24 },
						{
							insert: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								'Z',
								{ type: '/paragraph' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 20 },
						{
							insert: [],
							remove: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 13 }
					],
					[
						{ type: 'retain', length: 20 },
						{
							insert: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								'Y',
								{ type: '/paragraph' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 13 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							insert: [],
							remove: [
								{
									internal: {
										generated: 'empty'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 8 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							insert: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								'X',
								{ type: '/paragraph' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 8 }
					]
				],
				msg: 'Paste row of table cells onto table cell'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 22 ),
					fromCol: 0,
					fromRow: 0
				},
				pasteHtml: '<table><tbody><tr><td>X</td></tr><tr><td>Y</td></tr><tr><td>Z</td></tr></tbody></table>',
				fromVe: true,
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 12, 37 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 2
				},
				expectedOps: [
					[
						{ type: 'retain', length: 20 },
						{
							insert: [
								{ type: 'tableRow' },
								{
									attributes: {
										colspan: 1,
										rowspan: 1,
										style: 'data'
									},
									type: 'tableCell'
								},
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' },
								{ type: '/tableCell' },
								{ type: '/tableRow' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 20 }
					],
					[
						{ type: 'retain', length: 26 },
						{
							type: 'replace',
							insert: [
								{ type: 'tableRow' },
								{
									attributes: {
										colspan: 1,
										rowspan: 1,
										style: 'data'
									},
									type: 'tableCell'
								},
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' },
								{ type: '/tableCell' },
								{ type: '/tableRow' }
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 20 }
					],
					[
						{ type: 'retain', length: 28 },
						{
							insert: [],
							remove: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 28 },
						{
							insert: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								'Z',
								{ type: '/paragraph' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 18 }
					],
					[
						{ type: 'retain', length: 22 },
						{
							insert: [],
							remove: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 11 }
					],
					[
						{ type: 'retain', length: 22 },
						{
							insert: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								'Y',
								{ type: '/paragraph' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 11 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							insert: [],
							remove: [
								{
									internal: {
										generated: 'empty'
									},
									type: 'paragraph'
								},
								{ type: '/paragraph' }
							],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 4 }
					],
					[
						{ type: 'retain', length: 16 },
						{
							insert: [
								{
									internal: {
										generated: 'wrapper'
									},
									type: 'paragraph'
								},
								'X',
								{ type: '/paragraph' }
							],
							remove: [],
							type: 'replace'
						},
						{ type: 'retain', length: docLen - 4 }
					]
				],
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
								{
									internal: {
										generated: 'empty'
									},
									type: 'paragraph'
								},
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
								'F', 'o', 'o',
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
								{
									type: 'paragraph',
									internal: {
										generated: 'wrapper'
									}
								},
								'X',
								{ type: '/paragraph' },
								{ type: '/tableCell' },
								{ type: '/tableRow' },
								{ type: '/tableSection' },
								{ type: '/table' },
								{ type: 'paragraph' },
								'B', 'a', 'r',
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
				rangeOrSelection: new ve.Range( 0 ),
				// Firefox doesn't like using execCommand for this test for some reason
				pasteTargetHtml: '<ul><li>A</li><ul><li>B</li></ul></ul>',
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
				pasteTargetHtml: 'A<ul><ul><li>B</li></ul></ul>C',
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
				pasteTargetHtml: '<p>A</p><p></p><p>B</p>',
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
				pasteTargetHtml: '<h3>A</h3>',
				expectedOps: [
					[
						{
							type: 'replace',
							insert: [
								{ type: 'paragraph' },
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
								'F', 'o', 'o'
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedDefaultPrevented: true,
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
							insert: [
								'<', 'b', '>', 'F', 'o', 'o', '<', '/', 'b', '>'
							],
							remove: []
						},
						{ type: 'retain', length: docLen - 1 }
					]
				],
				expectedDefaultPrevented: true,
				msg: 'Plain text paste doesn\'t become HTML'
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfacePasteTest(
			assert, cases[ i ].documentHtml || ve.test.utils.createSurfaceViewFromHtml( exampleDoc ),
			{
				'text/html': cases[ i ].pasteHtml,
				'text/plain': cases[ i ].pasteText
			},
			cases[ i ].internalSourceRangeOrSelection, cases[ i ].noClipboardData, cases[ i ].fromVe, cases[ i ].useClipboardData,
			cases[ i ].pasteTargetHtml, cases[ i ].rangeOrSelection, cases[ i ].pasteSpecial,
			cases[ i ].expectedOps, cases[ i ].expectedRangeOrSelection, cases[ i ].expectedHtml,
			cases[ i ].expectedDefaultPrevented, cases[ i ].store, cases[ i ].msg
		);
	}
} );

QUnit.test( 'special key down: table arrow keys', function ( assert ) {
	var i, offsets, expectedSelectionOffsets, selection, table, view, model,
		fn = function () {},
		tables = {
			mergedCells: {
				view: ve.test.utils.createSurfaceViewFromDocument(
					ve.dm.example.createExampleDocument( 'mergedCells' )
				),
				tableRange: new ve.Range( 0, 171 )
			},
			rtl: {
				view: ve.test.utils.createSurfaceViewFromHtml(
					'<table style="direction: rtl;">' +
						'<tr><td>1</td><td>2</td></tr>' +
						'<tr><td>3</td><td>4</td></tr>' +
					'</table>'
				),
				tableRange: new ve.Range( 0, 28 )
			}
		},
		cases = [
			{
				msg: 'Simple move right',
				key: 'RIGHT',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 1, 0 ]
			},
			{
				msg: 'Simple move right with tab',
				key: 'TAB',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 1, 0 ]
			},
			{
				msg: 'Move right with tab at end wraps to next line',
				key: 'TAB',
				selectionOffsets: [ 5, 0 ],
				expectedSelectionOffsets: [ 0, 1 ]
			},
			{
				msg: 'Simple move end',
				key: 'END',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 5, 0 ]
			},
			{
				msg: 'Simple move down',
				key: 'DOWN',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 0, 1 ]
			},
			{
				msg: 'Simple move page down',
				key: 'PAGEDOWN',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 0, 6 ]
			},
			{
				msg: 'Simple move left',
				key: 'LEFT',
				selectionOffsets: [ 5, 6 ],
				expectedSelectionOffsets: [ 4, 6 ]
			},
			{
				msg: 'Simple move left with shift+tab',
				key: 'TAB',
				shiftKey: true,
				selectionOffsets: [ 5, 6 ],
				expectedSelectionOffsets: [ 4, 6 ]
			},
			{
				msg: 'Move left with shift+tab at start wraps to previous line',
				key: 'TAB',
				shiftKey: true,
				selectionOffsets: [ 0, 1 ],
				expectedSelectionOffsets: [ 5, 0 ]
			},
			{
				msg: 'Simple move home',
				key: 'HOME',
				selectionOffsets: [ 5, 6 ],
				expectedSelectionOffsets: [ 0, 6 ]
			},
			{
				msg: 'Simple move page up',
				key: 'PAGEUP',
				selectionOffsets: [ 5, 6 ],
				expectedSelectionOffsets: [ 5, 0 ]
			},
			{
				msg: 'Move left at start',
				key: 'LEFT',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 0, 0 ]
			},
			{
				msg: 'Move right at end',
				key: 'RIGHT',
				selectionOffsets: [ 5, 6 ],
				expectedSelectionOffsets: [ 5, 6 ]
			},
			{
				msg: 'Move from merged cell to merged cell',
				key: 'RIGHT',
				selectionOffsets: [ 1, 1, 2, 1 ],
				expectedSelectionOffsets: [ 3, 0, 3, 2 ]
			},
			{
				msg: 'Shift-select through merged cells',
				key: 'PAGEDOWN',
				shiftKey: true,
				selectionOffsets: [ 1, 0, 1, 0 ],
				expectedSelectionOffsets: [ 1, 0, 3, 6 ]
			},
			{
				msg: 'Expanded selection collapses',
				key: 'DOWN',
				selectionOffsets: [ 0, 0, 2, 0 ],
				expectedSelectionOffsets: [ 0, 1 ]
			},
			{
				msg: 'Left in RTL table increments column',
				table: 'rtl',
				key: 'LEFT',
				selectionOffsets: [ 0, 0 ],
				expectedSelectionOffsets: [ 1, 0 ]
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		offsets = cases[ i ].selectionOffsets;
		table = tables[ cases[ i ].table || 'mergedCells' ];
		view = table.view;
		model = view.getModel();
		model.setSelection( new ve.dm.TableSelection(
			model.getDocument(), table.tableRange, offsets[ 0 ], offsets[ 1 ], offsets[ 2 ], offsets[ 3 ] )
		);
		ve.ce.keyDownHandlerFactory.executeHandlersForKey(
			OO.ui.Keys[ cases[ i ].key ], model.getSelection().getName(), view,
			{
				keyCode: OO.ui.Keys[ cases[ i ].key ],
				shiftKey: !!cases[ i ].shiftKey,
				preventDefault: fn,
				stopPropagation: fn
			}
		);
		selection = model.getSelection();
		expectedSelectionOffsets = cases[ i ].expectedSelectionOffsets.length > 2 ?
			cases[ i ].expectedSelectionOffsets :
			cases[ i ].expectedSelectionOffsets.concat( cases[ i ].expectedSelectionOffsets );
		assert.deepEqual(
			[ selection.fromCol, selection.fromRow, selection.toCol, selection.toRow ],
			expectedSelectionOffsets,
			cases[ i ].msg
		);
	}
} );

QUnit.test( 'onDocumentDragStart/onDocumentDrop', function ( assert ) {

	var i,
		selection = new ve.dm.LinearSelection( {}, new ve.Range( 1, 4 ) ),
		expectedSelection = new ve.dm.LinearSelection( {}, new ve.Range( 7, 10 ) ),
		cases = [
			{
				msg: 'Simple drag and drop',
				rangeOrSelection: new ve.Range( 1, 4 ),
				targetOffset: 10,
				expectedTransfer: { 'application-x/VisualEditor': JSON.stringify( selection ) },
				expectedData: function ( data ) {
					var removed = data.splice( 1, 3 );
					data.splice.apply( data, [ 7, 0 ].concat( removed ) );
				},
				expectedSelection: expectedSelection
			},
			{
				msg: 'Simple drag and drop in IE',
				rangeOrSelection: new ve.Range( 1, 4 ),
				targetOffset: 10,
				isIE: true,
				expectedTransfer: { text: '__ve__' + JSON.stringify( selection ) },
				expectedData: function ( data ) {
					var removed = data.splice( 1, 3 );
					data.splice.apply( data, [ 7, 0 ].concat( removed ) );
				},
				expectedSelection: expectedSelection
			},
			{
				msg: 'Invalid target offset',
				rangeOrSelection: new ve.Range( 1, 4 ),
				targetOffset: -1,
				expectedTransfer: { 'application-x/VisualEditor': JSON.stringify( selection ) },
				expectedData: function () {},
				expectedSelection: selection
			}
		];

	function testRunner( rangeOrSelection, targetOffset, expectedTransfer, expectedData, expectedSelection, isIE, msg ) {
		var view = ve.test.utils.createSurfaceViewFromDocument( ve.dm.example.createExampleDocument() ),
			model = view.getModel(),
			data = ve.copy( model.getDocument().getFullData() ),
			dataTransfer = {},
			mockEvent = {
				originalEvent: {
					dataTransfer: {
						setData: function ( key, value ) {
							if ( isIE && key !== 'text' ) {
								throw new Error( 'IE FAIL' );
							}
							dataTransfer[ key ] = value;
						},
						getData: function ( key ) {
							if ( isIE && key !== 'text' ) {
								throw new Error( 'IE FAIL' );
							}
							return dataTransfer[ key ];
						}
					}
				},
				preventDefault: function () {},
				stopPropagation: function () {}
			};

		// Mock drop coords
		view.getOffsetFromCoords = function () {
			return targetOffset;
		};

		expectedData( data );

		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection ) );

		view.onDocumentDragStart( mockEvent );
		assert.deepEqual(
			dataTransfer,
			expectedTransfer,
			'dataTransfer data set after drag start'
		);

		view.onDocumentDrop( mockEvent );

		assert.equalLinearData( model.getDocument().getFullData(), data, msg + ': data' );
		assert.equalHash( model.getSelection(), expectedSelection, msg + ': selection' );
		view.destroy();
	}

	for ( i = 0; i < cases.length; i++ ) {
		testRunner(
			cases[ i ].rangeOrSelection, cases[ i ].targetOffset, cases[ i ].expectedTransfer, cases[ i ].expectedData,
			cases[ i ].expectedSelection, cases[ i ].isIE, cases[ i ].msg
		);
	}

} );

QUnit.test( 'getSelectionState', function ( assert ) {
	var i, j, l, view, selection, internalListNode, node, rootElement,
		cases = [
			{
				msg: 'Grouped aliens',
				html: '<p>' +
					'Foo' +
					'<span rel="ve:Alien" about="g1">Bar</span>' +
					'<span rel="ve:Alien" about="g1">Baz</span>' +
					'<span rel="ve:Alien" about="g1">Quux</span>' +
					'Whee' +
				'</p>' +
				'<p>' +
					'2<b>n</b>d' +
				'</p>',
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
				msg: 'Simple example doc',
				html: ve.dm.example.html,
				expected: ve.dm.example.offsetPaths
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		view = ve.test.utils.createSurfaceViewFromHtml( cases[ i ].html );
		internalListNode = view.getModel().getDocument().getInternalList().getListNode();
		rootElement = view.getDocument().getDocumentNode().$element[ 0 ];
		for ( j = 0, l = internalListNode.getOuterRange().start; j < l; j++ ) {
			node = view.getDocument().getDocumentNode().getNodeFromOffset( j );
			if ( node.isFocusable() ) {
				assert.strictEqual( null, cases[ i ].expected[ j ], 'Focusable node at ' + j );
			} else {
				selection = view.getSelectionState( new ve.Range( j ) );
				assert.deepEqual(
					ve.getOffsetPath( rootElement, selection.anchorNode, selection.anchorOffset ),
					cases[ i ].expected[ j ],
					'Path at ' + j + ' in ' + cases[ i ].msg
				);
			}
		}
		view.destroy();
	}

} );

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
// TODO: ve.ce.Surface#onCut
// TODO: ve.ce.Surface#onPaste
// TODO: ve.ce.Surface#onDocumentCompositionEnd
// TODO: ve.ce.Surface#onChange
// TODO: ve.ce.Surface#onSurfaceObserverSelectionChange
// TODO: ve.ce.Surface#onLock
// TODO: ve.ce.Surface#onUnlock
// TODO: ve.ce.Surface#startRelocation
// TODO: ve.ce.Surface#endRelocation
// TODO: ve.ce.Surface#handleInsertion
// TODO: ve.ce.Surface#showModelSelection
// TODO: ve.ce.Surface#appendHighlights
// TODO: ve.ce.Surface#incRenderLock
// TODO: ve.ce.Surface#decRenderLock
