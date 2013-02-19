/*!
 * VisualEditor DataModel TransactionProcessor tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.TransactionProcessor' );

/* Tests */

QUnit.test( 'protection against double application', 3, function ( assert ) {
	var tx,
		testDocument = new ve.dm.Document( ve.dm.example.data );
	tx = new ve.dm.Transaction();
	tx.pushRetain( 1 );
	tx.pushReplace( [], ['H', 'e', 'l', 'l', 'o' ] );
	assert.throws(
		function () {
			ve.dm.TransactionProcessor.rollback( testDocument, tx );
		},
		Error,
		'exception thrown when trying to rollback an uncommitted transaction'
	);
	ve.dm.TransactionProcessor.commit( testDocument, tx );
	assert.throws(
		function () {
			ve.dm.TransactionProcessor.commit( testDocument, tx );
		},
		Error,
		'exception thrown when trying to commit an already-committed transaction'
	);
	ve.dm.TransactionProcessor.rollback( testDocument, tx );
	assert.throws(
		function () {
			ve.dm.TransactionProcessor.rollback( testDocument, tx );
		},
		Error,
		'exception thrown when trying to roll back a transaction that has already been rolled back'
	);
} );

QUnit.test( 'commit/rollback', 86, function ( assert ) {
	var i, key, originalData, originalDoc, msg, testDocument, tx,
		expectedData, expectedDocument,
		bold = ve.dm.example.createAnnotation( ve.dm.example.bold ),
		italic = ve.dm.example.createAnnotation( ve.dm.example.italic ),
		underline = ve.dm.example.createAnnotation( ve.dm.example.underline ),
		metaElementInsert = {
				'type': 'metaInline',
				'attributes': {
					'style': 'comment',
					'text': ' inline '
				}
			},
		metaElementInsertClose = { 'type': '/metaInline' },
		cases = {
			'no operations': {
				'calls': [],
				'expected': function () {}
			},
			'retaining': {
				'calls': [['pushRetain', 38]],
				'expected': function () {}
			},
			'annotating content': {
				'calls': [
					['pushRetain', 1],
					['pushStartAnnotating', 'set', bold],
					['pushRetain', 1],
					['pushStopAnnotating', 'set', bold],
					['pushRetain', 1],
					['pushStartAnnotating', 'clear', italic],
					['pushStartAnnotating', 'set', bold],
					['pushStartAnnotating', 'set', underline],
					['pushRetain', 1],
					['pushStopAnnotating', 'clear', italic],
					['pushStopAnnotating', 'set', bold],
					['pushStopAnnotating', 'set', underline]
				],
				'expected': function ( data ) {
					data[1] = ['a', new ve.AnnotationSet( [ bold ] )];
					data[2] = ['b', new ve.AnnotationSet( [ bold ] )];
					data[3] = ['c', new ve.AnnotationSet( [ bold, underline ] )];
					ve.setProp( data[0], 'internal', 'changed', 'annotations', 2 );
				}
			},
			'annotating content and leaf elements': {
				'calls': [
					['pushRetain', 38],
					['pushStartAnnotating', 'set', bold],
					['pushRetain', 4],
					['pushStopAnnotating', 'set', bold]
				],
				'expected': function ( data ) {
					data[38] = ['h', new ve.AnnotationSet( [ bold ] )];
					data[39].annotations = new ve.AnnotationSet( [ bold ] );
					data[41] = ['i', new ve.AnnotationSet( [ bold ] )];
					ve.setProp( data[37], 'internal', 'changed', 'annotations', 2 );
					ve.setProp( data[39], 'internal', 'changed', 'annotations', 1 );
				}
			},
			'using an annotation method other than set or clear throws an exception': {
				'calls': [
					['pushStartAnnotating', 'invalid-method', bold],
					['pushRetain', 1],
					['pushStopAnnotating', 'invalid-method', bold]
				],
				'exception': Error
			},
			'annotating branch opening element throws an exception': {
				'calls': [
					['pushStartAnnotating', 'set', bold],
					['pushRetain', 1],
					['pushStopAnnotating', 'set', bold]
				],
				'exception': Error
			},
			'annotating branch closing element throws an exception': {
				'calls': [
					['pushRetain', 4],
					['pushStartAnnotating', 'set', bold],
					['pushRetain', 1],
					['pushStopAnnotating', 'set', bold]
				],
				'exception': Error
			},
			'setting duplicate annotations throws an exception': {
				'calls': [
					['pushRetain', 2],
					['pushStartAnnotating', 'set', bold],
					['pushRetain', 1],
					['pushStopAnnotating', 'set', bold]
				],
				'exception': Error
			},
			'removing non-existent annotations throws an exception': {
				'calls': [
					['pushRetain', 1],
					['pushStartAnnotating', 'clear', bold],
					['pushRetain', 1],
					['pushStopAnnotating', 'clear', bold]
				],
				'exception': Error
			},
			'changing, removing and adding attributes': {
				'calls': [
					['pushReplaceElementAttribute', 'level', 1, 2],
					['pushRetain', 12],
					['pushReplaceElementAttribute', 'style', 'bullet', 'number'],
					['pushReplaceElementAttribute', 'test', undefined, 'abcd'],
					['pushRetain', 27],
					['pushReplaceElementAttribute', 'html/0/src', 'image.png', undefined]
				],
				'expected': function ( data ) {
					data[0].attributes.level = 2;
					data[12].attributes.style = 'number';
					data[12].attributes.test = 'abcd';
					delete data[39].attributes['html/0/src'];
					ve.setProp( data[0], 'internal', 'changed', 'attributes', 1 );
					ve.setProp( data[12], 'internal', 'changed', 'attributes', 2 );
					ve.setProp( data[39], 'internal', 'changed', 'attributes', 1 );
				}
			},
			'changing attributes on non-element data throws an exception': {
				'calls': [
					['pushRetain', 1],
					['pushReplaceElementAttribute', 'foo', 23, 42]
				],
				'exception': Error
			},
			'inserting text': {
				'calls': [
					['pushRetain', 1],
					['pushReplace', [], ['F', 'O', 'O']]
				],
				'expected': function ( data ) {
					data.splice( 1, 0, 'F', 'O', 'O' );
					ve.setProp( data[0], 'internal', 'changed', 'content', 1 );
				}
			},
			'removing text': {
				'calls': [
					['pushRetain', 1],
					['pushReplace', ['a'], []]
				],
				'expected': function ( data ) {
					data.splice( 1, 1 );
					ve.setProp( data[0], 'internal', 'changed', 'content', 1 );
				}
			},
			'replacing text': {
				'calls': [
					['pushRetain', 1],
					['pushReplace', ['a'], ['F', 'O', 'O']]
				],
				'expected': function ( data ) {
					data.splice( 1, 1, 'F', 'O', 'O' );
					ve.setProp( data[0], 'internal', 'changed', 'content', 1 );
				}
			},
			'emptying text': {
				'calls': [
					['pushRetain', 10],
					['pushReplace', ['d'], []]
				],
				'expected': function ( data ) {
					data.splice( 10, 1 );
					ve.setProp( data[9], 'internal', 'changed', 'content', 1 );
				}
			},
			'inserting mixed content': {
				'calls': [
					['pushRetain', 1],
					['pushReplace', ['a'], ['F', 'O', 'O', {'type':'image'}, {'type':'/image'}, 'B', 'A', 'R']]
				],
				'expected': function ( data ) {
					data.splice( 1, 1, 'F', 'O', 'O', {'type':'image'}, {'type':'/image'}, 'B', 'A', 'R' );
					ve.setProp( data[0], 'internal', 'changed', 'content', 1 );
				}
			},
			'converting an element': {
				'calls': [
					[
						'pushReplace',
						[{ 'type': 'heading', 'attributes': { 'level': 1 } }],
						[{ 'type': 'paragraph' }]
					],
					['pushRetain', 3],
					['pushReplace', [{ 'type': '/heading' }], [{ 'type': '/paragraph' }]]
				],
				'expected': function ( data ) {
					data[0].type = 'paragraph';
					delete data[0].attributes;
					data[4].type = '/paragraph';
					ve.setProp( data[0], 'internal', 'changed', 'created', 1 );
				}
			},
			'splitting an element': {
				'calls': [
					['pushRetain', 2],
					[
						'pushReplace',
						[],
						[{ 'type': '/heading' }, { 'type': 'heading', 'attributes': { 'level': 1 } }]
					]
				],
				'expected': function ( data ) {
					data.splice(
						2,
						0,
						{ 'type': '/heading' },
						{ 'type': 'heading', 'attributes': { 'level': 1 } }
					);
					ve.setProp( data[0], 'internal', 'changed', 'rebuilt', 1 );
					ve.setProp( data[3], 'internal', 'changed', 'created', 1 );
				}
			},
			'merging an element': {
				'calls': [
					['pushRetain', 57],
					[
						'pushReplace',
						[{ 'type': '/paragraph' }, { 'type': 'paragraph' }],
						[]
					]
				],
				'expected': function ( data ) {
					data.splice( 57, 2 );
					ve.setProp( data[55], 'internal', 'changed', 'content', 1 );
				}
			},
			'stripping elements': {
				'calls': [
					['pushRetain', 3],
					[
						'pushReplace',
						[['c', [ ve.dm.example.italic ]]],
						[]
					],
					['pushRetain', 6],
					[
						'pushReplace',
						['d'],
						[]
					]
				],
				'expected': function ( data ) {
					data.splice( 10, 1 );
					data.splice( 3, 1 );
					ve.setProp( data[0], 'internal', 'changed', 'content', 1 );
					ve.setProp( data[8], 'internal', 'changed', 'content', 1 );
				}
			},
			'inserting text after alien node at the end': {
				'data': [
					{ 'type': 'paragraph' },
					'a',
					{ 'type': 'alienInline' },
					{ 'type': '/alienInline' },
					{ 'type': '/paragraph' }
				],
				'calls': [
					['pushRetain', 4],
					['pushReplace', [], ['b']]
				],
				'expected': function ( data ) {
					data.splice( 4, 0, 'b' );
					ve.setProp( data[0], 'internal', 'changed', 'content', 1 );
				}
			},
			'inserting metadata element into existing element list': {
				'data': ve.dm.example.withMeta,
				'calls': [
					['pushRetain', 11 ],
					['pushRetainMetadata', 2 ],
					['pushReplaceMetadata', [], [ metaElementInsert ] ],
					['pushRetainMetadata', 2 ],
					['pushRetain', 1 ],
				],
				'expected': function( data ) {
					data.splice( 25, 0, metaElementInsert, metaElementInsertClose );
				}
			},
			'inserting metadata element into empty list': {
				'data': ve.dm.example.withMeta,
				'calls': [
					['pushRetain', 3 ],
					['pushReplaceMetadata', [], [ metaElementInsert ] ],
					['pushRetain', 9 ],
				],
				'expected': function( data ) {
					data.splice( 7, 0, metaElementInsert, metaElementInsertClose );
				}
			},
			'removing all metadata elements from a metadata list': {
				'data': ve.dm.example.withMeta,
				'calls': [
					['pushRetain', 11 ],
					['pushReplaceMetadata', ve.dm.example.withMetaMetaData[11], [] ],
					['pushRetain', 1 ],
				],
				'expected': function( data ) {
					data.splice( 21, 8 );
				}
			},
			'removing some metadata elements from metadata list': {
				'data': ve.dm.example.withMeta,
				'calls': [
					['pushRetain', 11 ],
					['pushRetainMetadata', 1 ],
					['pushReplaceMetadata', ve.dm.example.withMetaMetaData[11].slice( 1, 3 ), [] ],
					['pushRetainMetadata', 1 ],
					['pushRetain', 1 ],
				],
				'expected': function( data ) {
					data.splice( 23, 4 );
				}
			},
			'replacing metadata at end of list': {
				'data': ve.dm.example.withMeta,
				'calls': [
					['pushRetain', 11 ],
					['pushRetainMetadata', 3 ],
					['pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[11][3] ], [ metaElementInsert ] ],
					['pushRetain', 1 ],
				],
				'expected': function( data ) {
					data.splice( 27, 2, metaElementInsert, metaElementInsertClose );
				}
			}
		};

	for ( key in cases ) {
		for ( i = 0; i < cases[key].calls.length; i++ ) {
			if ( cases[key].calls[i][0] === 'pushReplace' ) {
				ve.dm.example.preprocessAnnotations( cases[key].calls[i][1] );
				ve.dm.example.preprocessAnnotations( cases[key].calls[i][2] );
			}
		}
	}

	// Run tests
	for ( msg in cases ) {
		tx = new ve.dm.Transaction();
		for ( i = 0; i < cases[msg].calls.length; i++ ) {
			tx[cases[msg].calls[i][0]].apply( tx, cases[msg].calls[i].slice( 1 ) );
		}
		if ( 'expected' in cases[msg] ) {
			// Generate original document
			originalData = cases[msg].data || ve.dm.example.data;
			originalDoc = new ve.dm.Document( ve.copyArray( originalData ) );
			testDocument = new ve.dm.Document( ve.copyArray( originalData ) );
			// Generate expected document
			expectedData = ve.copyArray( originalData );
			cases[msg].expected( expectedData );
			expectedDocument = new ve.dm.Document( ve.copyArray ( expectedData ) );
			// Commit
			ve.dm.TransactionProcessor.commit( testDocument, tx );
			assert.deepEqual( testDocument.getFullData(), expectedData, 'commit (data): ' + msg );
			assert.equalNodeTree(
				testDocument.getDocumentNode(),
				expectedDocument.getDocumentNode(),
				'commit (tree): ' + msg
			);
			// Rollback
			ve.dm.TransactionProcessor.rollback( testDocument, tx );
			assert.deepEqual( testDocument.getFullData(), originalData, 'rollback (data): ' + msg );
			assert.equalNodeTree(
				testDocument.getDocumentNode(),
				originalDoc.getDocumentNode(),
				'rollback (tree): ' + msg
			);
		} else if ( 'exception' in cases[msg] ) {
			/*jshint loopfunc:true */
			assert.throws(
				function () {
					ve.dm.TransactionProcessor.commit( testDocument, tx );
				},
				cases[msg].exception,
				'commit: ' + msg
			);
		}
	}
} );
