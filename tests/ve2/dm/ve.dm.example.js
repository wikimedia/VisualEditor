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
	'<pre>h<img src="image.png">i</pre>';

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
	//  6 - Beginning of row
	{ 'type': 'tableRow' },
	//  7 - Beginning of cell
	{ 'type': 'tableCell' },
	//  8 - Beginning of paragraph
	{ 'type': 'paragraph' },
	//  9 - Plain "d"
	'd',
	// 10 - End of paragraph
	{ 'type': '/paragraph' },
	// 11 - Beginning of bullet list
	{ 'type': 'list', 'attributes': { 'styles': ['bullet'] } },
	// 12 - Beginning of list item
	{ 'type': 'listItem' },
	// 13 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 14 - Plain "e"
	'e',
	// 15 - End of paragraph
	{ 'type': '/paragraph' },
	// 16 - Beginning of nested bullet list
	{ 'type': 'list', 'attributes': { 'styles': ['bullet'] } },
	// 17 - Beginning of nested bullet list item
	{ 'type': 'listItem' },
	// 18 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 29 - Plain "f"
	'f',
	// 20 - End of paragraph
	{ 'type': '/paragraph' },
	// 21 - End of nested bullet list item
	{ 'type': '/listItem' },
	// 22 - End of nested bullet list
	{ 'type': '/list' },
	// 23 - End of bullet list item
	{ 'type': '/listItem' },
	// 24 - End of bullet list
	{ 'type': '/list' },
	// 25 - Beginning of numbered list
	{ 'type': 'list', 'attributes': { 'styles': ['number'] } },
	// 26 - Beginning of numbered list item
	{ 'type': 'listItem' },
	// 27 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 28 - Plain "g"
	'g',
	// 29 - End of paragraph
	{ 'type': '/paragraph' },
	// 30 - End of item
	{ 'type': '/listItem' },
	// 31 - End of list
	{ 'type': '/list' },
	// 32 - End of cell
	{ 'type': '/tableCell' },
	// 33 - End of row
	{ 'type': '/tableRow' },
	// 34 - End of table
	{ 'type': '/table' },
	// 35 - Beginning of preformatted
	{ 'type': 'preformatted' },
	// 36 - Plain "h"
	'h',
	// 37 - Beginning of inline image
	{ 'type': 'image', 'attributes': { 'html/src': 'image.png' } },
	// 38 - End of inline image
	{ 'type': '/image' },
	// 39 - Plain "i"
	'i',
	// 40 - End of preformatted
	{ 'type': '/preformatted' }
];

/**
 * Sample content data index.
 * 
 * This is part of what a ve.dm.DocumentFragment generates when given linear data.
 * 
 *  (16) branch nodes
 *     (01) document node
 *     (01) heading node
 *     (01) table node
 *     (01) tableRow node
 *     (01) tableCell node
 *     (04) paragraph nodes
 *     (03) list nodes
 *     (03) listItem nodes
 *     (01) preformatted node
 *  (08) leaf nodes
 *     (07) text nodes
 *     (01) image node
 */
ve.dm.example.tree = new ve.dm.DocumentNode( [
	// Heading with "abc"
	new ve.dm.HeadingNode( [new ve.dm.TextNode( 3 )], ve.dm.example.data[0].attributes ),
	new ve.dm.TableNode( [
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
						], ve.dm.example.data[16].attributes )
					] )
				], ve.dm.example.data[11].attributes  ),
				new ve.dm.ListNode( [
					// Numbered list item with "g"
					new ve.dm.ListItemNode( [
						new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )] )
					] )
				], ve.dm.example.data[25].attributes )
			] )
		] )
	] ),
	// Preformatted with "h[image.png]i"
	new ve.dm.PreformattedNode( [
		new ve.dm.TextNode( 1 ),
		new ve.dm.ImageNode( [], ve.dm.example.data[37].attributes ),
		new ve.dm.TextNode( 1 )
	] )
] );

/* Methods */

/**
 * Asserts that two node trees are equavilant.
 * 
 * This will perform 4 assertions on each branch node and 3 assertions on each leaf node.
 * 
 * @method
 */
