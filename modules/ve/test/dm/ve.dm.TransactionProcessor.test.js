/**
 * VisualEditor data model TransactionProcessor tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.TransactionProcessor' );

/* Tests */

QUnit.test( 'commit/rollback', function ( assert ) {
	var i, originalData, originalDoc, msg, testDocument, tx, expectedData, expectedDocument,
		cases = {
		'no operations': {
			'calls': [],
			'expected': function ( data ) {}
		},
		'retaining': {
			'calls': [['pushRetain', 38]],
			'expected': function ( data ) {}
		},
		'annotating content': {
			'calls': [
				['pushRetain', 1],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStartAnnotating', 'clear', { 'type': 'textStyle/italic' }],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/underline' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'clear', { 'type': 'textStyle/italic' }],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/underline' }]
			],
			'expected': function ( data ) {
				var b = { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } },
					u = { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } };
				data[1] = ['a', b];
				data[2] = ['b', b];
				data[3] = ['c', ve.extendObject( {}, b, u )];
			}
		},
		'annotating content and leaf elements': {
			'calls': [
				['pushRetain', 38],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 2],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'expected': function ( data ) {
				var b = { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } };
				data[38] = ['h', b];
				data[39].annotations = b;
			}
		},
		'using an annotation method other than set or clear throws an exception': {
			'calls': [
				['pushStartAnnotating', 'invalid-method', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'invalid-method', { 'type': 'textStyle/bold' }]
			],
			'exception': /^Invalid annotation method/
		},
		'annotating branch opening element throws an exception': {
			'calls': [
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'exception': /^Invalid transaction, cannot annotate a branch opening element$/
		},
		'annotating branch closing element throws an exception': {
			'calls': [
				['pushRetain', 4],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'exception': /^Invalid transaction, cannot annotate a branch closing element$/
		},
		'setting duplicate annotations throws an exception': {
			'calls': [
				['pushRetain', 2],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'exception': /^Invalid transaction, annotation to be set is already set$/
		},
		'removing non-existent annotations throws an exception': {
			'calls': [
				['pushRetain', 1],
				['pushStartAnnotating', 'clear', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'clear', { 'type': 'textStyle/bold' }]
			],
			'exception': /^Invalid transaction, annotation to be cleared is not set$/
		},
		'changing, removing and adding attributes': {
			'calls': [
				['pushReplaceElementAttribute', 'level', 1, 2],
				['pushRetain', 12],
				['pushReplaceElementAttribute', 'style', 'bullet', 'number'],
				['pushReplaceElementAttribute', 'test', undefined, 'abcd'],
				['pushRetain', 27],
				['pushReplaceElementAttribute', 'html/src', 'image.png', undefined]
			],
			'expected': function ( data ) {
				data[0].attributes.level = 2;
				data[12].attributes.style = 'number';
				data[12].attributes.test = 'abcd';
				delete data[39].attributes['html/src'];
			}
		},
		'changing attributes on non-element data throws an exception': {
			'calls': [
				['pushRetain', 1],
				['pushReplaceElementAttribute', 'foo', 23, 42]
			],
			'exception': /^Invalid element error, can not set attributes on non-element data$/
		},
		'inserting text': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', [], ['F', 'O', 'O']]
			],
			'expected': function ( data ) {
				data.splice( 1, 0, 'F', 'O', 'O' );
			}
		},
		'removing text': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', ['a'], []]
			],
			'expected': function ( data ) {
				data.splice( 1, 1 );
			}
		},
		'replacing text': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', ['a'], ['F', 'O', 'O']]
			],
			'expected': function ( data ) {
				data.splice( 1, 1, 'F', 'O', 'O' );
			}
		},
		'inserting mixed content': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', ['a'], ['F', 'O', 'O', {'type':'image'}, {'type':'/image'}, 'B', 'A', 'R']]
			],
			'expected': function ( data ) {
				data.splice( 1, 1, 'F', 'O', 'O', {'type':'image'}, {'type':'/image'}, 'B', 'A', 'R' );
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
			}
		},
		'stripping elements': {
			'calls': [
				['pushRetain', 3],
				[
					'pushReplace',
					[['c', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }]],
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
			}
		}
	};
	// Generate original document
	originalData = ve.dm.example.data;
	originalDoc = new ve.dm.Document( originalData );
	// Run tests
	for ( msg in cases ) {
		testDocument = new ve.dm.Document( ve.copyArray( originalData ) );
		tx = new ve.dm.Transaction();
		for ( i = 0; i < cases[msg].calls.length; i++ ) {
			tx[cases[msg].calls[i][0]].apply( tx, cases[msg].calls[i].slice( 1 ) );
		}
		if ( 'expected' in cases[msg] ) {
			// Generate expected document
			expectedData = ve.copyArray( originalData );
			cases[msg].expected( expectedData );
			expectedDocument = new ve.dm.Document( expectedData );
			// Commit
			ve.dm.TransactionProcessor.commit( testDocument, tx );
			assert.deepEqual( testDocument.getData(), expectedData, 'commit (data): ' + msg );
			assert.equalNodeTree(
				testDocument.getDocumentNode(),
				expectedDocument.getDocumentNode(),
				'commit (tree): ' + msg
			);
			// Rollback
			ve.dm.TransactionProcessor.rollback( testDocument, tx );
			assert.deepEqual( testDocument.getData(), ve.dm.example.data, 'rollback (data): ' + msg );
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
