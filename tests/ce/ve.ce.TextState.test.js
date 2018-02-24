/*!
 * VisualEditor ContentEditable TextState tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.TextState' );

/* Tests */

QUnit.test( 'getChangeTransaction', function ( assert ) {
	var i, view, documentView, documentNode, test, oldState, newState, change, tests,
		underlineIndex = ve.dm.example.underlineIndex,
		boldIndex = ve.dm.example.boldIndex,
		annIndex = ve.dm.example.annIndex;

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
					remove: [ [ 'b', [ annIndex( 'b' ) ] ], [ 'a', [ annIndex( 'b' ) ] ], [ 'r', [ annIndex( 'b' ) ] ] ],
					insert: [ 'b', 'a', 'r' ]
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
					insert: [ [ 'r', [ annIndex( 'b' ) ] ] ]
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
					insert: [ [ 'b', [ boldIndex ] ], [ 'a', [ boldIndex ] ], [ 'r', [ boldIndex ] ] ]
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
					insert: [ [ 'z', [ annIndex( 'b' ) ] ] ]
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
					insert: [ 'z' ]
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
					insert: [ [ 'y', [ 'anything' ] ] ]
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
						[ 'b', [ annIndex( 'u' ), boldIndex ] ],
						[ 'a', [ annIndex( 'u' ), boldIndex ] ],
						[ 'r', [ annIndex( 'u' ), boldIndex ] ]
					]
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
					remove: [
						[ 'b', [ annIndex( 'i' ), annIndex( 'b' ) ] ],
						[ 'a', [ annIndex( 'i' ), annIndex( 'b' ) ] ],
						[ 'r', [ annIndex( 'i' ), annIndex( 'b' ) ] ]
					],
					insert: [
						[ 'b', [ annIndex( 'i' ) ] ],
						[ 'a', [ annIndex( 'i' ) ] ],
						[ 'r', [ annIndex( 'i' ) ] ]
					]
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
					insert: [ [ 'r', [ annIndex( 'i' ), annIndex( 'b' ) ] ] ]
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
					remove: [
						[ 'b', [ annIndex( 'i' ) ] ],
						[ 'a', [ annIndex( 'i' ) ] ],
						[ 'r', [ annIndex( 'i' ) ] ]
					],
					insert: [
						[ 'b', [ annIndex( 'i' ), boldIndex ] ],
						[ 'a', [ annIndex( 'i' ), boldIndex ] ],
						[ 'r', [ annIndex( 'i' ), boldIndex ] ]
					]
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
					insert: [ [ 'z', [ annIndex( 'i' ), annIndex( 'b' ) ] ] ]
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
					insert: [ [ 'z', [ annIndex( 'i' ) ] ] ]
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
					insert: [ [ 'y', [ 'anything1', 'anything2' ] ] ]
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
					remove: [
						[ 'b', [ annIndex( 'i' ) ] ],
						[ 'a', [ annIndex( 'i' ) ] ],
						[ 'r', [ annIndex( 'i' ) ] ]
					],
					insert: [
						[ 'b', [ annIndex( 'i' ), annIndex( 'u' ), boldIndex ] ],
						[ 'a', [ annIndex( 'i' ), annIndex( 'u' ), boldIndex ] ],
						[ 'r', [ annIndex( 'i' ), annIndex( 'u' ), boldIndex ] ]
					]
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
					// TODO: Reuse bold instead of creating a new bold?
					// (Some annotation types may need specific rules as to
					// when this can be done)
					insert: [ [ 'b', [ boldIndex ] ], [ 'a', [ boldIndex ] ], [ 'z', [ boldIndex ] ] ]
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
					remove: [
						[ 'c', [ annIndex( 'i' ), annIndex( 'b' ) ] ],
						[ 'd', [ annIndex( 'i' ) ] ]
					],
					insert: [
						[ 'c', [ annIndex( 'i' ), annIndex( 'b' ), underlineIndex ] ],
						[ 'd', [ annIndex( 'i' ), underlineIndex ] ]
					]
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
					remove: [
						[ 'b', [ annIndex( 'i' ) ] ],
						[ 'a', [ annIndex( 'i' ) ] ],
						[ 'r', [ annIndex( 'i' ) ] ],
						' ', 'b', 'a', 'z'
					],
					// The first insertion get
					insert: [
						'b', 'a', 'r', ' ',
						[ 'b', [ annIndex( 'b' ) ] ],
						[ 'a', [ annIndex( 'b' ) ] ],
						[ 'z', [ annIndex( 'b' ) ] ]
					]
				},
				{ type: 'retain', length: 3 }
			]
		},
		{
			msg: 'Insert new chunk whose annotations match end chunk\'s',
			oldRawHtml: '<u>x</u>yz',
			oldInnerHtml: '<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">x</u>yz',
			newInnerHtml: '<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">x</u>y<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">w</u>yz',
			operations: [
				{ type: 'retain', length: 2 },
				{
					type: 'replace',
					remove: [],
					insert: [ 'y', [ 'w', [ annIndex( 'u' ) ] ] ]
				},
				{ type: 'retain', length: 5 }
			]
		},
		{
			msg: 'Ambiguous insert with start and end both identical to original',
			oldRawHtml: 'ab',
			oldInnerHtml: 'ab',
			newInnerHtml: 'ab<u class="ve-ce-textStyleAnnotation ve-ce-underlineAnnotation">x</u>ab',
			operations: [
				{ type: 'retain', length: 3 },
				{
					type: 'replace',
					remove: [],
					insert: [ [ 'x', [ underlineIndex ] ], 'a', 'b' ]
				},
				{ type: 'retain', length: 3 }
			]
		}
	];

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
