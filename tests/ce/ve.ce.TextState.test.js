/*!
 * VisualEditor ContentEditable TextState tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.TextState' );

/* Tests */

QUnit.test( 'getChangeTransaction', function ( assert ) {
	var i, view, documentView, documentNode, test, oldState, newState, change, tests;
	tests = [
		{
			msg: 'Clear bold',
			oldRawHtml: '<p>foo <b>bar</b> baz</p>',
			oldInnerHtml: 'foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b> baz',
			newInnerHtml: 'foo bar baz',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					remove: [ [ 'b', [ 0 ] ], [ 'a', [ 0 ] ], [ 'r', [ 0 ] ] ],
					insert: [ 'b', 'a', 'r' ],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 7 }
			]
		},
		{
			msg: 'Extend bold',
			oldRawHtml: '<p>foo <b>ba</b> baz</p>',
			oldInnerHtml: 'foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">ba</b> baz',
			newInnerHtml: 'foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b> baz',
			operations: [
				{ type: 'retain', length: 7 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'r', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 7 }
			]
		},
		{
			msg: 'Set bold',
			oldRawHtml: '<p>foo bar baz</p>',
			oldInnerHtml: 'foo bar baz',
			newInnerHtml: 'foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b> baz',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					remove: [ 'b', 'a', 'r' ],
					insert: [ [ 'b', [ 0 ] ], [ 'a', [ 0 ] ], [ 'r', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 7 }
			]
		},
		{
			msg: 'Insert at start of bold',
			oldRawHtml: 'wx<b>y</b>',
			oldInnerHtml: 'wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b>',
			newInnerHtml: 'wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">zy</b>',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'z', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Insert before start of bold',
			oldRawHtml: 'wx<b>y</b>',
			oldInnerHtml: 'wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b>',
			newInnerHtml: 'wxz<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b>',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ 'z' ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Insert into insertion annotation',
			willFail: true,
			oldRawHtml: 'wx<b></b>z',
			oldInnerHtml: 'wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation"></b>z',
			newInnerHtml: 'wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b>z',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'y', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Set bold underline before underline',
			oldRawHtml: 'foo bar<u>baz</u>',
			oldInnerHtml: 'foo bar<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">baz</u>',
			newInnerHtml: 'foo <u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation"><b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b>baz</u>',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					remove: [ 'b', 'a', 'r' ],
					insert: [
						[ 'b', [ 0, 1 ] ],
						[ 'a', [ 0, 1 ] ],
						[ 'r', [ 0, 1 ] ]
					],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 6 }
			]
		},
		{
			msg: 'Clear bold in italic',
			oldRawHtml: '<p><i>foo <b>bar</b> baz</i></p>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b> baz</i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo bar baz</i>',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					remove: [ [ 'b', [ 0, 1 ] ], [ 'a', [ 0, 1 ] ], [ 'r', [ 0, 1 ] ] ],
					insert: [ [ 'b', [ 0 ] ], [ 'a', [ 0 ] ], [ 'r', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 7 }
			]
		},
		{
			msg: 'Extend bold in italic',
			oldRawHtml: '<p><i>foo <b>ba</b> baz</i></p>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">ba</b> baz</i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b> baz</i>',
			operations: [
				{ type: 'retain', length: 7 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'r', [ 0, 1 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 7 }
			]
		},
		{
			msg: 'Set bold in italic',
			oldRawHtml: '<p><i>foo bar baz</i></p>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo bar baz</i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b> baz</i>',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					remove: [ [ 'b', [ 0 ] ], [ 'a', [ 0 ] ], [ 'r', [ 0 ] ] ],
					insert: [ [ 'b', [ 0, 1 ] ], [ 'a', [ 0, 1 ] ], [ 'r', [ 0, 1 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 7 }
			]
		},
		{
			msg: 'Insert at start of bold in italic',
			oldRawHtml: '<i>wx<b>y</b></i>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b></i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">zy</b></i>',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'z', [ 0, 1 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Insert before start of bold in italic',
			oldRawHtml: '<i>wx<b>y</b></i>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b></i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">wxz<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">y</b></i>',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'z', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Insert into insertion annotation in italic',
			willFail: true,
			oldRawHtml: '<i>wx<b><img class="ve-ce-unicorn ve-ce-pre-unicorn"><img class="ve-ce-unicorn ve-ce-post-unicorn"></b>z</i>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation"><img class="ve-ce-unicorn ve-ce-pre-unicorn"><img class="ve-ce-unicorn ve-ce-post-unicorn"></b>z</i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">wx<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation"><img class="ve-ce-unicorn ve-ce-pre-unicorn">y<img class="ve-ce-unicorn ve-ce-post-unicorn"></b>z</i>',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'y', [ 0, 1 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 1
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Set bold underline before underline in italic',
			oldRawHtml: '<i>foo bar<u>baz</u></i>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo bar<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">baz</u></i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">foo <u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation"><b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bar</b>baz</u></i>',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					remove: [ [ 'b', [ 0 ] ], [ 'a', [ 0 ] ], [ 'r', [ 0 ] ] ],
					insert: [
						[ 'b', [ 0, 1, 2 ] ],
						[ 'a', [ 0, 1, 2 ] ],
						[ 'r', [ 0, 1, 2 ] ]
					],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 6 }
			]
		},
		{
			msg: 'Set bold with distant existing bold tag',
			oldRawHtml: '<b>foo</b> <i>bar</i> baz',
			oldInnerHtml: '<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">foo</b> <i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">bar</i> baz',
			newInnerHtml: '<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">foo</b> <i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">bar</i> <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">baz</b>',
			operations: [
				{ type: 'retain', length: 9 },
				{
					type: 'replace',
					remove: [ 'b', 'a', 'z' ],
					// TODO: Reuse bold 0 instead of creating a new bold 2?
					// (Some annotation types may need specific rules as to
					// when this can be done)
					insert: [ [ 'b', [ 2 ] ], [ 'a', [ 2 ] ], [ 'z', [ 2 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 3
				},
				{ type: 'retain', length: 3 }
			]
		},
		{
			msg: 'Set underline across bold close',
			oldRawHtml: '<i>a<b>bc</b>de</i>',
			oldInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">a<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">bc</b>de</i>',
			newInnerHtml: '<i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">a<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">b<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">c</u></b><u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">d</u>e</i>',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [ [ 'c', [ 0, 1 ] ], [ 'd', [ 0 ] ] ],
					insert: [ [ 'c', [ 0, 1, 2 ] ], [ 'd', [ 0, 2 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 2
				},
				{ type: 'retain', length: 4 }
			]
		},
		{
			msg: 'Set bold in one place and normal in another',
			oldRawHtml: '<b>foo</b> <i>bar</i> baz',
			oldInnerHtml: '<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">foo</b> <i class="ve-ce-textStyleAnnotation ve-ce-italicAnnotation">bar</i> baz',
			newInnerHtml: '<b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">foo</b> bar <b class="ve-ce-textStyleAnnotation ve-ce-boldAnnotation">baz</b>',
			operations: [
				{ type: 'retain', length: 5 },
				{
					type: 'replace',
					// This weird-looking removal is the correct output for
					// a diff algorithm that matches common start/end items
					// then replaces the entire interior. In real life usage
					// there won't usually be two separate changed regions.
					remove: [ [ 'b', [ 1 ] ], [ 'a', [ 1 ] ], [ 'r', [ 1 ] ], ' ', 'b', 'a', 'z' ],
					// The first insertion get
					insert: [ 'b', 'a', 'r', ' ', [ 'b', [ 0 ] ], [ 'a', [ 0 ] ], [ 'z', [ 0 ] ] ],
					insertedDataOffset: 0,
					insertedDataLength: 7
				},
				{ type: 'retain', length: 3 }
			]
		}
	];

	QUnit.expect( 2 * tests.length );

	for ( i = 0; i < tests.length; i++ ) {
		test = tests[ i ];
		view = ve.test.utils.createSurfaceViewFromHtml( test.oldRawHtml );
		documentView = view.getDocument();
		documentNode = documentView.getDocumentNode();
		( test.willFail ? assert.notDeepEqual : assert.deepEqual ).call(
			assert,
			documentNode.$element.find( ':first' ).html(),
			test.oldInnerHtml,
			test.msg + ' (oldInnerHtml)'
		);
		view.model.setSelection( new ve.dm.LinearSelection( documentView.model, new ve.Range( 1 ) ) );
		oldState = new ve.ce.RangeState( null, documentNode, false );
		documentNode.$element.find( ':first' ).html( test.newInnerHtml );
		view.model.setSelection( new ve.dm.LinearSelection( documentView.model, new ve.Range( 1 ) ) );
		newState = new ve.ce.RangeState( oldState, documentNode, false );
		change = newState.textState.getChangeTransaction(
			oldState.textState,
			view.model.getDocument(),
			newState.node.getOffset()
		);
		( test.willFail ? assert.notDeepEqual : assert.deepEqual ).call(
			assert,
			change.operations,
			test.operations,
			test.msg + ' (operations)'
		);
		view.destroy();
	}
} );
