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
				{ 'type': 'retain', 'length': 61 }
			]
		},
		'paragraph after last element': {
			'args': [doc, 61, [{ 'type': 'paragraph' }, '1', { 'type': '/paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 61 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': 'paragraph' }, '1', { 'type': '/paragraph' }]
				}
			]
		},
		'split paragraph': {
			'args': [doc, 10, ['1', { 'type': '/paragraph' }, { 'type': 'paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 10 },
				{
					'type': 'replace',
					'remove': [],
					'insert': ['1', { 'type': '/paragraph' }, { 'type': 'paragraph' }]
				},
				{ 'type': 'retain', 'length': 51 }
			]
		},
		'paragraph inside a heading closes and reopens heading': {
			'args': [doc, 2, [{ 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 2 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{'type': '/heading' }, { 'type': 'paragraph' } , 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': 'heading', 'attributes': { 'level': 1 } }]
				},
				{ 'type': 'retain', 'length': 59 }
			]
		},
		'paragraph inside a list closes and reopens list': {
			'args': [doc, 13, [{ 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }]],
			'ops': [
				{ 'type': 'retain', 'length': 13 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{'type': '/list' }, { 'type': 'paragraph' } , 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': 'list', 'attributes': { 'style': 'bullet' } }]
				},
				{ 'type': 'retain', 'length': 48 }
			]
		},
		'tableCell inside the document is wrapped in a table, tableSection and tableRow': {
			'args': [doc, 43, [{ 'type': 'tableCell', 'attributes': { 'style': 'data' } }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }]],
			'ops': [
				{ 'type': 'retain', 'length': 43 },
				{
					'type': 'replace',
					'remove': [],
					// FIXME tableSection should have type=body
					'insert': [{ 'type': 'table' }, { 'type': 'tableSection' }, { 'type': 'tableRow' }, { 'type': 'tableCell', 'attributes': { 'style': 'data' } }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }, { 'type': '/tableRow' }, { 'type': '/tableSection' }, { 'type': '/table' }]
				},
				{ 'type': 'retain', 'length': 18 }
			]
		},
		'tableCell inside a paragraph is wrapped in a table, tableSection and tableRow and closes and reopens the paragraph': {
			'args': [doc, 52, [{ 'type': 'tableCell', 'attributes': { 'style': 'data' } }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }]],
			'ops': [
				{ 'type': 'retain', 'length': 52 },
				{
					'type': 'replace',
					'remove': [],
					// FIXME tableSection should have type=body
					'insert': [{ 'type': '/paragraph' }, { 'type': 'table' }, { 'type': 'tableSection' }, { 'type': 'tableRow' }, { 'type': 'tableCell', 'attributes': { 'style': 'data' } }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': '/tableCell' }, { 'type': '/tableRow' }, { 'type': '/tableSection' }, { 'type': '/table' }, { 'type': 'paragraph' }]
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
				{ 'type': 'retain', 'length': 61 }
			]
		},
		'text inside a paragraph is not wrapped in a paragraph': {
			'args': [doc, 16, ['F', 'O', 'O']],
			'ops': [
				{ 'type': 'retain', 'length': 16 },
				{
					'type': 'replace',
					'remove': [],
					'insert': ['F', 'O', 'O']
				},
				{ 'type': 'retain', 'length': 45 }
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
				{ 'type': 'retain', 'length': 59 }
			]
		},
		'text inside a tableSection is wrapped in a paragraph and closes and reopens the tableSection, tableRow and table': {
			'args': [doc, 34, ['F', 'O', 'O']],
			'ops': [
				{ 'type': 'retain', 'length': 34 },
				{
					'type': 'replace',
					'remove': [],
					'insert': [{ 'type': '/tableRow' }, { 'type': '/tableSection' }, { 'type': '/table' }, { 'type': 'paragraph' }, 'F', 'O', 'O', { 'type': '/paragraph' }, { 'type': 'table' }, { 'type': 'tableSection', 'attributes': { 'style': 'body' } }, { 'type': 'tableRow' } ]
				},
				{ 'type': 'retain', 'length': 27 }
			]
		}
		// TODO test cases for unclosed openings
		// TODO test cases for (currently failing) unopened closings use case
		// TODO analyze other possible cases (substrings of linmod data)
	};
	ve.dm.Transaction.runConstructorTests( ve.dm.Transaction.newFromInsertion, cases );
} );

