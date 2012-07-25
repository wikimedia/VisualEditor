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
 */
ve.dm.example.html =
	'<h1>a<b>b</b><i>c</i></h1>' +
	'<table>' +
		'<tr>' +
			'<td>' +
				'<p>d</p>' +
				'<ul>' +
					'<li>' +
						'e' + // Not wrapped in a <p> due to Parsoid behavior
						"\n" + // Workaround for Parsoid bug
						'<ul>' +
							'<li>' +
								'f' + // Not wrapped in a <p> due to Parsoid behavior
								"\n" + // Workaround for Parsoid bug
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>' +
						'g' + // Not wrapped in a <p> due to Parsoid behavior
						"\n" + // Workaround for Parsoid bug
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
			'html': '<p>a<a href="b.html" data-mw-gc="">b</a>c</p>',
			'data': [
				{ 'type': 'paragraph' },
				'a',
				{
					'type': 'alienInline',
					'attributes': { 'html': '<a href="b.html" data-mw-gc="">b</a>' }
				},
				{ 'type': '/alienInline' },
				'c',
				{ 'type': '/paragraph' }
			]
		},
		// TODO these last two are broken due to newline hacks, will be unbroken once we remove the newline hacks
		'paragraphs with an alienBlock between them': {
			'html': '<p>abc</p><p data-mw-gc="">abc</p><p>def</p>',
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				{ 'type': '/paragraph' },
				{ 'type': 'alienBlock', 'attributes': { 'html': '<p data-mw-gc="">abc</p>' } },
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
			// This HTML is weird because of workarounds for Parsoid bugs:
			// * newline before </li>
			// * first paragraph in an <li> not wrapped in <p>
			'html': '<ul><li> <a rel="mw:wikiLink" href="/foo" data-mw="{&quot;sHref&quot;:&quot;foo&quot;}">bar</a>\n</li></ul>',
			'data': [
				{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
				{ 'type': 'listItem' },
				{ 'type': 'paragraph' },
				' ',
				[
					'b',
					{
						'{"type":"link/wikiLink","data":{"title":"foo","mw":"{\\"sHref\\":\\"foo\\"}"}}':
							{ 'type': 'link/wikiLink', 'data': {
								'title': 'foo',
								'mw': '{"sHref":"foo"}'
							}
					}
				}],
				[
					'a',
					{
						'{"type":"link/wikiLink","data":{"title":"foo","mw":"{\\"sHref\\":\\"foo\\"}"}}':
							{ 'type': 'link/wikiLink', 'data': {
								'title': 'foo',
								'mw': '{"sHref":"foo"}'
							}
					}
				}],
				[
					'r',
					{
						'{"type":"link/wikiLink","data":{"title":"foo","mw":"{\\"sHref\\":\\"foo\\"}"}}':
							{ 'type': 'link/wikiLink', 'data': {
								'title': 'foo',
								'mw': '{"sHref":"foo"}'
							}
					}
				}],
				{ 'type': '/paragraph' },
				{ 'type': '/listItem' },
				{ 'type': '/list' }
			]
		}
};
