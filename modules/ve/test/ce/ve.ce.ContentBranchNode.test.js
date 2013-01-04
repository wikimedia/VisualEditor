/*!
 * VisualEditor content editable ContentBranchNode tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.ContentBranchNode' );

/* Tests */

QUnit.test( 'getRenderedContents', function ( assert ) {
	var i, len, $rendered, cases = [
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
				['a', [ { 'type': 'textStyle/bold' } ]],
				['b', [ { 'type': 'textStyle/bold' } ]],
				['c', [ { 'type': 'textStyle/bold' } ]],
				{ 'type': '/paragraph' }
			],
			'html': '<b>abc</b>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', [ { 'type': 'textStyle/bold' } ]],
				'b',
				['c', [ { 'type': 'textStyle/italic' } ]],
				{ 'type': '/paragraph' }
			],
			'html': '<b>a</b>b<i>c</i>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['b', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['c', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				{ 'type': '/paragraph' }
			],
			'html': '<b><i><u>abc</u></i></b>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['b', [
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' }
				]],
				['c', [
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' }
				]],
				{ 'type': '/paragraph' }
			],
			'html': '<b><i><u>abc</u></i></b>'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				'b',
				['c', [
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' }
				]],
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
				['d', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['e', [
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' }
				]],
				['f', [
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' }
				]],
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
				['d', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['e', [
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['f', [
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' }
				]],
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
				['d', [
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' }
				]],
				['e', [
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' }
				]],
				['f', [
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/italic' }
				]],
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
				['d', [
					{ 'type': 'textStyle/italic' },
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' }
				]],
				['e', [
					{ 'type': 'textStyle/bold' },
					{ 'type': 'textStyle/underline' }
				]],
				['f', [
					{ 'type': 'textStyle/underline' },
					{ 'type': 'textStyle/bold' }
				]],
				'g',
				'h',
				'i',
				{ 'type': '/paragraph' }
			],
			'html': 'abc<i><u><b>d</b></u></i><u><b>ef</b></u>ghi'
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				['b', [ { 'type': 'textStyle/bold' } ]],
				{
					'type': 'MWentity',
					'attributes': { 'character': 'c', 'html/typeof': 'mw:Entity' },
					'annotations': [ { 'type': 'textStyle/bold' } ]
				},
				{ 'type': '/MWentity' },
				['d', [ { 'type': 'textStyle/bold' } ]],
				{
					'type': 'alienInline',
					'attributes': { 'html': '<tt>e</tt>' },
					'annotations': [ { 'type': 'textStyle/bold' } ]
				},
				{ 'type': '/alienInline' },
				{ 'type': '/paragraph' }
			],
			'html': 'a<b>b<span typeof="mw:Entity" class="ve-ce-leafNode ' +
				've-ce-MWEntityNode" contenteditable="false">c</span>d<div ' +
				'class="ve-ce-leafNode ve-ce-alienNode ve-ce-alienInlineNode" ' +
				'contenteditable="false"><tt>e</tt></div></b>'
		}
	];
	QUnit.expect( cases.length );
	for ( i = 0, len = cases.length; i < len; i++ ) {
		ve.dm.example.preprocessAnnotations( cases[i].data );
		$rendered = ( new ve.ce.ParagraphNode(
				( new ve.dm.Document( cases[i].data ) )
					.documentNode.getChildren()[0] )
			).getRenderedContents();
		assert.deepEqual( $( '<div>' ).append( $rendered ).html(), cases[i].html );
	}
} );
