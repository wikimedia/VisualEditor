module( 've.dm.TransactionProcessor' );

/* Tests */

test( 'commit/rollback', function() {
	var cases = {
		'no operations': {
			'calls': [],
			'expected': function( data ) {}
		},
		'retaining': {
			'calls': [['pushRetain', 38]],
			'expected': function( data ) {}
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
			'expected': function( data ) {
				var b = { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } },
					u = { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } };
				data[1] = ['a', b];
				data[2] = ['b', b];
				data[3] = ['c', ve.extendObject( {}, b, u )];
			}
		},
		'annotating content and leaf elements': {
			'calls': [
				['pushRetain', 36],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 2],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'expected': function( data ) {
				var b = { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } };
				data[36] = ['h', b];
				data[37].annotations = b;
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
		'annotating branch element throws an exception': {
			'calls': [
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 1],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'exception': /^Invalid transaction, can not annotate a branch element$/
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
				['pushRetain', 11],
				['pushReplaceElementAttribute', 'style', 'bullet', 'number'],
				['pushReplaceElementAttribute', 'test', undefined, 'abcd'],
				['pushRetain', 26],
				['pushReplaceElementAttribute', 'html/src', 'image.png', undefined]
			],
			'expected': function( data ) {
				data[0].attributes.level = 2;
				data[11].attributes.style = 'number';
				data[11].attributes.test = 'abcd';
				delete data[37].attributes['html/src'];
			}
		},
		'changing attributes on non-element data throws an exception': {
			'calls': [
				['pushRetain', 1],
				['pushReplaceElementAttribute', 'foo', 23, 42]
			],
			'exception': /^Invalid element error, can not set attributes on non-element data$/
		},
		'replacing content': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', ['a'], ['F', 'O', 'O']]
			],
			'expected': function( data ) {
				data.splice( 1, 1, 'F', 'O', 'O' );
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
			'expected': function( data ) {
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
			'expected': function( data ) {
				data.splice(
					2,
					0,
					{ 'type': '/heading' },
					{ 'type': 'heading', 'attributes': { 'level': 1 } }
				);
			}
		}
	};
	// Run tests
	var originalDoc = new ve.dm.Document( ve.dm.example.data );
	for ( var msg in cases ) {
		var doc = new ve.dm.Document( ve.copyArray( ve.dm.example.data ) ),
			tx = new ve.dm.Transaction();
		for ( var i = 0; i < cases[msg].calls.length; i++ ) {
			tx[cases[msg].calls[i][0]].apply( tx, cases[msg].calls[i].slice( 1 ) );
		}
		if ( 'expected' in cases[msg] ) {
			ve.dm.TransactionProcessor.commit( doc, tx );
			var expected = ve.copyArray( ve.dm.example.data );
			cases[msg].expected( expected );
			deepEqual( doc.getData(), expected, 'commit (data): ' + msg );
			var expectedDoc = new ve.dm.Document( expected );
			ve.example.nodeTreeEqual( doc.getDocumentNode(),
				expectedDoc.getDocumentNode(),
				'commit (tree): ' + msg
			);
			ve.dm.TransactionProcessor.rollback( doc, tx );
			deepEqual( doc.getData(), ve.dm.example.data, 'rollback (data): ' + msg );
			ve.example.nodeTreeEqual( doc.getDocumentNode(),
				originalDoc.getDocumentNode(),
				'rollback (tree): ' + msg
			);
		} else if ( 'exception' in cases[msg] ) {
			/*jshint loopfunc:true */
			raises(
				function() {
					ve.dm.TransactionProcessor.commit( doc, tx );
				},
				cases[msg].exception,
				'commit: ' + msg
			);
		}
	}
} );
