/*!
 * VisualEditor DataModel TreeModifier tests.
 *
 * @copyright See AUTHORS.txt
 */

ve.dm.TreeModifier.prototype.dump = function () {
	const lines = [],
		del = this.deletions,
		ins = this.insertions;
	function nodeTag( idx, node ) {
		return ( idx === undefined ? '' : idx + ' ' ) + (
			del.includes( node ) ? 'DEL ' :
				ins.includes( node ) ? 'INS ' :
					''
		);
	}
	function appendNodeLines( indent, node, idx ) {
		const sp = '-\t'.repeat( indent );
		if ( node.type === 'text' ) {
			lines.push( sp + nodeTag( idx, node ) + 'VeDmTextNode(' + node.getOuterLength() + ')' );
			return;
		}
		lines.push( sp + nodeTag( idx, node ) + node.constructor.name + '(' +
			node.getOuterLength() + ')' );
		if ( node.hasChildren() ) {
			node.children.forEach( ( child, i ) => {
				appendNodeLines( indent + 1, child, i );
			} );
		}
	}
	appendNodeLines( 0, this.document.documentNode );
	lines.push( 'inserter: { path: [ ' + this.inserter.path.join( ', ' ) +
			' ], offset: ' + this.inserter.offset + ' }, ' +
			'linear ' + this.inserter.linearOffset +
			', insertions: ' + JSON.stringify( this.insertedPositions ) );
	lines.push( 'remover:  { path: [ ' + this.remover.path.join( ', ' ) +
			' ], offset: ' + this.remover.offset + ' }, ' +
			'linear ' + this.remover.linearOffset );
	lines.push( 'insertedPositions: ' + JSON.stringify( this.insertedPositions ) );
	lines.push( 'insertedNodes: ' + JSON.stringify( this.insertedNodes ) );
	lines.push( 'adjustments: ' + JSON.stringify( this.adjustmentTree ) );
	lines.push( 'adjusted inserter: ' + JSON.stringify( this.adjustInserterPosition( this.getRawInserterPosition() ) ) );
	lines.push( 'adjusted remover: ' + JSON.stringify( this.adjustRemoverPosition( this.getRawRemoverPosition( {
		path: this.remover.path,
		offset: this.remover.offset,
		node: this.remover.node
	} ) ) ) );
	ve.batchSplice( lines, lines.length, 0, this.data.data.map( ( item, i ) => i + ':' + JSON.stringify( item ) + ',' ) );
	return lines.join( '\n' );
};

ve.test.utils.nodesByTypeSummary = function ( doc ) {
	const nodesByType = ve.copy( doc.nodesByType );
	for ( const type in nodesByType ) {
		nodesByType[ type ] = nodesByType[ type ].length;
	}
	return nodesByType;
};

QUnit.module( 've.dm.TreeModifier' );