test( 'newFromRemoval', function() {
	var alienDoc = new ve.dm.Document( ve.dm.example.alienData ),
		doc = new ve.dm.Document( ve.dm.example.data ),
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
				{ 'type': 'retain', 'length': 58 }
			]
		},
		'content in last element': {
			'args': [doc, new ve.Range( 59, 60 )],
			'ops': [
				{ 'type': 'retain', 'length': 59 },
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
				{ 'type': 'retain', 'length': 56 }
			]
		},
		'middle element with image': {
			'args': [doc, new ve.Range( 38, 42 )],
			'ops': [
				{ 'type': 'retain', 'length': 38 },
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
				{ 'type': 'retain', 'length': 56 }
			]
		},
		'last element': {
			'args': [doc, new ve.Range( 58, 61 )],
			'ops': [
				{ 'type': 'retain', 'length': 58 },
				{
					'type': 'replace',
					'remove': [{ 'type': 'paragraph' }, 'm', { 'type': '/paragraph' }],
					'insert': []
				}
			]
		},
		'extra closings': {
			'args': [doc, new ve.Range( 31, 39 )],
			'ops': [
				{ 'type': 'retain', 'length': 38 },
				{
					'type': 'replace',
					'remove': ['h'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 22 }
			]
		},
		'merge last two elements': {
			'args': [doc, new ve.Range( 57, 59 )],
			'ops': [
				{ 'type': 'retain', 'length': 57 },
				{
					'type': 'replace',
					'remove': [{ 'type': '/paragraph' }, { 'type': 'paragraph' }],
					'insert': []
				},
				{ 'type': 'retain', 'length': 2 }
			]
		},
		'strip out of paragraph in tableCell and paragraph in listItem': {
			'args': [doc, new ve.Range( 10, 16 )],
			'ops': [
				{ 'type': 'retain', 'length': 10 },
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
				{ 'type': 'retain', 'length': 45 }
			]
		},
		'over first alien into paragraph': {
			'args': [alienDoc, new ve.Range( 0, 4 )],
			'ops': [
				{
					'type': 'replace',
					'remove': [{ 'type': 'alienBlock' }, { 'type': '/alienBlock' }],
					'insert': []
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': ['a'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 6 }
			]
		},
		'out of paragraph over last alien': {
			'args': [alienDoc, new ve.Range( 6, 10 )],
			'ops': [
				{ 'type': 'retain', 'length': 6 },
				{
					'type': 'replace',
					'remove': ['b'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': [{ 'type': 'alienBlock' }, { 'type': '/alienBlock' }],
					'insert': []
				}
			]
		},
		'merging two paragraphs inside definitionListItems': {
			'args': [doc, new ve.Range( 47, 51 )],
			'ops': [
				{ 'type': 'retain', 'length': 47 },
				{
					'type': 'replace',
					'remove': [{ 'type': '/paragraph' }, { 'type': '/definitionListItem' }, { 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } }, { 'type': 'paragraph' }],
					'insert': []
				},
				{ 'type': 'retain', 'length': 10 }
			]
		},
		'merging two paragraphs while also deleting some content': {
			'args': [doc, new ve.Range( 56, 59 )],
			'ops': [
				{ 'type': 'retain', 'length': 56 },
				{
					'type': 'replace',
					'remove': ['l', { 'type': '/paragraph' }, { 'type': 'paragraph' } ],
					'insert': []
				},
				{ 'type': 'retain', 'length': 2 }
			]
		},
		'removing from a heading into a paragraph': {
			'args': [doc, new ve.Range( 2, 57 )],
			'ops': [
				{ 'type': 'retain', 'length': 2 },
				{
					'type': 'replace',
					'remove': doc.getData().slice( 2, 4 ),
					'insert': []
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': doc.getData().slice( 5, 55 ),
					'insert': []
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': ['l'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 4 }
			]
		},
		'removing content from a paragraph in the middle': {
			'args': [doc, new ve.Range( 56, 57 )],
			'ops': [
				{ 'type': 'retain', 'length': 56 },
				{
					'type': 'replace',
					'remove': ['l'],
					'insert': []
				},
				{ 'type': 'retain', 'length': 4 }
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
				{ 'type': 'retain', 'length': 61 }
			]
		},
		'middle element': {
			'args': [doc, 17, 'style', 'number'],
			'ops': [
				{ 'type': 'retain', 'length': 17 },
				{
					'type': 'attribute',
					'key': 'style',
					'from': 'bullet',
					'to': 'number'
				},
				{ 'type': 'retain', 'length': 44 }
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
				{ 'type': 'retain', 'length': 59 }
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
				{ 'type': 'retain', 'length': 57 }
			]
		},
		'over elements': {
			'args': [doc, new ve.Range( 4, 9 ), 'set', { 'type': 'textStyle/bold' }],
			'ops': [
				{ 'type': 'retain', 'length': 61 }
			]
		},
		'over elements and content': {
			'args': [doc, new ve.Range( 3, 11 ), 'set', { 'type': 'textStyle/bold' }],
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
				{ 'type': 'retain', 'length': 6 },
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
				{ 'type': 'retain', 'length': 50 }
			]
		}
	};
	ve.dm.Transaction.runConstructorTests( ve.dm.Transaction.newFromAnnotation, cases );
} );

test( 'newFromContentBranchConversion', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		cases = {
		'range inside a heading, convert to paragraph': {
			'args': [doc, new ve.Range( 1, 2 ), 'paragraph'],
			'ops': [
				{
					'type': 'replace',
					'remove': [{ 'type': 'heading', 'attributes': { 'level': 1 } }],
					'insert': [{ 'type': 'paragraph' }]
				},
				{ 'type': 'retain', 'length': 3 },
				{
					'type': 'replace',
					'remove': [{ 'type': '/heading' }],
					'insert': [{ 'type': '/paragraph' }]
				},
				{ 'type': 'retain', 'length': 56 }
			]
		},
		'range around 2 paragraphs, convert to preformatted': {
			'args': [doc, new ve.Range( 50, 58 ), 'preformatted'],
			'ops': [
				{ 'type': 'retain', 'length': 50 },
				{
					'type': 'replace',
					'remove': [{ 'type': 'paragraph' }],
					'insert': [{ 'type': 'preformatted' }]
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': [{ 'type': '/paragraph' }],
					'insert': [{ 'type': '/preformatted' }]
				},
				{ 'type': 'retain', 'length': 2 },
				{
					'type': 'replace',
					'remove': [{ 'type': 'paragraph' }],
					'insert': [{ 'type': 'preformatted' }]
				},
				{ 'type': 'retain', 'length': 1 },
				{
					'type': 'replace',
					'remove': [{ 'type': '/paragraph' }],
					'insert': [{ 'type': '/preformatted' }]
				},
				{ 'type': 'retain', 'length': 3 }
			]
		}
	};
	ve.dm.Transaction.runConstructorTests(
		ve.dm.Transaction.newFromContentBranchConversion, cases
	);
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
