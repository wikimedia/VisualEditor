module( 've.dm.Transaction' );

/* Methods */

ve.dm.Transaction.runBuilderTests = function( cases ) {
	for ( var msg in cases ) {
		var tx = new ve.dm.Transaction();
		for ( var i = 0; i < cases[msg].calls.length; i++ ) {
			tx[cases[msg].calls[i][0]].apply( tx, cases[msg].calls[i].slice( 1 ) );
		}
		deepEqual( tx.getOperations(), cases[msg].ops, msg + ': operations match' );
		deepEqual( tx.getLengthDifference(), cases[msg].diff, msg + ': length differences match' );
	}
};

ve.dm.Transaction.runConstructorTests = function( constructor, cases ) {
	for ( var msg in cases ) {
		if ( cases[msg].ops ) {
			var tx = constructor.apply(
				ve.dm.Transaction, cases[msg].args
			);
			deepEqual( tx.getOperations(), cases[msg].ops, msg + ': operations match' );
		} else if ( cases[msg].exception ) {
			/*jshint loopfunc:true*/
			raises( function() {
				var tx = constructor.apply(
					ve.dm.Transaction, cases[msg].args
				);
			}, cases[msg].exception, msg + ': throw exception' );
		}
	}
};

/* Tests */

test( 'newFromInsertion', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = {
		'paragraph before first element': {
			'args': [doc, 0, [{ 'type': 'paragraph' }, '1', { 'type': '/paragraph' }]],
			'ops': [
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'paragraph' }, '1', { 'type': '/paragraph' }]
				},
				{ 'type': 'retain', 'length': 59 }
			]
		},
		'paragraph after last element': {
			'args': [doc, 59, [{ 'type': 'paragraph' }, '1', { 'type': '/paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 59 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'paragraph' }, '1', { 'type': '/paragraph' }]
				}
			]
		},
		'split paragraph': {
			'args': [doc, 9, ['1', { 'type': '/paragraph' }, { 'type': 'paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 9 },
				{
					'type': 'replace',
					'remove': [],
					'insert': ['1', { 'type': '/paragraph' }, { 'type': 'paragraph' }]
				},
				{ 'type': 'retain', 'length': 50 }
			]
		},
		'paragraph inside a heading closes and reopens heading': {
			'args': [doc, 2, [{ 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 2 },
				{
					'type': 'replace',
					'remove': [],
					// FIXME should retain attributes in heading opening
					'insert': [{'type': '/heading' }, { 'type': 'paragraph' } , 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': 'heading' }]
				},
				{ 'type': 'retain', 'length': 57 }
			]
		},
		'paragraph inside a list closes and reopens list': {
			'args': [doc, 12, [{ 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 12 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{'type': '/list' }, { 'type': 'paragraph' } , 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': 'list' }]
				},
				{ 'type': 'retain', 'length': 47 }
			]
		},
		'tableCell inside the document is wrapped in a table and a tableRow': {
			'args': [doc, 41, [{ 'type': 'tableCell' }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }]],
			'ops': [
				{ 'type': 'retain', 'length': 41 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'table' }, { 'type': 'tableRow' }, { 'type': 'tableCell' }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }, { 'type': '/tableRow' }, { 'type': '/table' }]
				},
				{ 'type': 'retain', 'length': 18 }
			]
		},
		'tableCell inside a paragraph is wrapped in a table and a tableRow and closes and reopens the paragraph': {
			'args': [doc, 50, [{ 'type': 'tableCell' }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }]],
			'ops': [
				{ 'type': 'retain', 'length': 50 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': '/paragraph' }, { 'type': 'table' }, { 'type': 'tableRow' }, { 'type': 'tableCell' }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }, { 'type': '/tableRow' }, { 'type': '/table' }, { 'type': 'paragraph' }]
				},
				{ 'type': 'retain', 'length': 9 }
			]
		},
		'text at a structural location in the document is wrapped in a paragraph': {
			'args': [doc, 0, ['F', 'O', 'O']],
			'ops': [
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }]
				},
				{ 'type': 'retain', 'length': 59 }
			]
		},
		'text inside a paragraph is not wrapped in a paragraph': {
			'args': [doc, 15, ['F', 'O', 'O']],
			'ops': [
				{ 'type': 'retain', 'length': 15 },
				{
					'type': 'replace',
					'remove': [],
					'insert': ['F', 'O', 'O']
				},
				{ 'type': 'retain', 'length': 44 }
			]
		},
		'text inside a heading is not wrapped in a paragraph': {
			'args': [doc, 2, ['F', 'O', 'O']],
			'ops': [
				{ 'type': 'retain', 'length': 2 },
				{
					'type': 'replace',
					'remove': [],
					'insert': ['F', 'O', 'O']
				},
				{ 'type': 'retain', 'length': 57 }
			]
		},
		'text inside a tableRow is wrapped in a paragraph and closes and reopens the tableRow and the table': {
			'args': [doc, 33, ['F', 'O', 'O']],
			'ops': [
				{ 'type': 'retain', 'length': 33 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': '/tableRow' }, { 'type': '/table' }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': 'table' }, { 'type': 'tableRow' }]
				},
				{ 'type': 'retain', 'length': 26 }
			]
		}
		// TODO test cases for unclosed openings
		// TODO test cases for (currently failing) unopened closings use case
		// TODO analyze other possible cases (substrings of linmod data)
	};
	ve.dm.Transaction.runConstructorTests( ve.dm.Transaction.newFromInsertion, cases );
} );