QUnit.test( 'treeDiff', ( assert ) => {
	// old: <div><p>foobarbaz</p><p>qux</p></div><p>quux</p>
	// new: <ul><li><p>foo</p><p>barBAZ</p><p>qux</p></li></ul><p>qUUx</p><p><img src='x'></p>
	// tx: {-<div>-|+<ul><li>+}<p>foo{+</p><p>+}bar{-baz-|+BAZ+}</p><p>qux</p>{-</div>-|+</li></ul>+}<p>q{-uu-|+UU+}x</p>{+<p><img src='x'></p>+}
	const origData = [
		{ type: 'div' },
		{ type: 'paragraph' },
		...'foobarbaz',
		{ type: '/paragraph' },
		{ type: 'paragraph' },
		...'qux',
		{ type: '/paragraph' },
		{ type: '/div' },
		{ type: 'paragraph' },
		...'quux',
		{ type: '/paragraph' }
	];
	const tx = new ve.dm.Transaction( [
		{ type: 'replace', remove: [ { type: 'div' } ], insert: [ { type: 'list' }, { type: 'listItem' } ] },
		{ type: 'retain', length: 4 },
		{ type: 'replace', remove: [], insert: [ { type: '/paragraph' }, { type: 'paragraph' } ] },
		{ type: 'retain', length: 3 },
		{ type: 'replace', remove: [ ...'baz' ], insert: [ ...'baz' ] },
		{ type: 'retain', length: 6 },
		{ type: 'replace', remove: [ { type: '/div' } ], insert: [ { type: '/listItem' }, { type: '/list' } ] },
		{ type: 'retain', length: 2 },
		{ type: 'replace', remove: [ ...'uu' ], insert: [ ...'UU' ] },
		{ type: 'retain', length: 2 },
		{ type: 'replace', remove: [], insert: [
			{ type: 'paragraph' },
			{ type: 'inlineImage', attributes: { src: 'x' } },
			{ type: '/inlineImage' },
			{ type: '/paragraph' }
		] }
	] );

	const treeDiff = [
		// {-<div>-|+<ul><li>+}
		[
			{ type: 'insertNode', isContent: false, at: [ 0 ], element: { type: 'list' } },
			// { 0: { diff: 1 } }
			{ type: 'insertNode', isContent: false, at: [ 0, 0 ], element: { type: 'listItem' } }
		],
		// Retain 4
		[
			{ type: 'insertNode', isContent: false, at: [ 0, 0, 0 ], element: { type: 'paragraph' } },
			{ type: 'moveText', isContent: true, from: [ 1, 0, 0 ], to: [ 0, 0, 0, 0 ], length: 3 }
			// { 0: { diff: 1 }, 1: { 0: { 0: { diff: -3 } } } }
		],
		// {+</p><p>+}
		[
			{ type: 'insertNode', isContent: false, at: [ 0, 0, 1 ], element: { type: 'paragraph' } }
		],
		// Retain 3
		[
			{ type: 'moveText', isContent: true, from: [ 1, 0, 0 ], length: 3, to: [ 0, 0, 1, 0 ] }
			// { 0: { diff: 1 }, 1: { 0: { 0: { diff: -6 } } } }
		],
		// {-baz-|+BAZ+}
		[
			{ type: 'removeText', isContent: true, at: [ 1, 0, 0 ], data: [ ...'baz' ] },
			// { 0: { diff: 1 }, 1: { 0: { 0: { diff: -9 } } } }
			{ type: 'insertText', isContent: true, at: [ 0, 0, 1, 3 ], data: [ ...'baz' ] }
		],
		// Retain 6
		[
			{ type: 'removeNode', isContent: false, at: [ 1, 0 ], element: { type: 'paragraph' } },
			// { 0: { diff: 1 }, 1: { 0: { diff: -1 } } }
			{ type: 'moveNode', isContent: false, from: [ 1, 0 ], to: [ 0, 0, 2 ] }
			// { 0: { diff: 1 }, 1: { 0: { diff: -2 } } }
		],
		// {-</div>-|+</li></ul>+}
		[
			{ type: 'removeNode', isContent: false, at: [ 1 ], element: { type: 'div' } }
			// { 0: { diff: 1 }, 1: { diff: -1 } }
		],
		// Retain 2
		[],
		// {-uu-|+UU+}
		[
			{ type: 'removeText', isContent: true, at: [ 1, 1 ], data: [ ...'uu' ] },
			// NOT THIS: { 0: { diff: 1 }, 1: { diff: -1 }, 2: { 1: { diff: -2 } } }
			// { 0: { diff: 1 }, 1: { 1: { diff: -2 }, diff: -1 } }
			{ type: 'insertText', isContent: true, at: [ 1, 1 ], data: [ ...'UU' ] }
			// { 0: { diff: 1 }, 1: { diff: -1 }, 2: { 1: { diff: 0 } } }
		],
		// Retain 2
		[],
		// {+<p><img src='x'></p>+}
		[
			{ type: 'insertNode', isContent: false, at: [ 2 ], element: { type: 'paragraph' } },
			{ type: 'insertNode', isContent: true, at: [ 2, 0 ], element: { type: 'inlineImage', attributes: { src: 'x' } } }
		],
		// Implicit final retain
		[]
	];
	const surface = new ve.dm.Surface(
		ve.dm.example.createExampleDocumentFromData( origData )
	);
	const doc = surface.documentModel;
	ve.dm.treeModifier.setup( doc );
	let j = 0;
	for ( let i = 0, iLen = tx.operations.length; i < iLen; i++ ) {
		ve.dm.treeModifier.processLinearOperation( tx.operations[ i ] );
		assert.deepEqual(
			ve.dm.treeModifier.treeOps.slice( j ),
			treeDiff[ i ],
			'Linear operation ' + i + ': induced tree operations'
		);
		j = ve.dm.treeModifier.treeOps.length;
	}
	ve.dm.treeModifier.processImplicitFinalRetain();
	assert.deepEqual(
		ve.dm.treeModifier.treeOps.slice( j ),
		treeDiff[ treeDiff.length - 1 ],
		'Implicit final retain: induced tree operations'
	);
} );

