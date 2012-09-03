/**
 * VisualEditor data model example data sets.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/* Static Members */

ve.dm.example = {};

/**
 * Serialized HTML.
 *
 * This is what the parser will emit.
 * TODO remove some of the <p>s here to test automatic wrapping
 */
ve.dm.example.html =
	'<h1>a<b>b</b><i>c</i></h1>' +
	'<table>' +
		'<tr>' +
			'<td>' +
				'<p>d</p>' +
				'<ul>' +
					'<li>' +
						'<p>e</p>' +
						'<ul>' +
							'<li>' +
								'<p>f</p>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>' +
						'<p>g</p>' +
					'</li>' +
				'</ol>' +
			'</td>' +
		'</tr>' +
	'</table>' +
	'<pre>h<img src="image.png">i</pre>'+
	'<dl>' +
		'<dt>' +
			'<p>j</p>' +
		'</dt>' +
		'<dd>' +
			'<p>k</p>' +
		'</dd>' +
	'</dl>' +
	'<p>l</p>' +
	'<p>m</p>';

/*
 * Linear data.
 *
 * This is what we convert serialized HTML from the parser into so we can work with it more easily.
 *
 * There are three types of components in content data:
 *
 *     {String} Plain text character
 *
 *     {Array} Annotated character
 *         0: {String} Character
 *         1: {Object} List of references to immutable annotation objects, keyed by JSON
 *            serializations of their values (hashes)
 *
 *     {Object} Opening or closing structural element
 *         type: {String} Symbolic node type name, if closing element first character will be "/"
 *         [attributes]: {Object} List of symbolic attribute name and literal value pairs
 */
