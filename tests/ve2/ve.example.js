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
				{ 'node': lookup( documentNode, 0, 0 ), 'range': new ve.Range( 1, 3 ) }
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 0, 10 ), 'leaves' ),
			'expected': [
				// heading/text - full coverage leaf nodes do not have ranges
				{ 'node': lookup( documentNode, 0, 0 ) },
				// table/tableRow/tableCell/paragraph/text - leaf nodes from different levels
				{ 'node': lookup( documentNode, 1, 0, 0, 0, 0 ) }
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 28, 41 ), 'leaves' ),
			'expected': [
				// table/tableRow/tableCell/list/listItem/paragraph/text
				{ 'node': lookup( documentNode, 1, 0, 0, 2, 0, 0, 0 ) },
				// preformatted/text
				{ 'node': lookup( documentNode, 2, 0 ) },
				// preformatted/image - leaf nodes that are not text nodes
				{ 'node': lookup( documentNode, 2, 1 ) },
				// preformatted/text
				{ 'node': lookup( documentNode, 2, 2 ) }
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 15 ), 'siblings' ),
			'expected': [
				// heading
				{ 'node': lookup( documentNode, 0 ), 'range': new ve.Range( 2, 4 ) },
				// table
				{ 'node': lookup( documentNode, 1 ), 'range': new ve.Range( 6, 15 ) }
			]
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 49 ), 'siblings' ),
			'expected': [
				// heading
				{ 'node': lookup( documentNode, 0 ), 'range': new ve.Range( 2, 4 ) },
				// table
				{ 'node': lookup( documentNode, 1 ) },
				// preformatted
				{ 'node': lookup( documentNode, 2 ) },
				// definitionList
				{ 'node': lookup( documentNode, 3 ), 'range': new ve.Range( 42, 49 ) }
			]
		}
	];
};

/**
 * Asserts that two node trees are equavilant.
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
 * Asserts that two node selections are equavilant.
 * 
 * This will perform 1 assertion to check the number of results in the selection and then 2
 * assertions on each result
 * 
 * @method
 */
ve.example.nodeSelectionEqual = function( a, b ) {
	equal( a.length, b.length, 'length match' );
	for ( var i = 0; i < a.length; i++ ) {
		ok( a[i].node === b[i].node, 'node match' );
		if ( a[i].range && b[i].range ) {
			deepEqual( a[i].range, b[i].range, 'range match' );
		} else {
			strictEqual( 'range' in a[i], 'range' in b[i], 'range existence match' );
		}
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