QUnit.test( 'modify', ( assert ) => {
	function dumpTree( d ) {
		// Build a tree modifier just for the .dump method (don't modify anything)
		const treeModifier = new ve.dm.TreeModifier();
		treeModifier.setup( d );
		return treeModifier.dump();
	}

	const origData = [
		{ type: 'paragraph' },
		...'abcd',
		{ type: '/paragraph' },
		{ type: 'paragraph' },
		...'efg',
		{ type: '/paragraph' },
		{ type: 'paragraph' },
		...'hij',
		{ type: '/paragraph' },
		{ type: 'internalList' },
		{ type: '/internalList' }
	];
	const surface = new ve.dm.Surface(
		ve.dm.example.createExampleDocumentFromData( origData )
	);
	const doc = surface.documentModel;

	const tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 2 },
		{
			type: 'replace',
			remove: [ 'b' ],
			insert: [ ...'xy' ],
			insertedDataOffset: 0,
			insertedDataLength: 2
		},
		{ type: 'retain', length: 2 },
		{
			type: 'replace',
			remove: [ { type: '/paragraph' }, { type: 'paragraph' }, 'e' ],
			insert: [ 'Z' ],
			insertedDataOffset: 0,
			insertedDataLength: 0
		},
		{ type: 'retain', length: 4 },
		{
			type: 'replace',
			remove: [ 'h' ],
			insert: [
				{ type: 'inlineImage' },
				{ type: '/inlineImage' }
			],
			insertedDataOffset: 0,
			insertedDataLength: 2
		},
		{ type: 'retain', length: 3 }
	] );
	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			internalList: 1,
			paragraph: 3,
			text: 3
		},
		'Nodes by type before'
	);

	doc.commit( tx );
	let actualTreeDump = dumpTree( doc );
	doc.rebuildTree();
	let expectedTreeDump = dumpTree( doc );
	assert.strictEqual(
		actualTreeDump,
		expectedTreeDump,
		'Modified tree matches rebuilt tree, forward'
	);

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			inlineImage: 1,
			internalList: 1,
			paragraph: 2,
			text: 2
		},
		'Nodes by type after transaction'
	);

	doc.commit( tx.reversed() );
	actualTreeDump = dumpTree( doc );
	doc.rebuildTree();
	expectedTreeDump = dumpTree( doc );
	assert.strictEqual(
		actualTreeDump,
		expectedTreeDump,
		'Modified tree matches rebuilt tree, reversed'
	);
	assert.notStrictEqual(
		tx.operations[ 3 ].remove[ 1 ],
		doc.data.data[ 6 ],
		'Inserted transaction data is not referenced into the linear data'
	);

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			internalList: 1,
			paragraph: 3,
			text: 3
		},
		'Nodes by type after undo'
	);
} );