ve.dm.example.data = [
	//  0 - Beginning of heading
	{ 'type': 'heading', 'attributes': { 'level': 1 } },
	//  1 - Plain "a"
	'a',
	//  2 - Bold "b"
	['b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
	//  3 - Italic "c"
	['c', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
	//  4 - End of heading
	{ 'type': '/heading' },
	//  5 - Beginning of table
	{ 'type': 'table' },
	//  6 - Beginning of body
	{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
	//  7 - Beginning of row
	{ 'type': 'tableRow' },
	//  8 - Beginning of cell
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	//  9 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 10 - Plain "d"
	'd',
	// 11 - End of paragraph
	{ 'type': '/paragraph' },
	// 12 - Beginning of bullet list
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	// 13 - Beginning of list item
	{ 'type': 'listItem' },
	// 14 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 15 - Plain "e"
	'e',
	// 16 - End of paragraph
	{ 'type': '/paragraph' },
	// 17 - Beginning of nested bullet list
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	// 18 - Beginning of nested bullet list item
	{ 'type': 'listItem'  },
	// 19 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 20 - Plain "f"
	'f',
	// 21 - End of paragraph
	{ 'type': '/paragraph' },
	// 22 - End of nested bullet list item
	{ 'type': '/listItem' },
	// 23 - End of nested bullet list
	{ 'type': '/list' },
	// 24 - End of bullet list item
	{ 'type': '/listItem' },
	// 25 - End of bullet list
	{ 'type': '/list' },
	// 26 - Beginning of numbered list
	{ 'type': 'list', 'attributes': { 'style': 'number' } },
	// 27 - Beginning of numbered list item
	{ 'type': 'listItem' },
	// 28 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 29 - Plain "g"
	'g',
	// 30 - End of paragraph
	{ 'type': '/paragraph' },
	// 31 - End of item
	{ 'type': '/listItem' },
	// 32 - End of list
	{ 'type': '/list' },
	// 33 - End of cell
	{ 'type': '/tableCell' },
	// 34 - End of row
	{ 'type': '/tableRow' },
	// 35 - End of body
	{ 'type': '/tableSection' },
	// 36 - End of table
	{ 'type': '/table' },
	// 37 - Beginning of preformatted
	{ 'type': 'preformatted' },
	// 38 - Plain "h"
	'h',
	// 39 - Beginning of inline image
	{ 'type': 'image', 'attributes': { 'html/src': 'image.png' } },
	// 40 - End of inline image
	{ 'type': '/image' },
	// 41 - Plain "i"
	'i',
	// 42 - End of preformatted
	{ 'type': '/preformatted' },
	// 43 - Beginning of definition list
	{ 'type': 'definitionList' },
	// 44 - Beginning of definition list term item
	{ 'type': 'definitionListItem', 'attributes': { 'style': 'term' } },
	// 45 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 46 - Plain "j"
	'j',
	// 47 - End of paragraph
	{ 'type': '/paragraph' },
	// 48 - End of definition list term item
	{ 'type': '/definitionListItem' },
	// 49 - Beginning of definition list definition item
	{ 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } },
	// 50 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 51 - Plain "k"
	'k',
	// 52 - End of paragraph
	{ 'type': '/paragraph' },
	// 53 - End of definition list definition item
	{ 'type': '/definitionListItem' },
	// 54 - End of definition list
	{ 'type': '/definitionList' },
	// 55 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 56 - Plain "l"
	'l',
	// 57 - End of paragraph
	{ 'type': '/paragraph' },
	// 58 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 59 - Plain "m"
	'm',
	// 60 - End of paragraph
	{ 'type': '/paragraph' }
	// 61 - End of document
];

ve.dm.example.alienData = [
	// 0 - Open alienBlock
	{ 'type': 'alienBlock' },
	// 1 - Close alienBlock
	{ 'type': '/alienBlock' },
	// 2 - Open paragraph
	{ 'type': 'paragraph' },
	// 3 - Plain character 'a'
	'a',
	// 4 - Open alienInline
	{ 'type': 'alienBlock' },
	// 5 - Close alienInline
	{ 'type': '/alienBlock' },
	// 6 - Plain character 'b'
	'b',
	// 7 - Close paragraph
	{ 'type': '/paragraph' },
	// 8 - Open alienBlock
	{ 'type': 'alienBlock' },
	// 9 - Close alienBlock
	{ 'type': '/alienBlock' }
	// 10 - End of document
];

/**
 * Sample content data index.
 *
 * This is part of what a ve.dm.DocumentFragment generates when given linear data.
 *
 *  (21) branch nodes
 *     (01) document node
 *     (01) heading node
 *     (01) table node
 *     (01) tableRow node
 *     (01) tableCell node
 *     (06) paragraph nodes
 *     (03) list nodes
 *     (03) listItem nodes
 *     (01) preformatted node
 *     (01) definitionList node
 *     (02) definitionListItem nodes
 *  (10) leaf nodes
 *     (09) text nodes
 *     (01) image node
 */
ve.dm.example.tree = new ve.dm.DocumentNode( [
	// Heading with "abc"
	new ve.dm.HeadingNode( [new ve.dm.TextNode( 3 )], ve.dm.example.data[0].attributes ),
	new ve.dm.TableNode( [
		new ve.dm.TableSectionNode( [
			new ve.dm.TableRowNode( [
				new ve.dm.TableCellNode( [
					// Paragraph with "d"
					new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] ),
					new ve.dm.ListNode( [
						// 1st level bullet list item with "e"
						new ve.dm.ListItemNode( [
							new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] ),
							new ve.dm.ListNode( [
								// 2nd level bullet list item with "f"
								new ve.dm.ListItemNode( [
									new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] )
								] )
							], ve.dm.example.data[17].attributes )
						] )
					], ve.dm.example.data[12].attributes  ),
					new ve.dm.ListNode( [
						// Numbered list item with "g"
						new ve.dm.ListItemNode( [
							new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] )
						] )
					], ve.dm.example.data[26].attributes )
				], ve.dm.example.data[8].attributes )
			] )
		], ve.dm.example.data[6].attributes )
	] ),
	// Preformatted with "h[image.png]i"
	new ve.dm.PreformattedNode( [
		new ve.dm.TextNode( 1 ),
		new ve.dm.ImageNode( [], ve.dm.example.data[39].attributes ),
		new ve.dm.TextNode( 1 )
	] ),
	new ve.dm.DefinitionListNode( [
		// Definition list term item with "j"
		new ve.dm.DefinitionListItemNode( [
			new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] )
		], ve.dm.example.data[44].attributes ),
		// Definition list definition item with "k"
		new ve.dm.DefinitionListItemNode( [
			new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] )
		], ve.dm.example.data[49].attributes )
	] ),
	new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] ),
	new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] )
] );

