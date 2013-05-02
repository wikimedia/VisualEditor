/*!
 * VisualEditor DataModel example data sets.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * @class
 * @singleton
 * @ignore
 */
ve.dm.example = {};

/* Methods */

/**
 * Convert arrays of shorthand annotations in a data fragment to AnnotationSets with real
 * annotation objects, and wraps the result in a ve.dm.ElementLinearData object.
 *
 * Shorthand notation for annotations is:
 * [ 'a', [ { 'type': 'link', 'attributes': { 'href': '...' } ] ]
 *
 * The actual storage format has an instance of ve.dm.LinkAnnotation instead of the plain object,
 * and an instance of ve.dm.AnnotationSet instead of the array.
 *
 * @method
 * @param {Array} data Linear model data
 * @param {ve.dm.IndexValueStore} [store] Index-value store to use, creates one if undefined
 * @returns {ve.dm.ElementLinearData} Element linear data store
 * @throws {Error} Example data passed to preprocessAnnotations by reference
 */
ve.dm.example.preprocessAnnotations = function ( data, store ) {
	var i, key;

	// Sanity check to make sure ve.dm.example data has not been passed in
	// by reference. Always use ve.copyArray.
	for ( i in ve.dm.example ) {
		if ( data === ve.dm.example[i] ) {
			throw new Error( 'Example data passed to preprocessAnnotations by reference' );
		}
	}

	store = store || new ve.dm.IndexValueStore();
	for ( i = 0; i < data.length; i++ ) {
		key = data[i].annotations ? 'annotations' : 1;
		// check for shorthand annotation objects in array
		if ( ve.isArray( data[i][key] ) && data[i][key][0].type ) {
			data[i][key] = ve.dm.example.createAnnotationSet( store, data[i][key] ).getIndexes();
		}
	}
	return new ve.dm.ElementLinearData( store, data );
};

/**
 * Create an annotation object from shorthand notation.
 * @method
 * @param {Object} annotation Plain object with type and attributes properties
 * @return {ve.dm.Annotation} Instance of the right ve.dm.Annotation subclass
 */
ve.dm.example.createAnnotation = function ( annotation ) {
	return ve.dm.annotationFactory.create( annotation.type, annotation );
};

/**
 * Create an AnnotationSet from an array of shorthand annotations.
 *
 * This calls ve.dm.example.createAnnotation() for each element and puts the result in an
 * AnnotationSet.
 *
 * @method
 * @param {Array} annotations Array of annotations in shorthand format
 * @return {ve.dm.AnnotationSet}
 */
ve.dm.example.createAnnotationSet = function ( store, annotations ) {
	var i;
	for ( i = 0; i < annotations.length; i++ ) {
		annotations[i] = ve.dm.example.createAnnotation( annotations[i] );
	}
	return new ve.dm.AnnotationSet( store, store.indexes( annotations ) );
};

/* Some common annotations in shorthand format */
ve.dm.example.bold = { 'type': 'textStyle/bold' };
ve.dm.example.italic = { 'type': 'textStyle/italic' };
ve.dm.example.underline = { 'type': 'textStyle/underline' };
ve.dm.example.span = { 'type': 'textStyle/span' };

/**
 * Creates a document from example data.
 *
 * Defaults to ve.dm.example.data if no name is supplied.
 *
 * @param {string} [name='data'] Named element of ve.dm.example
 * @param {ve.dm.IndexValueStore} [store] A specific index-value store to use, optionally.
 * @returns {ve.dm.Document} Document
 * @throws {Error} Example data not found
 */
ve.dm.example.createExampleDocument = function( name, store ) {
	name = name || 'data';
	store = store || new ve.dm.IndexValueStore();
	if ( ve.dm.example[name] === undefined ) {
		throw new Error( 'Example data \'' + name + '\' not found' );
	}
	return new ve.dm.Document(
		ve.dm.example.preprocessAnnotations( ve.copyArray( ve.dm.example[name] ), store )
	);
};

ve.dm.example.testDir = window.mw ?
	( window.mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules/ve/test' ) :
	'.';

ve.dm.example.imgSrc = ve.dm.example.testDir + '/example.png';

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
	'<pre>h<img src="' + ve.dm.example.imgSrc + '">i</pre>'+
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
 *     {string} Plain text character
 *
 *     {Array} Annotated character
 *         0: {string} Character
 *         1: {Object} List of references to immutable annotation objects, keyed by JSON
 *            serializations of their values (hashes)
 *
 *     {Object} Opening or closing structural element
 *         type: {string} Symbolic node type name, if closing element first character will be "/"
 *         [attributes]: {Object} List of symbolic attribute name and literal value pairs
 */
ve.dm.example.data = [
	//  0 - Beginning of heading
	{ 'type': 'heading', 'attributes': { 'level': 1 } },
	//  1 - Plain "a"
	'a',
	//  2 - Bold "b"
	['b', [ ve.dm.example.bold ]],
	//  3 - Italic "c"
	['c', [ ve.dm.example.italic ]],
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
	{ 'type': 'listItem' },
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
	// 32 - End of lis t
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
	{ 'type': 'image', 'attributes': {
		'html/0/src': ve.dm.example.imgSrc,
		'src': ve.dm.example.imgSrc,
		'width': null,
		'height': null
	} },
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

ve.dm.example.internalData = [
	{ 'type': 'paragraph' },
	'F', 'o', 'o',
	{ 'type': '/paragraph' },
	{ 'type': 'internalList' },
	{ 'type': 'internalItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B', 'a', 'r',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': 'internalItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B', 'a', 'z',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': '/internalList' },
	{ 'type': 'paragraph' },
	'Q', 'u', 'u', 'x',
	{ 'type': '/paragraph' }
];

ve.dm.example.withMeta = [
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'comment',
			'text': ' No content conversion '
		}
	},
	{ 'type': '/alienMeta' },
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'meta',
			'key': 'mw:PageProp/nocc',
			'html/0/property': 'mw:PageProp/nocc'
		}
	},
	{ 'type': '/alienMeta' },
	{ 'type': 'paragraph' },
	'F',
	'o',
	'o',
	{
		'type': 'MWcategory',
		'attributes': {
			'hrefPrefix': './',
			'category': 'Category:Bar',
			'origCategory': 'Category:Bar',
			'sortkey': '',
			'origSortkey': '',
			'html/0/rel': 'mw:WikiLink/Category',
			'html/0/href': './Category:Bar'
		}
	},
	{ 'type': '/MWcategory' },
	'B',
	'a',
	'r',
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'meta',
			'key': 'mw:foo',
			'value': 'bar',
			'html/0/content': 'bar',
			'html/0/property': 'mw:foo'
		}
	},
	{ 'type': '/alienMeta' },
	'B',
	'a',
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'comment',
			'text': ' inline '
		}
	},
	{ 'type': '/alienMeta' },
	'z',
	{ 'type': '/paragraph' },
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'meta',
			'key': 'mw:bar',
			'value': 'baz',
			'html/0/content': 'baz',
			'html/0/property': 'mw:bar'
		}
	},
	{ 'type': '/alienMeta' },
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'comment',
			'text': 'barbaz'
		}
	},
	{ 'type': '/alienMeta' },
	{
		'type': 'MWcategory',
		'attributes': {
			'hrefPrefix': './',
			'category': 'Category:Foo foo',
			'origCategory': 'Category:Foo_foo',
			'sortkey': 'Bar baz#quux',
			'origSortkey': 'Bar baz%23quux',
			'html/0/href': './Category:Foo_foo#Bar baz%23quux',
			'html/0/rel': 'mw:WikiLink/Category'
		}
	},
	{ 'type': '/MWcategory' },
	{
		'type': 'alienMeta',
		'attributes': {
			'style': 'meta',
			'key': null,
			'html/0/typeof': 'mw:Placeholder',
			'html/0/data-parsoid': 'foobar'
		}
	},
	{ 'type': '/alienMeta' }
];

