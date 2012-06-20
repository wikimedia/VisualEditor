module( 've.ce.TextNode' );


/* Tests */

test( 'getHtml', 10, function() {
	var cases = [
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				{ 'type': '/paragraph' }
			],
			'html': 'abc'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
				['b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
				['c', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
				{ 'type': '/paragraph' }
			],
			'html': '<b>abc</b>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
				'b',
				['c', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
				{ 'type': '/paragraph' }
			],
			'html': '<b>a</b>b<i>c</i>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['b', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['c', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				{ 'type': '/paragraph' }
			],
			'html': '<b><i><u>abc</u></i></b>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['b', {
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }
				}],
				['c', {
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' }
				}],
				{ 'type': '/paragraph' }
			],
			'html': '<b><i><u>abc</u></i></b>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				'b',
				['c', {
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' }
				}],
				{ 'type': '/paragraph' }
			],
			'html': '<b><i><u>a</u></i></b>b<u><b><i>c</i></b></u>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				['d', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['e', {
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }
				}],
				['f', {
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' }
				}],
				'g',
				'h',
				'i',				
				{ 'type': '/paragraph' }
			],
			'html': 'abc<b><i><u>def</u></i></b>ghi'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				['d', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['e', {
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['f', {
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' }
				}],
				'g',
				'h',
				'i',				
				{ 'type': '/paragraph' }
			],
			'html': 'abc<b><i><u>d</u></i></b><i><u>e<b>f</b></u></i>ghi'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				['d', {
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }
				}],
				['e', {
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['f', {
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' }
				}],
				'g',
				'h',
				'i',				
				{ 'type': '/paragraph' }
			],
			'html': 'abc<i><u><b>d</b>e<b>f</b></u></i>ghi'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				['d', {
					'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }
				}],
				['e', {
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' },
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' }
				}],
				['f', {
					'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
					'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }
				}],
				'g',
				'h',
				'i',				
				{ 'type': '/paragraph' }
			],
			'html': 'abc<i><u><b>d</b></u></i><u><b>ef</b></u>ghi'
		}
	];
	for ( var i = 0; i < cases.length; i++ ) {
		equal(
			( new ve.ce.TextNode(
				( new ve.dm.Document( cases[i].data ) )
					.documentNode.getChildren()[0].getChildren()[0] )
			).getHtml(),
			cases[i].html
		);
	}
} );
