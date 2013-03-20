/*!
 * VisualEditor ContentEditable TextNode tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.TextNode' );

/* Tests */

QUnit.test( 'getAnnotatedHtml', function ( assert ) {
	var i, len, cases, doc,
		store = new ve.dm.IndexValueStore();

	cases = [
		{
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				{ 'type': '/paragraph' }
			],
			'html': [ 'a', 'b', 'c' ]
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', [ { 'type': 'textStyle/bold' } ]],
				['b', [ { 'type': 'textStyle/bold' } ]],
				['c', [ { 'type': 'textStyle/bold' } ]],
				{ 'type': '/paragraph' }
			],
			'html': [
				['a', [ { 'type': 'textStyle/bold' } ]],
				['b', [ { 'type': 'textStyle/bold' } ]],
				['c', [ { 'type': 'textStyle/bold' } ]]
			]
		},
		{
			'data': [
				{ 'type': 'paragraph' },
				['a', [ { 'type': 'textStyle/bold' } ]],
				'b',
				['c', [ { 'type': 'textStyle/italic' } ]],
				{ 'type': '/paragraph' }
			],
			'html': [
				['a', [ { 'type': 'textStyle/bold' } ]],
				'b',
				['c', [ { 'type': 'textStyle/italic' } ]]
			]
		},
		{
			// [ ]
			'data': [{ 'type': 'paragraph' },' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;' ]
		},
		{
			// [ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', '&nbsp;' ]
		},
		{
			// [ ][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;' ]
		},
		{
			// [ ][ ][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;', '&nbsp;' ]
		},
		{
			// [ ][ ][ ][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;', ' ', '&nbsp;' ]
		},
		{
			// [ ][ ][ ][ ][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ', ' ', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;', ' ', '&nbsp;', '&nbsp;' ]
		},
		{
			// [ ][A][ ][ ][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', 'A', ' ', ' ', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', 'A', ' ', '&nbsp;', ' ', '&nbsp;' ]
		},
		{
			// [ ][ ][A][ ][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', 'A', ' ', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', 'A', ' ', '&nbsp;', '&nbsp;' ]
		},
		{
			// [ ][ ][ ][A][ ][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ', 'A', ' ', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;', 'A', ' ', '&nbsp;' ]
		},
		{
			// [ ][ ][ ][ ][A][ ]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ', ' ', 'A', ' ',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;', ' ', 'A', '&nbsp;' ]
		},
		{
			// [ ][ ][ ][ ][ ][A]
			'data': [{ 'type': 'paragraph' },' ', ' ', ' ', ' ', ' ', 'A',{ 'type': '/paragraph' }],
			'html': [ '&nbsp;', ' ', '&nbsp;', ' ', '&nbsp;', 'A' ]
		},
		{
			'data': [{ 'type': 'paragraph' }, '\n', 'A', '\n', 'B', '\n', { 'type': '/paragraph' }],
			'html': [ '&crarr;', 'A', '&crarr;', 'B', '&crarr;' ]
		},
		{
			'data': [{ 'type': 'paragraph' }, '\t', 'A', '\t', 'B', '\t', { 'type': '/paragraph' }],
			'html': [ '&#10142;', 'A', '&#10142;', 'B', '&#10142;' ]
		},
		{
			'data': [{ 'type': 'preformatted' }, '\n', 'A', '\n', 'B', '\n', { 'type': '/preformatted' }],
			'html': [ '\n', 'A', '\n', 'B', '\n' ]
		},
		{
			'data': [{ 'type': 'preformatted' }, '\t', 'A', '\t', 'B', '\t', { 'type': '/preformatted' }],
			'html': [ '\t', 'A', '\t', 'B', '\t' ]
		},
		{
			// [ ][ ][ ][A][ ][ ]
			'data': [{ 'type': 'preformatted' },' ', ' ', ' ', 'A', ' ', ' ',{ 'type': '/preformatted' }],
			'html': [ ' ', ' ', ' ', 'A', ' ', ' ' ]
		},
		{
			'data': [{ 'type': 'paragraph' }, '&', '<', '>', '\'', '"', { 'type': '/paragraph' }],
			'html': [ '&amp;', '&lt;', '&gt;', '&#039;', '&quot;' ]
		}
	];
	QUnit.expect( cases.length );
	for ( i = 0, len = cases.length; i < len; i++ ) {
		doc = new ve.dm.Document( ve.dm.example.preprocessAnnotations( cases[i].data, store ) );
		ve.dm.example.preprocessAnnotations( cases[i].html, store );
		assert.deepEqual(
			( new ve.ce.TextNode( doc.documentNode.getChildren()[0].getChildren()[0] ) ).getAnnotatedHtml(),
			cases[i].html
		);
	}
} );
