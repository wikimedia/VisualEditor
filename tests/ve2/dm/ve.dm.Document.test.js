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

test( 'rebuildNodes', 114, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode();
	doc.rebuildNodes( documentNode, 1, 1, 5, 30 );
	// Test count: ( ( 4 tests x 21 branch nodes ) + ( 3 tests x 10 leaf nodes ) ) = 114
	ve.dm.example.nodeTreeEqual( documentNode, ve.dm.example.tree );
} );

test( 'selectNodes', 16, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode(),
		lookup = ve.dm.example.lookupNode;

	// Test count: ( 1 test + ( 2 tests x 2 results ) + ( 2 test + 1 result with range ) ) = 7
	ve.dm.example.nodeSelectionEqual(
		doc.selectNodes( new ve.Range( 0, 10 ) ),
		[
			// heading/text
			{ 'node': lookup( documentNode, 0, 0 ) },
			// table/tableRow/tableCell/paragraph/text
			{ 'node': lookup( documentNode, 1, 0, 0, 0, 0 ), 'range': new ve.Range( 9, 10 ) }
		]
	);
	// Test count: ( 1 test + ( 2 tests x 4 results ) + ( 2 test + 0 result with range ) ) = 9
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