ve.dm.example.nodeTreeEqual = function( a, b ) {
	equal( a.getType(), b.getType(), 'type match (' + a.getType() + ')' );
	equal( a.getLength(), b.getLength(), 'length match' );
	equal(
		ve.dm.factory.canNodeHaveChildren( a.getType() ),
		ve.dm.factory.canNodeHaveChildren( b.getType() ),
		'children rules match'
	);
	if ( a.children ) {
		equal( a.children.length, b.children.length, 'children count match' );
		for ( var i = 0; i < a.children.length; i++ ) {
			ve.dm.example.nodeTreeEqual( a.children[i], b.children[i] );
		}
	}
};

/**
 * Creates an offset map that references a node tree.
 * 
 * This is part of what a ve.dm.DocumentFragment generates when given linear data.
 * 
 * @method
 * @param {ve.dm.DocumentNode} root Document node to reference
 */
ve.dm.example.getOffsetMap = function( root ) {
	/**
	 * Looks up a value in a node tree.
	 * 
	 * @method
	 * @param {Integer} [...] Index path
	 * @param {ve.Node} Node at given path
	 */
	function lookup() {
		var node = root;
		for ( var i = 0; i < arguments.length; i++ ) {
			node = node.children[arguments[i]];
		}
		return node;
	}
	return [
		lookup(), // 0 - document
		// <h1>
		lookup( 0 ), // 1 - heading
		// a
		lookup( 0 ), // 2 - heading
		// b (bold)
		lookup( 0 ), // 3 - heading
		// c (italic)
		lookup( 0 ), // 4 - heading
		// </h1>
		lookup(), // 5 - document
		// <table>
		lookup( 1 ), // 6 - table
		// <tr>
		lookup( 1, 0 ), // 7 - tableRow
		// <td>
		lookup( 1, 0, 0 ), // 8 - tableCell
		// <p>
		lookup( 1, 0, 0, 0 ), // 9 - paragraph
		// d
		lookup( 1, 0, 0, 0 ), // 10 - paragraph
		// </p>
		lookup( 1, 0, 0 ), // 11 - tableCell
		// <ul>
		lookup( 1, 0, 0, 1 ), // 12 - list
		// <li>
		lookup( 1, 0, 0, 1, 0 ), // 13 - listItem
		// <p>
		lookup( 1, 0, 0, 1, 0, 0 ), // 14 - paragraph
		// e
		lookup( 1, 0, 0, 1, 0, 0 ), // 15 - paragraph
		// </p>
		lookup( 1, 0, 0, 1, 0 ), // 16 - listItem
		// <ul>
		lookup( 1, 0, 0, 1, 0, 1 ), // 17 - list
		// <li>
		lookup( 1, 0, 0, 1, 0, 1, 0 ), // 18 - listItem
		// <p>
		lookup( 1, 0, 0, 1, 0, 1, 0, 0 ), // 19 - paragraph
		// f
		lookup( 1, 0, 0, 1, 0, 1, 0, 0 ), // 20 - paragraph
		// </p>
		lookup( 1, 0, 0, 1, 0, 1, 0 ), // 21 - listItem
		// </li>
		lookup( 1, 0, 0, 1, 0, 1 ), // 22 - list
		// </ul>
		lookup( 1, 0, 0, 1, 0 ), // 23 - listItem
		// </li>
		lookup( 1, 0, 0, 1 ), // 24 - list
		// </ul>
		lookup( 1, 0, 0 ), // 25 - tableCell
		// <ul>
		lookup( 1, 0, 0, 2 ), // 26 - list
		// <li>
		lookup( 1, 0, 0, 2, 0 ), // 27 - listItem
		// <p>
		lookup( 1, 0, 0, 2, 0, 0 ), // 28 - paragraph
		// g
		lookup( 1, 0, 0, 2, 0, 0 ), // 29 - paragraph
		// </p>
		lookup( 1, 0, 0, 2, 0 ), // 30 - listItem
		// </li>
		lookup( 1, 0, 0, 2 ), // 31 - list
		// </ul>
		lookup( 1, 0, 0 ), // 32 - tableCell
		// </td>
		lookup( 1, 0 ), // 33 - tableRow
		// </tr>
		lookup( 1 ), // 34 - table
		// </table>
		lookup(), // 35- document
		// <pre>
		lookup( 2 ), // 36 - preformatted
		// h
		lookup( 2 ), // 37 - preformatted
		// <img>
		lookup( 2 ), // 38 - preformatted
		// </img>
		lookup( 2 ), // 39 - preformatted
		// i
		lookup( 2 ), // 40 - preformatted
		// </pre>
		lookup() // 41 - document
	];
};
