module( 've.dm.Transaction' );

/* Tests */

test( 'newFromAttributeChange', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = {
		'first element': {
			'args': [doc, 0, 'level', 2],
			'ops': [
				{
					'type': 'attribute',
					'key': 'level',
					'from': 1,
					'to': 2
				},
				{ 'type': 'retain', 'length': 59 }
			]
		},
		'middle element': {
			'args': [doc, 16, 'style', 'number'],
			'ops': [
				{ 'type': 'retain', 'length': 16 },
				{
					'type': 'attribute',
					'key': 'style',
					'from': 'bullet',
					'to': 'number'
				},
				{ 'type': 'retain', 'length': 43 }
			]
		},
		'non-element': {
			'args': [doc, 1, 'level', 2],
			'exception': /^Can not set attributes to non-element data$/
		},
		'closing element': {
			'args': [doc, 4, 'level', 2],
			'exception': /^Can not set attributes on closing element$/
		}
	};
	for ( var msg in cases ) {
		if ( cases[msg].ops ) {
			var tx = ve.dm.Transaction.newFromAttributeChange.apply(
				ve.dm.Transaction, cases[msg].args
			);
			deepEqual( tx.getOperations(), cases[msg].ops, msg + ': operations match' );
		} else if ( cases[msg].exception ) {
			/*jshint loopfunc:true*/
			raises( function() {
				var tx = ve.dm.Transaction.newFromAttributeChange.apply(
					ve.dm.Transaction, cases[msg].args
				);
			}, cases[msg].exception, msg + ': throw exception' );
		}
	}
} );

test( 'newFromAnnotation', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = {
		'over plain text': {
			'args': [doc, new ve.Range( 1, 2 ), 'set', { 'type': 'textStyle/bold' }],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 57 }
			]
		},
		'over annotated text': {
			'args': [doc, new ve.Range( 1, 4 ), 'set', { 'type': 'textStyle/bold' }],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 55 }
			]
		},
		'over elements': {
			'args': [doc, new ve.Range( 4, 9 ), 'set', { 'type': 'textStyle/bold' }],
			'ops': [
				{ 'type': 'retain', 'length': 59 }
			]
		},
		'over elements and content': {
			'args': [doc, new ve.Range( 3, 10 ), 'set', { 'type': 'textStyle/bold' }],
			'ops': [
				{ 'type': 'retain', 'length': 3 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 5 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{ 'type': 'retain', 'length': 49 }
			]
		}
	};
	for ( var msg in cases ) {
		var tx = ve.dm.Transaction.newFromAnnotation.apply(
			ve.dm.Transaction, cases[msg].args
		);
		deepEqual( tx.getOperations(), cases[msg].ops, msg + ': operations match' );
	}
} );

test( 'constructor', function() {
	var cases = {
		'retain': {
			'calls': [['pushRetain', 5]],
			'ops': [{ 'type': 'retain', 'length': 5 }],
			'diff': 0
		},
		'multiple retain': {
			'calls': [['pushRetain', 5], ['pushRetain', 3]],
			'ops': [{ 'type': 'retain', 'length': 8 }],
			'diff': 0
		},
		'insert': {
			'calls': [
				['pushInsert', [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]]
			],
			'ops': [
				{
					'type': 'insert',
					'data': [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]
				}
			],
			'diff': 5
		},
		'multiple insert': {
			'calls': [
				['pushInsert', [{ 'type': 'paragraph' }, 'a', 'b']],
				['pushInsert', ['c', { 'type': '/paragraph' }]]
			],
			'ops': [
				{
					'type': 'insert',
					'data': [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]
				}
			],
			'diff': 5
		},
		'insert and retain': {
			'calls': [
				['pushRetain', 1],
				['pushInsert', ['a', 'b', 'c']]
			],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{ 'type': 'insert', 'data': ['a', 'b', 'c'] }
			],
			'diff': 3
		},
		'remove': {
			'calls': [
				['pushRemove', [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]]
			],
			'ops': [
				{
					'type': 'remove',
					'data': [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]
				}
			],
			'diff': -5
		},
		'multiple remove': {
			'calls': [
				['pushRemove', [{ 'type': 'paragraph' }, 'a', 'b']],
				['pushRemove', ['c', { 'type': '/paragraph' }]]
			],
			'ops': [
				{
					'type': 'remove',
					'data': [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]
				}
			],
			'diff': -5
		},
		'remove and retain': {
			'calls': [
				['pushRetain', 1],
				['pushRemove', ['a', 'b', 'c']]
			],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{ 'type': 'remove', 'data': ['a', 'b', 'c'] }
			],
			'diff': -3
		},
		'replace': {
			'calls': [
				['pushReplace', ['a', 'b', 'c'], ['d', 'e', 'f']]
			],
			'ops': [
				{
					'type': 'replace',
					'remove': ['a', 'b', 'c'],
					'insert': ['d', 'e', 'f']
				}
			],
			'diff': 0
		},
		'multiple replace': {
			'calls': [
				['pushReplace', ['a', 'b', 'c'], ['d', 'e', 'f']],
				['pushReplace', ['g', 'h', 'i'], ['j', 'k', 'l']]
			],
			'ops': [
				{
					'type': 'replace',
					'remove': ['a', 'b', 'c'],
					'insert': ['d', 'e', 'f']
				},
				{
					'type': 'replace',
					'remove': ['g', 'h', 'i'],
					'insert': ['j', 'k', 'l']
				}
			],
			'diff': 0
		},
		'replace element attribute': {
			'calls': [
				['pushReplaceElementAttribute', 'style', 'bullet', 'number']
			],
			'ops': [
				{
					'type': 'attribute',
					'key': 'style',
					'from': 'bullet',
					'to': 'number'
				}
			],
			'diff': 0
		},
		'replace multiple element attributes': {
			'calls': [
				['pushReplaceElementAttribute', 'style', 'bullet', 'number'],
				['pushReplaceElementAttribute', 'level', 1, 2]
			],
			'ops': [
				{
					'type': 'attribute',
					'key': 'style',
					'from': 'bullet',
					'to': 'number'
				},
				{
					'type': 'attribute',
					'key': 'level',
					'from': 1,
					'to': 2
				}
			],
			'diff': 0
		},
		'start annotating': {
			'calls': [
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'ops': [
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				}
			],
			'diff': 0
		},
		'stop annotating': {
			'calls': [
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }]
			],
			'ops': [
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				}
			],
			'diff': 0
		},
		'start multiple annotations': {
			'calls': [
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/italic' }]
			],
			'ops': [
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'start',
					'annotation': { 'type': 'textStyle/italic' }
				}
			],
			'diff': 0
		},
		'stop multiple annotations': {
			'calls': [
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/italic' }]
			],
			'ops': [
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/bold' }
				},
				{
					'type': 'annotate',
					'method': 'set',
					'bias': 'stop',
					'annotation': { 'type': 'textStyle/italic' }
				}
			],
			'diff': 0
		}
	};
	for ( var msg in cases ) {
		var tx = new ve.dm.Transaction();
		for ( var i = 0; i < cases[msg].calls.length; i++ ) {
			tx[cases[msg].calls[i][0]].apply( tx, cases[msg].calls[i].slice( 1 ) );
		}
		deepEqual( tx.getOperations(), cases[msg].ops, msg + ': operations match' );
		deepEqual( tx.getLengthDifference(), cases[msg].diff, msg + ': length differences match' );
	}
} );
