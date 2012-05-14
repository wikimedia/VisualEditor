/* Static Members */

ve.example = {};

/* Methods */

ve.example.getSelectNodesCases = function( doc ) {
	var lookup = ve.example.lookupNode,
		documentNode = doc.getDocumentNode();
	return [
		{
			'actual': doc.selectNodes( new ve.Range( 0, 3 ), 'leaves' ),
			'expected': [
				// heading/text - partial leaf results have ranges with global offsets
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 1, 3 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				}
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 0, 10 ), 'leaves' ),
			'expected': [
				// heading/text - full coverage leaf nodes do not have ranges
				{
					'node': lookup( documentNode, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				},
				// table/tableRow/tableCell/paragraph/text - leaf nodes from different levels
				{
					'node': lookup( documentNode, 1, 0, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 9, 10 )
				}
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 28, 41 ), 'leaves' ),
			'expected': [
				// table/tableRow/tableCell/list/listItem/paragraph/text
				{
					'node': lookup( documentNode, 1, 0, 0, 2, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 28, 29 )
				},
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 36, 37 )
				},
				// preformatted/image - leaf nodes that are not text nodes
				{
					'node': lookup( documentNode, 2, 1 ),
					'index': 1,
					'nodeRange': new ve.Range( 38, 38 )
				},
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 2 ),
					'index': 2,
					'nodeRange': new ve.Range( 39, 40 )
				}
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 15 ), 'siblings' ),
			'expected': [
				// heading
				{
					'node': lookup( documentNode, 0 ),
					'range': new ve.Range( 2, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				},
				// table
				{
					'node': lookup( documentNode, 1 ),
					'range': new ve.Range( 6, 15 ),
					'index': 1,
					'nodeRange': new ve.Range( 6, 34 )
				}
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 49 ), 'siblings' ),
			'expected': [
				// heading
				{
					'node': lookup( documentNode, 0 ),
					'range': new ve.Range( 2, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				},
				// table
				{
					'node': lookup( documentNode, 1 ),
					'index': 1,
					'nodeRange': new ve.Range( 6, 34 )
				},
				// preformatted
				{
					'node': lookup( documentNode, 2 ),
					'index': 2,
					'nodeRange': new ve.Range( 36, 40 )
				},
				// definitionList
				{
					'node': lookup( documentNode, 3 ),
					'range': new ve.Range( 42, 49 ),
					'index': 3,
					'nodeRange': new ve.Range( 42, 52 )
				}
			]
		},
		// Zero-length range at the edge of a text node returns that text node rather than
		// its parent
		{
			'actual': doc.selectNodes( new ve.Range( 1, 1 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 1, 1 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				}
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 4, 4 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 4, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				}
			]
		},
		// Range entirely within one leaf node
		{
			'actual': doc.selectNodes( new ve.Range( 2, 3 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 2, 3 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				}
			]
		},
		// Zero-length range between two children of the document
		{
			'actual': doc.selectNodes( new ve.Range( 5, 5 ), 'leaves' ),
			'expected': [
				// document
				{
					'node': documentNode,
					'range': new ve.Range( 5, 5 ),
					// no 'index' because documentNode has no parent
					'indexInNode': 1,
					'nodeRange': new ve.Range( 0, 53 )
				}
			]
		}
	];
};

/**
 * Asserts that two node trees are equivalent.
 *
 * This will perform 4 assertions on each branch node and 3 assertions on each leaf node.
 *
 * @method
 */
ve.example.nodeTreeEqual = function( a, b ) {
	equal( a.getType(), b.getType(), 'type match (' + a.getType() + ')' );
	equal( a.getLength(), b.getLength(), 'length match' );
	equal( a.getOuterLength(), b.getOuterLength(), 'outer length match' );
	if ( a.children ) {
		equal( a.children.length, b.children.length, 'children count match' );
		for ( var i = 0; i < a.children.length; i++ ) {
			ve.example.nodeTreeEqual( a.children[i], b.children[i] );
		}
	}
};

/**
 * Asserts that two node selections are equivalent.
 *
 * This will perform 1 assertion to check the number of results in the selection and then 2
 * assertions on each result
 *
 * @method
 */
ve.example.nodeSelectionEqual = function( a, b ) {
	var minLength = a.length < b.length ? a.length : b.length;
	equal( a.length, b.length, 'length match' );
	for ( var i = 0; i < minLength; i++ ) {
		ok( a[i].node === b[i].node, 'node match' );
		if ( a[i].range && b[i].range ) {
			deepEqual( a[i].range, b[i].range, 'range match' );
		} else {
			strictEqual( 'range' in a[i], 'range' in b[i], 'range existence match' );
		}
		deepEqual( a[i].index, b[i].index, 'index match' );
		deepEqual( a[i].indexInNode, b[i].indexInNode, 'indexInNode match' );
		deepEqual( a[i].nodeRange, b[i].nodeRange, 'nodeRange match' );
	}
};

/**
 * Looks up a value in a node tree.
 *
 * @method
 * @param {ve.Node} root Root node to lookup from
 * @param {Integer} [...] Index path
 * @param {ve.Node} Node at given path
 */
ve.example.lookupNode = function( root ) {
	var node = root;
	for ( var i = 1; i < arguments.length; i++ ) {
		node = node.children[arguments[i]];
	}
	return node;
};
