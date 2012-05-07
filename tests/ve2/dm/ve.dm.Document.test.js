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
	var doc = new ve.dm.Document( ve.dm.example.data ),
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

test( 'selectNodes', 14, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode(),
		lookup = ve.dm.example.lookupNode;

	// Test count: ( 1 test + ( 2 tests x 2 results ) ) = 5
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 0, 10 ) ),
		[
			// heading/text
			{ 'node': lookup( documentNode, 0, 0 ) },
			// table/tableRow/tableCell/paragraph/text
			{ 'node': lookup( documentNode, 1, 0, 0, 0, 0 ), 'range': new ve.Range( 9, 10 ) }
		]
	);
	// Test count: ( 1 test + ( 2 tests x 4 results ) ) = 9
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 28, 41 ) ),
		[
			// table/tableRow/tableCell/list/listItem/paragraph/text
			{ 'node': lookup( documentNode, 1, 0, 0, 2, 0, 0, 0 ) },
			// preformatted/text
			{ 'node': lookup( documentNode, 2, 0 ) },
			// preformatted/image
			{ 'node': lookup( documentNode, 2, 1 ) },
			// preformatted/text
			{ 'node': lookup( documentNode, 2, 2 ) }
		]
	);
} );
