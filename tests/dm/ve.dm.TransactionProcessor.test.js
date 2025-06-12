/*!
 * VisualEditor DataModel TransactionProcessor tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.TransactionProcessor' );

/* Tests */

QUnit.test( 'commit', ( assert ) => {
	const store = ve.dm.example.createExampleDocument().getStore(),
		cases = [
			{
				msg: 'no operations',
				calls: [],
				expected: () => {}
			},
			{
				msg: 'retaining',
				calls: [ [ 'pushRetain', 38 ] ],
				expected: () => {}
			},
			{
				msg: 'changing, removing and adding attributes',
				calls: [
					[ 'pushReplaceElementAttribute', 'level', 1, 2 ],
					[ 'pushRetain', 12 ],
					[ 'pushReplaceElementAttribute', 'style', 'bullet', 'number' ],
					[ 'pushReplaceElementAttribute', 'test', undefined, 'abcd' ],
					[ 'pushRetain', 27 ],
					[ 'pushReplaceElementAttribute', 'src', ve.dm.example.imgSrc, undefined ]
				],
				expected: ( data ) => {
					data[ 0 ].attributes.level = 2;
					data[ 12 ].attributes.style = 'number';
					data[ 12 ].attributes.test = 'abcd';
					delete data[ 39 ].attributes.src;
				}
			},
			{
				msg: 'changing attributes on non-element data throws an exception',
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplaceElementAttribute', 'foo', 23, 42 ]
				],
				exception: /Invalid element error, cannot set attributes on non-element data/
			},
			{
				msg: 'inserting text',
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 1, 0, [ ...'Foo' ] ]
				],
				expected: ( data ) => {
					data.splice( 1, 0, ...'Foo' );
				}
			},
			{
				msg: 'removing text',
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 1, 1, [] ]
				],
				expected: ( data ) => {
					data.splice( 1, 1 );
				}
			},
			{
				msg: 'replacing text',
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 1, 1, [ ...'Foo' ] ]
				],
				expected: ( data ) => {
					data.splice( 1, 1, ...'Foo' );
				}
			},
			{
				msg: 'emptying text',
				calls: [
					[ 'pushRetain', 10 ],
					[ 'pushReplacement', 10, 1, [] ]
				],
				expected: ( data ) => {
					data.splice( 10, 1 );
				}
			},
			{
				msg: 'inserting mixed content',
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 1, 1, [ ...'Foo', { type: 'inlineImage' }, { type: '/inlineImage' }, ...'Bar' ] ]
				],
				expected: ( data ) => {
					data.splice( 1, 1, ...'Foo', { type: 'inlineImage' }, { type: '/inlineImage' }, ...'Bar' );
				}
			},
			{
				msg: 'inserting unbalanced data',
				calls: [
					[ 'pushReplacement', 0, 0, [ { type: 'table' } ] ]
				],
				exception: /Unbalanced set of replace operations found/
			},
			{
				msg: 'inserting unclosed inline node',
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 1, 1, [ 'F', { type: 'inlineImage' }, ...'OO' ] ]
				],
				exception: /Unbalanced set of replace operations found/
			},
			{
				msg: 'inserting an inline node in a structure position',
				calls: [
					[ 'pushReplacement', 0, 0, [
						{ type: 'inlineImage' },
						{ type: '/inlineNode' }
					] ]
				],
				exception: /Cannot add content node \(inlineImage\) to a document node/
			},
			{
				msg: 'wrapping a heading in an inline node',
				calls: [
					[ 'pushRetain', 39 ],
					[ 'pushReplacement', 39, 0, [ { type: 'inlineImage' } ] ],
					[ 'pushRetain', 2 ],
					[ 'pushReplacement', 42, 0, [ { type: '/inlineImage' } ] ]
				],
				exception: /Cannot add a child to inlineImage node/
			},
			{
				msg: 'converting an element',
				calls: [
					[ 'pushReplacement', 0, 1, [ { type: 'paragraph' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 4, 1, [ { type: '/paragraph' } ] ]
				],
				expected: ( data ) => {
					data[ 0 ].type = 'paragraph';
					delete data[ 0 ].attributes;
					data[ 4 ].type = '/paragraph';
				}
			},
			{
				msg: 'conversion with wrong closing',
				calls: [
					[ 'pushReplacement', 0, 1, [ { type: 'paragraph' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 4, 1, [ { type: '/paragraph' }, { type: 'paragraph' } ] ]
				],
				exception: /Unbalanced set of replace operations found/
			},
			{
				msg: 'splitting an element',
				calls: [
					[ 'pushRetain', 2 ],
					[
						'pushReplacement', 2, 0,
						[ { type: '/heading' }, { type: 'heading', attributes: { level: 1 } } ]
					]
				],
				expected: ( data ) => {
					data.splice(
						2,
						0,
						{ type: '/heading' },
						{ type: 'heading', attributes: { level: 1 } }
					);
				}
			},
			{
				msg: 'merging an element',
				calls: [
					[ 'pushRetain', 57 ],
					[ 'pushReplacement', 57, 2, [] ]
				],
				expected: ( data ) => {
					data.splice( 57, 2 );
				}
			},
			{
				msg: 'stripping elements',
				calls: [
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 3, 1, [] ],
					[ 'pushRetain', 6 ],
					[ 'pushReplacement', 10, 1, [] ]
				],
				expected: ( data ) => {
					data.splice( 10, 1 );
					data.splice( 3, 1 );
				}
			},
			{
				msg: 'wrapping elements',
				calls: [
					[ 'pushRetain', 55 ],
					[ 'pushReplacement', 55, 0, [ { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 58, 0, [ { type: '/listItem' }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 61, 0, [ { type: '/listItem' }, { type: '/list' } ] ]
				],
				expected: ( data ) => {
					data.splice( 61, 0, { type: '/listItem' }, { type: '/list' } );
					data.splice( 58, 0, { type: '/listItem' }, { type: 'listItem' } );
					data.splice( 55, 0, { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } );
				}
			},
			{
				msg: 'unwrapping elements',
				calls: [
					[ 'pushRetain', 43 ],
					[ 'pushReplacement', 43, 2, [] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 48, 2, [] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 53, 2, [] ]
				],
				expected: ( data ) => {
					data.splice( 53, 2 );
					data.splice( 48, 2 );
					data.splice( 43, 2 );
				}
			},
			{
				msg: 'rewrapping elements',
				calls: [
					[ 'pushRetain', 43 ],
					[ 'pushReplacement', 43, 2, [ { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 48, 2, [ { type: '/listItem' }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 53, 2, [ { type: '/listItem' }, { type: '/list' } ] ]
				],
				expected: ( data ) => {
					data.splice( 53, 2, { type: '/listItem' }, { type: '/list' } );
					data.splice( 48, 2, { type: '/listItem' }, { type: 'listItem' } );
					data.splice( 43, 2, { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } );
				}
			},
			{
				msg: 'merging a nested element',
				calls: [
					[ 'pushRetain', 47 ],
					[ 'pushReplacement', 47, 4, [] ]
				],
				expected: ( data ) => {
					data.splice( 47, 4 );
				}
			},
			{
				msg: 'merging an element that also has a content insertion',
				calls: [
					[ 'pushRetain', 56 ],
					[ 'pushReplacement', 56, 0, [ 'x' ] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 57, 2, [] ]
				],
				expected: ( data ) => {
					data.splice( 57, 2 );
					data.splice( 56, 0, 'x' );
				}
			},
			{
				msg: 'merging a nested element that also has a structural insertion',
				calls: [
					[ 'pushRetain', 45 ],
					[ 'pushReplacement', 45, 0, [ { type: 'paragraph' }, 'x', { type: '/paragraph' } ] ],
					[ 'pushRetain', 2 ],
					[ 'pushReplacement', 47, 4, [] ]
				],
				expected: ( data ) => {
					data.splice( 47, 4 );
					data.splice( 45, 0, { type: 'paragraph' }, 'x', { type: '/paragraph' } );
				}
			},
			{
				msg: 'merging the same element from both sides at once',
				data: [
					{ type: 'paragraph' },
					'a',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					'b',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					'c',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					'd',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushRetain', 2 ],
					[ 'pushReplacement', 2, 2, [] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 5, 2, [] ]
				],
				expected: ( data ) => {
					data.splice( 5, 2 );
					data.splice( 2, 2 );
				}
			},
			{
				msg: 'deleting images on both sides of a text node at once',
				data: [
					{ type: 'paragraph' },
					'a',
					{ type: 'inlineImage' },
					{ type: '/inlineImage' },
					'b',
					{ type: 'inlineImage' },
					{ type: '/inlineImage' },
					'c',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushRetain', 2 ],
					[ 'pushReplacement', 2, 2, [] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplacement', 5, 2, [] ]
				],
				expected: ( data ) => {
					data.splice( 5, 2 );
					data.splice( 2, 2 );
				}
			},
			{
				msg: 'unwrap inside of a split inside of a wrap',
				data: [
					{ type: 'list', attributes: { style: 'bullet' } },
					{ type: 'listItem' },
					{ type: 'div' },
					{ type: 'paragraph' },
					'a',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					'b',
					{ type: '/paragraph' },
					{ type: 'paragraph' },
					'c',
					{ type: '/paragraph' },
					{ type: '/div' },
					{ type: '/listItem' },
					{ type: '/list' },
					{ type: 'paragraph' },
					'd',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplacement', 0, 0, [ { type: 'div' } ] ],
					[ 'pushRetain', 6 ],
					[ 'pushReplacement', 6, 0, [ { type: '/div' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplacement', 9, 0, [ { type: 'div' } ] ],
					[ 'pushRetain', 6 ],
					[ 'pushReplacement', 15, 0, [ { type: '/div' } ] ]
				],
				expected: ( data ) => {
					data.splice( 15, 0, { type: '/div' } );
					data.splice( 9, 0, { type: 'div' } );
					data.splice( 6, 0, { type: '/div' } );
					data.splice( 0, 0, { type: 'div' } );
				}
			},
			{
				msg: 'inserting text after alien node at the end',
				data: [
					{ type: 'paragraph' },
					'a',
					{ type: 'alienInline' },
					{ type: '/alienInline' },
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushRetain', 4 ],
					[ 'pushReplacement', 4, 0, [ 'b' ] ]
				],
				expected: ( data ) => {
					data.splice( 4, 0, 'b' );
				}
			},
			{
				msg: 'structural replacement starting at an offset without metadata',
				data: [
					{ type: 'paragraph' },
					'F',
					{ type: '/paragraph' },
					{
						type: 'alienMeta',
						originalDomElements: $.parseHTML( '<!-- foo -->' )
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					...'oo',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplacement', 0, 9, [ { type: 'table' }, { type: '/table' } ] ]
				],
				expected: ( data ) => {
					data.splice( 0, 3 );
					data.splice( 2, 4, { type: 'table' }, { type: '/table' } );
				}
			},
			{
				msg: 'structural replacement starting at an offset with metadata',
				data: [
					{
						type: 'alienMeta',
						originalDomElements: $.parseHTML( '<!-- foo -->' )
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					'F',
					{
						type: 'alienMeta',
						attributes: {
							style: 'comment',
							text: ' inline '
						}
					},
					{ type: '/alienMeta' },
					...'oo',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplacement', 0, 9, [ { type: 'table' }, { type: '/table' } ] ]
				],
				expected: ( data ) => {
					// Metadata  is merged
					data.splice( 2, 2 );
					data.splice( 4, 3, { type: 'table' }, { type: '/table' } );
				}
			},
			{
				msg: 'structural replacement ending at an offset with metadata',
				data: [
					{
						type: 'alienMeta',
						originalDomElements: $.parseHTML( '<!-- foo -->' )
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					'F',
					{
						type: 'alienMeta',
						attributes: {
							style: 'comment',
							text: ' inline '
						}
					},
					{ type: '/alienMeta' },
					...'oo',
					{ type: '/paragraph' },
					{
						type: 'alienMeta',
						originalDomElements: $.parseHTML( '<!-- bar -->' )
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplacement', 0, 9, [ { type: 'table' }, { type: '/table' } ] ],
					[ 'pushRetain', 5 ]
				],
				expected: ( data ) => {
					// Metadata  is merged
					data.splice( 2, 2 );
					data.splice( 4, 3, { type: 'table' }, { type: '/table' } );
				}
			},
			{
				msg: 'structural deletion ending at an offset with metadata',
				data: [
					{
						type: 'alienMeta',
						originalDomElements: $.parseHTML( '<!-- foo -->' )
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					'F',
					{
						type: 'alienMeta',
						attributes: {
							style: 'comment',
							text: ' inline '
						}
					},
					{ type: '/alienMeta' },
					...'oo',
					{ type: '/paragraph' },
					{
						type: 'alienMeta',
						originalDomElements: $.parseHTML( '<!-- bar -->' )
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					...'Bar',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplacement', 0, 11, [] ],
					[ 'pushRetain', 5 ]
				],
				expected: ( data ) => {
					// Metadata  is merged
					data.splice( 2, 2 );
					data.splice( 4, 3 );
				}
			},
			{
				msg: 'preserves surrounding metadata on unwrap',
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromWrap', new ve.Range( 5, 33 ),
						[ { type: 'list' } ], [],
						[ { type: 'listItem', attributes: { styles: [ 'bullet' ] } } ], []
					]
				],
				expected: ( data ) => {
					data.splice( 35, 1 ); // Remove '/list'
					data.splice( 32, 1 ); // Remove '/listItem'
					data.splice( 20, 1 ); // Remove 'listItem'
					data.splice( 17, 1 ); // Remove '/listItem'
					data.splice( 5, 1 ); // Remove 'listItem'
					data.splice( 2, 1 ); // Remove 'list'
				}
			},
			{
				msg: 'preserves interleaved metadata on unwrap',
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromWrap', new ve.Range( 5, 35 ),
						[ { type: 'list' } ], [],
						[ { type: 'listItem', attributes: { styles: [ 'bullet' ] } } ], []
					]
				],
				expected: ( data ) => {
					data.splice( 35, 1 ); // Remove '/list'
					data.splice( 32, 1 ); // Remove '/listItem'
					data.splice( 20, 1 ); // Remove 'listItem'
					data.splice( 17, 1 ); // Remove '/listItem'
					data.splice( 5, 1 ); // Remove 'listItem'
					data.splice( 2, 1 ); // Remove 'list'
				}
			},
			{
				msg: 'preserves trailing metadata',
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromInsertion', 12, [ 'b' ] ]
				],
				expected: ( data ) => {
					ve.batchSplice( data, 12, 0, [ 'b' ] );
				}
			}
		];

	// Run tests
	cases.forEach( ( caseItem ) => {
		// Generate original document
		const originalData = caseItem.data || ve.dm.example.data;
		const originalDoc = new ve.dm.Document(
			ve.dm.example.preprocessAnnotations( ve.copy( originalData ), store )
		);
		originalDoc.buildNodeTree();
		const testDoc = new ve.dm.Document(
			ve.dm.example.preprocessAnnotations( ve.copy( originalData ), store )
		);
		testDoc.buildNodeTree();

		const txBuilder = new ve.dm.TransactionBuilder();
		let tx = null;
		for ( let i = 0; i < caseItem.calls.length; i++ ) {
			// Some calls need the document as its first argument
			if ( /^(pushReplacement$|new)/.test( caseItem.calls[ i ][ 0 ] ) ) {
				caseItem.calls[ i ].splice( 1, 0, testDoc );
			}
			// Special case static methods of TransactionBuilder
			if ( /^new/.test( caseItem.calls[ i ][ 0 ] ) ) {
				tx = ve.dm.TransactionBuilder.static[ caseItem.calls[ i ][ 0 ] ]( ...caseItem.calls[ i ].slice( 1 ) );
				break;
			}
			txBuilder[ caseItem.calls[ i ][ 0 ] ]( ...caseItem.calls[ i ].slice( 1 ) );
		}
		if ( tx === null ) {
			tx = txBuilder.getTransaction();
		}

		if ( 'expected' in caseItem ) {
			// Generate expected document
			const expectedData = ve.copy( originalData );
			caseItem.expected( expectedData );
			const expectedDoc = new ve.dm.Document(
				ve.dm.example.preprocessAnnotations( expectedData, store )
			);
			expectedDoc.buildNodeTree();

			// Commit
			testDoc.commit( tx );
			assert.isLinearDataFrozen( testDoc.data, caseItem.msg + ': linear data is frozen' );
			assert.equalLinearDataWithDom( testDoc.getStore(), testDoc.getFullData(), expectedDoc.getFullData(), 'commit (data): ' + caseItem.msg );
			assert.equalNodeTree(
				testDoc.getDocumentNode(),
				expectedDoc.getDocumentNode(),
				'commit (tree): ' + caseItem.msg
			);
			if ( 'events' in caseItem ) {
				caseItem.events.forEach( ( event ) => {
					assert.strictEqual(
						event.fired,
						1,
						'event ' + event[ 0 ] + ' on ' +
							event.slice( 1 ).join( ',' ) + ': ' + caseItem.msg
					);
				} );
			}
			// Rollback
			testDoc.commit( tx.reversed() );
			assert.equalLinearDataWithDom( testDoc.getStore(), testDoc.getFullData(), originalDoc.getFullData(), 'rollback (data): ' + caseItem.msg );
			assert.equalNodeTree(
				testDoc.getDocumentNode(),
				originalDoc.getDocumentNode(),
				'rollback (tree): ' + caseItem.msg
			);
		} else if ( 'exception' in caseItem ) {
			assert.throws(
				() => {
					testDoc.commit( tx );
				},
				caseItem.exception,
				'exception thrown: ' + caseItem.msg
			);
			assert.equalLinearDataWithDom( testDoc.getStore(), testDoc.getFullData(), originalDoc.getFullData(), 'data unmodified: ' + caseItem.msg );
			assert.equalNodeTree(
				testDoc.getDocumentNode(),
				originalDoc.getDocumentNode(),
				'tree unmodified: ' + caseItem.msg
			);
		}
	} );
} );

// TODO: Fix the code so undoing unbold roundtrips properly, then fix this test to reflect that
QUnit.test( 'undo clear annotation', ( assert ) => {
	const origData = [
		{ type: 'paragraph' },
		[ 'x', [ ve.dm.example.boldHash, ve.dm.example.italicHash ] ],
		{ type: '/paragraph' }
	];
	const doc = ve.dm.example.createExampleDocumentFromData( origData );
	doc.store.hash( ve.dm.example.italic );
	doc.store.hash( ve.dm.example.bold );
	const tx = ve.dm.TransactionBuilder.static.newFromAnnotation(
		doc,
		new ve.Range( 1, 2 ),
		'clear',
		ve.dm.example.bold
	);
	doc.commit( tx );
	doc.commit( tx.reversed() );
	assert.deepEqual( doc.data.data, origData, 'Roundtrip difference undoing unbold under italic' );
} );