ve.dm.example.conversions = {
	'definitionListItem term': {
		'domElement': ve.example.createDomElement( 'dt' ),
		'dataElement': { 'type': 'definitionListItem', 'attributes': { 'style': 'term' } }
	},
	'definitionListItem definition': {
		'domElement': ve.example.createDomElement( 'dd' ),
		'dataElement': { 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } }
	},
	'definitionList definition': {
		'domElement': ve.example.createDomElement( 'dl' ),
		'dataElement': { 'type': 'definitionList' }
	},
	'heading level 1': {
		'domElement': ve.example.createDomElement( 'h1' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 1 } }
	},
	'heading level 2': {
		'domElement': ve.example.createDomElement( 'h2' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 2 } }
	},
	'heading level 3': {
		'domElement': ve.example.createDomElement( 'h3' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 3 } }
	},
	'heading level 4': {
		'domElement': ve.example.createDomElement( 'h4' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 4 } }
	},
	'heading level 5': {
		'domElement': ve.example.createDomElement( 'h5' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 5 } }
	},
	'heading level 6': {
		'domElement': ve.example.createDomElement( 'h6' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 6 } }
	},
	'image': {
		'domElement': ve.example.createDomElement( 'img' ),
		'dataElement': { 'type': 'image' }
	},
	'listItem': {
		'domElement': ve.example.createDomElement( 'li' ),
		'dataElement': { 'type': 'listItem' }
	},
	'list bullet': {
		'domElement': ve.example.createDomElement( 'ul' ),
		'dataElement': { 'type': 'list', 'attributes': { 'style': 'bullet' } }
	},
	'list number': {
		'domElement': ve.example.createDomElement( 'ol' ),
		'dataElement': { 'type': 'list', 'attributes': { 'style': 'number' } }
	},
	'paragraph': {
		'domElement': ve.example.createDomElement( 'p' ),
		'dataElement': { 'type': 'paragraph' }
	},
	'preformatted': {
		'domElement': ve.example.createDomElement( 'pre' ),
		'dataElement': { 'type': 'preformatted' }
	},
	'tableCell': {
		'domElement': ve.example.createDomElement( 'td' ),
		'dataElement': { 'type': 'tableCell', 'attributes': { 'style': 'data' } }
	},
	'table': {
		'domElement': ve.example.createDomElement( 'table' ),
		'dataElement': { 'type': 'table' }
	},
	'tableRow': {
		'domElement': ve.example.createDomElement( 'tr' ),
		'dataElement': { 'type': 'tableRow' }
	},
	'paragraph with mw-data attribute': {
		'domElement': ve.example.createDomElement( 'p', { 'data-mw': '{"test":1234}' } ),
		'dataElement': { 'type': 'paragraph', 'attributes': { 'html/data-mw': '{"test":1234}' } }
	},
	'paragraph with style attribute': {
		'domElement': ve.example.createDomElement( 'p', { 'style': 'color:blue' } ),
		'dataElement': { 'type': 'paragraph', 'attributes': { 'html/style': 'color:blue' } }
	}
};

