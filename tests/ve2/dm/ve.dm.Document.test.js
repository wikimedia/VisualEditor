module( 've.dm.Document' );

/* Tests */

test( 'getOuterLength', 1, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	strictEqual(
		fragment.getDocumentNode().getOuterLength(),
		ve.dm.example.data.length,
		'document does not have elements around it'
	);
} );

test( 'rebuildNodes', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) ),
		documentNode = doc.getDocumentNode();
	
	// Rebuild without changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 30 );
	// Test count: ( ( 4 tests x 21 branch nodes ) + ( 3 tests x 10 leaf nodes ) ) = 114
	ve.dm.example.nodeTreeEqual( documentNode, ve.dm.example.tree );

	// Create a copy of the example tree
	var tree = new ve.dm.DocumentNode( ve.dm.example.tree.getChildren() );
	// Remove table from linear model
	doc.data.splice( 5, 30, { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } );
	// Remove table from tree model
	tree.splice( 1, 1, new ve.dm.ParagraphNode( [new ve.dm.TextNode( 3 )] ) );
	// Rebuild with changes
	doc.rebuildNodes( documentNode, 1, 1, 5, 5 );
	// Test count: 
	ve.dm.example.nodeTreeEqual( documentNode, tree );
} );

test( 'selectNodes', 31, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode(),
		lookup = ve.dm.example.lookupNode;

	// Test count: ( 1 test + ( 2 tests x 1 results ) ) = 3
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 0, 3 ), 'leaves' ),
		[
			// heading/text - tests partial leaf results have ranges with global offsets
			{ 'node': lookup( documentNode, 0, 0 ), 'range': new ve.Range( 1, 3 ) }
		]
	);
	// Test count: ( 1 test + ( 2 tests x 2 results ) ) = 5
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 0, 10 ), 'leaves' ),
		[
			// heading/text - tests full coverage leaf nodes do not have ranges
			{ 'node': lookup( documentNode, 0, 0 ) },
			// table/tableRow/tableCell/paragraph/text - tests leaf nodes from different levels
			{ 'node': lookup( documentNode, 1, 0, 0, 0, 0 ) }
		]
	);
	// Test count: ( 1 test + ( 2 tests x 4 results ) ) = 9
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 28, 41 ), 'leaves' ),
		[
			// table/tableRow/tableCell/list/listItem/paragraph/text
			{ 'node': lookup( documentNode, 1, 0, 0, 2, 0, 0, 0 ) },
			// preformatted/text
			{ 'node': lookup( documentNode, 2, 0 ) },
			// preformatted/image - tests leaf nodes that are not text nodes
			{ 'node': lookup( documentNode, 2, 1 ) },
			// preformatted/text
			{ 'node': lookup( documentNode, 2, 2 ) }
		]
	);
	
	// Test count: ( 1 test + ( 2 tests x 2 results ) ) = 5
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 2, 15 ), 'siblings' ),
		[
			// heading
			{ 'node': lookup( documentNode, 0 ), 'range': new ve.Range( 2, 4 ) },
			// table
			{ 'node': lookup( documentNode, 1 ), 'range': new ve.Range( 6, 15 ) }
		]
	);
	
	// Test count: ( 1 test + ( 2 tests x 4 results ) ) = 9
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 2, 49 ), 'siblings' ),
		[
			// heading
			{ 'node': lookup( documentNode, 0 ), 'range': new ve.Range( 2, 4 ) },
			// table
			{ 'node': lookup( documentNode, 1 ) },
			// preformatted
			{ 'node': lookup( documentNode, 2 ) },
			// definitionList
			{ 'node': lookup( documentNode, 3 ), 'range': new ve.Range( 42, 49 ) }
		]
	);
} );
