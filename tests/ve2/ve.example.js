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
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 1, 3 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				}
			],
			'msg': 'partial leaf results have ranges with global offsets',
		},
		{
			'actual': doc.selectNodes( new ve.Range( 0, 10 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 )
				},
				// table/tableRow/tableCell/paragraph/text
				{
					'node': lookup( documentNode, 1, 0, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 9, 10 )
				}
			],
			'msg': 'leaf nodes do not have ranges, leaf nodes from different levels'
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
				// preformatted/image
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
			],
			'msg': 'leaf nodes that are not text nodes'
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
			],
			'msg': 'siblings at the document level'
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
			],
			'msg': 'more than 2 siblings at the document level'
		},
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
			],
			'msg': 'zero-length range at the start of a text node returns text node rather than parent'
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
			],
			'msg': 'zero-length range at the end of a text node returns text node rather than parent'
		},
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
			],
			'msg': 'range entirely within one leaf node'
		},
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
			],
			'msg': 'zero-length range between two children of the document'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 0, 0 ), 'leaves' ),
			'expected': [
				// document
				{
					'node': documentNode,
					'range': new ve.Range( 0, 0 ),
					// no 'index' because documentNode has no parent
					'indexInNode': 0,
					'nodeRange': new ve.Range( 0, 53 )
				}
			],
			'msg': 'zero-length range at the start of the document'
		}
	];
};

/**
 * Asserts that two node trees are equivalent.
 *
 * This will perform 5 assertions on each node
 *
 * @method
 */
ve.example.nodeTreeEqual = function( a, b, desc, typePath ) {
	typePath = typePath ? typePath + '/' + a.getType() : a.getType();
	var descPrefix = desc + ': (' + typePath + ') ';
	equal( a.getType(), b.getType(), descPrefix + 'type match' );
	equal( a.getLength(), b.getLength(), descPrefix + 'length match' );
	equal( a.getOuterLength(), b.getOuterLength(), descPrefix + 'outer length match' );
	deepEqual( a.attributes, b.attributes, descPrefix + 'attributes match' );
	if ( a.children && b.children ) {
		// Prevent crashes if a.children and b.children have different lengths
		var minLength = a.children.length < b.children.length ? a.children.length : b.children.length;
		equal( a.children.length, b.children.length, descPrefix + 'children count match' );
		for ( var i = 0; i < minLength; i++ ) {
			ve.example.nodeTreeEqual( a.children[i], b.children[i], desc, typePath );
		}
	} else if ( a.children ) {
		ok( false, descPrefix + 'children array expected but not present' );
	} else if ( b.children ) {
		ok( false, descPrefix + 'children array present but not expected' );
	} else {
		ok( true, descPrefix + 'node is childless' );
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
ve.example.nodeSelectionEqual = function( a, b, desc ) {
	var descPrefix = desc ? desc + ': ' : '';
	// Prevent crashes if a and b have different lengths
	var minLength = a.length < b.length ? a.length : b.length;
	equal( a.length, b.length, descPrefix + 'length match' );
	for ( var i = 0; i < minLength; i++ ) {
		ok( a[i].node === b[i].node, descPrefix + 'node match (element ' + i + ')' );
		if ( a[i].range && b[i].range ) {
			deepEqual( a[i].range, b[i].range, descPrefix + 'range match (element ' + i + ')' );
		} else {
			strictEqual( 'range' in a[i], 'range' in b[i],
				descPrefix + 'range existence match (element ' + i + ')' );
		}
		deepEqual( a[i].index, b[i].index, descPrefix + 'index match (element ' + i + ')' );
		deepEqual( a[i].indexInNode, b[i].indexInNode,
			descPrefix + 'indexInNode match (element ' + i + ')' );
		deepEqual( a[i].nodeRange, b[i].nodeRange,
			descPrefix + 'nodeRange match (element ' + i +')' );
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