ve.dm.example.withMetaPlainData = [
	{ 'type': 'paragraph' },
	'F',
	'o',
	'o',
	'B',
	'a',
	'r',
	'B',
	'a',
	'z',
	{ 'type': '/paragraph' }
];

ve.dm.example.withMetaMetaData = [
	[
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'comment',
				'text': ' No content conversion '
			}
		},
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'meta',
				'key': 'mw:PageProp/nocc',
				'html/0/property': 'mw:PageProp/nocc'
			}
		}
	],
	undefined,
	undefined,
	undefined,
	[
		{
			'type': 'MWcategory',
			'attributes': {
				'hrefPrefix': './',
				'category': 'Category:Bar',
				'origCategory': 'Category:Bar',
				'sortkey': '',
				'origSortkey': '',
				'html/0/rel': 'mw:WikiLink/Category',
				'html/0/href': './Category:Bar'
			}
		}
	],
	undefined,
	undefined,
	[
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'meta',
				'key': 'mw:foo',
				'value': 'bar',
				'html/0/content': 'bar',
				'html/0/property': 'mw:foo'
			}
		}
	],
	undefined,
	[
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'comment',
				'text': ' inline '
			}
		}
	],
	undefined,
	[
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'meta',
				'key': 'mw:bar',
				'value': 'baz',
				'html/0/content': 'baz',
				'html/0/property': 'mw:bar'
			}
		},
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'comment',
				'text': 'barbaz'
			}
		},
		{
			'type': 'MWcategory',
			'attributes': {
				'hrefPrefix': './',
				'category': 'Category:Foo foo',
				'origCategory': 'Category:Foo_foo',
				'sortkey': 'Bar baz#quux',
				'origSortkey': 'Bar baz%23quux',
				'html/0/href': './Category:Foo_foo#Bar baz%23quux',
				'html/0/rel': 'mw:WikiLink/Category'
			}
		},
		{
			'type': 'alienMeta',
			'attributes': {
				'style': 'meta',
				'key': null,
				'html/0/typeof': 'mw:Placeholder',
				'html/0/data-parsoid': 'foobar'
			}
		}
	]
];

ve.dm.example.complexTableHtml = '<table><caption>Foo</caption><thead><tr><th>Bar</th></tr></thead>' +
	'<tfoot><tr><td>Baz</td></tr></tfoot><tbody><tr><td>Quux</td><td>Whee</td></tr></tbody></table>';

ve.dm.example.complexTable = [
	{ 'type': 'table' },
	{ 'type': 'tableCaption' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'F',
	'o',
	'o',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCaption' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'header' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'header' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B',
	'a',
	'r',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'footer' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B',
	'a',
	'z',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'Q',
	'u',
	'u',
	'x',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'W',
	'h',
	'e',
	'e',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': '/table' }
];

ve.dm.example.inlineAtEdges = [
	{ 'type': 'paragraph' },
	{ 'type': 'image', 'attributes': {
		'html/0/src': ve.dm.example.imgSrc,
		'src': ve.dm.example.imgSrc,
		'width': null,
		'height': null
	} },
	{ 'type': '/image' },
	'F',
	'o',
	'o',
	{ 'type': 'alienInline', 'attributes': { 'domElements': $( '<foobar />' ).get() } },
	{ 'type': '/alienInline' },
	{ 'type': '/paragraph' }
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
	new ve.dm.HeadingNode( [new ve.dm.TextNode( 3 )], ve.dm.example.data[0] ),
	new ve.dm.TableNode( [
		new ve.dm.TableSectionNode( [
			new ve.dm.TableRowNode( [
				new ve.dm.TableCellNode( [
					// Paragraph with "d"
					new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )],
						ve.dm.example.data[9] ),
					new ve.dm.ListNode( [
						// 1st level bullet list item with "e"
						new ve.dm.ListItemNode( [
							new ve.dm.ParagraphNode(
								[new ve.dm.TextNode( 1 )],
								ve.dm.example.data[14]
							),
							new ve.dm.ListNode( [
								// 2nd level bullet list item with "f"
								new ve.dm.ListItemNode( [
									new ve.dm.ParagraphNode(
										[new ve.dm.TextNode( 1 )],
										ve.dm.example.data[19]
									)
								], ve.dm.example.data[18] )
							], ve.dm.example.data[17] )
						], ve.dm.example.data[13] )
					], ve.dm.example.data[12] ),
					new ve.dm.ListNode( [
						// Numbered list item with "g"
						new ve.dm.ListItemNode( [
							new ve.dm.ParagraphNode(
								[new ve.dm.TextNode( 1 )],
								ve.dm.example.data[28]
							)
						], ve.dm.example.data[27] )
					], ve.dm.example.data[26] )
				], ve.dm.example.data[8] )
			], ve.dm.example.data[7] )
		], ve.dm.example.data[6] )
	], ve.dm.example.data[5] ),
	// Preformatted with "h[example.png]i"
	new ve.dm.PreformattedNode( [
		new ve.dm.TextNode( 1 ),
		new ve.dm.ImageNode( [], ve.dm.example.data[39] ),
		new ve.dm.TextNode( 1 )
	], ve.dm.example.data[37] ),
	new ve.dm.DefinitionListNode( [
		// Definition list term item with "j"
		new ve.dm.DefinitionListItemNode( [
			new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[45] )
		], ve.dm.example.data[44] ),
		// Definition list definition item with "k"
		new ve.dm.DefinitionListItemNode( [
			new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[50] )
		], ve.dm.example.data[49] )
	], ve.dm.example.data[43] ),
	new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[55] ),
	new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[58] )
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
	'paragraph with data-mw attribute': {
		'domElement': ve.example.createDomElement( 'p', { 'data-mw': '{"test":1234}' } ),
		'dataElement': { 'type': 'paragraph', 'attributes': { 'html/0/data-mw': '{"test":1234}' } }
	},
	'paragraph with style attribute': {
		'domElement': ve.example.createDomElement( 'p', { 'style': 'color:blue' } ),
		'dataElement': { 'type': 'paragraph', 'attributes': { 'html/0/style': 'color:blue' } }
	}
};

