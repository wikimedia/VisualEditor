module( 've.dm.Document' );

/* Tests */

test( 'getOuterLength', 1, function() {
	var doc = new ve.dm.Document( ve.dm.example.data );
	strictEqual(
		doc.getDocumentNode().getOuterLength(),
		ve.dm.example.data.length,
		'document does not have elements around it'
	);
} );

test( 'rebuildNodes', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) ),
		documentNode = doc.getDocumentNode();
	// Rebuild without changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 30 );
	ve.dm.example.nodeTreeEqual( documentNode, ve.dm.example.tree );

	// XXX: Create a new document node tree from the old one
	var tree = new ve.dm.DocumentNode( ve.dm.example.tree.getChildren() );
	// Remove table from linear model
	doc.data.splice( 5, 30, { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } );
	// Remove table from tree model
	tree.splice( 1, 1, new ve.dm.ParagraphNode( [new ve.dm.TextNode( 3 )] ) );
	// Rebuild with changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 5 );
	ve.dm.example.nodeTreeEqual( documentNode, tree );
} );

test( 'selectNodes', function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode(),
		lookup = ve.dm.example.lookupNode;

	var cases = [
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
	for ( var i = 0; i < cases.length; i++ ) {
		ve.dm.example.nodeSelectionEqual( cases[i].actual, cases[i].expected );
	}
} );
