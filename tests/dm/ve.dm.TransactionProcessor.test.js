/*!
 * VisualEditor DataModel TransactionProcessor tests.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.TransactionProcessor' );

/* Tests */

QUnit.test( 'commit', function ( assert ) {
	var i, j, originalData, originalDoc, node,
		msg, testDoc, txBuilder, tx, expectedData, expectedDoc,
		store = ve.dm.example.createExampleDocument().getStore(),
		bold = ve.dm.example.createAnnotation( ve.dm.example.bold ),
		italic = ve.dm.example.createAnnotation( ve.dm.example.italic ),
		underline = ve.dm.example.createAnnotation( ve.dm.example.underline ),
		link = ve.dm.example.createAnnotation( ve.dm.example.link( 'x' ) ),
		metaElementInsert = {
			type: 'alienMeta',
			attributes: {
				style: 'comment',
				text: ' inline '
			}
		},
		metaElementInsertClose = { type: '/alienMeta' },
		metadataExample = [
			{ type: 'paragraph' },
			'a', 'b',
			{
				type: 'alienMeta',
				originalDomElements: $( '<!-- comment -->' ).toArray()
			},
			{ type: '/alienMeta' },
			'c', 'd',
			{
				type: 'alienMeta',
				originalDomElements: $( '<!-- comment -->' ).toArray()
			},
			{ type: '/alienMeta' },
			'e', 'f',
			{
				type: 'alienMeta',
				originalDomElements: $( '<!-- comment -->' ).toArray()
			},
			{ type: '/alienMeta' },
			'g', 'h',
			{ type: '/paragraph' }
		],
		cases = {
			'no operations': {
				calls: [],
				expected: function () {}
			},
			retaining: {
				calls: [ [ 'pushRetain', 38 ] ],
				expected: function () {}
			},
			'annotating content': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStartAnnotating', 'clear', store.index( italic ) ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushStartAnnotating', 'set', store.index( underline ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'clear', store.index( italic ) ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ],
					[ 'pushStopAnnotating', 'set', store.index( underline ) ]
				],
				expected: function ( data ) {
					data[ 1 ] = [ 'a', store.indexes( [ bold ] ) ];
					data[ 2 ] = [ 'b', store.indexes( [ bold ] ) ];
					data[ 3 ] = [ 'c', store.indexes( [ bold, underline ] ) ];
				},
				events: [
					[ 'annotation', 0, 0 ],
					[ 'update', 0, 0 ]
				]
			},
			'annotating after inserting': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 1, 0, [ 'x', 'y', 'z' ] ],
					[ 'pushRetain', 55 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ]
				],
				expected: function ( data ) {
					data[ 56 ] = [ 'l', store.indexes( [ bold ] ) ];
					data.splice( 1, 0, 'x', 'y', 'z' );
				},
				events: [
					[ 'lengthChange', 0, 0 ],
					[ 'annotation', 4, 0 ],
					[ 'update', 4, 0 ]
				]
			},
			'annotating content and leaf elements': {
				calls: [
					[ 'pushRetain', 38 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 4 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ]
				],
				expected: function ( data ) {
					data[ 38 ] = [ 'h', store.indexes( [ bold ] ) ];
					data[ 39 ].annotations = store.indexes( [ bold ] );
					data[ 41 ] = [ 'i', store.indexes( [ bold ] ) ];
				},
				events: [
					[ 'annotation', 2, 0 ],
					[ 'update', 2, 0 ],
					[ 'annotation', 2, 1 ],
					[ 'update', 2, 1 ],
					[ 'annotation', 2, 2 ],
					[ 'update', 2, 2 ]
				]
			},
			'annotating across metadata': {
				data: metadataExample,
				calls: [
					[ 'pushRetain', 2 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 2 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 6 ]
				],
				expected: function ( data ) {
					data[ 2 ] = [ 'b', store.indexes( [ bold ] ) ];
					data[ 3 ].annotations = store.indexes( [ bold ] );
					data[ 5 ] = [ 'c', store.indexes( [ bold ] ) ];
				},
				events: [
					[ 'annotation', 0, 0 ],
					[ 'update', 0, 0 ]
				]
			},
			'annotating with metadata at edges': {
				data: metadataExample,
				calls: [
					[ 'pushRetain', 3 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 4 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 3 ]
				],
				expected: function ( data ) {
					data[ 7 ].annotations = store.indexes( [ bold ] );
					data[ 5 ] = [ 'c', store.indexes( [ bold ] ) ];
					data[ 6 ] = [ 'd', store.indexes( [ bold ] ) ];
					data[ 9 ] = [ 'e', store.indexes( [ bold ] ) ];
					data[ 10 ] = [ 'f', store.indexes( [ bold ] ) ];
				},
				events: [
					[ 'annotation', 0, 0 ],
					[ 'update', 0, 0 ]
				]
			},
			'unannotating metadata': {
				data: [
					{ type: 'paragraph' },
					'a', [ 'b', store.indexes( [ bold ] ) ],
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- comment -->' ).toArray(),
						annotations: store.indexes( [ bold ] )
					},
					{ type: '/alienMeta' },
					[ 'c', store.indexes( [ bold ] ) ], 'd',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushRetain', 2 ],
					[ 'pushStartAnnotating', 'clear', store.index( bold ) ],
					[ 'pushRetain', 2 ],
					[ 'pushStopAnnotating', 'clear', store.index( bold ) ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					data[ 2 ] = 'b';
					data[ 5 ] = 'c';
					delete data[ 3 ].annotations;
				},
				events: [
					[ 'annotation', 0, 0 ],
					[ 'update', 0, 0 ]
				]
			},
			'using an annotation method other than set or clear throws an exception': {
				calls: [
					[ 'pushStartAnnotating', 'invalid-method', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'invalid-method', store.index( bold ) ]
				],
				exception: /Invalid annotation method/
			},
			'annotating branch opening element throws an exception': {
				calls: [
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ]
				],
				exception: /Invalid transaction, cannot annotate a non-content element/
			},
			'annotating branch closing element throws an exception': {
				calls: [
					[ 'pushRetain', 4 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ]
				],
				exception: /Invalid transaction, cannot annotate a non-content element/
			},
			'setting duplicate annotations throws an exception': {
				calls: [
					[ 'pushRetain', 2 ],
					[ 'pushStartAnnotating', 'set', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'set', store.index( bold ) ]
				],
				exception: /Invalid transaction, annotation to be set is already set/
			},
			'removing non-existent annotations throws an exception': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushStartAnnotating', 'clear', store.index( bold ) ],
					[ 'pushRetain', 1 ],
					[ 'pushStopAnnotating', 'clear', store.index( bold ) ]
				],
				exception: /Invalid transaction, annotation to be cleared is not set/
			},
			'changing, removing and adding attributes': {
				calls: [
					[ 'pushReplaceElementAttribute', 'level', 1, 2 ],
					[ 'pushRetain', 12 ],
					[ 'pushReplaceElementAttribute', 'style', 'bullet', 'number' ],
					[ 'pushReplaceElementAttribute', 'test', undefined, 'abcd' ],
					[ 'pushRetain', 27 ],
					[ 'pushReplaceElementAttribute', 'src', ve.dm.example.imgSrc, undefined ]
				],
				expected: function ( data ) {
					data[ 0 ].attributes.level = 2;
					data[ 12 ].attributes.style = 'number';
					data[ 12 ].attributes.test = 'abcd';
					delete data[ 39 ].attributes.src;
				}
			},
			'changing attributes on non-element data throws an exception': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplaceElementAttribute', 'foo', 23, 42 ]
				],
				exception: /Invalid element error, cannot set attributes on non-element data/
			},
			'inserting text': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 1, 0, [ 'F', 'O', 'O' ] ]
				],
				expected: function ( data ) {
					data.splice( 1, 0, 'F', 'O', 'O' );
				}
			},
			'removing text': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 1, 1, [] ]
				],
				expected: function ( data ) {
					data.splice( 1, 1 );
				}
			},
			'replacing text': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 1, 1, [ 'F', 'O', 'O' ] ]
				],
				expected: function ( data ) {
					data.splice( 1, 1, 'F', 'O', 'O' );
				}
			},
			'emptying text': {
				calls: [
					[ 'pushRetain', 10 ],
					[ 'pushReplace', 10, 1, [] ]
				],
				expected: function ( data ) {
					data.splice( 10, 1 );
				}
			},
			'inserting mixed content': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 1, 1, [ 'F', 'O', 'O', { type: 'inlineImage' }, { type: '/inlineImage' }, 'B', 'A', 'R' ] ]
				],
				expected: function ( data ) {
					data.splice( 1, 1, 'F', 'O', 'O', { type: 'inlineImage' }, { type: '/inlineImage' }, 'B', 'A', 'R' );
				}
			},
			'inserting unbalanced data': {
				calls: [
					[ 'pushReplace', 0, 0, [ { type: 'table' } ] ]
				],
				exception: /Unbalanced set of replace operations found/
			},
			'inserting unclosed inline node': {
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 1, 1, [ 'F', { type: 'inlineImage' }, 'O', 'O' ] ]
				],
				exception: /Unbalanced set of replace operations found/
			},
			'wrapping a heading in an inline node': {
				calls: [
					[ 'pushReplace', 0, 0, [ { type: 'inlineImage' } ] ],
					[ 'pushRetain', 5 ],
					[ 'pushReplace', 5, 0, [ { type: '/inlineImage' } ] ]
				],
				exception: /Cannot add a child to inlineImage node/
			},
			'converting an element': {
				calls: [
					[ 'pushReplace', 0, 1, [ { type: 'paragraph' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 4, 1, [ { type: '/paragraph' } ] ]
				],
				expected: function ( data ) {
					data[ 0 ].type = 'paragraph';
					delete data[ 0 ].attributes;
					data[ 4 ].type = '/paragraph';
				}
			},
			'conversion with wrong closing': {
				calls: [
					[ 'pushReplace', 0, 1, [ { type: 'paragraph' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 4, 1, [ { type: '/paragraph' }, { type: 'paragraph' } ] ]
				],
				exception: /Unbalanced set of replace operations found/
			},
			'splitting an element': {
				calls: [
					[ 'pushRetain', 2 ],
					[
						'pushReplace', 2, 0,
						[ { type: '/heading' }, { type: 'heading', attributes: { level: 1 } } ]
					]
				],
				expected: function ( data ) {
					data.splice(
						2,
						0,
						{ type: '/heading' },
						{ type: 'heading', attributes: { level: 1 } }
					);
				}
			},
			'merging an element': {
				calls: [
					[ 'pushRetain', 57 ],
					[ 'pushReplace', 57, 2, [] ]
				],
				expected: function ( data ) {
					data.splice( 57, 2 );
				}
			},
			'stripping elements': {
				calls: [
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 3, 1, [] ],
					[ 'pushRetain', 6 ],
					[ 'pushReplace', 10, 1, [] ]
				],
				expected: function ( data ) {
					data.splice( 10, 1 );
					data.splice( 3, 1 );
				}
			},
			'wrapping elements': {
				calls: [
					[ 'pushRetain', 55 ],
					[ 'pushReplace', 55, 0, [ { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 58, 0, [ { type: '/listItem' }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 61, 0, [ { type: '/listItem' }, { type: '/list' } ] ]
				],
				expected: function ( data ) {
					data.splice( 61, 0, { type: '/listItem' }, { type: '/list' } );
					data.splice( 58, 0, { type: '/listItem' }, { type: 'listItem' } );
					data.splice( 55, 0, { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } );
				}
			},
			'unwrapping elements': {
				calls: [
					[ 'pushRetain', 43 ],
					[ 'pushReplace', 43, 2, [] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 48, 2, [] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 53, 2, [] ]
				],
				expected: function ( data ) {
					data.splice( 53, 2 );
					data.splice( 48, 2 );
					data.splice( 43, 2 );
				}
			},
			'rewrapping elements': {
				calls: [
					[ 'pushRetain', 43 ],
					[ 'pushReplace', 43, 2, [ { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 48, 2, [ { type: '/listItem' }, { type: 'listItem' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 53, 2, [ { type: '/listItem' }, { type: '/list' } ] ]
				],
				expected: function ( data ) {
					data.splice( 53, 2, { type: '/listItem' }, { type: '/list' } );
					data.splice( 48, 2, { type: '/listItem' }, { type: 'listItem' } );
					data.splice( 43, 2, { type: 'list', attributes: { style: 'number' } }, { type: 'listItem' } );
				}
			},
			'merging a nested element': {
				calls: [
					[ 'pushRetain', 47 ],
					[ 'pushReplace', 47, 4, [] ]
				],
				expected: function ( data ) {
					data.splice( 47, 4 );
				}
			},
			'merging an element that also has a content insertion': {
				calls: [
					[ 'pushRetain', 56 ],
					[ 'pushReplace', 56, 0, [ 'x' ] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 57, 2, [] ]
				],
				expected: function ( data ) {
					data.splice( 57, 2 );
					data.splice( 56, 0, 'x' );
				}
			},
			'merging a nested element that also has a structural insertion': {
				calls: [
					[ 'pushRetain', 45 ],
					[ 'pushReplace', 45, 0, [ { type: 'paragraph' }, 'x', { type: '/paragraph' } ] ],
					[ 'pushRetain', 2 ],
					[ 'pushReplace', 47, 4, [] ]
				],
				expected: function ( data ) {
					data.splice( 47, 4 );
					data.splice( 45, 0, { type: 'paragraph' }, 'x', { type: '/paragraph' } );
				}
			},
			'merging the same element from both sides at once': {
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
					[ 'pushReplace', 2, 2, [] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 5, 2, [] ]
				],
				expected: function ( data ) {
					data.splice( 5, 2 );
					data.splice( 2, 2 );
				}
			},
			'deleting images on both sides of a text node at once': {
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
					[ 'pushReplace', 2, 2, [] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplace', 5, 2, [] ]
				],
				expected: function ( data ) {
					data.splice( 5, 2 );
					data.splice( 2, 2 );
				}
			},
			'unwrap inside of a split inside of a wrap': {
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
					[ 'pushReplace', 0, 0, [ { type: 'div' } ] ],
					[ 'pushRetain', 6 ],
					[ 'pushReplace', 6, 0, [ { type: '/div' } ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', 9, 0, [ { type: 'div' } ] ],
					[ 'pushRetain', 6 ],
					[ 'pushReplace', 15, 0, [ { type: '/div' } ] ]
				],
				expected: function ( data ) {
					data.splice( 15, 0, { type: '/div' } );
					data.splice( 9, 0, { type: 'div' } );
					data.splice( 6, 0, { type: '/div' } );
					data.splice( 0, 0, { type: 'div' } );
				}
			},
			'applying a link across an existing annotation boundary': {
				data: [
					{ type: 'paragraph' },
					[ 'f', store.indexes( [ bold, italic ] ) ],
					[ 'o', store.indexes( [ bold, italic ] ) ],
					[ 'o', store.indexes( [ bold, italic ] ) ],
					[ 'b', store.indexes( [ bold ] ) ],
					[ 'a', store.indexes( [ bold ] ) ],
					[ 'r', store.indexes( [ bold ] ) ],
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushRetain', 1 ],
					[ 'pushStartAnnotating', 'set', store.index( link ) ],
					[ 'pushRetain', 6 ],
					[ 'pushStopAnnotating', 'set', store.index( link ) ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					var i, annotations;
					for ( i = 1; i <= 6; i++ ) {
						annotations = data[ i ][ 1 ];
						annotations.splice( 1, 0, store.index( link ) );
					}
				}
			},
			'inserting text after alien node at the end': {
				data: [
					{ type: 'paragraph' },
					'a',
					{ type: 'alienInline' },
					{ type: '/alienInline' },
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushRetain', 4 ],
					[ 'pushReplace', 4, 0, [ 'b' ] ]
				],
				expected: function ( data ) {
					data.splice( 4, 0, 'b' );
				}
			},
			'inserting metadata element into existing element list': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 11 ],
					[ 'pushRetainMetadata', 2 ],
					[ 'pushReplaceMetadata', [], [ metaElementInsert ] ],
					[ 'pushRetainMetadata', 2 ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					data.splice( 25, 0, metaElementInsert, metaElementInsertClose );
				}
			},
			'inserting metadata element into empty list': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 3 ],
					[ 'pushReplaceMetadata', [], [ metaElementInsert ] ],
					[ 'pushRetain', 9 ]
				],
				expected: function ( data ) {
					data.splice( 7, 0, metaElementInsert, metaElementInsertClose );
				}
			},
			'removing all metadata elements from a metadata list': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 11 ],
					[ 'pushReplaceMetadata', ve.dm.example.withMetaMetaData[ 11 ], [] ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					data.splice( 21, 8 );
				}
			},
			'removing some metadata elements from metadata list': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 11 ],
					[ 'pushRetainMetadata', 1 ],
					[ 'pushReplaceMetadata', ve.dm.example.withMetaMetaData[ 11 ].slice( 1, 3 ), [] ],
					[ 'pushRetainMetadata', 1 ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					data.splice( 23, 4 );
				}
			},
			'replacing metadata at end of list': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 11 ],
					[ 'pushRetainMetadata', 3 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[ 11 ][ 3 ] ], [ metaElementInsert ] ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					data.splice( 27, 2, metaElementInsert, metaElementInsertClose );
				}
			},
			'replacing metadata twice at the same offset': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 11 ],
					[ 'pushRetainMetadata', 1 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[ 11 ][ 1 ] ], [ metaElementInsert ] ],
					[ 'pushRetainMetadata', 1 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[ 11 ][ 3 ] ], [ metaElementInsert ] ],
					[ 'pushRetain', 1 ]
				],
				expected: function ( data ) {
					data.splice( 23, 2, metaElementInsert, metaElementInsertClose );
					data.splice( 27, 2, metaElementInsert, metaElementInsertClose );
				}
			},
			'removing data from between metadata merges metadata': {
				data: ve.dm.example.withMeta,
				calls: [
					[ 'pushRetain', 7 ],
					[ 'pushReplace', 7, 2, [] ],
					[ 'pushRetain', 2 ]
				],
				expected: function ( data ) {
					data.splice( 15, 2 );
				}
			},
			'structural replacement starting at an offset without metadata': {
				data: [
					{ type: 'paragraph' },
					'F',
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- foo -->' ).toArray()
					},
					{ type: '/alienMeta' },
					'o', 'o',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplace', 0, 5, [ { type: 'table' }, { type: '/table' } ] ]
				],
				expected: function ( data ) {
					data.splice( 0, 2 );
					data.splice( 2, 3, { type: 'table' }, { type: '/table' } );
				}
			},
			'structural replacement starting at an offset with metadata': {
				data: [
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- foo -->' ).toArray()
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
					'o', 'o',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplace', 0, 5, [ { type: 'table' }, { type: '/table' } ] ]
				],
				expected: function ( data ) {
					// metadata  is merged.
					data.splice( 2, 2 );
					data.splice( 4, 3, { type: 'table' }, { type: '/table' } );
				}
			},
			'structural replacement ending at an offset with metadata': {
				data: [
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- foo -->' ).toArray()
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
					'o', 'o',
					{ type: '/paragraph' },
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- bar -->' ).toArray()
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					'B', 'a', 'r',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplace', 0, 5, [ { type: 'table' }, { type: '/table' } ] ],
					[ 'pushRetain', 5 ]
				],
				expected: function ( data ) {
					// metadata  is merged.
					data.splice( 2, 2 );
					data.splice( 4, 3, { type: 'table' }, { type: '/table' } );
				}
			},
			'structural deletion ending at an offset with metadata': {
				data: [
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- foo -->' ).toArray()
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
					'o', 'o',
					{ type: '/paragraph' },
					{
						type: 'alienMeta',
						originalDomElements: $( '<!-- bar -->' ).toArray()
					},
					{ type: '/alienMeta' },
					{ type: 'paragraph' },
					'B', 'a', 'r',
					{ type: '/paragraph' }
				],
				calls: [
					[ 'pushReplace', 0, 5, [] ],
					[ 'pushRetain', 5 ]
				],
				expected: function ( data ) {
					// metadata  is merged.
					data.splice( 2, 2 );
					data.splice( 4, 3 );
				}
			},
			'preserves metadata on unwrap': {
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromWrap', new ve.Range( 1, 11 ),
						[ { type: 'list' } ], [],
						[ { type: 'listItem', attributes: { styles: [ 'bullet' ] } } ], []
					]
				],
				expected: function ( data ) {
					data.splice( 35, 1 ); // remove '/list'
					data.splice( 32, 1 ); // remove '/listItem'
					data.splice( 20, 1 ); // remove 'listItem'
					data.splice( 17, 1 ); // remove '/listItem'
					data.splice( 5, 1 ); // remove 'listItem'
					data.splice( 2, 1 ); // remove 'list'
				}
			},
			'inserting trailing metadata (1)': {
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromMetadataInsertion', 12, 0, [
						{
							type: 'alienMeta',
							originalDomElements: $( '<meta property="fourteen" />' ).toArray()
						}
					] ]
				],
				expected: function ( data ) {
					ve.batchSplice( data, data.length - 4, 0, [
						{
							type: 'alienMeta',
							originalDomElements: $( '<meta property="fourteen" />' ).toArray()
						},
						{
							type: '/alienMeta'
						}
					] );
				}
			},
			'inserting trailing metadata (2)': {
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromMetadataInsertion', 12, 1, [
						{
							type: 'alienMeta',
							originalDomElements: $( '<meta property="fourteen" />' ).toArray()
						}
					] ]
				],
				expected: function ( data ) {
					ve.batchSplice( data, data.length - 2, 0, [
						{
							type: 'alienMeta',
							originalDomElements: $( '<meta property="fourteen" />' ).toArray()
						},
						{
							type: '/alienMeta'
						}
					] );
				}
			},
			'removing trailing metadata': {
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromMetadataRemoval', 12, new ve.Range( 0, 1 ) ]
				],
				expected: function ( data ) {
					ve.batchSplice( data, data.length - 4, 2, [] );
				}
			},
			'preserves trailing metadata': {
				data: ve.dm.example.listWithMeta,
				calls: [
					[ 'newFromInsertion', 4, [ 'b' ] ]
				],
				expected: function ( data ) {
					ve.batchSplice( data, 12, 0, [ 'b' ] );
				}
			}
		};

	// Run tests
	for ( msg in cases ) {
		// Generate original document
		originalData = cases[ msg ].data || ve.dm.example.data;
		originalDoc = new ve.dm.Document(
			ve.dm.example.preprocessAnnotations( ve.copy( originalData ), store )
		);
		originalDoc.buildNodeTree();
		testDoc = new ve.dm.Document(
			ve.dm.example.preprocessAnnotations( ve.copy( originalData ), store )
		);
		testDoc.buildNodeTree();

		txBuilder = new ve.dm.TransactionBuilder();
		tx = null;
		for ( i = 0; i < cases[ msg ].calls.length; i++ ) {
			// some calls need the document as its first argument
			if ( /^(pushReplace$|new)/.test( cases[ msg ].calls[ i ][ 0 ] ) ) {
				cases[ msg ].calls[ i ].splice( 1, 0, testDoc );
			}
			// special case static methods of Transaction
			if ( /^new/.test( cases[ msg ].calls[ i ][ 0 ] ) ) {
				tx = ve.dm.TransactionBuilder.static[ cases[ msg ].calls[ i ][ 0 ] ].apply( null, cases[ msg ].calls[ i ].slice( 1 ) );
				break;
			}
			txBuilder[ cases[ msg ].calls[ i ][ 0 ] ].apply( txBuilder, cases[ msg ].calls[ i ].slice( 1 ) );
		}
		if ( tx === null ) {
			tx = txBuilder.getTransaction();
		}

		if ( 'expected' in cases[ msg ] ) {
			// Generate expected document
			expectedData = ve.copy( originalData );
			cases[ msg ].expected( expectedData );
			expectedDoc = new ve.dm.Document(
				ve.dm.example.preprocessAnnotations( expectedData, store )
			);
			expectedDoc.buildNodeTree();

			if ( 'events' in cases[ msg ] ) {
				// Set up event handlers
				for ( i = 0; i < cases[ msg ].events.length; i++ ) {
					node = testDoc.getDocumentNode();
					for ( j = 1; j < cases[ msg ].events[ i ].length; j++ ) {
						node = node.getChildren()[ cases[ msg ].events[ i ][ j ] ];
					}
					node.on( cases[ msg ].events[ i ][ 0 ], ( function ( obj ) {
						return function () {
							obj.fired = ( obj.fired || 0 ) + 1;
						};
					}( cases[ msg ].events[ i ] ) ) );
				}
			}

			// Commit
			testDoc.commit( tx );
			assert.equalLinearDataWithDom( testDoc.getStore(), testDoc.getFullData(), expectedDoc.getFullData(), 'commit (data): ' + msg );
			assert.equalNodeTree(
				testDoc.getDocumentNode(),
				expectedDoc.getDocumentNode(),
				'commit (tree): ' + msg
			);
			if ( 'events' in cases[ msg ] ) {
				for ( i = 0; i < cases[ msg ].events.length; i++ ) {
					assert.equal(
						cases[ msg ].events[ i ].fired,
						1,
						'event ' + cases[ msg ].events[ i ][ 0 ] + ' on ' +
							cases[ msg ].events[ i ].slice( 1 ).join( ',' ) + ': ' + msg
					);
				}
			}
			// Rollback
			testDoc.commit( tx.reversed() );
			assert.equalLinearDataWithDom( testDoc.getStore(), testDoc.getFullData(), originalDoc.getFullData(), 'rollback (data): ' + msg );
			assert.equalNodeTree(
				testDoc.getDocumentNode(),
				originalDoc.getDocumentNode(),
				'rollback (tree): ' + msg
			);
		} else if ( 'exception' in cases[ msg ] ) {
			assert.throws(
				// eslint-disable-next-line no-loop-func
				function () {
					testDoc.commit( tx );
				},
				cases[ msg ].exception,
				'exception thrown: ' + msg
			);
			assert.equalLinearDataWithDom( testDoc.getStore(), testDoc.getFullData(), originalDoc.getFullData(), 'data unmodified: ' + msg );
			assert.equalNodeTree(
				testDoc.getDocumentNode(),
				originalDoc.getDocumentNode(),
				'tree unmodified: ' + msg
			);
		}
	}
} );