ve.dm.example.MWInlineImageHtml = '<a rel="mw:Image" href="./File:Wiki.png" data-parsoid="{&quot;tsr&quot;:[158,216],&quot;src&quot;:&quot;[[Image:Wiki.png|500px|thumb|center|Example wiki file]]&quot;,&quot;optNames&quot;:{&quot;width&quot;:&quot;$1px&quot;},&quot;dsr&quot;:[158,216,null,null]}"><img height="" width="500" src="/index.php?title=Special:FilePath/Wiki.png&amp;width=500" alt="Wiki.png"></a>';
ve.dm.example.MWTemplate = {
	'blockSpan':         '<span about="#mwt1" typeof="mw:Object/Template" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Test&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;Hello, world!&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,40],&quot;src&quot;:&quot;{{Test|Hello, world!}}&quot;,&quot;dsr&quot;:[18,40,null,null]}"></span>',
	'blockSpanModified': '<span about="#mwt1" typeof="mw:Object/Template" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Test&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;Hello, globe!&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,40],&quot;src&quot;:&quot;{{Test|Hello, world!}}&quot;,&quot;dsr&quot;:[18,40,null,null]}"></span>',
	'blockContent': '<p about="#mwt1" data-parsoid="{}">Hello, world!</p>',
	'blockData': {
		'type': 'MWtemplateBlock',
		'attributes': {
			'mw': {
				'id': 'mwt1',
				'target': { 'wt' : 'Test' },
				'params': {
					'1': { 'wt': 'Hello, world!' }
				}
			},
			'mwOriginal': {
				'id': 'mwt1',
				'target': { 'wt' : 'Test' },
				'params': {
					'1': { 'wt': 'Hello, world!' }
				}
			},
			'html/0/about': '#mwt1',
			'html/0/data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Test\"},\"params\":{\"1\":{\"wt\":\"Hello, world!\"}}}',
			'html/0/data-parsoid': '{\"tsr\":[18,40],\"src\":\"{{Test|Hello, world!}}\",\"dsr\":[18,40,null,null]}',
			'html/0/typeof': 'mw:Object/Template',
			'html/1/about': '#mwt1',
			'html/1/data-parsoid': '{}'
		},
	},
	'inlineOpen':         '<span about="#mwt1" typeof="mw:Object/Template" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;1,234&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,34],&quot;src&quot;:&quot;{{Inline|1,234}}&quot;,&quot;dsr&quot;:[18,34,null,null]}">',
	'inlineOpenModified': '<span about="#mwt1" typeof="mw:Object/Template" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;5,678&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,34],&quot;src&quot;:&quot;{{Inline|1,234}}&quot;,&quot;dsr&quot;:[18,34,null,null]}">',
	'inlineContent': '$1,234.00',
	'inlineClose': '</span>',
	'inlineData': {
		'type': 'MWtemplateInline',
		'attributes': {
			'mw': {
				'id': 'mwt1',
				'target': { 'wt' : 'Inline' },
				'params': {
					'1': { 'wt': '1,234' }
				}
			},
			'mwOriginal': {
				'id': 'mwt1',
				'target': { 'wt' : 'Inline' },
				'params': {
					'1': { 'wt': '1,234' }
				}
			},
			'html/0/about': '#mwt1',
			'html/0/data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"1,234\"}}}',
			'html/0/data-parsoid': '{\"tsr\":[18,34],\"src\":\"{{Inline|1,234}}\",\"dsr\":[18,34,null,null]}',
			'html/0/typeof': 'mw:Object/Template'
		},
	}
};

ve.dm.example.MWTemplate.blockParamsHash = ve.getHash( ve.dm.MWTemplateNode.static.getHashObject( ve.dm.example.MWTemplate.blockData ) );
ve.dm.example.MWTemplate.blockStoreItems = {
	'hash': ve.dm.example.MWTemplate.blockParamsHash,
	'value': $( ve.dm.example.MWTemplate.blockSpan + ve.dm.example.MWTemplate.blockContent ).get()
};

ve.dm.example.MWTemplate.inlineParamsHash = ve.getHash( ve.dm.MWTemplateNode.static.getHashObject( ve.dm.example.MWTemplate.inlineData ) );
ve.dm.example.MWTemplate.inlineStoreItems = {
	'hash': ve.dm.example.MWTemplate.inlineParamsHash,
	'value': $( ve.dm.example.MWTemplate.inlineOpen + ve.dm.example.MWTemplate.inlineContent + ve.dm.example.MWTemplate.inlineClose ).get()
};

