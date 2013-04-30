/*!
 * VisualEditor ContentEditable ContentBranchNode tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.ContentBranchNode' );

/* Tests */

QUnit.test( 'getRenderedContents', function ( assert ) {
	var i, len, doc, $rendered, $wrapper,
		cases = [
		{
			'msg': 'Plain text without annotations',
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
			'msg': 'Bold text',
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
			'msg': 'Bold character, plain character, italic character',
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
			'msg': 'Bold, italic and underlined text (same order)',
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
			'msg': 'Varying order in consecutive range doesn\'t affect rendering',
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
			'msg': 'Varying order in non-consecutive range does affect rendering',
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
			'msg': 'Text annotated in varying order, surrounded by plain text',
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
			'msg': 'Out-of-order closings do not produce misnested tags',
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
			'msg': 'Additional openings are added inline, even when out of order',
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
			'msg': 'Out-of-order closings surrounded by plain text',
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
			'html': 'abc<i><u><b>d</b></u></i><b><u>ef</u></b>ghi'
		},
		{
			'msg': 'Annotation spanning text and inline nodes',
			'data': [
				{ 'type': 'paragraph' },
				'a',
				['b', [ { 'type': 'textStyle/bold' } ]],
				{
					'type': 'MWentity',
					'attributes': { 'character': 'c', 'html/0/typeof': 'mw:Entity' },
					'annotations': [ { 'type': 'textStyle/bold' } ]
				},
				{ 'type': '/MWentity' },
				['d', [ { 'type': 'textStyle/bold' } ]],
				{
					'type': 'alienInline',
					'attributes': { 'domElements': $( '<tt>e</tt>' ).toArray() },
					'annotations': [ { 'type': 'textStyle/bold' } ]
				},
				{ 'type': '/alienInline' },
				{ 'type': '/paragraph' }
			],
			'html': 'a<b>b<span typeof="mw:Entity" class="ve-ce-leafNode ' +
				've-ce-MWEntityNode" contenteditable="false">c</span>d<div ' +
				'class="ve-ce-leafNode ve-ce-generatedContentNode ve-ce-alienNode ve-ce-alienInlineNode" ' +
				'contenteditable="false"><tt>e</tt></div></b>'
		}
	];
	QUnit.expect( cases.length );
	for ( i = 0, len = cases.length; i < len; i++ ) {
		doc = new ve.dm.Document( ve.dm.example.preprocessAnnotations( cases[i].data ) );
		$rendered = ( new ve.ce.ParagraphNode( doc.documentNode.getChildren()[0] ) ).getRenderedContents();
		$wrapper = $( '<div>' ).append( $rendered );
		// HACK strip out all the class="ve-ce-TextStyleAnnotation ve-ce-TextStyleBoldAnnotation" crap
		$wrapper.find( '.ve-ce-TextStyleAnnotation' ).removeAttr( 'class' );
		assert.equalDomElement( $wrapper[0], $( '<div>' ).html( cases[i].html )[0], cases[i].msg );
	}
} );