test( 'newFromRemoval', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = {
		'content in first element': {
			'args': [doc, new ve.Range( 1, 3 )],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': [
						'a',
						['b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }]
					],
					'insert': []
				},
				{ 'type': 'retain', 'length': 56 }
			]
		},
		'content in last element': {
			'args': [doc, new ve.Range( 57, 58 )],
			'ops': [
				{ 'type': 'retain', 'length': 57 },
				{
					'type': 'replace',
					'remove': ['m'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 1 }
			]
		},
		'first element': {
			'args': [doc, new ve.Range( 0, 5 )],
			'ops': [
				{
					'type': 'replace',
					'remove': [
						{ 'type': 'heading', 'attributes': { 'level': 1 } },
						'a',
						['b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
						['c', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
						{ 'type': '/heading' }
					],
					'insert': []
				},
				{ 'type': 'retain', 'length': 54 }
			]
		},
		'middle element with image': {
			'args': [doc, new ve.Range( 36, 40 )],
			'ops': [
				{ 'type': 'retain', 'length': 36 },
				{
					'type': 'replace',
					'remove': [
						'h',
						{ 'type': 'image', 'attributes': { 'html/src': 'image.png' } },
						{ 'type': '/image' },
						'i'
					],
					'insert': []
				},
				{ 'type': 'retain', 'length': 19 }
			]
		},
		'extra openings': {
			'args': [doc, new ve.Range( 0, 7 )],
			'ops': [
				{
					'type': 'replace',
					'remove': [
						{ 'type': 'heading', 'attributes': { 'level': 1 } },
						'a',
						['b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
						['c', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
						{ 'type': '/heading' }
					],
					'insert': []
				},
				{ 'type': 'retain', 'length': 54 }
			]
		},
		'last element': {
			'args': [doc, new ve.Range( 56, 59 )],
			'ops': [
				{ 'type': 'retain', 'length': 56 },
				{
					'type': 'replace',
					'remove': [{ 'type': 'paragraph' }, 'm', { 'type': '/paragraph' }],
					'insert': []
				}
			]
		},
		'extra closings': {
			'args': [doc, new ve.Range( 30, 37 )],
			'ops': [
				{ 'type': 'retain', 'length': 36 },
				{
					'type': 'replace',
					'remove': ['h'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 22 }
			]
		},
		'merge last two elements': {
			'args': [doc, new ve.Range( 55, 57 )],
			'ops': [
				{ 'type': 'retain', 'length': 55 },
				{
					'type': 'replace',
					'remove': [{ 'type': '/paragraph' }, { 'type': 'paragraph' }],
					'insert': []
				},
				{ 'type': 'retain', 'length': 2 }
			]
		},
		'strip out of paragraph in tableCell and paragraph in listItem': {
			'args': [doc, new ve.Range( 9, 15 )],
			'ops': [
				{ 'type': 'retain', 'length': 9 },
				{
					'type': 'replace',
					'remove': ['d'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 4 },
				{
					'type': 'replace',
					'remove': ['e'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 44 }
			]
		}
	};
	ve.dm.Transaction.runConstructorTests( ve.dm.Transaction.newFromRemoval, cases );
} );

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
	ve.dm.Transaction.runConstructorTests( ve.dm.Transaction.newFromAttributeChange, cases );
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
	ve.dm.Transaction.runConstructorTests( ve.dm.Transaction.newFromAnnotation, cases );
} );

test( 'pushRetain', function() {
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
		}
	};
	ve.dm.Transaction.runBuilderTests( cases );
} );

test( 'pushReplace', function() {
	var cases = {
		'insert': {
			'calls': [
				['pushReplace', [], [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]]
			],
			'ops': [
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }]
				}
			],
			'diff': 5
		},
		'multiple insert': {
			'calls': [
				['pushReplace', [], [{ 'type': 'paragraph' }, 'a', 'b']],
				['pushReplace', [], ['c', { 'type': '/paragraph' }]]
			],
			'ops': [
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'paragraph' }, 'a', 'b']
				},
				{
					'type': 'replace',
					'remove': [],
					'insert': ['c', { 'type': '/paragraph' }]
				}
			],
			'diff': 5
		},
		'insert and retain': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', [], ['a', 'b', 'c']]
			],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{ 'type': 'replace', 'remove': [], 'insert': ['a', 'b', 'c'] }
			],
			'diff': 3
		},
		'remove': {
			'calls': [
				['pushReplace', [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }], []]
			],
			'ops': [
				{
					'type': 'replace',
					'remove': [{ 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' }],
					'insert': []
				}
			],
			'diff': -5
		},
		'multiple remove': {
			'calls': [
				['pushReplace', [{ 'type': 'paragraph' }, 'a', 'b'], []],
				['pushReplace', ['c', { 'type': '/paragraph' }], []]
			],
			'ops': [
				{
					'type': 'replace',
					'remove': [{ 'type': 'paragraph' }, 'a', 'b'],
					'insert': []
				},
				{
					'type': 'replace',
					'remove': ['c', { 'type': '/paragraph' }],
					'insert': []
				}
			],
			'diff': -5
		},
		'remove and retain': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', ['a', 'b', 'c'], []]
			],
			'ops': [
				{ 'type': 'retain', 'length': 1 },
				{ 'type': 'replace', 'remove': ['a', 'b', 'c'], 'insert': [] }
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
		}
	};
	ve.dm.Transaction.runBuilderTests( cases );
} );

test( 'pushReplaceElementAttribute', function() {
	var cases = {
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
		}
	};
	ve.dm.Transaction.runBuilderTests( cases );
} );

test( 'push*Annotating', function() {
	var cases = {
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
	ve.dm.Transaction.runBuilderTests( cases );
} );