ve.dm.example.domToDataCases = {
	'paragraph with plain text': {
		'html': '<p>abc</p>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' }
		]
	},
	'annotated text with bold, italic, underline formatting': {
		'html': '<p><b>a</b><i>b</i><u>c</u></p>',
		'data': [
			{ 'type': 'paragraph' },
			['a', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
			['b', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
			['c', { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } }],
			{ 'type': '/paragraph' }
		]
	},
	'image': {
		'html': '<img src="image.png">',
		'data': [
			{ 'type': 'image', 'attributes' : { 'html/src' : 'image.png' } },
			{ 'type' : '/image' }
		]
	},
	'paragraph with alienInline inside': {
		'html': '<p>a<tt class="foo">b</tt>c</p>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'alienInline',
				'attributes': { 'html': '<tt class="foo">b</tt>' }
			},
			{ 'type': '/alienInline' },
			'c',
			{ 'type': '/paragraph' }
		]
	},
	// TODO these last two are broken due to newline hacks, will be unbroken once we remove the newline hacks
	'paragraphs with an alienBlock between them': {
		'html': '<p>abc</p><figure>abc</figure><p>def</p>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'alienBlock', 'attributes': { 'html': '<figure>abc</figure>' } },
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph' },
			'd',
			'e',
			'f',
			{ 'type': '/paragraph' }
		]
	},
	'example document': {
		'html': ve.dm.example.html,
		'data': ve.dm.example.data
	},
	'list item with space followed by link': {
		'html': '<ul><li><p> <a rel="mw:WikiLink" href="Foo_bar" data-rt="{&quot;sHref&quot;:&quot;foo bar&quot;}">bar</a></p></li></ul>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			[
				'b',
				{
					'{"data":{"hrefPrefix":"","htmlAttributes":{"data-rt":"{\\"sHref\\":\\"foo bar\\"}","href":"Foo_bar","rel":"mw:WikiLink"},"title":"Foo bar"},"type":"link/WikiLink"}': {
						'type': 'link/WikiLink',
						'data': {
							'hrefPrefix': '',
							'htmlAttributes': {
								'data-rt': '{"sHref":"foo bar"}',
								'href': 'Foo_bar',
								'rel': 'mw:WikiLink'
							},
							'title': 'Foo bar'
						}
					}
				}
			],
			[
				'a',
				{
					'{"data":{"hrefPrefix":"","htmlAttributes":{"data-rt":"{\\"sHref\\":\\"foo bar\\"}","href":"Foo_bar","rel":"mw:WikiLink"},"title":"Foo bar"},"type":"link/WikiLink"}': {
						'type': 'link/WikiLink',
						'data': {
							'hrefPrefix': '',
							'htmlAttributes': {
								'data-rt': '{"sHref":"foo bar"}',
								'href': 'Foo_bar',
								'rel': 'mw:WikiLink'
							},
							'title': 'Foo bar'
						}
					}
				}
			],
			[
				'r',
				{
					'{"data":{"hrefPrefix":"","htmlAttributes":{"data-rt":"{\\"sHref\\":\\"foo bar\\"}","href":"Foo_bar","rel":"mw:WikiLink"},"title":"Foo bar"},"type":"link/WikiLink"}': {
						'type': 'link/WikiLink',
						'data': {
							'hrefPrefix': '',
							'htmlAttributes': {
								'data-rt': '{"sHref":"foo bar"}',
								'href': 'Foo_bar',
								'rel': 'mw:WikiLink'
							},
							'title': 'Foo bar'
						}
					}
				}
			],
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		]
	},
	'internal link with ./ and ../': {
		'html': '<p><a rel="mw:WikiLink" href="./../../../Foo/Bar">Foo</a></p>',
		'normalizedHtml': '<p><a rel="mw:WikiLink" href="./../../../Foo/Bar">Foo</a></p>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				{
					'{"data":{"hrefPrefix":"./../../../","htmlAttributes":{"href":"./../../../Foo/Bar","rel":"mw:WikiLink"},"title":"Foo/Bar"},"type":"link/WikiLink"}': {
						'type': 'link/WikiLink',
						'data': {
							'hrefPrefix': './../../../',
							'htmlAttributes': {
								'href': './../../../Foo/Bar',
								'rel': 'mw:WikiLink'
							},
							'title': 'Foo/Bar'
						}
					}
				}
			],
			[
				'o',
				{
					'{"data":{"hrefPrefix":"./../../../","htmlAttributes":{"href":"./../../../Foo/Bar","rel":"mw:WikiLink"},"title":"Foo/Bar"},"type":"link/WikiLink"}': {
						'type': 'link/WikiLink',
						'data': {
							'hrefPrefix': './../../../',
							'htmlAttributes': {
								'href': './../../../Foo/Bar',
								'rel': 'mw:WikiLink'
							},
							'title': 'Foo/Bar'
						}
					}
				}
			],
			[
				'o',
				{
					'{"data":{"hrefPrefix":"./../../../","htmlAttributes":{"href":"./../../../Foo/Bar","rel":"mw:WikiLink"},"title":"Foo/Bar"},"type":"link/WikiLink"}': {
						'type': 'link/WikiLink',
						'data': {
							'hrefPrefix': './../../../',
							'htmlAttributes': {
								'href': './../../../Foo/Bar',
								'rel': 'mw:WikiLink'
							},
							'title': 'Foo/Bar'
						}
					}
				}
			],
			{ 'type': '/paragraph' }
		]
	},
	'numbered external link': {
		'html': '<p><a rel="mw:ExtLink/Numbered" href="http://www.mediawiki.org/">[1]</a></p>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'[',
				{
					'{"data":{"href":"http://www.mediawiki.org/","htmlAttributes":{"href":"http://www.mediawiki.org/","rel":"mw:ExtLink/Numbered"}},"type":"link/ExtLink/Numbered"}': {
						'type': 'link/ExtLink/Numbered',
						'data': {
							'href': 'http://www.mediawiki.org/',
							'htmlAttributes': {
								'href': 'http://www.mediawiki.org/',
								'rel': 'mw:ExtLink/Numbered'
							}
						}
					}
				}
			],
			[
				'1',
				{
					'{"data":{"href":"http://www.mediawiki.org/","htmlAttributes":{"href":"http://www.mediawiki.org/","rel":"mw:ExtLink/Numbered"}},"type":"link/ExtLink/Numbered"}': {
						'type': 'link/ExtLink/Numbered',
						'data': {
							'href': 'http://www.mediawiki.org/',
							'htmlAttributes': {
								'href': 'http://www.mediawiki.org/',
								'rel': 'mw:ExtLink/Numbered'
							}
						}
					}
				}
			],
			[
				']',
				{
					'{"data":{"href":"http://www.mediawiki.org/","htmlAttributes":{"href":"http://www.mediawiki.org/","rel":"mw:ExtLink/Numbered"}},"type":"link/ExtLink/Numbered"}': {
						'type': 'link/ExtLink/Numbered',
						'data': {
							'href': 'http://www.mediawiki.org/',
							'htmlAttributes': {
								'href': 'http://www.mediawiki.org/',
								'rel': 'mw:ExtLink/Numbered'
							}
						}
					}
				}
			],
			{ 'type': '/paragraph' }
		]
	},
	'URL link': {
		'html': '<p><a rel="mw:ExtLink/URL" href="http://www.mediawiki.org/">mw</a></p>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'm',
				{
					'{"data":{"href":"http://www.mediawiki.org/","htmlAttributes":{"href":"http://www.mediawiki.org/","rel":"mw:ExtLink/URL"}},"type":"link/ExtLink/URL"}': {
						'type': 'link/ExtLink/URL',
						'data': {
							'href': 'http://www.mediawiki.org/',
							'htmlAttributes': {
								'href': 'http://www.mediawiki.org/',
								'rel': 'mw:ExtLink/URL'
							}
						}
					}
				}
			],
			[
				'w',
				{
					'{"data":{"href":"http://www.mediawiki.org/","htmlAttributes":{"href":"http://www.mediawiki.org/","rel":"mw:ExtLink/URL"}},"type":"link/ExtLink/URL"}': {
						'type': 'link/ExtLink/URL',
						'data': {
							'href': 'http://www.mediawiki.org/',
							'htmlAttributes': {
								'href': 'http://www.mediawiki.org/',
								'rel': 'mw:ExtLink/URL'
							}
						}
					}
				}
			],
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation in headings': {
		'html': '<h2>Foo</h2><h2> Bar</h2><h2>Baz </h2><h2>  Quux   </h2>',
		'data': [
			{ 'type': 'heading', 'attributes': { 'level': 2 } },
			'F',
			'o',
			'o',
			{ 'type': '/heading' },
			{
				'type': 'heading',
				'attributes': { 'level': 2 },
				'internal': { 'whitespace': [ undefined, ' ' ] }
			},
			'B',
			'a',
			'r',
			{ 'type': '/heading' },
			{
				'type': 'heading',
				'attributes': { 'level': 2 },
				'internal': { 'whitespace': [ undefined, undefined, ' ' ] }
			},
			'B',
			'a',
			'z',
			{ 'type': '/heading' },
			{
				'type': 'heading',
				'attributes': { 'level': 2 },
				'internal': { 'whitespace': [ undefined, '  ', '   ' ] }
			},
			'Q',
			'u',
			'u',
			'x',
			{ 'type': '/heading' }
		]
	},
	'whitespace preservation in list items': {
		'html': '<ul><li>Foo</li><li> Bar</li><li>Baz </li><li>  Quux   </li></ul>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ undefined, ' ' ]} },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ ' ' ], 'generated': 'wrapper' } },
			'B',
			'a',
			'r',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ undefined, undefined, ' ' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, undefined, undefined, ' ' ], 'generated': 'wrapper' } },
			'B',
			'a',
			'z',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ undefined, '  ', '   '] } },
			{
				'type': 'paragraph',
				'internal': { 'whitespace': [ '  ', undefined, undefined, '   ' ], 'generated': 'wrapper' }
			},
			'Q',
			'u',
			'u',
			'x',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		]
	},
	'whitespace preservation with annotations': {
		'html': '<p> <i>  Foo   </i>    </p>',
		'data': [
			{
				'type': 'paragraph',
				'internal': { 'whitespace': [ undefined, ' ', '    ' ] }
			},
			[ ' ', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ ' ', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'F', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'o', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'o', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ ' ', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ ' ', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ ' ', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			{ 'type': '/paragraph' }
		]
	},
	'outer whitespace preservation in a list with bare text and a wrapper paragraph': {
		'html': '\n<ul>\n\n<li>\n\n\nBa re\n\n\n\n</li>\n\n\n\n\n<li>\t<p>\t\tP\t\t\t</p>\t\t\t\t</li>\t\n</ul>\t\n\t\n',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ '\n', '\n\n', '\t\n', '\t\n\t\n' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n\n', '\n\n\n', '\n\n\n\n', '\n\n\n\n\n' ] } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ '\n\n\n', undefined, undefined, '\n\n\n\n' ] } },
			'B',
			'a',
			' ',
			'r',
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n\n\n\n\n', '\t', '\t\t\t\t', '\t\n' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ '\t', '\t\t', '\t\t\t', '\t\t\t\t' ] } },
			'P',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		]
	},
	'outer whitespace preservation in a list with bare text and a sublist': {
		'html': '<ul>\n<li>\n\nBa re\n\n\n<ul>\n\n\n\n<li> <p>  P   </p>    </li>\t</ul>\t\t</li>\t\t\t</ul>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ undefined, '\n', '\t\t\t' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n', '\n\n', '\t\t', '\t\t\t' ] } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ '\n\n', undefined, undefined, '\n\n\n' ] } },
			'B',
			'a',
			' ',
			'r',
			'e',
			{ 'type': '/paragraph' },
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ '\n\n\n', '\n\n\n\n', '\t', '\t\t' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n\n\n\n', ' ', '    ', '\t' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ ' ', '  ', '   ', '    '] } },
			'P',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		]
	},
	'whitespace preservation leaves non-edge content whitespace alone': {
		'html': '<p> A  B   <b>    C\t</b>\t\tD\t\t\t</p>\nE\n\nF\n\n\n<b>\n\n\n\nG </b>  H   ',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\t\t\t', '\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ 'C', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			'\t',
			'\t',
			'D',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ '\n', undefined, undefined, '   ' ] } },
			'E',
			'\n',
			'\n',
			'F',
			'\n',
			'\n',
			'\n',
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ 'G', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			' ',
			' ',
			'H',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with non-edge content whitespace with nested annotations': {
		'html': '<p> A  B   <b>    C\t<i>\t\tD\t\t\t</i>\t\t\t\tE\n</b>\n\nF\n\n\n</p>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ ' ', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ 'C', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'D', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ 'E', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			'\n',
			'\n',
			'F',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with tightly nested annotations': {
		'html': '<p> A  B   <b><i>\t\tC\t\t\t</i></b>\n\nD\n\n\n</p>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'C', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with nested annotations with whitespace on the left side': {
		'html': '<p> A  B   <b>\n\t<i>\t\tC\t\t\t</i></b>\n\nD\n\n\n</p>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'C', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with nested annotations with whitespace on the right side': {
		'html': '<p> A  B   <b><i>\t\tC\t\t\t</i>\n\t</b>\n\nD\n\n\n</p>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ 'C', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }, '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } } ],
			[ '\n', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			[ '\t', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' }
		]
	},
	'mismatching whitespace data is ignored': {
		'html': null,
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ ' ', '  ', '   ', '    ' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ ' ', '  ', '   ', '    ' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ ' ', '\t', '\n', '  ' ] } },
			'A',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ '  ' ] } },
			'B',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		],
		'normalizedHtml': ' <ul><li><p>\tA\n</p>  <p>B</p></li></ul>    '
	}
};