ve.dm.example.domToDataCases = {
	'paragraph with plain text': {
		'html': '<body><p>abc</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' }
		]
	},
	'annotated text with bold, italic, underline formatting': {
		'html': '<body><p><b>a</b><i>b</i><u>c</u></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			['a', [ ve.dm.example.bold ]],
			['b', [ ve.dm.example.italic ]],
			['c', [ ve.dm.example.underline ]],
			{ 'type': '/paragraph' }
		]
	},
	'image': {
		'html': '<body><img src="' + ve.dm.example.imgSrc + '"></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{ 'type': 'image', 'attributes' : {
				'html/0/src' : ve.dm.example.imgSrc,
				'width': null,
				'height': null,
				'src': ve.dm.example.imgSrc
			} },
			{ 'type' : '/image' },
			{ 'type': '/paragraph' }
		]
	},
	'mw:Image': {
		'html': '<body><p>' + ve.dm.example.MWInlineImageHtml + '</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			{
				'type': 'MWinlineimage',
				'attributes': {
					'html/0-0/alt': 'Wiki.png',
					'html/0-0/height': '',
					'html/0-0/src': '/index.php?title=Special:FilePath/Wiki.png&width=500',
					'html/0-0/width': '500',
					'html/0/data-parsoid': '{"tsr":[158,216],"src":"[[Image:Wiki.png|500px|thumb|center|Example wiki file]]","optNames":{"width":"$1px"},"dsr":[158,216,null,null]}',
					'html/0/href': './File:Wiki.png',
					'html/0/rel': 'mw:Image',
					'src': '/index.php?title=Special:FilePath/Wiki.png&width=500',
					'width': 500,
					'height': null,
					'isLinked': true
				}
			},
			{ 'type': '/MWinlineimage' },
			{ 'type': '/paragraph' }
		]
	},
	'mw:Template (block level)': {
		'html': '<body>' + ve.dm.example.MWTemplate.blockSpan + ve.dm.example.MWTemplate.blockContent + '</body>',
		'data': [
			ve.dm.example.MWTemplate.blockData,
			{ 'type': '/MWtemplateBlock' },
		],
		'storeItems': [
			ve.dm.example.MWTemplate.blockStoreItems
		],
		'normalizedHtml': ve.dm.example.MWTemplate.blockSpan + ve.dm.example.MWTemplate.blockContent
	},
	'mw:Template (block level - modified)': {
		'html': '<body>' + ve.dm.example.MWTemplate.blockSpan + ve.dm.example.MWTemplate.blockContent + '</body>',
		'data': [
			ve.dm.example.MWTemplate.blockData,
			{ 'type': '/MWtemplateBlock' },
		],
		'storeItems': [
			ve.dm.example.MWTemplate.blockStoreItems
		],
		'modify': function( data ) {
			data[0].attributes.mw.params['1'].wt = 'Hello, globe!';
		},
		'normalizedHtml': ve.dm.example.MWTemplate.blockSpanModified
	},
	'mw:Template (inline)': {
		'html': '<body>' + ve.dm.example.MWTemplate.inlineOpen + ve.dm.example.MWTemplate.inlineContent + ve.dm.example.MWTemplate.inlineClose + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.example.MWTemplate.inlineData,
			{ 'type': '/MWtemplateInline' },
			{ 'type': '/paragraph' }
		],
		'storeItems': [
			ve.dm.example.MWTemplate.inlineStoreItems
		],
		'normalizedHtml': ve.dm.example.MWTemplate.inlineOpen + ve.dm.example.MWTemplate.inlineContent + ve.dm.example.MWTemplate.inlineClose
	},
	'mw:Template (inline - modified)': {
		'html': '<body>' + ve.dm.example.MWTemplate.inlineOpen + ve.dm.example.MWTemplate.inlineContent + ve.dm.example.MWTemplate.inlineClose + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.example.MWTemplate.inlineData,
			{ 'type': '/MWtemplateInline' },
			{ 'type': '/paragraph' }
		],
		'storeItems': [
			ve.dm.example.MWTemplate.inlineStoreItems
		],
		'modify': function( data ) {
			data[1].attributes.mw.params['1'].wt = '5,678';
		},
		'normalizedHtml': ve.dm.example.MWTemplate.inlineOpenModified + ve.dm.example.MWTemplate.inlineClose
	},
	'mw:Reference': {
		'html':
			'<body>' +
				'<p>Foo' +
					'<span id="cite_ref-bar-1-0" class="reference" about="#mwt5" typeof="mw:Object/Ext/Ref" ' +
						'data-parsoid="{&quot;src&quot:&quot;<ref name=\\&quot;bar\\&quot;>Bar</ref>&quot;}">'+
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' +
					'</span>' +
					' Baz' +
					'<span id="cite_ref-quux-2-0" class="reference" about="#mwt6" typeof="mw:Object/Ext/Ref" ' +
						'data-parsoid="{&quot;src&quot;:&quot;<ref name=\\&quot;quux\\&quot;>Quux</ref>&quot;}">' +
						'<a href="#cite_note-quux-2" data-parsoid="{}">[2]</a>' +
					'</span>' +
					' Whee' +
					'<span id="cite_ref-bar-1-1" class="reference" about="#mwt7" typeof="mw:Object/Ext/Ref" ' +
						'data-parsoid="{&quot;src&quot;:&quot;<ref name=\\&quot;bar\\&quot; />&quot;}">' +
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' +
					'</span>' +
					' Yay' +
					'<span id="cite_ref-3-0" class="reference" about="#mwt8" typeof="mw:Object/Ext/Ref" ' +
						'data-parsoid="{&quot;src&quot;:&quot;<ref>No name</ref>&quot;}">' +
						'<a href="#cite_note-3" data-parsoid="{}">[3]</a>' +
					'</span>' +
				'</p>' +
				'<ol class="references" typeof="mw:Object/References">' +
					'<li li="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li>' +
				'</ol>' +
			'</body>',
		'data': [
			{ 'type': 'paragraph' },
			'F', 'o', 'o',
			{
				'type': 'MWreference',
				'attributes': {
					'about': '#mwt5',
					'listIndex': 0,
					'mw': {},
					'html/0/about': '#mwt5',
					'html/0/class': 'reference',
					'html/0/data-parsoid': '{"src":"<ref name=\\"bar\\">Bar</ref>"}',
					'html/0/id': 'cite_ref-bar-1-0',
					'html/0/typeof': 'mw:Object/Ext/Ref'
				}
			},
			{ 'type': '/MWreference' },
			' ', 'B', 'a', 'z',
			{
				'type': 'MWreference',
				'attributes': {
					'about': '#mwt6',
					'listIndex': 1,
					'mw': {},
					'html/0/about': '#mwt6',
					'html/0/class': 'reference',
					'html/0/data-parsoid': '{"src":"<ref name=\\"quux\\">Quux</ref>"}',
					'html/0/id': 'cite_ref-quux-2-0',
					'html/0/typeof': 'mw:Object/Ext/Ref'
				}
			},
			{ 'type': '/MWreference' },
			' ', 'W', 'h', 'e', 'e',
			{
				'type': 'MWreference',
				'attributes': {
					'about': '#mwt7',
					'listIndex': 0,
					'mw': {},
					'html/0/about': '#mwt7',
					'html/0/class': 'reference',
					'html/0/data-parsoid': '{"src":"<ref name=\\"bar\\" />"}',
					'html/0/id': 'cite_ref-bar-1-1',
					'html/0/typeof': 'mw:Object/Ext/Ref'
				}
			},
			{ 'type': '/MWreference' },
			' ', 'Y', 'a', 'y',
			{
				'type': 'MWreference',
				'attributes': {
					'about': '#mwt8',
					'listIndex': 2,
					'mw': {},
					'html/0/about': '#mwt8',
					'html/0/class': 'reference',
					'html/0/data-parsoid': '{"src":"<ref>No name</ref>"}',
					'html/0/id': 'cite_ref-3-0',
					'html/0/typeof': 'mw:Object/Ext/Ref'
				}
			},
			{ 'type': '/MWreference' },
			{ 'type': '/paragraph' },
			{
				'type': 'MWreferenceList',
				'attributes': {
					'html': '<ol class="references" typeof="mw:Object/References"><li li="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li></ol>',
					'html/0/class': 'references',
					'html/0/typeof': 'mw:Object/References'
				}
			},
			{ 'type': '/MWreferenceList' },
			{ 'type': 'internalList' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'B', 'a', 'r',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'Q', 'u', 'u', 'x',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'N', 'o', ' ', 'n', 'a', 'm', 'e',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': '/internalList' }
		],
		'normalizedHtml':
			'<p>Foo' +
				'<span id="cite_ref-bar-1-0" class="reference" about="#mwt5" typeof="mw:Object/Ext/Ref" ' +
					'data-parsoid="{&quot;src&quot:&quot;<ref name=\\&quot;bar\\&quot;>Bar</ref>&quot;}">'+
				'</span>' +
				' Baz' +
				'<span id="cite_ref-quux-2-0" class="reference" about="#mwt6" typeof="mw:Object/Ext/Ref" ' +
					'data-parsoid="{&quot;src&quot;:&quot;<ref name=\\&quot;quux\\&quot;>Quux</ref>&quot;}">' +
				'</span>' +
				' Whee' +
				'<span id="cite_ref-bar-1-1" class="reference" about="#mwt7" typeof="mw:Object/Ext/Ref" ' +
					'data-parsoid="{&quot;src&quot;:&quot;<ref name=\\&quot;bar\\&quot; />&quot;}">' +
				'</span>' +
				' Yay' +
				'<span id="cite_ref-3-0" class="reference" about="#mwt8" typeof="mw:Object/Ext/Ref" ' +
					'data-parsoid="{&quot;src&quot;:&quot;<ref>No name</ref>&quot;}">' +
				'</span>' +
			'</p>' +
			'<ol class="references" typeof="mw:Object/References"></ol>'
	},
	'paragraph with alienInline inside': {
		'html': '<body><p>a<tt class="foo">b</tt>c</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt class="foo">b</tt>' ).get() }
			},
			{ 'type': '/alienInline' },
			'c',
			{ 'type': '/paragraph' }
		]
	},
	'paragraphs with an alienBlock between them': {
		'html': '<body><p>abc</p><figure>abc</figure><p>def</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'alienBlock', 'attributes': { 'domElements': $( '<figure>abc</figure>' ).get() } },
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph' },
			'd',
			'e',
			'f',
			{ 'type': '/paragraph' }
		]
	},
	'annotated inline nodes': {
		'html': '<body><p>a<b><tt class="foo">b</tt><i><span typeof="mw:Entity">c</span></i></b>' +
			'<i><br/>d</i>e</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt class="foo">b</tt>' ).get() },
				'annotations': [ ve.dm.example.bold ]
			},
			{ 'type': '/alienInline' },
			{
				'type': 'MWentity',
				'attributes': { 'character': 'c', 'html/0/typeof': 'mw:Entity' },
				'annotations': [ ve.dm.example.bold, ve.dm.example.italic ]
			},
			{ 'type': '/MWentity' },
			{
				'type': 'break',
				'annotations': [ ve.dm.example.italic ]
			},
			{ 'type': '/break' },
			['d', [ ve.dm.example.italic ]],
			'e',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content': {
		'html': '<body>abc</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content with inline node': {
		'html': '<body>1<br/>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{ 'type': 'break' },
			{ 'type': '/break' },
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content starting with inline node': {
		'html': '<body><img src="' + ve.dm.example.imgSrc + '">12</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{ 'type': 'image', 'attributes': {
				'html/0/src': ve.dm.example.imgSrc,
				'src': ve.dm.example.imgSrc,
				'width': null,
				'height': null
			} },
			{ 'type': '/image' },
			'1',
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content with inline alien': {
		'html': '<body>1<tt class="bar">baz</tt>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt class="bar">baz</tt>' ).get() }
			},
			{ 'type': '/alienInline' },
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content with block alien': {
		'html': '<body>1<figure class="bar">baz</figure>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': { 'domElements': $( '<figure class="bar">baz</figure>' ).get() }
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content with mw:unrecognized inline alien': {
		'html': '<body>1<span typeof="mw:Placeholder">baz</span>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<span typeof="mw:Placeholder">baz</span>' ).get() }
			},
			{ 'type': '/alienInline' },
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content with mw:unrecognized block alien': {
		'html': '<body>1<div typeof="mw:Placeholder">baz</div>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': { 'domElements': $( '<div typeof="mw:Placeholder">baz</div>' ).get() }
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content starting with mw:unrecognized inline alien': {
		'html': '<body><span typeof="mw:Placeholder">Foo</span>Bar</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<span typeof="mw:Placeholder">Foo</span>' ).get() }
			},
			{ 'type': '/alienInline' },
			'B',
			'a',
			'r',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content ending with mw:unrecognized inline alien': {
		'html': '<body>Foo<span typeof="mw:Placeholder">Bar</span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<span typeof="mw:Placeholder">Bar</span>' ).get() }
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content with about group': {
		'html': '<body>1<tt about="#mwt1">foo</tt><tt about="#mwt1">bar</tt>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt about="#mwt1">foo</tt><tt about="#mwt1">bar</tt>' ).get() }
			},
			{ 'type': '/alienInline' },
			'2',
			{ 'type': '/paragraph' }
		]
	},
	'wrapping of bare content between structural nodes': {
		'html': '<body><table></table>abc<table></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': '/table' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'table' },
			{ 'type': '/table' }
		]
	},
	'wrapping of bare content between paragraphs': {
		'html': '<body><p>abc</p>def<p></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'd',
			'e',
			'f',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			{ 'type': '/paragraph' }
		]
	},
	'wrapping prevents empty list items': {
		'html': '<body><ul><li></li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		]
	},
	'empty document': {
		'html': '',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			{ 'type': '/paragraph' }
		]
	},
	'empty document with content added by the editor': {
		'html': null,
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' }
		],
		'normalizedHtml': '<body><p>Foo</p></body>'
	},
	'empty list item with content added by the editor': {
		'html': null,
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		],
		'normalizedHtml': '<body><ul><li><p>Foo</p></li></ul></body>'
	},
	'example document': {
		'html': ve.dm.example.html,
		'data': ve.dm.example.data
	},
	'list item with space followed by link': {
		'html': '<body><ul><li><p> <a rel="mw:WikiLink" href="Foo_bar" data-rt="{&quot;sHref&quot;:&quot;foo bar&quot;}">bar</a></p></li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			[
				'b',
				[ {
					'type': 'link/MWinternal',
					'attributes': {
						'title': 'Foo bar',
						'origTitle': 'Foo_bar',
						'hrefPrefix': '',
						'html/0/data-rt': '{"sHref":"foo bar"}',
						'html/0/href': 'Foo_bar',
						'html/0/rel': 'mw:WikiLink'
					}
				} ]
			],
			[
				'a',
				[ {
					'type': 'link/MWinternal',
					'attributes': {
						'title': 'Foo bar',
						'origTitle': 'Foo_bar',
						'hrefPrefix': '',
						'html/0/data-rt': '{"sHref":"foo bar"}',
						'html/0/href': 'Foo_bar',
						'html/0/rel': 'mw:WikiLink'
					}
				} ]
			],
			[
				'r',
				[ {
					'type': 'link/MWinternal',
					'attributes': {
						'title': 'Foo bar',
						'origTitle': 'Foo_bar',
						'hrefPrefix': '',
						'html/0/data-rt': '{"sHref":"foo bar"}',
						'html/0/href': 'Foo_bar',
						'html/0/rel': 'mw:WikiLink'
					}
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		]
	},
	'internal link with ./ and ../': {
		'html': '<body><p><a rel="mw:WikiLink" href="./../../../Foo/Bar">Foo</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[ {
					'type': 'link/MWinternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'hrefPrefix': './../../../',
						'html/0/href': './../../../Foo/Bar',
						'html/0/rel': 'mw:WikiLink'
					}
				} ]
			],
			[
				'o',
				[ {
					'type': 'link/MWinternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'hrefPrefix': './../../../',
						'html/0/href': './../../../Foo/Bar',
						'html/0/rel': 'mw:WikiLink'
					}
				} ]
			],
			[
				'o',
				[ {
					'type': 'link/MWinternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'hrefPrefix': './../../../',
						'html/0/href': './../../../Foo/Bar',
						'html/0/rel': 'mw:WikiLink'
					}
				} ]
			],
			{ 'type': '/paragraph' }
		]
	},
	'numbered external link': {
		'html': '<body><p><a rel="mw:ExtLink/Numbered" href="http://www.mediawiki.org/">[1]</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'[',
				[ {
					'type': 'link/MWexternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered',
						'html/0/href': 'http://www.mediawiki.org/',
						'html/0/rel': 'mw:ExtLink/Numbered'
					}
				} ]
			],
			[
				'1',
				[ {
					'type': 'link/MWexternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered',
						'html/0/href': 'http://www.mediawiki.org/',
						'html/0/rel': 'mw:ExtLink/Numbered'
					}
				} ]
			],
			[
				']',
				[ {
					'type': 'link/MWexternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered',
						'html/0/href': 'http://www.mediawiki.org/',
						'html/0/rel': 'mw:ExtLink/Numbered'
					}
				} ]
			],
			{ 'type': '/paragraph' }
		]
	},
	'URL link': {
		'html': '<body><p><a rel="mw:ExtLink/URL" href="http://www.mediawiki.org/">mw</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'm',
				[ {
					'type': 'link/MWexternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/URL',
						'html/0/href': 'http://www.mediawiki.org/',
						'html/0/rel': 'mw:ExtLink/URL'
					}
				} ]
			],
			[
				'w',
				[ {
					'type': 'link/MWexternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/URL',
						'html/0/href': 'http://www.mediawiki.org/',
						'html/0/rel': 'mw:ExtLink/URL'
					}
				} ]
			],
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation in headings': {
		'html': '<body><h2>Foo</h2><h2> Bar</h2><h2>Baz </h2><h2>  Quux   </h2></body>',
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
		'html': '<body><ul><li>Foo</li><li> Bar</li><li>Baz </li><li>  Quux   </li></ul></body>',
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
		'html': '<body><p> <i>  Foo   </i>    </p></body>',
		'data': [
			{
				'type': 'paragraph',
				'internal': { 'whitespace': [ undefined, ' ', '    ' ] }
			},
			[ ' ', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			[ 'F', [ ve.dm.example.italic ] ],
			[ 'o', [ ve.dm.example.italic ] ],
			[ 'o', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			{ 'type': '/paragraph' }
		]
	},
	'outer whitespace preservation in a list with bare text and a wrapper paragraph': {
		'html': '<body>\n<ul>\n\n<li>\n\n\nBa re\n\n\n\n</li>\n\n\n\n\n<li>\t<p>\t\tP\t\t\t</p>\t\t\t\t</li>\t\n</ul>\t\n\t\n</body>',
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
		'html': '<body><ul>\n<li>\n\nBa re\n\n\n<ul>\n\n\n\n<li> <p>  P   </p>    </li>\t</ul>\t\t</li>\t\t\t</ul></body>',
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
		'html': '<body><p> A  B   <b>    C\t</b>\t\tD\t\t\t</p>\nE\n\nF\n\n\n<b>\n\n\n\nG </b>  H   </body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\t\t\t', '\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ 'C', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
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
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ 'G', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			' ',
			' ',
			'H',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with non-edge content whitespace with nested annotations': {
		'html': '<body><p> A  B   <b>    C\t<i>\t\tD\t\t\t</i>\t\t\t\tE\n</b>\n\nF\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ 'C', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'D', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ 'E', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			'\n',
			'\n',
			'F',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with tightly nested annotations': {
		'html': '<body><p> A  B   <b><i>\t\tC\t\t\t</i></b>\n\nD\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'C', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with nested annotations with whitespace on the left side': {
		'html': '<body><p> A  B   <b>\n\t<i>\t\tC\t\t\t</i></b>\n\nD\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'C', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with nested annotations with whitespace on the right side': {
		'html': '<body><p> A  B   <b><i>\t\tC\t\t\t</i>\n\t</b>\n\nD\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'C', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with aliens': {
		'html': '<body> <p typeof="mw:Placeholder">  <br>   </p>    <p>\tFoo\t\t<tt>\t\t\tBar\t\t\t\t</tt>\nBaz\n\n<span typeof="mw:Placeholder">\n\n\nQuux\n\n\n\n</span> \tWhee \n</p>\t\n<figure>\n\tYay \t </figure> \n </body>',
		'data': [
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<p typeof="mw:Placeholder">  <br>   </p>' ).get()
				},
				'internal': {
					'whitespace': [ ' ', undefined, undefined, '    ' ]
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ '    ', '\t', ' \n', '\t\n' ] } },
			'F',
			'o',
			'o',
			'\t',
			'\t',
			{ 'type': 'alienInline', 'attributes': { 'domElements': $( '<tt>\t\t\tBar\t\t\t\t</tt>' ).get() } },
			{ 'type': '/alienInline' },
			'\n',
			'B',
			'a',
			'z',
			'\n',
			'\n',
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<span typeof="mw:Placeholder">\n\n\nQuux\n\n\n\n</span>' ).get()
				}
			},
			{ 'type': '/alienInline' },
			' ',
			'\t',
			'W',
			'h',
			'e',
			'e',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<figure>\n\tYay \t </figure>' ).get()
				},
				'internal': {
					'whitespace': [ '\t\n', undefined, undefined, ' \n ' ]
				}
			},
			{ 'type': '/alienBlock' }
		]
	},
	'whitespace preservation not triggered inside <pre>': {
		'html': '<body>\n<pre>\n\n\nFoo\n\n\nBar\n\n\n\n</pre>\n\n\n\n\n</body>',
		'data': [
			{ 'type': 'preformatted', 'internal': { 'whitespace': ['\n', undefined, undefined, '\n\n\n\n\n' ] } },
			'\n',
			'\n',
			'F',
			'o',
			'o',
			'\n',
			'\n',
			'\n',
			'B',
			'a',
			'r',
			'\n',
			'\n',
			'\n',
			'\n',
			{ 'type': '/preformatted' }
		]
	},
	'whitespace preservation in table cell starting with text and ending with annotation': {
		'html': '<body><table><tbody><tr><td>Foo <b>Bar</b></td></tr></tbody></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
			{ 'type': 'tableRow' },
			{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			' ',
			[ 'B', [ ve.dm.example.bold ] ],
			[ 'a', [ ve.dm.example.bold ] ],
			[ 'r', [ ve.dm.example.bold ] ],
			{ 'type': '/paragraph' },
			{ 'type': '/tableCell' },
			{ 'type': '/tableRow' },
			{ 'type': '/tableSection' },
			{ 'type': '/table' }
		]
	},
	'whitespace preservation with wrapped text, comments and language links': {
		'html': '<body><!-- Foo --> <!-- Bar -->\nFoo\n' +
			'<link rel="mw:WikiLink/Language" href="http://de.wikipedia.org/wiki/Foo">\n' +
			'<link rel="mw:WikiLink/Language" href="http://fr.wikipedia.org/wiki/Foo"></body>',
		'data': [
			{
				'type': 'alienMeta',
				'internal': { 'whitespace': [ undefined, undefined, undefined, ' ' ] },
				'attributes': {
					'style': 'comment',
					'text': ' Foo '
				}
			},
			{ 'type': '/alienMeta' },
			{
				'type': 'alienMeta',
				'internal': { 'whitespace': [ ' ', undefined, undefined, '\n' ] },
				'attributes': {
					'style': 'comment',
					'text': ' Bar '
				}
			},
			{ 'type': '/alienMeta' },
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [ '\n', undefined, undefined, '\n' ]
				}
			},
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{
				'type': 'MWlanguage',
				'attributes': {
					'href': 'http://de.wikipedia.org/wiki/Foo',
					'html/0/href': 'http://de.wikipedia.org/wiki/Foo',
					'html/0/rel': 'mw:WikiLink/Language'
				},
				'internal': { 'whitespace': [ '\n', undefined, undefined, '\n' ] }
			},
			{ 'type': '/MWlanguage' },
			{
				'type': 'MWlanguage',
				'attributes': {
					'href': 'http://fr.wikipedia.org/wiki/Foo',
					'html/0/href': 'http://fr.wikipedia.org/wiki/Foo',
					'html/0/rel': 'mw:WikiLink/Language'
				 },
				'internal': { 'whitespace': [ '\n' ] }
			},
			{ 'type': '/MWlanguage' }
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
		'normalizedHtml': '<body> <ul><li><p>\tA\n</p>  <p>B</p></li></ul>    </body>'
	},
	'order of nested annotations is preserved': {
		'html': '<body><p><b><a rel="mw:WikiLink" href="Foo"><i>Foo</i></a></b></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[
					ve.dm.example.bold,
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					},
					ve.dm.example.italic
				]
			],
			[
				'o',
				[
					ve.dm.example.bold,
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					},
					ve.dm.example.italic
				]
			],
			[
				'o',
				[
					ve.dm.example.bold,
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					},
					ve.dm.example.italic
				]
			],
			{ 'type': '/paragraph' }
		]
	},
	'nested annotations are closed and reopened in the correct order': {
		'html': '<body><p><a rel="mw:WikiLink" href="Foo">F<b>o<i>o</i></b><i>b</i></a><i>a<b>r</b>b<u>a</u>z</i></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					}
				]
			],
			[
				'o',
				[
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					},
					ve.dm.example.bold
				]
			],
			[
				'o',
				[
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					},
					ve.dm.example.bold,
					ve.dm.example.italic
				]
			],
			[
				'b',
				[
					{
						'type': 'link/MWinternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo',
							'html/0/href': 'Foo',
							'html/0/rel': 'mw:WikiLink'
						}
					},
					ve.dm.example.italic
				]
			],
			[
				'a',
				[
					ve.dm.example.italic
				]
			],
			[
				'r',
				[
					ve.dm.example.italic,
					ve.dm.example.bold
				]
			],
			[
				'b',
				[
					ve.dm.example.italic
				]
			],
			[
				'a',
				[
					ve.dm.example.italic,
					ve.dm.example.underline
				]
			],
			[
				'z',
				[
					ve.dm.example.italic
				]
			],
			{ 'type': '/paragraph' }
		]
	},
	'document with meta elements': {
		'html': '<body><!-- No content conversion --><meta property="mw:PageProp/nocc" /><p>Foo' +
			'<link rel="mw:WikiLink/Category" href="./Category:Bar" />Bar' +
			'<meta property="mw:foo" content="bar" />Ba<!-- inline -->z</p>' +
			'<meta property="mw:bar" content="baz" /><!--barbaz-->' +
			'<link rel="mw:WikiLink/Category" href="./Category:Foo_foo#Bar baz%23quux" />' +
			'<meta typeof="mw:Placeholder" data-parsoid="foobar" /></body>',
		'data': ve.dm.example.withMeta
	},
	'RDFa types spread across two attributes': {
		'html': '<body><link rel="mw:WikiLink/Category" href="./Category:Foo" about="#mwt1" typeof="mw:Object/Template"></body>',
		'data': [
			{
				'type': 'alienMeta',
				'attributes': {
					'style': 'link',
					'key': 'mw:WikiLink/Category',
					'value': './Category:Foo',
					'html/0/rel': 'mw:WikiLink/Category',
					'html/0/href': './Category:Foo',
					'html/0/about': '#mwt1',
					'html/0/typeof': 'mw:Object/Template'
				}
			},
			{ 'type': '/alienMeta' },
		]
	},
	'about grouping': {
		'html': '<body><div typeof="mw:Placeholder" about="#mwt1">Foo</div>' +
			'<figure typeof="mw:Placeholder" about="#mwt1">Bar</figure>' +
			'<figure typeof="mw:Placeholder" about="#mwt2">Baz</figure>' +
			'<span typeof="mw:Placeholder" about="#mwt2">Quux</span>' +
			'<p>Whee</p><span typeof="mw:Placeholder" about="#mwt2">Yay</span>' +
			'<div typeof="mw:Placeholder" about="#mwt2">Blah</div>' +
			'<span typeof="mw:Placeholder" about="#mwt3">Meh</span></body>',
		'data': [
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<div typeof="mw:Placeholder" about="#mwt1">Foo</div>' +
						'<figure typeof="mw:Placeholder" about="#mwt1">Bar</figure>' ).get()
				}
			},
			{ 'type': '/alienBlock' },
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<figure typeof="mw:Placeholder" about="#mwt2">Baz</figure>' +
						'<span typeof="mw:Placeholder" about="#mwt2">Quux</span>' ).get()
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph' },
			'W',
			'h',
			'e',
			'e',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<span typeof="mw:Placeholder" about="#mwt2">Yay</span>' +
						'<div typeof="mw:Placeholder" about="#mwt2">Blah</div>' ).get()
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<span typeof="mw:Placeholder" about="#mwt3">Meh</span>' ).get()
				}
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with an about group': {
		'html': '<body> <div typeof="mw:Placeholder" about="#mwt1">\tFoo\t\t</div>\t\t\t' +
			'<div typeof="mw:Placeholder" about="#mwt1">  Bar   </div>    </body>',
		'data': [
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<div typeof="mw:Placeholder" about="#mwt1">\tFoo\t\t</div>\t\t\t' +
						'<div typeof="mw:Placeholder" about="#mwt1">  Bar   </div>' ).get()
				},
				'internal': {
					'whitespace': [ ' ', undefined, undefined, '    ' ]
				}
			},
			{ 'type': '/alienBlock' }
		]
	},
	'mw:Entity': {
		'html': '<body><p>a<span typeof="mw:Entity">¢</span>b<span typeof="mw:Entity">¥</span><span typeof="mw:Entity">™</span></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{ 'type': 'MWentity', 'attributes': { 'character': '¢', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			'b',
			{ 'type': 'MWentity', 'attributes': { 'character': '¥', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			{ 'type': 'MWentity', 'attributes': { 'character': '™', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			{ 'type': '/paragraph' }
		]
	},
	'wrapping with mw:Entity': {
		'html': '<body>a<span typeof="mw:Entity">¢</span>b<span typeof="mw:Entity">¥</span><span typeof="mw:Entity">™</span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			{ 'type': 'MWentity', 'attributes': { 'character': '¢', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			'b',
			{ 'type': 'MWentity', 'attributes': { 'character': '¥', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			{ 'type': 'MWentity', 'attributes': { 'character': '™', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			{ 'type': '/paragraph' }
		]
	},
	'whitespace preservation with mw:Entity': {
		'html': '<body><p> a  <span typeof="mw:Entity"> </span>   b    <span typeof="mw:Entity">¥</span>\t<span typeof="mw:Entity">™</span></p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			'a',
			' ',
			' ',
			{ 'type': 'MWentity', 'attributes': { 'character': ' ', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			' ',
			' ',
			' ',
			'b',
			' ',
			' ',
			' ',
			' ',
			{ 'type': 'MWentity', 'attributes': { 'character': '¥', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			'\t',
			{ 'type': 'MWentity', 'attributes': { 'character': '™', 'html/0/typeof': 'mw:Entity' } },
			{ 'type': '/MWentity' },
			{ 'type': '/paragraph' }
		]
	},
	'block node inside annotation node is alienated': {
		'html': '<body><span>\n<p>Bar</p></span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			[ '\n', [ ve.dm.example.span ] ],
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<p>Bar</p>' ).get()
				},
				'annotations': [ ve.dm.example.span ]
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' }
		]
	},
	'block node inside annotation node surrounded by tables': {
		'html': '<body><table></table><span>\n<p>Bar</p></span><table></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': '/table' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			[ '\n', [ ve.dm.example.span ] ],
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<p>Bar</p>' ).get()
				},
				'annotations': [ ve.dm.example.span ]
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'table' },
			{ 'type': '/table' }
		]
	},
	'block node inside annotation node is alienated and continues wrapping': {
		'html': '<body>Foo<span>\n<p>Bar</p></span>Baz</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			[ '\n', [ ve.dm.example.span ] ],
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<p>Bar</p>' ).get()
				},
				'annotations': [ ve.dm.example.span ]
			},
			{ 'type': '/alienInline' },
			'B',
			'a',
			'z',
			{ 'type': '/paragraph' }
		]
	},
	'whitespace before meta node in wrapping mode': {
		'html': '<body><table><tbody><tr><td>Foo\n<meta property="mw:foo" content="bar" /></td></tr></tbody></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
			{ 'type': 'tableRow' },
			{
				'type': 'tableCell',
				'attributes': { 'style': 'data' },
				'internal': { 'whitespace': [ undefined, undefined, '\n' ] }
			},
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [ undefined, undefined, undefined, '\n' ]
				}
			},
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{
				'type': 'alienMeta',
				'internal': { 'whitespace': [ '\n' ] },
				'attributes': {
					'style': 'meta',
					'key': 'mw:foo',
					'value': 'bar',
					'html/0/content': 'bar',
					'html/0/property': 'mw:foo'
				}
			},
			{ 'type': '/alienMeta' },
			{ 'type': '/tableCell' },
			{ 'type': '/tableRow' },
			{ 'type': '/tableSection' },
			{ 'type': '/table' }
		]
	},
	'table with caption, head, foot and body': {
		'html': ve.dm.example.complexTableHtml,
		'data': ve.dm.example.complexTable
	},
	'category default sort key': {
		'html': '<body><meta property="mw:PageProp/categorydefaultsort" content="foo"></body>',
		'data': [
			{
				'type': 'MWdefaultSort',
				'attributes': {
					'content': 'foo',
					'html/0/content': 'foo',
					'html/0/property': 'mw:PageProp/categorydefaultsort'
				}
			},
			{ 'type': '/MWdefaultSort' }
		]
	},
	'div set to RTL with paragraph inside': {
		'html': '<body><div style="direction: rtl;"><p>a<b>b</b>c<i>d</i>e</p></body>',
		'data': [
			{ 'type': 'div', 'attributes': { 'html/0/style': 'direction: rtl;' } },
			{ 'type': 'paragraph' },
			'a',
			['b', [ ve.dm.example.bold ]],
			'c',
			['d', [ ve.dm.example.italic ]],
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/div' }
		]
	}
};