QUnit.test( 'bare content', ( assert ) => {
	const data = [ { type: 'paragraph' }, ...'Foo', { type: '/paragraph' } ];
	const doc = ve.dm.example.createExampleDocumentFromData( data );
	const tx = new ve.dm.Transaction( [
		{ type: 'replace', remove: [ { type: 'paragraph' } ], insert: [] },
		{ type: 'retain', length: 3 },
		{ type: 'replace', remove: [ { type: '/paragraph' } ], insert: [] }
	] );
	assert.throws( () => {
		doc.commit( tx );
	}, /Error: Cannot insert text into a document node/, 'bare content' );
} );

QUnit.test( 'unbalanced insertion', ( assert ) => {
	const data = [ { type: 'div' }, { type: '/div' } ];
	const doc = ve.dm.example.createExampleDocumentFromData( data );
	const tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 1 },
		{ type: 'replace', remove: [], insert: [ { type: 'paragraph' }, { type: '/heading' } ] },
		{ type: 'retain', length: 1 }
	] );
	assert.throws( () => {
		doc.commit( tx );
	}, /Expected closing for paragraph but got closing for heading/, 'unbalanced insertion' );
} );

QUnit.test( 'retain and merge inline node', ( assert ) => {
	const data = [
		{ type: 'paragraph' }, ...'Foo', { type: '/paragraph' },
		{ type: 'paragraph' }, ...'Bar', { type: 'comment' }, { type: '/comment' }, ...'Baz', { type: '/paragraph' }
	];
	const doc = ve.dm.example.createExampleDocumentFromData( data );
	const tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 3 },
		{ type: 'replace', remove: [ 'o', { type: '/paragraph' }, { type: 'paragraph' }, 'B' ], insert: [] },
		{ type: 'retain', length: 8 }
	] );
	doc.commit( tx );
	assert.equalLinearData(
		doc.getFullData(),
		[ { type: 'paragraph' }, ...'Foar', { type: 'comment' }, { type: '/comment' }, ...'Baz', { type: '/paragraph' } ]
	);
} );

QUnit.test( 'applyTreeOperation: ensureNotText', ( assert ) => {
	const data = [
		{ type: 'paragraph' },
		...'fo',
		{ type: 'inlineImage' },
		{ type: '/inlineImage' },
		'o',
		{ type: '/paragraph' }
	];
	const expectData = ve.copy( data );
	expectData[ 3 ].annotations = [ ve.dm.example.boldHash ];
	const doc = ve.dm.example.createExampleDocumentFromData( data );
	const tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 3 },
		{
			type: 'replace',
			remove: [
				{ type: 'inlineImage' },
				{ type: '/inlineImage' }
			],
			insert: [
				{ type: 'inlineImage', annotations: [ ve.dm.example.boldHash ] },
				{ type: '/inlineImage' }
			]
		},
		{ type: 'retain', length: 2 }
	] );
	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			inlineImage: 1,
			paragraph: 1,
			text: 2
		},
		'Nodes by type before'
	);
	doc.commit( tx );
	assert.deepEqual( doc.data.data, expectData, 'Bold inline element surrounded by text' );
	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			inlineImage: 1,
			paragraph: 1,
			text: 2
		},
		'Nodes by type after'
	);
} );

QUnit.test( 'setupBlockSlugs', ( assert ) => {
	const doc = new ve.dm.Surface(
		ve.dm.example.createExampleDocumentFromData( [] )
	).documentModel;

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1
		},
		'Nodes by type before'
	);
	doc.commit( new ve.dm.Transaction( [ {
		type: 'replace',
		remove: [],
		insert: [ { type: 'paragraph' }, { type: '/paragraph' } ],
		insertedDataOffset: 0,
		insertedDataLength: 2
	} ] ) );

	assert.deepEqual(
		doc.getDocumentNode().getChildren()[ 0 ].slugPositions,
		{ 0: true },
		'Modified paragraph node contains a slug'
	);

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			paragraph: 1
		},
		'Nodes by type before'
	);
} );

QUnit.test( 'checkEqualData', ( assert ) => {
	const data = [
		{
			type: 'paragraph',
			originalDomElementsHash: 'h1111111111111111',
			internal: { changesSinceLoad: 1 }
		},
		...'foo',
		{
			type: 'mwReference',
			attributes: {
				mw: {
					name: 'ref',
					attrs: {},
					body: { id: 'mw-reference-text-cite_note-1' }
				},
				listIndex: 0,
				listGroup: 'mwReference/',
				listKey: 'auto/0',
				refGroup: '',
				contentsUsed: true,
				refListItemId: 'mw-reference-text-cite_note-1'
			}
		},
		{ type: '/mwReference' },
		{ type: '/paragraph' }
	];
	const expectedData = ve.copy( data );
	expectedData[ 0 ].originalDomElementsHash = 'h2222222222222222';
	expectedData[ 0 ].internal.changesSinceLoad = 2;
	delete expectedData[ 4 ].attributes.mw;
	delete expectedData[ 4 ].attributes.contentsUsed;
	ve.dm.TreeModifier.static.checkEqualData( data, expectedData );
	assert.true( true, 'Normalized data compares equal' );
} );

QUnit.test( 'TreeCursor#crossIgnoredNodes', ( assert ) => {
	const data = [
		{ type: 'paragraph' },
		...'foo',
		{ type: 'comment', attributes: { text: 'de' } },
		{ type: '/comment' },
		{ type: '/paragraph' }
	];
	const doc = ve.dm.example.createExampleDocumentFromData( data );
	const tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 3 },
		{ type: 'replace', remove: [
			'o',
			{ type: 'comment', attributes: { text: 'de' } },
			{ type: '/comment' }
		], insert: [] },
		{ type: 'retain', length: 1 }
	] );

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			comment: 1,
			document: 1,
			paragraph: 1,
			text: 1
		},
		'Nodes by type before'
	);

	doc.commit( tx );
	assert.deepEqual(
		doc.data.data,
		[
			...data.slice( 0, 3 ),
			...data.slice( 6 )
		],
		'Can remove an inline node after a text node'
	);

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			paragraph: 1,
			text: 1
		},
		'Nodes by type after'
	);
} );

QUnit.test( 'TreeCursor#normalizeCursor', ( assert ) => {
	const data = [
		{ type: 'heading', attributes: { level: 1 } },
		...'ab',
		{ type: 'comment', attributes: { text: 'foo' } },
		{ type: '/comment' },
		'd',
		{ type: '/heading' },
		{ type: 'paragraph' },
		...'ef',
		{ type: '/paragraph' }
	];
	const doc = ve.dm.example.createExampleDocumentFromData( data );
	const tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 2 },
		{ type: 'replace', remove: [
			'b',
			{ type: 'comment', attributes: { text: 'foo' } },
			{ type: '/comment' },
			'd'
		], insert: [] },
		{ type: 'retain', length: 2 },
		{ type: 'replace', remove: [ 'e' ], insert: [] },
		{ type: 'retain', length: 1 }
	] );

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			comment: 1,
			document: 1,
			heading: 1,
			paragraph: 1,
			text: 3
		},
		'Nodes by type before'
	);

	doc.commit( tx );
	assert.deepEqual(
		doc.data.data,
		[
			...data.slice( 0, 2 ),
			...data.slice( 6, 8 ),
			...data.slice( 9 )
		],
		'Ignore removed nodes properly when normalizing from a text node'
	);

	assert.deepEqual(
		ve.test.utils.nodesByTypeSummary( doc ),
		{
			document: 1,
			heading: 1,
			paragraph: 1,
			text: 2
		},
		'Nodes by type after'
	);
} );