ve.dm.example.isolationHTML =
	'<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>' +
	'Paragraph' +
	'<ul><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>' +
	'<table><tbody><tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr><tr><td>Cell 4</td></tr></tbody></table>' +
	'Not allowed by dm:' +
	'<ul><li><h1>Title in list</h1></li><li><pre>Preformatted in list</pre></li></ul>' +
	'<ul><li><ol><li>Nested 1</li><li>Nested 2</li><li>Nested 3</li></ol></li></ul>' +
	'<ul><li><p>P1</p><p>P2</p><p>P3</p></li></ul>';

ve.dm.example.isolationData = [
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '1',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '2',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'P', 'a', 'r', 'a', 'g', 'r', 'a', 'p', 'h',
	{ 'type': '/paragraph' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '4',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '5',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '6',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'table' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'C', 'e', 'l', 'l', ' ', '1',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'C', 'e', 'l', 'l', ' ', '2',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'C', 'e', 'l', 'l', ' ', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'C', 'e', 'l', 'l', ' ', '4',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': '/table' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'o', 't', ' ', 'a', 'l', 'l', 'o', 'w', 'e', 'd', ' ', 'b', 'y', ' ', 'd', 'm', ':',
	{ 'type': '/paragraph' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'heading', 'attributes': { 'level': 1 } },
	'T', 'i', 't', 'l', 'e', ' ', 'i', 'n', ' ', 'l', 'i', 's', 't',
	{ 'type': '/heading' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'preformatted' },
	'P', 'r', 'e', 'f', 'o', 'r', 'm', 'a', 't', 't', 'e', 'd', ' ', 'i', 'n', ' ', 'l', 'i', 's', 't',
	{ 'type': '/preformatted' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'list', 'attributes': { 'style': 'number' } },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'e', 's', 't', 'e', 'd', ' ', '1',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'e', 's', 't', 'e', 'd', ' ', '2',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'e', 's', 't', 'e', 'd', ' ', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph' },
	'P', '1',
	{ 'type': '/paragraph' },
	{ 'type': 'paragraph' },
	'P', '2',
	{ 'type': '/paragraph' },
	{ 'type': 'paragraph' },
	'P', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
];
